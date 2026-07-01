---
name: opc-skill-dispatcher
description: OPC Skill 总调度协议。用于在用户输入涉及多个 OPC skill、多个业务域，或不确定应调用哪个 skill 时，按 OPC 调度协议 v1 识别主流程、辅助 skill、优先级与确认门禁。它是 OPC skill 集合的上层路由器，不直接写入飞书、不直接发布、不直接报价，而是负责路由、编排和确认边界。触发词包括：OPC 调度、按 OPC 流程处理、这个该走哪个 skill、帮我判断怎么处理、这个事情怎么推进、这些事合并一下、调度一下、分发一下、按 v1 执行。
---

# Skill: opc-skill-dispatcher

## 定位

OPC Skill 总调度协议。用于在用户输入涉及多个 OPC skill、多个业务域，或不确定应调用哪个 skill 时，按 OPC 调度协议 v1 识别主流程、辅助 skill、优先级与确认门禁。它是 OPC skill 集合的上层路由器，不直接写入飞书、不直接发布、不直接报价，而是负责路由、编排和确认边界。触发词包括：OPC 调度、按 OPC 流程处理、这个该走哪个 skill、帮我判断怎么处理、这个事情怎么推进、这些事合并一下、调度一下、分发一下、按 v1 执行。

本文件只保留技能入口、触发边界、执行骨架和确认门禁；稳定规则、模板、字段、目录、故障处理和验收标准见下方 references。

## 触发场景

- 用户请求与「调度与架构」相关，并需要进入该技能的主流程。
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

- [`references/routing-rules.md`](references/routing-rules.md)：OPC skill 调度路由规则
- [`references/domain-map.md`](references/domain-map.md)：OPC 技能业务域地图
- [`references/handoff-and-confirmation.md`](references/handoff-and-confirmation.md)：跨域交接与确认门禁
