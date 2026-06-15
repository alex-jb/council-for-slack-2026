import type { NextApiRequest, NextApiResponse } from "next";
import { App, ExpressReceiver } from "@slack/bolt";
import { CouncilDiff, type CouncilResult } from "council-diff";

const signingSecret = process.env.SLACK_SIGNING_SECRET;
const botToken = process.env.SLACK_BOT_TOKEN;
const anthropicKey = process.env.ANTHROPIC_API_KEY;

if (!signingSecret) throw new Error("SLACK_SIGNING_SECRET missing");
if (!botToken) throw new Error("SLACK_BOT_TOKEN missing");
if (!anthropicKey) throw new Error("ANTHROPIC_API_KEY missing");

const receiver = new ExpressReceiver({
  signingSecret,
  processBeforeResponse: false,
  endpoints: "/",
});

const app = new App({
  token: botToken,
  receiver,
  processBeforeResponse: false,
});

const council = new CouncilDiff({ apiKey: anthropicKey });

function recommendationEmoji(rec: CouncilResult["recommendation"]): string {
  if (rec === "go") return ":white_check_mark:";
  if (rec === "kill") return ":no_entry_sign:";
  if (rec === "split") return ":balance_scale:";
  return ":hourglass_flowing_sand:";
}

function formatVerdicts(result: CouncilResult): string {
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

  lines.push(
    `_Built on \`council-diff\` v0.4.0 · 5-persona debate + Brier audit at resolution · MIT_`,
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

    await respond({
      response_type: "in_channel",
      replace_original: false,
      text: formatVerdicts(result),
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

app.command("/council-audit", async ({ ack, respond }) => {
  await ack();
  await respond({
    response_type: "ephemeral",
    text: "_Brier calibration audit coming Day 4. For now: trust nothing, audit everything._",
  });
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
