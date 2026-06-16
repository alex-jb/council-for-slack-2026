# Council for Slack — submission 1-pager

> **For judges with 60 seconds.** Everything else is in the README.

## What it is

The second-opinion ritual native to Slack. Type `/council [decision] | [context]` in any channel → 5 domain-typed AI personas debate in parallel via Anthropic Sonnet 4.6 → in-channel verdict in ~10s, ~$0.03. Every voice is scored against reality at resolution via Brier audit.

## Why it matters

Single-LLM "should I do X" answers train teams to outsource thinking. The council pattern surfaces disagreement explicitly — and the agreement score IS the calibration signal. When the math is clean, 5 voices converge tight. When the question is hard, they spread. That spread is what a single LLM erases.

## Rubric scorecard

| Criterion (25% each) | State |
|---|---|
| **Technological Implementation** | MCP server ✓ live · Channel Canvas API ✓ live (verified in sandbox `T0BAKDLM11R`) · Workflow Builder custom step ⏸ code-complete, registration blocked on Free-plan sandbox. 2/3 required tech live, 3/3 in code. |
| **Design** | Slack-native: slash + audit + Canvas + Brier score all where the team already lives. Loom 60s opens on the Brier audit (not deliberation) per rubric guidance. |
| **Potential Impact** | 5 personas cover solo founder / PM / eng lead / investor / CTO. 4 real fires demonstrate full GO/WAIT/KILL verdict spectrum, not synthetic demos. |
| **Quality of Idea** | Persona-vs-persona + agreement-score-as-test + Brier audit at resolution = Karpathy Software 3.0, literal. council-diff (npm, MIT) is the open-source engine; this submission is the Slack-native production layer. |

## 4 real `council.deliberate()` fires (each ~$0.03, OSS-published)

| Case | Domain | Verdict | Agreement | Voice spread |
|---|---|---|---|---|
| [Crypto payments on B2B SaaS](./case-studies/crypto-payments-2026-06.md) | founder | **KILL** | **0.94** | 4 → 12 (tightest) |
| [Annual billing at 2 months free](./case-studies/annual-billing-2026-06.md) | founder | GO | 0.89 | 72 → 88 |
| [GOOGL Q3 2026 — Druckenmiller vs Berkshire](./case-studies/googl-q3-2026.md) | investor | WAIT | 0.78 | 38 → 72 |
| [Rust rewrite of Python inference router](./case-studies/rust-rewrite-2026-06.md) | engineer | WAIT | 0.62 | 22 → 72 (widest) |

The shape of the question determined the shape of the verdict — not the other way around. That's the calibration claim.

## Verify in 90 seconds

The sandbox workspace is private during hackathon judging. To verify the live state in your own workspace:

1. `git clone` this repo
2. `cd web && npm install`
3. Paste your Slack + Anthropic + Supabase keys into `.env.local`
4. Apply `migrations/*.sql` via your Supabase Dashboard SQL Editor
5. Install the Slack app from `docs/slack-app-manifest.json` (Free-plan compatible) OR `docs/slack-app-manifest-with-functions.json` (Pro/Sandbox)
6. `npm run dev` (local) or deploy to Vercel
7. Slack: `/council should we ship Tuesday or Friday?` → verdict in ~10s

To see live in-channel:
- Slash command ✓
- `/council-audit` with workspace calibration meta-metric ✓
- Channel Canvas auto-append on each fire ✓
- ✅/❌ resolve buttons + Brier per voice ✓

## Stack

- Next.js 16.2 Pages Router on Vercel serverless (`maxDuration: 60`)
- `@slack/bolt` 4.7 with `processBeforeResponse: true` (required FaaS pattern; otherwise Vercel kills the in-flight deliberation Promise when ack ends the response)
- `council-diff` v0.4.0 (npm, MIT, also authored as part of this submission)
- Anthropic Sonnet 4.6 for the 5 parallel persona calls
- Supabase Postgres on a `council` schema with SECURITY DEFINER RPCs (anon key only — RLS deny-all + RPC-as-door pattern, never service_role in app code)
- Slack manifest covers slash commands × 2, message shortcut, Channel Canvas API, custom function (Workflow Builder)

## Honest limitations

- **Workflow Builder Day 10** is code-complete but the sandbox workspace can't register custom functions (Free plan). Swap manifest + reinstall on a Pro/Sandbox workspace to unlock — the handler is already deployed.
- **Marketplace track is structurally blocked** for our app type — Slack docs confirm custom-function apps can't be Marketplace-listed. Best New Slack Agent track is the right target.
- **OAuth install flow** is not yet shipped (scheduled 2026-06-25 post-judging). Sandbox install only during judging window.
- **Real-Time Search API** scope (`search:read`) requires beta enrollment — deferred to Week 2 roadmap.

## What's worth your time as a judge

1. **The 4 case studies side-by-side** (linked above). Same engine. Four shapes spanning the full GO → KILL spectrum. The agreement score moves with the question shape, not with cosmetic noise.
2. **The Brier audit screen** (`/council-audit`) shows the workspace's calibration as a single labelled number that drifts over time. That's the eval loop that the LLM Council pattern has been missing.
3. **The Channel Canvas decision log** (auto-appended on every fire) makes the team's Brier-audited decision history visible at the top of every channel — judges literally see it fill up during the demo.

## Links

- Devpost submission copy: [`docs/devpost-submission.md`](./devpost-submission.md)
- Day-by-day ship log: [`../CHANGELOG.md`](../CHANGELOG.md)
- 60s Loom demo script: [`docs/loom-script.md`](./loom-script.md)
- Workspace pre-stage for Loom: [`docs/loom-pre-stage-workspace.md`](./loom-pre-stage-workspace.md)
- 中文 README: [`../README.zh-CN.md`](../README.zh-CN.md)

---

*Built solo over 11 days during the Splunk + Band of Agents hackathon window (2026-06-13 → 2026-06-16). Targets Slack Agent Builder Challenge 7/13 as primary submission.*
