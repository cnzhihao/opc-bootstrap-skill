# 脚本化执行提示词

适用技能：`opc-feishu-update-review`  
业务域：飞书经营系统更新、经营复盘归档、多维表格写入

## 使用边界

本文件定义本 Skill 可使用的脚本规划、执行条件和确认门禁。脚本应放在本 Skill 包内的 `scripts/` 目录。当前如脚本文件尚未存在，先按本文件生成拟执行方案，不得声称已经执行脚本。

## 通用执行规则

- 飞书 CLI 操作脚本默认使用 `.mjs`，通过 `$BOX_AGENT_NODE` 执行。
- 数据清洗、统计分析、文档解析脚本可使用 `.py`，通过 `$BOX_AGENT_PYTHON` 执行。
- 不使用裸 `node`、`python`、`python3`。
- 所有调用 `lark-cli` 的业务命令必须显式包含 `--as user`。
- 写入、归档、删除、状态迁移默认先 dry-run 或输出拟操作清单；只有用户明确确认后才执行。
- 执行前先确认目标脚本文件真实存在；不存在时输出“脚本待实现”和所需输入，不模拟执行结果。

## 脚本清单

| 脚本 | 用途 | 类型 | 确认门禁 |
|---|---|---|---|
| `scripts/sync-brain-dump-pool.mjs` | 将新增经营信息写入脑内清空池 | 飞书多维表格 | 写入前确认事项列表和字段 |
| `scripts/update-main-campaign.mjs` | 更新本周主战役、杠杆动作、48 小时突破点 | 飞书多维表格 / 文档 | 状态迁移和覆盖前确认 |
| `scripts/upsert-customer-lead.mjs` | 新增或更新客户线索 | 飞书多维表格 | 确认客户名、阶段、来源和下一步 |
| `scripts/upsert-content-topic.mjs` | 派生并写入内容选题 | 飞书多维表格 | 确认选题池、标题、优先级 |
| `scripts/upsert-service-product.mjs` | 派生并写入服务产品想法 | 飞书多维表格 | 确认产品名、目标客户、状态 |
| `scripts/upsert-project-change.mjs` | 写入项目变动或交付状态变化 | 飞书多维表格 | 确认项目、变动内容、风险 |
| `scripts/upsert-cashflow-record.mjs` | 写入现金流或回款记录 | 飞书多维表格 | 确认金额、对象、日期和状态 |
| `scripts/archive-review-doc.mjs` | 创建并归档日 / 周 / 月复盘文档 | 飞书云文档 | 确认标题、月份目录、归档类型 |

## 标准执行提示词

当需要执行脚本时，按以下顺序处理：

1. 整理拟更新清单：目标文档/表格、拟新增、拟修改、拟归档、风险。
2. 向用户请求明确确认。
3. 确认脚本存在于 `skills/opc-feishu-update-review/scripts/`。
4. 使用 `$BOX_AGENT_NODE` 或 `$BOX_AGENT_PYTHON` 运行脚本。
5. 返回结构化结果：成功项、失败项、飞书链接/记录 ID、待确认事项。

示例命令：

```bash
$BOX_AGENT_NODE skills/opc-feishu-update-review/scripts/archive-review-doc.mjs --payload tmp/archive-review.json
$BOX_AGENT_NODE skills/opc-feishu-update-review/scripts/archive-review-doc.mjs --payload tmp/archive-review.json --execute
```

## 验收标准

- 写入前有用户确认记录。
- 执行结果包含文档 URL、记录 ID 或明确失败原因。
- 未实现脚本不被包装成已执行。
- 归档类产物符合对应月份目录和命名规则。
