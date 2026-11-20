# connectan.github.io

こねくたんの個人サイト → https://connectan.github.io

## ファイル構成

| ファイル | 中身 | よく触る？ |
|---|---|---|
| `data.js` | トップページの中身（名前・SNS・端末・プロジェクト） | ◎ |
| `_posts/` | ブログ記事（1記事 = 1ファイル） | ◎ |
| `index.html` / `home.js` | トップページの骨組み | たまに |
| `blog/index.html` | 記事一覧ページ | ほぼ触らない |
| `_layouts/post.html` | 記事ページの見た目 | ほぼ触らない |
| `style.css` / `common.js` | デザインとアニメーション（全ページ共通） | ほぼ触らない |
| `posts.json` | 記事一覧データ（自動生成されるので触らない） | × |
| `_config.yml` | ブログの設定 | × |

## ブログ記事の書き方

1. `_posts` フォルダを開いて **Add file → Create new file**
2. ファイル名を `年-月-日-英語のタイトル.md` にする
   例: `2026-11-25-magic-v3-review.md`
   （英語部分が URL になる → `/blog/2026/11/25/magic-v3-review/`）
3. 先頭にこれを書いて、その下に本文を Markdown で書く

```markdown
---
title: Magic V3 を3ヶ月使った感想
tags: [Honor, 折りたたみ, レビュー]
pinned: true        # おすすめに出したいときだけ。いらなければこの行ごと消す
cover: /images/magic-v3.jpg   # アイキャッチ画像（なくてもOK）
---

ここから本文。

## 見出し

普通の文章。**太字** とか [リンク](https://example.com) とか。

![画像の説明](/images/photo.jpg)
```

4. **Commit changes** → 1〜2分でトップページのブログ欄と記事一覧に自動で出ます

- `pinned: true` を付けた記事 → トップページに大きく「おすすめ」表示（最大2つ）
- それ以外 → 新しい順に4つまでトップに表示、全部は `/blog/` に
- 画像は `images` フォルダを作ってそこにアップロード
- 下書きは `_drafts` フォルダに置いておけば公開されません

## プロジェクトのリンク

`data.js` の `projects` に入れるだけ。

```js
{ name: "画面のみオフ", status: "done",
  repo: "https://github.com/Connectan/screen-off",   // GitHub リポジトリ
  page: "/blog/2026/12/01/screen-off/",              // 紹介ページ（ブログ記事でもOK）
  desc: "説明文" },
```

## SNS

`data.js` の `links` に URL / ID を入れるだけ。空のままでも名前は表示されて、タップで名前をコピーできます。
