# Launch drafts — GOOGL Q3 2026 council case study

> Companion to [`googl-q3-2026.md`](./googl-q3-2026.md). Real council-diff fire 2026-06-15, recommendation WAIT, agreement 0.78.

All drafts dogfood the same artifact. Don't paraphrase the consensus line — quote it verbatim. The "right idea, wrong size" line is the hook.

---

## X thread (5 tweets)

**1/**
Two of Q1's loudest 13F filings went opposite directions on the same name:

Druckenmiller — sold ALL GOOGL.
Berkshire — opened ~$10B GOOGL.

I ran it through 5 AI personas. Macro / Sector / PM / Growth VC / Activist Short.

The result is not what a single-LLM answer would give you. 🧵

**2/**
Verdict: **WAIT**
Agreement: 0.78

Consensus (verbatim):

> "The smart-money divergence is the single most important data point — this is a 'right idea, wrong size' situation until antitrust resolution clarifies the structural picture."

That's the line. Right idea. Wrong size.

**3/**
Per-voice spread tells the story:

Growth VC: 72/100 (TPU moat + Waymo 4x YoY is real)
Activist Short: 38/100 (DOJ Chrome divestiture not priced)

Macro / Sector / PM: 55-62 (own it, don't size it)

The 34-point gap is the signal. Single-LLM hides this.

**4/**
This is council-diff `investor` domain. 5 parallel Anthropic Sonnet 4.6 calls. ~$0.03, ~10s.

The persona-vs-persona format is the spec.
Agreement score is the test.
Brier audit at resolution is the eval loop.

Karpathy Software 3.0, literal.

**5/**
OSS, MIT, on npm:
`npm install council-diff`

Or live in your Slack:
`/council Long GOOGL into Q3? | Druckenmiller sold all, Berkshire bought $10B`

Full case study + per-voice breakdown:
github.com/alex-jb/council-for-slack-2026/blob/master/docs/case-studies/googl-q3-2026.md

---

## 小红书 (中文,8 张图节奏)

**标题**: Druckenmiller 卖光 GOOGL,Berkshire 买 100 亿,5 个 AI 视角说谁对了

**正文**:

Q1 2026 两个最响的 13F:

🔴 Druckenmiller (杜肯米勒) — 卖光 GOOGL
🟢 Berkshire (巴菲特) — 新建 100 亿仓位

谁对了?

我跑了 5 个 AI 角色辩论 (Macro / Sector / 基金经理 / 成长 VC / 做空机构),Anthropic Sonnet 4.6 跑的:

**结论: WAIT 等等看**
**5 个角色一致度: 0.78** (1.0 完全一致, 0.0 完全分裂)

关键金句:

> 「聪明钱的分歧是这个数据集最重要的单一信号 — 这是个『方向对,仓位错』的局面,直到反垄断清晰前不能重仓」

最有意思的是分歧:

- 成长 VC: 72/100 (TPU 护城河 + Waymo 4 倍 YoY 是真的)
- 做空机构: 38/100 (DOJ Chrome 拆分还没 price in)
- 三个中间派 (Macro/Sector/PM): 55-62

34 分的分差就是信号 — 单一大模型藏掉了这个。

5 个角色一次 deliberation 成本 ~$0.02,10 秒出结果。

OSS,MIT,可以装到自己 Slack:
`/council 我该 long GOOGL 吗? | Druckenmiller 卖光了 Berkshire 买 100 亿`

GitHub: github.com/alex-jb/council-for-slack-2026
council-diff lib: npm install council-diff

#AI投资 #量化 #Karpathy #LLM #council #小红书科技

---

## LinkedIn (1 post, professional)

**Druckenmiller exited GOOGL. Berkshire opened a $10B position. Both filings hit Q1.**

I built a 5-persona OSS council to stress-test the call. Macro / Sector / PM / Growth VC / Activist Short, parallel Anthropic Sonnet 4.6 calls, ~10s end-to-end.

**Recommendation: WAIT.** Agreement: 0.78. Per-voice spread: 38 (Activist Short) to 72 (Growth VC).

The most useful output isn't the verdict — it's the disagreement itself. Activist Short flagged the unresolved DOJ Chrome divestiture remedy as a non-recoverable structural risk that current multiples don't price. Growth VC pointed to Waymo's 4x YoY ride volume and TPU competition with Nvidia as compounding advantages that can't be replicated at any price in 3-5 years.

Both can be right. Sizing should reflect the binary.

Consensus, verbatim: "The smart-money divergence is the single most important data point — this is a 'right idea, wrong size' situation until antitrust resolution clarifies the structural picture."

This is the eval loop the LLM Council pattern was missing. council-diff is OSS, MIT, on npm. Slack version is open on GitHub.

Full case study: [link]
council-diff: https://github.com/alex-jb/council-diff

---

## dev.to / HN (technical angle)

**Title**: Show HN: I ran Druckenmiller vs Berkshire on GOOGL through 5 AI personas (OSS)

**Body**:

Last week two of the most-watched investors filed Q1 2026 13Fs that went opposite directions on the same name. Druckenmiller exited GOOGL entirely. Berkshire opened a new ~$10B position. Ben Thompson [framed Berkshire's entry](https://stratechery.com/2026/the-google-capital-company/) as "The Google Capital Company" — paying for the AI compute moat.

A single-LLM answer to "long GOOGL into Q3 2026?" would pick one narrative and sound 90% confident. That's the failure mode the council pattern is designed to expose.

I ran the exact prompt through council-diff (OSS, MIT, npm) with the `investor` domain (Macro / Sector / PM / Growth VC / Activist Short). 5 parallel Claude Sonnet 4.6 calls, ~$0.03, ~10s end-to-end.

```
Recommendation: WAIT
Agreement: 0.78

Macro Strategist:    58/100
Sector Analyst:      62/100
Portfolio Manager:   55/100
Growth VC:           72/100
Activist Short:      38/100
```

The 34-point spread between Growth VC and Activist Short is the signal a single-LLM verdict erases.

The library exposes:
- `voice.score` (0-100) per persona
- `voice.strength` + `voice.gap` (verbatim quotes per voice)
- `agreement_score` (0-1, the structural test)
- Brier audit at resolution (the actual eval loop)

Karpathy's [Software 3.0 framing](https://twitter.com/karpathy/status/anthropic-april-2026) says the agentic-engineer job is "designing specs precise enough ambiguity has nowhere to hide, then building the evaluation loop." council-diff is the smallest reproducible eval loop for multi-persona agents I could ship.

Full case study with per-voice quotes: [link]

Slack-native version (lets your team `/council` from any channel + Brier-audit at resolution): https://github.com/alex-jb/council-for-slack-2026

npm: `npm install council-diff`

---

## Where each draft goes

| Channel | Draft | When |
|---|---|---|
| X / Twitter | 5-tweet thread above | After verifying GOOGL is still ~$190 (sanity check) |
| 小红书 | 中文 above | Same day |
| LinkedIn | LinkedIn above | Same day, AM ET |
| HN (Show HN) | dev.to / HN above | Tue 9am ET (best HN window) |
| dev.to | Same as HN | Same time |

**Do not post all 5 same day.** Stagger across 2-3 days. Track click-through to the case study `.md` and council-diff npm install delta.
