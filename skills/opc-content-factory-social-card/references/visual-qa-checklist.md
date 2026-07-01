# 视觉验收清单

适用技能：`opc-content-factory-social-card`  
业务域：社交卡片

> 本文件由原 `SKILL.md` 中稳定、可复用的规则章节迁移而来。入口 `SKILL.md` 仅保留触发、流程骨架和引用关系。

# Guizang Social Card Skill

Create polished social card packages for Xiaohongshu/Rednote, WeChat Official Account, article covers, and platform thumbnails.

This skill is self-contained. It borrows visual principles from the Guizang PPT style system, but it must not edit the original PPT skill, its templates, or its references. If the original PPT skill is available, you may read it for reference only. Put all generated work in the current project or in the user-requested output folder.

## Required References

Read these files as needed:

- `references/platform-specs.md` for exact ratios, output sizes, and naming.
- `references/style-system.md` for Guizang editorial and Swiss visual rules.
- `references/theme-presets.md` when choosing electronic-magazine palettes or Swiss accent palettes.
- `references/layout-recipes.md` when selecting carousel/social-card/WeChat page structures.
- `references/components.md` for the shared component spec: font stacks, type scale, minimum readable sizes, Chinese title length bands, Swiss card-fill mutual-exclusion rule, image-container ratio classes, spacing tokens, and Lucide icon rules.
- `references/background-systems.md` when building electronic-magazine WebGL/ink/paper backgrounds.
- `references/portrait-fill.md` when adapting layouts to 3:4 and avoiding under-filled vertical space.
- `references/content-planning.md` for cover hooks, page breakdown, and copy compression.
- `references/production-workflow.md` for HTML/CSS rendering and image handling.
- `references/image-overlay.md` whenever text sits on top of a photo: photo qualification, localized tint fallback, and face / subject avoidance via multimodal subject mapping.
- `references/screenshot-treatment.md` when the user supplies an app / web / code / dashboard screenshot — picks `.frame-shot` over `.frame-img`, sets corners/shadow/bg/inset, decides on `.device-browser` or `.device-phone` chrome.
- `references/map-component.md` when the content has spatial relationships (travel route, store locations, walking tour) — real routes default to Mapbox Static or OSM static tiles; schematic SVG is only for conceptual / illustrative maps. Pins are HTML overlays; never use live JS maps.
- `references/title-shortener.md` when the task is a WeChat 21:9+1:1 cover pair, or any cross-platform reuse — derives the 1:1 short title from the long one (5-step extraction, 4 patterns, anti-patterns, sizing on `.poster.square`).
- `references/category-cookbook.md` to route a user-named Rednote category (旅行 / 职场 / 游戏 / 影视 / 彩妆 / 美食 / 穿搭 / 家居 / 健身 / 情感 / 推荐) to applicable recipes and to confirm scope.
- `references/qa-checklist.md` before delivering final images.

## Non-Negotiables

- Never edit the original Guizang PPT skill or any upstream skill copied from elsewhere.
- Do not create random decorative SVG ovals, blobs, rain drops, stickers, or meaningless circles.
- Do not use nested cards or generic SaaS card layouts as the default.
- Do not let text overflow, touch the edge, or collide with the footer band. Pin `.foot` with `margin-top: auto` inside a flex column, never with `position: absolute` over growing content.
- Do not let text become too small to read on mobile.
- Do not write inline `font-size` + `font-weight` on display titles in Swiss. Use the typed classes (`.h-hero` / `.h-statement` / `.h-xl` / `.num-mega`). A 80-120px headline at weight 700-900 is not Swiss; "the larger, the lighter" is a hard rule.
- Do not deliver Editorial posters with a flat paper background, mono labels on every row, and no atmosphere layer. Run the Editorial Identity Test in `references/style-system.md` — a serif title alone does not make a poster Editorial.
- Do not fake data, release details, or percentages.
- Do not crop faces, key UI text, or hardware/product details unless the user explicitly accepts it.
- Do not reuse a 21:9 cover by blindly cropping it into 1:1. Compose each ratio separately.
- **3:4 卡必须吃满画布**。Content (text + image + data) 必须覆盖 ≥75% 画布高度。任何 >15% 画布高度的纯空白带都需要"留白理由"：(a) hero image 自带呼吸、(b) 单句宣言式 hero statement、(c) 段落顶/底 leading & trailing whitespace（前后总和 ≤15%）。**禁止用 `<div style="flex: 1"></div>` 上下夹击把内容塞到中段**——杂志页留白逻辑不适用于社交卡（杂志靠对开页吸收留白，社交卡逐张独立刷，欠填看着像 PPT 漏排）。Recipe-by-recipe 最小密度见 `references/layout-recipes.md` 每条 recipe 的「Minimum density」段。Render 后必须跑 `qa-checklist.md` 的 4 横带密度检查。
