# ARD spec v0.9 conformance audit

**Date**: 2026-06-21
**Spec audited against**: [ards-project/ard-spec](https://github.com/ards-project/ard-spec) `spec/ard.md` v0.9 (Draft, dated 2026-05-28; authors Junjie Bu / R.V.Guha / Shaun Smith)
**Issue**: [council-for-slack-2026#1](https://github.com/alex-jb/council-for-slack-2026/issues/1)
**Deliverable**: gap table + minimum-viable conformance plan before Slack Agent Builder Challenge submission (2026-07-13 5pm PDT)

---

## TL;DR

This repo has three callable surfaces. ARD v0.9 cares about exactly one of them today (the MCP server). The other two (Slack slash command + Vercel API routes) are not in ARD's scope by design — Slack distribution is a separate ecosystem and HTTP webhooks are not "agentic resources" per the spec's §4.

**To declare ARD v0.9 conformance for Slack Agent Builder submission**, the MV scope is:
1. Publish an `application/mcp-server-card+json` artifact (one file) describing the `council_deliberate` tool
2. Reference that artifact from an `ai-catalog.json` hosted at `/.well-known/ai-catalog.json` on the Vercel deployment
3. Use the URN identifier format `urn:air:council-for-slack.vercel.app:server:council`

Est effort: ~2-3h to land cleanly. Single PR, no architectural change.

---

## Surfaces in this repo + ARD applicability

| Surface | Files | Is this an "agentic resource" per ARD §3? | Action |
|---|---|---|---|
| **MCP server** (`council_deliberate`) | `mcp/src/server.mjs` | ✅ YES — ARD §4.1 example explicitly cites `application/mcp-server-card+json` as a first-class entry type | publish card + catalog entry |
| **Slack slash command** | `web/pages/api/slack/events.ts` + `oauth_redirect.ts` | ❌ NO — Slack distribution is its own ecosystem; ARD does not model Slack workflows or app manifests | out of scope |
| **Vercel API health endpoint** | `web/pages/api/health.ts` | ❌ NO — health checks are infrastructure, not callable agentic resources | out of scope |

ARD v0.9 §3.6 ("Separation of Concerns") supports this read: distribution (Slack app store) is infrastructure, delegated. The spec models discovery of *agentic* resources only.

---

## Gap table — MCP server surface

The only surface in ARD scope. Per spec §4.1 (Capability Manifest) + §4.2 (Catalog Entry Object):

| ARD requirement | Current state | Gap size | Notes |
|---|---|---|---|
| `/.well-known/ai-catalog.json` manifest hosted at the deployment host | ❌ Not present | **S** | One static JSON file. Vercel serves `public/.well-known/` files at the URL path by default in Next.js. |
| Capability manifest `specVersion: "1.0"` field | ❌ Not present | **S** | Single string field in manifest. |
| Manifest `host` block with `displayName` + `identifier` (DID format) | ❌ Not present | **S** | `did:web:council-for-slack.vercel.app` is the canonical DID for a Vercel domain. |
| Entry `identifier` in domain-anchored URN format `urn:air:domain:type:name` (§4.2.1) | ❌ Not present | **S** | `urn:air:council-for-slack.vercel.app:server:council` |
| Entry `type` set to `application/mcp-server-card+json` | ❌ Not present | **S** | Single field. |
| Entry exactly-one-of `url` or `data` (§3.4 Strict Value-or-Reference) | ❌ Not present | **S** | Choose `url` pointing to a hosted MCP card. |
| MCP server card itself (the artifact `url` resolves to) | ❌ Not present — `mcp/src/server.mjs` defines the tool inline but never exports a card JSON | **M** | Generate from the existing `DELIBERATE_TOOL` definition in `mcp/src/server.mjs:22`. ~50 lines of static JSON: name, description, schema, capabilities list. |
| Entry `displayName` | ❌ Not present | **S** | "Council Deliberate" |
| Entry `description` | Partially — exists in `DELIBERATE_TOOL.description` (server.mjs:25) but not as ARD entry | **S** | Copy / adapt. |
| Entry `representativeQueries` (§4.1 example) | ❌ Not present | **S** | E.g. "Should I raise a seed?", "Should I rewrite this service in Rust?" — drawn from the existing `examples/` directory in the council-diff dependency. |
| Entry `capabilities` array (for MCP type) | ❌ Not present | **S** | `["council_deliberate"]` — single tool today; if `council_clarify` (council-diff v0.6, commit 16891c5) gets wrapped, add it. |
| Entry `trustManifest` with attestations (§4.1 example, optional) | ❌ Not present | **M** | Optional per spec. Skip for v0.9 conformance; revisit for v1.0 enterprise sale. |
| Static publishing via `/.well-known/ai-catalog.json` (§6.1) | ❌ Not present | **S** | See first row. |
| Dynamic publishing via `_search._agents.<domain>` DNS binding (§6.1) | ❌ Not present | **L** | Out of MV scope — we don't run our own Agent Registry. Skip. |
| `application/ai-registry+json` REST search endpoint (§3.5) | ❌ Not present | **L** | We're a publisher, not a registry. Skip. |

**Total addressable gap for MV conformance**: 9 small-effort items + 1 medium-effort item (generating the MCP server card itself). Skip the 3 L-effort items entirely — they're for publishers running their own Agent Registry, not a single-deployment Slack agent.

---

## Minimum-viable PR plan (before Slack Agent Builder 7/13)

**Single PR, ~2-3h:**

1. Create `web/public/.well-known/ai-catalog.json` with the manifest structure below
2. Create `web/public/.well-known/mcp-cards/council.json` with the MCP server card structure below
3. Add a CHANGELOG note + a single line in the main README pointing to `/.well-known/ai-catalog.json`
4. (Optional) Add a `validate-ard.test.ts` that loads both files and asserts schema shape, so future edits can't drift

### ai-catalog.json template

```json
{
  "specVersion": "1.0",
  "host": {
    "displayName": "Council for Slack",
    "identifier": "did:web:council-for-slack.vercel.app"
  },
  "entries": [
    {
      "identifier": "urn:air:council-for-slack.vercel.app:server:council",
      "displayName": "Council Deliberate (MCP)",
      "type": "application/mcp-server-card+json",
      "url": "https://council-for-slack.vercel.app/.well-known/mcp-cards/council.json",
      "capabilities": ["council_deliberate"],
      "description": "Fire a 5-persona AI council on a high-stakes decision. Returns GO / WAIT / KILL / SPLIT recommendation with agreement score + per-voice verdicts. Wraps council-diff v0.6.",
      "representativeQueries": [
        "Should I raise a $1M seed or bootstrap?",
        "Should I rewrite this service in Rust?",
        "Is this a buy at 22x forward earnings?"
      ],
      "tags": ["council", "deliberation", "decision-support", "multi-voice"]
    }
  ]
}
```

### MCP server card template (council.json)

Generated from `mcp/src/server.mjs:22` (`DELIBERATE_TOOL`). Card-format follows the de-facto `application/mcp-server-card+json` shape per ARD §3.3 + §3.4 (IANA registration pending per spec note).

```json
{
  "name": "council_deliberate",
  "version": "0.6.0",
  "endpoint": "stdio",
  "transport": "stdio",
  "description": "Wraps council-diff (npm: council-diff) as a single MCP tool.",
  "tools": [
    {
      "name": "council_deliberate",
      "description": "<copied from server.mjs:25 DELIBERATE_TOOL.description>",
      "inputSchema": "<copied from server.mjs:27 DELIBERATE_TOOL.inputSchema>"
    }
  ],
  "publisher": "alex-jb",
  "license": "MIT",
  "homepage": "https://github.com/alex-jb/council-for-slack-2026"
}
```

(The exact MCP card schema is still being formalized upstream. ARD §3.3 explicitly notes "Implementers should note that while well-known path directories (like /.well-known/agent-card.json) are officially registered permanent entries, full type registrations are pending working group joint submission and the format may change." Pinning to the shape used in ARD's own §4.1 example is the lowest-risk choice today.)

---

## What we explicitly defer

These were considered and rejected for the MV scope:

1. **Dynamic search endpoint (Agent Registry)** — ARD §3.5 makes Registries optional for publishers. We are a single-deployment Slack agent, not a multi-tenant registry. Defer indefinitely.
2. **Trust manifest with SPIFFE attestations** — enterprise feature; nice-to-have for v1.0 procurement story, not required for v0.9 conformance.
3. **DNS binding records (`_search._agents.<domain>`)** — for publishers running their own Registry. N/A.
4. **OAuth-flow descriptor for the Slack distribution layer** — ARD does not model Slack OAuth; Slack's own app manifest handles this.

---

## Notes on the spec itself

A few v0.9 ambiguities worth flagging back upstream (separate issue at [ards-project/ard-spec/issues](https://github.com/ards-project/ard-spec/issues)):

- The exact field set of `application/mcp-server-card+json` is referenced as a media type but not strictly defined in the ARD spec itself — it sits in the ai-catalog dependency. Implementers like us are guessing at the field shape.
- §3.4 "Strict Value-or-Reference" — does `data` need to be the full nested entry, or just the card payload? The §4.1 example shows the nested form. Worth confirming before v1.0.
- §6.1 (Discovery Mechanisms) does not specify how a static manifest at `/.well-known/ai-catalog.json` is discovered by a Registry crawler in the first place. Implication: every Registry needs an out-of-band publisher list, or a sitemap-style index. Probably intentional but undocumented.

These don't block the MV PR. Filed here for traceability.

---

## What's next after the MV PR

Once the catalog + card are live and the Slack submission is in:

- **2-week revisit**: read ARD v1.0 draft if published; reconcile any breaking changes (field renames, identifier-format tightening).
- **Tier-2 follow-up**: add a `validate-ard.test.ts` to CI so the catalog can't drift on subsequent commits without a test break.
- **Tier-3 (if regulated-vertical sale starts)**: add `trustManifest` with SOC2 / SPIFFE attestations. This is the enterprise-procurement upgrade path.

---

🤖 Filed via the council-diff audit pipeline (2026-06-21 evening NY). Sources: ards-project/ard-spec spec/ard.md v0.9 + `mcp/src/server.mjs` survey of this repo's actual MCP tool definition.
