# 脚本化执行提示词

## 脚本规划

- `scripts/read-customer-leads.mjs`：读取客户线索。
- `scripts/read-delivery-projects.mjs`：读取交付项目。
- `scripts/upsert-delivery-project.mjs`：新增或更新交付项目。
- `scripts/update-project-status.mjs`：更新项目状态。
- `scripts/upsert-payment-record.mjs`：写入回款记录。
- `scripts/analyze-sales-pipeline.py`：分析销售漏斗与回款节奏。

## 执行协议

1. 经营系统级写入优先通过 `opc-feishu-update-review` 统一确认；本 Skill 只承接销售交付专用动作。
2. 执行前确认脚本文件存在；不存在时说明这是规划脚本。
3. 飞书 CLI 脚本使用 `$BOX_AGENT_NODE`，分析脚本使用 `$BOX_AGENT_PYTHON`。
4. 新增、更新、状态迁移、回款写入前必须展示拟操作并获得用户确认。
5. 执行后返回记录 ID、客户/项目链接、状态变化和待人工确认项。
