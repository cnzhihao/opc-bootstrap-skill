# OPC Bootstrap Skill

一套面向个人 CEO / 创始人 / 自媒体经营者的 OPC（One Person Company）技能工作流集合。

本仓库当前收录 **19 个 OPC Skills**，覆盖 CEO 节奏、客户线索、销售报价、项目交付、飞书经营系统、内容工厂、发布分发和周复盘等场景。它的目标不是生成更长的 Todo List，而是帮助经营者把碎片化信息转译成：

- 本周主战役
- 必须推进事项
- 暂停 / 不做池
- 48 小时突破点
- 可沉淀、可复盘、可继续协作的经营资产

> 核心方法：**梳理 — 合并 — 突破**。
> 先清空脑内信息并转译为事项，再合并成主战役 / 杠杆动作，最后选出 48 小时内要推进的突破点。

---

## 当前结构

本仓库已经从早期的“多个平级单文件 skill”升级为：

```text
主入口 suite + 内容工厂专用入口 + references 知识底座
```

当前设计原则：

- `SKILL.md` 只保留触发场景、入口流程、确认门禁和 reference map。
- `references/` 承载规则、模板、字段说明、判断标准、迁移后的子流程和详细 SOP。
- 已合并的旧子流程不再保留独立目录，避免技能包膨胀和重复路由。
- 脚本化执行采用 Skill 内归属：提示词写入 `references/script-prompts.md`，真实脚本在工作流稳定后放入对应 `skills/<skill>/scripts/`，不在仓库根目录集中堆放脚本。

---

## 仓库结构

```text
opc-bootstrap-skill/
├── README.md
├── LICENSE
├── .gitignore
└── skills/
    ├── opc-skill-dispatcher/
    │   ├── SKILL.md
    │   └── references/
    ├── opc-ceo-rhythm-workflow/
    │   ├── SKILL.md
    │   └── references/
    ├── opc-sales-delivery-workflow/
    │   ├── SKILL.md
    │   └── references/
    ├── opc-content-factory-workflow/
    │   ├── SKILL.md
    │   └── references/
    └── ...
```

每个 skill 目录至少包含：

```text
SKILL.md
references/*.md
```

涉及脚本化执行的 skill 可以增加：

```text
references/script-prompts.md
scripts/<script-name>.mjs
scripts/<script-name>.py
```

其中 `scripts/` 只放真实可执行脚本，不放 README；脚本说明、执行提示词、确认门禁和验收标准统一写入 `references/script-prompts.md`。

---

## 19 个技能总览

### 1. 主入口 suite

| Skill | 定位 |
|---|---|
| `opc-skill-dispatcher` | OPC Skill 总调度协议。用于在用户输入涉及多个业务域或不确定该走哪个 skill 时，识别主流程、辅助 skill、优先级与确认门禁。 |
| `opc-ceo-rhythm-workflow` | CEO 经营节奏主入口。合并每日启动、现金流生存线、收入机会优先级和项目节奏判断，按「梳理—合并—突破」输出主战役、暂停池和 48 小时突破点。 |
| `opc-sales-delivery-workflow` | 销售交付主入口。合并线索清空、销售对话、报价澄清、产品推送和会议转交付，形成从客户机会到交付推进的一体化链路。 |
| `opc-content-factory-workflow` | 内容工厂总控入口。把经营目标、内容想法、选题、素材、草稿、发布和复盘串成完整内容生产线。 |
| `opc-feishu-update-review` | 飞书经营系统沉淀主入口。合并经营更新、知识库维护、周/月复盘归档和字段规则，所有实际写入前必须确认。 |
| `opc-weekly-review-dispatcher` | 周复盘统一入口。串联经营周复盘、内容工厂复盘、内容周报发布稿、长视频口播稿和多平台发布包。 |

### 2. 内容工厂专用入口

