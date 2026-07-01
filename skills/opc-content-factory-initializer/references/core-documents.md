# 初始化核心文档清单

适用技能：`opc-content-factory-initializer`  
业务域：内容工厂初始化

> 本文件由原 `SKILL.md` 中稳定、可复用的规则章节迁移而来。入口 `SKILL.md` 仅保留触发、流程骨架和引用关系。

## 六、初始化时创建的 7 个核心文档

默认创建：

```text
00 内容工厂总控台/
├── README｜自媒体内容工厂使用说明
├── 内容主战役看板
├── 本周内容排产表
└── 暂停不做池

07 模板与配置库/03 选题模板/
└── 模板｜选题笔记

07 模板与配置库/04 访谈模板/
└── 模板｜访谈记录

07 模板与配置库/07 复盘模板/
└── 模板｜单篇内容复盘
```

注意：模板应尽量按类型分别落位，避免后续技能读取时混乱。

## 九、与其他技能的关系

本技能是地基技能。

```text
opc-content-factory-initializer
  ↓
opc-content-factory-workflow
  ↓
opc-content-factory-topic-prioritization / topic-picker
  ↓
opc-content-factory-interview / draft-optimizer
  ↓
opc-content-factory-channel-fit / publisher / social-card
  ↓
opc-content-factory-weekly-review / asset-archive
```

初始化完成后，默认建议用户进入：

> `opc-content-factory-workflow`：梳理本周内容主战役和 48 小时内容突破点。
