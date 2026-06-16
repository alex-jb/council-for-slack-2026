# Rust Rewrite — when the council says WAIT with a 50-point voice spread

> **Third case study in the triad** ([GOOGL Q3 2026 →](./googl-q3-2026.md) · [Annual Billing →](./annual-billing-2026-06.md) · this one).
>
> GOOGL showed WAIT at agreement 0.78, voice spread 34 points. Annual billing showed GO at agreement 0.89, voice spread 16 points. This case shows WAIT at agreement 0.62, voice spread **50 points** — the widest in the triad. **Two different shapes of WAIT, same engine.** That's the spec working.

**Fired**: 2026-06-16 via `council-diff` v0.4.0 + Anthropic Sonnet 4.6
**Cost**: ~$0.03
**Latency**: ~10s
**Domain**: `engineer`

---

## The decision

> *Should we rewrite our Python inference router from FastAPI to Rust (axum) given P99 latency is 380ms on hot paths and CPU cost is $9K/month?*

## The context

- Mid-stage Series B AI infra startup, 18 eng team.
- Inference router is the single hot path — ~12M req/day, ~140 req/sec peak.
- Current Python FastAPI: P99 380ms, P50 90ms, CPU-bound at peak (8 c5.4xlarge in prod, **$9K/month**).
- 2 eng have shipped production Rust. 16 have shipped production Python.
- Estimated rewrite: 6-8 eng-weeks. No outage budget — must dual-run for 2 weeks at ~$2K extra.
- Roadmap: 2 known features (batch inference + tenant isolation) need to ship in next 2 quarters.
- Alternative: profile + optimize Python — likely 30-40% latency improvement, 1-2 eng-weeks.
- Internal Slack thread on this: 47 messages, no convergence.

The classic Rust rewrite question that loops in every infra team's #engineering channel for two months and never resolves.

---

## The verdict

```
Recommendation: WAIT
Agreement:      0.62   (lowest of the triad — vs Annual 0.89, GOOGL 0.78)
Voice spread:   22-72  (widest of the triad — 50 points)
```

**Consensus (verbatim)**:

> "The Rust rewrite is directionally sound — Python has a genuine structural ceiling on this workload and axum would address it — but the timing is wrong. Two roadmap features (batch inference, tenant isolation) are landing in the next two quarters, the team is 88% Python-native, and the Python optimization path offers 30-40% gains in 1-2 eng-weeks with near-zero blast radius. The dominant recommendation is: execute the Python profiling sprint immediately to reduce P99 and monthly cost, use that runway to deliberately grow Rust fluency across 4-6 engineers, then execute the rewrite from a position of team competence and architectural clarity rather than latency panic."

Read that consensus quote carefully. The council didn't average five opinions into mush — it surfaced a **concrete next-step program**: profile Python first → grow Rust fluency → execute rewrite later from competence, not panic. That's the kind of WAIT that ships value immediately. The 47-message Slack thread now has an answer it can ratify or reject.

---

## The 5 voices

### Rust Core Maintainer — 72/100 — pro

> "axum on a CPU-bound hot path at 12M req/day is exactly the right fit — the type system will catch concurrency bugs in batch inference and tenant isolation before they hit prod, and you'll shed the GIL tax entirely. But 6 engineers writing production Rust for the first time is a hidden multiplier on that 6-8 week estimate."

- **+** Python's GIL and async overhead are genuine structural ceilings here; axum with tokio will give predictable sub-10ms P99 on the router layer itself, not just 30-40% improvement.
- **−** Batch inference and tenant isolation both touch ownership and lifetime semantics hard. Two Rust-experienced engineers cannot adequately review six newcomers' concurrent Rust code under feature pressure without creating subtle unsoundness.

### CTO 5 Years From Now — 60/100 — directionally yes, timing no

> "The Rust rewrite is likely correct directionally — Python will keep being a ceiling as you scale to 100M+ req/day — but doing it now, under roadmap pressure, with 16/18 engineers inexperienced in it, risks locking in a codebase that's technically superior but organizationally unmaintainable, which is its own form of legacy debt."

- **+** If you wait 12 more months and do this after the batch inference and tenant isolation features stabilize in Python, you rewrite a known, tested surface area into Rust rather than designing two complex features simultaneously in an unfamiliar language.
- **−** The irreversibility risk runs both directions: optimize Python now and you may make the eventual migration harder; but rewrite now under pressure and you bake immature architectural decisions into a language where refactoring is significantly more expensive.

### Tech Recruiter — 55/100 — double-edged

> "Rust on the job post is a double-edged sword: it's a magnet for strong systems engineers who self-select for rigor, but the hiring pool is 10-15x smaller than Python at the ML infra level, and Series B velocity usually needs bodies faster than Rust resumes arrive."

