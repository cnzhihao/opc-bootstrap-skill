# 脚本化执行提示词

## 脚本规划

- `scripts/read-main-campaign.mjs`：读取本周主战役与 48 小时突破点。
- `scripts/read-weekly-rhythm.mjs`：读取周节奏、关键事项与推进状态。
- `scripts/read-open-decisions.mjs`：读取待决策事项。
- `scripts/summarize-ceo-dashboard.mjs`：汇总 CEO 仪表盘信息。

## 执行协议

1. 本 Skill 的脚本以读取与汇总为主；写入主战役或状态迁移优先交给 `opc-feishu-update-review`。
2. 执行前确认脚本文件存在；不存在时说明这是规划脚本，不得声称已读取飞书。
3. 飞书 CLI 脚本使用 `$BOX_AGENT_NODE` 执行，业务命令必须显式 `--as user`。
4. 如后续扩展写入动作，必须先展示拟操作清单并获得用户确认。
5. 执行后返回来源链接、记录 ID、汇总口径和证据缺口。
