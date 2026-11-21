# connectan.github.io

[日本語](README.md) | **English** | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | [한국어](README.ko.md)

Personal website of Connectan (こねくたん) → https://connectan.github.io

## Files

| File | Contents | Edited often? |
|---|---|---|
| `data.js` | Top page content (name, social links, phones, projects) | ◎ |
| `_posts/` | Blog posts (1 post = 1 file) | ◎ |
| `index.html` / `home.js` | Top page structure | Sometimes |
| `blog/index.html` | Post list page | Rarely |
| `_layouts/post.html` | Post page design | Rarely |
| `style.css` / `common.js` | Design and animations (shared by all pages) | Rarely |
| `i18n.js` | Translation dictionary (Japanese, English, Simplified Chinese, Traditional Chinese, Korean) | Sometimes |
| `posts.json` | Post list data (generated automatically, don't edit) | × |
| `_config.yml` | Blog settings | × |

## How to write a blog post

1. Open the `_posts` folder and choose **Add file → Create new file**
2. Name the file `year-month-day-english-title.md`
   Example: `2026-11-25-magic-v3-review.md`
   (the English part becomes the URL → `/blog/2026/11/25/magic-v3-review/`)
3. Put this at the top, then write the body in Markdown below it

```markdown
---
title: Magic V3 を3ヶ月使った感想
tags: [Honor, 折りたたみ, レビュー]
pinned: true        # only if you want it featured; otherwise delete this line
cover: /images/magic-v3.jpg   # cover image (optional)
---

The body starts here.

## Heading

Normal text. **Bold**, [links](https://example.com), and so on.

![Image description](/images/photo.jpg)
```

4. **Commit changes** → within 1–2 minutes it appears in the blog section of the top page and in the post list

- Posts with `pinned: true` → shown large as “Featured” on the top page (up to 2)
- Other posts → the newest 4 are shown on the top page; all of them are at `/blog/`
- For images, create an `images` folder and upload them there
- Drafts in the `_drafts` folder are not published

### Making a post private

Just add one line at the top of the post (between the `---` lines). Delete it to publish again.

```markdown
published: false
```

Private posts don't appear anywhere: not on the post page, the list, the top page, notices, or RSS.
\* The repository itself is public, so the file's contents can still be seen on GitHub.

## Notices (the ticker under the name)

Shown automatically (up to 3, newest first):

- Publish a post → “「◯◯」をupしました” (Posted “◯◯”)
- Add a `date` to a project in `projects` → if done, “New project “◯◯” is done”; if in progress, “Started making “◯◯””

To show anything else, add it to `data/news.json`.

If there's nothing to show, the notice area disappears.

## Projects

Managed in `data/projects.json`.

- Fields: name, status, public/private, date, description, tags, version, image, repository, download URL and button text, and info page

## Social links

Just put a URL / ID in `links` in `data.js`. Even if left empty, the name is still shown, and tapping it copies the name.

## Multilingual support

The site can be shown in **Japanese, English, Simplified Chinese, Traditional Chinese, and Korean**.

- The language is chosen automatically in this order: the URL (`?lang=en`, etc.) → the language picked last time → the browser's language.
- Visitors can switch with the 🌐 button at the top right (or in the Control Center).
- All translations are in `i18n.js`.
  - Interface text → `T`
  - Phone notes and one-liners in `data.js`, and descriptions in `projects.json` → `DATA` (use the original Japanese text as the key and write the translation as the value)
- **Text without a translation is simply shown in Japanese**, so nothing breaks if you update `data.js` and forget to add translations.
- Blog post bodies stay in Japanese (visitors viewing in another language get a “Read with Google Translate” link).
