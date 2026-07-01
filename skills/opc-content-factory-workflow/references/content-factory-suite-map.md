# 内容工厂 suite 地图

适用主入口：`opc-content-factory-workflow`

## 主链路

```text
经营目标/素材 → 选题池 → 选题优先级 → 访谈 → 初稿 → 五轮优化 → 渠道适配 → 视觉资产 → 发布同步 → 资产归档 → 周复盘
```

## 主入口与子流程

| 场景 | 主入口 | 子流程/参考 |
|---|---|---|
| 不知道内容该怎么推进 | `opc-content-factory-workflow` | 全链路判断 |
| 选题进入与选择 | `opc-content-factory-topic-picker` | 兼容 `topic-prioritization` 评分规则 |
| 渠道判断 | `opc-content-factory-channel-fit` | 兼容旧 `opc-content-channel-fit` |
| 深度访谈 | `opc-content-factory-interview` | 访谈题库 |
| 草稿优化 | `opc-content-factory-draft-optimizer` | 五轮改稿清单 |
| 封面/卡片 | `opc-content-factory-cover-generator` / `opc-content-factory-social-card` | 视觉规范 |
| 发布同步 | `opc-content-factory-publisher` / `opc-content-factory-wechatsync` / `opc-content-factory-x-article-publisher` | 平台发布规则 |
| 周报/复盘 | `opc-content-factory-weekly-report` / `opc-content-factory-weekly-review` | 联动周复盘与飞书归档 |

## 合并原则

- `opc-content-factory-workflow` 是内容工厂总入口。
- `opc-content-factory-topic-prioritization` 降级为选题评分子流程，优先由 `opc-content-factory-topic-picker` 承接。
- `opc-content-channel-fit` 降级为旧兼容入口，统一由 `opc-content-factory-channel-fit` 承接。
- 所有涉及归档、飞书创建、发布动作的步骤，必须先给拟方案并获得用户确认。
