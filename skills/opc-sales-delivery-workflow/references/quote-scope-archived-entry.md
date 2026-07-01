# 已合并旧入口：opc-quote-scope-clarifier

> 来源：已合并旧入口 `opc-quote-scope-clarifier`。本文件用于保留旧入口的触发、流程与历史说明；当前主入口为 `opc-sales-delivery-workflow`。

---
name: opc-quote-scope-clarifier
description: OPC 报价前实施范围澄清。用于客户报价前先明确需求、实施范围、交付边界、投入天数、风险、付款方式和案例价值，避免报价过低或范围过大。
---


# OPC 报价前实施范围澄清

## 使用场景
当用户准备给客户报价、写方案、确定交付范围时使用。尤其适用于多维表格、AI 工作流、培训、陪跑、系统搭建类项目。

## 必问问题
1. 客户业务流程是什么？
2. 当前最大痛点是什么？
3. 这次交付要解决到什么程度？
4. 包含哪些交付物？
5. 明确不包含哪些内容？
6. 需要几轮沟通、几次培训、几次修改？
7. 预计投入几天？
8. 客户是否有明确预算和决策人？
9. 是否有案例价值、复用价值、转介绍价值？
10. 付款方式和验收标准是什么？

## 工作流程
先澄清范围，再给报价建议；先划边界，再写方案；先估算投入，再决定价格。

## 输出格式
- 客户需求摘要：
- 本次交付目标：
- 包含范围：
- 不包含范围：
- 交付物：
- 沟通/修改次数：
- 预计投入：
- 风险点：
- 案例价值：
- 报价策略建议：

## 禁忌
不要在信息不足时直接套三档报价；不要把后续维护默认包含进一次性报价。



## 合并关系

本 skill 已并入 `opc-sales-delivery-workflow` 的销售交付 suite，当前保留为报价澄清兼容入口。

当输入只是报价范围澄清时可以继续使用本入口；如涉及客户阶段、成交路径或交付边界，应转入 `opc-sales-delivery-workflow`。

主链路参考：`opc-sales-delivery-workflow`（原链接：`../opc-sales-delivery-workflow/SKILL.md`，已合并归档）。

## Reference Map

本技能的稳定规则、模板和判断标准已沉淀到以下 references；执行时先读入口流程，再按场景读取对应 reference：

- `references/quote-scope-clarifier.md`（原链接：`references/quote-scope-clarifier.md`，已合并归档）：报价边界澄清规则
