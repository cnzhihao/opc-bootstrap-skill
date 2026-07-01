# OPC 技能业务域地图

## 精简后的主入口

| 业务域 | 主入口 skill | 承接范围 |
|---|---|---|
| 调度与跨域判断 | `opc-skill-dispatcher` | 判断当前问题进入哪个 OPC skill / suite |
| CEO 经营节奏 | `opc-ceo-rhythm-workflow` | 脑内清空、每日启动、主战役、现金流、机会、项目节奏、48 小时突破点 |
| 飞书经营系统 | `opc-feishu-update-review` | 工作更新、飞书沉淀、知识库维护、归档确认 |
| 周复盘 | `opc-weekly-review-dispatcher` | 经营周复盘、内容复盘、发布包、归档衔接 |
| 内容工厂 | `opc-content-factory-workflow` | 选题、访谈、初稿、优化、渠道、视觉、发布、资产归档、复盘 |
| 销售交付 | `opc-sales-delivery-workflow` | 线索、销售对话、报价澄清、产品推送、会议转交付 |

## 保留的专用入口

| 专用入口 | 定位 |
|---|---|
| `opc-content-factory-topic-picker` | 内容工厂选题选择与优先级评分 |
| `opc-content-factory-channel-fit` | 内容渠道适配 |
| `opc-content-factory-interview` | 内容访谈提纲与访谈推进 |
| `opc-content-factory-draft-optimizer` | 初稿生成与五轮优化 |
| `opc-content-factory-cover-generator` | 封面图生成协作 |
| `opc-content-factory-social-card` | 社交图文卡片生成 |
| `opc-content-factory-publisher` | 多平台发布准备 |
| `opc-content-factory-wechatsync` | WechatSync 同步准备 |
| `opc-content-factory-x-article-publisher` | X/Twitter Article 发布准备 |
| `opc-content-factory-weekly-report` | 内容周报、发布稿、口播稿生成 |
| `opc-content-factory-style-updater` | 内容风格系统维护 |
| `opc-content-factory-asset-archive` | 内容资产归档 |
| `opc-content-factory-initializer` | 内容工厂初始化 |

## 已合并能力

以下旧 skill 已物理合并到主入口，不再作为独立 skill 目录保留：

- CEO suite：每日启动、现金流生存线、收入机会优先级、项目节奏。
- 销售交付 suite：线索清空、销售对话、报价澄清、产品推送、会议转交付。
- 内容工厂：旧 `content-channel-fit`、选题优先级评分。
- 飞书/复盘：知识库维护、周复盘生成、内容工厂周复盘。

## 路由原则

当用户问题同时命中多个动作，优先进入 suite 主入口；只有问题非常窄且对应专用入口仍保留时，才使用专用入口。
