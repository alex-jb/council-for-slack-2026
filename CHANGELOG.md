# Changelog

Council for Slack — ship log. Days numbered from the Splunk + Band of Agents hackathon week kickoff (2026-06-13). Format follows Keep-a-Changelog ish; targeted at hackathon judges reviewing daily progression.

## Day 11 — 2026-06-16

### Added

- **Workspace calibration meta-metric** in `/council-audit` header. Single labelled number (`excellent` < 0.10 / `good` / `fair` / `needs-work`) over the workspace's avg Brier across all resolved decisions. Teams compete on a number that drifts in real-time as decisions land.
- Migration `003_workspace_stats.sql` with `council_workspace_stats(workspace_id)` SECURITY DEFINER RPC.
- `getWorkspaceStats()` in `web/lib/db.ts` with soft-null handling so audit still renders if the migration isn't applied yet.
- Third case study: [Rust rewrite of Python inference router](./docs/case-studies/rust-rewrite-2026-06.md) — `engineer` domain, WAIT verdict, 50-point voice spread (widest of the triad).
- Second case study: [Annual billing at "2 months free"](./docs/case-studies/annual-billing-2026-06.md) — `founder` domain, GO verdict, 0.89 agreement, 16-point voice spread.
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
