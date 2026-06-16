import type { NextApiRequest, NextApiResponse } from "next";
import { getDb } from "../../lib/db";

/**
 * Public health + telemetry endpoint.
 *
 * `curl https://council-for-slack.vercel.app/api/health` returns a single JSON
 * blob with live production numbers — workspace install count, total decisions
 * fired, how many got resolved, and the global calibration label derived from
 * the workspace-aggregated Brier score.
 *
 * No auth required; counts are aggregates, not PII. The decision titles
 * themselves are never exposed.
 *
 * If Supabase is unreachable, returns ok=true + telemetry=null (we'd rather
 * the health probe stay green than 503 the page).
 */
export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  type CalibrationLabel = "excellent" | "good" | "fair" | "needs-work" | "pending";
  type Telemetry = {
    workspaces: number;
    decisions_total: number;
    decisions_resolved: number;
    avg_brier: number | null;
    calibration: CalibrationLabel;
  };
  let telemetry: Telemetry | null = null;

  try {
    const db = getDb();
    if (db) {
      const { data, error } = await db.rpc("council_global_stats");
      if (!error && data) {
        const row = Array.isArray(data) ? data[0] : data;
        if (row) {
          telemetry = {
            workspaces: Number(row.workspaces ?? 0),
            decisions_total: Number(row.decisions_total ?? 0),
            decisions_resolved: Number(row.decisions_resolved ?? 0),
            avg_brier: row.avg_brier != null ? Number(row.avg_brier) : null,
            calibration: (row.calibration ?? "pending") as CalibrationLabel,
          };
        }
      }
    }
  } catch {
    // swallow — keep the health probe green even on DB hiccups
  }

  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({
    ok: true,
    service: "council-for-slack",
    version: "0.1.0",
    ts: new Date().toISOString(),
    telemetry,
  });
}
