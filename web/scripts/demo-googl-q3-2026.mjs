#!/usr/bin/env node
// Demo: GOOGL Q3 2026 — Druckenmiller-fade vs Berkshire-buy
// Real council-diff investor-domain deliberation
// Run: node --env-file=.env.local scripts/demo-googl-q3-2026.mjs

import { CouncilDiff } from "council-diff";
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..", "..");
const OUT_DIR = join(REPO_ROOT, "docs", "case-studies");
mkdirSync(OUT_DIR, { recursive: true });

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error("ANTHROPIC_API_KEY missing — run with `node --env-file=../.env.local scripts/demo-googl-q3-2026.mjs` from web/");
  process.exit(1);
}

const decision =
  "Go long GOOGL into Q3 2026?";

const context = [
  "Druckenmiller Q1 2026 13F (filed May 15): sold ALL GOOGL position, exited the name entirely.",
  "Berkshire Hathaway Q1 2026 13F: took ~$10B GOOGL position (new buy). Ben Thompson framed this on Stratechery 2026-06-02 as 'The Google Capital Company' thesis — Berkshire is paying for the AI compute moat.",
  "Bull case: TPU vs Nvidia competition real, Gemini gaining enterprise share, Search ad revenue still growing 10%+ YoY, Waymo public ride volume up 4x YoY.",
  "Bear case: Perplexity + ChatGPT search erode Google Search query share at the margin; antitrust remedies still unresolved (Chrome divestiture risk); AI capex (~$75B 2026) burns FCF for 2-3 years before payoff.",
  "Current valuation: ~$190/share, 22x forward P/E, FCF yield ~3.5%. 5-year revenue CAGR 12%.",
  "Macro: 10y at 4.4%, Fed paused, NVDA already +60% YTD — rotation candidates getting bid.",
].join(" ");

const council = new CouncilDiff({ apiKey });

console.log("Running council-diff investor-domain deliberation...\n");
console.log("Decision:", decision);
console.log("Context:", context.slice(0, 200) + "...\n");

const start = Date.now();
const result = await council.deliberate({
  domain: "investor",
  decision,
  context,
});
const elapsed = ((Date.now() - start) / 1000).toFixed(1);

console.log(`\n=== VERDICT (${elapsed}s) ===\n`);
console.log(`Recommendation: ${result.recommendation.toUpperCase()}`);
console.log(`Agreement score: ${result.agreement_score.toFixed(2)}`);
console.log(`\nConsensus:\n${result.consensus}\n`);
console.log("Voices:");
for (const v of result.voices) {
  console.log(`\n  ${v.voice_display} — ${v.verdict.toUpperCase()} (${v.score}/100)`);
  console.log(`    + ${v.strength}`);
  console.log(`    - ${v.gap}`);
}

const md = [
  "# Case Study: GOOGL Q3 2026 — Druckenmiller vs Berkshire",
  "",
  "> Live council-diff `investor` domain deliberation. 5 personas: Macro / Sector / PM / Growth VC / Activist Short. Real Anthropic Sonnet 4.6, ~$0.03, ~10s end-to-end.",
  "",
  `**Generated**: ${new Date().toISOString()}`,
  `**council-diff**: v0.4.0`,
  `**Domain**: investor`,
  `**Elapsed**: ${elapsed}s`,
  "",
  "## The setup",
  "",
  "Two of the loudest 13F filings in Q1 2026 went opposite directions on the same name:",
  "",
  "- **Druckenmiller (Duquesne)** — sold the entire GOOGL position. Exited.",
  "- **Berkshire Hathaway** — opened a new ~$10B GOOGL position. Ben Thompson called it [\"The Google Capital Company\"](https://stratechery.com/2026/the-google-capital-company/) on Stratechery 2026-06-02 — Berkshire is paying for the AI compute moat.",
  "",
  "Single-LLM answer would pick one and sound 90% confident. The council pattern shows the disagreement directly.",
  "",
  "## Decision",
  "",
  `> ${decision}`,
  "",
  "## Context (verbatim, fed via `context` field)",
  "",
  context.split(". ").map(s => s.trim()).filter(Boolean).map(s => `- ${s}${s.endsWith(".") ? "" : "."}`).join("\n"),
  "",
  "## Verdict",
  "",
  `- **Recommendation**: \`${result.recommendation.toUpperCase()}\``,
  `- **Agreement score**: ${result.agreement_score.toFixed(2)} (1.0 unanimous, 0.0 split)`,
  "",
  "### Consensus",
  "",
  result.consensus,
  "",
  "### Per-voice breakdown",
  "",
  "| Voice | Verdict | Score | Strongest signal | Biggest gap |",
  "|---|---|---|---|---|",
  ...result.voices.map(v =>
    `| **${v.voice_display}** | ${v.verdict.toUpperCase()} | ${v.score}/100 | ${v.strength.replace(/\|/g, "\\|")} | ${v.gap.replace(/\|/g, "\\|")} |`
  ),
  "",
  "## What this demonstrates",
  "",
  "- **Persona-vs-persona** is the spec. The Activist Short and the Growth VC are looking at the same context and arriving at different scores. That delta is signal, not noise.",
  "- **Agreement score** is the test. Low agreement = the question itself is structurally ambiguous and a single confident answer would be overfitting.",
  "- **Brier audit at resolution** is the evaluation loop. When GOOGL Q3 2026 prints, each voice gets scored. Calibration tracked across 30 / 90 days.",
  "",
  "## Try it on your own watchlist",
  "",
  "```bash",
  "npm install council-diff",
  "```",
  "",
  "```ts",
  "import { CouncilDiff } from \"council-diff\";",
  "const council = new CouncilDiff({ apiKey: process.env.ANTHROPIC_API_KEY });",
  "const result = await council.deliberate({",
  "  domain: \"investor\",",
  "  decision: \"Long GOOGL into Q3 2026?\",",
  "  context: \"Druckenmiller Q1 sold all GOOGL...\",",
  "});",
  "```",
  "",
  "Or in Slack: install [Council for Slack](../../README.md) and fire `/council Long GOOGL into Q3? | Druckenmiller sold all, Berkshire bought $10B`.",
  "",
  "---",
  "",
  "_Generated by `web/scripts/demo-googl-q3-2026.mjs`. Re-run to refresh against live model._",
].join("\n");

const mdPath = join(OUT_DIR, "googl-q3-2026.md");
writeFileSync(mdPath, md);
console.log(`\nMarkdown: ${mdPath}`);

const jsonPath = join(OUT_DIR, "googl-q3-2026.json");
writeFileSync(jsonPath, JSON.stringify({
  generated_at: new Date().toISOString(),
  decision,
  context,
  domain: "investor",
  elapsed_seconds: parseFloat(elapsed),
  result,
}, null, 2));
console.log(`JSON: ${jsonPath}`);
