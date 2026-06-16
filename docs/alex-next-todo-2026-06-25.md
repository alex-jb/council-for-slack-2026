# Alex 接下来的手动事项 (in priority order)

> Code 全 ship 完了。剩这几件是 Slack/Vercel/marketing 平台需要 Alex 的眼睛/账户。

## 🟡 待你决定 — Slack Developer Sandbox 绑卡 + provision

入会完了 (https://api.slack.com/developer-program/dashboard "Welcome Xiaoyu Ji"). 还差最后两步:

1. 用 **virtual card** (Privacy.com 限额 $1) 绑 payment method,Slack 政策 sandbox 完全免费但要 identity verify
2. Provision sandbox workspace → 等邀请邮件 (~24h)
3. 拿到 sandbox URL 后 ping 我,我帮装 `docs/slack-app-manifest-with-functions.json` + 验证 Workflow Builder 里看到 `council_deliberate` 出现

不绑也可以 — Devpost submission 写 "code-complete, sandbox provision deferred" 也算诚实立场,但拍 Loom 时少一段 Workflow Builder demo 视频。

## 🟡 Vercel Deployment Protection 关一下 (30 sec)

今天 GitHub auto-link 之后,Vercel 把 a9071c1 commit 状态打成 `BLOCKED` (deployment protection 默认开了)。手动 `vercel --prod` 能绕,但每次 push 麻烦。

Settings → Deployment Protection → **Disabled** → Save. 一次关了以后 GitHub push 自动上 prod。

---

## 🔥 立刻 (5 min) — 启用 OAuth distribution

OAuth 安装代码 + DB 全 ready。但 Slack App 默认是 "single workspace install only"。要让外部 workspace 装,要 Alex 启用 distribution。

1. https://api.slack.com/apps/A0BAVEM5SS0
2. 左侧 sidebar → **Manage Distribution**
3. 滚到底 → **Activate Public Distribution**
4. (会要求 Privacy Policy URL + Support URL —— Privacy 给 GitHub README,Support 给 GitHub issues URL 都行)
5. Save

然后 README 顶部 "Add to Slack" 按钮就能被外人点 → 我们的 oauth_redirect 处理 → 自动装好。

**注意**: distribution 启用后,**custom function 那个 with-functions 版本依然 not distributable** (Slack 政策)。Free-plan 版本 OK。

## ⚡ Skills.sh 已 LIVE — 不需要 publish

之前 plan 写错了。Skills.sh 不是 npm publish 模型,**没有 `login`/`publish` command**。它是 **GitHub-as-registry**: 你 push `SKILL.md` 到 root → 任何人 `npx skills add alex-jb/council-diff` 就装 (17 个 agent 平台 universal)。

council-diff v0.4.0 SKILL.md 已 LIVE。验证 (1 min):

```bash
cd /tmp && mkdir -p skills-verify && cd skills-verify
npx skills add alex-jb/council-diff
ls .agents/skills/council-diff/
```

应该看到 `SKILL.md README.md LICENSE` 全装出来。这就是 distribution。

接下来想做的是**让 council-diff 出现在 skills.sh 搜索 / 推荐里** (类似 npm search)。skills.sh 网站现在没有显式 publish API,他们似乎自动 crawl GitHub `SKILL.md` topics。可以 (5 min) 给 council-diff repo 加 GitHub topics: `claude-skill`, `agent-skill`, `skills-sh` 让它 indexable。

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
