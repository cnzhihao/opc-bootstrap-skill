---
name: opc-skill-dispatcher
description: OPC Skill 总调度协议。用于在用户输入涉及多个 OPC skill、多个业务域，或不确定应调用哪个 skill 时，按 OPC 调度协议 v1 识别主流程、辅助 skill、优先级与确认门禁。它是 OPC skill 集合的上层路由器，不直接写入飞书、不直接发布、不直接报价，而是负责路由、编排和确认边界。触发词包括：OPC 调度、按 OPC 流程处理、这个该走哪个 skill、帮我判断怎么处理、这个事情怎么推进、这些事合并一下、调度一下、分发一下、按 v1 执行。
---

# Skill: opc-skill-dispatcher

## 一、定位

`opc-skill-dispatcher` 是 OPC skill 集合的上层路由器。

它负责回答：

> 这件事应该交给哪个 OPC skill 处理？

它不负责替代具体业务 skill，不直接写入飞书、不直接发布内容、不直接报价、不直接对外发送客户信息。

它只负责：

1. 识别用户输入属于哪个业务域；
2. 选择一个主 skill；
3. 判断需要哪些辅助 skill；
4. 应用 OPC 调度协议 v1 的优先级；
5. 拦截飞书写入、状态变更、发布、报价等高风险动作，要求先拟方案、后确认、再执行；
6. 把输出交接给合适的执行 skill 或沉淀 skill。

## 二、总工作法

所有 OPC skill 调度服从：

```text
梳理 → 合并 → 突破 → 执行/沉淀
```

解释：

1. **梳理**：先清空脑内信息，不急着做 todolist，不急着写飞书。
2. **合并**：归并到主战役、现金流、客户、项目、内容、服务产品、暂停池、复盘或资产沉淀。
3. **突破**：找出今日第一动作、48 小时突破点、最接近钱的动作、最能推动主战役的动作。
4. **执行/沉淀**：需要写入、归档、发布、报价或对外发送时，必须先获得用户明确确认。

## 三、适用场景

当出现以下任一情况时，优先使用本 skill：

- 用户输入同时涉及多个 OPC 业务域；
- 用户说“按 OPC 流程处理”“调度一下”“分发一下”；
- 用户不知道该走哪个 skill；
- 一个事项同时涉及现金流、客户、项目、内容、飞书更新或复盘；
- 需要判断是先做 CEO 节奏、现金流、客户、项目、内容，还是先写入飞书；
- 需要判断是否必须先确认再执行。

## 四、业务域分组

### 1. CEO 节奏与日常作战域

核心 skill：

```text
opc-ceo-rhythm-workflow
opc-daily-start-workflow
```

处理：脑内清空、本周主战役、今日作战台、暂停/不做池、第一动作、48 小时突破点。

典型输入：

- “梳理一下”
- “脑子很乱”
- “今天怎么安排”
- “本周怎么打”
- “启动 OPC”
- “启动 CEO 节奏”
- “今天早上我们过一下”
- “帮我做今日作战台”

调度规则：

- 多事项、混乱信息、方向判断，默认进入 `opc-ceo-rhythm-workflow`。
- 今日/早上启动，默认进入 `opc-daily-start-workflow`。

### 2. 现金流与收入优先级域

核心 skill：

```text
opc-cashflow-survival-check
opc-income-opportunity-prioritization
```

处理：本月缺口、下月风险、社保/工资/固定成本、待回款、收入机会排序、最接近钱的动作。

典型输入：

- “现金流够不够”
- “这个月还差多少钱”
- “下月社保怎么办”
- “先收哪笔钱”
- “哪个机会最值得做”
- “怎么最快变现”

调度规则：

- 凡是涉及钱、回款、报价、成交、客户预算、本月缺口、固定成本，优先触发该域。
- 输出必须转译为：今天该推进哪笔钱、哪个客户最接近钱、哪个项目最影响回款、哪些不近钱事项暂停。

### 3. 客户、销售与报价域

核心 skill：

```text
opc-lead-inbox-clearance
opc-sales-conversation-strategy
opc-quote-scope-clarifier
opc-product-push-decision
```

处理：线索清空、客户阶段判断、销售对话策略、报价范围、交付边界、产品/服务是否该推。

典型输入：

- “这个客户怎么跟”
- “这个线索值不值得追”
- “这人问我报价”
- “这个需求怎么报价”
- “帮我想一下怎么回复客户”
- “这个产品要不要推”
- “客户说预算有限怎么办”

调度规则：

- 涉及客户、需求、报价、产品推荐时，优先进入客户/销售域。
- 如果涉及明确金额、回款、近期成交，联动现金流与收入优先级域。
- 如果成交后进入交付，转交项目节奏域。

### 4. 项目交付与会议转交付域

核心 skill：

