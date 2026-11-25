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
  lineupDate: "2026/11/25",

  // 触ってきたメーカー（「触ってきたメーカー」の数はこのリストの数。技適あり・なし両方）
  // Huawei は技適ありの頃も技適なしも触ってるけど、メーカーとしては1つ
  makers: ["AQUOS", "Xperia", "Huawei", "OPPO", "ASUS", "UMIDIGI", "POCO", "Xiaomi",
           "ZTE", "vivo", "Honor", "realme", "iQOO", "Nothing"],

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

  // ---- 端末 ---------------------------------------------------------
  // 使ってきた順に並べる。
  // status : "main" メイン / "active" 現役 / "away" 手元にない / "retired" 卒業 / "recalled" メーカー回収
  // giteki : true = 技適あり端末（カウンターには数えない）
  // fold   : true = 折りたたみ
  // chapter: タイムラインのここに見出しを入れる
  // spec   : 名前を押すと出るスペック表（soc / year 販売年 / camera / display / point ひとこと）
  devices: [
    { maker: "Xiaomi", name: "Xiaomi 12T Pro",     status: "retired", giteki: true,
      chapter: "技適あり時代",
      note: "最後にまともに使った技適あり。Libero Flip と2台持ち。",
      spec: { soc: "Snapdragon 8+ Gen 1", year: "2022",
              camera: "200MP（HP1）＋ 8MP 超広角 ＋ 2MP マクロ",
              display: "6.67インチ 有機EL 120Hz",
              point: "2億画素カメラと120W急速充電。" } },
    { maker: "ZTE",    name: "Libero Flip",        status: "retired", giteki: true, fold: true,
      note: "12T Pro と2台持ちしてた縦折り。",
      spec: { soc: "Snapdragon 7 Gen 1", year: "2023",
              camera: "50MP ＋ 2MP 深度",
              display: "メイン 6.9インチ 有機EL / サブ 1.43インチ",
              point: "とにかく安く買える縦折り。" } },

    { maker: "vivo",   name: "vivo X70 Pro+",      status: "active",
      chapter: "ここから技適なし沼",
      note: "初めての技適なし。すべての元凶。",
      spec: { soc: "Snapdragon 888+", year: "2021",
              camera: "50MP（GN1）＋ 48MP 超広角（ジンバル）＋ 12MP 2x ＋ 8MP 5x ペリスコープ（ZEISS）",
              display: "6.78インチ 2K 有機EL LTPO 120Hz",
              point: "ZEISS T* とジンバル超広角。全部入りの沼の入口。" } },
    { maker: "iQOO",   name: "iQOO Z9 Turbo+",     status: "retired", note: "",
      spec: { soc: "MediaTek Dimensity 9300+", year: "2024",
              camera: "50MP（LYT-600）＋ 8MP 超広角",
              display: "6.78インチ 1.5K 有機EL 144Hz",
              point: "フラッグシップSoC＋6400mAhを格安で。コスパの暴力。" } },
    { maker: "Honor",  name: "Honor X50 Pro",      status: "retired", note: "",
      spec: { soc: "Snapdragon 8+ Gen 1", year: "2023",
              camera: "108MP（HM6）＋ 2MP 深度",
              display: "6.78インチ 1.5K 曲面有機EL 120Hz",
              point: "5800mAhで厚さ約7.98mm。物理的バグ。" } },
    { maker: "Xiaomi", name: "Xiaomi MIX Fold 2",  status: "recalled", fold: true, note: "",
      spec: { soc: "Snapdragon 8+ Gen 1", year: "2022",
              camera: "50MP（IMX766）＋ 13MP 超広角 ＋ 8MP 2x 望遠（Leica）",
              display: "メイン 8.02インチ / カバー 6.56インチ",
              point: "開いて5.4mm。当時最薄クラスの横折り。" } },
    { maker: "realme", name: "realme GT5 Pro",     status: "retired", note: "",
      spec: { soc: "Snapdragon 8 Gen 3", year: "2023",
              camera: "50MP（LYT-808）＋ 50MP 3x ペリスコープ（IMX890）＋ 8MP 超広角",
              display: "6.78インチ 1.5K 有機EL 144Hz",
              point: "8 Gen 3 にペリスコープ望遠まで載せた価格破壊。" } },
    { maker: "Sony",   name: "Xperia 1 V",         status: "retired", giteki: true,
      note: "",
      spec: { soc: "Snapdragon 8 Gen 2", year: "2023",
              camera: "48MP（Exmor T for mobile）＋ 12MP 超広角 ＋ 12MP 光学ズーム望遠（85–125mm）",
              display: "6.5インチ 4K 有機EL 120Hz（21:9）",
              point: "Exmor T と光学ズーム。イヤホンジャックもSDも残ってる。" } },
    { maker: "Huawei", name: "Huawei Mate Xs2",    status: "retired", fold: true, note: "",
      spec: { soc: "Snapdragon 888 4G", year: "2022",
              camera: "50MP ＋ 13MP 超広角 ＋ 8MP 3x 望遠",
              display: "7.8インチ 外折り有機EL（閉じて6.5インチ）",
              point: "外折りで折り目がほぼ見えない大画面。" } },
    { maker: "Honor",  name: "Honor Magic V3",     status: "main",    fold: true, region: "香港版",
      note: "現メイン機。",
      spec: { soc: "Snapdragon 8 Gen 3", year: "2024",
              camera: "50MP ＋ 40MP 超広角 ＋ 50MP 3.5x ペリスコープ",
              display: "メイン 7.92インチ / カバー 6.43インチ",
              point: "閉じて9.2mm・226g。普通のスマホ並みに薄い横折り。" } },
    { maker: "Xiaomi", name: "Xiaomi 13 Ultra",    status: "away",    note: "山根博士に預けて深圳へ…",
      spec: { soc: "Snapdragon 8 Gen 2", year: "2023",
              camera: "1インチ 50MP（IMX989・可変絞り）＋ 50MP 超広角 ＋ 50MP 3.2x ＋ 50MP 5x（Leica）",
              display: "6.73インチ 2K 有機EL 120Hz",
              point: "1インチ＋50MP×4のLeica。カメラ機の到達点。" } },
    { maker: "Huawei", name: "Huawei Mate 50 Pro", status: "active",  note: "",
      spec: { soc: "Snapdragon 8+ Gen 1 4G", year: "2022",
              camera: "50MP 可変絞り（XMAGE）＋ 13MP 超広角 ＋ 64MP 3.5x ペリスコープ",
              display: "6.74インチ 曲面有機EL 120Hz",
              point: "10段階の可変絞り。XMAGE の空気感。" } },
    { maker: "vivo",   name: "vivo X80 Pro",       status: "active",  note: "",
      spec: { soc: "Snapdragon 8 Gen 1（Dimensity 9000版もあり）", year: "2022",
              camera: "50MP（GNV）＋ 48MP 超広角 ＋ 12MP 2x ジンバル ＋ 8MP 5x ペリスコープ（ZEISS）",
              display: "6.78インチ 2K 有機EL LTPO 120Hz",
              point: "V1+ チップと ZEISS の4眼。夜景が強い。" } },
    { maker: "Nothing", name: "Nothing Phone (3)", status: "active",  giteki: true, note: "",
      spec: { soc: "Snapdragon 8s Gen 4", year: "2025",
              camera: "50MP ＋ 50MP 3x ペリスコープ ＋ 50MP 超広角",
              display: "6.67インチ 1.5K 有機EL 120Hz",
              point: "背面のドット表示「Glyph Matrix」。光る背面で遊べる。" } },
  ],

  // メーカーの色
  brands: {
    vivo: "#415fff", iQOO: "#f5a623", Xiaomi: "#ff6900", realme: "#e6c200",
    Honor: "#00b3b3", Huawei: "#cf0a2c", Sony: "#8a8f98", ZTE: "#0a7cff",
    Nothing: "#d71921",
  },

  // ---- プロジェクト・お知らせ ---------------------------------------
  // data/projects.json と data/news.json に移動しました。
};
