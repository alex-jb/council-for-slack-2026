import type { NextApiRequest, NextApiResponse } from "next";
import { App, ExpressReceiver } from "@slack/bolt";
import { CouncilDiff, type CouncilResult } from "council-diff";
import {
  persistDecision,
  listRecentDecisions,
  type RecentDecision,
} from "../../../lib/db";

const signingSecret = process.env.SLACK_SIGNING_SECRET;
const botToken = process.env.SLACK_BOT_TOKEN;
const anthropicKey = process.env.ANTHROPIC_API_KEY;

if (!signingSecret) throw new Error("SLACK_SIGNING_SECRET missing");
if (!botToken) throw new Error("SLACK_BOT_TOKEN missing");
if (!anthropicKey) throw new Error("ANTHROPIC_API_KEY missing");

// FaaS pattern: processBeforeResponse: true tells Bolt to wait for the listener
// (incl. async deliberation + DB write) to complete before sending HTTP 200.
// Required on Vercel serverless — otherwise res.end() at ack() time terminates
// the function instance and kills the in-flight deliberation Promise.
// Trade-off: Slack 3s timeout shows a transient "App didn't respond" UI warning
// when deliberation takes >3s, but respond() still POSTs to response_url and the
// verdict appears in channel. Slack does not auto-retry slash commands on timeout.
const receiver = new ExpressReceiver({
  signingSecret,
  processBeforeResponse: true,
  endpoints: "/",
});

const app = new App({
  token: botToken,
  receiver,
  processBeforeResponse: true,
});

const council = new CouncilDiff({ apiKey: anthropicKey });

function recommendationEmoji(rec: CouncilResult["recommendation"]): string {
  if (rec === "go") return ":white_check_mark:";
  if (rec === "kill") return ":no_entry_sign:";
  if (rec === "split") return ":balance_scale:";
  return ":hourglass_flowing_sand:";
}

function formatVerdicts(
  result: CouncilResult,
  decisionId: string | null,
  persistError: string | null,
  persistDebug: string,
): string {
  const lines: string[] = [];
  const emoji = recommendationEmoji(result.recommendation);
  const agreementPct = Math.round(result.agreement_score * 100);

  lines.push(
    `*${emoji} Council verdict: ${result.recommendation.toUpperCase()}*   _agreement ${agreementPct}%_`,
  );
  lines.push("");
  lines.push(`> ${result.consensus}`);
  lines.push("");
  lines.push("*The 5 voices*");
  for (const v of result.voices) {
    lines.push(`*${v.voice_display}* — _${v.score}/100_`);
    lines.push(`> ${v.verdict}`);
    lines.push(`   :heavy_check_mark: ${v.strength}`);
    lines.push(`   :warning: ${v.gap}`);
    lines.push("");
  }

  if (result.oracle) {
    const o = result.oracle;
    lines.push(
      `*:crystal_ball: Oracle (${o.model})* — _${o.recommendation.toUpperCase()} · ${o.score}/100_`,
    );
    lines.push(`> ${o.verdict}`);
    if (o.override_reason) {
      lines.push(`_Override reason:_ ${o.override_reason}`);
    }
    lines.push("");
  }

  if (decisionId) {
    lines.push(
      `_Logged as \`${decisionId.slice(0, 8)}\` — run \`/council-audit\` to see history._`,
    );
  } else if (persistError) {
    console.error("[council] persist returned no id", { persistError, persistDebug });
  }
  lines.push(
    `_Built on \`council-diff\` v0.4.0 · 5-persona debate + Brier audit at resolution · MIT_`,
  );
  return lines.join("\n");
}

function formatAuditList(rows: RecentDecision[]): string {
  if (rows.length === 0) {
    return (
      "*:scroll: Council audit*\n" +
      "_No decisions logged yet for this workspace. Try `/council [your question]` first._"
    );
  }
  const resolved = rows.filter((r) => r.resolved_at).length;
  const lines: string[] = [];
  lines.push(
    `*:scroll: Council audit* — _${rows.length} decision${rows.length === 1 ? "" : "s"} logged, ${resolved} resolved_`,
  );
  lines.push("");
  for (const r of rows) {
    const emoji = recommendationEmoji(r.recommendation);
    const agreement = Math.round(Number(r.agreement_score) * 100);
    const when = new Date(r.created_at).toISOString().slice(0, 10);
    const status = r.resolved_at
      ? r.outcome === "happened"
        ? ":white_check_mark: happened"
        : ":x: did not happen"
      : ":hourglass_flowing_sand: pending resolve";
    const brier =
      r.brier_council != null ? ` · Brier ${Number(r.brier_council).toFixed(3)}` : "";
    const truncated = r.question.length > 90 ? r.question.slice(0, 90) + "…" : r.question;

    lines.push(`\`${r.id.slice(0, 8)}\` ${emoji} *${r.recommendation.toUpperCase()}* · ${agreement}% · ${when}`);
    lines.push(`> ${truncated}`);
    lines.push(`   ${status}${brier}`);
    lines.push("");
  }
  lines.push(
    "_Day 5: resolve a decision with `/council-resolve <id> happened|did_not_happen` to trigger Brier scoring._",
  );
  return lines.join("\n");
}

app.command("/council", async ({ command, ack, respond }) => {
  await ack();

  const decision = command.text?.trim();
  if (!decision) {
    await respond({
      response_type: "ephemeral",
      text: "_Try: `/council should we ship the bigger discount on the enterprise deal?`_",
    });
    return;
  }

  // Immediate fast feedback so user sees the council is working.
  await respond({
    response_type: "ephemeral",
    text:
      `:brain: *Council convening* on: _${decision}_\n` +
      `5 personas debating in parallel — verdicts posting to this channel in ~10s.`,
  });

  try {
    const result = await council.deliberate({
      domain: "founder",
      decision,
    });

    const persist = await persistDecision({
      slack_workspace_id: command.team_id,
      slack_user_id: command.user_id,
      slack_channel_id: command.channel_id,
      question: decision,
      result,
    });

    await respond({
      response_type: "in_channel",
      replace_original: false,
      text: formatVerdicts(result, persist.id, persist.error, persist.debug),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[/council] deliberation failed", err);
    await respond({
      response_type: "ephemeral",
      text: `:x: Council error: \`${message}\``,
    });
  }
});

app.command("/council-audit", async ({ command, ack, respond }) => {
  await ack();
  try {
    const rows = await listRecentDecisions(command.team_id, 10);
    await respond({
      response_type: "ephemeral",
      text: formatAuditList(rows),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[/council-audit] list failed", err);
    await respond({
      response_type: "ephemeral",
      text: `:x: Audit error: \`${message}\``,
    });
  }
});

app.event("app_mention", async ({ event, say }) => {
  await say({
    thread_ts: event.ts,
    text: `Hi <@${event.user}>. Try \`/council [your decision question]\` to convene the council.`,
  });
});

export const config = {
  api: {
    bodyParser: false,
  },
  maxDuration: 60,
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  req.url = "/";
  return (receiver.app as unknown as (req: NextApiRequest, res: NextApiResponse) => void)(req, res);
}
