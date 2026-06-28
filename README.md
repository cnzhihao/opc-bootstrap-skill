# OPC Bootstrap Skill

一套面向个人 CEO / 创始人 / 自媒体经营者的 OPC（One Person Company）技能工作流集合。

本仓库收录 32 个 OPC Skills，覆盖 CEO 节奏、现金流生存线、客户线索、销售报价、项目交付、飞书经营系统、内容工厂、发布分发和周复盘等场景。它的目标不是生成更长的 Todo List，而是帮助经营者把碎片化信息转译成：

- 本周主战役
- 必须推进事项
- 暂停 / 不做池
- 48 小时突破点
- 可沉淀、可复盘、可继续协作的经营资产

> 核心方法：**梳理 — 合并 — 突破**。
>
> 先清空脑内信息并转译为事项，再合并成主战役 / 杠杆动作，最后选出 48 小时内要推进的突破点。

---

## 适合谁使用

适合以下人群或团队使用：

- 一人公司创始人 / 独立顾问 / 自由职业者
- 需要同时处理客户、交付、现金流、内容和产品的创业者
- 希望把 AI 助手从“问答工具”升级为“经营秘书”的用户
- 通过飞书、多维表格、知识库管理个人经营系统的人
- 正在搭建自媒体内容工厂、销售漏斗和复盘机制的个人品牌经营者

---

## 仓库结构

```text
opc-bootstrap-skill/
├── README.md
├── LICENSE
├── .gitignore
└── skills/
    ├── opc-skill-dispatcher/
    ├── opc-ceo-rhythm-workflow/
    ├── opc-content-factory-workflow/
    └── ...
```

每个 skill 目录通常包含：

```text
SKILL.md
```

`SKILL.md` 中定义了该技能的名称、触发场景、工作原则、输入输出、确认门禁和执行流程。

---

## 32 个技能总览

### 1. 总调度

| Skill | 定位 |
|---|---|
| `opc-skill-dispatcher` | OPC Skill 总调度协议。用于在用户输入涉及多个 OPC skill、多个业务域，或不确定应调用哪个 skill 时，识别主流程、辅助 skill、优先级与确认门禁。 |
| `opc-weekly-review-dispatcher` | OPC 周复盘路由 Skill。用于周末收口、完整周复盘、周报发布稿和长视频口播稿生成场景，自动编排“经营周复盘 → 内容工厂周复盘 → 周报内容产品化”三段式 Workflow。 |

### 2. CEO 节奏与经营优先级

| Skill | 定位 |
|---|---|
| `opc-ceo-rhythm-workflow` | OPC CEO 节奏工作流。用于在脑内信息过载、机会过载、现金流压力、多项目并发、周/月启动或复盘时，按「梳理—合并—突破」生成主战役、暂停池、必须推进事项和 48 小时突破点。 |
| `opc-daily-start-workflow` | OPC 每日 / 每周启动工作流。作为 CEO 节奏的日常入口，读取经营上下文，判断现金流、客户、项目、内容和主战役优先级，生成今日作战台、第一动作和突破点。 |
| `opc-weekly-review-generator` | OPC 周复盘生成。用于每周五或周末综合主战役、现金流、客户、内容、产品、系统和下周突破点，生成经营判断型周复盘；它是三段式周复盘链路的第一段。 |
| `opc-income-opportunity-prioritization` | OPC 收入机会优先级排序。用于把客户、合作方、渠道、内容、商单、培训、交付机会按 P0/P1/P2/P3 排序，决定今天和本周先推进什么。 |
| `opc-cashflow-survival-check` | OPC 现金流生存线判断。用于计算社保、公积金、工资、固定成本、硬现金支出、待回款、本月缺口和下月风险，并给出最接近钱的动作。 |

### 3. 客户线索、销售沟通与报价

