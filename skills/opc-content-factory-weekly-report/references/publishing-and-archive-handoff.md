# 发布包与飞书归档交接规则

适用技能：`opc-content-factory-weekly-report`  
业务域：内容工厂周报

> 本文件由原 `SKILL.md` 中稳定、可复用的规则章节迁移而来。入口 `SKILL.md` 仅保留触发、流程骨架和引用关系。

## 在三段式周复盘链路中的位置

本 Skill 是 **第三段：周报内容产品化**。

完整链路由 `opc-weekly-review-dispatcher` 统一调度：

```text
1. opc-weekly-review-generator：经营周复盘，判断本周经营是否打赢
2. opc-content-factory-weekly-review：内容工厂周复盘，判断内容是否服务经营主战役
3. opc-content-factory-weekly-report：周报内容产品化，生成发布稿、长视频口播稿和多平台发布包
```

三者分工：

- `opc-weekly-review-generator`：负责**经营判断型周复盘**，重点是主战役、现金流、客户收入、内容获客、产品服务、系统流程、下周 48 小时突破点。
- `opc-content-factory-weekly-review`：负责**内容系统周复盘**，重点是内容是否服务经营主战役、是否带来客户/合作/私信/转化、哪些内容值得延展或暂停、下周内容主战役。
- `opc-content-factory-weekly-report`：负责把前两段结论转译成**可发布的内容产品**，必须同时产出：
  1. `经营周复盘.md`：面向 OPC CEO 作战系统的复盘正文，可同步到飞书周/月复盘库；
  2. `内容工厂发布稿.md`：面向公众号、知识星球、即刻等渠道的长文发布稿；
  3. `长视频口播稿.md`：面向 B 站/视频号/小红书长视频的 5-12 分钟口播脚本；
  4. `05-发布包/`：多平台适配版本。

如果用户同时触发两个及以上周复盘相关 Skill，或要求“完整周复盘链路”，应转入 `opc-weekly-review-dispatcher`，按固定顺序执行：经营周复盘 → 内容工厂周复盘 → 周报内容产品化。

### 飞书归档交接关系

本 Skill 负责生成三类周报内容产品，并整理标准化「飞书归档包」。当用户要求“归档到飞书”“同步周复盘库”“三个文档都要归”时，将归档包交给 `opc-feishu-update-review` 的「周复盘文档归档规则」执行。

交接时必须提供以下元数据，确保文档写入正确月份文件夹并使用统一命名：

- 复盘周期：`YYYY-MM-DD 至 YYYY-MM-DD`；
- 周序号：`YYYY-MM-Wx`，需沿用目标月份目录已有编号；
- 目标月份：`YYYY-MM`，由复盘周期结束日推导；
- 三份文档类型：`周复盘`、`内容工厂发布稿`、`长视频口播稿`；
- 周报连续编号：如 `智昊的一人公司周报 03`；
- 长视频主题标题；
- 三份正文或已有飞书云文档链接/token。

飞书最终命名必须符合：

```text
YYYY-MM-Wx｜周复盘｜YYYY-MM-DD 至 YYYY-MM-DD
YYYY-MM-Wx｜内容工厂发布稿｜智昊的一人公司周报 NN
YYYY-MM-Wx｜长视频口播稿｜[本期长视频主题]
```

归档验收由 `opc-feishu-update-review` 完成，完成条件包括：进入 `02｜周月复盘库/YYYY-MM/` 月份目录、文件名符合规则、正文可正常读取且包含完整内容。

## 前置条件

- 已有写作风格报告：`00-模板库/徐智昊（OPC 版）-我的个人写作风格分析报告.md`
- 已有自媒体账号基础信息：`00-模板库/自媒体账号基础信息.md`
- 周报目录 `weekly-reports/`（不存在时本 Skill 会自动创建）

## 标题候选
1. ...
2. ...
3. ...

## 开场 15 秒 Hook
...

## 正片结构

### 0:00-0:45 我这周为什么说自己失败了
[口播]
...
[画面]
...

### 0:45-2:00 我到底做了哪些事
[口播]
...
[画面]
...

### 2:00-4:00 真正的问题是主战役缺位
[口播]
...
[画面]
...

### 4:00-7:00 为什么我更需要 CEO 作战系统
[口播]
...
[画面]
...

### 7:00-结尾 下周我要打穿什么
[口播]
...
[画面]
...

## 金句切片
- ...

## 结尾 CTA
...
```

#### 6.4 多平台发布包：`05-发布包/`

调用 `/content-publisher` 或按平台手动适配，生成至少 4 个版本：

| 文件名 | 适配平台 | 长度 |
|--------|---------|------|
| `长文版.md` | 微信公众号、X Articles、Substack | 完整版，含追更元素 |
| `图文版.md` | 即刻、知识星球 | 800 字内，保留主线故事和关键判断 |
| `短版.md` | Twitter thread / X 长文摘要 | 5-8 条推文，主线开场，每条一个事件 |
| `邮件版.md` | Substack / 邮件订阅 | 加邮件专用开头「读者朋友们，本周好」 |

如果用户需要发布：
- 公众号/即刻/小红书等 → 建议运行 `/wechatsync`
- X Articles → 建议运行 `/x-article-publisher`

#### 6.5 飞书归档包：交给 `opc-feishu-update-review`

当用户要求归档时，本步骤必须额外整理一个「飞书归档包」，并交给 `opc-feishu-update-review` 按统一规则执行。

归档包字段：

```yaml
review_period: YYYY-MM-DD 至 YYYY-MM-DD
month_folder: YYYY-MM
week_code: YYYY-MM-Wx
business_review:
  type: 周复盘
  target_name: YYYY-MM-Wx｜周复盘｜YYYY-MM-DD 至 YYYY-MM-DD
  source: 经营周复盘.md 或 docx token/url
content_report:
  type: 内容工厂发布稿
  target_name: YYYY-MM-Wx｜内容工厂发布稿｜智昊的一人公司周报 NN
  source: 内容工厂发布稿.md 或 docx token/url
long_video_script:
  type: 长视频口播稿
  target_name: YYYY-MM-Wx｜长视频口播稿｜[本期长视频主题]
  source: 长视频口播稿.md 或 docx token/url
validation_required:
  - parent_token == YYYY-MM 月份文件夹 token
  - 文件名为 YYYY-MM-Wx｜类型｜标题
  - 正文可正常读取且包含完整内容
```

最终回复中的归档状态按 `opc-feishu-update-review` 的验收结果表述；归档包已整理但尚未执行时，表述为“归档包已准备好”。

### 步骤 7：发布后复盘（可选·推荐）

发布后 48 小时运行 `/dbs-content` 做内容五维诊断 + `/style-updater` 让周报风格进入飞轮。

## 注意事项

- **主线冲突优先级最高**：第 2 步多花 2 分钟，提炼一个足够有张力、能贯穿全文的主线。
- **追更机制保持克制**：固定栏目控制在 4 个以内，让读者形成稳定记忆点。
- **数据仪表盘保持诚实**：粉丝数据可以从缺，收入/学习/产出每周如实记录；暂无进展时写 0 或“无新增”。
- **下周预告选择可追踪事项**：预告事项进入下一期复盘范围，让读者看到连续推进。
- **访谈节奏保持轻量**：单题回答控制在 200 字以内，全程控制在 15 分钟内。
