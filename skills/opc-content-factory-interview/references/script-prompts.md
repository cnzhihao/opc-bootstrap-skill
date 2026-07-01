# 脚本化执行提示词

## 脚本规划

- `scripts/create-interview-workspace.mjs`：创建稿件/访谈工作空间。
- `scripts/create-interview-record-doc.mjs`：创建访谈记录飞书文档。
- `scripts/append-interview-answer.mjs`：将逐题回答追加到访谈记录。
- `scripts/archive-interview-summary.mjs`：归档访谈摘要与核心观点。

## 执行协议

1. 真实执行前先确认脚本文件存在；不存在时说明这是规划脚本，不得假装已执行。
2. 飞书 CLI 脚本使用 `$BOX_AGENT_NODE` 执行，业务命令必须显式 `--as user`。
3. 创建、追加、归档前展示拟操作清单，获得用户明确确认后再执行。
4. 默认 dry-run；确认后才传入 `--execute`。
5. 执行后返回文档链接、记录 token、追加段落数量和未完成项。
