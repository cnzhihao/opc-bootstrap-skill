# 已合并旧入口：opc-income-opportunity-prioritization

> 来源：已合并旧入口 `opc-income-opportunity-prioritization`。本文件用于保留旧入口的触发、流程与历史说明；当前主入口为 `opc-ceo-rhythm-workflow`。

---
name: opc-income-opportunity-prioritization
description: OPC 收入机会优先级排序。用于把客户、合作方、渠道、内容、商单、培训、交付机会按 P0/P1/P2/P3 排序，决定今天和本周先推进什么。
---


# OPC 收入机会优先级排序

## 使用场景
当用户同时有多个客户、合作、渠道、内容和产品机会，需要判断哪个最接近钱、哪个应暂停时使用。

## 排序标准
优先级从高到低：
1. 已交付待回款。
2. 已报价或今天必须报价。
3. 有明确需求和付款方。
4. 有渠道可分发且材料已接近完成。
5. 需要新制作但 48 小时可推进。
6. 长期有价值但短期不转化。

## 工作流程
1. 列出所有机会。
2. 判断每个机会的阶段、金额、确定性、下一步、耗时。
3. 分为 P0/P1/P2/P3。
4. P0 必须进入今日动作；P1 进入本周；P2 进入下周规划；P3 进入暂停池。
5. 更新客户线索、项目总表、回款记录或内容选题池。

## 输出格式
| 优先级 | 机会 | 金额/价值 | 当前阶段 | 下一步 | 为什么 |
|---|---|---:|---|---|---|

## 禁忌
不要按兴趣排序；不要把“感觉有机会”排在“已交付待回款”前面。



## 合并关系

本 skill 已并入 `opc-ceo-rhythm-workflow` 的 CEO 经营节奏 suite，当前保留为收入机会优先级子流程。

机会排序应回到 CEO rhythm，与现金流、交付能力和本周主战役一起判断。

主入口参考：`opc-ceo-rhythm-workflow`（原链接：`../opc-ceo-rhythm-workflow/SKILL.md`，已合并归档）。

## Reference Map

本技能的稳定规则、模板和判断标准已沉淀到以下 references；执行时先读入口流程，再按场景读取对应 reference：

- `references/opportunity-prioritization-rubric.md`（原链接：`references/opportunity-prioritization-rubric.md`，已合并归档）：收入机会优先级评分规则