```text
opc-project-rhythm-manager
opc-meeting-summary-to-delivery
```

处理：项目阶段、卡点、交付风险、下一关键交付动作、会议纪要转交付事项、是否影响回款。

典型输入：

- “这个项目现在到哪了”
- “这个项目卡住了”
- “会议纪要整理一下”
- “把会议内容转成交付动作”
- “这个项目下一步怎么推”
- “客户迟迟不反馈怎么办”
- “这个项目会不会影响回款”

调度规则：

- 已成交或已进入交付的事项，优先进入项目节奏域。
- 项目交付影响回款时，联动现金流域。
- 项目涉及客户沟通或异议时，联动销售对话策略。

### 5. 内容工厂域

总控 skill：

```text
opc-content-factory-workflow
```

子流程 skill：

```text
opc-content-factory-initializer
opc-content-factory-topic-picker
opc-content-factory-topic-prioritization
opc-content-factory-interview
opc-content-factory-draft-optimizer
opc-content-factory-channel-fit
opc-content-factory-cover-generator
opc-content-factory-social-card
opc-content-factory-publisher
opc-content-factory-wechatsync
opc-content-factory-x-article-publisher
opc-content-factory-weekly-review
opc-content-factory-weekly-report
opc-content-factory-style-updater
opc-content-factory-asset-archive
opc-content-channel-fit
```

处理完整内容生产链：

```text
内容目标 → 素材/选题 → 选题优先级 → 访谈式挖掘 → 初稿生成 → 五轮优化 → 渠道适配 → 封面/社交卡片 → 发布包 → 微信/X 发布 → 周复盘 → 风格更新 → 资产沉淀
```

典型输入：

- “帮我搞一篇文章”
- “这个选题做一下”
- “从这些素材里挑选题”
- “这个话题能不能写”
- “采访我一下”
- “根据访谈出初稿”
- “帮我改稿”
- “适合发哪个平台”
- “生成发布包”
- “发到公众号/X”
- “做内容周复盘”
- “更新我的写作风格”
- “把这篇内容沉淀成资产”

调度规则：

- 内容生产默认先进入 `opc-content-factory-workflow`，再分发给子流程。
- 用户明确指定某一步时，可直接进入对应子 skill，例如访谈、改稿、封面、发布、复盘、资产沉淀。
- 内容生产前后都要判断是否服务主战役、客户成交、现金流、服务产品化或资产沉淀。

### 6. 飞书知识库与系统沉淀域

核心 skill：

```text
opc-feishu-kb-maintenance
opc-feishu-update-review
```

处理：飞书结构检查、月份文件夹、复盘库、暂停池、归档池、今日/本周更新、拟更新方案、确认后写入。

典型输入：

- “更新到飞书”
- “同步到 OPC 系统”
- “今天收口”
- “做一下飞书更新”
- “检查知识库结构”
- “补一下月份文件夹”
- “整理归档”

调度规则：

- 飞书更新默认走 `opc-feishu-update-review`。
- 飞书结构维护默认走 `opc-feishu-kb-maintenance`。
- 任何实际写入、改表、状态变更、移动、归档、删除、清空，必须先拟方案并等用户明确确认。

### 7. 复盘与周报域

核心 skill：

```text
opc-weekly-review-generator
opc-content-factory-weekly-review
opc-content-factory-weekly-report
```

处理：周复盘、内容复盘、周报生成、主战役复盘、有效/无效动作判断、下周调整建议。

典型输入：

- “做本周复盘”
- “生成周报”
- “内容这周复盘一下”
- “这周发生了什么”
- “帮我整理成周报”
- “这一周有什么判断”
- “下周怎么调整”

调度规则：

- 泛经营周复盘走 `opc-weekly-review-generator`。
- 内容经营复盘走 `opc-content-factory-weekly-review`。
- 叙事化周报/可公开周报走 `opc-content-factory-weekly-report`。
- 复盘结果必须反哺 CEO 节奏、现金流判断、客户优先级、项目节奏、内容选题和资产沉淀。

## 五、总调度优先级

当一个输入同时命中多个 skill，按以下优先级判断：

```text
P0：确认门禁
P1：现金流优先
P2：主战役优先
P3：客户优先于内容
P4：项目交付优先于新机会
P5：资产沉淀优先于一次性输出
```

### P0：确认门禁

凡是涉及以下动作，必须先拟方案并获得用户明确确认：

- 写入飞书；
- 修改飞书表格或字段；
- 修改项目/客户/内容状态；
- 移动、归档、删除、清空、覆盖文档；
- 发布公众号、X 或其他外部平台；
- 对外发送客户信息；
- 正式报价；
- 承诺交付范围、交付日期或价格。

有效确认包括：

- “确认”
- “执行”
- “可以写入”
- “按这个更新”
- “同步吧”
- “没问题，执行”

以下表达不视为高风险动作的明确确认：

