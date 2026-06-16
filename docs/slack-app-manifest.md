# Slack App Manifest — Council

Copy-paste this YAML into the Slack Developer Portal **before any code work** to lock the App ID for hackathon submission proof.

URL: https://api.slack.com/apps → "Create New App" → "From a manifest"

```yaml
display_information:
  name: Council
  description: The production layer Karpathy's LLM Council was always missing — 5 personas + Oracle adjudicator + Brier audit, native in Slack.
  background_color: "#1A1A1A"
  long_description: >
    Council is a Slack-native multi-persona AI council for high-stakes team decisions.
    Built on the open-source council-diff engine (npm v0.4.0, MIT).
    Invoke /council [question]. Five personas (Founder, Strategist, Security, Skeptic,
    User Advocate) reply in thread. The Skeptic pulls fresh workspace state via
    Real-Time Search to surface facts the user may not know.
    The Oracle adjudicates and can override the user's instinct when warranted.
    Every decision is logged to a workspace Canvas and Brier-audited over time.

features:
  bot_user:
    display_name: Council
    always_online: true
  slash_commands:
    - command: /council
      url: https://council-for-slack.vercel.app/slack/events
      description: Convene a 5-persona council to deliberate a decision
      usage_hint: "[your decision question]"
      should_escape: false
    - command: /council-audit
      url: https://council-for-slack.vercel.app/slack/events
      description: Show this workspace's Brier-calibrated decision history
      should_escape: false

oauth_config:
  redirect_urls:
    - https://council-for-slack.vercel.app/slack/oauth_redirect
  scopes:
    bot:
      - commands
      - chat:write
      - chat:write.public
      - users:read
      - channels:history
      - channels:read
      - canvases:write
      - canvases:read
      - search:read
      - mcp:read
      - mcp:write
      # search:read enables Real-Time Search API access
      # canvases:* enables the decision log
      # mcp:* enables MCP server integration

settings:
  event_subscriptions:
    request_url: https://council-for-slack.vercel.app/slack/events
    bot_events:
      - app_mention
      - message.im
  interactivity:
    is_enabled: true
    request_url: https://council-for-slack.vercel.app/slack/events
  org_deploy_enabled: false
  socket_mode_enabled: false
  token_rotation_enabled: false

# Day 9 — message-action shortcut "Send to council"
# In the Slack app config UI: Interactivity & Shortcuts → "Create New Shortcut" → "On messages"
#   Name: Send to council
#   Short description: Get a 5-persona AI council to deliberate on this message
#   Callback ID: send_to_council
shortcuts:
  - name: Send to council
    type: message
    callback_id: send_to_council
    description: Get a 5-persona AI council to deliberate on this message

# Day 10 — Workflow Builder custom function "Council deliberate"
# Non-coder Slack admins can drop this into any Workflow Builder workflow.
# After installing the app, admins find it in Workflow Builder → "Add step" → "Custom".
# Handler: app.function("council_deliberate", ...) in web/pages/api/slack/events.ts.
functions:
  council_deliberate:
    title: Council deliberate
    description: Convene a 5-persona AI council on a decision and post the verdict to a channel.
    input_parameters:
      question:
        type: string
        title: Question
        description: The decision question to deliberate
        is_required: true
      channel_id:
        type: slack#/types/channel_id
        title: Channel
        description: Where to post the council verdict
        is_required: true
      domain:
        type: string
        title: Domain
        description: founder (default) · engineer · investor · career · product · quant
        is_required: false
      context:
        type: string
        title: Context (optional)
        description: Ground truth — numbers, constraints, dates — improves score quality
        is_required: false
      requester_id:
        type: slack#/types/user_id
        title: Requested by
        description: User who triggered the workflow (for attribution on the canvas log)
        is_required: false
    output_parameters:
      verdict:
        type: string
        title: Verdict
        description: GO · WAIT · KILL · SPLIT
        is_required: true
      recommendation:
        type: string
        title: Recommendation (lowercase)
        description: go · wait · kill · split — same as verdict, lowercase for downstream conditional steps
        is_required: true
      agreement_score:
        type: number
        title: Agreement score
        description: 0-1, how much the 5 voices align (1 = unanimous, 0 = full split)
        is_required: true
      consensus:
        type: string
        title: Consensus
        description: 1-paragraph consensus quote
        is_required: true
      summary:
        type: string
        title: Summary
        description: One-line summary fit for downstream Slack message steps
        is_required: true
      decision_id:
        type: string
        title: Decision ID
        description: Persistent ID — feed to a later /council-audit step or resolve workflow
        is_required: false
```

## After save

1. Copy the **App ID** (looks like `A06XXXXXXXX`) → paste into `.env.local`:
   ```
   SLACK_APP_ID=A06XXXXXXXX
   SLACK_SIGNING_SECRET=<from "Basic Information" tab>
   SLACK_BOT_TOKEN=<from "Install App" tab — install to sandbox workspace first>
   SLACK_CLIENT_ID=<from "Basic Information" tab>
   SLACK_CLIENT_SECRET=<from "Basic Information" tab>
   ```

2. **Install the app** to your personal sandbox workspace (top-left → "Install to Workspace").

3. **Lock the App ID for the Devpost submission proof** — screenshot the page showing the App ID + your app's name.

## Why this manifest shape

- `slash_commands` × 2: `/council` (the main flow) + `/council-audit` (Brier history viewer for judges to see)
- `functions: council_deliberate`: Workflow Builder custom step — one of three rubric-required technologies for Slack Agent Builder Challenge. Lets non-coder admins compose council into their own automations.
- `shortcuts: send_to_council`: right-click any message → AI council. The viral wedge — hot takes become calibrated decisions in two clicks.
- `mcp:read mcp:write`: enables Council to expose itself as an MCP server to other Slack agents (cross-agent collaboration showcase) — second rubric-required tech via the `mcp/` package.
- `search:read`: enables Real-Time Search API for the Skeptic + Strategist persona context augmentation
- `canvases:*`: enables the persistent decision log
- `org_deploy_enabled: false`: solo founder, single sandbox install — flip to `true` only if filing for the Orgs track (which we are not because Marketplace review takes 10 weeks)

## Workflow Builder smoke test (after re-installing the app)

1. In Slack: lightning bolt → "Build a workflow" → "From scratch"
2. Pick trigger: "From a webhook" or "When a person reacts" (any trigger)
3. Click "Add step" → "Custom" tab → search "Council deliberate"
4. Map inputs: question = `{{trigger.text}}`, channel_id = `{{trigger.channel}}`
5. Publish + fire the trigger
6. Verdict posts to the channel; downstream steps can reference `{{step.summary}}`, `{{step.recommendation}}`, etc.

Watch Vercel logs for `function_executed` events on first run. The handler returns within Slack's function-execution window via `complete({outputs})`.
