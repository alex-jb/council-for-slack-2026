# Council for Slack

> **The production layer Karpathy's LLM Council was always missing.**
> 5 personas debate. 1 verdict. Every voice Brier-audited at resolution.

Slack-native multi-persona AI council for high-stakes decisions. Built on [council-diff](https://github.com/alex-jb/council-diff) v0.4.0. Targeting [Slack Agent Builder Challenge](https://slackcommunity.com/challenges/agent-builder) 2026-07-13.

> 中文 README 路上 (`README.zh-CN.md` Day 6 ship).

---

## What it does

Type `/council [your question] | [optional context]` in any Slack channel. 5 founder-domain personas (YC Partner, Tier-1 VC Skeptic, Lawyer, Indie CFO, Pragmatic Spouse) deliberate in parallel via Anthropic Sonnet 4.6. About 10 seconds later, an in-channel verdict appears with:

- 1-paragraph consensus
- Per-voice verdict, score (0-100), strongest signal, biggest gap
- Agreement score (how much the 5 voices align)
- Recommendation: `GO` / `WAIT` / `KILL` / `SPLIT`

Later, when the decision plays out:

`/council-audit` shows your decision history with ✅ Happened / ❌ Did not happen buttons. One click triggers Brier-scored calibration audit. Karpathy's "create evaluation loops" job description, literal.

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

## Live case study

**[GOOGL Q3 2026 — Druckenmiller vs Berkshire](./docs/case-studies/googl-q3-2026.md)** (fired 2026-06-15)

Q1 2026: Druckenmiller exited GOOGL entirely. Berkshire opened a new ~$10B position. Ben Thompson [framed it](https://stratechery.com/2026/the-google-capital-company/) as "The Google Capital Company." Single-LLM verdict would pick a side. The council exposed the disagreement directly.

- **Recommendation**: `WAIT` · Agreement: `0.78`
- **Per-voice spread**: Activist Short 38/100 ↔ Growth VC 72/100
- **Consensus quote**: *"The smart-money divergence is the single most important data point — this is a 'right idea, wrong size' situation until antitrust resolution clarifies the structural picture."*

That 34-point spread between two professional perspectives is the signal a single-LLM answer erases. [Read the full case study →](./docs/case-studies/googl-q3-2026.md)

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
- [ ] Day 7 — Multi-domain syntax (`/council:engineer`, `:investor`, `:product`, `:quant`, `:career`)
- [ ] Day 8 — Average Brier over time (per-workspace calibration meta-metric)
- [ ] Week 2 — OAuth install flow (multi-workspace)
- [ ] Week 2 — AMD MI300X vLLM backend branch (council-diff `feat/amd-backend`)
- [ ] Week 3 — 90-sec Loom demo for 7/13 submission

---

## License

MIT — see [LICENSE](./LICENSE).

## Author

Alex Ji ([@alex-jb](https://github.com/alex-jb)). Building [VibeXForge](https://vibexforge.com) and an 11-agent [Solo Founder OS](https://github.com/alex-jb/solo-founder-os) stack.

Issues / DMs welcome.
