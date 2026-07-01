# 已合并旧入口：经营周复盘生成

> 来源：已合并旧入口“经营周复盘生成”。本文件用于保留旧入口的触发、流程与历史说明；当前主入口为 `opc-weekly-review-dispatcher`。

---
name: archived-weekly-review-generator
description: OPC 周复盘生成。用于每周五或周末综合本周主战役、现金流、客户、内容、产品、系统和下周 48 小时突破点，生成经营判断型周复盘。它是 OPC 三段式周复盘链路的第一段；完整链路请由 opc-weekly-review-dispatcher 调度，再衔接内容工厂周复盘规则和 `opc-content-factory-weekly-report`。
---


# OPC 周复盘生成

## 使用场景
每周五、周末或用户说“做本周复盘”“本周收口”“总结本周经营情况”时使用。

## 在三段式周复盘链路中的位置

本 Skill 是 **第一段：经营周复盘**。

完整链路由 `opc-weekly-review-dispatcher` 统一调度：

```text
1. 经营周复盘：判断本周经营是否打赢
2. 内容工厂周复盘：判断内容是否服务经营主战役
3. opc-content-factory-weekly-report：周报内容产品化，生成发布稿、长视频口播稿和多平台发布包
```

本 Skill 只负责经营判断，不直接生成内容工厂发布稿、长视频口播稿或多平台发布包。如果用户需要完整周报产品，应转入 `opc-weekly-review-dispatcher` 或继续调用后两段 Skill。

## 输入
- 本周主战役。
- 月度现金流、已到账、待回款、缺口。
- 客户线索、项目、回款记录。
- 内容发布与反馈。
- 产品/服务推进判断。
- 本周完成、未完成、暂停事项。

## 工作流程
1. 读取/询问本周事实。
2. 判断主战役是否完成或切换。
3. 量化现金流进展。
4. 复盘收入机会和客户阶段。
5. 复盘内容和获客。
6. 复盘产品服务判断。
7. 复盘系统是否承接工作。
8. 输出下周 48 小时突破点。
9. 更新周复盘文档和必要多维表格。

## 输出结构
- 本周一句话结论。
- 主战役复盘。
- 现金流进展。
- 客户和收入机会。
- 内容和获客。
- 产品和服务判断。
- 系统与流程。
- 下周 48 小时突破点。

## 注意
周复盘不是流水账，而是经营判断沉淀。



## 合并关系

本 skill 已并入飞书经营系统与周复盘 suite，当前保留为周复盘文本生成子流程。

当任务是完整周复盘启动或涉及内容发布包/归档时，应转入 `opc-weekly-review-dispatcher`。

主入口参考：`opc-feishu-update-review`；周复盘入口参考：`opc-weekly-review-dispatcher`。

## Reference Map

本技能的稳定规则、模板和判断标准已沉淀到以下 references；执行时先读入口流程，再按场景读取对应 reference：

- `references/weekly-review-output-standard.md`（原链接：`references/weekly-review-output-standard.md`，已合并归档）：周复盘生成标准
