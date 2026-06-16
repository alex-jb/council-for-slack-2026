import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { CouncilResult } from "council-diff";

/**
 * Supabase client for Council-for-Slack.
 *
 * Cohabits with VibeXForge in the same Supabase project. We use the existing
 * anon key (no new secret) and access the `council` schema only through
 * SECURITY DEFINER RPCs in `public` — same pattern as VibeXForge's
 * increment_play / toggle_upvote RPCs.
 *
 * Returns null if SUPABASE_URL or SUPABASE_ANON_KEY isn't set — /council
 * still works in that case, it just doesn't persist. Lets dev run end-to-end
 * before Supabase wiring is finalized.
 */
let _client: SupabaseClient | null = null;

export function getDb(): SupabaseClient | null {
  if (_client) return _client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  _client = createClient(url, key, {
    auth: { persistSession: false },
  });
  return _client;
}

export interface PersistDecisionInput {
  slack_workspace_id: string;
  slack_user_id: string;
  slack_channel_id: string;
  question: string;
  context: string | null;
  result: CouncilResult;
}

export interface PersistResult {
  id: string | null;
  error: string | null;
  /** Debug breadcrumbs — surfaced in /council verdict during Day 4 debug. */
  debug: string;
}

export async function persistDecision(input: PersistDecisionInput): Promise<PersistResult> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url) return { id: null, error: "SUPABASE_URL missing", debug: "env-url-empty" };
  if (!key) return { id: null, error: "SUPABASE_ANON_KEY missing", debug: "env-key-empty" };
  const db = getDb();
  if (!db) return { id: null, error: "getDb returned null", debug: `url=${url.slice(0, 25)} keylen=${key.length}` };
  try {
    const { data, error } = await db.rpc("council_decision_insert", {
      p_workspace_id: input.slack_workspace_id,
      p_user_id: input.slack_user_id,
      p_channel_id: input.slack_channel_id,
      p_question: input.question,
      p_domain: input.result.domain,
      p_voices: input.result.voices,
      p_consensus: input.result.consensus,
      p_recommendation: input.result.recommendation,
      p_agreement_score: input.result.agreement_score,
      p_oracle: input.result.oracle ?? null,
      p_context: input.context,
    });
    if (error) {
      return {
        id: null,
        error: `${error.code ?? "?"}: ${error.message ?? "unknown"}`,
        debug: `rpc-error url=${url.slice(0, 25)} keylen=${key.length} hint=${error.hint ?? "none"}`,
      };
    }
    return { id: data as string, error: null, debug: "ok" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      id: null,
      error: `throw: ${msg}`,
      debug: `catch url=${url.slice(0, 25)} keylen=${key.length}`,
    };
  }
}

export interface RecentDecision {
  id: string;
  question: string;
  context: string | null;
  domain: string;
  recommendation: "go" | "wait" | "kill" | "split";
  agreement_score: number;
  consensus: string;
  created_at: string;
  resolved_at: string | null;
  outcome: "happened" | "did_not_happen" | null;
  brier_council: number | null;
}

export interface ResolveResult {
  id: string | null;
  brier_council: number | null;
  brier_voices: Record<string, number> | null;
  error: string | null;
}

export async function resolveDecision(
  decisionId: string,
  workspaceId: string,
  outcome: "happened" | "did_not_happen",
): Promise<ResolveResult> {
  const db = getDb();
  if (!db) return { id: null, brier_council: null, brier_voices: null, error: "no-db" };
  try {
    const { data, error } = await db.rpc("council_decision_resolve", {
      p_id: decisionId,
      p_workspace_id: workspaceId,
      p_outcome: outcome,
    });
    if (error) {
      return { id: null, brier_council: null, brier_voices: null, error: `${error.code ?? "?"}: ${error.message ?? "unknown"}` };
    }
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) return { id: null, brier_council: null, brier_voices: null, error: "no-row" };
    return {
      id: row.id as string,
      brier_council: Number(row.brier_council),
      brier_voices: row.brier_voices as Record<string, number>,
      error: null,
    };
  } catch (err) {
    return { id: null, brier_council: null, brier_voices: null, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function listRecentDecisions(
  workspaceId: string,
  limit = 10,
): Promise<RecentDecision[]> {
  const db = getDb();
  if (!db) return [];
  const { data, error } = await db.rpc("council_decisions_recent", {
    p_workspace_id: workspaceId,
    p_limit: limit,
  });
  if (error) {
    console.error("[db] listRecentDecisions failed", error);
    return [];
  }
  return (data ?? []) as RecentDecision[];
}

export interface WorkspaceStats {
  total_decisions: number;
  resolved_decisions: number;
  avg_brier_council: number | null;
  calibration_label: "excellent" | "good" | "fair" | "needs-work" | "pending";
}

// Day 11 — workspace calibration meta-metric. Surfaced in /council-audit
// header so teams see their average Brier as a single number that drifts
// over time. Returns null if the RPC isn't deployed yet (migration 003 not
// run) — caller should soft-handle null and skip rendering the stats row.
export async function getWorkspaceStats(
  workspaceId: string,
): Promise<WorkspaceStats | null> {
  const db = getDb();
  if (!db) return null;
  const { data, error } = await db.rpc("council_workspace_stats", {
    p_workspace_id: workspaceId,
  });
  if (error) {
    console.error("[db] getWorkspaceStats failed", error);
    return null;
  }
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;
  return {
    total_decisions: Number(row.total_decisions ?? 0),
    resolved_decisions: Number(row.resolved_decisions ?? 0),
    avg_brier_council:
      row.avg_brier_council != null ? Number(row.avg_brier_council) : null,
    calibration_label: (row.calibration_label ?? "pending") as WorkspaceStats["calibration_label"],
  };
}