| Skill | 定位 |
|---|---|
| `opc-lead-inbox-clearance` | OPC 获客线索清空。用于把口述、聊天记录、内容反馈、社群互动、老关系和转介绍整理成客户线索、观察线索和暂停线索，并生成拟写入经营系统的方案。 |
| `opc-sales-conversation-strategy` | OPC 销售沟通策略。用于基于客户线索、沟通上下文、本周主战役和服务产品货架，判断客户阶段、成交阻力、下一句话、下一步动作，以及是否报价、暂停或发送案例。 |
| `opc-quote-scope-clarifier` | OPC 报价前实施范围澄清。用于客户报价前明确需求、实施范围、交付边界、投入天数、风险、付款方式和案例价值，避免报价过低或范围过大。 |
| `opc-product-push-decision` | OPC 产品 / 项目当前是否该推判断。用于判断某个产品、工具、项目或 demo 当前应该立刻售卖、渠道测试、做内容资产、内部使用，还是进入暂停池。 |

### 4. 项目交付、会议与飞书经营系统

| Skill | 定位 |
|---|---|
| `opc-project-rhythm-manager` | OPC 项目节奏管理。用于读取项目总表、今日作战台和交付项目资料，判断项目阶段、当前卡点、交付风险和下一次关键交付动作。 |
| `opc-meeting-summary-to-delivery` | OPC 会议纪要转交付动作。用于把会议纪要、录音转写、口述或客户沟通摘要转化为项目状态变化、客户反馈、责任人、下一步动作和交付物变化。 |
| `opc-feishu-update-review` | OPC 飞书更新与复盘工作流。用于在完成每日/每周工作后，把经营进展整理成拟更新方案，经确认后再同步到飞书多维表格、方法文档、周/月复盘库。 |
| `opc-feishu-kb-maintenance` | OPC 飞书知识库维护。用于维护 OPC 秘书飞书文件夹、多维表格、秘书工作方法、周月复盘库、月份文件夹、归档与暂停池。 |

### 5. 内容工厂总控与基础设施

| Skill | 定位 |
|---|---|
| `opc-content-factory-workflow` | OPC 内容工厂总控工作流。用于把经营目标、内容想法、选题、素材、草稿、发布和复盘串成完整内容生产线，并按「梳理—合并—突破」生成内容主战役、暂停池和 48 小时突破点。 |
| `opc-content-factory-initializer` | OPC 内容工厂初始化。用于在飞书云盘中创建或补齐「05 自媒体内容工厂」工作空间，初始化目录结构、核心看板和模板文档。 |
| `opc-content-factory-asset-archive` | OPC 内容工厂资产沉淀。用于把文章、访谈、卡片、复盘、观点、案例和销售素材沉淀进选题库、素材库、方法论库、案例库、客户沟通材料与数据复盘库。 |

### 6. 选题、访谈、初稿与风格

| Skill | 定位 |
|---|---|
| `opc-content-factory-topic-picker` | OPC 内容工厂选题筛选。用于从日常素材库、AI HOT 日报、X 剪藏、微信剪藏等素材中批量筛选高价值选题，并生成标准化选题笔记。 |
| `opc-content-factory-topic-prioritization` | OPC 内容工厂选题优先级。用于按照经营相关性、现金流/客户机会、资产价值、渠道适配、生产难度和个人真实度，将选题分为 P0/P1/P2/P3。 |
| `opc-content-factory-interview` | OPC 内容工厂深度访谈。用于从已确定选题进入访谈，创建稿件工作空间，逐题挖掘真实经历、判断、案例和金句，形成访谈记录、核心观点、文章骨架和标题候选。 |
| `opc-content-factory-draft-optimizer` | OPC 内容工厂初稿生成与五轮优化。用于基于访谈记录和个人写作风格报告生成初稿，并按结构逻辑、内容深度、语言风格、情感细节、去 AI 味五轮迭代。 |
| `opc-content-factory-style-updater` | OPC 内容工厂风格更新。用于在作者人工修订定稿后，对比修订稿与既有写作风格报告，提炼新增偏好、修正旧规则、标注待删减内容，并验证风格是否定型。 |
| `opc-content-factory-weekly-report` | OPC 内容工厂周报生成。用于把一周碎片化事件重构成有故事感、可追更的周报内容产品，完成经营周复盘、内容工厂发布稿、长视频口播稿和多平台发布包生成；它是三段式周复盘链路的第三段。 |

### 7. 渠道适配、封面、卡片与发布

