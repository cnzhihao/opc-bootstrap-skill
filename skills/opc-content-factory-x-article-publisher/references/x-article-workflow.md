# X Article 发布工作流

适用技能：`opc-content-factory-x-article-publisher`  
业务域：X Article 发布

> 本文件由原 `SKILL.md` 中稳定、可复用的规则章节迁移而来。入口 `SKILL.md` 仅保留触发、流程骨架和引用关系。

## Workflow

**Strategy: "先文后图后分割线" (Text First, Images Second, Dividers Last)**

For articles with images and dividers, paste ALL text content first, then insert images and dividers at correct positions using block index.

1. **(Optional)** Pre-process: Convert tables/mermaid to images
2. Parse Markdown with Python script → get title, images, **dividers** with block_index, HTML
3. Navigate to X Articles editor
4. Upload cover image (first image)
5. Fill title
6. Copy HTML to clipboard (Python) → Paste with Cmd+V
7. Insert content images at positions specified by block_index
8. **Insert dividers at positions specified by block_index** (via Insert > Divider menu)
9. Save as draft (NEVER auto-publish)

## Step 1: Parse Markdown (Python)

Use `parse_markdown.py` to extract all structured data:

```bash
python ~/.claude/skills/x-article-publisher/scripts/parse_markdown.py /path/to/article.md
```

Output JSON:
```json
{
  "title": "Article Title",
  "cover_image": "/path/to/first-image.jpg",
  "cover_exists": true,
  "content_images": [
    {"path": "/path/to/img2.jpg", "original_path": "/md/dir/assets/img2.jpg", "exists": true, "block_index": 5, "after_text": "context..."},
    {"path": "/path/to/img3.jpg", "original_path": "/md/dir/assets/img3.jpg", "exists": true, "block_index": 12, "after_text": "another..."}
  ],
  "html": "<p>Content...</p><h2>Section</h2>...",
  "total_blocks": 45,
  "missing_images": 0
}
```

**Key fields:**
- `block_index`: The image should be inserted AFTER block element at this index (0-indexed)
- `total_blocks`: Total number of block elements in the HTML
- `after_text`: Kept for reference/debugging only, NOT for positioning
- `exists`: Whether the image file was found (if false, upload will fail)
- `original_path`: The path resolved from Markdown (before auto-search)
- `path`: The actual path to use (may differ from original_path if auto-searched)
- `missing_images`: Count of images not found anywhere

Save HTML to temp file for clipboard:
```bash
python parse_markdown.py article.md --html-only > /tmp/article_html.html
```

## Step 2: Open X Articles Editor

### 浏览器错误处理

如果遇到 `Error: Browser is already in use` 错误：

```
# 方案1：先关闭浏览器再重新打开
browser_close
browser_navigate: https://x.com/compose/articles

# 方案2：如果 browser_close 无效（锁定），提示用户手动关闭 Chrome

# 方案3：使用已有标签页，直接导航
browser_tabs action=list  # 查看现有标签
browser_navigate: https://x.com/compose/articles  # 在当前标签导航
```

**最佳实践**：每次开始前先用 `browser_tabs action=list` 检查状态，避免创建多余空白标签。

### 导航到编辑器

```
browser_navigate: https://x.com/compose/articles
```

**重要**: 页面加载后会显示草稿列表，不是编辑器。需要：

1. **等待页面加载完成**: 使用 `browser_snapshot` 检查页面状态
2. **立即点击 "create" 按钮**: 不要等待 "添加标题" 等编辑器元素，它们只有点击 create 后才出现
3. **等待编辑器加载**: 点击 create 后，等待编辑器元素出现

```
# 1. 导航到页面
browser_navigate: https://x.com/compose/articles

# 2. 获取页面快照，找到 create 按钮
browser_snapshot

# 3. 点击 create 按钮（通常 ref 类似 "create" 或带有 create 标签）
browser_click: element="create button", ref=<create_button_ref>

# 4. 现在编辑器应该打开了，可以继续上传封面图等操作
```

**注意**: 不要使用 `browser_wait_for text="添加标题"` 来等待页面加载，因为这个文本只有在点击 create 后才出现，会导致超时。

If login needed, prompt user to log in manually.

## Step 3: Upload Cover Image

1. Click "添加照片或视频" button
2. Use browser_file_upload with the cover image path (from JSON output)
3. Verify image uploaded

## Step 4: Fill Title

- Find textbox with "添加标题" placeholder
- Use browser_type to input title (from JSON output)

## Step 5: Paste Text Content (Python Clipboard)

Copy HTML to system clipboard using Python, then paste:

```bash
# Copy HTML to clipboard
python ~/.claude/skills/x-article-publisher/scripts/copy_to_clipboard.py html --file /tmp/article_html.html
```

