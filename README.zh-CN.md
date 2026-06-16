# Council for Slack

> [English](./README.md) · 中文

> **Slack 团队的「找个二意见」原生仪式。**
> 5 个声音,1 个结论,每个声音在结果落地时按现实打分。一次 10 秒,~$0.03。

每个团队其实早就有这个*非正式*仪式:决定真要 ship 前,会私聊三个信得过的人问「你会怎么干?」。回答会分歧。**分歧本身就是信号**。Council 把这个仪式做成 Slack 频道原生功能,然后**记分**。

底层是 [council-diff](https://github.com/alex-jb/council-diff) v0.4.0(开源 MIT,在 npm 上)。冲击 [Slack Agent Builder Challenge](https://slackcommunity.com/challenges/agent-builder) 2026-07-13 截止。

---

## 仪式流程

```
1. Slack 频道里冒出一个决定。
   "企业大客户加 20% 折扣,要不要 ship?"

2. 有人输入  /council [问题] | [context]
   (或加 :investor / :engineer / :product / :quant / :career
    选合适的角色组合)

3. 10 秒后,5 个 domain-typed 角色在频道里回应。
   他们会分歧。分歧就是信号。

4. 决定自动追加到频道置顶 Canvas — 永久的 Brier-audited
   决策日志,团队任何人都能往回翻。

5. 几周后现实落地,任何人点 ✅ / ❌ 解析未决决定。
   每个声音拿一个校准分。久而久之,团队学会
   哪个声音在哪类问题上可信。
```

5 个声音,1 个结论,按现实打分。同样的 shape 用在周二的招聘决定和周五的定价决定上。同样的 shape 用在 $5K SaaS 账单和 $5M term sheet 上。

## 实际看到什么

任何 Slack 频道输入 `/council [问题] | [可选 context]`。5 个 founder 角色 (YC Partner / Tier-1 VC 怀疑派 / 律师 / Indie CFO / 务实配偶) 通过 Anthropic Sonnet 4.6 并行思考。约 10 秒后,频道里出现:

- 1 段共识总结
- 每个声音的判断 + 分数 (0-100) + 最强信号 + 最大缺口
- 一致度 (5 个声音对齐程度)
- 推荐: `GO` / `WAIT` / `KILL` / `SPLIT`

后续决定落地时:

`/council-audit` 显示工作区决策历史 + ✅ 已发生 / ❌ 未发生 按钮。一次点击触发 Brier 校准,顶部的**工作区校准 meta-metric** 实时更新(单一标签数字:`excellent` <0.10 / `good` / `fair` / `needs-work`,随决定落地实时漂移)。Karpathy 说的「设计评估循环」工作描述,字面意义上的实现。

---

## 三种 Slack 原生表层,一个引擎

同一个 `council.deliberate()` 引擎。三种表层让 Slack 管理员无需写代码就能 compose 进团队流程:

| 表层 | 功能 | Slack Agent Builder rubric 要求技术 ✓ |
|---|---|---|
| **`/council` slash command** | 单用户输入的仪式。决定留在决定发生的频道里,不进单独的 AI tab。 | — |
| **`Send to Council` 消息快捷方式** | 右键任意 Slack 消息 → 弹窗 → council 思考 → 结论作为线程回复发到源消息。两次点击,把热议变成有校准的决定。 | — |
| **`Council deliberate` Workflow Builder 步骤** ([说明](./docs/workflow-builder.md)) | 非技术管理员能直接把 council 拖进自动化流程。例: "Jira issue 标为 needs decision 时,触发 council 用 issue 内容辩论,把结论发到 thread。" | **Workflow Builder custom step** ✓ |
| **频道 Canvas 决策日志** (自动 pin) | 每次 council fire 自动追加一条 Brier-audited 条目到频道 Canvas。内建的「团队决策日志」judges 可以滚动看。 | **Canvas API** ✓ |
| **MCP 服务器** ([`mcp/`](./mcp/)) | 同一个 primitive 通过 Model Context Protocol 暴露给 Claude Desktop / Cursor / Claude Code。同一个引擎,四种表层。 | **MCP server** ✓ |

3/3 Slack Agent Builder Challenge 要求技术全部命中,而且是**load-bearing 不是 lipstick**。

---

## 谁在用这个

| 人设 | 什么场景触发 `/council` | 比单一 LLM 多出什么 |
|---|---|---|
| **单人创始人 / one-person company** | "Tuesday 还是大会后再 ship 涨价?" — 没 cofounder 可商量,决定关系到真金白银,等一周不行。 | YC Partner 说 GO 78,Indie CFO 说 WAIT 42 — 因为 runway-MRR 数学不通。36 分的差距就是单一 LLM 会抹掉的信号。几周后 Brier audit 告诉创始人在定价问题上该信谁。 |
| **中期 startup PM** | "SAML SSO 自建还是买 WorkOS?" — build/buy 决定每个 quarter 都来,是最高 stakes 也最容易外包给懒 LLM 的事。 | `:engineer` 域(SRE 值班 / Staff Eng / Security / Cost / IC 怀疑派)按工程现实辩论。PM 拿到 verdict + 5 段逐字担忧 + 一致度,然后再做架构 commitment。 |
| **工程 lead 选 vendor** | "Pinecone vs pgvector vs 自建 Qdrant 当 embedding 层?" — vibe 选很容易,18 个月跟它生活很难。 | Activist Short / Sector / Macro 角色(`:quant` 域)捕捉到 demo 没说的 cost trajectory + lock-in risk。 |
| **投资分析师** | "Q3 长 GOOGL?Druckenmiller 卖光 Berkshire 买 100 亿" — 就是真实的 [GOOGL Q3 case study](./docs/case-studies/googl-q3-2026.md)。 | Growth VC (72) 和 Activist Short (38) 的 34 分差距**就是这笔交易**: 方向对,仓位错。单一 LLM 会挑一边解释,藏住这个 binary。 |
| **CTO 做组织决定** | "EU 团队是裁还是搬?" — 高 stakes,不可逆,有情绪。 | Council 在 all-hands 之前把 5 个框架(法律 / runway / 文化 / 招聘市场 / 客户信任)摆上桌。Canvas 日志让 6 个月后董事会问起时这个决定是 auditable 的。 |

共同 shape: **决定是真的**,问题**虽难但 well-formed**,团队需要**让分歧上记录**才能拍板。这就是单一 LLM 工具结构上填不了的洞。

---

## 三个真实 case study — 同引擎,三种 shape

2026-06 真实 `council.deliberate()` fire 三次。同引擎。三种不同的 verdict shape。问题的 shape 决定了 verdict 的 shape。

### 1. [GOOGL Q3 2026 — Druckenmiller vs Berkshire](./docs/case-studies/googl-q3-2026.md)(`investor` 域 · 2026-06-15 fire)

Q1 2026: Druckenmiller 卖光 GOOGL。Berkshire 新建 ~$10B 仓位。Ben Thompson [定调](https://stratechery.com/2026/the-google-capital-company/) 「The Google Capital Company」。单一 LLM 会挑一边。Council 直接 expose 分歧。

- **推荐**: `WAIT` · 一致度 `0.78` · 声音分差: 38 → 72 (**34 分**)
- **共识**: *「聪明钱的分歧是这个数据集最重要的单一信号 — 方向对,仓位错,直到反垄断清晰」*

### 2. [年付 "送两个月"](./docs/case-studies/annual-billing-2026-06.md)(`founder` 域 · 2026-06-16 fire)

通用 SaaS 创始人决定: 40% 流失是 involuntary card-decline,对手年付 opt-in 18%,2 天工程,基础设施都现成。单一 LLM 要么过度 caution 要么橡皮章。

- **推荐**: `GO` · 一致度 `0.89` · 声音分差: 72 → 88 (**16 分,GOOGL 的一半**)
- **共识**: *「unusually clean: 2 天工程量化解决机械式流失问题,基础设施现成,需求信号既来自内部也来自对手 benchmark」*

### 3. [Python inference router 重写 Rust](./docs/case-studies/rust-rewrite-2026-06.md)(`engineer` 域 · 2026-06-16 fire)

infra-team-Slack-thread-跑两个月不收敛 那种问题: P99 380ms,$9K/月 CPU,18 人里 16 个 Python-native,roadmap 上 2 个已知 feature。单一 LLM 要么 Rust 鼓掌要么列 12 条 caveat。

- **推荐**: `WAIT` · 一致度 `0.62` · 声音分差: 22 → 72 (**50 分 — triad 里最宽**)
- **共识**: *「方向对 — Python 有结构性天花板 — 但时机不对。先 profile Python → 6 个工程师培养 Rust 熟练度 → 从能力位置而不是延迟恐慌位置做 rewrite。」*

**verdict 不是为了多样性挑的**。GOOGL WAIT 是因为监管 binary 让仓位无法确定。年付 GO 是因为数学干净。Rust WAIT 是因为方向对但时机不对 — 而且 council surface 出**具体的下一步纲领**,不是 12 条「请考虑这些因素」的 cop-out。**同引擎。三种不同 shape。一致度是校准信号。**

---

## 为什么这个不一样

| 现有工具 | Council for Slack |
|---|---|
| 单一 LLM 「我该不该 X?」给 1 个自信答案 | 5 个声音公开分歧 — 分歧*就是*信号 |
| Karpathy LLM Council UI (browser gallery) | Slack 原生,在决定发生的地方 |
| [0xNyk/council-of-high-intelligence](https://github.com/0xNyk/council-of-high-intelligence) — 18 个通用人格 (Aristotle / Feynman / Torvalds) 在 Claude Code CLI,没解析 audit | 30 个 **domain-typed** 人格 (YC Partner / VC 怀疑派 / Macro / SRE 值班) 跑在 **Slack 里**,**结果落地时 Brier audit** |
| call 完之后没人负责 | 解析时 Brier audit — 校准长期追踪 |
| 无 context 的问题得到假信心 | `\| context` 管道喂角色 ground truth → 诚实分数 |
| provider-locked | council-diff 是 provider-pluggable (默认 Anthropic,AMD MI300X 分支在路上) |

**一句话框定**: 他们的是 CLI 思辨引擎。我们的是校准过的决策平台。「Aristotle 怎么想?」 vs 「我们 Tuesday ship 这个 — 几周后回头看对了吗?」

---

## 工作原理

```
Slack → /council [决定] | [context]
  ↓
Bolt JS handler (Next.js 16 API route, Vercel serverless)
  ↓
council-diff: 5 个并行 Anthropic Sonnet 4.6 call
  ↓ (~10s)
  ↓ persist 到 Supabase (council schema, SECURITY DEFINER RPCs, anon key only)
  ↓
Slack response_url POST → 频道里出 verdict
  ⋮ (决定经过几天/几周展开)
  ↓
/council-audit → Block Kit 按钮 → 用户点 ✅/❌
  ↓
council_decision_resolve RPC → 每声音 Brier + council → audit 重新渲染
```

**Stack**:
- **Next.js 16.2** Pages Router on Vercel (`maxDuration: 60`)
- **@slack/bolt** with `processBeforeResponse: true` (FaaS 必需模式; 否则 Vercel 在 ack 结束时杀掉 in-flight 思辨 Promise)
- **council-diff** v0.4.0 ([npm](https://www.npmjs.com/package/council-diff), MIT, 也是本作者写的)
- **Anthropic Sonnet 4.6** 默认; Mythos Fable-5 Oracle opt-in 用于 tiebreak (`oracle: "fable-5"`)
- **Supabase** Postgres — `council` schema + 4 个 SECURITY DEFINER RPC (`council_decision_insert`, `council_decisions_recent`, `council_decision_resolve`, `council_workspace_stats`)。Anon key only。app code 里没有 service_role。RLS deny-all,RPC 路径是唯一入口。

**Brier 数学** (二元结果):
- 推荐 → 「已发生」概率: `go → 0.80, wait → 0.40, kill → 0.10, split → 0.50`
- 每个声音: `voice.score / 100` 直接作为概率
- `BS = (forecast − outcome)²`,outcome = 1 (发生) 或 0 (未发生)
- BS 越低 = 校准越好。**0 完美, 0.25 蒙的, 1 灾难。**

---

## 快速上手

repo 在 hackathon 评审期间私有。公开 release + OAuth install flow 计划 2026-06-25。

本地运行:

```bash
git clone https://github.com/alex-jb/council-for-slack-2026
cd council-for-slack-2026/web
npm install

cp ../.env.example ../.env.local  # 填入你的 Slack + Anthropic + Supabase keys
npm run build
npm run dev
```

通过 Supabase Dashboard SQL Editor 应用 `migrations/*.sql`(无 Supabase CLI — bot 没有任何 schema-mutating 凭证,by design)。

---

## 为什么这对 Slack 2026 重要

决定不在 chatbot UI 里发生 — 在 Slack 频道里发生。单一 LLM 回应训练团队外包思考。Council 模式把分歧明确化、可审计化。

Anthropic 在 2026-06 ship 了 hosted 「advisor strategy」 beta。这个 OSS 实现 6 个月前 ship 了同样的模式,生活在决定真正发生的地方,而且用校准过的软件唯一能赢得信任的方式赢: **按现实打分**。

Splunk + Band of Agents hackathon 周内 solo 10 天 build (2026-06-13 起)。冲击 Slack Agent Builder Challenge 7/13 作为主要 submission。

---

## Roadmap

详见英文 README 或 [CHANGELOG.md](./CHANGELOG.md)。

- [x] Day 1-3 — Slack manifest / Bolt scaffold / Vercel deploy / 5-persona deliberation live
- [x] Day 4-5 — Supabase persist / `/council-audit` history / context pipe / Brier compute
- [x] Day 6-7 — MCP server scaffold / 多 domain 语法 (founder/engineer/investor/product/quant/career)
- [x] Day 8-9 — Channel Canvas 决策日志 / "Send to council" 消息快捷方式
- [x] Day 10 — Workflow Builder custom step (3/3 rubric tech ✓)
- [x] Day 11 — 工作区校准 meta-metric
- [ ] Week 2 — OAuth install flow / AMD MI300X vLLM backend / 60s Loom demo

---

## License

MIT — 见 [LICENSE](./LICENSE)。

## 作者

Alex Ji ([@alex-jb](https://github.com/alex-jb))。在 build [VibeXForge](https://vibexforge.com) 和一个 11-agent [Solo Founder OS](https://github.com/alex-jb/solo-founder-os) stack。

Issue / DM 都欢迎。
