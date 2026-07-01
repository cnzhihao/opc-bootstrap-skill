# 浏览器操作与故障处理规则

适用技能：`opc-content-factory-x-article-publisher`  
业务域：X Article 发布

> 本文件由原 `SKILL.md` 中稳定、可复用的规则章节迁移而来。入口 `SKILL.md` 仅保留触发、流程骨架和引用关系。

# X Article Publisher

Publish Markdown content to X (Twitter) Articles editor, preserving formatting with rich text conversion.

## Prerequisites

- Playwright MCP for browser automation
- User logged into X with Premium Plus subscription
- Python 3.9+ with dependencies:
  - macOS: `pip install Pillow pyobjc-framework-Cocoa`
  - Windows: `pip install Pillow pywin32 clip-util`
- For Mermaid diagrams: `npm install -g @mermaid-js/mermaid-cli`

## Scripts

Located in `~/.claude/skills/x-article-publisher/scripts/`:

### parse_markdown.py
Parse Markdown and extract structured data:
```bash
python parse_markdown.py <markdown_file> [--output json|html] [--html-only]
```
Returns JSON with: title, cover_image, content_images, **dividers** (with block_index for positioning), html, total_blocks

### copy_to_clipboard.py
Copy image or HTML to system clipboard (cross-platform):
```bash
# Copy image (with optional compression)
python copy_to_clipboard.py image /path/to/image.jpg [--quality 80]

# Copy HTML for rich text paste
python copy_to_clipboard.py html --file /path/to/content.html
```

### table_to_image.py
Convert Markdown table to PNG image:
```bash
python table_to_image.py <input.md> <output.png> [--scale 2]
```
Use when X Articles doesn't support native table rendering or for consistent styling.

## Pre-Processing (Optional)

Before publishing, scan the Markdown for elements that need conversion:

### Tables → PNG
```bash
# Extract table to temp file, then convert
python ~/.claude/skills/x-article-publisher/scripts/table_to_image.py /tmp/table.md /tmp/table.png
# Replace table in markdown with: ![Table](/tmp/table.png)
```

### Mermaid Diagrams → PNG
```bash
# Extract mermaid block to .mmd file, then convert
mmdc -i /tmp/diagram.mmd -o /tmp/diagram.png -b white -s 2
# Replace mermaid block with: ![Diagram](/tmp/diagram.png)
```

### Dividers (---)
Dividers are automatically detected by `parse_markdown.py` and output in the `dividers` array. They must be inserted via X Articles' **Insert > Divider** menu (HTML `<hr>` tags are ignored by X).

## 高效执行原则 (Efficiency Guidelines)

**目标**: 最小化操作之间的等待时间，实现流畅的自动化体验。

### 1. 避免不必要的 browser_snapshot

大多数浏览器操作（click, type, press_key 等）都会在返回结果中包含页面状态。**不要**在每次操作后单独调用 `browser_snapshot`，直接使用操作返回的页面状态即可。

```
❌ 错误做法：
browser_click → browser_snapshot → 分析 → browser_click → browser_snapshot → ...

✅ 正确做法：
browser_click → 从返回结果中获取页面状态 → browser_click → ...
```

### 2. 避免不必要的 browser_wait_for

只在以下情况使用 `browser_wait_for`：
- 等待图片上传完成（`textGone="正在上传媒体"`）
- 等待页面初始加载（极少数情况）

**不要**使用 `browser_wait_for` 来等待按钮或输入框出现 - 它们在页面加载完成后立即可用。

### 3. 并行执行独立操作

当两个操作没有依赖关系时，可以在同一个消息中并行调用多个工具：

```
✅ 可以并行：
- 填写标题 (browser_type) + 复制HTML到剪贴板 (Bash)
- 解析Markdown生成JSON + 生成HTML文件

❌ 不能并行（有依赖）：
- 必须先点击create才能上传封面图
- 必须先粘贴内容才能插入图片
```

### 4. 连续执行浏览器操作

每个浏览器操作返回的页面状态包含所有需要的元素引用。直接使用这些引用进行下一步操作：

```
# 理想流程（每步直接执行，不额外等待）：
browser_navigate → 从返回状态找create按钮 → browser_click(create)
→ 从返回状态找上传按钮 → browser_click(上传) → browser_file_upload
→ 从返回状态找应用按钮 → browser_click(应用)
→ 从返回状态找标题框 → browser_type(标题)
→ 点击编辑器 → browser_press_key(Meta+v)
→ ...
```

### 5. 准备工作前置

在开始浏览器操作之前，先完成所有准备工作：
1. 解析 Markdown 获取 JSON 数据
2. 生成 HTML 文件到 /tmp/
3. 记录 title、cover_image、content_images 等信息

这样浏览器操作阶段可以连续执行，不需要中途停下来处理数据。

## Critical Rules