Then in browser:
```
browser_click on editor textbox
browser_press_key: Meta+v
```

This preserves all rich text formatting (H2, bold, links, lists).

## Step 6: Insert Content Images (Text Search Positioning)

**推荐方法**: 使用 `after_text` 文字搜索定位，比 `block_index` 更直观可靠。

### 定位原理

每张图片的 `after_text` 字段记录了它前一个段落的末尾文字（最多80字符）。在编辑器中搜索包含该文字的段落，点击后插入图片。

### 操作步骤

For each content image (from `content_images` array), **按 block_index 从大到小的顺序**：

```bash
# 1. Copy image to clipboard (with compression)
python ~/.claude/skills/x-article-publisher/scripts/copy_to_clipboard.py image /path/to/img.jpg --quality 85
```

```
# 2. 在 browser_snapshot 中搜索包含 after_text 的段落
#    找到该段落的 ref

# 3. Click the paragraph containing after_text
browser_click: element="paragraph with target text", ref=<paragraph_ref>

# 4. **关键步骤**: 按 End 键移动光标到行尾
#    这一步非常重要！避免点击到段落中的链接导致位置偏移
browser_press_key: End

# 5. Paste image
browser_press_key: Meta+v

# 6. Wait for upload (only use textGone, no time parameter)
browser_wait_for textGone="正在上传媒体"
```

### 为什么需要按 End 键？

**问题**: 当段落包含链接时（如 `链接文字 + URL`），点击段落可能会：
- 触发链接编辑弹窗
- 将光标定位在链接内部而非段落末尾

**解决方案**: 点击段落后立即按 `End` 键：
- 确保光标移动到段落末尾
- 避免链接干扰
- 图片将正确插入在该段落之后

### 定位策略

在 browser_snapshot 返回的结构中，搜索 `after_text` 的关键词：

```yaml
textbox [ref=editor]:
  generic [ref=p1]:
    - StaticText: "元旦假期我在家里翻手机相册..."  # 如果 after_text 包含这段文字，点击 p1
  heading [ref=h1]:
    - StaticText: "演示"
  generic [ref=p2]:
    - StaticText: "这东西到底有多省事儿？"
    - link [ref=link1]: "Claude Code"  # 注意：段落可能包含链接
  ...
```

### 反向插入示例

如果有3张图片，block_index 分别为 5, 12, 27：
1. 先插入 block_index=27 的图片（after_text 搜索 + End + 粘贴）
2. 再插入 block_index=12 的图片
3. 最后插入 block_index=5 的图片

**从大到小插入**可以避免位置偏移问题。

## Step 6.5: Insert Dividers (Via Menu)

**重要**: Markdown 中的 `---` 分割线不能通过 HTML `<hr>` 标签粘贴（X Articles 会忽略它）。必须通过 X Articles 的 Insert 菜单插入。

### 操作步骤

For each divider (from `dividers` array), in **reverse order of block_index**:

```
# 1. Click the block element at block_index position
browser_click on the element at position block_index in the editor

# 2. Open Insert menu (Add Media button)
browser_click on "Insert" or "添加媒体" button

# 3. Click Divider menu item
browser_click on "Divider" or "分割线" menuitem

# Divider is inserted at cursor position
```

### 与图片的插入顺序

建议先插入所有图片，再插入所有分割线。两者都按 block_index **从大到小**的顺序：

1. 插入所有图片（从最大 block_index 开始）
2. 插入所有分割线（从最大 block_index 开始）

## Step 7: Save Draft

1. Verify content pasted (check word count indicator)
2. Draft auto-saves, or click Save button if needed
3. Click "预览" to verify formatting
4. Report: "Draft saved. Review and publish manually."

## Example Flow

User: "Publish /path/to/article.md to X"

```bash
# Step 1: Parse Markdown
python ~/.claude/skills/x-article-publisher/scripts/parse_markdown.py /path/to/article.md > /tmp/article.json
python ~/.claude/skills/x-article-publisher/scripts/parse_markdown.py /path/to/article.md --html-only > /tmp/article_html.html
```

2. Navigate to https://x.com/compose/articles
3. Upload cover image (browser_file_upload for cover only)
4. Fill title (from JSON: `title`)
5. Copy & paste HTML:
   ```bash
   python ~/.claude/skills/x-article-publisher/scripts/copy_to_clipboard.py html --file /tmp/article_html.html
   ```
   Then: browser_press_key Meta+v
6. For each content image, **in reverse order of block_index**:
   ```bash
   python copy_to_clipboard.py image /path/to/img.jpg --quality 85
   ```
   - Click block element at `block_index` position
   - browser_press_key Meta+v
   - Wait until upload complete
7. Verify in preview
8. "Draft saved. Please review and publish manually."
