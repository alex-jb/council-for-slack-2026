# Council for Slack — 7/13 Submission Runbook

> **Single source of truth for submission day.** Everything else (`loom-script.md`, `devpost-submission.md`, `submission-1pager.md`, `loom-pre-stage-workspace.md`, `loom-rehearsal-2026-07-06.md`) feeds into this. If a field changes here, sync it back to its source doc.
>
> **Submission deadline**: 2026-07-13 (Devpost cutoff TBC on hackathon page; treat 23:59 ET as the floor).
> **Recording window**: 7/6 9:03 AM ET reminder fires. Hard "5-alarm fire" by 7/10. Hard final 7/12 EOD.

## T-minus calendar

| Date | Gate | Action | Time |
|---|---|---|---|
| **7/6** | Reminder fires | Record Loom + take 4 screenshots; upload Loom unlisted | 2h |
| **7/7-7/9** | Buffer | Re-record if take 1-3 had problems. Walk-30-min rule applies. | 0-2h |
| **7/10** | 5-alarm | If no Loom yet, lock 2h on calendar. Cannot move. | 2h |
| **7/12 EOD** | Final draft | Devpost form completely filled, links live, embed plays. | 30 min |
| **7/13** | Submit | Hit Submit. Verify submission appears in your Devpost dashboard. | 5 min |
| **7/14+** | Public launch | `gh repo edit --visibility public` + fire 6 launch drafts. | 1h |

---

## Pre-flight — run once before 7/6 (≤ 30 min)

These can be done any time in the 7-day window before 7/6 to remove day-of risk.

### 1. Workspace state verified

```bash
# All five should return 200:
# (1) live deployment
curl -s -o /dev/null -w "%{http_code}\n" https://council-for-slack.vercel.app/api/health
# (1a) ARD ai-catalog (added 2026-06-28 — judges will check this)
curl -s -o /dev/null -w "%{http_code}\n" https://council-for-slack.vercel.app/.well-known/ai-catalog.json
# (1b) ARD mcp-cards (added 2026-06-28 — judges will check this)
curl -s -o /dev/null -w "%{http_code}\n" https://council-for-slack.vercel.app/.well-known/mcp-cards/council.json

# IF any of (1a)/(1b) return 404, the canonical alias is stuck on an old
# deploy (Vercel UNKNOWN-status flag bug). Fallback for Devpost: substitute
# the latest unique deploy URL from `vercel ls` — it serves the same code.
# Example fallback URL pattern: council-for-slack-<SHA>-alex-jbs-projects.vercel.app

# (2) Slack manifest installed in AJ Bot workspace
# Check at https://api.slack.com/apps/A0BAVEM5SS0/general → look for "Installed" green dot

# (3) Anthropic key is rotated (not the Fable 5 leaked one)
echo $ANTHROPIC_API_KEY | head -c 12
# expected prefix is the rotated key — NOT sk-ant-api03-_KdaUL... (that one was leaked)
```

### 1b. Vercel UNKNOWN-status workaround (added 2026-06-28)

Known issue since 2026-06-23: production deployments stick on `Status: UNKNOWN` in `vercel ls` and `vercel alias set` returns `Error: The deployment is not ready` even after the deployment is serving traffic correctly. Direct unique URL (`council-for-slack-<sha>-alex-jbs-projects.vercel.app`) works; the canonical alias does NOT auto-promote.

If the canonical alias is still stuck on submission day:

1. **Confirm new deploy is healthy** — `curl -o /dev/null -w "%{http_code}" https://council-for-slack-<latest-sha>-alex-jbs-projects.vercel.app/api/health` returns 200.
2. **Substitute the unique URL in the Devpost form** for every public link (live demo, ARD endpoints, MCP card). Do NOT block submission on alias promotion.
3. **Retry alias promotion in background** — `while ! vercel alias set <sha-url> council-for-slack.vercel.app; do sleep 120; done` — when it eventually clears, swap back.

### 2. Supabase RPCs respond

```bash
# In any project shell with Supabase access:
psql "$DATABASE_URL" -c "select count(*) from council.decisions;"
# expected: number ≥ 3 (the pre-staged decisions from Day 5 testing)
```

If 0, fire 3 `/council` calls in the workspace before recording.

### 3. Repo public-ready (run on 7/14, not before)

```bash
# DO NOT run this until 7/14. Keep repo private during judging window.
gh repo edit alex-jb/council-for-slack-2026 --visibility public \
  --accept-visibility-change-consequences
```

---

## Recording day (7/6 — 2h block)

### Hour 1 — pre-stage + rehearse

Open in 4 tabs:
1. `docs/loom-pre-stage-workspace.md` ← fire 3 decisions + resolve 1
2. `docs/loom-script.md` ← 60s shot list
3. `docs/loom-rehearsal-2026-07-06.md` ← recording discipline rules
4. Slack workspace `#leadership` channel

Run pre-stage fires (~10 min). Read VO aloud once with timer (~3 min). Cmd-+ Slack font until messages fill 70% of channel width. DND on. Window-only capture.

### Hour 2 — record + upload + screenshots

Record 1-3 takes max per segment. If stumbled, restart that segment. Trim leading/trailing dead air only.

Take **4 screenshots** in the same workspace during/after recording:

| File | Slack screen | Required state |
|---|---|---|
| `docs/screenshots/council-fire.png` | `/council` verdict in `#leadership` | 5 voices visible, agreement score visible |
| `docs/screenshots/council-audit.png` | `/council-audit` Block Kit history | At least 1 resolved (Brier shown) + 2 pending (✅/❌ buttons) |
| `docs/screenshots/workflow-builder-step.png` | Workflow Builder picker | `Council deliberate` custom step visible. **If Free-plan sandbox blocks this, screenshot the Slack docs page showing the function is registered + note in caption.** |
| `docs/screenshots/canvas-decision-log.png` | Channel Canvas tab | 3+ entries auto-appended, timestamped |

