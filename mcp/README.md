# `council-for-slack-mcp`

> Model Context Protocol server wrapping [council-diff](https://github.com/alex-jb/council-diff) v0.4.0. Exposes the 5-persona council pattern as a tool that Claude Desktop / Cursor / Claude Code can call directly.

Companion to [Council for Slack](../README.md), our submission for the [Slack Agent Builder Challenge 2026-07-13](https://slackcommunity.com/challenges/agent-builder). Slack-native channel UX *and* an MCP server with the same primitive — same `council-diff` backend, two integration surfaces.

## Why an MCP server

A `/council` slash command is great inside Slack. But decisions also happen during code review, while reading a Linear ticket, while pairing with Claude Code on an architecture choice. The MCP server lets the same 5-persona deliberation primitive run *wherever your agent runs*.

It also satisfies the Slack Agent Builder Challenge rubric requirement for "MCP server" as one of the platform integrations — so the same artifact serves both judges and end users.

## Tools exposed (v0.1)

| Tool | What it does |
|---|---|
| `council_deliberate(domain, decision, context?, oracle?, safeMode?)` | Fires a 5-persona council. Returns GO / WAIT / KILL / SPLIT + agreement score + per-voice verdicts. ~10s, ~$0.03 per call. |

Domains: `founder` · `engineer` · `investor` · `career` · `product` · `quant`. See [council-diff README](https://github.com/alex-jb/council-diff#what-it-does) for persona roster per domain.

## Install (Claude Desktop)

```bash
cd /path/to/council-for-slack-2026/mcp
npm install
```

Then add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```jsonc
{
  "mcpServers": {
    "council": {
      "command": "node",
      "args": ["/absolute/path/to/council-for-slack-2026/mcp/bin/cli.mjs"],
      "env": {
        "ANTHROPIC_API_KEY": "sk-ant-..."
      }
    }
  }
}
```

Restart Claude Desktop. Try: *"Use the council tool to deliberate on whether I should raise a seed round or bootstrap — domain founder, context $5K MRR + 12mo runway."*

## Install (Claude Code)

```bash
claude mcp add council node /absolute/path/to/council-for-slack-2026/mcp/bin/cli.mjs
```

Then `claude` in any project. The tool surfaces as `mcp__council__council_deliberate`.

## Install (Cursor)

`~/.cursor/mcp.json`:

```jsonc
{
  "mcpServers": {
    "council": {
      "command": "node",
      "args": ["/absolute/path/to/council-for-slack-2026/mcp/bin/cli.mjs"],
      "env": { "ANTHROPIC_API_KEY": "sk-ant-..." }
    }
  }
}
```

## Smoke test (without MCP client)

```bash
ANTHROPIC_API_KEY=sk-ant-... npm run smoke
```

Should print a `Recommendation` line within ~10s. Confirms the council-diff path works before you wire MCP plumbing.

## Roadmap (post Slack hackathon submission 2026-07-13)

- [ ] Second tool: `council_resolve_decision(id, outcome)` once a hosted decision-log is available (currently DB lives in the Slack app side)
- [ ] Publish to npm as `council-for-slack-mcp`
- [ ] Awesome-mcp-servers PR
- [ ] skills.sh entry

## License

MIT. Same as council-diff and Council for Slack.
