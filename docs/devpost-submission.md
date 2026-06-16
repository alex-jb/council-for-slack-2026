# Devpost submission copy — Council for Slack

> Final copy to paste into devpost.com → Slack Agent Builder Challenge → Submit project. Updated 2026-06-16. Keep in sync with README + Loom.

## Project name

`Council for Slack`

## Tagline (max 200 chars)

`5 voices, 1 verdict, every voice scored against reality at resolution. The second-opinion ritual native to Slack — 10 seconds, ~$0.03 a fire, Brier-audited over time.`

## Built With (tags Devpost likes)

```
typescript, nextjs, slack-bolt, anthropic-claude, mcp, workflow-builder,
slack-canvas, supabase, vercel, council-diff
```

## Description (the long version — paste into the "Project Description" textarea)

> Aim 250-400 words. First 60 characters of the first line is what shows in the gallery card — make them count.

```
Every team already has the informal "second-opinion" ritual: before a real decision ships, somebody DMs three trusted people and asks "what would you do?". The replies disagree. The disagreement is the signal.

Council for Slack makes that ritual native to the channel where the decision is happening, then keeps score.

Type /council in any Slack channel with the decision and optional context. Five domain-typed AI personas (YC Partner, Tier-1 VC Skeptic, Lawyer, Indie CFO, Pragmatic Spouse for the founder roster; six rosters total: founder / engineer / investor / product / quant / career) debate in parallel via Anthropic Sonnet 4.6. Ten seconds and ~$0.03 later, an in-channel verdict appears with:

- 1-paragraph consensus quote
- Per-voice verdict + score (0-100) + strongest signal + biggest gap
- Agreement score (how much the 5 voices align)
- Recommendation: GO / WAIT / KILL / SPLIT

The same fire auto-appends to the channel's pinned Canvas as a permanent, Brier-audited team decision log. Weeks later, when reality lands, anyone clicks ✅ Happened / ❌ Did not happen on the entry. The Brier score per voice updates, and the workspace's calibration meta-metric ("your team is calibrated at 0.14, labelled good") drifts visibly. Over time, the team learns which voices to trust on which kinds of questions.

The council is exposed through four Slack-native surfaces: slash command, message-action shortcut (right-click any message → "Send to council"), Workflow Builder custom step (non-coder admins drop "Council deliberate" into any automation), and Channel Canvas auto-append. The same engine is also exposed as an MCP server for Claude Desktop / Cursor / Claude Code.

Built on the open-source council-diff engine (npm, MIT, also authored here). Targets all three Slack Agent Builder rubric-required technologies: Workflow Builder custom step, MCP server, and Slack Canvas API — all load-bearing, not lipstick.

The pattern judges have been calling for: persona-vs-persona spec, agreement score as the structural test, Brier audit at resolution as the eval loop. Karpathy Software 3.0, literal.
```

## Built (the "How we built it" textarea)

```
Built solo over 10 days during the Splunk + Band of Agents hackathon week. Stack:

- Next.js 16.2 Pages Router on Vercel serverless (maxDuration 60s)
- @slack/bolt 4.7 with ExpressReceiver + processBeforeResponse: true (the FaaS pattern — otherwise Vercel kills the in-flight deliberation Promise when ack ends the response)
- council-diff v0.4.0 (the persona deliberation engine — also OSS, MIT, on npm; authored as part of this project)
- Anthropic Claude Sonnet 4.6 for the 5 parallel persona calls (Mythos Fable-5 as opt-in Oracle adjudicator)
- Supabase Postgres on a council schema with three SECURITY DEFINER RPCs (council_decision_insert, council_decisions_recent, council_decision_resolve) + workspace stats RPC. Anon key only. RLS deny-all on the table; RPC path is the only door.
- Slack: slash commands × 2, message shortcut, Workflow Builder custom function (council_deliberate), Channel Canvas API for the decision log, Block Kit interactive buttons for resolution.

Brier math (binary outcome):
- recommendation → probability of "happened": go=0.80, wait=0.40, kill=0.10, split=0.50
- per voice: voice.score / 100 used directly as probability
- BS = (forecast − outcome)²; outcome = 1 happened, 0 not
- Lower = better calibrated. 0 perfect, 0.25 chance, 1 catastrophic.
```

## Challenges

```
1. Vercel serverless killing in-flight deliberation: the default Bolt ack() pattern terminates the function instance before the 10s deliberation completes. Fix: processBeforeResponse: true on both ExpressReceiver and App constructors. Slack shows a transient "didn't respond in 3s" warning but the response_url POST still delivers the verdict cleanly ~10s later.

2. Slack Canvas markdown is stricter than chat. Initial Canvas blocks with :emoji_shortcode: tokens and <@USERID> mentions were silently dropped by the Canvas parser. Fix: Unicode emoji + plain text only inside Canvas markdown. Logged in code comments at appendCanvasLog().

3. Bolt JS .function listener does not take ack(). Custom functions complete via complete({outputs}) or fail({error}) — separate Web API POSTs. Caught at first smoke test.
```

## What's next

```
- Public OAuth install flow + Slack Marketplace listing decision by 2026-06-22 (note: custom-function apps cannot be Marketplace-listed per Slack docs, so the Best New Slack Agent track is the target, not Slack Agents for Orgs).
- Cross-workspace calibration leaderboard ("top 10 teams by avg Brier") — gamifies the second-opinion ritual.
- Real-Time Search API integration once search:read beta is enrolled — Skeptic + Strategist personas pull fresh workspace state for ground truth.
- AMD MI300X vLLM portable backend (already a 1-file swap thanks to council-diff provider abstraction).
- 中文 README + Mythos opt-in Oracle for jurisdictions wanting data-locality.
```

## Try it out URL

```
https://github.com/alex-jb/council-for-slack-2026
```

(Public after manual review pre-deadline. Marketplace install flow + OAuth landing scheduled for 2026-06-25.)

## Repository URL

```
https://github.com/alex-jb/council-for-slack-2026
```

## Video demo URL

```
{paste YouTube/Loom URL after 60s demo records}
```

## Image gallery (4 screenshots)

1. `docs/screenshots/council-fire.png` — `/council` verdict in channel
2. `docs/screenshots/council-audit.png` — `/council-audit` with calibration header
3. `docs/screenshots/workflow-builder-step.png` — Workflow Builder picker showing "Council deliberate" custom step
4. `docs/screenshots/canvas-decision-log.png` — Channel Canvas with multiple decision entries