Upload Loom **unlisted**. Title:
```
Council for Slack — 5 voices, 1 verdict, Brier-audited (60s demo)
```

Paste Loom URL into `docs/devpost-submission.md` line 101 (the `{paste YouTube/Loom URL...}` placeholder).

---

## Devpost form fill — 7/12 EOD (30 min)

Open https://devpost.com → Slack Agent Builder Challenge → Submit a project.

Paste from `docs/devpost-submission.md`:

| Devpost field | Source |
|---|---|
| Project name | line 7 |
| Tagline | line 11 |
| Built With | line 16 |
| Description | lines 24-43 (the long version) |
| How we built it | lines 47-62 |
| Challenges | lines 66-72 |
| What's next | lines 76-82 |
| Try it out URL | line 87 |
| Repository URL | line 95 |
| Video demo URL | **line 101 — paste Loom link here first, THEN copy** |
| Image gallery | upload 4 PNGs from `docs/screenshots/` |

Then under "Built for hackathon": select Slack Agent Builder Challenge. Under "Tracks": select **Best New Slack Agent**. Do NOT select Slack Agents for Orgs (Marketplace blocks custom-function apps).

---

## Backup demo plan — if Loom fails

If recording on 7/6 + 7/10 + 7/12 all produced unusable takes (Slack notifications, audio glitches, function timeouts during demo, etc.), submission still ships with these 4 fallbacks:

### Fallback 1 — case-study PDF "static demo"

**Already built and committed at `docs/case-studies/four-fires-static-demo.pdf`** (25 pages, ~456 KB). 4 real fires: crypto-payments KILL / annual-billing GO / GOOGL WAIT / Rust-rewrite WAIT. Full voice-by-voice output, agreement scores, consensus quotes.

To regenerate after any case-study edit:

```bash
cd ~/Desktop/council-for-slack-2026
bash scripts/build-static-demo-pdf.sh
```

Pipeline is pandoc → HTML → Chrome headless `--print-to-pdf` (same chain as the Jason / Professor / YU Dean decks). Branded title page, cyan accent borders, midnight indigo headers. ~30 seconds end-to-end.

Embed link in Devpost description: "Live demo deferred — see [`docs/case-studies/four-fires-static-demo.pdf`](https://github.com/alex-jb/council-for-slack-2026/blob/main/docs/case-studies/four-fires-static-demo.pdf) for 4 real fires across the full GO/WAIT/KILL spectrum."

### Fallback 2 — judge clone-and-run instructions

`docs/submission-1pager.md` lines 33-43 already has the "Verify in 90 seconds" git clone path. Lead with that in the description.

### Fallback 3 — pre-recorded screen captures (no VO)

If audio is the failure mode but video works, ship the silent 60s as-is. Judges can read VO from on-screen text overlays — Loom auto-adds captions.

### Fallback 4 — submit with placeholder video link

Devpost accepts submissions with a `loom.com/share/{will-add-by-deadline}` placeholder. Update before 7/13 23:59 ET.

---

## Final-day verifications — 7/13 ≤ 2h before deadline

Run these 4 in order. Any failure = stop and fix before submitting.

### Check 1 — repo URL loads

```bash
curl -sI https://github.com/alex-jb/council-for-slack-2026 | head -1
# expected: HTTP/2 200 (after 7/14 public flip) OR HTTP/2 404 (still private — that's fine pre-7/14)
```

If 404 + you've already flipped to public, run `gh repo view alex-jb/council-for-slack-2026 --json visibility`.

### Check 2 — Loom link plays

Open the Loom URL in an incognito window. Confirms public unlisted, not "login required."

### Check 3 — live install link works

```bash
# Visit https://council-for-slack.vercel.app/install in incognito
# Should redirect to slack.com/oauth/v2/authorize, NOT 404 or 500
```

### Check 4 — Devpost preview

Hit "Preview" on Devpost before "Submit." Confirm 4 screenshots show, Loom embeds, all 7 text fields render markdown correctly.

---

## After submission — within 1h

```bash
# 1. Tweet a thread (1-pager template in docs/distribution-2026-06-16-googl.md)
# 2. Post to HN (after submission appears in Devpost gallery — judges sometimes browse HN before scoring)
# 3. Fire marketing-agent launch drafts
~/.marketing_agent/cli.sh fire 2026-06-25-council-for-slack-public-launch.md
```

---

## What gets DEFERRED (not blockers)

These are nice-to-have but explicitly do NOT block 7/13 submission:

- ❌ AMD MI300X portability proof (lab credit not granted)
- ❌ Real-Time Search API integration (`search:read` beta queue 2+ months)
- ❌ Cross-workspace calibration leaderboard (post-judging feature)
- ❌ Slack Marketplace listing (structurally blocked for custom-function apps)
- ❌ Slack Developer Sandbox provisioning (Free-plan manifest works without it)

Mention all 5 in the Devpost "What's next" section so judges see honest scope discipline.

---

## Single-line backup soundbite for the Loom

If you lose your place anywhere in the 60s, deliver this line. It carries the submission:

> "Five voices, one verdict, every voice scored against reality. Slack already has the decisions — we just made them auditable."

Source: `docs/loom-rehearsal-2026-07-06.md` line 42.

---

*Last updated 2026-06-19 — runbook compiled from 8 individual docs. Don't fork the source-of-truth fields (deadline, app ID, URLs) here; sync from upstream docs and link.*