| Skill | 定位 |
|---|---|
| `opc-content-factory-initializer` | 初始化或补齐「05 自媒体内容工厂」工作空间、目录结构、核心看板和模板文档。 |
| `opc-content-factory-topic-picker` | 内容选题选择与优先级判断，已吸收原选题优先级评分能力。 |
| `opc-content-factory-interview` | 从已确定选题进入深度访谈，形成访谈记录、核心观点、文章骨架和标题候选。 |
| `opc-content-factory-draft-optimizer` | 基于访谈记录和个人写作风格生成初稿，并进行结构、深度、风格、情感细节和去 AI 味优化。 |
| `opc-content-factory-style-updater` | 在作者人工修订定稿后，更新写作风格报告和新增偏好。 |
| `opc-content-factory-weekly-report` | 内容工厂周报生成，输出内容工厂发布稿、长视频口播稿和多平台发布包。 |
| `opc-content-factory-channel-fit` | 判断内容适合公众号、小红书、X/Twitter、社群朋友圈、飞书文档、视频或播客，并给出发布顺序和改写方向。 |
| `opc-content-factory-cover-generator` | 基于文章定稿、标题、平台和视觉约束生成多平台封面图。 |
| `opc-content-factory-social-card` | 将文章、脚本、截图、观点材料转化为小红书图文卡片、公众号封面对和社交传播图。 |
| `opc-content-factory-publisher` | 生成公众号、小红书、X/Twitter、社群、朋友圈、知识星球等平台适配发布包。 |
| `opc-content-factory-wechatsync` | 将 Markdown 或 HTML 文章同步到微信公众号、知乎、掘金等平台草稿箱前的准备与检查。 |
| `opc-content-factory-x-article-publisher` | 将 Markdown 文章发布到 X Articles 编辑器前的格式、封面和富文本准备。 |
| `opc-content-factory-asset-archive` | 将文章、访谈、卡片、复盘、观点、案例和销售素材沉淀进内容资产库。 |

---

## 推荐工作流

### 经营节奏入口

```text
opc-skill-dispatcher
  → opc-ceo-rhythm-workflow
```

适用于：今天怎么安排、本周怎么打、机会太多、脑子很乱、现金流紧张、多项目并发、项目推进卡点。

### 客户、收入与交付入口

```text
opc-sales-delivery-workflow
  → 必要时衔接 opc-ceo-rhythm-workflow / opc-feishu-update-review
```

适用于：客户线索整理、销售下一句话、是否报价、如何报价、产品是否该推、会议纪要如何转交付。

### 内容工厂入口

```text
opc-content-factory-workflow
  → opc-content-factory-topic-picker
  → opc-content-factory-interview
  → opc-content-factory-draft-optimizer
  → opc-content-factory-channel-fit
  → opc-content-factory-publisher / opc-content-factory-social-card / opc-content-factory-cover-generator
```

适用于：从素材到选题、从选题到访谈、从访谈到定稿、从定稿到多平台分发和复盘。

### 飞书经营系统入口

```text
opc-feishu-update-review
```

适用于：同步今天工作、沉淀经营判断、更新客户 / 项目 / 内容 / 回款记录、维护知识库和归档周/月复盘。任何写表、改表、删表、归档和状态迁移动作都应先获得用户确认。

### 周复盘完整链路入口

```text
opc-weekly-review-dispatcher
  → opc-content-factory-weekly-report
  → opc-feishu-update-review
```

适用于：周末收口、完整周复盘、本周经营判断、内容工厂复盘、内容工厂发布稿、长视频口播稿和多平台周报发布包。

---


## Skill 脚本化执行规范

本仓库采用“业务脚本归属对应 Skill”的设计：

- 不在仓库根目录新增通用 `scripts/`。
- 不在 `scripts/` 目录放 README 或说明文件。
- 每个 Skill 的脚本执行提示词写入 `references/script-prompts.md`。
- 真实脚本只在工作流稳定后放入对应 `skills/<skill>/scripts/`。
- 飞书 CLI、云文档、多维表格、云盘和归档操作默认使用 `.mjs`，通过 `$BOX_AGENT_NODE` 执行。
- 数据清洗、CSV/Excel/Docx/PDF 处理、批量评分和统计分析可使用 `.py`，通过 `$BOX_AGENT_PYTHON` 执行。
- 调用飞书业务命令时必须显式使用用户身份，即 `--as user`。
- 写入型脚本默认 dry-run；只有用户确认拟操作方案后，才进入 execute 模式。
- AI 执行真实脚本前，必须先确认脚本文件存在；`script-prompts.md` 中列出的脚本清单可以是规划，不代表脚本已经实现。

### 已纳入脚本化提示词的 Skill