| Skill | 定位 |
|---|---|
| `opc-content-factory-channel-fit` | OPC 内容工厂渠道适配。用于判断一篇内容更适合公众号、小红书、X/Twitter、社群朋友圈、飞书文档、视频或播客，并给出发布顺序和改写方向。 |
| `opc-content-channel-fit` | OPC 内容资产与渠道分发判断。用于判断文章、蓝皮书、小报、商单材料、demo 是否适合渠道分发，以及如何从内容转化到咨询、成交或一对一交付。 |
| `opc-content-factory-cover-generator` | OPC 内容工厂封面图生成。用于基于文章定稿、标题、平台和视觉约束生成公众号、小红书、社交媒体等多平台封面图。 |
| `opc-content-factory-social-card` | OPC 内容工厂社交卡片生成。用于把文章、脚本、字幕、截图、产品说明、照片或观点材料转化为小红书图文卡片、公众号封面对、文章封面和社交传播图。 |
| `opc-content-factory-publisher` | OPC 内容工厂多平台发布包。用于基于定稿生成公众号、小红书、X/Twitter、社群、朋友圈、知识星球等平台适配版本，可衔接封面图生成、同步发布和复盘。 |
| `opc-content-factory-wechatsync` | OPC 内容工厂 WechatSync 同步。用于将 Markdown 或 HTML 文章同步到微信公众号、知乎、掘金等平台草稿箱，检查平台登录态，处理封面、标题和发布准备。 |
| `opc-content-factory-x-article-publisher` | OPC 内容工厂 X/Twitter Article 发布。用于将 Markdown 文章发布到 X Articles 编辑器，保留富文本格式，处理封面上传、Markdown 转换和 X Premium 长文发布准备。 |
| `opc-content-factory-weekly-review` | OPC 内容工厂周复盘。用于每周复盘内容是否服务经营主战役、是否带来客户/合作/私信/转化机会，确定下周内容主战役和 48 小时突破点；它是三段式周复盘链路的第二段。 |

---

## 推荐工作流

### 经营节奏入口

```text
opc-skill-dispatcher
  → opc-ceo-rhythm-workflow
  → opc-daily-start-workflow / opc-weekly-review-dispatcher / opc-weekly-review-generator
```

适用于：今天怎么安排、本周怎么打、机会太多、脑子很乱、现金流紧张、多项目并发。

### 客户与收入入口

```text
opc-lead-inbox-clearance
  → opc-sales-conversation-strategy
  → opc-quote-scope-clarifier
  → opc-income-opportunity-prioritization
  → opc-cashflow-survival-check
```

适用于：客户线索整理、销售下一句话、是否报价、如何报价、先收哪笔钱。

### 交付与飞书入口

```text
opc-project-rhythm-manager
  → opc-meeting-summary-to-delivery
  → opc-feishu-update-review
  → opc-feishu-kb-maintenance
```

适用于：项目卡点、会议纪要转行动、同步飞书、维护经营系统。

### 内容工厂入口

```text
opc-content-factory-workflow
  → opc-content-factory-topic-picker
  → opc-content-factory-topic-prioritization
  → opc-content-factory-interview
  → opc-content-factory-draft-optimizer
  → opc-content-factory-publisher
  → opc-content-factory-weekly-review
```

适用于：从素材到选题、从选题到访谈、从访谈到定稿、从定稿到多平台分发和复盘。


### 周复盘完整链路入口

```text
opc-weekly-review-dispatcher
  → opc-weekly-review-generator
  → opc-content-factory-weekly-review
  → opc-content-factory-weekly-report
```

适用于：周末收口、完整周复盘、本周经营判断、内容工厂复盘、内容工厂发布稿、长视频口播稿和多平台周报发布包。

三段式关系：

1. `opc-weekly-review-generator`：经营周复盘，判断本周主战役、现金流、客户收入、产品服务、系统流程和下周 48 小时突破点；
2. `opc-content-factory-weekly-review`：内容工厂周复盘，判断内容是否服务经营主战役、是否带来客户/合作/私信/转化机会，以及哪些内容值得延展或暂停；
3. `opc-content-factory-weekly-report`：周报内容产品化，生成 `经营周复盘.md`、`内容工厂发布稿.md`、`长视频口播稿.md` 和 `05-发布包/`。

> 规则：如果只做经营复盘，可直接使用 `opc-weekly-review-generator`；如果只做内容复盘，可直接使用 `opc-content-factory-weekly-review`；如果只做已确认结论的发布稿/口播稿/发布包，可直接使用 `opc-content-factory-weekly-report`。完整链路统一从 `opc-weekly-review-dispatcher` 进入。

