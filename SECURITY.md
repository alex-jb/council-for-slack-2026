# Security policy

## Reporting

Please open a private security advisory on GitHub:
https://github.com/alex-jb/council-for-slack-2026/security/advisories/new

Or email the author directly (see GitHub profile). Do **not** open public issues for security bugs.

## Threat model

This service handles Slack workspace data and writes to a shared Supabase instance. It does not handle payment data, PII beyond Slack user/team IDs, or end-user authentication.

**Hardening choices**:
- Slack request signature verification on every POST (`@slack/bolt` `signing_secret` check; unsigned requests get HTTP 401).
- Supabase `anon` key only. No `service_role` in app code. All DB access via `SECURITY DEFINER` RPCs in `public` schema that validate input then write to the isolated `council` schema. The `council.decisions` table has RLS deny-all policies for `anon` and `authenticated` — the RPC path is the only door.
- Workspace tenancy enforced inside every RPC (`p_workspace_id` parameter must match the row being read or resolved).
- Env vars stored as Vercel "Sensitive" (one-way encrypted). Local `.env.local` is `chmod 600` and gitignored.
- Anthropic API key only used server-side. Never exposed to Slack clients or browsers.

**Known caveats**:
- Anon-key rate-limiting is not enforced inside the RPC layer (yet). Spam to `council_decision_insert` would burn Anthropic credits without resolution. Workspace-scoped rate limit is on the Day 6 roadmap.
- No end-user Supabase auth — the Slack bot is the only writer. This is intentional for the architecture; do not "fix" this by sprinkling service_role around.
