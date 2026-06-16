// Council MCP server — wraps council-diff as a Model Context Protocol tool.
// Exposes one tool: council_deliberate(domain, decision, context?, oracle?, safeMode?)
// Designed for Claude Desktop / Claude Code / Cursor / any MCP-aware client.

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { CouncilDiff } from "council-diff";

const SUPPORTED_DOMAINS = [
  "founder",
  "engineer",
  "investor",
  "career",
  "product",
  "quant",
];

const DELIBERATE_TOOL = {
  name: "council_deliberate",
  description:
    "Fire a 5-persona AI council on a high-stakes decision. Returns a GO / WAIT / KILL / SPLIT recommendation, agreement score, and per-voice verdicts with strongest signal and biggest gap. Built on council-diff v0.4.0 (Anthropic Sonnet 4.6, ~10s, ~$0.03). Use when the question has real downside, ambiguity, or smart-money disagreement — not for trivial choices.",
  inputSchema: {
    type: "object",
    properties: {
      domain: {
        type: "string",
        enum: SUPPORTED_DOMAINS,
        description:
          "Persona roster. founder = YC Partner / VC Skeptic / Lawyer / Indie CFO / Pragmatic Spouse. engineer = Rust Maintainer / SRE Oncall / Recruiter / Junior Dev / CTO 5y Later. investor = Macro / Sector / PM / Growth VC / Activist Short. career = Mentor 20y / Recruiter / Peer / CSO / Future You. product = Real User / Competitor / Internal Dev / Garry-style / Naval-style. quant = Jane Street MD / Citadel / Two Sigma ML / Anthropic / HFT Engineer.",
      },
      decision: {
        type: "string",
        description:
          "The question. Phrase as a binary or short-list, not open-ended. Good: 'Should I raise a $1M seed or bootstrap?' Bad: 'What should I do about funding?'",
      },
      context: {
        type: "string",
        description:
          "Ground truth the personas need to score honestly. Numbers, dates, constraints. Without context the personas correctly punish the question with low scores.",
      },
      oracle: {
        type: "string",
        enum: ["fable-5"],
        description:
          "Optional flagship-tier second opinion. Fable 5 reads all 5 council verdicts and adjudicates separately. Use for hard calls, split councils, or anywhere you want a tiebreak. Note: Mythos Fable models carry 30-day data retention — see safeMode for zero-retention fallback.",
      },
      safeMode: {
        type: "boolean",
        description:
          "Force zero-retention path. When true, oracle silently downgrades to Sonnet 4.6 fallback. Use for privacy-sensitive decisions (legal, M&A, personnel).",
      },
    },
    required: ["domain", "decision"],
  },
};

function formatVoiceLine(voice) {
  const lines = [
    `**${voice.voice_display}** — ${voice.verdict.toUpperCase()} (${voice.score}/100)`,
    `  + ${voice.strength}`,
    `  − ${voice.gap}`,
  ];
  return lines.join("\n");
}

function formatResult(result, elapsedMs) {
  const sections = [
    `**Recommendation**: ${result.recommendation.toUpperCase()}`,
    `**Agreement**: ${result.agreement_score.toFixed(2)} (1.0 unanimous, 0.0 split)`,
    `**Elapsed**: ${(elapsedMs / 1000).toFixed(1)}s`,
    "",
    `**Consensus**`,
    result.consensus,
    "",
    `**Voices**`,
    result.voices.map(formatVoiceLine).join("\n\n"),
  ];

  if (result.oracle) {
    sections.push(
      "",
      `**Oracle (${result.oracle.model ?? "fable-5"})**`,
      `Recommendation: ${result.oracle.recommendation.toUpperCase()}`,
      `Reasoning: ${result.oracle.reasoning}`,
    );
  }

  return sections.join("\n");
}

export function buildServer({ apiKey }) {
  const server = new Server(
    { name: "council-for-slack-mcp", version: "0.1.0" },
    { capabilities: { tools: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [DELIBERATE_TOOL],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    if (req.params.name !== DELIBERATE_TOOL.name) {
      throw new Error(`Unknown tool: ${req.params.name}`);
    }
    const args = req.params.arguments ?? {};
    const { domain, decision, context, oracle, safeMode } = args;

    if (!domain || !SUPPORTED_DOMAINS.includes(domain)) {
      throw new Error(
        `domain must be one of ${SUPPORTED_DOMAINS.join(", ")}; got ${domain}`,
      );
    }
    if (typeof decision !== "string" || decision.trim().length === 0) {
      throw new Error("decision is required and must be a non-empty string");
    }

    const council = new CouncilDiff({ apiKey });
    const t0 = Date.now();
    const result = await council.deliberate({
      domain,
      decision,
      context,
      oracle,
      safeMode,
    });
    const elapsedMs = Date.now() - t0;

    return {
      content: [{ type: "text", text: formatResult(result, elapsedMs) }],
    };
  });

  return server;
}

export async function run() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error(
      "ANTHROPIC_API_KEY missing. Set it in your MCP client config (Claude Desktop: claude_desktop_config.json mcpServers.council.env).",
    );
    process.exit(1);
  }
  const server = buildServer({ apiKey });
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[council-mcp] stdio server ready");
}