---

## 安装方式

### 方式一：克隆仓库后复制到本地 Skills 目录

```bash
git clone https://github.com/<your-github-username>/opc-bootstrap-skill.git
cd opc-bootstrap-skill
mkdir -p ~/.box-agent/skills
cp -R skills/opc-* ~/.box-agent/skills/
```

> 如果你已经有同名 skill，复制前请先备份，避免覆盖你自己的改动。

### 方式二：使用 rsync 安装 / 更新

```bash
git clone https://github.com/<your-github-username>/opc-bootstrap-skill.git
cd opc-bootstrap-skill
mkdir -p ~/.box-agent/skills
rsync -av skills/opc-* ~/.box-agent/skills/
```

### 方式三：仅安装某一个 skill

```bash
mkdir -p ~/.box-agent/skills
cp -R skills/opc-ceo-rhythm-workflow ~/.box-agent/skills/
```

安装后，重启或刷新你的 AI 助手 / Skill Runtime，使新技能被重新加载。

---

## 依赖说明

大部分 skills 是纯文本工作流协议，不需要额外依赖。

部分技能可能依赖外部能力：

| 能力 | 相关 Skill | 说明 |
|---|---|---|
| 飞书 CLI / API | `opc-feishu-*`、项目/复盘相关技能 | 用于读取或写入飞书多维表格、云文档和知识库。任何写入/删除动作都应先获得用户明确确认。 |
| WechatSync | `opc-content-factory-wechatsync`、`opc-content-factory-publisher` | 用于将 Markdown / HTML 同步到公众号、知乎、掘金等平台草稿箱。需要配置 `WECHATSYNC_TOKEN`。 |
| 浏览器自动化 / Playwright | `opc-content-factory-x-article-publisher` | 用于 X Articles 编辑器发布准备，需要用户已登录对应平台。 |
| 图片生成或设计工具 | `opc-content-factory-cover-generator`、`opc-content-factory-social-card` | 用于封面图、社交卡片和多平台视觉素材生成。 |

### WechatSync Token 示例

```bash
export WECHATSYNC_TOKEN="<your-wechatsync-token>"
wechatsync platforms --auth
```

不要把真实 token 提交到 Git 仓库。

---

## 使用原则

1. **先调度，后执行**  
   不确定该用哪个技能时，先使用 `opc-skill-dispatcher`。

2. **先判断，后写入**  
   任何飞书、多维表格、知识库、发布平台的写入、删除、状态迁移，都应先生成“拟操作方案”，再由用户确认。

3. **不把经营系统降级成 Todo List**  
   OPC 的核心产物不是长清单，而是主战役、杠杆动作、暂停池和 48 小时突破点。

4. **内容服务经营**  
   内容工厂不是单纯追热点，而是服务客户线索、产品表达、信任资产和成交机会。

5. **敏感信息不入库**  
   客户姓名、回款金额、飞书 app token、table id、平台 token、私有链接等，不应直接提交到公开仓库。

---

## 开源安全说明

本仓库发布前已对明显的 token、密钥和个人化示例进行了清理。但这些 skills 仍然包含对飞书、客户、回款、报价、现金流等业务对象的工作流描述。

在你 fork 或二次发布前，请再次检查：

- 是否包含真实客户信息
- 是否包含真实 token / API key / cookie
- 是否包含私有飞书链接、app token、table id
- 是否包含个人住址、手机号、身份证、银行卡等隐私数据
- 是否包含不适合公开的内部业务判断

---

## 二次开发建议

你可以基于本仓库扩展：

- 自己的一人公司经营系统
- 个人 CEO 每日启动流程
- 客户线索和销售推进系统
- 内容工厂 SOP
- 飞书多维表格经营中台
- 自媒体发布与复盘机制
- 顾问 / 培训 / 交付项目管理机制

建议新增技能时保持目录结构：

```text
skills/your-skill-name/SKILL.md
```

并在 `SKILL.md` frontmatter 中至少包含：

```yaml
---
name: your-skill-name
description: 一句话说明这个 skill 的用途、触发场景和边界。
---
```

---

## License

MIT License. See [LICENSE](./LICENSE).
