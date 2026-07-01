# 格式、图片、分隔线处理规则

适用技能：`opc-content-factory-x-article-publisher`  
业务域：X Article 发布

> 本文件由原 `SKILL.md` 中稳定、可复用的规则章节迁移而来。入口 `SKILL.md` 仅保留触发、流程骨架和引用关系。

## Supported Formatting

| Element | Support | Notes |
|---------|---------|-------|
| H2 (`##`) | Native | Section headers |
| Bold (`**`) | Native | Strong emphasis |
| Italic (`*`) | Native | Emphasis |
| Links (`[](url)`) | Native | Hyperlinks |
| Ordered lists | Native | 1. 2. 3. |
| Unordered lists | Native | - bullets |
| Blockquotes (`>`) | Native | Quoted text |
| Code blocks | Converted | → Blockquotes |
| Tables | Converted | → PNG images (use table_to_image.py) |
| Mermaid | Converted | → PNG images (use mmdc) |
| Dividers (`---`) | Menu insert | → Insert > Divider |
