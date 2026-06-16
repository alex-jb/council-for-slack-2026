import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

/**
 * Slack OAuth v2 redirect handler.
 *
 * Flow:
 *   1. User clicks "Add to Slack" button in README → goes to
 *      https://slack.com/oauth/v2/authorize?client_id=<CID>&scope=<scopes>&redirect_uri=<this>
 *   2. User authorizes → Slack redirects here with ?code=...
 *   3. We POST code to https://slack.com/api/oauth.v2.access to exchange
 *      for a bot_token, plus team metadata.
 *   4. Upsert into council.installations via SECURITY DEFINER RPC.
 *   5. Redirect user to a success page (or Slack workspace URL).
 *
 * The events.ts handler then resolves req.team_id → bot_token via
 * council_get_install_token() RPC, falling back to env SLACK_BOT_TOKEN
 * if no installation row exists (sandbox / dev mode).
 */

const clientId = process.env.SLACK_CLIENT_ID;
const clientSecret = process.env.SLACK_CLIENT_SECRET;

interface SlackOAuthResponse {
  ok: boolean;
  error?: string;
  app_id?: string;
  authed_user?: { id: string };
  scope?: string;
  token_type?: string;
  access_token?: string;
  bot_user_id?: string;
  team?: { id: string; name: string };
  enterprise?: { id?: string; name?: string } | null;
  is_enterprise_install?: boolean;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.status(405).end("Method not allowed");
    return;
  }

  const code = req.query.code as string | undefined;
  const error = req.query.error as string | undefined;

  if (error) {
    res.redirect(302, `/installed?status=denied&reason=${encodeURIComponent(error)}`);
    return;
  }
  if (!code) {
    res.status(400).end("Missing code");
    return;
  }
  if (!clientId || !clientSecret) {
    res.status(500).end("Slack OAuth not configured");
    return;
  }

  // Step 1 — exchange code for token via Slack API
  let oauth: SlackOAuthResponse;
  try {
    const form = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
    });
    const r = await fetch("https://slack.com/api/oauth.v2.access", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
    });
    oauth = (await r.json()) as SlackOAuthResponse;
  } catch (err) {
    console.error("[oauth_redirect] exchange failed", err);
    res.redirect(302, `/installed?status=error&reason=${encodeURIComponent("token exchange failed")}`);
    return;
  }

  if (!oauth.ok || !oauth.access_token || !oauth.team?.id) {
    res.redirect(
      302,
      `/installed?status=error&reason=${encodeURIComponent(oauth.error ?? "unknown")}`,
    );
    return;
  }

  // Step 2 — persist installation. Failures are logged but don't block
  // the user (we still want them landed on the success page; they can
  // re-install if persistence didn't work).
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (url && key) {
    try {
      const db = createClient(url, key, { auth: { persistSession: false } });
      const { error: rpcErr } = await db.rpc("council_installation_upsert", {
        p_workspace_id: oauth.team.id,
        p_workspace_name: oauth.team.name ?? "",
        p_bot_token: oauth.access_token,
        p_bot_user_id: oauth.bot_user_id ?? "",
        p_installed_by_user_id: oauth.authed_user?.id ?? "",
        p_scopes: oauth.scope ?? "",
      });
      if (rpcErr) {
        console.error("[oauth_redirect] persist failed", rpcErr);
      }
    } catch (err) {
      console.error("[oauth_redirect] supabase exception", err);
    }
  } else {
    console.warn("[oauth_redirect] Supabase env missing — installation not persisted");
  }

  // Step 3 — redirect to success page or directly to Slack
  const teamUrl = `slack://app?team=${oauth.team.id}&id=${oauth.app_id ?? ""}`;
  res.redirect(
    302,
    `/installed?status=ok&team=${encodeURIComponent(oauth.team.name ?? "your workspace")}&open=${encodeURIComponent(teamUrl)}`,
  );
}
