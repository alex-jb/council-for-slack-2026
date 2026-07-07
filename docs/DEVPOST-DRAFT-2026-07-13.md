# Council for Slack — Devpost Submission Draft (2026-07-13)

> **Purpose:** copy-paste-ready submission draft. On submit day (7/13), open Devpost → Slack Agent Builder Challenge → Submit project → paste each field from this file. Verify each URL loads publicly before hitting Submit.

**Last refreshed:** 2026-07-06 (T-7)

**Source of truth:** `docs/devpost-submission.md` — this file is the day-of paste companion with the URLs already filled in against the current deployment state.

---

## Pre-submit checklist (do first, 5 min)

- [ ] Vercel Deployment Protection **OFF** on `council-for-slack` project. Verify: `curl -sI https://council-for-slack.vercel.app/api/health | head -1` returns `HTTP/2 200`, NOT the SSO login wall HTML.
- [ ] `curl -s https://council-for-slack.vercel.app/.well-known/ai-catalog.json | python3 -m json.tool | head -3` returns valid JSON.
- [ ] `curl -s https://council-for-slack.vercel.app/.well-known/mcp-cards/council.json | python3 -m json.tool | head -3` returns valid JSON.
- [ ] Loom recording is uploaded UNLISTED (not private) and Alex has verified the shareable link opens in an incognito window.
- [ ] 4 screenshots saved locally + optionally uploaded to `submissions/` in the repo for backup.
- [ ] `github.com/alex-jb/council-for-slack-2026` is **public** (flip immediately before submit: `gh repo edit alex-jb/council-for-slack-2026 --visibility public`).

If any of the above fail, do NOT submit. Fix first, then submit.

---

## Field-by-field paste map

### 1. Project name

```
Council for Slack
```

### 2. Tagline (max 200 chars)

```
5 voices, 1 verdict, every voice scored against reality at resolution. The second-opinion ritual native to Slack — 10 seconds, ~$0.03 a fire, Brier-audited over time.
```

### 3. Elevator pitch (Devpost calls this "Project Description")

Copy the full description from `docs/devpost-submission.md` § "Description (the long version)". Verified copy-paste-ready as of 2026-07-06. No edits since 2026-06-16.

### 4. Built With (tags)

```
typescript, nextjs, slack-bolt, anthropic-claude, mcp, workflow-builder, slack-canvas, supabase, vercel, council-diff
```

### 5. How we built it

Copy from `docs/devpost-submission.md` § "Built".

### 6. Challenges we ran into

Copy from `docs/devpost-submission.md` § "Challenges".

### 7. What's next

Copy from `docs/devpost-submission.md` § "What's next".

### 8. Try it out URL

```
https://council-for-slack.vercel.app
```

Verify before submit: opens without the SSO wall + shows the OAuth install button.

### 9. Repository URL

```
https://github.com/alex-jb/council-for-slack-2026
```

Verify before submit: repo is public. If it's still private on 7/13, flip it first: `gh repo edit alex-jb/council-for-slack-2026 --visibility public`.

### 10. Video demo URL

Loom URL — fill in from the recording Alex uploaded 7/6-7/10.

### 11. Cover image

Use `submissions/cover-image.png` if present, else grab the first 4-panel screenshot Alex captured. Devpost accepts PNG + JPG.

### 12. Additional images (4-panel gallery)

Upload the 4 screenshots Alex captured:
1. `/council` slash command result (5-voice verdict in a real channel)
2. Channel Canvas with the decision auto-appended
3. Workflow Builder custom step ("Council deliberate") dropped into a workflow
4. MCP tool visible in Claude Desktop tool picker

### 13. Team members

Alex Xiaoyu Ji (solo)

### 14. Track / Category

**Best New Slack Agent** (custom-function apps cannot be Marketplace-listed per Slack docs — this is the track, not Slack Agents for Orgs). Verify the track name on the Devpost submission page matches; if it changed, pick the closest banking-agent adjacent category.

### 15. Testing / Judge instructions

If Devpost has a "Judging instructions" or "Testing notes" field:

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
  (Public distribution activated pre-deadline. Redirect URI + all scopes documented in the repo's manifest.json.)

3 rubric-required technologies verified:
  1. Workflow Builder custom function (council_deliberate) at packages/functions/council_deliberate.ts
  2. MCP server tool card at /.well-known/mcp-cards/council.json
  3. Slack Canvas API (auto-append after every verdict, one Canvas per channel per decision thread)
```

### 16. Confirmations (final checkboxes before Submit)

- [ ] Alex is on the Devpost hackathon page and reads the submission-deadline countdown timer showing >0 hours left.
- [ ] All URL fields load publicly in an incognito tab.
- [ ] Loom URL plays in an incognito tab and shows the 3 rubric-required technologies.
- [ ] Cover image + 4 gallery images uploaded successfully (Devpost preview renders them).
- [ ] All required fields have content.
- [ ] Click Submit.

---

## Post-submit verification (~2 min)

1. Devpost dashboard → "My Submissions" → "Council for Slack" shows Submitted status.
2. Take a screenshot of the confirmation page (evidence in case Devpost email confirmation is delayed).
3. Post a lightweight LinkedIn / X update linking to the public repo + demo URL (no aggressive promotion until the hackathon judging ends).

---

## Reference

- Source of truth: `docs/devpost-submission.md`
- Runbook: `docs/SUBMISSION-RUNBOOK-7-13.md`
- 1-pager: `docs/submission-1pager.md`
- Loom script: `docs/loom-script.md`
- Pre-stage workspace: `docs/loom-pre-stage-workspace.md`
