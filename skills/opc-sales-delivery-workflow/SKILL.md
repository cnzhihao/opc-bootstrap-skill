---
name: opc-sales-delivery-workflow
description: OPC 销售与交付一体化工作流。用于把线索清空、销售对话、报价澄清、产品推送和会议转交付合并成一条从客户机会到交付推进的完整链路。适用于“这个客户怎么跟”“这个需求怎么报价”“会议纪要转交付”“这个产品要不要推”“线索值不值得追”等请求。高风险动作如正式报价、对外发送、承诺交付范围前必须先给拟方案并获得用户明确确认。
---

# Skill: opc-sales-delivery-workflow

## 定位

本 skill 是 OPC 销售与交付链路的主入口，已合并以下能力：

- 线索清空
- 销售对话
- 报价澄清
- 产品推送
- 会议转交付

处理顺序遵循：

```text
线索判断 → 客户阶段 → 销售对话 → 报价边界 → 产品推送 → 会议转交付 → 回款/复盘沉淀
```

## 脚本化执行

当任务涉及本 Skill 的飞书 CLI 操作、数据处理或批量校验时，先读取 `references/script-prompts.md`，按其中定义的脚本清单、参数、确认门禁和验收标准执行。

脚本应归属于本 Skill 包内的 `scripts/` 目录；飞书 CLI 操作默认使用 `.mjs` 并通过 `$BOX_AGENT_NODE` 执行，数据处理脚本可使用 `.py` 并通过 `$BOX_AGENT_PYTHON` 执行。执行真实脚本前先确认脚本文件存在。

涉及飞书写入、归档、发布、删除、状态迁移或对外承诺时，先向用户展示拟操作清单，获得明确确认后再执行；写入型脚本默认 dry-run，确认后才使用 execute 模式。

## 触发场景

当用户输入涉及以下事项时，优先进入本 skill：

- 线索是否值得追；
- 客户该怎么回复、怎么推进；
- 对方问报价、预算、范围、交付周期；
- 是否适合推某个产品或服务；
- 会议纪要需要转成项目交付动作；
- 销售动作与现金流、项目交付同时相关。

## 工作流

1. **梳理客户事实**：区分线索来源、客户阶段、真实需求、预算/时间/决策人、信任基础。
2. **合并成交路径**：判断当前更适合推进信任、澄清需求、报价、产品推荐，还是转交付。
3. **突破下一动作**：给出 1 个最该发出的客户动作或 48 小时内最能推动成交/回款的动作。
4. **确认门禁**：正式报价、承诺范围、对外发送消息、修改飞书客户/项目状态前，必须先给拟方案并等待确认。
5. **沉淀资产**：可复用话术、报价边界、客户案例、交付任务应交给飞书更新或知识库维护链路。

## 输出标准

默认输出：

- 客户/线索阶段判断；
- 当前最关键的商业问题；
- 推荐动作，按“现在发什么 / 暂时不做什么 / 需要确认什么”展开；
- 如涉及报价，给出范围澄清问题，不直接替用户正式报价；
- 如涉及会议，转成交付事项、负责人、风险和下一检查点。

## Reference Map

- [销售交付链路总览](references/sales-delivery-workflow.md)
- [线索清空归档说明](references/lead-clearance-archived-entry.md)
- [线索清空规则](references/lead-clearance-rules.md)
- [销售对话 playbook](references/sales-conversation-playbook.md)
- [报价范围澄清](references/quote-scope-clarifier.md)
- [报价澄清问题](references/quote-scope-questions.md)
- [产品推送决策](references/product-push-decision.md)
- [产品推送决策树](references/product-push-decision-tree.md)
- [会议转交付规则](references/meeting-to-delivery-rules.md)
