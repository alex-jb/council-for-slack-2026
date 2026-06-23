# Changelog

Council for Slack — ship log. Days numbered from the Splunk + Band of Agents hackathon week kickoff (2026-06-13). Format follows Keep-a-Changelog ish; targeted at hackathon judges reviewing daily progression.

## Day 17 — 2026-06-22 / ARD v0.9 conformance MV shipped

### Added

- **`web/public/.well-known/ai-catalog.json`** — capability manifest per ARD spec §4.1 (ards-project/ard-spec v0.9 Draft, 2026-05-28). `specVersion: "1.0"` + host block with `did:web:council-for-slack.vercel.app` identifier + single entry for the MCP server with URN `urn:air:council-for-slack.vercel.app:server:council`. Hosted at the Vercel deployment root so registries crawling `/.well-known/ai-catalog.json` find it automatically. 5 representative queries spanning the 6 supported personas (founder / engineer / investor / career / product / quant) to maximize search-time relevance scoring.
- **`web/public/.well-known/mcp-cards/council.json`** — MCP server card the catalog entry's `url` resolves to. Captures the full `council_deliberate` tool spec verbatim from `mcp/src/server.mjs`: name + description + input schema (domain enum + decision + context + oracle + safeMode) + output schema (recommendation + agreement_score + consensus + voices[]). Annotations block declares `expectedLatencyMs: 10000`, `costUsdEstimate: 0.03`, `deterministic: false`, `sideEffects: "none"` so callers can budget. Top-level `ard.conformsTo` field cites the audited spec version + links the audit doc.

### Why this matters

