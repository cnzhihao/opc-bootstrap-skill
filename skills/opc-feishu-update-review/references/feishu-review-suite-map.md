# 飞书经营系统与复盘 suite 地图

主入口：`opc-feishu-update-review`  
周复盘入口：`opc-weekly-review-dispatcher`

## 主链路

```text
经营信息进入 → 脑内清空池 → 分流判断 → 飞书经营系统更新 → 周/月复盘归档 → 内容/销售/项目资产沉淀
```

## 主从关系

| 场景 | 主入口 | 子流程 |
|---|---|---|
| 今天做完工作，需要沉淀 | `opc-feishu-update-review` | 脑内清空池、飞书表格/文档更新 |
| 周复盘启动 | `opc-weekly-review-dispatcher` | 经营复盘、内容复盘、发布包生成 |
| 只生成周复盘文本 | `opc-weekly-review-generator` | 输出结构子流程 |
| 内容工厂周复盘 | `opc-content-factory-weekly-review` | 内容复盘子流程 |
| 内容周报/发布稿 | `opc-content-factory-weekly-report` | 内容产品化子流程 |
| 维护知识库结构 | `opc-feishu-kb-maintenance` | 结构检查子流程 |

## 归档原则

- 周复盘、内容工厂发布稿、长视频口播稿应放入对应月份文件夹。
- 命名沿用该月已有的 `YYYY-MM-Wx｜类型｜标题/日期` 格式。
- 实际创建、复制、移动、写表、改表、删表前必须向用户说明拟操作并获得明确确认。
- 飞书云文档优先于上传 docx 附件。

## 与其他 suite 的衔接

- CEO 节奏产出的主战役、暂停池、48 小时突破点，进入本 suite 做经营系统沉淀。
- 销售交付产出的客户线索、报价边界、交付任务，进入本 suite 做客户/项目记录。
- 内容工厂产出的发布稿、口播稿、选题复盘，进入本 suite 做月份归档。
