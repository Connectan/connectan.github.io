/* =================================================================
   サイトの中身はぜんぶこのファイル。ここだけ書き換えれば更新されます。
   GitHub 上でこのファイルを開いて ✏️ で編集 → Commit で反映（1分くらい）。
   ================================================================= */
window.SITE = {

  name: "晓玲 清風",
  reading: "Xiaoling Qingfeng",

  // ヒーローでくるくる切り替わる言葉（「◯◯沼の住人。」の◯◯）
  rotatingWords: ["技適なしスマホ", "中華スマホ", "折りたたみ", "香港版", "ガジェット"],

  // 布陣の更新日
  lineupDate: "2026/11/20",

  // ---- SNS ----------------------------------------------------------
  // url / id を入れるとボタンが有効になります。空なら「準備中」表示。
  links: {
    bilibili: "",              // 例: "https://space.bilibili.com/12345678"
    x:        "",              // 例: "https://x.com/your_id"
    wechat:   { id: "", qr: "" }, // id: WeChat ID / qr: QRコード画像のパス（例: "wechat-qr.png"）
    github:   "Connectan",     // GitHub のユーザー名だけ
  },

  // ---- 端末 ---------------------------------------------------------
  // 使ってきた順に並べる。
  // status : "main" メイン / "active" 現役 / "away" 手元にない / "retired" 卒業
  // giteki : true = 技適あり端末
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
      note: "技適あるからちょっとな。" },
    { maker: "Huawei", name: "Huawei Mate Xs2",    status: "active",  fold: true, note: "" },
    { maker: "Xiaomi", name: "Xiaomi 13 Ultra",    status: "away",    note: "山根博士に預けて深圳へ…" },
    { maker: "Huawei", name: "Huawei Mate 50 Pro", status: "active",  note: "" },
    { maker: "vivo",   name: "vivo X80 Pro",       status: "active",  note: "" },
    { maker: "Honor",  name: "Honor Magic V3",     status: "main",    fold: true, region: "香港版",
      note: "現メイン機。" },
  ],

  // メーカーの色
  brands: {
    vivo: "#415fff", iQOO: "#f5a623", Xiaomi: "#ff6900", realme: "#e6c200",
    Honor: "#00b3b3", Huawei: "#cf0a2c", Sony: "#8a8f98", ZTE: "#0a7cff",
  },

  // ---- プロジェクト -------------------------------------------------
  projects: [
    { name: "OWLDrop Android", status: "WIP", url: "",
      desc: "OWL + OpenDrop を Android（vivo X80 Pro）で動かして AirDrop 互換を目指すやつ。" },
    { name: "Let's note Hackintosh", status: "WIP", url: "",
      desc: "Panasonic Let's note CF-XZ6 に macOS を入れる計画。OpenCore EFI 作成済み。" },
  ],
};
