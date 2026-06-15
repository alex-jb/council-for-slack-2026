#!/usr/bin/env bash
# Council-for-Slack — Day 1 environment setup.
#
# Run sequentially. Each step prints what you need to do in a browser.
#
#   bash ~/Desktop/council-for-slack-2026/scripts/setup-day1.sh
#
# After this script completes, you have:
# - council-for-slack.com domain (or Vercel preview URL if no custom domain)
# - Slack App ID locked
# - .env.local file populated
# - empty Vercel project deployed (ready for Day 2 code work)

set -euo pipefail
cd "$(dirname "$0")/.."

echo "================================================================"
echo "Council-for-Slack — Day 1 setup"
echo "================================================================"

# Step 1: confirm node + npm
echo ""
echo "▶ Step 1: tool check"
command -v node >/dev/null || { echo "ERROR: node not installed"; exit 1; }
command -v npm >/dev/null || { echo "ERROR: npm not installed"; exit 1; }
command -v gh >/dev/null || { echo "ERROR: gh CLI not installed"; exit 1; }
echo "✓ node $(node --version), npm $(npm --version), gh $(gh --version | head -1)"

# Step 2: open Slack Developer Portal in browser
echo ""
echo "▶ Step 2: lock Slack App ID"
echo ""
echo "    Open https://api.slack.com/apps → 'Create New App' → 'From a manifest'."
echo "    Paste the YAML from ./docs/slack-app-manifest.md."
echo "    Save → install to your personal sandbox workspace."
echo "    Copy the App ID + tokens into .env.local (template below)."
echo ""
echo "    Press Enter when you've created the app and have the App ID."
read -r

# Step 3: prompt for .env.local
echo ""
echo "▶ Step 3: write .env.local"
if [ ! -f .env.local ]; then
  cat > .env.local <<'EOF'
# Slack (from Slack Developer Portal "Basic Information" and "Install App")
SLACK_APP_ID=
SLACK_SIGNING_SECRET=
SLACK_BOT_TOKEN=
SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=

# Anthropic (from console.anthropic.com)
ANTHROPIC_API_KEY=

# Brier / decision persistence
# Supabase free tier: https://supabase.com/dashboard
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
EOF
  echo "✓ wrote .env.local template — fill in values before Day 2"
else
  echo "✓ .env.local already exists, skipping template"
fi

# Step 4: init github repo (private until launch day)
echo ""
echo "▶ Step 4: init GitHub repo"
if [ ! -d .git ]; then
  git init -q
  git add -A
  git commit -q -m "Day 1: spec + manifest + setup script"
  gh repo create alex-jb/council-for-slack --private --source=. --push
  echo "✓ pushed private repo: https://github.com/alex-jb/council-for-slack"
else
  echo "✓ git already initialized, skipping"
fi

# Step 5: register Vercel project shell
echo ""
echo "▶ Step 5: Vercel project"
echo ""
echo "    Open https://vercel.com/new → import alex-jb/council-for-slack"
echo "    Framework preset: 'Other'"
echo "    Add the .env.local vars to Vercel Settings → Environment Variables"
echo ""
echo "    Press Enter when project is created on Vercel."
read -r

echo ""
echo "================================================================"
echo "Day 1 complete ✓"
echo ""
echo "Tomorrow (Day 2): npm create slack-bolt-app@latest, swap in"
echo "council-diff as the engine, ship a hello-world slash command."
echo "================================================================"
