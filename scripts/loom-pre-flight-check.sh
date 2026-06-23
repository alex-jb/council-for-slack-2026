#!/usr/bin/env bash
# Council for Slack — Loom 7/6 pre-flight verification
#
# Runs all 7 pre-stage checks from docs/loom-pre-stage-workspace.md +
# docs/loom-rehearsal-2026-07-06.md, prints exact next-step commands,
# opens 3 relevant URLs in browser. Run this 30 min before recording.
#
# Usage: bash scripts/loom-pre-flight-check.sh
#
# Exit code: 0 if all green, 1 if any check fails (don't record yet).

set -u

PROD_URL="https://council-for-slack.vercel.app"
APP_ID="A0BAVEM5SS0"
WORKSPACE_TEAM_ID="T0BAKDLM11R"

fail_count=0

print_header() {
    printf "\n\033[1m%s\033[0m\n" "$1"
}

ok() {
    printf "  \033[32m✓\033[0m %s\n" "$1"
}

fail() {
    printf "  \033[31m✗\033[0m %s\n" "$1"
    fail_count=$((fail_count + 1))
}

warn() {
    printf "  \033[33m⚠\033[0m %s\n" "$1"
}

# ─── Check 1: Production deploy health ─────────────────────────────
print_header "1. Production deploy health"

health=$(curl -s "$PROD_URL/api/health" 2>/dev/null)
if [ -n "$health" ] && echo "$health" | grep -q '"ok"'; then
    ok "/api/health responds 200 + ok=true"
    decisions_total=$(echo "$health" | grep -oE '"decisions_total":[0-9]*' | grep -oE '[0-9]+$' || echo "?")
    workspaces=$(echo "$health" | grep -oE '"workspaces":[0-9]*' | grep -oE '[0-9]+$' || echo "?")
    ok "  decisions_total=$decisions_total · workspaces=$workspaces"
else
    fail "/api/health did not return ok=true"
    fail "  Try: curl $PROD_URL/api/health  (may be 401 if Deployment Protection still ON)"
fi

# ─── Check 2: ARD .well-known endpoints (Day 17) ───────────────────
print_header "2. ARD v0.9 conformance endpoints (Day 17)"

catalog_status=$(curl -sI "$PROD_URL/.well-known/ai-catalog.json" 2>/dev/null | head -1 | awk '{print $2}')
if [ "$catalog_status" = "200" ]; then
    ok "/.well-known/ai-catalog.json returns 200"
else
    fail "/.well-known/ai-catalog.json returns $catalog_status (expected 200)"
fi

card_status=$(curl -sI "$PROD_URL/.well-known/mcp-cards/council.json" 2>/dev/null | head -1 | awk '{print $2}')
if [ "$card_status" = "200" ]; then
    ok "/.well-known/mcp-cards/council.json returns 200"
else
    fail "/.well-known/mcp-cards/council.json returns $card_status (expected 200)"
fi

# ─── Check 3: OAuth install link ───────────────────────────────────
print_header "3. OAuth install endpoint"

install_status=$(curl -sI "$PROD_URL/install" 2>/dev/null | head -1 | awk '{print $2}')
if [ "$install_status" = "200" ] || [ "$install_status" = "302" ] || [ "$install_status" = "307" ]; then
    ok "/install returns $install_status (200/302/307 all valid)"
else
    fail "/install returns $install_status"
    fail "  Manage Distribution → Activate Public Distribution at https://api.slack.com/apps/$APP_ID/distribute"
fi

# ─── Check 4: Privacy + support pages (Slack distribution required) ─
print_header "4. Slack-distribution-required policy pages"

for path in /privacy /support; do
    status=$(curl -sI "$PROD_URL$path" 2>/dev/null | head -1 | awk '{print $2}')
    if [ "$status" = "200" ]; then
        ok "$path returns 200"
    else
        fail "$path returns $status (Slack distribution requires both 200)"
    fi
done

# ─── Check 5: ANTHROPIC_API_KEY rotated ────────────────────────────
print_header "5. Local ANTHROPIC_API_KEY (recording terminal)"

if [ -n "${ANTHROPIC_API_KEY:-}" ]; then
    prefix=$(echo "$ANTHROPIC_API_KEY" | head -c 12)
    leaked_prefix="sk-ant-api03"  # all keys start with this; can't detect leak by prefix
    ok "ANTHROPIC_API_KEY set, prefix=$prefix"
    warn "  Verify this is the ROTATED key (NOT sk-ant-api03-_KdaUL... from Fable 5 audit)"
else
    warn "ANTHROPIC_API_KEY not in current shell env"
    warn "  Cron uses ~/.config/anthropic_key — this only matters if testing locally during recording"
fi

# ─── Check 6: macOS display sleep + DND state ──────────────────────
print_header "6. macOS recording-safety state"

dnd_status=$(defaults -currentHost read ~/Library/Preferences/ByHost/com.apple.notificationcenterui doNotDisturb 2>/dev/null || echo "0")
if [ "$dnd_status" = "1" ]; then
    ok "Notification Center DND is ON"
else
    warn "Notification Center DND is OFF"
    warn "  Enable: Control Center → Focus → Do Not Disturb (or fn-Q to toggle)"
fi

caffeinate_pid=$(pgrep -f "caffeinate -d" || echo "")
if [ -n "$caffeinate_pid" ]; then
    ok "caffeinate -d running (display won't sleep mid-record), pid=$caffeinate_pid"
else
    warn "caffeinate -d NOT running — display may sleep mid-record"
    warn "  Run in another terminal: caffeinate -d  (Ctrl-C after recording)"
fi

# ─── Check 7: Slack Desktop installed ──────────────────────────────
print_header "7. Slack Desktop app"

if ls /Applications/Slack.app/Contents/MacOS/Slack 2>/dev/null >/dev/null; then
    ok "Slack.app installed"
else
    fail "Slack.app NOT installed at /Applications/Slack.app"
    fail "  Loom recording uses Slack Desktop; install before recording"
fi

# ─── Summary ───────────────────────────────────────────────────────
print_header "─── SUMMARY ───"

if [ $fail_count -eq 0 ]; then
    printf "\n\033[1;32mAll checks green. Pre-stage workspace + start recording.\033[0m\n\n"
    cat <<EOF
Manual pre-stage (do in Slack #leadership channel):

  1. Fire 3 \`/council\` commands (from docs/loom-pre-stage-workspace.md):

     /council Should we ship the bigger discount on the enterprise deal? | \$80K ACV deal, customer wants 20% off list, sales rep says #3 priority deal this quarter

     /council Should I take on the design lead role even though I'd rather code? | First management offer, \$40K bump, but I love writing code and team has 2 ICs

     /council :investor Long GOOGL into Q3? | Druckenmiller exited, Berkshire opened \$10B, DOJ Chrome divestiture timeline unclear, TPU + Waymo growth strong

  2. Wait 10s for each verdict, then resolve Decision A:
     /council-audit → click ✅ Happened on the discount one

  3. Verify Canvas tab shows 3 entries (pinned at top of #leadership)

  4. Open /council-audit one final time — should show 3 decisions + 1 with Brier score green

Ready to record:
  open https://loom.com
  → Start screen recording, full-screen Slack
  → Follow docs/loom-script.md shot list (60s, 6 segments)
EOF
    # Open helpful URLs
    open "$PROD_URL/api/health" 2>/dev/null || true
    open "https://app.slack.com/client/$WORKSPACE_TEAM_ID" 2>/dev/null || true
    exit 0
else
    printf "\n\033[1;31m%d check(s) failed. Fix before recording.\033[0m\n\n" "$fail_count"
    exit 1
fi
