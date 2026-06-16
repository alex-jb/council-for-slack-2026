# 3-week upgrade roadmap (2026-06-16 → 2026-07-06)

> 7/13 截止前一周 (7/6) 自动 macOS Reminder 弹出 — 提醒 Alex 录 Loom + 填 Devpost。**这 21 天里所有 build 都是 win-odds 提升,不阻塞 submission 本身**。所有项都是 nice-to-have,不是 must。

## 优先级分层

每条标注:
- **🔥 高 ROI** — 直接影响 rubric 评分或 demo 效果
- **⚙️ 中 ROI** — 锦上添花 / 维护 / 长期 leverage
- **🧪 实验性** — 可能赢可能不赢,worth trying

## Week 1 (6/17-6/23) — distribution + adoption

### 🔥 Fire council-diff distribution (HN + dev.to + 小红书)
- 5-channel launch drafts at `~/.marketing_agent/queue/pending/2026-06-16-council-diff-quartet-launch.md`
- 周二 9am ET HN + dev.to → 周三 X + LinkedIn → 周四 Reddit → 周五 小红书
- Goal: HN front page top 30 (+500-2000 npm installs), GitHub stars 50+
- **Why**: 真实采用证据 → 7/13 提交时 README badge "X stars / Y installs" 是真实 social proof,而不是声明

### 🔥 Anthropic Skills standard 上架 council-diff
- Anthropic 2026-06-09 立 Skills 为 open standard,669K skills 已 published
- council-diff 上架到 skills.sh (npx skills publish) = 第 5 个分发面 + Anthropic 官方背书的 timing 钩
- 1-2h work
- **Why**: 整 stack 已 dogfood Anthropic Skills,但 council-diff 没上 → 这 21 天补这条

### 🔥 公开 council-for-slack repo (6/25 计划)
- 把 repo 设为 public
- 自动触发 council-for-slack launch drafts (我已 draft 在 marketing-agent queue,稍后补)
- 招人 collaborate via CONTRIBUTING.md
- **Why**: 公开后 1-2 周 stars 给 7/13 judges 看真实 traction

### ⚙️ Mid-week ship: README polish + 中文 case study 翻译完整版
- 目前 zh-CN README 完整,case studies 只有 zh-CN index 没有每个 case 的完整翻译
- 周三 翻译 4 个 case study 完整版 (founder-annual-billing.zh-CN.md, etc.)
- **Why**: 中文用户 + 中文 judges 看到原汁原味的 voice quotes

## Week 2 (6/24-7/1) — submission polish + Sandbox upgrade

### 🔥 Slack Developer Sandbox 申请 + Workflow Builder 真上线
- https://api.slack.com/developer-program/sandbox
- 申请 free Sandbox workspace (Enterprise Grid features included)
- 在 Sandbox 装 `slack-app-manifest-with-functions.json` → Workflow Builder picker 真实显示 "Council deliberate"
- 重录 Loom 改用 Sandbox demo
- **Why**: 把 rubric scorecard 从 2/3 live 推到 **3/3 live** — 不靠 "code-ready" excuse,真实跑

### 🔥 OAuth install flow (multi-workspace)
- 当前 single-workspace only
- 加 `/api/slack/oauth_redirect` 处理 (manifest 已有 redirect_url 配置)
- Vercel KV 或 Supabase 存 team_id → bot_token 映射
- 1-2 days work
- **Why**: 7/13 submission 时 judges 可以**直接装到他们自己 workspace**,而不是 read-only 看 demo

### ⚙️ Loom v1 录制 (周日)
- 别等最后一周,先录一遍找问题
- 周日先录 → 周内迭代 script → 7/6 录最终版
- **Why**: 3-take rule 给自己 buffer

### ⚙️ Marketing-agent 跑 council-for-slack 公开后的 launch drafts
- 跟 council-diff 类似的 6-channel 包但聚焦 Slack-native + Brier audit moat
- **Why**: 公开 24h 内有 X impressions 给 7/13 judges 看

### 🧪 RTS API (Real-Time Search) 启用尝试
- search:read scope 需要 RTS beta 批准
- 周一申请,看 7/1 之前有没有批
- 如果批了: 加 "Skeptic" persona 在 deliberate 前调 search.search API 拉 workspace 历史决定作为 context
- **Why**: 第 3 个 rubric required tech 真上线 (with MCP + Canvas + Workflow Builder 改成 4/3)。但要批准 + 时间紧

## Week 3 (7/2-7/6) — final polish week

### 🔥 Loom v2 (best take) — 7/4 周六前完成
- 用 Sandbox workspace (Day 10 真显示)
- 用 docs/loom-pre-stage-workspace.md 30 分钟 pre-stage
- 录 3 takes,挑最好的
- 上传 YouTube unlisted (Devpost embed 友好)

### 🔥 4 张 Devpost 截图
- `/council` verdict / `/council-audit` calibration / Canvas tab / Workflow Builder picker
- 存 `docs/screenshots/`

### 🔥 Devpost 表单填写 + 提交 (7/6-7/13 间)
- copy 在 docs/devpost-submission.md (400 字 description, Built With tags, Try It URL)
- 7/10 之前先提交一版 (Devpost 允许 edit 直到 deadline)
- 7/12 最终 review,7/13 不动

### ⚙️ 中文 launch 配套 (X 中文版 + 微博 + 知乎)
- council-for-slack public 后,中文圈也曝光

## Continuous (整 21 天)

### ⚙️ 每日 6 PM ET — `/council-audit` log check
- 每天看一眼 production logs (`vercel logs`) 有没有错
- DB connection 健康
- 7/13 前不能宕

### ⚙️ AMD MI300X portability proof — 2h 当 credit 到 anytime
- credit link 来了就跑 2h
- council-diff feat/amd-backend branch + 1 个 demo deliberation
- README 加 "Portable on AMD MI300X via vLLM" paragraph + tweet
- 不为 AMD submission,为 council-for-slack pitch leverage

### 🧪 council-for-slack iOS widget (~~实验~~ 删)
- iOS 设计了一个 widget 显示工作区 Brier label,但 implementing 跨 Slack auth 太复杂
- DEFER 到 PMF 后

## 一句话总结 优先级

**必做**: Loom v2 (用 Sandbox 拿 Workflow Builder 真演示) + 4 截图 + Devpost 表单 + OAuth install flow

**强 nice-to-have**: HN 周二 fire council-diff + 6/25 公开 council-for-slack + 中文 case study 完整版

**实验**: RTS API beta 申请 + AMD MI300X portability + Anthropic Skills 上架

**不做**: 12+ feature / 新 case study (4 case 已经够) / Marketplace 提交 (custom-function 阻 blocked)

---

7/6 9:03 AM macOS Reminder 弹出时,这份文档变成 final-week checklist。

Repo: github.com/alex-jb/council-for-slack-2026
Production: https://council-for-slack.vercel.app
App ID: A0BAVEM5SS0
