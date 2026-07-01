# 已合并旧入口：opc-feishu-kb-maintenance

> 来源：已合并旧入口 `opc-feishu-kb-maintenance`。本文件用于保留旧入口的触发、流程与历史说明；当前主入口为 `opc-feishu-update-review`。

---
name: opc-feishu-kb-maintenance
description: OPC 飞书知识库维护。用于维护 OPC秘书飞书文件夹、多维表格、秘书工作方法、周月复盘库、月份文件夹、归档与暂停池；检查结构、补建缺失文档和字段。删除内容前必须获得用户明确确认。
---


# OPC 飞书知识库维护

## 使用场景
当用户需要整理 OPC 飞书知识库、新建月份复盘文件夹、补齐周/月复盘文档、检查多维表格字段、沉淀方法文档或清理重复内容时使用。

## 维护对象
- OPC秘书 根文件夹。
- 00｜OPC CEO 作战系统（多维表格）。
- 01｜秘书工作方法。
- 02｜周月复盘库。
- 99｜归档与暂停资料。

## 工作流程
1. 只读检查结构。
2. 对照标准结构列出缺失、重复、异常。
3. 补建缺失文件夹/文档/表字段。
4. 同步方法文档和复盘模板。
5. 对重复或短模板内容，先报告并请求确认。
6. 用户明确确认后再删除或移动。
7. 完成后做校验并汇报。

## 输出格式
- 当前结构状态。
- 已补建内容。
- 需要用户确认的清理项。
- 风险与建议。
- 下一次维护时间。

## 安全规则
不主动删除飞书内容；删除、移动、覆盖前必须明确说明对象并获得用户确认。



## 合并关系

本 skill 已并入飞书经营系统与周复盘 suite，当前保留为飞书知识库结构维护子流程。

结构补建、字段维护和归档检查应服务于 `opc-feishu-update-review` 的经营系统沉淀。

主入口参考：`opc-feishu-update-review`；周复盘入口参考：`opc-weekly-review-dispatcher`。

## Reference Map

本技能的稳定规则、模板和判断标准已沉淀到以下 references；执行时先读入口流程，再按场景读取对应 reference：

- `references/kb-maintenance-rules.md`（原链接：`references/kb-maintenance-rules.md`，已合并归档）：飞书知识库维护规则
