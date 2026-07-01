# 脚本化执行提示词

适用技能：`opc-content-factory-topic-picker`  
脚本目录：`skills/opc-content-factory-topic-picker/scripts/`

## 定位

本 reference 规划选题筛选相关脚本。脚本用于读取飞书素材库、生成标准化选题笔记、写入选题池，并在需要时用 Python 做批量评分。

## 执行入口

当选题来源来自飞书素材库、AI HOT 日报、X 剪藏、微信剪藏或需要写入选题池时：

1. 先读取本 reference。
2. 先明确素材来源、时间范围和选题池目标。
3. 写入选题池或创建选题笔记前，必须展示拟写入清单并获得用户确认。
4. 确认后检查脚本文件是否存在并执行。

## 脚本清单

| 脚本 | 用途 | 类型 |
|---|---|---|
| `scripts/read-aihot-materials.mjs` | 读取 AI HOT 日报素材 | 飞书读取 |
| `scripts/read-x-clips.mjs` | 读取 X 剪藏素材 | 飞书读取 |
| `scripts/read-wechat-clips.mjs` | 读取微信剪藏素材 | 飞书读取 |
| `scripts/create-topic-note.mjs` | 创建标准化选题笔记 | 飞书云文档 |
| `scripts/upsert-topic-pool-record.mjs` | 写入选题池记录 | 飞书多维表格 |
| `scripts/score-topic-candidates.py` | 对候选选题做批量评分 | 数据处理 |

## 运行约定

- 飞书读取 / 写入脚本使用 `.mjs`，通过 `$BOX_AGENT_NODE` 执行。
- 批量评分脚本使用 `.py`，通过 `$BOX_AGENT_PYTHON` 执行。
- 调用飞书 CLI 时必须显式使用 `--as user`。
- 写入型脚本默认 dry-run；确认后才使用 `--execute`。

## 验收标准

执行后返回：

- 已读取素材来源和数量；
- 候选选题评分结果；
- 新建选题笔记链接；
- 写入选题池的记录 ID / URL；
- 未写入项和原因。
