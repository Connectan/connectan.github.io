/* =================================================================
   サイトの基本情報（名前・SNS）はこのファイル。
   トップページの中身（端末・メーカー・並び順・ウィジェットなど）は data/home.json。
   → 管理画面（/admin/）の「🏠 トップ」「📱 端末」タブから編集できます。
   ※ ブログ記事は _posts フォルダ。書き方は README.md を見てね。
   ================================================================= */
window.SITE = {

  name: "こねくたん",
  reading: "Connectan",
  aka: "晓玲 清風",          // SNS での名前

  // ---- SNS ----------------------------------------------------------
  // name: 表示する名前 / url: プロフィールのURL / id: コピー用ID / qr: QRコード画像
  // url があって id が無いものはタップで直接ページへ飛ぶ（QR は横の QR ボタンで出る）
  links: {
    x:        { name: "晓玲 清風", url: "https://x.com/tooru_is_god" },
    bilibili: { name: "晓玲清風", url: "https://space.bilibili.com/3707066189351164", qr: "/images/qr/bilibili.jpg" },
    discord:  { name: "晓玲 清風", id: "damageinc.0807", url: "" },   // id: ユーザー名 / url: サーバー招待リンクなど
    wechat:   { name: "晓玲 清風", id: "toru_is_god", qr: "/images/qr/wechat.jpg" },
    github:   "Connectan",                                    // GitHub のユーザー名だけ
  },

  // ---- トップページの中身 ----------------------------------------------
  // 端末・メーカー・布陣の日付・ブランド色・ヒーローの言葉・並び順・ウィジェットは
  // data/home.json に移しました（管理画面から編集）。
  // home.json が読めなかったときだけ、下の空の値が使われます。
  rotatingWords: ["ガジェット"],
  devices: [],
  brands: {},

  // ---- プロジェクト・お知らせ ---------------------------------------
  // data/projects.json と data/news.json に移動しました。
};