- “你看着办”
- “差不多”
- “先这样”
- “应该可以”

遇到模糊确认，必须继续追问。

### P1：现金流优先

只要涉及钱、回款、报价、成交、预算、固定成本、工资社保、短期收入机会，就优先做现金流或收入机会判断。

### P2：主战役优先

如果输入涉及多个方向或难以判断优先级，回到 CEO 节奏，判断本周主战役、杠杆动作、暂停池和 48 小时突破点。

### P3：客户优先于内容

如果一件事既能做内容，又能推进客户，默认先判断客户成交、信任建立、销售素材和现金流价值，再进入内容工厂。

### P4：项目交付优先于新机会

当已有项目存在交付风险、逾期风险、客户满意度风险或回款风险时，优先处理项目交付，不急着开新机会。

### P5：资产沉淀优先于一次性输出

凡是产出过文章、案例、客户对话、项目复盘、会议纪要、销售话术、服务边界、方法论判断，都要判断是否值得沉淀为资产。

## 六、主 skill 与辅助 skill 规则

每次调度只设一个主 skill，其他作为辅助判断。

输出时必须说明：

```text
主流程：
辅助判断：
为什么这样调度：
是否存在确认门禁：
下一步：
```

### 示例 1：今天怎么安排

主 skill：

```text
opc-daily-start-workflow
```

辅助 skill：

```text
opc-cashflow-survival-check
opc-income-opportunity-prioritization
opc-project-rhythm-manager
opc-lead-inbox-clearance
opc-content-factory-workflow
```

输出：今日作战台、暂停/不做池、第一动作、48 小时突破点。

### 示例 2：这个客户怎么聊

主 skill：

```text
opc-sales-conversation-strategy
```

辅助 skill：

```text
opc-lead-inbox-clearance
opc-quote-scope-clarifier
opc-income-opportunity-prioritization
opc-cashflow-survival-check
opc-content-factory-asset-archive
```

输出：客户阶段、当前目标、下一句话/下一动作、是否报价、是否需要案例/内容辅助、是否影响现金流。

### 示例 3：项目卡住了

主 skill：

```text
opc-project-rhythm-manager
```

辅助 skill：

```text
opc-sales-conversation-strategy
opc-cashflow-survival-check
opc-meeting-summary-to-delivery
```

输出：项目阶段、卡点、风险、下一关键交付动作、是否影响回款、是否进入今日作战台。

### 示例 4：这个选题做成文章

主 skill：

```text
opc-content-factory-workflow
```

子流程：

```text
opc-content-factory-topic-prioritization
opc-content-factory-interview
opc-content-factory-draft-optimizer
opc-content-factory-channel-fit
opc-content-factory-cover-generator
opc-content-factory-social-card
opc-content-factory-publisher
opc-content-factory-asset-archive
```

输出：是否值得写、内容目标、访谈问题、初稿/定稿、发布包、复盘入口、资产沉淀方案。

### 示例 5：把今天同步到飞书

主 skill：

```text
opc-feishu-update-review
```

辅助 skill：

```text
opc-ceo-rhythm-workflow
opc-project-rhythm-manager
opc-content-factory-asset-archive
opc-cashflow-survival-check
```

输出：拟更新方案、需要确认的写入项、确认后执行、更新结果、下一步提醒。

## 七、跨域交接格式

### CEO 节奏 → 现金流

```text
当前现金流问题：
相关客户/项目：
本月时间窗口：
待判断机会：
需要输出：最接近钱的 1-3 个动作
```

### 现金流 → 客户/项目

```text
目标金额：
目标客户/项目：
当前阶段：
卡点：
建议推进动作：
期望回款时间：
```

### 客户 → 报价/项目

```text
客户需求：
已承诺内容：
未确认边界：
预算/报价：
风险点：
下一步需确认：
```

### 项目 → 回款/复盘/资产

```text
项目结果：
客户反馈：
可沉淀案例：
可复用方法：
是否有尾款：
是否可转介绍/复购：
```

### 内容 → 客户/销售

```text
内容主题：
目标客户/人群：
可辅助的销售场景：
可沉淀为销售素材的部分：
是否需要改写成客户沟通话术：
```

### 复盘 → CEO 节奏

```text
本周有效动作：
本周无效动作：
被验证的判断：
被证伪的判断：
下周主战役建议：
应暂停事项：
48 小时突破建议：
```

## 八、飞书写入确认协议

所有涉及飞书实际变更的动作，统一走三段式。

### 1. 先输出拟更新方案

```text
本次拟更新：
1. 文档/表格：
2. 拟新增：
3. 拟修改：
4. 拟移动/归档：
5. 拟删除/清空：
6. 风险提醒：
请确认是否执行。
```

### 2. 等用户明确确认

只有用户明确确认后，才能执行高风险变更。

