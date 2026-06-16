# Contributing to Council for Slack

> 中文版: [`CONTRIBUTING.zh-CN.md`](./CONTRIBUTING.zh-CN.md) (路上)

Thanks for looking at the code. The repo is private during hackathon judging — public release + OAuth install flow scheduled for 2026-06-25. PRs from collaborators welcome before then; issues open to anyone.

## What kind of change makes sense

| Type | Welcome | Notes |
|---|---|---|
| Bug fix on the deliberation path | yes, anytime | include the Slack event payload + the actual vs expected behavior |
| New domain roster | yes, but propose via issue first | each new domain wires into [`council-diff`](https://github.com/alex-jb/council-diff), not just here |
| New Slack surface (e.g. message tab, slash variant) | yes, but coordinate via issue | manifest changes mean re-install; keep the change isolated |
| New 3rd-party integration (Jira, Linear, GitHub) | propose first | the wedge is Slack-native ritual, not "AI gateway to everything" |
| Documentation / translation | yes, anytime | bilingual EN + zh-CN per the project rule; add a language switcher at the top |
| Brier scoring changes | yes, but with citations | this is the calibration math, anything that touches `(forecast − outcome)²` needs a numbered argument and ideally a backtest |

## Before you open a PR

1. **Read the code, not the docs.** The repo evolves faster than the README. Start at `web/pages/api/slack/events.ts` (handler) → `web/lib/db.ts` (persistence) → `migrations/*.sql` (schema).
2. **Run the build locally.** `cd web && npm run build` must pass. Vercel build minutes cost real money — never push assuming CI will catch it.
3. **Test against a real Slack workspace.** This repo has zero test coverage today and the Slack/Vercel integration is the load-bearing surface. Fire `/council` against your sandbox before requesting review.
4. **Migrations are manually applied.** No Supabase CLI. Drop the SQL into `migrations/` numbered sequentially + paste into Supabase Dashboard SQL Editor. Include a `-- Idempotent.` comment.
5. **Keep `processBeforeResponse: true`.** Both `ExpressReceiver` and `App` constructors need it. Removing it kills the in-flight deliberation Promise on Vercel.

## Code style

- TypeScript strict. No `any` without a comment.
- Comments only when the *why* is non-obvious. The *what* should be in the names.
- No imported test framework yet (`web/tests/` doesn't exist). If you add tests, propose the framework in the same PR.
- No emojis in code or commits unless the user-facing string genuinely benefits.
- Commit messages: imperative present tense. Reference the day if applicable: `feat(slack): Day N — ...`.

## What we will not accept

- "AI gateway" features — multi-provider routing, model fallback, embeddings cache. council-diff handles provider abstraction; Slack handles surface.
- New persistence layers. Supabase + `council` schema + SECURITY DEFINER RPCs is the pattern. No service_role, no direct table writes from app code.
- Marketplace prep. Custom-function apps cannot be Marketplace-listed per [Slack docs](https://docs.slack.dev/workflows/workflow-steps). The Best New Slack Agent track is the target.
- Removing the Brier audit. If it's not scored against reality, it's not Council for Slack.

## Filing an issue

| For | Use this template |
|---|---|
| Bug | "What you did" → "What you expected" → "What happened" → Slack/Vercel logs |
| Feature | "Who has this problem" → "What single decision shape this changes" → "Why the council surface beats a Workflow Builder native step" |
| Question | Just ask. Bilingual EN + 中文 both fine. |

## Security

See [`SECURITY.md`](./SECURITY.md). Short version: if you find a way to bypass the SECURITY DEFINER RPCs or extract another workspace's decisions, email the author directly — don't open a public issue.

## License

MIT. By contributing you agree your contributions are MIT-licensed.

## Acknowledgements

- [council-diff](https://github.com/alex-jb/council-diff) — the deliberation engine, also OSS.
- [@slack/bolt](https://github.com/slackapi/bolt-js) — the Slack platform SDK.
- Karpathy's [LLM Council](https://twitter.com/karpathy/status/llm-council) framing.
- The four 2026 voices in the [README "Why this thesis is not new"](./README.md#why-this-thesis-is-not-new--and-why-it-still-wins) section.
