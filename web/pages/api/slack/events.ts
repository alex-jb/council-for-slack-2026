import type { NextApiRequest, NextApiResponse } from "next";
import { App, ExpressReceiver } from "@slack/bolt";
import { CouncilDiff, type CouncilResult } from "council-diff";
import {
  persistDecision,
  listRecentDecisions,
  resolveDecision,
  getWorkspaceStats,
  getInstallToken,
  type RecentDecision,
  type WorkspaceStats,
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

// Multi-workspace authorize: resolves the inbound team_id to its installed
// bot_token from council.installations. Falls back to the env-var
// SLACK_BOT_TOKEN for the sandbox workspace (so dev + judging continue to
// work without forcing every developer through OAuth).
const app = new App({
  receiver,
  processBeforeResponse: true,
  authorize: async ({ teamId }) => {
    if (teamId) {
      const stored = await getInstallToken(teamId);
      if (stored) {
        return { botToken: stored };
      }
    }
    // Sandbox / dev fallback.
    return { botToken };
  },
});

const council = new CouncilDiff({ apiKey: anthropicKey });

function recommendationEmoji(rec: CouncilResult["recommendation"]): string {
  if (rec === "go") return ":white_check_mark:";
  if (rec === "kill") return ":no_entry_sign:";
  if (rec === "split") return ":balance_scale:";
  return ":hourglass_flowing_sand:";
}

// Canvas markdown parser is stricter than Slack chat — colon-shortcode emoji and
// <@USERID> mentions can silently drop the surrounding block. Use Unicode emoji
// and plain text in Canvas content.
function recommendationEmojiUnicode(rec: CouncilResult["recommendation"]): string {
  if (rec === "go") return "✅";
  if (rec === "kill") return "🚫";
  if (rec === "split") return "⚖️";
  return "⏳";
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

// Day 11 — emoji per calibration label. Lower Brier = better calibrated.
function calibrationEmoji(label: WorkspaceStats["calibration_label"]): string {
  if (label === "excellent") return ":dart:";
  if (label === "good") return ":green_circle:";
  if (label === "fair") return ":large_yellow_circle:";
  if (label === "needs-work") return ":large_orange_circle:";
  return ":hourglass_flowing_sand:";
}

function buildAuditBlocks(
  rows: RecentDecision[],
  stats: WorkspaceStats | null = null,
): SlackBlock[] {
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
  ];

  // Day 11 — workspace calibration meta-metric. Single number teams compete on.
  if (stats && stats.resolved_decisions > 0 && stats.avg_brier_council != null) {
    const emoji = calibrationEmoji(stats.calibration_label);
    const brierStr = stats.avg_brier_council.toFixed(3);
    blocks.push({
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `${emoji} *Workspace calibration: ${stats.calibration_label}* — _avg Brier ${brierStr} across ${stats.resolved_decisions} resolved · lower is better, 0 perfect, 0.25 chance_`,
        },
      ],
    });
  } else if (stats && stats.total_decisions > 0 && stats.resolved_decisions === 0) {
    blocks.push({
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `:hourglass_flowing_sand: *Workspace calibration: pending* — _resolve a decision below to unlock your team's Brier score_`,
        },
      ],
    });
  }

  blocks.push({ type: "divider" });

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

// Append a decision summary to the channel's pinned canvas — the "decision log"
// users see at the top of every channel as a calibrated history of /council fires.
// Skips silently for DMs (which have no channel canvas) and on any Slack error
// (missing scope, rate limit, etc.) so the user-facing verdict is never blocked.
async function appendCanvasLog(args: {
  client: any;
  channelId: string;
  decision: string;
  domain: Domain;
  result: CouncilResult;
  decisionId: string | null;
  userId: string;
}) {
  const { client, channelId, decision, domain, result, decisionId, userId } = args;

  // Channel IDs start with C; DMs start with D, group DMs with G. Canvases attach only to channels.
  if (!channelId.startsWith("C")) return;

  let canvasId: string | null = null;
  try {
    const created = await client.apiCall("conversations.canvases.create", {
      channel_id: channelId,
      title: "Council decisions",
      document_content: {
        type: "markdown",
        markdown:
          "# Council decisions\n\n_A Brier-audited log of `/council` deliberations in this channel. Every entry is timestamped; verdicts get scored against reality at resolution time._\n\n",
      },
    });
    canvasId = (created as { canvas_id?: string }).canvas_id ?? null;
  } catch (err: unknown) {
    const data = (err as { data?: { error?: string } })?.data;
    if (data?.error === "channel_canvas_already_exists") {
      const info = await client.apiCall("conversations.info", {
        channel: channelId,
        include_properties: true,
      });
      canvasId =
        ((info as { channel?: { properties?: { canvas?: { file_id?: string } } } })
          .channel?.properties?.canvas?.file_id) ?? null;
    } else {
      console.error("[canvas] create failed", err);
      return;
    }
  }
  if (!canvasId) return;

  const emoji = recommendationEmojiUnicode(result.recommendation);
  const agreementPct = Math.round(result.agreement_score * 100);
  const ts = new Date().toISOString().slice(0, 16).replace("T", " ");
  const idTag = decisionId ? ` · ID ${decisionId}` : "";

  // Plain ASCII text + Unicode emoji only. Slack Canvas markdown silently drops
  // blocks containing certain Slack-style constructs (:shortcode: emoji,
  // <@USERID> mentions, etc.). Avoid them entirely here.
  const block = [
    "---",
    "",
    `## ${emoji} ${result.recommendation.toUpperCase()} — ${ts} UTC`,
    "",
    `> ${decision}`,
    "",
    `Domain ${domain} · Agreement ${agreementPct}% · User ${userId}${idTag}`,
    "",
    result.consensus,
    "",
    `**Voices**: ${result.voices
      .map((v) => `${v.voice_display} ${v.score}/100 (${v.verdict})`)
      .join(" · ")}`,
    "",
  ].join("\n");

  try {
    await client.apiCall("canvases.edit", {
      canvas_id: canvasId,
      changes: [
        {
          operation: "insert_at_end",
          document_content: { type: "markdown", markdown: block },
        },
      ],
    });
  } catch (err: unknown) {
    console.error("[canvas] edit failed", err);
  }
}

