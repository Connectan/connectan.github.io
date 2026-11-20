/* =================================================================
   サイトの中身（トップページ）はこのファイル。ここだけ書き換えれば更新されます。
   GitHub 上でこのファイルを開いて ✏️ で編集 → Commit changes で反映（1分くらい）。
   ※ ブログ記事は _posts フォルダ。書き方は README.md を見てね。
   ================================================================= */
window.SITE = {

  name: "こねくたん",
  reading: "Connectan",
  aka: "晓玲 清風",          // SNS での名前

  // ヒーローでくるくる切り替わる言葉（「◯◯沼の住人。」の◯◯）
  rotatingWords: ["技適なしスマホ", "中華スマホ", "折りたたみ", "香港版", "ガジェット"],

  // 布陣の更新日
  lineupDate: "2026/11/20",

  // ---- SNS ----------------------------------------------------------
  // name: 表示する名前 / url: プロフィールのURL（空なら、タップで名前をコピーできる表示になる）
  links: {
    x:        { name: "晓玲 清風", url: "" },                 // 例: "https://x.com/xxxx"
    bilibili: { name: "お前ヤりますねぇスギ", url: "" },       // 例: "https://space.bilibili.com/12345678"
    discord:  { name: "晓玲 清風", id: "", url: "" },         // id: ユーザー名 / url: サーバー招待リンクなど
    wechat:   { name: "晓玲 清風", id: "", qr: "" },          // id: WeChat ID / qr: QR画像のファイル名（例: "wechat-qr.png"）
    github:   "Connectan",                                    // GitHub のユーザー名だけ
  },

  // ---- 端末 ---------------------------------------------------------
  // 使ってきた順に並べる。
  // status : "main" メイン / "active" 現役 / "away" 手元にない / "retired" 卒業
  // giteki : true = 技適あり端末（カウンターには数えない）
  // fold   : true = 折りたたみ
  // chapter: タイムラインのここに見出しを入れる
  devices: [
    { maker: "Xiaomi", name: "Xiaomi 12T Pro",     status: "retired", giteki: true,
      chapter: "技適あり時代",
      note: "最後にまともに使った技適あり。Libero Flip と2台持ち。" },
    { maker: "ZTE",    name: "Libero Flip",        status: "retired", giteki: true, fold: true,
      note: "12T Pro と2台持ちしてた縦折り。" },

    { maker: "vivo",   name: "vivo X70 Pro+",      status: "active",
      chapter: "ここから技適なし沼",
      note: "初めての技適なし。すべての元凶。" },
    { maker: "iQOO",   name: "iQOO Z9 Turbo+",     status: "retired", note: "" },
    { maker: "Honor",  name: "Honor X50 Pro",      status: "retired", note: "" },
    { maker: "Xiaomi", name: "Xiaomi MIX Fold 2",  status: "retired", fold: true, note: "" },
    { maker: "realme", name: "realme GT5 Pro",     status: "retired", note: "" },
    { maker: "Sony",   name: "Xperia 1 V",         status: "retired", giteki: true,
      note: "技適あるからちょっとな。…でも多分また買う。" },
    { maker: "Huawei", name: "Huawei Mate Xs2",    status: "active",  fold: true, note: "" },
    { maker: "Honor",  name: "Honor Magic V3",     status: "main",    fold: true, region: "香港版",
      note: "現メイン機。" },
    { maker: "Xiaomi", name: "Xiaomi 13 Ultra",    status: "away",    note: "山根博士に預けて深圳へ…" },
    { maker: "Huawei", name: "Huawei Mate 50 Pro", status: "active",  note: "" },
    { maker: "vivo",   name: "vivo X80 Pro",       status: "active",  note: "" },
  ],

  // メーカーの色
  brands: {
    vivo: "#415fff", iQOO: "#f5a623", Xiaomi: "#ff6900", realme: "#e6c200",
    Honor: "#00b3b3", Huawei: "#cf0a2c", Sony: "#8a8f98", ZTE: "#0a7cff",
  },

  // ---- プロジェクト -------------------------------------------------
  // status: "done" 完成 / "wip" 製作中
  // repo  : GitHub リポジトリのURL      page: プロジェクトページのURL（ブログ記事でもOK）
  // 入れたものだけリンクが出ます。
  projects: [
    { name: "Xperia Watermark For Zeiss", status: "done", repo: "", page: "",
      desc: "Xperia で撮った写真に ZEISS 風のウォーターマークを入れるやつ。" },
    { name: "Xperia Watermark Standard", status: "done", repo: "", page: "",
      desc: "Xperia 向けウォーターマークのスタンダード版。" },
    { name: "画面のみオフ", status: "done", repo: "", page: "",
      desc: "画面だけを消して、裏の動作はそのまま続けられるアプリ。" },
    { name: "Spotify 歌詞同期", status: "wip", repo: "", page: "",
      desc: "Spotify の再生に合わせて歌詞を同期表示する。製作中。" },
  ],
};
