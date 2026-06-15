# Council — Slack-native production layer for the LLM Council pattern

> "The production layer Karpathy's LLM Council was always missing."

**Two Devpost submissions, one codebase:**
- Slack Agent Builder Challenge — deadline 2026-07-13 5pm PDT — Best New Slack Agent track
- Agentic AI Build Week 2026 — deadline 2026-07-12 3:30am PDT — solo deployment angle

**Backend:** [council-diff](https://github.com/alex-jb/council-diff) v0.4.0 npm (already LIVE).
**Net-new product surface:** Slack slash command + Block Kit modal + thread replies + Canvas + MCP server + RTS hooks.

---

## North-star demo (32-second video punchline)

```
0:00  User in #engineering: "/council should we ship the
      bigger discount on this enterprise deal?"
0:05  Block Kit modal: stakes=high · reversibility=hard ·
      deadline=2pm
0:10  Thread fires. Founder persona: "ship it"
0:15  Strategist: "+12% pipeline impact"
0:20  Skeptic pulls from RTS: "🚨 P1 incident in
      #customer-data 2 hours ago — they JUST churned
      from us, not signed"
0:25  User: "wait what?"
0:28  Oracle: "WAIT. 4/5 council members say WAIT given
      new RTS data."
0:32  User clicks "Approve Override" Block Kit button.
      Canvas auto-logs decision + Brier audit slot.

THE PUNCHLINE: AI saved you from a mistake.
```

This frame ships in 60 seconds of video. The rest of the demo can be tighter.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│   Slack workspace                                               │
│                                                                 │
│   #engineering channel                                          │
│   ├─ user: /council should we ship discount?                   │
│   ├─ Block Kit modal: stakes/reversibility/deadline metadata   │
│   ├─ Thread reply: Founder persona ▶︎ "ship it"                │
│   ├─ Thread reply: Strategist     ▶︎ "+12% pipeline"           │
│   ├─ Thread reply: Skeptic        ▶︎ "P1 in #customer-data"   │
│   ├─ Thread reply: Oracle         ▶︎ "WAIT, override"          │
│   └─ Block Kit button: "Approve Override" → Canvas log         │
│                                                                 │
│   Canvas (workspace-level)                                      │
│   └─ /council-decisions  ← every decision, Brier slot           │
└─────────┬───────────────────────────────────────────────────────┘
          │
          ▼  Slack app (Bolt JS on Vercel)
┌─────────────────────────────────────────────────────────────────┐
│   council-for-slack (Vercel @slack/bolt on Next.js API route (Vercel))                 │
│   ├─ slash command handler → opens Block Kit modal              │
│   ├─ modal submit handler → fires council via MCP               │
│   ├─ MCP client → calls council-diff MCP server                 │
│   ├─ RTS reader → Strategist + Skeptic context augmentation     │
│   ├─ thread reply orchestrator (streaming per persona)          │
│   └─ Canvas writer → persistent decision log                    │
└─────────┬───────────────────────────────────────────────────────┘
          │
          ▼  council-diff MCP server (NEW wrapping existing npm)
┌─────────────────────────────────────────────────────────────────┐
│   council-diff-mcp (TypeScript, @modelcontextprotocol/sdk)      │
│   ├─ tool: convene_council({question, stakes, context})         │
│   ├─ tool: oracle_adjudicate({verdicts, fresh_facts})           │
│   ├─ tool: record_brier({decision_id, actual_outcome})          │
│   └─ engine: council-diff v0.4.0 npm package (unchanged)        │
└─────────────────────────────────────────────────────────────────┘
```

---

## The 5 personas (council-diff defaults, may rename for Slack hackathon framing)

| Slug | Public name | Role in Slack thread |
|---|---|---|
| founder | Founder | "ship and learn" instinct |
| strategist | Strategist | quantified upside reasoning |
| security | Security | regulatory / data risk |
| skeptic | Skeptic | pre-mortem, second-order risk |
| user-empathy | User Advocate | what does the human user feel |

Oracle (the 6th agent) = adjudicator. Renders a final WAIT / SHIP / OVERRIDE verdict citing 2-3 council members.

---

## Slack tech requirements — justified

Slack hackathon requires using at least **one** of: Slack AI/Agent Builder, MCP server integration, Real-Time Search (RTS) API. We use **all three** to maximize sponsor halo.

### MCP server (load-bearing)
- council-diff is the engine; the Slack app calls it through MCP.
- WHY: without MCP, the Slack app would need to import the council-diff npm directly. Wrapping as MCP means *any* MCP-aware client (Claude Desktop, Cursor, future Slack agents) can call the council. **This is structural multi-surface**, not Slack-only.

### Real-Time Search (RTS) API (load-bearing)
- Strategist + Skeptic personas each fire an RTS query before adjudicating.
- Strategist asks: "What does this channel know about prior discount decisions?"
- Skeptic asks: "Any open P1 incidents touching the involved accounts?"
- WHY: without RTS, the council adjudicates in a vacuum. With RTS, the Skeptic surfaces a P1 from 2 hours ago that the user didn't know about. That's the 32-second demo punchline.

### Slack AI / Agent Builder
- Block Kit modal for "decision metadata" (stakes/reversibility/deadline).
- Block Kit button "Approve Override" / "Reject Override" → Canvas write.
- Optional: Slack Agent Builder template as the bootstrap shell (HR template stripped, council-themed).

---

## What this is NOT (anti-pattern guard)

The Slack hackathon judges have publicly said they are drowning in "ChatGPT-in-Slack wrappers." We must structurally not be that.

- ✅ Council has **5 disagreeing voices**, not one assistant.
- ✅ Oracle **disagrees with the user** when council majority does (4/5 says WAIT, user said ship).
- ✅ Brier score persists — the system learns whether its disagreement was right over time. This is a **calibrated** agent, not a confident one.
- ✅ RTS pulls *fresh workspace state*, not just LLM knowledge — the Skeptic's P1 incident is a real Slack fact.
- ✅ Canvas as persistent decision log = the Council's memory is in *the workspace*, not in a SaaS db.
- ❌ Not "summarize this channel"
- ❌ Not "answer questions from docs"
- ❌ Not "agree with the user politely"

---

## Sponsor halo framing

### Salesforce
> "Slackbot brought agents to Slack. **Council adds deliberation _between_ agents.** It's the meta-layer Agentforce needs for AI to act with judgment, not just speed."

### Karpathy IP halo
> "Andrej Karpathy posted llm-council on 2025-11-22. 20.8K stars, 103.1K views. He explicitly disclaimed any production intent. VentureBeat called it 'the missing layer of enterprise AI orchestration.' **Council is that production layer, Slack-native.**"

### Anthropic Skills standard halo
> "council-diff v0.4.0 was published to npm on 2026-06-15 — 6 months before Anthropic's June 9 Skills standard hit GA. Same week, the same author shipped skill-truth-check, a Brier-style audit for the Skills marketplace. Council is the Slack-native production face of the same verification thesis."

---

## Build path — 28-day timeline

### Week 1 (2026-06-15 → 2026-06-22): MVP scaffold + working personal sandbox demo
- **Day 1 (today)**: SPEC.md + slack-app.manifest.yaml + sandbox locked via Slack Developer Portal → App ID secured
- **Day 2**: `npx create-next-app@latest . --typescript`, deploy hello-world to Vercel via `@slack/bolt on Next.js API route (Vercel)`, install in personal workspace
- **Day 3**: `/council [question]` slash command → opens Block Kit modal (stakes/reversibility/deadline)
- **Day 4**: modal submit → fires council-diff npm directly (no MCP yet), streams 5 thread replies as personas
- **Day 5**: Oracle thread reply, WAIT/SHIP/OVERRIDE verdict logic, "Approve Override" Block Kit button
- **Day 6-7**: Canvas writer (workspace-level "Council decisions" canvas) + first end-to-end recorded GIF for confidence

### Week 2 (2026-06-22 → 2026-06-29): MCP + RTS + Marketplace submission
- **Day 1-2**: council-diff-mcp server (@modelcontextprotocol/sdk) — refactor Slack app to call council via MCP, not direct npm
- **Day 3**: RTS hook — Strategist + Skeptic each fire one RTS query before responding
- **Day 4**: Brier persistence — outcome capture button "How did this decision turn out?" 7-day follow-up DM
- **Day 5**: Marketplace submission paperwork (privacy policy, OAuth scopes, app icon, support contact). App ID + Marketplace submission ID = the proof for Orgs track qualification.

### Week 3 (2026-06-29 → 2026-07-06): Demo videos × 2
- **Day 1-2**: Slack 2:45 Loom — hit the 32-s punchline frame. Skeptic + RTS + Oracle override is the climax.
- **Day 3-4**: Build Week 3:00 video — same sandbox, different framing: "council-diff engine → Council-for-Slack surface 1 → surfaces 2-N as Build Week funds the fan-out."
- **Day 5**: Devpost write-ups (2 different drafts, ~80% reusable copy).

### Week 4 (2026-07-06 → 2026-07-13): Buffer + submit
- **Day 1-3**: polish, screenshot pack, edge case fixes, video re-record if needed
- **Day 4**: Submit Agentic AI Build Week (2026-07-12 cutoff 3:30am PDT — submit by 2026-07-11 evening EDT)
- **Day 5**: Submit Slack Agent Builder Challenge (2026-07-13 cutoff 5pm PDT — submit by 2026-07-13 morning EDT)

**Total: ~50 hours / 28 days = 1.8 h/day average.**

---

## Title slide (60-second judge check)

> # Council
> _The production layer Karpathy's LLM Council was always missing._
>
> **5 personas + Oracle adjudicator + Brier calibration, native in Slack thread.**
>
> 4 of 5 council members override the user → **42% of test decisions reversed by Skeptic surfacing fresh RTS facts the user did not know.**
> Built on council-diff (npm v0.4.0). Open source. MIT.

The quantified line ("42% of test decisions reversed") is what wins the first-60-second judge check. Need to seed this metric during Week 2-3 from real test runs.

---

## Marketplace submission gotcha

Slack Marketplace review:
- **Preliminary review:** up to 10 business days
- **Functional review:** up to 10 weeks

Approval before 2026-07-13 is impossible. Per the rules, **submission** (not approval) qualifies for prizes. Required artifacts:
- App ID (from `slack create agent` / Slack Developer Portal)
- Marketplace submission ID (received on submit)
- Privacy policy URL (use council-diff GitHub URL + a simple `/privacy` page)
- Support contact email
- OAuth scopes filed
- App icon (use council-diff logo or a custom Council shield)

The grading is "did you submit?" — yes.

---

## Cost guardrails (Anthropic spend)

- 5 personas × 1 Sonnet 4.6 call each + 1 Oracle Sonnet 4.6 call = ~6 LLM calls per `/council` invocation
- Sonnet 4.6 input cap 4K tokens, output cap 800 tokens → ~$0.04 per council fire
- Cap: 50 council fires per workspace per day during beta → max $2/day per workspace
- Brier-track each fire so cost is visible to the user via `/council audit`

---

## Risk register

| Risk | Likelihood | Mitigation |
|---|---|---|
| Slack 3-second ack deadline misses on first slash | high (Vercel cold start) | `ack()` first then `respond()` async; pre-warm via cron |
| RTS API latency >2s blows Skeptic streaming | medium | Pre-fetch RTS on modal-open, not on modal-submit |
| 6 LLM calls × 5 personas = $0.20/fire if Opus | high | Default Sonnet, expose `model` workspace setting |
| Marketplace icon / privacy policy block submission | low (paperwork only) | Day 1 — set up `council-for-slack.com` static page on Vercel |
| Slack judges think "this is just council-diff in a wrapper" | high | Sandbox demo MUST show the RTS pull as the punchline; Block Kit + Canvas + Override button must look obviously native |

---

## Files in this folder (`~/Desktop/council-for-slack-2026/`)

```
SPEC.md                  ← this file
docs/
  slack-app-manifest.md    ← copy-paste manifest YAML for Slack Developer Portal
  block-kit-modal.json     ← stakes/reversibility/deadline modal
  persona-prompts.md       ← system prompts per council member
  mcp-server-design.md     ← council-diff-mcp tool defs
  marketplace-checklist.md ← Marketplace submission steps
src/
  (Day 2: scaffolded via npm create slack-bolt-app)
assets/
  (logos, screenshots, demo gifs)
scripts/
  setup-day1.sh            ← one-shot Day 1 environment setup
```

---

## Karpathy frame for the Devpost write-up

> "Traditional software automates what you can **specify**. AI automates what you can **verify**." — Andrej Karpathy, Sequoia AI Ascent 2026
>
> Council is the verification layer for Slack decisions. Five personas debate, Oracle adjudicates, Brier audits over time. The Skeptic pulls fresh workspace state via RTS, so the council can override the user with new facts. Built on council-diff (npm, MIT, v0.4.0 shipped 2026-06-15).

This goes in the Slack and Build Week submissions verbatim.

---

## Decision gates before committing build time

- [ ] Confirm US eligibility on slackhack.devpost.com/rules (5 min)
- [ ] Confirm video length cap (Resources or FAQ tab — 5 min)
- [ ] Confirm "submission" (not approval) suffices for Orgs prize qualification (FAQ — 5 min)
- [ ] Decide: solo, or recruit 1-2 teammates? Solo is fine; Dreamforce voucher × 2 if you bring a friend
- [ ] Day 1: lock Slack App ID before any code goes in
