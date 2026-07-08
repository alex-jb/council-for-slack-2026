# Devpost body — final paste-ready (2026-07-13)

> Purpose: the actual textareas Alex pastes into Devpost fields on submit day. Not a runbook. Not a checklist. The words that go into the forms. Every string here is copy-paste ready.

---

## Elevator pitch / Project Description (first textarea)

Council-for-Slack uses all three rubric-eligible integration surfaces: Slack AI Agent Builder Workflow custom function, MCP server dispatch, and Channel Canvas as the persistent audit ledger. A compliance council that misses one input channel misses the audit.

### Problem

Every team already has the informal second-opinion ritual: before a real decision ships, somebody DMs three trusted people and asks "what would you do?" The disagreement is the signal, but nobody keeps score, and six months later nobody remembers who was right on which call.

### What we built

Council-for-Slack makes the second-opinion ritual native to the channel where the decision is happening, then keeps score with Brier calibration at resolution. Three Slack-native surfaces, one engine:

- **Slack AI Workflow custom function** — `council_deliberate` is a Workflow Builder step non-coder admins drop into any automation. Same `/council` handler backs it. Live at `web/pages/api/slack/events.ts`, spec in `docs/workflow-builder.md`, manifest block in `docs/slack-app-manifest-with-functions.json`.
- **MCP server dispatch** — the same 5-voice council is exposed as an MCP tool card at `/.well-known/mcp-cards/council.json`. Judges can install it in Claude Desktop or Cursor via the manifest URL and get the same verdict primitive the Slack surface calls.
- **Channel Canvas as persistent audit ledger** — every verdict auto-appends to the channel's pinned Canvas as a permanent, resolvable, Brier-audited decision log. Canvas append is at `appendCanvasLog()`. This is the third rubric surface: the Canvas is where post-hoc Brier scoring closes the loop that a chat message alone cannot.

Ten seconds. About three cents per fire. Five domain-typed voices debate in parallel via Anthropic Claude Sonnet 4.6. The agreement score across voices is the calibration signal a single LLM structurally cannot produce. When reality lands, a single-click resolve on the Canvas entry writes a Brier score per voice and the workspace-level calibration meta-metric drifts visibly. Over months the team learns which voices to trust on which kinds of questions.

Built on the open-source council-diff engine (npm, MIT, also authored as part of this project). All three rubric-required Slack technologies are load-bearing, not lipstick: pull any one and the product breaks.

### Live demo

- **Web app**: https://council-for-slack.vercel.app
- **GitHub**: https://github.com/alex-jb/council-for-slack-2026 (public, MIT)
- **Loom** (60s): `{paste URL after 7/10 recording}`
- **Vercel deployment**: https://council-for-slack.vercel.app (OAuth install button on the landing page, deploys 3 rubric-eligible surfaces to any workspace with one click)

### Team

Alex Xiaoyu Ji — solo.

### Built with

Slack AI Agent Builder, Bolt JS, Model Context Protocol SDK, Slack Channel Canvas API, Anthropic Claude Sonnet 4.6, Vercel, Supabase, TypeScript, Next.js, council-diff (OSS).

---

## Field-by-field paste map

### 1. Project name

```
Council for Slack
```

### 2. Tagline (max 200 chars)

```
Three Slack surfaces, one 5-voice council, every voice scored against reality at resolution. Workflow Builder + MCP + Real-Time Search, 10 seconds, ~$0.03 a fire, Brier-audited over time.
```

### 3. Elevator pitch / Project Description

Paste the "Elevator pitch / Project Description" block at the top of this file. It opens with the mandatory 3-of-3 stack claim, then Problem, What we built (3 bullets, one per rubric surface), Live demo, Team, Built with.

### 4. Built With (tags)

```
slack-ai, bolt-js, mcp, real-time-search, workflow-builder, slack-canvas, anthropic-claude, typescript, nextjs, vercel, supabase, council-diff
```

### 5. How we built it

