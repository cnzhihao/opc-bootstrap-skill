# 已合并旧入口：opc-product-push-decision

> 来源：已合并旧入口 `opc-product-push-decision`。本文件用于保留旧入口的触发、流程与历史说明；当前主入口为 `opc-sales-delivery-workflow`。

---
name: opc-product-push-decision
description: OPC 产品/项目当前是否该推判断。用于判断某个产品、工具、项目或 demo 当前应该立刻售卖、渠道测试、做内容资产、内部使用，还是进入暂停池。
---


# OPC 产品/项目当前是否该推判断

## 使用场景
当用户想推进一个产品、工具、项目、demo，但不确定是否现在应该卖、给渠道、写内容、内部用或暂停时使用。

## 判断维度
- 目标客户是否清楚？
- 购买理由是否明确？
- 是否有可演示结果？
- 是否能在 48 小时内推进？
- 是否会挤占现金流动作？
- 是否更适合作为内容资产或内部能力？
- 是否有渠道能理解和转述？

## 决策结果
- 立刻卖：有明确客户、明确痛点、明确交付。
- 渠道测试：渠道能讲清，材料足够简单。
- 做内容资产：适合教育市场，不适合直接卖。
- 内部使用：提升自身交付效率。
- 暂停：不靠近本周主战役或消耗过大。

## 输出格式
- 当前项目：
- 推荐状态：立刻卖/渠道测试/内容资产/内部使用/暂停
- 理由：
- 48 小时动作：
- 不做事项：
- 进入哪个飞书表：

## 禁忌
不要因为产品自己喜欢就默认推向市场。



## 合并关系

本 skill 已并入 `opc-sales-delivery-workflow` 的销售交付 suite，当前保留为产品推送兼容入口。

当输入只是判断某产品是否适合推荐时可以继续使用本入口；如涉及销售推进、报价或交付，应转入 `opc-sales-delivery-workflow`。

主链路参考：`opc-sales-delivery-workflow`（原链接：`../opc-sales-delivery-workflow/SKILL.md`，已合并归档）。

## Reference Map

本技能的稳定规则、模板和判断标准已沉淀到以下 references；执行时先读入口流程，再按场景读取对应 reference：

- `references/product-push-decision.md`（原链接：`references/product-push-decision.md`，已合并归档）：产品推送判断规则
