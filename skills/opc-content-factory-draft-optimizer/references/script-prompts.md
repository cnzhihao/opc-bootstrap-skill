# 脚本化执行提示词

## 脚本规划

- `scripts/fetch-interview-record.mjs`：读取访谈记录或稿件来源文档。
- `scripts/archive-draft-version.mjs`：归档每一轮稿件优化版本。
- `scripts/archive-final-draft.mjs`：归档最终稿。
- `scripts/validate-draft-versions.py`：校验版本差异、结构完整性和去 AI 味程度。

## 执行协议

1. 执行前先确认脚本文件存在；不存在时只按本文件作为脚本规划与后续实现依据。
2. 飞书 CLI 脚本使用 `$BOX_AGENT_NODE`；文本校验脚本使用 `$BOX_AGENT_PYTHON`。
3. 归档、覆盖、追加写入前必须展示拟操作并获得用户确认。
4. 默认 dry-run；确认后才传入 `--execute`。
5. 执行后返回版本链接、归档位置、校验结果和需人工确认的问题。
