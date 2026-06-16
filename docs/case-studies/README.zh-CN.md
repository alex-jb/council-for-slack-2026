# 真实案例研究 — 四次开火,完整 verdict 谱

> [English versions](./README.md) · 中文 (此文件)
>
> **2026-06 真实 `council.deliberate()` 开火四次。同引擎。四种不同 verdict shape,覆盖从 GO 到 KILL 完整谱。问题的形状决定了 verdict 的形状,而不是反过来。这是校准声明。**

---

## 四个 case 一表看完

| Case | 域 | 推荐 | 一致度 | 声音分差 | 共识金句 |
|---|---|---|---|---|---|
| [Crypto Payments on B2B SaaS](./crypto-payments-2026-06.md) | founder | **KILL** | **0.94** | 4 → 12 (最窄) | 「每个声音都基于独立理由反对 — 单位经济学差、监管尾部风险、对 SOC 2 的机会成本、团队士气。董事会成员的推动反映了个人背景偏见,而不是客户或市场信号。」 |
| [Annual Billing "2 Months Free"](./annual-billing-2026-06.md) | founder | **GO** | 0.89 | 72 → 88 | 「决定异常干净:2 天工程量化解决机械式流失问题,基础设施现成,需求信号既来自内部也来自对手 benchmark。」 |
| [GOOGL Q3 2026 — Druckenmiller vs Berkshire](./googl-q3-2026.md) | investor | WAIT | 0.78 | 38 → 72 | 「聪明钱的分歧是这个数据集最重要的单一信号 — 这是个『方向对、仓位错』的局面,直到反垄断清晰前不能重仓。」 |
| [Rust Rewrite of Python Inference Router](./rust-rewrite-2026-06.md) | engineer | WAIT | 0.62 | 22 → 72 (最宽) | 「方向对 — Python 有结构性天花板 — 但时机不对。先 profile Python → 6 个工程师培养 Rust 熟练度 → 从能力位置而不是延迟恐慌位置做 rewrite。」 |

**一致度区间** 0.62 → 0.94。**声音分差区间** 8 → 50 分。Council 没有为了 demo 多样性挑 verdict。

---

## 案例 1 · Crypto Payments — KILL 0.94

**决定**: B2B SaaS 要不要加加密货币支付 (BTC + USDC)?客户零需求,但有董事会成员在推。

**背景**:
- Series A, $42K MRR, 1,200 付费用户。98% 美国小中公司
- **18 个月零** 加密支付内部询问
- 新加入的董事会成员 (前加密交易所背景) 每次会议都推 "future-proofing"。4% 股权
- 成本: $45K + 8-10 工程师周
- 合规: BSA/AML, OFAC, 各州 money transmitter,B2B SaaS 在 FinCEN 灰区
- Runway: 9 个月。雇佣冻结中
- 上次产品调研 top 3 请求: API 限流提升 / SOC 2 Type II / Postman collection。加密未提及

**5 声音**:
- YC Partner 8/100 · 反: 零需求是唯一重要的信号
- Tier-1 VC Skeptic 5/100 · 反: 4% 董事会成员 + 加密背景 = 利益冲突
- Startup Lawyer 4/100 · 反: BSA/AML/OFAC 创建永久公司实体合规负债
- Indie CFO 6/100 · 反: 9 个月 runway 时每一笔工程费都是生存赌注
- Pragmatic Spouse 12/100 · 反: 团队 morale 因为路线图明显服务于董事会议程而崩塌

**这证明了什么**:
单一 LLM 几乎从不会直接说 KILL — 默认 tone 是讨好型,会逃进 "这里有 7 件事要考虑"。Council 三件事不一样:
1. **它点名了政治动态** — "董事会成员-前雇主 fit, 不是 founder-market fit"。创始人在董事会会议上需要这种书面语言
2. **声音分差本身是诊断** — 全部 5 个声音从 5 个不同框架 (工程/法律/财务/资本/morale) 都低于 13 分,创始人不需要再 re-litigate 决定
3. **它提供了重定向** — 共识没停在 "别做加密",而是 surface 出 "把对话重定向到 SOC 2 Type II"