| Skill | 脚本提示词 | 脚本归属重点 |
|---|---|---|
| `opc-feishu-update-review` | `references/script-prompts.md` | 飞书经营系统、脑内清空池、主战役、客户线索、项目变动、现金流、复盘归档 |
| `opc-content-factory-initializer` | `references/script-prompts.md` | 内容工厂空间、目录、模板、看板初始化 |
| `opc-content-factory-weekly-report` | `references/script-prompts.md` | 内容周报、公众号主稿、长视频口播稿归档和校验 |
| `opc-content-factory-topic-picker` | `references/script-prompts.md` | 素材读取、选题笔记、选题池写入和候选选题评分 |
| `opc-content-factory-style-updater` | `references/script-prompts.md` | 风格报告读取、更新、变更记录和人工修订对比 |
| `opc-content-factory-interview` | `references/script-prompts.md` | 访谈工作区、访谈记录、逐题追加和摘要归档 |
| `opc-content-factory-draft-optimizer` | `references/script-prompts.md` | 访谈读取、稿件版本归档、最终稿归档和版本校验 |
| `opc-ceo-rhythm-workflow` | `references/script-prompts.md` | 主战役、周节奏、待决策事项读取和 CEO 仪表盘汇总 |
| `opc-sales-delivery-workflow` | `references/script-prompts.md` | 客户线索、交付项目、项目状态、回款记录和销售漏斗分析 |

Dispatcher 类 Skill 不持有业务执行脚本：`opc-skill-dispatcher` 只负责路由和确认边界，`opc-weekly-review-dispatcher` 只负责编排周复盘链路；具体飞书读写和归档由对应业务 Skill 承接。

---

## 安装方式

### 克隆仓库

```bash
git clone https://github.com/cnzhihao/opc-bootstrap-skill.git
cd opc-bootstrap-skill
```

### 安装 / 更新到本机 Skills 目录

```bash
mkdir -p ~/.box-agent/skills
cp -R skills/opc-* ~/.box-agent/skills/
```

> 如果你已经有同名 skill，复制前请先备份，避免覆盖自己的本地改动。

### 仅安装某一个 skill

```bash
mkdir -p ~/.box-agent/skills
cp -R skills/opc-ceo-rhythm-workflow ~/.box-agent/skills/
```

安装后，重启或刷新你的 AI 助手 / Skill Runtime，使新技能被重新加载。

---

## 从旧版升级

旧版仓库曾包含较多子流程 skill。当前精简版已经将这些能力合并到主入口 suite 的 `references/` 中。

如果本机曾安装旧版，建议确认以下旧目录已不再作为独立 skill 使用：

```text
opc-daily-start-workflow
opc-cashflow-survival-check
opc-income-opportunity-prioritization
opc-project-rhythm-manager
opc-lead-inbox-clearance
opc-sales-conversation-strategy
opc-quote-scope-clarifier
opc-product-push-decision
opc-meeting-summary-to-delivery
opc-content-channel-fit
opc-content-factory-topic-prioritization
opc-feishu-kb-maintenance
经营周复盘生成旧入口
内容工厂周复盘旧入口
```

这些目录对应的能力已经迁移到：

- `opc-ceo-rhythm-workflow`
- `opc-sales-delivery-workflow`
- `opc-content-factory-workflow`
- `opc-content-factory-channel-fit`
- `opc-feishu-update-review`
- `opc-weekly-review-dispatcher`

---

## 依赖说明

大部分 skills 是纯文本工作流协议，不需要额外依赖。

部分技能可能依赖外部能力：

| 能力 | 相关 Skill | 说明 |
|---|---|---|
| 飞书 CLI / API | `opc-feishu-update-review`、`opc-weekly-review-dispatcher` | 用于读取或写入飞书多维表格、云文档和知识库。任何写入/删除动作都应先获得用户明确确认。 |
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

## 二次开发建议

建议新增技能时保持当前结构：

```text
skills/your-skill-name/
├── SKILL.md
└── references/
    └── your-reference.md
```

并在 `SKILL.md` frontmatter 中至少包含：

```yaml
---
name: your-skill-name
description: 一句话说明这个 skill 的用途、触发场景和边界。
---
```

扩展建议：

- 如果只是补充规则、模板、字段解释、判断标准，优先写入 `references/`。
- 如果一个能力只是主流程的阶段，不优先新增独立 skill。
- 当多个场景共享同一条经营链路时，优先合并为 suite 主入口。
- 当工作流稳定、重复执行且可验证后，再在对应 Skill 内补充 `scripts/`；脚本说明仍放在 `references/script-prompts.md`，不在 `scripts/` 下新增 README。

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

## License

MIT License. See [LICENSE](./LICENSE).
