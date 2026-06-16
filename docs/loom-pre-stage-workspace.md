# Loom recording — workspace pre-stage guide

> Companion to [`loom-script.md`](./loom-script.md). What to fire/setup in the AJ Bot workspace **before hitting record** so the 60s demo lands smooth in one or two takes.

## Why pre-stage

The 60s script opens on `/council-audit` showing 3 logged decisions, 1 resolved with Brier score, Canvas pinned. **None of that exists in a fresh workspace.** You need to fire 3 specific decisions ahead of time and resolve one. Allow ~10 minutes of pre-stage; cheaper than re-recording 5 takes because the audit was empty.

## Workspace setup (one-time, 5 min)

1. **Create or rename a channel to `#leadership`** in AJ Bot workspace
   - The script's voiceover names this channel; the URL bar shows the channel name on capture
   - If `#leadership` is taken, use `#decisions` and update voiceover line 1

2. **Invite the bot to the channel**
   ```
   /invite @council
   ```
   ✅ Required for Canvas API. Without it, canvas auto-append fails silently.

3. **Confirm Canvas tab works**
   - Top of channel → click Canvas icon → should open empty Canvas
   - If Slack prompts "Standalone canvas is a paid feature, free trial until July 14" — accept the trial. The hackathon deadline is 7/13 so this is free.

## Pre-fire 3 decisions (5 min)

Fire in this order so the audit shows time-descending newest-first. Use the **founder** domain (default — no `:investor` prefix needed) so the same 5 voices appear in each, making the audit visually consistent.

### Decision A — to be resolved as ✅ Happened (will show Brier score)

```
/council Should we ship the bigger discount on the enterprise deal? | $80K ACV deal, customer wants 20% off list, sales rep says it's their #3 priority deal this quarter and they've quoted at 15% before
```

Wait ~10s for verdict. Note the `decision_id` (8-char ID).

### Decision B — to remain pending (will show ✅ / ❌ buttons in audit)

```
/council Should I take on the design lead role even though I'd rather code? | First management offer, $40K bump, but I love writing code and the team has 2 ICs reporting to me
```

Wait ~10s.

### Decision C — to remain pending

```
/council :investor Long GOOGL into Q3? | Druckenmiller exited the position entirely, Berkshire opened $10B, DOJ Chrome divestiture timeline still unclear, TPU + Waymo growth strong
```

Wait ~10s. **This is the GOOGL case study** — judges who read the README will recognize it.

## Resolve Decision A (1 min)

1. Type `/council-audit`
2. Find Decision A at the bottom (oldest of 3)
3. Click ✅ **Happened**
4. Audit re-renders. The Decision A row now shows `Brier ~0.04` (lower = better)
5. **The new Day 11 calibration header appears** — `:dart: excellent — avg Brier 0.040 across 1 resolved` or similar

✅ Now `/council-audit` shows what the script expects in segment 0-10s.

## Verify Canvas (1 min)

1. Click the Canvas icon at the top of `#leadership`
2. **Should see 3 entries** — one per fire above, each with:
   - Unicode emoji (⚠️ for WAIT, ✅ for GO, etc.)
   - timestamp
   - decision text in blockquote
   - voices summary line

❌ If Canvas is empty:
- Bot wasn't in channel when you fired (fix: invite + redo)
- Canvas markdown bug regression (unlikely after fix `f1480d8`)

## Pre-flight before hitting record

- [ ] `#leadership` channel exists, bot is in
- [ ] 3 decisions logged (A resolved, B + C pending)
- [ ] `/council-audit` shows the calibration header
- [ ] Canvas tab has 3 entries visible
- [ ] Sidebar shows clean channel list (no spammy `#test-1`, `#mlbot-debug`, etc.)
- [ ] Display sleep disabled (System Settings → Battery → Lock Screen → set to Never for the recording window)
- [ ] All toast notifications silenced (Slack: snooze 1h; phone: DND; Chrome: extension popups disabled)
- [ ] Browser zoomed to ~125% so text is readable in compressed video
- [ ] No Vercel deploy in flight (no orange "Ready to deploy" banner)
- [ ] One warm-up `/council` fire 1 min before record (so the next fire isn't a cold function call)

## Exact text to read aloud (synced to script)

Open `loom-script.md` in a second window. Read VO lines verbatim — they're already tested for 60s pacing.

Script segments paired with screen actions:

| Time | What's on screen | What you say |
|---|---|---|
| 0-10s | `/council-audit` showing Decision A resolved with ✅ Happened + Brier | "Five AI voices. One verdict. Every voice scored against reality when it lands." |
| 10-20s | switch to #leadership, type the GOOGL `/council :investor` slow | "Type the decision. Optional context. Optional domain — investor, engineer, founder, six rosters." |
| 20-35s | verdict lands; pause 5s on the 5 voices + agreement % | "Five domain-typed personas debate in parallel. Ten seconds. Three cents. Activist Short at 38, Growth VC at 72. A single LLM hides that." |
| 35-45s | click Canvas tab; show the new GOOGL entry appended | "Every fire auto-appends to the channel's Canvas. The decision log builds itself." |
| 45-55s | `/council-audit`, click ✅ on Decision B, audit re-renders | "When reality lands, one click resolves it. Brier score per voice. The team learns which voices to trust." |
| 55-60s | quick cut to GitHub repo page showing MIT + stars | "Council for Slack. OSS, MIT, on npm. Link in description." |

## After recording

1. **Reset workspace** if you want a clean second take: delete the 3 decisions via Supabase Dashboard or just delete the channel
2. **Upload to YouTube as Unlisted** (Devpost embed survives YouTube better than Loom-hosted)
3. **Custom thumbnail**: screenshot the moment when GOOGL verdict shows the 38↔72 voice spread. Crop, add white "5 voices · 1 verdict · Brier-audited" overlay. Set in YouTube studio.
4. **Description for Devpost paste**:
   ```
   Council for Slack — 5 voices, 1 verdict, Brier-audited (60s)
   github.com/alex-jb/council-for-slack-2026
   ```

## Common re-record triggers

| Problem | Fix |
|---|---|
| Verdict took >12s | warm-up fire 1 min before, then retake |
| Slack desktop notification popped up | DND in Slack + close Mail / Messages / Signal |
| Voice cracked / "uh" | the 3-take rule. Stop after take 3, walk 30 min. |
| Canvas didn't update | bot not in channel; invite and retake |
| Cursor went to wrong place during type-out | slow down; pre-position cursor in slash command box during the 0-10s segment |
| Browser zoom too small | Cmd+ once or twice. 125% is the sweet spot |

## Estimated time budget

- Pre-stage: 10 min (workspace setup + 3 fires + 1 resolve + Canvas verify)
- 3 takes: 5 min
- Edit (Loom built-in trim only): 5 min
- Upload + thumbnail + description: 10 min

**Total: 30 minutes from "hit pre-stage" to "Loom URL in Devpost".**
