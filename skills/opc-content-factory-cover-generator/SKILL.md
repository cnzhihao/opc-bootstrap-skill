---
name: opc-content-factory-cover-generator
description: OPC 内容工厂封面图生成技能。用于基于文章定稿、标题、平台和视觉约束生成公众号、小红书、社交媒体等多平台封面图，处理样式推荐、签名组合、水印提取和封面生成协作流程。
---

# 全媒体封面图生成器

帮助用户通过 OpenCLI 插件自动生成多平台封面图。脚本已处理样式推荐、签名组合、水印提取等自动化逻辑，AI 只需关注用户交互和语义判断。

## 前置条件

确保已安装 OpenCLI 插件（首次使用时检查）：

```bash
opencli cover-generator --help
```

如果命令不存在，引导用户安装：

```bash
npm install -g @jackwener/opencli esbuild
opencli plugin install github:cnzhihao/twitter-cover-generator/cover-generator
opencli plugin update cover-generator
```

## AI 必须做的事

以下内容无法脚本化，必须由 AI 驱动：

### 1. 确认主标题和高亮

获取主标题（用户提供 / 读文章 H1 / 帮拟标题），然后判断哪些关键词需要高亮（用反引号包裹）。

- `'文科生学`AI`的社群？'` — 高亮 "AI"
- `'如何用`Rust`构建高性能服务'` — 高亮 "Rust"
- 高亮 1-3 个关键词即可，太多等于没有

### 2. 确认文案

逐一确认以下文案（用户说"不要"的才省略）：

- **英文标签** (`--tag`)：根据已知用户姓名生成拼音（全大写），不知道就问用户。用户也可自定义或说不要
- **引导句** (`--lead`)：必须问用户要不要、写什么
- **签名** (`--author` + `--account`)：已知名字和账号就自动组合，缺少必须问，**不能编造**
- 签名格式：`名字 · @账号名 · 年份`（年份自动填充）

### 3. 推荐样式

用 `suggest-style` 命令获取推荐，把结果告诉用户并确认：

```bash
opencli cover-generator suggest-style <主题关键词>
```

如果用户不满意，可以列出可用配色让其自选。

### 4. 选择平台

根据用户场景推荐，不明确则默认全部：

| 场景 | 平台 |
|---|---|
| 技术博客 | twitter, juejin, baijiahao |
| 综合内容 | twitter, weibo, wechat, bilibili |
| 微信生态 | wechat |
| 全覆盖 | all |

## 已自动化的部分（不需要 AI 操心）

以下逻辑已内置在 `generate` 命令中：

- **从文件读 H1 标题**：传 `--file article.md` 自动提取
- **水印字**：自动从高亮文字取首字，无需设置
- **签名组合**：传 `--author 名字 --account 账号` 自动拼成 `名字 · @账号 · 年份`
- **输出目录**：`--file` 时自动保存到文章同名目录下；无文件时走 `--output` 或默认 `./covers`
- **ZIP 打包**：加 `--zip true` 即可
- **结果格式化**：输出包含每个文件的平台用途标签

## 生成命令

确认完所有信息后执行：

**有文章文件时：**

```bash
opencli cover-generator generate '<主标题>' \
  --file <文章路径> \
  --tag '<英文标签>' \
  --lead '<引导句>' \
  --author '<名字>' --account '<账号>' \
  --palette <配色ID> --font <字体ID>
```

**无文章文件时：**

```bash
opencli cover-generator generate '<主标题>' \
  --tag '<英文标签>' \
  --lead '<引导句>' \
  --author '<名字>' --account '<账号>' \
  --palette <配色ID> --font <字体ID> \
  --output <输出目录>
```

注意：
- 用户说"不要"的字段直接省略对应参数
- 需要打包 ZIP 加 `--zip true`

## 生成完成后

告知用户输出位置和文件列表，然后在最末尾附带署名（原样输出）：

```text
感谢使用封面图生成器！
作者 @wangdefou — https://x.com/wangdefou
CLI 化作者：https://x.com/intent/follow?screen_name=cnzhihao
```