### 3. 执行后输出结果

```text
已完成：
1.
2.

未完成/需你确认：
1.
2.

下一步建议：
1.
```

## 九、常见入口调度表

| 用户说法 | 主 skill | 辅助 skill | 输出 |
|---|---|---|---|
| 今天怎么安排 | `opc-daily-start-workflow` | 现金流/项目/客户/内容 | 今日作战台、第一动作、48小时突破 |
| 脑子很乱，梳理一下 | `opc-ceo-rhythm-workflow` | 按内容转交 | 主战役、必须推进、暂停池 |
| 现金流够不够 | `opc-cashflow-survival-check` | 收入机会排序 | 缺口、风险、最接近钱动作 |
| 哪个机会先做 | `opc-income-opportunity-prioritization` | 现金流/客户/项目 | 收入优先级 |
| 清一下客户线索 | `opc-lead-inbox-clearance` | 销售策略/现金流 | 线索分层、下一步 |
| 这个客户怎么聊 | `opc-sales-conversation-strategy` | 报价/内容资产 | 对话策略 |
| 这个需求怎么报价 | `opc-quote-scope-clarifier` | 现金流/项目 | 报价边界、风险 |
| 这个产品要不要推 | `opc-product-push-decision` | 客户/现金流 | 推进/暂停判断 |
| 项目卡住了 | `opc-project-rhythm-manager` | 现金流/销售 | 卡点、风险、下一动作 |
| 会议纪要转交付 | `opc-meeting-summary-to-delivery` | 项目节奏 | 交付事项、责任、时间 |
| 做一篇文章 | `opc-content-factory-workflow` | 内容子流程 | 选题到发布链路 |
| 采访我一下 | `opc-content-factory-interview` | draft optimizer | 访谈记录、骨架、标题 |
| 根据访谈出稿 | `opc-content-factory-draft-optimizer` | style updater | 初稿、五轮优化、定稿 |
| 适合发哪 | `opc-content-factory-channel-fit` | publisher | 渠道建议 |
| 做发布包 | `opc-content-factory-publisher` | 渠道/视觉 | 发布文案与素材 |
| 同步公众号 | `opc-content-factory-wechatsync` | publisher | 微信同步 |
| 发 X 长文 | `opc-content-factory-x-article-publisher` | channel-fit | X 发布 |
| 做内容周复盘 | `opc-content-factory-weekly-review` | asset archive | 内容表现与下周建议 |
| 做周报 | `opc-weekly-review-generator` / `opc-content-factory-weekly-report` | CEO 节奏 | 周报/复盘 |
| 更新飞书 | `opc-feishu-update-review` | 相关业务 skill | 拟更新方案 |
| 检查知识库结构 | `opc-feishu-kb-maintenance` | 无 | 缺失项与补建方案 |
| 沉淀资产 | `opc-content-factory-asset-archive` | 飞书更新 | 资产分类和沉淀方案 |

## 十、默认输出格式

调度判断类输出：

```text
一、我判断这件事属于什么
二、主流程应该走哪个 skill
三、需要联动哪些模块
四、当前最重要判断
五、建议的 48 小时突破动作
六、是否需要确认门禁
七、下一步
```

日常作战类输出：

```text
今日主战役：
必须推进：
暂停/不做：
第一动作：
48 小时突破点：
需要你确认：
```

客户销售类输出：

```text
客户阶段：
当前目标：
核心卡点：
下一句话/下一动作：
是否报价：
是否需要内容/案例辅助：
是否进入今日作战台：
```

项目类输出：

```text
项目阶段：
当前卡点：
交付风险：
下一关键动作：
是否影响回款：
是否进入今日作战台：
```

内容类输出：

```text
内容目标：
当前阶段：
下一步 skill：
需要用户提供的信息：
是否服务主战役/客户/现金流：
后续沉淀方向：
```

## 十一、默认执行规则

后续默认按以下规则调度：

```text
1. 多事项/混乱/每日启动 → CEO/每日节奏优先
2. 涉及钱 → 现金流优先
3. 涉及客户 → 销售/线索优先
4. 涉及已成交项目 → 项目节奏优先
5. 涉及内容 → 内容工厂 workflow 优先
6. 涉及沉淀/写入 → 飞书 update-review 优先
7. 涉及结构维护 → 飞书 kb-maintenance 优先
8. 涉及周总结 → 周复盘/周报优先
```

## 十二、禁止事项

本 skill 禁止：

- 直接修改飞书；
- 直接发布内容；
- 直接发送客户消息；
- 直接报价；
- 直接删除、清空、归档、移动文档；
- 用长 todolist 替代主战役和 48 小时突破点；
- 在未确认主 skill 的情况下，同时展开多个业务流程；
- 把内容生产从经营目标中切离出来；
- 把复盘做成流水账而不反哺下一轮判断。
