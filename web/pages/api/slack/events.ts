import type { NextApiRequest, NextApiResponse } from "next";
import { App, ExpressReceiver } from "@slack/bolt";
import { CouncilDiff, type CouncilResult } from "council-diff";
import {
  persistDecision,
  listRecentDecisions,
  resolveDecision,
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
  domain: Domain = "founder",
): string {
  const lines: string[] = [];
  const emoji = recommendationEmoji(result.recommendation);
  const agreementPct = Math.round(result.agreement_score * 100);

  lines.push(
    `*${emoji} Council verdict: ${result.recommendation.toUpperCase()}*   _agreement ${agreementPct}% · \`${domain}\` domain_`,
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

const VALID_DOMAINS = ["founder", "engineer", "investor", "career", "product", "quant"] as const;
type Domain = (typeof VALID_DOMAINS)[number];

// Parse optional domain prefix. Accepts both `:investor decision` and `investor decision`.
// Defaults to "founder" if first token isn't a recognized domain.
function parseDomain(text: string): { domain: Domain; rest: string } {
  const trimmed = text.trim();
  const match = trimmed.match(/^:?([a-z]+)\s+([\s\S]*)/i);
  if (match) {
    const candidate = match[1].toLowerCase();
    if ((VALID_DOMAINS as readonly string[]).includes(candidate)) {
      return { domain: candidate as Domain, rest: match[2] };
    }
  }
  return { domain: "founder", rest: trimmed };
}

// Parse "decision text | context goes here" — splits on first unescaped pipe.
function splitDecisionAndContext(text: string): { decision: string; context: string | null } {
  const idx = text.indexOf("|");
  if (idx === -1) return { decision: text.trim(), context: null };
  return {
    decision: text.slice(0, idx).trim(),
    context: text.slice(idx + 1).trim() || null,
  };
}

type SlackBlock = Record<string, unknown>;

function buildAuditBlocks(rows: RecentDecision[]): SlackBlock[] {
  if (rows.length === 0) {
    return [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*:scroll: Council audit*\n_No decisions logged yet for this workspace. Try `/council [your question]` first._",
        },
      },
    ];
  }

  const resolved = rows.filter((r) => r.resolved_at).length;
  const blocks: SlackBlock[] = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*:scroll: Council audit* — _${rows.length} decision${rows.length === 1 ? "" : "s"} logged, ${resolved} resolved_`,
      },
    },
    { type: "divider" },
  ];

  for (const r of rows) {
    const emoji = recommendationEmoji(r.recommendation);
    const agreement = Math.round(Number(r.agreement_score) * 100);
    const when = new Date(r.created_at).toISOString().slice(0, 10);
    const truncated = r.question.length > 100 ? r.question.slice(0, 100) + "…" : r.question;

    const header = `\`${r.id.slice(0, 8)}\` ${emoji} *${r.recommendation.toUpperCase()}* · ${agreement}% · ${when}\n> ${truncated}`;
    blocks.push({
      type: "section",
      text: { type: "mrkdwn", text: header },
    });

    if (r.resolved_at) {
      const outcomeText =
        r.outcome === "happened" ? ":white_check_mark: *Happened*" : ":x: *Did not happen*";
      const brierText =
        r.brier_council != null ? ` · Brier _${Number(r.brier_council).toFixed(3)}_` : "";
      blocks.push({
        type: "context",
        elements: [
          { type: "mrkdwn", text: `${outcomeText}${brierText} _(lower Brier = better calibrated, 0 perfect, 0.25 chance)_` },
        ],
      });
    } else {
      blocks.push({
        type: "actions",
        block_id: `resolve_${r.id}`,
        elements: [
          {
            type: "button",
            text: { type: "plain_text", text: ":white_check_mark: Happened", emoji: true },
            value: r.id,
            action_id: "resolve_happened",
            style: "primary",
          },
          {
            type: "button",
            text: { type: "plain_text", text: ":x: Did not happen", emoji: true },
            value: r.id,
            action_id: "resolve_did_not_happen",
            style: "danger",
          },
        ],
      });
    }
    blocks.push({ type: "divider" });
  }

  blocks.push({
    type: "context",
    elements: [
      {
        type: "mrkdwn",
        text: "_Resolve unlocks Brier audit — calibration tracked across all your decisions over time._",
      },
    ],
  });
  return blocks;
}

app.command("/council", async ({ command, ack, respond }) => {
  await ack();

  const raw = command.text?.trim();
  if (!raw) {
    await respond({
      response_type: "ephemeral",
      text:
        "_Try one of:_\n" +
        "• `/council should we ship the bigger discount on the enterprise deal?`\n" +
        "• `/council :investor long GOOGL into Q3? | Druckenmiller sold all, Berkshire bought $10B`\n" +
        "• `/council engineer should we adopt Rust for the inference path? | Python hot loop is the bottleneck`\n" +
        "_Optional domain prefix: `founder` (default) · `engineer` · `investor` · `career` · `product` · `quant`. Use `:` for clarity._\n" +
        "_Add `| context` after the question to feed the council ground truth (raises score quality)._",
    });
    return;
  }

  const { domain, rest } = parseDomain(raw);
  const { decision, context } = splitDecisionAndContext(rest);
  const contextHint = context ? ` _(+ context: ${context.length} chars)_` : " _(no context — scores will be conservative)_";

  // Immediate fast feedback so user sees the council is working.
  await respond({
    response_type: "ephemeral",
    text:
      `:brain: *Council convening* (\`${domain}\` domain) on: _${decision}_${contextHint}\n` +
      `5 personas debating in parallel — verdicts posting to this channel in ~10s.`,
  });

  try {
    const result = await council.deliberate({
      domain,
      decision,
      context: context ?? undefined,
    });

    const persist = await persistDecision({
      slack_workspace_id: command.team_id,
      slack_user_id: command.user_id,
      slack_channel_id: command.channel_id,
      question: decision,
      context,
      result,
    });

    await respond({
      response_type: "in_channel",
      replace_original: false,
      text: formatVerdicts(result, persist.id, persist.error, persist.debug, domain),
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
      text: "Council audit",
      blocks: buildAuditBlocks(rows) as never[],
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

async function handleResolve(
  ack: () => Promise<void>,
  respond: (msg: Record<string, unknown>) => Promise<unknown>,
  workspaceId: string,
  decisionId: string,
  outcome: "happened" | "did_not_happen",
) {
  await ack();
  const result = await resolveDecision(decisionId, workspaceId, outcome);
  if (result.error) {
    await respond({
      response_type: "ephemeral",
      replace_original: false,
      text: `:x: Resolve failed: \`${result.error}\``,
    });
    return;
  }

  // Refresh audit with new state — replace original ephemeral
  const rows = await listRecentDecisions(workspaceId, 10);
  await respond({
    response_type: "ephemeral",
    replace_original: true,
    text: "Council audit (updated)",
    blocks: buildAuditBlocks(rows),
  });
}

app.action("resolve_happened", async ({ ack, body, action, respond }) => {
  const workspaceId = (body as { team?: { id?: string } }).team?.id ?? "";
  const decisionId = (action as { value?: string }).value ?? "";
  await handleResolve(ack, respond, workspaceId, decisionId, "happened");
});

app.action("resolve_did_not_happen", async ({ ack, body, action, respond }) => {
  const workspaceId = (body as { team?: { id?: string } }).team?.id ?? "";
  const decisionId = (action as { value?: string }).value ?? "";
  await handleResolve(ack, respond, workspaceId, decisionId, "did_not_happen");
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
