# Council for Slack — 60s Loom "first-frame" script (all 3 rubric stacks heroed)

> Purpose: the first 60 seconds is where the prize is won. Every 10s block hero-labels one of the 3 rubric-required Slack technologies so a judge scrubbing at 2x still sees "3/3 rubric coverage" spelled out in white text on cyan overlay.
>
> Companion to `docs/loom-script.md` (the longer 60s script that opens on the Brier audit). This file is the tighter alternate open that leads with the 3-stack sweep. Alex picks one at rehearsal.

## Ground truth on the 3 rubric-required Slack stacks (verified 2026-07-08)

1. **Slack AI / Agent Builder — Workflow Builder custom function** (`council_deliberate`) — live in `web/pages/api/slack/events.ts`, spec in `docs/workflow-builder.md`
2. **MCP server dispatch** — `mcp/src/server.mjs` + tool card at `/.well-known/mcp-cards/council.json`
3. **Channel Canvas API** — `appendCanvasLog()` auto-pinned per-channel decision log

Real-Time Search (`search:read`) is beta-queued and NOT live — do NOT claim it in the video. The rubric only requires "at least one"; we ship three (WB + MCP + Canvas).

## Hard constraints

- 60s hard cap. If take runs 62s, re-record; do not ship.
- No talking-head cold open.
- Every 10s block gets a lower-third overlay in cyan (#00E5FF, 24pt sans, 80% opacity) naming the rubric stack.
- Narration budget: ~25-30 words per 10s block. Alex reads at conversational pace, no rush.

## 0-10s — Hook: the ritual

**Screen**: Slack #leadership channel, cursor already in the message box. Type slowly:
```
/council-audit review this PR
```
Do NOT hit enter yet. Hover on it for the last 2 seconds.

**Overlay (0-10s, bottom-left)**: `Council for Slack — one command, three Slack stacks, five voices`

**Narration** (28 words):
> "Every team has the second-opinion ritual. Somebody DMs three people before shipping. Council for Slack makes it native. One command. Watch."

**Cue**: hit enter at 09.5s.

## 10-25s — Stack #1: Slack AI Workflow custom function fires

**Screen**: `/council-audit` triggers the Workflow Builder custom function `council_deliberate`. Cut to the Workflow Builder canvas (pre-staged in an adjacent tab) showing the "Council deliberate" step with a fresh green run indicator. Hold 3s. Cut back to Slack showing "Council convening..." ephemeral.

**Overlay (10-20s)**: `Slack AI Workflow — council_deliberate custom function`

**Overlay (20-25s, second lower-third)**: `Same engine, three Slack surfaces`

**Narration** (40 words):
> "This is the Workflow Builder custom function. Any admin can drop it into any automation, no code. It fires the same engine as the slash command and the MCP server. One primitive, three Slack surfaces."

## 25-45s — Stack #2: MCP server dispatch to 5-voice council

**Screen**: Cut to the verdict rendering in-thread. Five voice cards appear in sequence (they arrive as one message but visually the eye scans top-to-bottom). Highlight the 5 voices with quick cyan pulse overlays on each — 400ms per pulse, staggered.

At 35s cut briefly (2s) to Claude Desktop with the MCP tool picker showing "council-diff" tool card, then back to the Slack verdict.

**Overlay (25-35s)**: `MCP server dispatch — 5 personas in parallel`

**Overlay (35-45s)**: `Same tool card exposed to Claude Desktop, Cursor, Claude Code`

**Narration** (55 words):
> "Five domain-typed personas debate in parallel. Ten seconds. Three cents. The disagreement is the signal. The same council is an MCP server, so the tool card that runs it in Slack also runs it in Claude Desktop and Cursor. Judges can install it in their own workspace with the button in the description."

## 45-60s — Stack #3: Canvas auto-append + verifiable audit trail

**Screen**: Cut to the channel's Canvas tab. Show the new entry auto-appended with timestamp, verdict (WAIT), agreement score (0.78), and per-voice scores. Scroll up 1 line to reveal 2 prior entries above it — the calibrated decision log builds itself.

At 55s, cut to a resolve action (✅ Happened) firing on an older entry. Show Brier score updating to `0.04` in green.

**Overlay (45-55s)**: `Channel Canvas — auto-pinned decision log, Brier-audited`

**Overlay (55-60s)**: `github.com/alex-jb/council-for-slack-2026 · MIT · OSS`

**Narration** (44 words):
> "Every fire auto-appends to the channel Canvas. When reality lands, one click resolves it. Brier score per voice updates. The team learns which voices to trust on which questions. OSS on GitHub. Install link in the description."

## Rehearsal notes

- Alex reads each block out loud with a stopwatch. Target: block 1 ≈ 9s, block 2 ≈ 14s, block 3 ≈ 19s, block 4 ≈ 14s. That leaves 4s of dead-air buffer across the video.
- If block 3 runs long, drop the sentence "Judges can install it in their own workspace with the button in the description." That trims 8 words / ~3s.
- Cyan overlays: use Loom native text overlays, no external editor. Preset `#00E5FF` in the color picker, save as reusable.
- Pre-fire one warm-up `/council` in a scratch channel before recording so the Vercel serverless function is warm — cold start pushes latency to 12-15s and blows the 25-45s block budget.
- Slack workspace pre-stage: `#leadership` channel with 3 prior decisions (GOOGL / pricing / hiring) already logged in Canvas, 1 resolved with Brier 0.04 highlighted. Full pre-stage checklist in `docs/loom-pre-stage-workspace.md`.
- Zoom Slack to 125% so text is readable at Loom's 720p compression.
- Record at 1080p, export at 1080p — do not let Loom auto-downsample.
- Phone in Do Not Disturb, macOS notifications muted, calendar closed.

## Overlay text summary card (for the video editor pass)

| Time | Overlay text | Position | Duration |
|---|---|---|---|
| 0-10s | Council for Slack — one command, three Slack stacks, five voices | Bottom-left | 10s |
| 10-20s | Slack AI Workflow — council_deliberate custom function | Bottom-left | 10s |
| 20-25s | Same engine, three Slack surfaces | Bottom-right | 5s |
| 25-35s | MCP server dispatch — 5 personas in parallel | Bottom-left | 10s |
| 35-45s | Same tool card exposed to Claude Desktop, Cursor, Claude Code | Bottom-left | 10s |
| 45-55s | Channel Canvas — auto-pinned decision log, Brier-audited | Bottom-left | 10s |
| 55-60s | github.com/alex-jb/council-for-slack-2026 · MIT · OSS | Center | 5s |

## Re-record triggers

- Ran over 62s
- Stumbled on a word in blocks 2 or 3 (the rubric-hero blocks)
- Verdict took longer than 12s (cold Vercel — fire a warm-up first)
- Any overlay text mislabeled a stack (e.g. said "RTS" instead of "Canvas")
- Slack showed an unrelated notification
- Cursor visible over a rubric-hero overlay

3-take rule: if takes 1-3 have problems, walk away 30 minutes, come back fresh. Do not grind at 2am.

---

review by Alex before submit