**Brier**: 12 个月后,若团队真的取消加密计划改 ship SOC 2 并签 4 个企业合同,KILL 推荐得 $(0.10-0)^2 = 0.01$。最佳校准之一。

---

## 案例 2 · Annual Billing — GO 0.89

**决定**: B2B SaaS 加年付选项 "2 个月免费" (年付 $290 vs 月付 $29) 给定 40% 流失是 involuntary card-decline?

**背景**:
- B2B 开发者工具, $14K MRR, 480 付费用户
- 月净流失 8%。其中 **40% 是 involuntary** (失败卡片授权)
- Stripe benchmark: 18% 用户在对手工具上选年付
- Ship 成本: 2 天工程 (Stripe billing portal 已 wired)
- Runway: 11 个月
- Customer support 报告过去 30 天 6 个 inbound 年付询问

**5 声音**:
- YC Partner 88/100 · GO: 6 个 inbound 询问 + 18% benchmark = 异常清晰的需求信号
- Tier-1 VC Skeptic 72/100 · GO with reservation: $25K upfront cash 无稀释延展 runway,但年付不解决底层 8% 月流失
- Startup Lawyer 79/100 · GO + TOS work: 法律 surface 小,但 prepaid annual SaaS 创建递延收入负债
- Indie CFO 85/100 · GO: 数学几乎是 embarrassing in favor — 18% × 480 × $290 = $25K upfront vs 2 天工程,回本期以小时计
- Pragmatic Spouse 80/100 · GO: 2 天工程阻止 40% 流失 + 减少 3 AM payroll 焦虑 = basic adulting

**这证明了什么**:
当数学干净时,council 不会因为想多样性而 surface 假分歧。0.89 一致度 + 16 分声音分差告诉创始人 "这个决定不需要再争论"。但每个声音保留了独立 caveat — VC Skeptic 的 "voluntary churn 信号在 12 个月内被隐藏" 是创始人月 9 看到 MRR 平时的提醒。

---

## 案例 3 · GOOGL Q3 2026 — WAIT 0.78

**决定**: Q3 2026 看多 GOOGL?

**背景**:
- Q1 2026: Druckenmiller 卖光所有 GOOGL。Berkshire 新建 ~$10B 仓位
- Ben Thompson 框定为 "The Google Capital Company" (Stratechery, 2026-06-15)
- DOJ Chrome 拆分 remedy timeline 未明
- Waymo Q1 4x YoY 乘车量,TPU 与 Nvidia 在 inference 价格竞争中击败

**5 声音**:
- Macro Strategist 58/100
- Sector Analyst 62/100
- Portfolio Manager 55/100
- **Growth VC 72/100** (TPU 护城河 + Waymo 4x YoY 是真的)
- **Activist Short 38/100** (DOJ Chrome 拆分未 price in)

**关键: 34 分的 spread**。

**共识金句 (verbatim)**:
> "聪明钱的分歧是这个数据集最重要的单一信号 — 这是个『方向对、仓位错』的局面,直到反垄断清晰前不能重仓。"

**这证明了什么**:
单一 LLM 会挑一边的 narrative 然后 9/10 自信。Council 直接 expose 分歧本身,让 portfolio manager 用 sizing 而不是 binary 立场来表达。Growth VC 72 vs Activist Short 38 的 34 分 spread **就是这笔交易** — 方向对,仓位错。

[完整中文 launch package 看 `~/.marketing_agent/queue/pending/2026-06-16-googl-council-case-study.md`,包含 X thread / 小红书 / LinkedIn 多渠道]

---

## 案例 4 · Rust Rewrite — WAIT 0.62

**决定**: Python FastAPI inference router 重写成 Rust (axum)?P99 380ms,$9K/月 CPU。

