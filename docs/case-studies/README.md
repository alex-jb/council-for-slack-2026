# Live case studies — four real fires, full verdict spectrum

> English · [中文](./README.zh-CN.md)
>
> Four real `council.deliberate()` fires from 2026-06. Same engine. Four different verdict shapes spanning the full GO → KILL spectrum. The shape of the question determined the shape of the verdict — not the other way around. That's the calibration claim.

## At a glance

| Case | Domain | Verdict | Agreement | Voice spread | Consensus snippet |
|---|---|---|---|---|---|
| [Crypto Payments on B2B SaaS](./crypto-payments-2026-06.md) | founder | **KILL** | **0.94** | 4 → 12 (tightest) | "every voice opposes for independent reasons — bad unit economics, regulatory tail risk, opportunity cost against SOC 2, team morale" |
| [Annual Billing at 2 Months Free](./annual-billing-2026-06.md) | founder | GO | 0.89 | 72 → 88 | "the decision is unusually clean: a 2-day engineering effort addresses a quantified mechanical churn problem" |
| [GOOGL Q3 2026 — Druckenmiller vs Berkshire](./googl-q3-2026.md) | investor | WAIT | 0.78 | 38 → 72 | "smart-money divergence is the single most important data point — right idea, wrong size, until antitrust resolution" |
| [Rust Rewrite of Python Inference Router](./rust-rewrite-2026-06.md) | engineer | WAIT | 0.62 | 22 → 72 (widest) | "directionally sound — Python has a structural ceiling — but timing is wrong. Profile Python first → grow Rust fluency → execute rewrite from competence" |

Agreement range: 0.62 → 0.94. Voice spread range: 8 → 50 points.

## Why a quartet, not a single case

A single case study is a demo. A quartet is a calibration claim:
- **KILL 0.94 + 8-pt spread** — when every framing converges against, the council collapses tighter than for any single GO.
- **GO 0.89 + 16-pt spread** — when the math is clean, voices land tight 72-88, not artificially split.
- **WAIT 0.78 + 34-pt spread** — when smart money disagrees in real life, the council shows the disagreement instead of papering it.
- **WAIT 0.62 + 50-pt spread** — when one voice (Rust Maintainer 72) is pro and another (Junior Dev 22) is con, the council produces a concrete next-step program ("profile Python first → grow Rust fluency → rewrite from competence"), not a punt or a 12-bullet "consider these factors" cop-out.

The verdicts span GO / WAIT / KILL. Agreement spans 0.62 (controversial) to 0.94 (unanimous). Spreads span 8 (tightest) to 50 (widest). **The shape of the question determined the shape of the output — and the agreement score is the calibration signal.**

## Try it yourself

```bash
npm install council-diff
ANTHROPIC_API_KEY=sk-... npx council-diff founder \
  "should we add annual billing at 2 months free?" \
  "B2B SaaS, $14K MRR, 40% involuntary churn..."
```

In your Slack:

```
/council :investor Long GOOGL into Q3?
       | Druckenmiller sold all, Berkshire bought $10B, DOJ Chrome timeline unclear
```

Each fire is ~$0.03 and ~10 seconds. Detailed per-case write-ups link out from the table above.

---

## What this is not

- **Not synthetic**. Every recommendation, agreement score, voice quote, and Brier-relevant number above came from real `council.deliberate()` calls against Anthropic Sonnet 4.6 between 2026-06-15 and 2026-06-16. The deliberation results JSON files are in [`/Users/alexji/Desktop/council-diff/examples/`](https://github.com/alex-jb/council-diff/tree/main/examples) (also OSS-published).
- **Not cherry-picked**. The four decisions were chosen for shape diversity *before* firing, not after. KILL was the goal for crypto-payments (zero customer demand is the cleanest KILL setup). GO was the goal for annual-billing (clean ops fix). Two WAITs were intentional to show the verdict's two flavors (smart-money divergence vs structural-vs-tactical tension).
- **Not a demo trick**. The Brier audit math is the spec: `BS = (forecast − outcome)²`, lower is better, 0 perfect, 0.25 chance baseline. When the resolution lands, the council gets a real score per voice per decision. Over time the workspace's calibration meta-metric drifts visibly with team performance.