1. **NEVER publish** - Only save draft
2. **First image = cover** - Upload first image as cover image
3. **Rich text conversion** - Always convert Markdown to HTML before pasting
4. **Use clipboard API** - Paste via clipboard for proper formatting
5. **Block index positioning** - Use block_index for precise image/divider placement
6. **Reverse order insertion** - Insert images and dividers from highest to lowest block_index
7. **H1 title handling** - H1 is used as title only, not included in body
8. **Dividers via menu** - Markdown `---` must be inserted via Insert > Divider menu (HTML `<hr>` is ignored)

## Best Practices

### 为什么用 block_index 而非文字匹配？

1. **精确定位**: 不依赖文字内容，即使多处文字相似也能正确定位
2. **可靠性**: 索引是确定性的，不会因为文字相似而混淆
3. **调试方便**: `after_text` 仍保留用于人工核验

### 为什么用 Python 而非浏览器内 JavaScript？

1. **本地处理更可靠**: Python 直接操作系统剪贴板，不受浏览器沙盒限制
2. **图片压缩**: 上传前压缩图片 (--quality 85)，减少上传时间
3. **代码复用**: 脚本固定不变，无需每次重新编写转换逻辑
4. **调试方便**: 脚本可单独测试，问题易定位

### 等待策略

**重要发现**: Playwright MCP 的 `browser_wait_for` 实际行为是 **先等待 time 秒，再检查条件**，而非轮询！

```javascript
// 实际执行的代码：
await new Promise(f => setTimeout(f, time * 1000));  // 先固定等待
await page.getByText("xxx").waitFor({ state: 'hidden' });  // 再检查
```

**正确用法**:
- ✅ 只用 `textGone`，不设 `time`：让 Playwright 自己轮询等待
- ✅ 只用 `time`：固定等待指定秒数
- ❌ 同时用 `textGone` + `time`：会先等 time 秒再检查，浪费时间

```
# 推荐：只用 textGone，让它自动等待条件满足
browser_wait_for textGone="正在上传媒体"

# 或者：用 browser_snapshot 轮询检查状态
# 每次操作后检查返回的页面状态，无需额外等待
```

### 图片插入效率

每张图片的浏览器操作从5步减少到2步：
- 旧: 点击 → 添加媒体 → 媒体 → 添加照片 → file_upload
- 新: 点击段落 → Meta+v

### 封面图 vs 内容图

- **封面图**: 使用 browser_file_upload（因为有专门的上传按钮）
- **内容图**: 使用 Python 剪贴板 + 粘贴（更高效）

## 故障排除

### MCP 连接问题

如果 Playwright MCP 工具不可用（报错 `No such tool available` 或 `Not connected`）：

**方案1：重新连接 MCP（推荐）**
```
执行 /mcp 命令，选择 playwright，选择 Restart
```

**方案2：清理残留进程后重连**
```bash
# 杀掉所有残留的 playwright 进程
pkill -f "mcp-server-playwright"
pkill -f "@playwright/mcp"

# 然后执行 /mcp 重新连接
```

**配置文件位置**: `~/.claude/mcp_servers.json`

### 浏览器错误处理

如果遇到 `Error: Browser is already in use` 错误：

```bash
# 方案1：先关闭浏览器再重新打开
browser_close
browser_navigate: https://x.com/compose/articles

# 方案2：杀掉 Chrome 进程
pkill -f "Chrome.*--remote-debugging"
# 然后重新 navigate
```

### 图片位置偏移

如果图片插入位置不正确（特别是点击含链接的段落时）：

**原因**: 点击段落时可能误触链接，导致光标位置错误

**解决方案**: 点击后**必须按 End 键**移动光标到行尾

```
# 正确流程
1. browser_click 点击目标段落
2. browser_press_key: End        # 关键步骤！
3. browser_press_key: Meta+v     # 粘贴图片
4. browser_wait_for textGone="正在上传媒体"
```

### 图片路径找不到

如果 Markdown 中的相对路径图片找不到（如 `./assets/image.png` 实际在其他位置）：

**自动搜索**: `parse_markdown.py` 会自动在以下目录搜索同名文件：
- `~/Downloads`
- `~/Desktop`
- `~/Pictures`

**stderr 输出示例**:
```
[parse_markdown] Image not found at '/path/to/assets/img.png', using '/Users/xxx/Downloads/img.png' instead
```

**JSON 字段说明**:
- `original_path`: Markdown 中指定的路径（解析后的绝对路径）
- `path`: 实际使用的路径（如果自动搜索成功，会不同于 original_path）
- `exists`: `true` 表示找到文件，`false` 表示未找到（上传会失败）

**如果仍然找不到**:
1. 检查 JSON 输出中的 `missing_images` 字段
2. 手动将图片复制到 Markdown 文件同目录的 `assets/` 子目录
3. 或修改 Markdown 中的图片路径为绝对路径
