# Council for Slack — 60s Loom rehearsal companion

> Pairs with `docs/loom-script.md` (shot list + VO copy) and `docs/loom-pre-stage-workspace.md` (workspace state). This file is the rehearsal-and-recording discipline so Alex does not discover problems after 5 takes.

## Pre-flight (run once, ≤ 10 min, day-of)

- [ ] `ANTHROPIC_API_KEY` is the **rotated** one, not the one exposed in the Fable 5 audit. Confirm via `echo $ANTHROPIC_API_KEY | head -c 12` matches the rotated prefix.
- [ ] Slack workspace prestaged per `docs/loom-pre-stage-workspace.md`. 3 `/council` fires in `#leadership`, 1 already resolved with green Brier, Canvas pinned at top.
- [ ] Slack font scaled large enough to read in a 1080p Loom thumbnail. Cmd-+ until messages fill 70%+ of the channel width.
- [ ] No notifications: Slack DND on, system DND on, Loom captures **window only** (not full screen — keeps competing notifications out of the frame).
- [ ] Audio test: record a 5s test clip, listen back. Confirm no echo, no fan noise, no compression artifact.
- [ ] One pre-staged decision typed into a text editor so you can Cmd-V at the 10-20s mark, not type live.

## Voice delivery — read aloud once before recording

Read the full VO (from `docs/loom-script.md`) at normal pace with a timer. Target = 50-55 spoken seconds, leaving 5-10s for on-screen pauses. If your read-through is longer than 55s, **cut adjectives** in the script before recording, do not race the clock.

The single most important pause is **5 full seconds on the verdict screen** at 20-35s. Pre-decide not to fill that silence with a "you know" or a breath. The pause IS the demo.

## Recording rules

- **One take rule**: each segment (0-10s, 10-20s, 20-35s, 35-45s, 45-60s) gets at most 2 takes. Past that, you are overthinking it. Use the best of the 2.
- **No re-cuts mid-segment**: if you fumble, restart the segment.
- **No edits in post except trim**: judges trust unedited demos more than polished ones. Trim leading + trailing dead air only.
- **Audio levels**: keep VO ~12dB below clipping. Loom records 16-bit so you have headroom.

## After recording

1. Watch back at 1× speed. Then at 1.5×. If 1.5× still feels rushed, you talked too fast — re-record.
2. On-screen text bottom-right last 5 seconds:
   - `github.com/alex-jb/council-for-slack-2026`
   - `Add to Slack — link above`
3. Upload to Loom, sharing = "anyone with link, no signup required".
4. Paste the link into `docs/devpost-submission.md` next to the Loom placeholder.
5. Submit to Devpost with the 250-word body from `docs/submission-1pager.md`.
6. After submission goes live, queue marketing drafts (HN / X / dev.to / LinkedIn) from `~/.marketing_agent/queue/pending/2026-06-25-council-for-slack-public-launch.md`.

## Backup soundbite if you draw a blank

If you lose your place anywhere in the 60 seconds, this single line carries the submission:

> "Five voices, one verdict, every voice scored against reality. Slack already has the decisions — we just made them auditable."

Deliver that anywhere in the 60 seconds and you have a submittable Loom.

## Why this Loom should win the "3+ agents in Slack" track

| Strength | Most other submissions probably lack |
|---|---|
| Brier audit open first 10s (calibration, not theater) | Multi-agent demos that never measure whether the vote was right |
| 6 domain rosters (investor / engineer / founder / etc.) typed on a slash flag | Generic "multiple LLMs disagree" with no domain typing |
| Canvas auto-append builds the team decision log over time | One-shot demos with no persistence story |
| `/council-audit` shows real production data, not fixture | Demoware that was built that week with no test record |
| Workflow Builder custom function (`council_deliberate`) hits Slack's specific 2026 platform play | Bolt-only apps that ignore Workflow Builder + custom functions |
| MIT, public repo, calibration audit running weekly via cron | Closed-source or "we will open source after winning" |

## Submission countdown gates

- 7/6 9:03 AM ET — macOS reminder fires. Record by EOD.
- 7/6 EOD — Loom uploaded + Devpost draft saved.
- 7/13 — Final Devpost submission.
- 7/14 onward — public launch fires across HN / X / dev.to / LinkedIn / Reddit / Slack community.

If recording slips 7/6 → 7/7 it is fine. If it slips past 7/10 it is a 5-alarm fire; lock 2h on the calendar that day, do not move.