**背景**:
- Series B AI infra startup, 18 工程师
- 单 hot path: ~12M req/天, ~140 req/秒 peak
- 2 个工程师有 prod Rust 经验,16 个 Python-native
- 估计 6-8 工程师周。无 outage budget
- Roadmap 上 2 个已知 feature (batch inference + tenant isolation) 在接下来 2 quarter 必 ship
- 替代方案: profile + optimize Python — 1-2 工程师周,30-40% 延迟改进
- 内部 Slack thread: 47 条消息无收敛

**5 声音**:
- Rust Core Maintainer 72/100 · pro (axum + tokio 给 sub-10ms P99 是 30-40% improvement 想都不敢想的)
- CTO 5 Years From Now 60/100 · 方向对、时机错
- Tech Recruiter 55/100 · 招聘双刃剑 (强信号 + 池子 10-15x 小)
- **SRE Oncall 28/100 · 反**: 2 周 dual-run + 单一 hot path + 零 outage budget = blast-radius nightmare
- **Junior Dev Just Onboarded 22/100 · 反**: 刚学完 FastAPI 又要打 borrow checker

**关键: 50 分的 spread (quartet 中最宽)**。

**共识金句 (verbatim)**:
> "Rust 重写方向上是对的 — Python 在这个工作负载上有真实的结构性天花板,axum 会解决它 — 但时机不对。两个 roadmap feature (batch inference, tenant isolation) 正在接下来 2 quarter 落地,团队 88% Python-native,Python 优化路径在 1-2 工程师周内提供 30-40% 增益且 blast radius 接近零。dominant recommendation 是: 立即执行 Python profiling sprint 来降低 P99 和月度成本,用那个 runway 在 4-6 个工程师中刻意培养 Rust 熟练度,然后从团队能力的位置而不是延迟恐慌的位置执行重写。"

**这证明了什么**:
**WAIT 不是 punt — 是一个具体的程序**: "先 profile Python → 培养 Rust 熟练度 → 从能力位置重写"。这是周一早会可以 ship 的语言。47 条 Slack thread 现在有一个可以 ratify 或 reject 的答案 — 比 thread 永远不收敛好。

---

## 完整 quartet 一张表

| | GOOGL | 年付 | Rust Rewrite | 加密支付 |
|---|---|---|---|---|
| Recommendation | `WAIT` | `GO` | `WAIT` | **`KILL`** |
| 一致度 | 0.78 | 0.89 | 0.62 | **0.94** |
| 声音分差 | 34 分 | 16 分 | 50 分 | **8 分** |
| 域 | investor | founder | engineer | founder |
| 形状 | 聪明钱分歧 | 干净 ops fix | 方向对、时机错 | 每个框架都说不 |

**verdict 不是为了多样性挑的**。
- GOOGL WAIT — 因为监管 binary 让 sizing 错
- 年付 GO — 因为数学干净
- Rust WAIT — 因为方向对、时机不对,有具体下一步
- 加密 KILL — 因为每个框架 (工程/法律/财务/资本/morale) 都低于 13 分

**问题的形状决定了 verdict 的形状**。这是校准声明 — 一致度是测量它的方式。

---

## 自己开火

每次 `council.deliberate()` ~$0.03、~10 秒。

```bash
# OSS engine
npm install council-diff
ANTHROPIC_API_KEY=sk-... npx council-diff founder \
  "should we add annual billing at 2 months free?" \
  "B2B SaaS, $14K MRR, 40% involuntary churn..."

# 在 Slack
/council :investor Long GOOGL into Q3?
       | Druckenmiller sold all, Berkshire bought $10B, DOJ Chrome timeline unclear
```

详细 EN 版本的每个 case study (含每个声音的逐字 strength + gap):
- [`crypto-payments-2026-06.md`](./crypto-payments-2026-06.md)
- [`annual-billing-2026-06.md`](./annual-billing-2026-06.md)
- [`googl-q3-2026.md`](./googl-q3-2026.md)
- [`rust-rewrite-2026-06.md`](./rust-rewrite-2026-06.md)
