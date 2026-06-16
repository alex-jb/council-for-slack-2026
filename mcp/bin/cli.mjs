#!/usr/bin/env node
// Council MCP server entry point.
// Run modes:
//   council-mcp              → stdio MCP server (the production path; pipe into Claude Desktop / Cursor / Claude Code)
//   council-mcp --smoke      → in-process smoke test, fires one /council request and exits

import { CouncilDiff } from "council-diff";
import { run } from "../src/server.mjs";

const args = process.argv.slice(2);

if (args.includes("--smoke")) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY missing — `export ANTHROPIC_API_KEY=sk-ant-...` first");
    process.exit(1);
  }
  const council = new CouncilDiff({ apiKey });
  const t0 = Date.now();
  const result = await council.deliberate({
    domain: "founder",
    decision: "Ship the MCP server scaffold tonight or wait for morning?",
    context:
      "1 AM NY, Slack Agent Builder Challenge deadline 2026-07-13 in 27 days. Rubric requires MCP server / Workflow Builder / RTS API and we have none yet.",
  });
  console.log(`Smoke OK in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  console.log(`Recommendation: ${result.recommendation.toUpperCase()}`);
  console.log(`Agreement: ${result.agreement_score.toFixed(2)}`);
  console.log(`Consensus: ${result.consensus}`);
  process.exit(0);
}

await run();
