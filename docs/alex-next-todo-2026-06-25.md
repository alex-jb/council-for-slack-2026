# Alex 接下来的手动事项 (in priority order)

> Code 全 ship 完了。剩这几件是 Slack/Vercel/marketing 平台需要 Alex 的眼睛/账户。

## 🔥 立刻 (5 min) — 启用 OAuth distribution

OAuth 安装代码 + DB 全 ready。但 Slack App 默认是 "single workspace install only"。要让外部 workspace 装,要 Alex 启用 distribution。

1. https://api.slack.com/apps/A0BAVEM5SS0
2. 左侧 sidebar → **Manage Distribution**
3. 滚到底 → **Activate Public Distribution**
4. (会要求 Privacy Policy URL + Support URL —— Privacy 给 GitHub README,Support 给 GitHub issues URL 都行)
5. Save

然后 README 顶部 "Add to Slack" 按钮就能被外人点 → 我们的 oauth_redirect 处理 → 自动装好。

**注意**: distribution 启用后,**custom function 那个 with-functions 版本依然 not distributable** (Slack 政策)。Free-plan 版本 OK。

## ⚡ 今天稍后 (1 min) — Skills.sh 上架 council-diff

跟 marketing-agent 一样 dogfood。

```bash
cd /Users/alexji/Desktop/council-diff
npx skills login        # 一次性 OAuth
npx skills publish      # 用 skill.json metadata 自动上架
```

第 5 个分发面 + Anthropic Skills standard 时机钩。

## 📅 今晚 / 明天 — fire council-diff launch drafts (Week 1)

文件: `~/.marketing_agent/queue/pending/2026-06-16-council-diff-quartet-launch.md`

按 staggered 节奏发:
- 周二 9am ET HN + dev.to
- 周三 9am ET X + LinkedIn
- 周四 Reddit
- 周五晚 9pm 北京 小红书

## 📅 6/25 — 公开 council-for-slack-2026 repo

```bash
gh repo edit alex-jb/council-for-slack-2026 --visibility public --accept-visibility-change-consequences
```

公开当天 fire `2026-06-25-council-for-slack-public-launch.md` 的 6 channels。

## 📅 7/6 — 一周倒计时 reminder (已设)

macOS Reminders 7/6 9:03 AM 弹出 — "🎬 录 Loom + 填 Devpost"。

那时 4 件必做:
1. 录 60s Loom (`docs/loom-script.md` + `docs/loom-pre-stage-workspace.md`)
2. 4 screenshots → `docs/screenshots/`
3. 填 Devpost (copy 在 `docs/devpost-submission.md`)
4. AMD MI300X 决定 (如果 credit 没到就 DEFER 永久)

---

## 不阻塞 7/13 submission 的 (nice-to-have):

- Slack Developer Sandbox 申请 → 在 Sandbox 重装 with-functions manifest 让 Workflow Builder 真显示 — https://api.slack.com/developer-program/sandbox (1-2 天 approval)
- RTS API (search:read) beta 申请 — Slack 表单
- AMD MI300X credit 等待 + 2h portability proof
- 中文 case study 完整翻译 (现有 zh-CN index 够用,完整版是 polish)

---

## 验证 OAuth 装上了

启用 distribution 后,自己试装一次:

1. 访问 README 顶部 "Add to Slack" 按钮
2. 选 AJ Bot workspace (or 任意你管理的 workspace)
3. Allow
4. 应该跳到 `/installed?status=ok&team=...` 页面
5. Supabase Dashboard SQL Editor 验证:
   ```sql
   select workspace_id, workspace_name, scopes, installed_at
   from council.installations
   order by installed_at desc;
   ```
6. 在新 workspace 发 `/council 测试一下` — 应该看到 verdict
