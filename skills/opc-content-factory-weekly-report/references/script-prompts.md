# 脚本化执行提示词

适用技能：`opc-content-factory-weekly-report`  
脚本目录：`skills/opc-content-factory-weekly-report/scripts/`

## 定位

本 reference 规划内容工厂周报相关脚本。脚本用于读取本周素材、归档内容工厂周报、归档公众号长文章 / 主稿、归档长视频口播稿，并校验飞书归档结果。

## 执行入口

当用户要求生成周报、发布稿、长视频口播稿或归档到飞书时：

1. 先完成内容生成，不用脚本替代内容判断。
2. 归档前展示拟创建文档、目标月份目录、命名格式和来源文件。
3. 涉及飞书创建、移动、归档、更新时，必须获得用户明确确认。
4. 确认后读取本 reference，并检查脚本文件是否存在。

## 脚本清单

| 脚本 | 用途 | 类型 |
|---|---|---|
| `scripts/collect-weekly-materials.mjs` | 读取本周内容事件和素材 | 飞书读取 |
| `scripts/archive-content-weekly-report.mjs` | 归档内容工厂周报 | 飞书云文档 |
| `scripts/archive-article-draft.mjs` | 归档公众号长文章 / 主稿 | 飞书云文档 |
| `scripts/archive-video-script.mjs` | 归档长视频口播稿 | 飞书云文档 |
| `scripts/validate-weekly-archive.mjs` | 校验归档目录、命名、链接 | 飞书读取 |
| `scripts/collect-weekly-metrics.py` | 统计内容表现数据 | 数据处理 |

## 运行约定

- 飞书归档脚本使用 `.mjs`，通过 `$BOX_AGENT_NODE` 执行。
- 数据统计脚本使用 `.py`，通过 `$BOX_AGENT_PYTHON` 执行。
- 调用飞书 CLI 时必须显式使用 `--as user`。
- 写入型脚本默认 dry-run；确认后才使用 `--execute`。
- 内容工厂发布稿必须是长文章 / 公众号主稿，不能用长视频口播稿替代。

## 验收标准

执行后返回：

- 内容工厂周报文档链接；
- 公众号长文章 / 主稿文档链接；
- 长视频口播稿文档链接；
- 归档目录、命名格式、W 周期是否正确；
- 未归档成功的项目和原因。
