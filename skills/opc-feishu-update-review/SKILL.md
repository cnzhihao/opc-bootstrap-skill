---
name: opc-feishu-update-review
description: OPC 秘书飞书更新与复盘工作流。用于在完成每日/每周工作后，把经营进展整理成 OPC CEO 作战系统的拟更新方案，经用户确认后再同步到飞书多维表格、方法文档、周/月复盘库，并沉淀新的经营判断。所有新增经营信息必须先拟进入「脑内清空池」，再判断是否命中本周主战役，以及是否派生客户线索、内容选题、服务产品、项目变动、现金流和回款记录。任何实际写表、改表、删表、归档和状态迁移都必须先向用户说明拟操作内容并获得明确确认。当用户说“更新 OPC 飞书系统”“同步今天工作”“做今天收口”“做本周复盘”“把这些更新到飞书”“沉淀到 OPC 系统”等时使用。
---

# OPC 飞书更新与复盘工作流

## 定位

OPC 秘书飞书更新与复盘工作流。用于在完成每日/每周工作后，把经营进展整理成 OPC CEO 作战系统的拟更新方案，经用户确认后再同步到飞书多维表格、方法文档、周/月复盘库，并沉淀新的经营判断。所有新增经营信息必须先拟进入「脑内清空池」，再判断是否命中本周主战役，以及是否派生客户线索、内容选题、服务产品、项目变动、现金流和回款记录。任何实际写表、改表、删表、归档和状态迁移都必须先向用户说明拟操作内容并获得明确确认。当用户说“更新 OPC 飞书系统”“同步今天工作”“做今天收口”“做本周复盘”“把这些更新到飞书”“沉淀到 OPC 系统”等时使用。

本文件只保留技能入口、触发边界、执行骨架和确认门禁；稳定规则、模板、字段、目录、故障处理和验收标准见下方 references。

## 触发场景

- 用户请求与「飞书经营系统」相关，并需要进入该技能的主流程。
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



## Suite 合并关系

本 skill 是飞书经营系统沉淀与复盘 suite 的经营信息更新入口。`opc-weekly-review-dispatcher` 负责周复盘启动；知识库维护、周复盘生成、内容工厂周复盘能力已合并进本 suite 的 references。

所有实际写表、改表、建文档、归档动作仍必须先给拟操作并获得用户确认。

## Reference Map

- [更新复盘流程](references/update-review-flow.md)
- [脑内清空池规则](references/clearance-pool-rules.md)
- [飞书更新地图](references/feishu-update-map.md)
- [归档与字段规则](references/archive-and-field-rules.md)
- [飞书经营系统与复盘 suite 地图](references/feishu-review-suite-map.md)
- [周复盘模板](references/weekly-review-template.md)
- [月复盘模板](references/monthly-review-template.md)
- [知识库维护归档说明](references/kb-maintenance-archived-entry.md)
- [知识库结构](references/kb-structure.md)
- [知识库维护规则](references/kb-maintenance-rules.md)
