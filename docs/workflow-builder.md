# Workflow Builder integration — "Council deliberate" custom step

> One of the three Slack Agent Builder Challenge required technologies. Lets a non-coder admin drop the council into any Workflow Builder workflow.

## The pitch

Slash commands are for the one user typing. **Workflow Builder is for the team.**

After installing Council for Slack, admins find a new step called **"Council deliberate"** in Workflow Builder → Custom. They drop it into any workflow they already use:

- **Decision triage**: when a Jira issue is moved to "needs decision", fire `council_deliberate` with the issue body, post verdict to thread, optionally page the on-call.
- **Hot take audit**: when a message in #leadership contains "should we", queue a 5-voice second opinion before the thread keeps growing.
- **PR signoff**: when a Linear ticket flips to "ready for review", convene `:engineer` domain on the design decision.
- **Pricing approval**: when a discount over X% is requested in #deals, run `:investor` domain and route the consensus to the deal channel.

The council becomes infrastructure. Not a thing one user types — a primitive every workflow can compose.

## Function shape

| Input | Type | Required | Description |
|---|---|---|---|
| `question` | string | yes | The decision question |
| `channel_id` | channel | yes | Where to post the verdict |
| `domain` | string | no | `founder` (default) / `engineer` / `investor` / `career` / `product` / `quant` |
| `context` | string | no | Ground truth (numbers, dates, constraints) — improves score quality |
| `requester_id` | user | no | For attribution on the channel canvas log |

| Output | Type | Description |
|---|---|---|
| `verdict` | string | `GO` · `WAIT` · `KILL` · `SPLIT` |
| `recommendation` | string | Lowercase verdict — feed to conditional steps |
| `agreement_score` | number | 0-1, how much the 5 voices align |
| `consensus` | string | 1-paragraph consensus quote |
| `summary` | string | One-line, fit for downstream Slack message steps |
| `decision_id` | string | Persistent ID — use later for `/council-audit` or `council_decision_resolve` |

## Install + smoke test

1. **Install the app** to your workspace (or re-install if upgrading from Day 9 — the `functions:` manifest block needs a fresh install to register).
2. In Slack: lightning bolt (top of any channel) → **"Build a workflow"** → "From scratch".
3. Pick any trigger (webhook, reaction, message-shortcut, scheduled).
4. **"Add step"** → **"Custom"** tab → search **"Council deliberate"**.
5. Wire inputs:
   - `question` → `{{trigger.text}}` (or any string from the trigger payload)
   - `channel_id` → `{{trigger.channel}}` (or hardcode to a #decisions channel)
   - `domain` → optional, e.g. `"investor"` for finance workflows
6. **"Publish"**.
7. Fire the trigger — verdict posts to the channel in ~10s.
8. **Chain downstream steps**: feed `{{step.summary}}` into a "Send message" step, or `{{step.recommendation}}` into an "If" step (`recommendation = "kill"` → page the founder, `recommendation = "go"` → auto-approve the request).

## Why this hits the rubric verbatim

> "Use one of the three required technologies in a way that wouldn't be possible without it." — [Slack resources](https://slackhack.devpost.com/resources)

Without Workflow Builder, the council is a thing one user types. With Workflow Builder, the council becomes the **decision-evaluation primitive** any team workflow can reach for. The MCP server (`mcp/`) gives the same primitive to Cursor / Claude Desktop / Claude Code. Same engine, three surfaces.

## Plan caveats Slack flagged

> "Apps containing workflow steps cannot be distributed publicly or submitted to the Slack Marketplace." — [Slack docs](https://docs.slack.dev/workflows/workflow-steps)

This means the **Best New Slack Agent** track is the right target for this submission (NOT the Slack Agents for Orgs track, which requires Marketplace). The function works on paid workspaces; Free-plan workspaces can't author workflows that include custom functions. Judges can spin up an Enterprise Grid sandbox to test.

## Vercel serverless notes

- `complete({outputs})` and `fail({error})` POST back to Slack via Web API — they're independent of the HTTP response, so `processBeforeResponse: true` is safe.
- Function execution window is ~15 minutes per Slack workflow rules, well over our ~10s deliberation latency.
- Watch Vercel logs for the `function_executed` event on the first fire after re-install.

## Where the code lives

- Handler: [`web/pages/api/slack/events.ts`](../web/pages/api/slack/events.ts) — search `app.function("council_deliberate"`
- Manifest declaration: [`docs/slack-app-manifest.md`](./slack-app-manifest.md) — `functions:` block at the bottom
- Shared deliberation: same `council.deliberate()` call as the slash command — single source of truth, no drift between surfaces