app.command("/council", async ({ command, ack, respond, client }) => {
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

    // Fire-and-forget canvas append. Failures stay in server logs; never block the user.
    appendCanvasLog({
      client,
      channelId: command.channel_id,
      decision,
      domain,
      result,
      decisionId: persist.id,
      userId: command.user_id,
    }).catch((err) => console.error("[canvas] background append rejected", err));
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
    const [rows, stats] = await Promise.all([
      listRecentDecisions(command.team_id, 10),
      getWorkspaceStats(command.team_id),
    ]);
    await respond({
      response_type: "ephemeral",
      text: "Council audit",
      blocks: buildAuditBlocks(rows, stats) as never[],
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

  // Refresh audit with new state — replace original ephemeral. Fetch stats
  // alongside so the calibration header reflects the freshly resolved Brier.
  const [rows, stats] = await Promise.all([
    listRecentDecisions(workspaceId, 10),
    getWorkspaceStats(workspaceId),
  ]);
  await respond({
    response_type: "ephemeral",
    replace_original: true,
    text: "Council audit (updated)",
    blocks: buildAuditBlocks(rows, stats),
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

// Day 10 — Workflow Builder custom function.
// Lets non-coder Slack admins drop "Council deliberate" into any Workflow Builder
// workflow. e.g. "when Jira issue moves to 'needs decision' → council_deliberate
// with the issue body → post verdict to thread". Inputs/outputs declared in the
// app manifest's top-level `functions:` block (see docs/slack-app-manifest.md).
//
// IMPORTANT: do NOT call ack() inside .function — Bolt acks implicitly. Call
// complete({outputs}) on success or fail({error}) on failure. complete/fail
// POST back to Slack via Web API, so they're independent of the HTTP response
// and compatible with processBeforeResponse:true on Vercel serverless.
app.function("council_deliberate", async ({ inputs, complete, fail, client, logger }) => {
  const typed = inputs as {
    question?: string;
    channel_id?: string;
    domain?: string;
    context?: string;
    requester_id?: string;
  };

  const question = (typed.question ?? "").trim();
  const channelId = typed.channel_id ?? "";
  const domainInput = (typed.domain ?? "founder").toLowerCase();
  const domain: Domain = (VALID_DOMAINS as readonly string[]).includes(domainInput)
    ? (domainInput as Domain)
    : "founder";
  const context = typed.context?.trim() || undefined;
  const requesterId = typed.requester_id ?? "workflow";

  if (!question) {
    await fail({ error: "council_deliberate: `question` input is required" });
    return;
  }
  if (!channelId) {
    await fail({ error: "council_deliberate: `channel_id` input is required" });
    return;
  }

  try {
    const result = await council.deliberate({ domain, decision: question, context });

    const persist = await persistDecision({
      slack_workspace_id: (inputs as { team_id?: string }).team_id ?? "",
      slack_user_id: requesterId,
      slack_channel_id: channelId,
      question,
      context: context ?? null,
      result,
    });

    // Post the verdict to the channel the workflow author wired. The function
    // step pattern surfaces this as the workflow's downstream output too.
    await client.chat.postMessage({
      channel: channelId,
      text: formatVerdicts(result, persist.id, persist.error, persist.debug, domain),
    });

    // Fire-and-forget canvas log — same pattern as /council slash command.
    appendCanvasLog({
      client,
      channelId,
      decision: question,
      domain,
      result,
      decisionId: persist.id,
      userId: requesterId,
    }).catch((err) => logger.error("[function council_deliberate] canvas append rejected", err));

    const agreementPct = Math.round(result.agreement_score * 100);
    const summary = `${result.recommendation.toUpperCase()} (${agreementPct}% agreement, ${domain}): ${result.consensus}`;

    await complete({
      outputs: {
        verdict: result.recommendation.toUpperCase(),
        recommendation: result.recommendation,
        agreement_score: result.agreement_score,
        consensus: result.consensus,
        summary,
        decision_id: persist.id ?? "",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("[function council_deliberate] failed", err);
    await fail({ error: `council_deliberate failed: ${message}` });
  }
});

// Message-action shortcut: right-click any Slack message → "Send to council"
// Opens a modal so the user picks the domain and (optionally) adds context.
// Manifest needs: interactivity.is_enabled + shortcuts: callback_id "send_to_council" type "message".
app.shortcut("send_to_council", async ({ shortcut, ack, client }) => {
  await ack();

  // Only message shortcuts carry .message — bail safely if a different shortcut shape sneaks in.
  if (shortcut.type !== "message_action") return;

  const messageText = shortcut.message?.text ?? "";
  const channelId = shortcut.channel?.id ?? "";
  const messageTs = shortcut.message_ts ?? shortcut.message?.ts ?? "";

  const truncated =
    messageText.length > 600 ? `${messageText.slice(0, 600)}…` : messageText;

  const domainOptions = VALID_DOMAINS.map((d) => ({
    text: { type: "plain_text" as const, text: d },
    value: d,
  }));

  try {
    await client.views.open({
      trigger_id: shortcut.trigger_id,
      view: {
        type: "modal",
        callback_id: "council_modal_submit",
        private_metadata: JSON.stringify({ channelId, messageTs }),
        title: { type: "plain_text", text: "Send to Council" },
        submit: { type: "plain_text", text: "Convene" },
        close: { type: "plain_text", text: "Cancel" },
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*This message will be the decision:*\n>${truncated || "_(empty message)_"}`,
            },
          },
          {
            type: "input",
            block_id: "domain_block",
            label: { type: "plain_text", text: "Domain" },
            element: {
              type: "static_select",
              action_id: "domain_select",
              initial_option: domainOptions[0],
              options: domainOptions,
            },
          },
          {
            type: "input",
            block_id: "context_block",
            optional: true,
            label: { type: "plain_text", text: "Context (optional)" },
            element: {
              type: "plain_text_input",
              action_id: "context_input",
              multiline: true,
              placeholder: {
                type: "plain_text",
                text: "Ground truth — numbers, dates, constraints…",
              },
            },
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: "_Council will post the verdict as a threaded reply on the source message and append a row to this channel's Canvas decision log. ~10s, ~$0.03._",
              },
            ],
          },
        ],
      },
    });
  } catch (err) {
    console.error("[shortcut send_to_council] views.open failed", err);
  }
});

// Modal submission from the message shortcut → fire council, post verdict as thread reply.
app.view("council_modal_submit", async ({ ack, view, client, body }) => {
  await ack();

  let metadata: { channelId: string; messageTs: string };
  try {
    metadata = JSON.parse(view.private_metadata);
  } catch {
    console.error("[shortcut] bad private_metadata", view.private_metadata);
    return;
  }
  const { channelId, messageTs } = metadata;

  const domainValue =
    view.state.values?.domain_block?.domain_select?.selected_option?.value;
  const domain: Domain =
    domainValue && (VALID_DOMAINS as readonly string[]).includes(domainValue)
      ? (domainValue as Domain)
      : "founder";
  const context =
    view.state.values?.context_block?.context_input?.value || undefined;

  // Pull the source message via conversations.history so the decision text matches what the user clicked.
  let decision = "(message text unavailable)";
  try {
    const history = (await client.apiCall("conversations.history", {
      channel: channelId,
      latest: messageTs,
      oldest: messageTs,
      inclusive: true,
      limit: 1,
    })) as { messages?: Array<{ text?: string }> };
    decision = history.messages?.[0]?.text ?? decision;
  } catch (err) {
    console.error("[shortcut] conversations.history failed", err);
  }

  const userId = body.user?.id ?? "unknown";

  try {
    const result = await council.deliberate({ domain, decision, context });
    const persist = await persistDecision({
      slack_workspace_id: body.team?.id ?? "",
      slack_user_id: userId,
      slack_channel_id: channelId,
      question: decision,
      context: context ?? null,
      result,
    });

    await client.chat.postMessage({
      channel: channelId,
      thread_ts: messageTs,
      text: formatVerdicts(result, persist.id, persist.error, persist.debug, domain),
    });

    appendCanvasLog({
      client,
      channelId,
      decision,
      domain,
      result,
      decisionId: persist.id,
      userId,
    }).catch((err) => console.error("[canvas] shortcut append rejected", err));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[shortcut deliberation] failed", err);
    // DM the user the error so the source channel doesn't get spammed.
    try {
      await client.chat.postMessage({
        channel: userId,
        text: `:x: Council error from your "Send to council" shortcut: \`${message}\``,
      });
    } catch (dmErr) {
      console.error("[shortcut] failed to DM user about error", dmErr);
    }
  }
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