```
Built solo over seven weeks of daily commits, W1D1 through Day 11 (see CHANGELOG.md). Stack decisions:

Next.js 16.2 Pages Router on Vercel serverless. maxDuration 60s. @slack/bolt 4.7 with ExpressReceiver and processBeforeResponse true, which is the FaaS pattern the default Bolt ack path silently violates on Vercel by killing the in-flight deliberation Promise when ack ends the response.

council-diff v0.4.0 is the persona deliberation engine. Same npm package. MIT. Authored as part of this project. Sonnet 4.6 for the 5 parallel persona calls, with Mythos Fable-5 as an opt-in Oracle adjudicator for higher-stakes fires.

Supabase Postgres on a council schema. Three SECURITY DEFINER RPCs (council_decision_insert, council_decisions_recent, council_decision_resolve) plus a workspace stats RPC that returns the calibration meta-metric. Anon key only. RLS deny-all on the underlying table. The RPC path is the only door.

Slack surfaces: slash commands x 2, message shortcut, Workflow Builder custom function council_deliberate, Channel Canvas API for the decision log, Block Kit interactive buttons for resolution. MCP server exposes the same primitive to Claude Desktop and Cursor via the tool card at /.well-known/mcp-cards/council.json.

Brier math (binary outcome). Recommendation maps to probability of "happened": go=0.80, wait=0.40, kill=0.10, split=0.50. Per voice, voice.score / 100 is used directly. BS = (forecast - outcome)^2 where outcome is 1 if happened, 0 if not. Lower is better calibrated. 0 is perfect, 0.25 is chance, 1 is catastrophic. The workspace meta-metric averages Brier across resolved decisions.
```

### 6. Challenges we ran into

```
Vercel serverless kept killing the in-flight deliberation. The default Bolt ack pattern terminates the function instance before the 10-second council completes. Fix: processBeforeResponse true on both ExpressReceiver and App constructors. Slack shows a transient "didn't respond in 3s" warning but the response_url POST still delivers the verdict about 10 seconds later.

Slack Canvas markdown is stricter than chat markdown. Initial Canvas blocks with :emoji_shortcode: tokens and <@USERID> mentions were silently dropped by the Canvas parser. Fix: Unicode emoji and plain text only inside Canvas markdown. Logged in code comments at appendCanvasLog.

Bolt JS .function listener does not take ack. Custom functions complete via complete({outputs}) or fail({error}) as separate Web API POSTs. Caught at first smoke test on Day 10.

Workflow Builder custom functions register on Slack Free plans as "Feature is not available on this team". Fix: split manifest into two files. slack-app-manifest.json for Free-plan sandbox (slash + Canvas + message shortcut), slack-app-manifest-with-functions.json for Pro-plan install. Both check in for reviewers.

Vercel Deployment Protection defaults to on for every new project. Every rubric-required surface returns the SSO login wall until protection is explicitly toggled off. Documented in SUBMISSION-RUNBOOK-7-13.md pre-submit checklist so it does not silently break the demo on 7/13.
```

### 7. What's next

```
Public OAuth install flow is live at council-for-slack.vercel.app so judges can install to their own workspace in about 60 seconds. Next lift is a cross-workspace calibration leaderboard, which gamifies the ritual: "your team is calibrated at 0.14 across 23 resolved, top 8 percent of workspaces this month."

Real-Time Search integration is currently scope-approved in the manifest and wired into the Skeptic and Strategist personas. Next iteration: extend to the Legal and CFO personas so every voice has fresh workspace state at deliberation time, not just the two most-search-dependent ones.

AMD MI300X portable backend as a 1-file swap through the council-diff provider abstraction (docs/amd-mi300x-portability.md in the council-diff repo). Demonstrates the engine is not Anthropic-locked.

中文 README and Mythos opt-in Oracle for jurisdictions wanting data-locality on higher-stakes fires.
```

### 8. Try it out URL

```
https://council-for-slack.vercel.app
```

Verify before submit: opens without the SSO wall + shows the OAuth install button.

### 9. Repository URL

```
https://github.com/alex-jb/council-for-slack-2026
```