Closes [#1](https://github.com/alex-jb/council-for-slack-2026/issues/1) — the MV audit plan documented in `docs/ard-audit.md` is now realized. Future Agent Registries (per ARD §6) can index this deployment automatically — no signup, no manual submission. Slack Agent Builder Challenge submission (7/13) can now declare ARD v0.9 conformance honestly. Two deferred items per the audit (trustManifest with SPIFFE attestations + dynamic search endpoint) are out of MV scope; revisit for v1.0.

### Validation

JSON files validated against ARD §3.4 (strict value-or-reference: entry has `url`, no `data`), §4.1 (host identifier present + entries array non-empty), §4.2 (identifier follows `urn:air:<domain>:<type>:<name>` pattern), and cross-consistency (catalog `capabilities[0]` matches card `tools[0].name`).

## Day 14.5 — 2026-06-19 / submission runbook consolidation

### Added

- **`docs/SUBMISSION-RUNBOOK-7-13.md`** — single-source 7/13 submission day runbook compiled from 8 individual docs (loom-script, loom-rehearsal, loom-pre-stage-workspace, devpost-submission, submission-1pager, alex-next-todo, 3week-upgrade-roadmap, distribution-2026-06-16-googl). T-minus calendar from 7/6 → 7/14, pre-flight verifications (3 curl + psql checks), recording 2h block timing, Devpost form-fill field-by-field map, 4 backup demo fallbacks if Loom fails, 4 final-day verification gates, deferred-not-blocker list. Eliminates the "which doc do I open first" friction on submission day.

## Day 11.75 — 2026-06-16 late night / distribution + telemetry

### Added

- **`/installed` real-time workspace counter** — pulls from new `council_installation_count()` SECURITY DEFINER RPC (count of `council.installations` with `uninstalled_at IS NULL`). Renders "Council is live in N workspaces today" below the success message. SSR, no JS hydration, free social proof for Devpost judges.
- **`/privacy` page** (static SSG) — Slack distribution-required policy URL. Explains storage (Supabase RLS deny-all + 7 SECURITY DEFINER RPCs), what gets sent to Anthropic + Mythos `safeMode` opt-out, no sale / no ads / no cross-workspace / no DM scanning, and how to delete via uninstall.
- **`/support` page** (static SSG) — 3-command quick reference (`/council`, `/council :domain`, `/council-audit`), how to file an issue, 4 common FAQs (Brier math / convergence / custom personas / export), 24h response SLA, uninstall path.
- **Enriched `/api/health`** — returns `{ok, service, version, ts, workspaces, decisions_total, decisions_resolved, avg_brier, calibration}` instead of just `{ok}`. Pulls live counts via `council_workspace_stats()` + `council_installation_count()`. Devpost judge `curl council-for-slack.vercel.app/api/health` immediately sees production telemetry.
- README Policies section linking `/privacy`, `/support`, and the live install counter so Slack reviewers + judges land on the right URLs.

### Fixed
- council-diff dependency bumped from `0.4.0` (Anthropic SDK CVE GHSA-p7fg-763f-g4gf) to GitHub tag `v0.4.2` (audit-clean). `npm audit` now reports 0 vulns from council-diff. Postcss < 8.5.10 transitive vuln from Next.js 16.2.9 remains upstream — accepted as not-runtime-exploitable.
- README version refs synced to council-diff `v0.4.2` (was `v0.4.0`) and Supabase RPC count updated to 7 (was 3).

### Operations
- Slack App Distribution **enabled** by Alex via Manage Distribution → Activate Public Distribution. AJ Bot workspace `T0BAKDLM11R` installed via OAuth as the first end-to-end test. `council.installations` table has 1 row with 10 scopes.
- Vercel project linked to GitHub repo for auto-deploy. Previous 4 commits had stuck in queue because the project was unlinked; manual `vercel --prod` unblocked the install-count + /privacy + /support deploys.

## Day 11.5 — 2026-06-16 evening

### Added

- **OAuth install flow** — `Add to Slack` button in the README. Judges and external users install to their own workspace in one click. The Free-plan manifest version installs cleanly (slash + Canvas + Brier audit); the with-functions manifest still requires Pro/Sandbox.
- Migration `004_oauth_installations.sql` with `council.installations` table (RLS deny-all) and two SECURITY DEFINER RPCs: `council_installation_upsert` for the redirect handler, `council_get_install_token` for the events handler.
- `web/pages/api/slack/oauth_redirect.ts` — exchanges Slack code for bot_token, upserts via RPC, redirects to `/installed` success page.
- `web/pages/installed.tsx` — success page with "Open Slack" deep link and the first `/council` command to try.
- `lib/db.ts:getInstallToken()` with 60s in-process cache (avoids ~20ms Supabase round-trip on every Slack event).
- Bolt `authorize` callback resolves inbound `team_id` to its installed `bot_token`, falling back to env `SLACK_BOT_TOKEN` for sandbox use.

## Day 11 — 2026-06-16

### Added

- **Workspace calibration meta-metric** in `/council-audit` header. Single labelled number (`excellent` < 0.10 / `good` / `fair` / `needs-work`) over the workspace's avg Brier across all resolved decisions. Teams compete on a number that drifts in real-time as decisions land.
- Migration `003_workspace_stats.sql` with `council_workspace_stats(workspace_id)` SECURITY DEFINER RPC.
- `getWorkspaceStats()` in `web/lib/db.ts` with soft-null handling so audit still renders if the migration isn't applied yet.
- Fourth case study: [Crypto payments on a B2B SaaS](./docs/case-studies/crypto-payments-2026-06.md) — `founder` domain, **KILL** verdict, 0.94 agreement (highest), 8-point voice spread (tightest). Completes the GO / WAIT / KILL verdict spectrum.
- Third case study: [Rust rewrite of Python inference router](./docs/case-studies/rust-rewrite-2026-06.md) — `engineer` domain, WAIT verdict, 50-point voice spread (widest of the quartet).
- Second case study: [Annual billing at "2 months free"](./docs/case-studies/annual-billing-2026-06.md) — `founder` domain, GO verdict, 0.89 agreement, 16-point voice spread.
- `CONTRIBUTING.md` + `CODE_OF_CONDUCT.md` — OSS hygiene for judges and future contributors. "Disagreement is the signal" + "scored claims only" baked into the conduct rules — the project's own thesis applied to how we build it.
- README "Three Slack-native surfaces, one engine" section calling out 3/3 rubric-required tech up front for judges.
- README "Who uses this" section with 5 personas (solo founder, PM, eng lead, investment analyst, CTO).
- `docs/devpost-submission.md` — copy-paste pack for the Devpost submission form.

## Day 10 — 2026-06-16

### Added

- **Workflow Builder custom function `council_deliberate`** — third Slack Agent Builder rubric-required technology (alongside MCP + Channel Canvas). Non-coder admins drop "Council deliberate" into any Workflow Builder workflow.
- Manifest `functions:` block with typed channel/user parameters and 6 output parameters (`verdict`, `recommendation`, `agreement_score`, `consensus`, `summary`, `decision_id`).
- `docs/workflow-builder.md` — pitch, install instructions, smoke test, plan caveats (custom-function apps cannot be Marketplace-listed per Slack docs, so Best New Slack Agent track is the target).
- `docs/loom-script.md` — 60s shot-by-shot demo script that opens on the Brier audit, not the deliberation (per Slack rubric "first 60s is where the prize is won").
- `docs/distribution-2026-06-16-googl.md` — 5-channel copy-paste pack for the GOOGL case study (X / LinkedIn / 小红书 / Show HN / dev.to).

## Day 9 — 2026-06-15

### Added

- **"Send to council" message-action shortcut** — right-click any Slack message → modal with domain picker + optional context → verdict posts as a thread reply on the source message + Canvas log gets a new entry. The viral wedge for the second-opinion ritual.
- Modal view with `private_metadata` round-trip for channel + message timestamp.

## Day 8 — 2026-06-15

### Added

- **Channel Canvas as decision log** — every `/council` fire auto-appends a Brier-audited entry to the channel's pinned Canvas. Fire-and-forget; never blocks the user verdict.
- `appendCanvasLog()` helper using `conversations.canvases.create` + `canvases.edit` with `insert_at_end` operation.
- Discovered + worked around: Slack Canvas markdown silently drops blocks containing `:emoji_shortcode:` or `<@USERID>` mentions. Use Unicode emoji + plain text only.

## Day 7 — 2026-06-15

### Added

- **Multi-domain syntax** `/council :investor [decision] | [context]` — six rosters: `founder` (default), `engineer`, `investor`, `career`, `product`, `quant`.
- `parseDomain()` helper that accepts both `:investor` and `investor` prefixes.

## Day 6 — 2026-06-15

### Added

- **MCP server scaffold** at `mcp/` — same council-diff primitive exposed as MCP tool for Claude Desktop / Cursor / Claude Code. Second Slack Agent Builder rubric-required technology.
- Graceful Fable 5 unavailable fallback in MCP server — silently downgrades to Sonnet 4.6 when Mythos oracle isn't reachable.

## Day 5 — 2026-06-15

### Added

- **Context pipe** `/council [decision] | [context]` so personas get ground truth.
- **Block Kit ✅ Happened / ❌ Did not happen buttons** in `/council-audit` history.
- **Brier scoring** at resolution: per-voice + council recommendation, persisted to `council.decisions.brier_voices` (jsonb) + `brier_council` (numeric).
- Validated: same exact question scored `WAIT 77%` no-context → `GO 87%` with-context. Brier 0.040 = (0.8−1)² for a GO recommendation resolved Happened.
- Migration `002_resolve_and_context.sql` with `council_decision_resolve` RPC.

## Day 4 — 2026-06-15

### Added

- **Supabase persistence** for every `/council` fire on a `council` schema, three SECURITY DEFINER RPCs (`council_decision_insert`, `council_decisions_recent`, `council_decision_resolve`). Anon key only. No service_role in app code. RLS deny-all on the table; RPC path is the only door.
- `/council-audit` slash command shows the workspace's decision history.
- Cohabits with VibeXForge in the same Supabase project (free-tier 2-project limit).

## Day 3 — 2026-06-15

### Added

- **5-persona deliberation live in Slack via Anthropic Sonnet 4.6** — `/council [decision]` → ephemeral "convening" → 5 parallel persona calls → in-channel verdict via `response_url` POST.
- council-diff v0.4.0 integration.
- `processBeforeResponse: true` on both ExpressReceiver and App constructors — the FaaS pattern required on Vercel serverless. Without it, ack() terminates the function instance before deliberation completes.

## Day 2 — 2026-06-14

### Added

- **Bolt JS scaffold + Vercel deploy** with hello-world `/council`.
- Discovered + fixed: `ExpressReceiver({ endpoints: "/" })` does NOT match `/api/slack/events` path that Next.js forwards. Fix: `req.url = "/"` in the Next.js API handler before delegating to `receiver.app`.

## Day 1 — 2026-06-13

### Added

- **Slack App manifest + App ID `A0BAVEM5SS0` + locked scopes** for hackathon submission proof.
- Initial scopes: `commands`, `chat:write`, `chat:write.public`, `users:read`, `channels:history`, `channels:read`, `canvases:write`, `canvases:read`.
- `search:read` deferred until RTS beta enrollment.

---

## Day 12-13 — planned

- AMD MI300X vLLM portable backend (2h leverage play, not full submission — see [AMD re-eval](https://github.com/alex-jb/alex-brain) memo).
- Loom 60s demo recording (script ready at `docs/loom-script.md`).
- README zh-CN translation (`README.zh-CN.md`).
- Devpost submission filing.
- Marketplace decision by 2026-06-22 (note: custom-function apps cannot be Marketplace-listed per Slack docs).

## Week 2 — planned

- Public OAuth install flow (multi-workspace).
- Cross-workspace calibration leaderboard.
- Real-Time Search API integration once search:read beta is enrolled.
