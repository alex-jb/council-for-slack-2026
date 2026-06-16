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
- `mcp:read mcp:write`: enables Council to expose itself as an MCP server to other Slack agents (cross-agent collaboration showcase)
- `search:read`: enables Real-Time Search API for the Skeptic + Strategist persona context augmentation
- `canvases:*`: enables the persistent decision log
- `org_deploy_enabled: false`: solo founder, single sandbox install — flip to `true` only if filing for the Orgs track (which we are not because Marketplace review takes 10 weeks)
