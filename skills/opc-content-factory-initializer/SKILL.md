---
name: opc-content-factory-initializer
description: OPC 内容工厂初始化技能。用于在飞书云盘中创建或补齐「05 自媒体内容工厂」工作空间，按内容生命周期初始化目录结构、核心看板和模板文档，为自媒体技能组及 opc-content-factory-* 技能链路提供稳定落点。适用于用户说“初始化内容工厂”“新建 05 自媒体内容工厂”“搭建自媒体内容工厂文件夹”“重建内容工厂目录结构”等场景。
---

# OPC 内容工厂初始化技能

## 定位

OPC 内容工厂初始化技能。用于在飞书云盘中创建或补齐「05 自媒体内容工厂」工作空间，按内容生命周期初始化目录结构、核心看板和模板文档，为自媒体技能组及 opc-content-factory-* 技能链路提供稳定落点。适用于用户说“初始化内容工厂”“新建 05 自媒体内容工厂”“搭建自媒体内容工厂文件夹”“重建内容工厂目录结构”等场景。

本文件只保留技能入口、触发边界、执行骨架和确认门禁；稳定规则、模板、字段、目录、故障处理和验收标准见下方 references。

## 脚本化执行

当任务涉及本 Skill 的飞书 CLI 操作、数据处理或批量校验时，先读取 `references/script-prompts.md`，按其中定义的脚本清单、参数、确认门禁和验收标准执行。

脚本应归属于本 Skill 包内的 `scripts/` 目录；飞书 CLI 操作默认使用 `.mjs` 并通过 `$BOX_AGENT_NODE` 执行，数据处理脚本可使用 `.py` 并通过 `$BOX_AGENT_PYTHON` 执行。执行真实脚本前先确认脚本文件存在。

涉及飞书写入、归档、发布、删除、状态迁移或对外承诺时，先向用户展示拟操作清单，获得明确确认后再执行；写入型脚本默认 dry-run，确认后才使用 execute 模式。

## 触发场景

- 用户请求与「内容工厂初始化」相关，并需要进入该技能的主流程。
- 用户明确提到该技能名称、对应工作流，或需要处理 references 中定义的规则、模板、归档、发布、复盘、调度等事项。
- 当任务跨多个 OPC 业务域时，先由 `opc-skill-dispatcher` 判定主 skill 与辅助 skill。

## 执行骨架

1. 识别用户目标、输入材料、是否涉及外部系统写入或发布。
2. 按任务类型读取对应 reference，使用其中的规则、模板或验收标准。
3. 先输出拟处理方案；涉及飞书写入、归档、发布、同步、删除、状态迁移或报价边界时，等待用户明确确认。
4. 执行后返回结果、改动位置、未覆盖风险和下一步建议。

## 产物标准

- 输出聚焦用户下一步行动，避免把 reference 内容整段复述给用户。
- 需要归档或发布时，明确区分“拟操作”“已完成”“待用户确认”。
- 发现信息缺口时，先问最小必要澄清问题。

## Reference Map

本技能的稳定规则、模板和判断标准已沉淀到以下 references；执行时先读入口流程，再按场景读取对应 reference：

- [`references/content-factory-structure.md`](references/content-factory-structure.md)：内容工厂标准目录结构
- [`references/core-documents.md`](references/core-documents.md)：初始化核心文档清单
- [`references/initialization-checklist.md`](references/initialization-checklist.md)：初始化检查清单
