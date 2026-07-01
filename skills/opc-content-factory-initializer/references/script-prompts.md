# 脚本化执行提示词

适用技能：`opc-content-factory-initializer`  
脚本目录：`skills/opc-content-factory-initializer/scripts/`

## 定位

本 reference 规划内容工厂初始化相关脚本。脚本用于通过飞书 CLI 创建、补齐和校验「05 自媒体内容工厂」工作空间、目录、模板文档和核心看板。

## 执行入口

当用户要求初始化、重建或补齐内容工厂时：

1. 先读取本 reference。
2. 先输出拟创建 / 拟补齐清单。
3. 涉及飞书创建、移动、更新、补齐看板或模板时，必须获得用户明确确认。
4. 确认后再检查对应脚本是否存在并执行。

## 脚本清单

| 脚本 | 用途 | 类型 |
|---|---|---|
| `scripts/ensure-content-factory-workspace.mjs` | 查找或创建「05 自媒体内容工厂」工作空间 | 飞书云盘 |
| `scripts/ensure-lifecycle-folders.mjs` | 创建或补齐内容生命周期目录 | 飞书云盘 |
| `scripts/create-template-docs.mjs` | 创建访谈、选题、发布稿、复盘模板文档 | 飞书云文档 |
| `scripts/create-core-boards.mjs` | 创建或补齐核心看板 / 多维表格 | 飞书多维表格 |
| `scripts/validate-content-factory-workspace.mjs` | 校验目录、模板、看板完整性 | 飞书读取 |

## 运行约定

- 飞书 CLI 脚本默认使用 `.mjs`。
- 执行命令使用 `$BOX_AGENT_NODE`。
- 脚本内部调用飞书 CLI 时必须显式使用 `--as user`。
- 写入型脚本默认 dry-run；用户确认后才传入 `--execute`。
- 当前 reference 只声明脚本契约；执行前必须确认脚本文件已经存在。

## 验收标准

执行后返回：

- 工作空间 URL / token；
- 已存在、已创建、已补齐、失败的项目列表；
- 模板文档和看板链接；
- 未完成项与需人工处理事项。