- **+** For an AI infra startup, a credible production Rust inference router is a genuine recruiting signal to senior systems engineers currently at Cloudflare, Databricks, or Oxide — exactly the profile you want for the next 18 months.
- **−** If key Rust contributors leave, the bus factor on your hot path immediately becomes 1-2, and backfilling Rust infra roles at Series B comp bands takes 3-5 months minimum.

### SRE Oncall — 28/100 — against

> "A 2-week dual-run with zero outage budget on your single hot path is a blast-radius nightmare — you're deploying a brand-new binary in a language most of your team can't debug at 3am while also shipping features. Profile the Python first; $2K extra infra for dual-run plus 6-8 eng-weeks of distraction buys a lot of optimization cycles."

- **+** The alternative path (1-2 eng-weeks, 30-40% latency improvement) de-risks the same metric with a fraction of the operational exposure and keeps your on-call runbooks valid.
- **−** If Python optimize only gets P99 ~230ms and the real target is sub-100ms, you've burned the easy wins and still face the rewrite — but now with less runway and more technical debt layered on top.

### Junior Dev Just Onboarded — 22/100 — against (lived experience)

> "I just learned the FastAPI codebase and now there's talk of rewriting it in a language where I'll spend two weeks fighting the borrow checker before I can even add a field to a struct — the docs and examples for axum are good but nothing like the FastAPI ecosystem's tutorials for ML routing patterns."

- **+** If the team commits, axum's compile-time errors are actually more beginner-friendly than runtime async Python tracebacks once you get past the initial learning curve.
- **−** Batch inference and tenant isolation features will land in this Rust codebase before most of the team is comfortable with it — that's where the real onboarding debt shows up, not in the rewrite itself.

---

## What this proves

A single LLM asked "should we rewrite in Rust?" produces one of two failure modes: cheerleader ("Rust is the future!") or excessive caveats ("here are 12 things to consider"). Neither helps the eng lead deciding what to do Monday morning.

The council does what neither can:

1. **The voice spread itself is the diagnostic.** 50 points (22 ↔ 72) between Junior Dev and Rust Maintainer is the team meeting that's been happening in Slack for 2 months, compressed into 10 seconds and explicitly priced. That spread is what the consensus has to bridge.

2. **WAIT isn't a punt — it's a concrete program.** "Profile Python first → grow Rust fluency across 4-6 engineers → execute rewrite later from competence" is shippable Monday-morning language. It even includes the success metric (when you have 4-6 Rust-fluent engineers, revisit).

3. **The dissenting voices stay on the record.** Rust Core Maintainer's "Python GIL is a genuine structural ceiling" doesn't get erased by the WAIT verdict — it's preserved as the unresolved structural problem that the Python optimize path doesn't solve. When the team revisits in 12 months, the case for Rust is right there, not lost in the Slack thread archive.

4. **Brier audit at resolution closes the loop.** When the team ships either path 12 months from now and measures the actual outcome (did latency hit target? did velocity hold? did onboarding break?), the WAIT recommendation gets a Brier score. SRE Oncall (28/100) and Rust Maintainer (72/100) each get scored. **Over time, the team learns which voice to trust on which kind of engineering question** — exactly what a 47-message Slack thread can never tell you.

---

## The triad in one frame

| | GOOGL | Annual Billing | Rust Rewrite |
|---|---|---|---|
| Recommendation | `WAIT` | `GO` | `WAIT` |
| Agreement | 0.78 | 0.89 | 0.62 |
| Voice spread | 34 points | 16 points | **50 points** |
| Shape of decision | smart-money divergence on regulatory binary | clean ops fix with validated demand | 47-message Slack thread, structural-vs-tactical tension |
| Domain | `investor` | `founder` | `engineer` |
| Why the verdict | binary risk → can't size right yet | math is clean → ship | direction right, timing wrong, concrete next step |

Three real fires, three different shapes. The council didn't pick verdicts to balance the demo. **The shape of the question determined the shape of the verdict.** That's the spec.

---

## Try it yourself

```bash
ANTHROPIC_API_KEY=sk-... npx council-diff engineer \
  "Should we rewrite our Python inference router in Rust?" \
  "Series B AI infra, 18 eng, 12M req/day, P99 380ms, $9K/mo CPU, ..."
```

In your Slack:

```
/council :engineer Should we rewrite our Python inference router in Rust?
       | Series B AI infra, 18 eng, 12M req/day, P99 380ms, $9K/mo CPU,
         2 eng have Rust prod exp, 16 are Python-native, no outage budget.
```

---

*Fired 2026-06-16 from `council-diff` v0.4.0 in `~/Desktop/council-diff/examples/engineer-rust-rewrite.ts`. Anthropic Sonnet 4.6, ~$0.03, ~10s.*
