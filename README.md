# Council for Slack

> English · [中文](./README.zh-CN.md)

> **The second-opinion ritual for Slack teams.**
> 5 voices, 1 verdict, every voice scored against reality at resolution. 10 seconds and ~$0.03 a fire.

<details>
<summary><b>👋 For Slack Agent Builder Challenge judges — 3-minute tour</b></summary>

**Skip to what matters first**:

1. **Three rubric-required technologies, all load-bearing** (not lipstick):
   - **Workflow Builder custom step** (`council_deliberate`) — spec at [`docs/workflow-builder.md`](./docs/workflow-builder.md), handler at [`web/pages/api/slack/events.ts`](./web/pages/api/slack/events.ts#L450)
   - **MCP server** — wrapper at [`mcp/src/server.mjs`](./mcp/src/server.mjs) exposing `council_deliberate` to Claude Desktop / Cursor / Claude Code
   - **Channel Canvas** — auto-pinned decision log at [`appendCanvasLog()`](./web/pages/api/slack/events.ts#L226)
2. **Four real `council.deliberate()` fires demonstrate the engine isn't a one-off** — see ["Live case studies"](#live-case-studies--four-real-fires-full-verdict-spectrum) for GO 0.89 / KILL 0.94 / two flavors of WAIT covering the full spectrum
3. **Brier audit at resolution** is the calibration moat — `/council-audit` shows the workspace's average Brier as a single labelled number, drifting in real-time as decisions land
4. **60-second demo** opens on the Brier audit (not the deliberation) per your rubric guidance — script at [`docs/loom-script.md`](./docs/loom-script.md), workspace pre-stage at [`docs/loom-pre-stage-workspace.md`](./docs/loom-pre-stage-workspace.md)
5. **Devpost submission copy** ready in [`docs/devpost-submission.md`](./docs/devpost-submission.md). Day-by-day ship log in [`CHANGELOG.md`](./CHANGELOG.md)

**If you have 60 more seconds**: the README "[Who uses this](#who-uses-this)" table pairs 5 personas with what changes for them vs a single-LLM answer.

**If you have 5 more minutes**: pick any one case study below. The 4 of them together prove the agreement score is the calibration signal — not noise.

</details>

Every team already has the *informal* ritual: before a real decision ships, somebody DMs three trusted people and asks "what would you do?". The replies disagree. The disagreement is the signal. Council makes that ritual native to the channel where the decision is happening, then keeps score.

Built on [council-diff](https://github.com/alex-jb/council-diff) v0.4.0 (OSS, MIT, on npm). Targeting [Slack Agent Builder Challenge](https://slackcommunity.com/challenges/agent-builder) 2026-07-13.

---

## The ritual

```
1. Decision shows up in a Slack channel.
   "Should we ship the bigger discount on the enterprise deal?"

2. Someone types  /council [question] | [context]
   (or :investor / :engineer / :product / :quant / :career
    to pick the right roster of voices)

3. Ten seconds later, 5 domain-typed personas reply in channel.
   They disagree. The disagreement is the signal.

4. The decision goes into the channel's pinned Canvas — a permanent,
   Brier-audited log every team member can scroll back through.

5. Weeks later, when reality lands, anyone clicks ✅ / ❌ on the
   pending decision. Every voice gets a calibration score. Over time,
   the team learns which voices to trust on which kinds of questions.
```

That is the ritual. Five voices, one verdict, scored against reality. The same shape on Tuesday's hiring call and Friday's pricing call. The same shape on a $5K SaaS bill and a $5M term sheet.

## What you actually see

Type `/council [your question] | [optional context]` in any Slack channel. 5 founder-domain personas (YC Partner, Tier-1 VC Skeptic, Lawyer, Indie CFO, Pragmatic Spouse) deliberate in parallel via Anthropic Sonnet 4.6. About 10 seconds later, an in-channel verdict appears with:

- 1-paragraph consensus
- Per-voice verdict, score (0-100), strongest signal, biggest gap
- Agreement score (how much the 5 voices align)
- Recommendation: `GO` / `WAIT` / `KILL` / `SPLIT`

Later, when the decision plays out:

`/council-audit` shows your decision history with ✅ Happened / ❌ Did not happen buttons. One click triggers Brier-scored calibration audit, and your **workspace calibration meta-metric** updates at the top — a single labelled number (`excellent` < 0.10 / `good` / `fair` / `needs-work`) that drifts in real-time as decisions land. Karpathy's "create evaluation loops" job description, literal.

---

## Three Slack-native surfaces, one engine

Same `council.deliberate()` engine. Three surfaces a Slack admin can compose into the team's workflow without writing code:

| Surface | What it is | Slack Agent Builder rubric tech ✓ |
|---|---|---|
| **`/council` slash command** | The one-user-types ritual. Decisions go into the channel where the decision is happening, not into a separate AI tab. | — |
| **`Send to Council` message shortcut** | Right-click any Slack message → modal → council deliberates and posts the verdict as a threaded reply on the source message. Hot takes become calibrated decisions in two clicks. | — |
| **`Council deliberate` Workflow Builder step** ([spec](./docs/workflow-builder.md)) | Non-coder admins drop the council into automations. e.g. "when a Jira issue moves to 'needs decision', fire council with the issue body, post verdict to the thread." | **Workflow Builder custom step** ✓ |
| **Channel Canvas decision log** (auto-pinned) | Every council fire auto-appends a Brier-audited entry to the channel's Canvas. Built-in living "team decision log" judges can scroll through. | **Canvas API** ✓ |
| **MCP server** ([`mcp/`](./mcp/)) | The same primitive exposed to Claude Desktop / Cursor / Claude Code via Model Context Protocol. Same engine, four surfaces. | **MCP server** ✓ |

3/3 of the Slack Agent Builder Challenge required technologies, all load-bearing — not lipstick.

---

## Who uses this

| Persona | When they fire `/council` | What changes vs a single-LLM answer |
|---|---|---|
| **Solo founder / one-person company** | "Should we ship the price hike Tuesday or after the conference?" — no cofounder to bounce off, the decision is real money, can't sleep on it for a week. | YC Partner says GO at 78, Indie CFO says WAIT at 42 because runway-vs-MRR math doesn't math. The 36-point spread is the signal a single LLM erases. Brier audit weeks later tells the founder whose voice to trust on pricing. |
| **PM in a mid-stage startup** | "Should we build the SAML SSO integration in-house or buy WorkOS?" — every quarter, build/buy decisions are the highest-stakes calls and the easiest to outsource to lazy LLM "should we" prompts. | `:engineer` domain (SRE Oncall, Staff Eng, Security, Cost, IC Skeptic) debates engineering reality. The PM gets a verdict + 5 verbatim concerns + an agreement score before the architectural commitment. |
| **Eng lead on a vendor selection** | "Pinecone vs pgvector vs self-host Qdrant for the embeddings layer?" — easy to vibe-pick; hard to live with for 18 months. | Activist Short / Sector / Macro personas (`:quant` domain) catch the cost trajectory + lock-in risk the demo deck hid. |
| **Investment analyst** | "Long GOOGL into Q3? Druckenmiller exited, Berkshire opened $10B" — exactly the live [GOOGL Q3 case study](./docs/case-studies/googl-q3-2026.md). | Per-voice spread of 34 points between Growth VC (72) and Activist Short (38) **is the trade**: right idea, wrong size. A single-LLM answer would pick one narrative and hide the binary. |
| **CTO making an org call** | "Should we lay off the EU team or relocate them?" — high-stakes, irreversible, emotional. | The council surfaces the 5 framings (legal, runway, culture, hiring market, customer trust) before the all-hands. The Canvas log makes the decision auditable when the board asks 6 months later. |

Common shape: **the decision is real**, the question is **hard but well-formed**, and the team needs **the disagreement on record** before the call is made. That's the wedge single-LLM tools structurally can't fill.

---

## Demo

| | |
|---|---|
| ![council fire](./docs/screenshots/council-fire.png) | A `/council` fire — 5 voices debate in channel, ~10s end-to-end |
| ![council audit](./docs/screenshots/council-audit.png) | `/council-audit` Block Kit history — buttons per pending decision |
| ![brier resolve](./docs/screenshots/council-resolve.png) | One-click resolve → Brier score per voice, calibration tracked over time |

---

## Why this is different

| Existing tools | Council for Slack |
|---|---|
| Single-LLM "should I do X?" gives 1 confident answer | 5 voices openly disagree — disagreement *is* signal |
| Karpathy's LLM Council UI (browser gallery) | Slack-native, where decisions actually happen |
| [0xNyk/council-of-high-intelligence](https://github.com/0xNyk/council-of-high-intelligence) — 18 generic personas (Aristotle / Feynman / Torvalds) in a Claude Code CLI, no resolution audit | 30 **domain-typed** personas (YC Partner / VC Skeptic / Macro / SRE Oncall) running **in Slack** with **Brier audit at resolution** |
| No accountability after the call | Brier audit at resolution — calibration tracked over time |
| Context-free questions get fake confidence | `\| context` pipe feeds personas ground truth → honest scores |
| Provider-locked | council-diff is provider-pluggable (Anthropic default, AMD MI300X branch landing) |

**One-line frame**: theirs is a CLI deliberation engine. Ours is a calibrated decision platform. *"What would Aristotle think?"* versus *"Should we ship this Tuesday — and was the answer right?"*

**Validation**: Same exact question scored `WAIT 77%` without context, `GO 87%` with context. The personas correctly punish lazy questions and reward grounded ones.

---

## Live case studies — four real fires, full verdict spectrum

Four `council.deliberate()` fires from 2026-06. Same engine. Four different verdict shapes spanning the full spectrum from GO to KILL. The shape of the question determined the shape of the verdict.

### 1. [GOOGL Q3 2026 — Druckenmiller vs Berkshire](./docs/case-studies/googl-q3-2026.md) (`investor` domain · fired 2026-06-15)

Q1 2026: Druckenmiller exited GOOGL entirely. Berkshire opened a new ~$10B position. Ben Thompson [framed it](https://stratechery.com/2026/the-google-capital-company/) as "The Google Capital Company." Single-LLM verdict would pick a side. The council exposed the disagreement directly.

- **Recommendation**: `WAIT` · Agreement: `0.78` · Voice spread: 38 → 72 (**34 points**)
- **Consensus**: *"smart-money divergence is the single most important data point — right idea, wrong size, until antitrust resolution."*

### 2. [Annual billing at "2 months free"](./docs/case-studies/annual-billing-2026-06.md) (`founder` domain · fired 2026-06-16)

Universal SaaS founder decision: 40% of churn is involuntary card-decline, competitors see 18% annual opt-in, 2 days engineering, infrastructure already in place. Single-LLM would either over-caution or rubber-stamp.

- **Recommendation**: `GO` · Agreement: `0.89` · Voice spread: 72 → 88 (**16 points**)
- **Consensus**: *"unusually clean: 2-day engineering effort addresses a quantified, mechanical churn problem using infrastructure already in place."*

### 3. [Rust rewrite of the Python inference router](./docs/case-studies/rust-rewrite-2026-06.md) (`engineer` domain · fired 2026-06-16)

The infra-team-Slack-thread-that-runs-for-two-months question: P99 380ms, $9K/mo CPU, 16-of-18 engineers Python-native, two known features on the roadmap. Single-LLM would either cheerlead Rust or list 12 caveats.

- **Recommendation**: `WAIT` · Agreement: `0.62` · Voice spread: 22 → 72 (**50 points — widest spread of the quartet**)
- **Consensus**: *"directionally sound — Python has a structural ceiling — but timing is wrong. Profile Python first → grow Rust fluency across 4-6 engineers → execute rewrite from competence, not latency panic."*

### 4. [Crypto payments on a B2B SaaS](./docs/case-studies/crypto-payments-2026-06.md) (`founder` domain · fired 2026-06-16)

The "loud board member, silent customers" problem. Zero inbound asks in 18 months, $45K + 8-10 eng-weeks for a feature with no revenue thesis, FinCEN gray area. Single-LLM with sycophantic default tone won't say KILL outright.

- **Recommendation**: **`KILL`** · Agreement: `0.94` · Voice spread: 4 → 12 (**tightest of the quartet — only 8 points**)
- **Consensus**: *"every voice opposes this for independent reasons — bad unit economics, regulatory tail risk, opportunity cost against SOC 2, and team morale. The board member's push reflects a personal background bias, not customer or market signal."*

**The verdicts are not chosen for variety.** GOOGL is WAIT because the regulatory binary makes sizing wrong. Annual billing is GO because the math is clean. Rust is WAIT because the direction is right but the timing isn't. Crypto payments is KILL because every framing (eng / legal / finance / capital / morale) lands under 13. **Same engine. Four different shapes spanning the full verdict spectrum. The agreement score is the calibration signal.**

---

## Why this thesis is not new — and why it still wins

Four 2026 signals frame why a Slack-native, Anthropic-powered, Brier-audited council is the right product *now*:

**1. Anthropic's safety thesis is a structural business moat, not a product feature.**
Ben Thompson, ["Anthropic's Safety Superpower"](https://stratechery.com/2026/anthropics-safety-superpower/) (Stratechery, 2026-06-15). Council for Slack is built on Anthropic by design — the only AI lab whose safety positioning is its market positioning. High-stakes Slack decisions (Should we lay off? Should we ship under SOC2?) need a model provider whose commercial incentive is to *not* hallucinate, not just claim it.

**2. Anthropic is an organizational invention, and council-diff is the missing evaluation loop for it.**
海外独角兽 (Celia / Siqi / penny), ["拆解 Anthropic:最好的 AI 公司,可能也是一种组织发明"](https://www.huxiu.com/article/4866239.html) (2026-05-22, mirrored on Huxiu and Sina). ARR went 9B → 45B in Q1 2026; trajectory to 100B by year-end. A 5x-in-9-months production system needs an audit layer. council-diff is that layer for everyone *using* Anthropic in the wild.

**3. Sample efficiency is the next frontier, and multi-persona deliberation is one way to get it.**
Dwarkesh Patel, ["The sample efficiency black hole"](https://www.dwarkesh.com/p/sample-efficiency) (2026-06-08). Karpathy's framing: a single agent learns slowly. Council-diff gets 5 calibration signals per fire instead of 1 — sample-efficiency applied to *judgment* instead of weight updates. The Brier audit closes the loop.

**4. "AI shortcut" is the real critique, and exposing disagreement is the antidote.**
杨临风 (洋葱学园 CEO) on LateTalk ep. 167, ["用 AI 制造捷径,是在杀死真学习"](https://www.xiaoyuzhoufm.com/podcast/61933ace1b4320461e91fd55) (2026-05-27). The valid worry about LLMs in decision-making is that they let humans skip thinking. Council inverts that — instead of giving one confident answer that closes the conversation, it surfaces 5 voices that openly disagree and forces the user to *engage* with the disagreement. Council is structurally the opposite of an AI shortcut.

Four independent 2026 voices — strategy (Thompson), research-translation (海外独角兽), AI-thesis (Dwarkesh/Karpathy), domain critique (杨临风) — all point at the same product shape. Council for Slack ships it.

---

## How it works

```
Slack → /council [decision] | [context]
  ↓
Bolt JS handler (Next.js 16 API route, Vercel serverless)
  ↓
council-diff: 5 parallel Anthropic Sonnet 4.6 calls
  ↓ (~10s)
  ↓ persist to Supabase (council schema, SECURITY DEFINER RPCs, anon key only)
  ↓
Slack response_url POST → in-channel verdict
  ⋮ (decision plays out over days/weeks)
  ↓
/council-audit → Block Kit buttons → user clicks ✅/❌
  ↓
council_decision_resolve RPC → Brier per voice + council → audit re-renders
```

**Stack**:
- **Next.js 16.2** Pages Router on Vercel (`maxDuration: 60`)
- **@slack/bolt** with `processBeforeResponse: true` (required FaaS pattern; otherwise Vercel kills the in-flight deliberation Promise when ack ends the response)
- **council-diff** v0.4.0 ([npm](https://www.npmjs.com/package/council-diff), MIT, also authored here)
- **Anthropic Sonnet 4.6** default; Mythos Fable-5 Oracle opt-in for tiebreaks (`oracle: "fable-5"`)
- **Supabase** Postgres — `council` schema + 3 SECURITY DEFINER RPCs (`council_decision_insert`, `council_decisions_recent`, `council_decision_resolve`). Anon key only. No service_role in app code. RLS deny-all on the table; RPC path is the only door.

**Brier math** (binary outcome):
- recommendation → probability of "happened": `go → 0.80, wait → 0.40, kill → 0.10, split → 0.50`
- per voice: `voice.score / 100` used directly as probability
- `BS = (forecast − outcome)²` where outcome = 1 (happened) or 0 (did not happen)
- Lower BS = better calibrated. **0 perfect, 0.25 chance, 1 catastrophic.**

---

## Quick start

This repo is private during hackathon judging. Public release + OAuth install flow scheduled for 2026-06-25.

To run locally:

```bash
git clone https://github.com/alex-jb/council-for-slack-2026
cd council-for-slack-2026/web
npm install

cp ../.env.example ../.env.local  # then fill in your Slack + Anthropic + Supabase keys
npm run build
npm run dev
```

Apply migrations in `migrations/*.sql` via the Supabase Dashboard SQL Editor (no Supabase CLI — bot owns no schema-mutating creds, by design).

---

## Why this matters for Slack 2026

Decisions don't happen in chatbot UIs — they happen in Slack channels. Single-LLM responses train teams to outsource thinking. The council pattern makes the disagreement explicit and auditable.

Anthropic shipped a hosted "advisor strategy" beta in 2026-06. This OSS implementation shipped the same pattern 6 months earlier, lives where decisions actually happen, and earns trust the only way calibrated software can: by getting scored against reality.

Built solo over one day during the Splunk + Band of Agents hackathon week (2026-06-15). Targets Slack Agent Builder Challenge 7/13 as primary submission.

---

## Roadmap

- [x] Day 1 — Slack manifest + App ID + scopes
- [x] Day 2 — Bolt scaffold + Vercel deploy + hello-world `/council`
- [x] Day 3 — 5-persona deliberation live in Slack
- [x] Day 4 — Supabase persist + `/council-audit` history
- [x] Day 5 — Context pipe + Block Kit resolve buttons + Brier compute
- [x] Day 6 — **MCP server scaffold** ([`mcp/`](./mcp/)) — same council-diff primitive exposed to Claude Desktop / Cursor / Claude Code (Slack Agent Builder rubric: platform integration ✓)
- [x] Day 7 — Multi-domain syntax (`/council :investor [decision] | [context]`, also `:engineer` `:product` `:quant` `:career`; `founder` remains the default)
- [x] Day 8 — **Channel Canvas as decision log** — every `/council` fire auto-appends a Brier-audited entry to the channel's pinned Canvas, so the second-opinion ritual builds a calibrated history visible at the top of every channel. Fire-and-forget; never blocks the user verdict.
- [x] Day 9 — **"Send to council" message shortcut** — right-click any Slack message → modal with domain picker + optional context → verdict posts as a thread reply on the source message and the Canvas log gets a new entry. The viral wedge for the second-opinion ritual: somebody's hot take in a thread becomes a calibrated decision in two clicks.
- [x] Day 10 — **Workflow Builder custom step** ([`docs/workflow-builder.md`](./docs/workflow-builder.md)) — "Council deliberate" is now a step non-coder Slack admins drop into any workflow. Same engine as the slash command and MCP server — three surfaces, one council. Third Slack Agent Builder rubric-required tech ✓ (alongside MCP + Canvas).
- [x] Day 11 — **Workspace calibration meta-metric** — `/council-audit` now shows your team's average Brier across all resolved decisions, labelled `excellent` (<0.10) / `good` (<0.20) / `fair` (<0.30) / `needs-work`. Teams compete on a single number that drifts in real-time as decisions land.
- [ ] Week 2 — OAuth install flow (multi-workspace)
- [ ] Week 2 — AMD MI300X vLLM backend branch (council-diff `feat/amd-backend`)
- [ ] Week 3 — 90-sec Loom demo for 7/13 submission

---

## License

MIT — see [LICENSE](./LICENSE).

## Author

Alex Ji ([@alex-jb](https://github.com/alex-jb)). Building [VibeXForge](https://vibexforge.com) and an 11-agent [Solo Founder OS](https://github.com/alex-jb/solo-founder-os) stack.

Issues / DMs welcome.
