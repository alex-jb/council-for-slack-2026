# Council for Slack — 60s Loom demo script

> **Rubric note**: Slack guidance says "judges spend 5-7 min total, may not watch past 3 min — the first 60 seconds is where the prize is won". Open on the **Brier audit**, not the deliberation. The audit screen is the differentiator vs every other LLM-debate hackathon entry.

## Hard constraints

- **60 seconds total. Hard cap.** Anything longer = automatic disqualifier in judge attention budget.
- **No talking-head intro.** Open on screen, not on you.
- **Slack workspace ready**: 3 pre-fired `/council` decisions in a #leadership channel, 1 already resolved with Brier score, Canvas pinned at top.
- **No fake data.** Use real fires from the GOOGL case study + 2 founder-domain decisions.

## Shot list (60s = 6 × 10s segments)

### 0-10s — The hook: Brier audit screen

**On screen**: `/council-audit` output already open in Slack. Show 3 logged decisions, 1 resolved with `Brier 0.040 ✅ Happened` highlighted in green.

**VO** (12 words max):
> "Five AI voices. One verdict. Every voice scored against reality when it lands."

### 10-20s — The ritual: type `/council`

**On screen**: Switch to #leadership channel. Type slowly so judges read it:

```
/council :investor long GOOGL into Q3? | Druckenmiller sold all, Berkshire bought $10B
```

Hit enter. Show the "Council convening (investor domain)" ephemeral.

**VO**:
> "Type the decision. Optional context. Optional domain — investor, engineer, founder, six rosters."

### 20-35s — The verdict: 5 voices disagree

**On screen**: ~8s later the verdict lands in channel. **Pause on it for 5 full seconds.** Let judges see:
- `⚠️ WAIT  agreement 78%  investor domain`
- 5 voices with scores: Activist Short 38 → Growth VC 72
- Consensus quote: "right idea, wrong size"

**VO**:
> "Five domain-typed personas debate in parallel. Ten seconds. Three cents. The disagreement is the signal — Activist Short at 38, Growth VC at 72. A single LLM hides that."

### 35-45s — The Canvas: persistent decision log

**On screen**: Click the channel's Canvas tab. Show the new GOOGL entry already appended with timestamp + voices.

**VO**:
> "Every fire auto-appends to the channel's Canvas. The team's decision log builds itself — every voice on every call, calibrated against outcomes."

### 45-55s — The audit loop: Brier score

**On screen**: Type `/council-audit`. Show the pending GOOGL decision with ✅ / ❌ buttons. Click ✅ on an older "should we ship pricing change?" decision. Audit re-renders with `Brier 0.040`.

**VO**:
> "When reality lands, one click resolves it. Brier score per voice. The team learns which voices to trust on which kinds of questions."

### 55-60s — The pitch: OSS + Slack-native

**On screen**: Quick cut to GitHub repo page `github.com/alex-jb/council-for-slack-2026`. Show stars + MIT license.

**VO**:
> "Council for Slack. OSS, MIT, council-diff on npm. Install link in description."

End on logo + URL.

## Recording technical setup

- **Tool**: Loom Desktop, 1080p, full-screen Slack
- **Mic**: USB condenser, no AirPods (compression artifacts)
- **Cursor highlight**: Loom built-in cursor highlight ON
- **No music.** Voice only. Background music makes it sound like every other hackathon submission.
- **Editing**: 1 pass. Cut dead air >0.5s. Don't over-polish.
- **Export**: MP4 + upload to YouTube as **unlisted**, paste link into Devpost. (Loom-hosted is fine too; YouTube survives Devpost embed better.)

## Title + description

**Title**: `Council for Slack — 5 voices, 1 verdict, Brier-audited (60s demo)`

**Description**:
```
Slack-native multi-persona AI council. 5 domain-typed voices debate any decision in ~10s, ~$0.03. Every voice scored against reality at resolution via Brier audit.

Built on council-diff (OSS, MIT, npm). Targeting Slack Agent Builder Challenge 2026.

GitHub: github.com/alex-jb/council-for-slack-2026
council-diff: github.com/alex-jb/council-diff

Day 1-10 built solo over 10 days during the Splunk + Band of Agents hackathon window.
```

## Pre-flight checklist (before hitting record)

- [ ] Slack workspace clean — no test DMs visible in sidebar
- [ ] Channel name = #leadership (not #test or #random)
- [ ] 3 pre-fired decisions in channel: GOOGL · pricing · hiring
- [ ] 1 of them resolved with Brier score
- [ ] Canvas pinned + has 3 entries
- [ ] `/council-audit` runs without error
- [ ] Display sleep disabled (no screen lock mid-record)
- [ ] Phone notifications off (no toast popups in recording)
- [ ] Browser zoomed so text is readable at 720p compressed
- [ ] No Vercel deploy in flight (404 risk during demo)

## Re-record triggers

- Ran >65s
- Stumbled on a word
- Slack showed any unrelated notification
- Verdict took >12s (cold function — fire one warm-up `/council` first)
- Canvas didn't update (manual Cmd+R in canvas tab before recording)

3-take rule: if takes 1-3 all have problems, walk away 30 min, come back fresh. Don't grind. Submission deadline is 7/13.

## Loom thumbnail

Custom thumbnail: screenshot the 5-voice verdict at peak disagreement (GOOGL with the 38↔72 spread visible). Add "5 voices · 1 verdict · Brier-audited" text overlay. The thumbnail loads before any judge clicks play — it's your real opening shot.