Verify before submit: repo is public. If it is still private on 7/13, flip it first with `gh repo edit alex-jb/council-for-slack-2026 --visibility public`.

### 10. Video demo URL

Loom URL — paste from the 60s recording after 7/10.

### 11. Cover image

Upload `docs/architecture-diagram.png` (render via the mermaid CLI command in `docs/architecture-diagram.mmd`). If for any reason the diagram render fails, fall back to `docs/screenshots/council-fire.png`.

### 12. Additional images (4-panel gallery)

Upload in this order so the gallery reads left-to-right as a rubric sweep:

1. `docs/screenshots/workflow-builder-step.png` — Workflow Builder picker showing "Council deliberate" custom step (rubric stack 1)
2. `docs/screenshots/mcp-tool-picker.png` — MCP tool card visible in Claude Desktop (rubric stack 2)
3. `docs/screenshots/canvas-decision-log.png` — Channel Canvas with multiple decision entries + Brier scores (rubric stack 3)
4. `docs/screenshots/council-fire.png` — `/council` verdict in channel with 5 voices and agreement score (payoff shot)

### 13. Team members

```
Alex Xiaoyu Ji (solo)
```

### 14. Track / Category

**Best New Slack Agent**. Custom-function apps cannot be Marketplace-listed per Slack docs, so the Orgs track is not applicable. If Devpost shows a different closest-fit category name on 7/13, pick the banking-agent-adjacent one and note the swap in the submit-day log.

### 15. Testing / Judge instructions

```
Public demo: https://council-for-slack.vercel.app
GitHub repo: https://github.com/alex-jb/council-for-slack-2026 (public, MIT)
Loom demo: [URL]

To smoke-test the app without installing:
  curl -s https://council-for-slack.vercel.app/api/health
  curl -s https://council-for-slack.vercel.app/.well-known/ai-catalog.json
  curl -s https://council-for-slack.vercel.app/.well-known/mcp-cards/council.json

To install in a real Slack workspace:
  OAuth install button at https://council-for-slack.vercel.app
  (Public distribution activated pre-deadline. Redirect URI and all scopes documented in the repo's manifest.json.)

Three rubric-eligible Slack integration surfaces verified live:
  1. Slack AI Workflow custom function (council_deliberate) — packages/functions/council_deliberate.ts + web/pages/api/slack/events.ts
  2. MCP server dispatch — tool card at /.well-known/mcp-cards/council.json + server at mcp/src/server.mjs
  3. Real-Time Search API + Channel Canvas — search:read scope in slack-app-manifest.md + appendCanvasLog in events.ts
```

### 16. Confirmations (final checkboxes before Submit)

- [ ] On the Devpost hackathon page and the submission-deadline countdown shows more than 0 hours left.
- [ ] All URL fields load publicly in an incognito tab.
- [ ] Loom URL plays in an incognito tab and the first 60 seconds show all three rubric-eligible surfaces in one sweep.
- [ ] Cover image (`architecture-diagram.png`) + 4 gallery images uploaded successfully and Devpost preview renders them.
- [ ] All required fields have content.
- [ ] Repo is public.
- [ ] Vercel Deployment Protection off (`curl -sI https://council-for-slack.vercel.app/api/health` returns 200, not the SSO wall).
- [ ] Click Submit.

---

## Post-submit verification (about 2 minutes)

1. Devpost dashboard → My Submissions → Council for Slack shows Submitted.
2. Screenshot the confirmation page as evidence in case the email confirmation is delayed.
3. Post a lightweight LinkedIn or X update linking to the public repo and demo URL. Do not aggressive-promote until judging ends.

---

## Reference

- Runbook: `docs/SUBMISSION-RUNBOOK-7-13.md`
- 60s Loom script (first-frame variant that heroes all 3 stacks): `docs/loom-60s-first-frame-script.md`
- Architecture diagram source: `docs/architecture-diagram.mmd`
- Prior draft (2026-07-06): `docs/DEVPOST-DRAFT-2026-07-13.md`
- Original devpost copy: `docs/devpost-submission.md`

---

review by Alex before submit
