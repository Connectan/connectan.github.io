# connectan.github.io

[日本語](README.md) | [English](README.en.md) | **简体中文** | [繁體中文](README.zh-TW.md) | [한국어](README.ko.md)

こねくたん（Connectan）的个人网站 → https://connectan.github.io

## 文件结构

| 文件 | 内容 | 常改吗？ |
|---|---|---|
| `data.js` | 首页内容（名字、社交账号、手机、项目） | ◎ |
| `_posts/` | 博客文章（1 篇 = 1 个文件） | ◎ |
| `index.html` / `home.js` | 首页骨架 | 偶尔 |
| `blog/index.html` | 文章列表页 | 基本不改 |
| `_layouts/post.html` | 文章页样式 | 基本不改 |
| `style.css` / `common.js` | 设计和动画（所有页面共用） | 基本不改 |
| `i18n.js` | 多语言翻译词典（日语・English・简体中文・繁體中文・한국어） | 偶尔 |
| `posts.json` | 文章列表数据（自动生成，不要改） | × |
| `_config.yml` | 博客设置 | × |

## 写博客的方法

1. 打开 `_posts` 文件夹，选择 **Add file → Create new file**
2. 文件名写成 `年-月-日-英文标题.md`
   例：`2026-11-25-magic-v3-review.md`
   （英文部分会成为 URL → `/blog/2026/11/25/magic-v3-review/`）
3. 在开头写上下面这段，然后在下面用 Markdown 写正文

```markdown
---
title: Magic V3 を3ヶ月使った感想
tags: [Honor, 折りたたみ, レビュー]
pinned: true        # 想放进推荐时才写。不需要就整行删掉
cover: /images/magic-v3.jpg   # 封面图（可以没有）
---

从这里开始是正文。

## 标题

普通文字。**粗体**、[链接](https://example.com) 之类。

![图片说明](/images/photo.jpg)
```

4. **Commit changes** → 1～2 分钟后会自动出现在首页博客栏和文章列表中

- 加了 `pinned: true` 的文章 → 在首页以“推荐”大图显示（最多 2 篇）
- 其他文章 → 首页按新旧显示最多 4 篇，全部文章在 `/blog/`
- 图片请建一个 `images` 文件夹上传到那里
- 草稿放在 `_drafts` 文件夹里就不会发布

### 把文章设为不公开

在文章开头（`---` 之间）加一行就行。删掉这一行就会重新公开。

```markdown
published: false
```

设为不公开的文章，在文章页、列表、首页、通知、RSS 中都不会出现。
※ 仓库本身是公开的，所以文件内容在 GitHub 上仍然看得到。

## 通知（名字下方的滚动通知）

会自动显示的内容（按新旧最多滚动 3 条）：

- 发布文章 → “「◯◯」をupしました”（发布了「◯◯」）
- 给 `projects` 填上 `date` → 已完成时显示“新项目「◯◯」完成了”，制作中时显示“开始制作「◯◯」”

想显示其他内容时，添加到 `data/news.json`。

什么都没有时，通知栏会整个消失。

## 项目

在 `data/projects.json` 中管理。

- 项目：名称、状态、公开/不公开、日期、说明、标签、版本、图片、仓库、下载 URL 和按钮文字、介绍页

## 社交账号

只要在 `data.js` 的 `links` 里填上 URL / ID 就行。留空也会显示名字，点击可以复制名字。

## 多语言支持

网站可以用 **日语・English・简体中文・繁體中文・한국어** 显示。

- 语言按“URL 中的 `?lang=en` 等”→“上次选择的语言”→“浏览器语言”的顺序自动决定。
- 可以用右上角的 🌐 按钮（或控制中心）切换。
- 翻译都集中在 `i18n.js` 里。
  - 界面文字 → `T`
  - `data.js` 中的手机备注、一句话点评，以及 `projects.json` 中的说明 → `DATA`（以日语原文作为键，写上译文）
- **没有写翻译的文字会直接显示日语**，所以更新了 `data.js` 却忘了加翻译，也不会出错。
- 博客正文保持日语（用日语以外的语言浏览时，会显示“用 Google 翻译阅读”的链接）。
