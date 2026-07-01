# 脚本化执行提示词

适用技能：`opc-content-factory-style-updater`  
脚本目录：`skills/opc-content-factory-style-updater/scripts/`

## 定位

本 reference 规划写作风格更新相关脚本。脚本用于读取风格报告、对比人工修订稿与 AI 初稿、更新风格报告并追加变更记录。

## 执行入口

当用户要求根据人工修订稿沉淀写作风格、更新风格报告或维护风格变更记录时：

1. 先读取本 reference。
2. 明确当前风格报告来源、AI 初稿、人工修订稿和拟更新项。
3. 更新风格报告或追加变更记录前，必须展示拟更新规则并获得用户确认。
4. 确认后检查脚本文件是否存在并执行。

## 脚本清单

| 脚本 | 用途 | 类型 |
|---|---|---|
| `scripts/fetch-style-report.mjs` | 读取当前风格报告 | 飞书文档 |
| `scripts/update-style-report.mjs` | 更新风格报告 | 飞书文档 |
| `scripts/append-style-change-log.mjs` | 追加风格变更记录 | 飞书文档 |
| `scripts/compare-human-revision.py` | 对比 AI 初稿与人工修订稿 | 文本分析 |

## 运行约定

- 飞书文档读取 / 更新脚本使用 `.mjs`，通过 `$BOX_AGENT_NODE` 执行。
- 文本对比脚本使用 `.py`，通过 `$BOX_AGENT_PYTHON` 执行。
- 调用飞书 CLI 时必须显式使用 `--as user`。
- 写入型脚本默认 dry-run；确认后才使用 `--execute`。

## 验收标准

执行后返回：

- 原风格报告链接 / token；
- 新增、修订、待删除的风格规则；
- 变更记录位置；
- 更新后的报告链接；
- 未确认或需人工判断的风格项。
