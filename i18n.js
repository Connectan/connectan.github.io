/* =================================================================
   多言語対応（日本語 / English / 简体中文 / 繁體中文 / 한국어）
   - 元の文章は日本語。ほかの言語は下の辞書で置き換えます。
   - 辞書に無い文章は、日本語のままそのまま表示されます（壊れません）。
   - 言語は「URL の ?lang=en」→「前回選んだ言語」→「ブラウザの言語」の順で決まります。
   - data.js の端末メモなどを足したら、訳は下の DATA に「"日本語": "訳"」で足せばOK。
   ================================================================= */
(() => {
const LANGS = [["ja", "日本語"], ["en", "English"], ["zh-CN", "简体中文"], ["zh-TW", "繁體中文"], ["ko", "한국어"]];
const SHORT = { ja: "JA", en: "EN", "zh-CN": "简", "zh-TW": "繁", ko: "한" };
const CODES = LANGS.map(l => l[0]);

function pick(v) {
  if (!v) return "";
  v = String(v).toLowerCase();
  if (v.startsWith("zh")) return /tw|hk|mo|hant/.test(v) ? "zh-TW" : "zh-CN";
  const base = v.split("-")[0];
  return CODES.includes(base) ? base : "";
}
let lang = "";
try {
  const q = new URLSearchParams(location.search).get("lang");
  if (pick(q)) { lang = pick(q); localStorage.setItem("lang", lang); }
} catch (e) {}
if (!lang) { try { lang = pick(localStorage.getItem("lang")); } catch (e) {} }
if (!lang) { for (const l of (navigator.languages || [navigator.language])) { lang = pick(l); if (lang) break; } }
if (!lang) lang = "en";

/* ---------- 画面の文言 ---------- */
const T = {
  ja: {
    "nav.lineup": "布陣", "nav.history": "遍歴",
    "cc.open": "表示設定を開く", "cc.aria": "表示設定", "cc.title": "コントロールセンター", "cc.close": "閉じる",
    "cc.lang": "言語 / Language", "cc.glass": "ガラス", "cc.frosted": "すりガラス", "cc.clear": "クリア", "cc.liquid": "リキッド", "cc.solid": "ソリッド",
    "cc.blur": "ぼかしの強さ", "cc.wall": "壁紙", "cc.aurora": "オーロラ", "cc.sunset": "サンセット", "cc.ocean": "オーシャン", "cc.sakura": "サクラ", "cc.mono": "モノクロ",
    "cc.theme": "テーマ", "cc.auto": "自動", "cc.light": "ライト", "cc.dark": "ダーク", "cc.anim": "アニメーション",
    "m.open": "開く", "m.copy": "コピー", "m.close": "閉じる", "m.copied": "コピーしました", "m.copyFail": "コピーできませんでした", "m.qrAlt": "{t} QRコード",
    "post.pick": "おすすめ", "post.read": "読む →",
    "notice.wip": "「{n}」の製作を始めました", "notice.done": "新しいプロジェクト「{n}」が完成しました", "notice.post": "「{n}」をupしました",
    "sns.qr": "{t} の QR コード", "sns.search": "この名前で検索してね",
    "stats.all": "歴代の技適なし端末", "stats.now": "現在の布陣", "stats.fold": "歴代の折りたたみ", "stats.makers": "触ってきたメーカー",
    "spec.see": "スペックを見る", "spec.giteki": "技適あり", "spec.year": "発売", "spec.yearV": "{y}年", "spec.camera": "カメラ", "spec.display": "ディスプレイ", "spec.point": "ひとこと",
    "lineup.asOf": "{d} 時点", "badge.away": "出張中",
    "st.main": "メイン", "st.active": "現役", "st.away": "出張中", "st.retired": "卒業",
    "brand.count": "{b} {n}台",
    "blog.empty": "まだ記事はありません。そのうち書きます。", "blog.all": "すべて",
    "pj.download": "ダウンロード", "pj.page": "詳細ページ →", "pj.wip": "製作中", "pj.done": "完成", "pj.soon": "ページ準備中", "pj.gDone": "作ったもの", "pj.gWip": "製作中",
    "post.back": "← 記事一覧", "post.prev": "← 前の記事", "post.next": "次の記事 →", "post.toc": "目次",
  },
  en: {
    "nav.lineup": "Lineup", "nav.history": "History",
    "cc.open": "Open display settings", "cc.aria": "Display settings", "cc.title": "Control Center", "cc.close": "Close",
    "cc.lang": "Language", "cc.glass": "Glass", "cc.frosted": "Frosted", "cc.clear": "Clear", "cc.liquid": "Liquid", "cc.solid": "Solid",
    "cc.blur": "Blur strength", "cc.wall": "Wallpaper", "cc.aurora": "Aurora", "cc.sunset": "Sunset", "cc.ocean": "Ocean", "cc.sakura": "Sakura", "cc.mono": "Monochrome",
    "cc.theme": "Theme", "cc.auto": "Auto", "cc.light": "Light", "cc.dark": "Dark", "cc.anim": "Animation",
    "m.open": "Open", "m.copy": "Copy", "m.close": "Close", "m.copied": "Copied", "m.copyFail": "Couldn't copy", "m.qrAlt": "{t} QR code",
    "post.pick": "Featured", "post.read": "Read →",
    "notice.wip": "Started making “{n}”", "notice.done": "New project “{n}” is done", "notice.post": "New post: “{n}”",
    "sns.qr": "{t} QR code", "sns.search": "Search for this name",
    "stats.all": "Non-Giteki phones (all time)", "stats.now": "Current lineup", "stats.fold": "Foldables (all time)", "stats.makers": "Makers tried",
    "spec.see": "See specs", "spec.giteki": "Giteki certified", "spec.year": "Released", "spec.yearV": "{y}", "spec.camera": "Camera", "spec.display": "Display", "spec.point": "In a word",
    "lineup.asOf": "as of {d}", "badge.away": "Away",
    "st.main": "Main", "st.active": "Active", "st.away": "Away", "st.retired": "Retired",
    "brand.count": "{b}: {n}",
    "blog.empty": "No posts yet. I'll write some eventually.", "blog.all": "All",
    "pj.download": "Download", "pj.page": "Details →", "pj.wip": "In progress", "pj.done": "Done", "pj.soon": "Page coming soon", "pj.gDone": "Things I've made", "pj.gWip": "In progress",
    "post.back": "← All posts", "post.prev": "← Previous", "post.next": "Next →", "post.toc": "Contents",
    "post.jaNote": "This post is written in Japanese.", "post.translate": "Read with Google Translate",
    // index.html
    "meta.desc": "Profile page of Connectan (晓玲 清風), who lives deep in the rabbit hole of Chinese phones without Japanese certification.",
    "hero.tagPre": "Deep in the ", "hero.tagPost": " rabbit hole.",
    "hero.sub": "Tinkering with Chinese phones and gadgets, and sometimes writing code and blog posts.",
    "about.h": "Nice to meet you",
    "about.p1": "Hi, I'm <b>Connectan (こねくたん)</b>. On social media I go by <b>晓玲 清風</b>.",
    "about.p2": "I've always loved smartphones. The last Giteki-certified (Japan-approved) phones I really used were a two-phone setup: the <b>Xiaomi 12T Pro</b> and the <b>Libero Flip</b>. Then along came the <b>vivo X70 Pro+</b>. It was my first phone without Giteki certification, and that was the end of me. It dragged me straight down the Chinese-phone rabbit hole.",
    "about.p3": "My lineup changes <b>really, really regularly</b>. The “Current lineup” on this page has probably changed again before you notice.",
    "about.p4": "Apps I make go on this page and on GitHub. Phone talk goes on the blog.",
    "stats.note": "* Counts only phones without Giteki (Japan's radio certification). Certified phones like Xperia are excluded.",
    "lineup.h": "Current lineup", "lineup.lead": "The phones on hand right now (some not quite on hand).",
    "history.h": "Phone history", "history.lead": "From certified phones to the very bottom of the non-Giteki rabbit hole.",
    "history.firstTitle": "Where it all began: vivo X70 Pro+",
    "history.firstSub": "My first phone without Giteki. Still in use. It's the reason for everything since.",
    "brand.title": "By maker (non-Giteki)",
    "blog.h": "Blog", "blog.lead": "About phones, and about things I make.", "blog.more": "All posts →",
    "projects.lead": "Things I've made and things I'm making.",
    "follow.lead": "You can usually find me around here.",
  },
  "zh-CN": {
    "nav.lineup": "阵容", "nav.history": "历程",
    "cc.open": "打开显示设置", "cc.aria": "显示设置", "cc.title": "控制中心", "cc.close": "关闭",
    "cc.lang": "语言 / Language", "cc.glass": "玻璃", "cc.frosted": "磨砂", "cc.clear": "透明", "cc.liquid": "液态", "cc.solid": "实色",
    "cc.blur": "模糊强度", "cc.wall": "壁纸", "cc.aurora": "极光", "cc.sunset": "日落", "cc.ocean": "海洋", "cc.sakura": "樱花", "cc.mono": "黑白",
    "cc.theme": "主题", "cc.auto": "自动", "cc.light": "浅色", "cc.dark": "深色", "cc.anim": "动画",
    "m.open": "打开", "m.copy": "复制", "m.close": "关闭", "m.copied": "已复制", "m.copyFail": "复制失败", "m.qrAlt": "{t} 二维码",
    "post.pick": "推荐", "post.read": "阅读 →",
    "notice.wip": "开始制作「{n}」", "notice.done": "新项目「{n}」完成了", "notice.post": "发布了「{n}」",
    "sns.qr": "{t} 的二维码", "sns.search": "搜索这个名字就能找到",
    "stats.all": "历代无技适手机", "stats.now": "当前阵容", "stats.fold": "历代折叠屏", "stats.makers": "玩过的品牌",
    "spec.see": "查看参数", "spec.giteki": "有技适", "spec.year": "发布", "spec.yearV": "{y}年", "spec.camera": "相机", "spec.display": "屏幕", "spec.point": "一句话",
    "lineup.asOf": "截至 {d}", "badge.away": "出差中",
    "st.main": "主力", "st.active": "在役", "st.away": "出差中", "st.retired": "退役",
    "brand.count": "{b} {n}台",
    "blog.empty": "还没有文章，迟早会写的。", "blog.all": "全部",
    "pj.download": "下载", "pj.page": "详情页 →", "pj.wip": "制作中", "pj.done": "已完成", "pj.soon": "页面准备中", "pj.gDone": "做好的东西", "pj.gWip": "制作中",
    "post.back": "← 文章列表", "post.prev": "← 上一篇", "post.next": "下一篇 →", "post.toc": "目录",
    "post.jaNote": "本文以日语撰写。", "post.translate": "用 Google 翻译阅读",
    "meta.desc": "こねくたん（Connectan／晓玲 清風）的个人主页。深陷无技适国产手机坑的人。",
    "hero.tagPre": "深陷", "hero.tagPost": "坑。",
    "hero.sub": "折腾国产手机和数码产品，偶尔写写代码和博客。",
    "about.h": "初次见面",
    "about.p1": "你好，我是 <b>こねくたん</b>（Connectan）。在社交平台上用的名字是 <b>晓玲 清風</b>。",
    "about.p2": "我本来就喜欢手机，最后认真用过的有技适认证（日本无线电认证）的手机，是 <b>Xiaomi 12T Pro</b> 和 <b>Libero Flip</b> 双持。后来出现了 <b>vivo X70 Pro+</b>——我的第一台无技适手机，从此彻底完蛋，一口气被拖进了国产手机的大坑。",
    "about.p3": "阵容<b>真的会定期</b>更换。这页上的“当前阵容”，可能你一不留神就又换了。",
    "about.p4": "做的应用会放在这个页面和 GitHub 上，手机相关的话题会写在博客里。",
    "stats.note": "※ 只统计无技适手机（不含 Xperia 等有技适认证的手机）",
    "lineup.h": "当前阵容", "lineup.lead": "现在手头上的（部分不在手头的）手机们。",
    "history.h": "换机历程", "history.lead": "从有技适，到无技适大坑的坑底。",
    "history.firstTitle": "一切的元凶：vivo X70 Pro+",
    "history.firstSub": "第一台无技适手机，至今仍在服役。都怪它才有了今天。",
    "brand.title": "品牌分布（无技适）",
    "blog.h": "博客", "blog.lead": "关于手机的事，或者关于我做的东西。", "blog.more": "全部文章 →",
    "projects.lead": "做好的和正在做的东西。",
    "follow.lead": "我基本都在这些地方。",
  },
  "zh-TW": {
    "nav.lineup": "陣容", "nav.history": "歷程",
    "cc.open": "開啟顯示設定", "cc.aria": "顯示設定", "cc.title": "控制中心", "cc.close": "關閉",
    "cc.lang": "語言 / Language", "cc.glass": "玻璃", "cc.frosted": "霧面", "cc.clear": "透明", "cc.liquid": "液態", "cc.solid": "實色",
    "cc.blur": "模糊強度", "cc.wall": "桌布", "cc.aurora": "極光", "cc.sunset": "日落", "cc.ocean": "海洋", "cc.sakura": "櫻花", "cc.mono": "黑白",
    "cc.theme": "主題", "cc.auto": "自動", "cc.light": "淺色", "cc.dark": "深色", "cc.anim": "動畫",
    "m.open": "開啟", "m.copy": "複製", "m.close": "關閉", "m.copied": "已複製", "m.copyFail": "無法複製", "m.qrAlt": "{t} QR Code",
    "post.pick": "推薦", "post.read": "閱讀 →",
    "notice.wip": "開始製作「{n}」", "notice.done": "新專案「{n}」完成了", "notice.post": "發布了「{n}」",
    "sns.qr": "{t} 的 QR Code", "sns.search": "搜尋這個名字就能找到",
    "stats.all": "歷代無技適手機", "stats.now": "目前陣容", "stats.fold": "歷代折疊機", "stats.makers": "玩過的品牌",
    "spec.see": "查看規格", "spec.giteki": "有技適", "spec.year": "發售", "spec.yearV": "{y}年", "spec.camera": "相機", "spec.display": "螢幕", "spec.point": "一句話",
    "lineup.asOf": "截至 {d}", "badge.away": "出差中",
    "st.main": "主力", "st.active": "現役", "st.away": "出差中", "st.retired": "退役",
    "brand.count": "{b} {n}支",
    "blog.empty": "還沒有文章，之後會寫的。", "blog.all": "全部",
    "pj.download": "下載", "pj.page": "詳細頁面 →", "pj.wip": "製作中", "pj.done": "已完成", "pj.soon": "頁面準備中", "pj.gDone": "做好的東西", "pj.gWip": "製作中",
    "post.back": "← 文章列表", "post.prev": "← 上一篇", "post.next": "下一篇 →", "post.toc": "目錄",
    "post.jaNote": "本文以日文撰寫。", "post.translate": "用 Google 翻譯閱讀",
    "meta.desc": "こねくたん（Connectan／晓玲 清風）的個人頁面。深陷無技適中國手機坑的人。",
    "hero.tagPre": "深陷", "hero.tagPost": "坑。",
    "hero.sub": "折騰中國手機和 3C 產品，偶爾寫寫程式和部落格。",
    "about.h": "初次見面",
    "about.p1": "你好，我是 <b>こねくたん</b>（Connectan）。在社群平台上用的名字是 <b>晓玲 清風</b>。",
    "about.p2": "我本來就喜歡手機，最後認真用過的有技適認證（日本無線電認證）的手機，是 <b>Xiaomi 12T Pro</b> 和 <b>Libero Flip</b> 雙持。後來出現了 <b>vivo X70 Pro+</b>——我的第一支無技適手機，從此徹底完蛋，一口氣被拖進了中國手機的大坑。",
    "about.p3": "陣容<b>真的會定期</b>更換。這頁上的「目前陣容」，可能你一不注意就又換了。",
    "about.p4": "做的 App 會放在這個頁面和 GitHub 上，手機相關的話題會寫在部落格裡。",
    "stats.note": "※ 只計算無技適手機（不含 Xperia 等有技適認證的手機）",
    "lineup.h": "目前陣容", "lineup.lead": "現在手邊的（部分不在手邊的）手機們。",
    "history.h": "換機歷程", "history.lead": "從有技適，到無技適大坑的坑底。",
    "history.firstTitle": "一切的元凶：vivo X70 Pro+",
    "history.firstSub": "第一支無技適手機，至今仍在服役。都怪它才有了今天。",
    "brand.title": "品牌分布（無技適）",
    "blog.h": "部落格", "blog.lead": "關於手機的事，或者關於我做的東西。", "blog.more": "所有文章 →",
    "projects.lead": "做好的和正在做的東西。",
    "follow.lead": "我大概都在這些地方。",
  },
  ko: {
    "nav.lineup": "라인업", "nav.history": "연대기",
    "cc.open": "화면 설정 열기", "cc.aria": "화면 설정", "cc.title": "컨트롤 센터", "cc.close": "닫기",
    "cc.lang": "언어 / Language", "cc.glass": "유리", "cc.frosted": "젖빛", "cc.clear": "클리어", "cc.liquid": "리퀴드", "cc.solid": "솔리드",
    "cc.blur": "흐림 강도", "cc.wall": "배경화면", "cc.aurora": "오로라", "cc.sunset": "선셋", "cc.ocean": "오션", "cc.sakura": "사쿠라", "cc.mono": "모노크롬",
    "cc.theme": "테마", "cc.auto": "자동", "cc.light": "라이트", "cc.dark": "다크", "cc.anim": "애니메이션",
    "m.open": "열기", "m.copy": "복사", "m.close": "닫기", "m.copied": "복사했습니다", "m.copyFail": "복사하지 못했습니다", "m.qrAlt": "{t} QR 코드",
    "post.pick": "추천", "post.read": "읽기 →",
    "notice.wip": "「{n}」 제작을 시작했습니다", "notice.done": "새 프로젝트 「{n}」 완성", "notice.post": "「{n}」을(를) 올렸습니다",
    "sns.qr": "{t} QR 코드", "sns.search": "이 이름으로 검색해 주세요",
    "stats.all": "역대 기테키 없는 폰", "stats.now": "현재 라인업", "stats.fold": "역대 폴더블", "stats.makers": "써 본 제조사",
    "spec.see": "스펙 보기", "spec.giteki": "기테키 인증", "spec.year": "출시", "spec.yearV": "{y}년", "spec.camera": "카메라", "spec.display": "디스플레이", "spec.point": "한마디",
    "lineup.asOf": "{d} 기준", "badge.away": "출장 중",
    "st.main": "메인", "st.active": "현역", "st.away": "출장 중", "st.retired": "졸업",
    "brand.count": "{b} {n}대",
    "blog.empty": "아직 글이 없습니다. 언젠가 쓸게요.", "blog.all": "전체",
    "pj.download": "다운로드", "pj.page": "상세 페이지 →", "pj.wip": "제작 중", "pj.done": "완성", "pj.soon": "페이지 준비 중", "pj.gDone": "만든 것", "pj.gWip": "제작 중",
    "post.back": "← 글 목록", "post.prev": "← 이전 글", "post.next": "다음 글 →", "post.toc": "목차",
    "post.jaNote": "이 글은 일본어로 작성되었습니다.", "post.translate": "Google 번역으로 읽기",
    "meta.desc": "こねくたん(Connectan, 晓玲 清風)의 자기소개 페이지. 일본 미인증 중국폰 늪의 주민.",
    "hero.tagPre": "", "hero.tagPost": " 늪의 주민.",
    "hero.sub": "중국폰과 가젯을 만지작거리고, 가끔 코드와 블로그를 씁니다.",
    "about.h": "처음 뵙겠습니다",
    "about.p1": "안녕하세요, <b>こねくたん</b>(Connectan)입니다. SNS에서는 <b>晓玲 清風</b>이라는 이름으로 활동하고 있어요.",
    "about.p2": "원래 스마트폰을 좋아했는데, 마지막으로 제대로 쓴 기테키(일본 전파 인증) 폰은 <b>Xiaomi 12T Pro</b>와 <b>Libero Flip</b> 투폰이었어요. 그러다 나타난 게 <b>vivo X70 Pro+</b>. 처음 만져 본 기테키 없는 폰이었고, 그걸로 완전히 끝났죠. 그대로 중국폰 늪에 끌려 들어갔습니다.",
    "about.p3": "라인업은 <b>정말 정기적으로</b> 바뀝니다. 이 페이지의 '현재 라인업'도 정신 차려 보면 바뀌어 있을 거예요.",
    "about.p4": "만든 앱은 이 페이지와 GitHub에, 폰 이야기는 블로그에 써 나갈게요.",
    "stats.note": "※ 기테키 없는 폰만 집계 (Xperia 등 기테키 인증 폰은 제외)",
    "lineup.h": "현재 라인업", "lineup.lead": "지금 손에 있는 (일부는 없는) 폰들.",
    "history.h": "폰 연대기", "history.lead": "기테키 인증 폰에서 기테키 없는 늪의 밑바닥까지.",
    "history.firstTitle": "모든 것의 원흉: vivo X70 Pro+",
    "history.firstSub": "처음 쓴 기테키 없는 폰. 지금도 현역. 이 녀석 때문에 지금이 있다.",
    "brand.title": "제조사별 (기테키 없음)",
    "blog.h": "블로그", "blog.lead": "폰 이야기라든가, 만든 것 이야기라든가.", "blog.more": "모든 글 →",
    "projects.lead": "만든 것, 만들고 있는 것.",
    "follow.lead": "대체로 이 근처에 있습니다.",
  },
};

/* ---------- data.js / projects.json の中身の訳（キーは日本語の原文そのまま） ---------- */
const DATA = {
  en: {
    "技適なしスマホ": "import-phone", "中華スマホ": "Chinese-phone", "折りたたみ": "foldable", "香港版": "HK-model", "ガジェット": "gadget",
    "技適あり時代": "The Giteki era", "ここから技適なし沼": "Into the non-Giteki rabbit hole",
    "最後にまともに使った技適あり。Libero Flip と2台持ち。": "The last Giteki-certified phone I properly used. Carried alongside the Libero Flip.",
    "12T Pro と2台持ちしてた縦折り。": "The flip foldable I carried alongside the 12T Pro.",
    "初めての技適なし。すべての元凶。": "My first non-Giteki phone. The root of all evil.",
    "技適あるからちょっとな。…でも多分また買う。": "It's Giteki-certified, so meh… but I'll probably buy one again.",
    "現メイン機。": "Current daily driver.",
    "山根博士に預けて深圳へ…": "Left with Dr. Yamane and off to Shenzhen…",
    "2億画素カメラと120W急速充電。": "200MP camera and 120W fast charging.",
    "とにかく安く買える縦折り。": "A flip foldable you can get really cheap.",
    "ZEISS T* とジンバル超広角。全部入りの沼の入口。": "ZEISS T* and a gimbal ultra-wide. The all-in-one entrance to the rabbit hole.",
    "フラッグシップSoC＋6400mAhを格安で。コスパの暴力。": "Flagship SoC + 6400mAh on the cheap. Absurd value for money.",
    "5800mAhで厚さ約7.98mm。物理的バグ。": "5800mAh in about 7.98mm. A glitch in physics.",
    "開いて5.4mm。当時最薄クラスの横折り。": "5.4mm unfolded. One of the thinnest book-style foldables of its time.",
    "8 Gen 3 にペリスコープ望遠まで載せた価格破壊。": "8 Gen 3 plus a periscope telephoto, at a price-breaking price.",
    "Exmor T と光学ズーム。イヤホンジャックもSDも残ってる。": "Exmor T and optical zoom. Still has a headphone jack and microSD.",
    "外折りで折り目がほぼ見えない大画面。": "Folds outward, so the big screen has an almost invisible crease.",
    "閉じて9.2mm・226g。普通のスマホ並みに薄い横折り。": "9.2mm closed, 226g. A book-style foldable as thin as a normal phone.",
    "1インチ＋50MP×4のLeica。カメラ機の到達点。": "1-inch sensor + four 50MP Leica cameras. The pinnacle of camera phones.",
    "10段階の可変絞り。XMAGE の空気感。": "10-step variable aperture. That XMAGE atmosphere.",
    "V1+ チップと ZEISS の4眼。夜景が強い。": "V1+ chip and four ZEISS cameras. Great at night shots.",
    "Snapdragon 8 Gen 1（Dimensity 9000版もあり）": "Snapdragon 8 Gen 1 (Dimensity 9000 version also exists)",
    "ZEISS 搭載 Xperia で撮った写真に、Xperia × ZEISS のロゴと撮影情報（焦点距離・F値・SS・ISO・日時）の透かしを入れるアプリ。": "An app that watermarks photos taken on ZEISS-equipped Xperia phones with an Xperia × ZEISS logo and shooting info (focal length, aperture, shutter speed, ISO, date).",
    "Xperia 向けウォーターマークのスタンダード版。": "Standard edition of the watermark app for Xperia.",
    "画面のみオフ": "Screen Off Only", "画面だけを消して、裏の動作はそのまま続けられるアプリ。": "Turns off just the screen while everything keeps running in the background.",
    "Spotify 歌詞同期": "Spotify Lyrics Sync", "Spotify の再生に合わせて歌詞を同期表示する。製作中。": "Shows lyrics synced to Spotify playback. In progress.",
  },
  "zh-CN": {
    "技適なしスマホ": "无技适手机", "中華スマホ": "国产手机", "折りたたみ": "折叠屏", "香港版": "港版", "ガジェット": "数码",
    "技適あり時代": "有技适时代", "ここから技適なし沼": "从这里开始掉进无技适大坑",
    "最後にまともに使った技適あり。Libero Flip と2台持ち。": "最后认真用过的有技适手机。和 Libero Flip 双持。",
    "12T Pro と2台持ちしてた縦折り。": "和 12T Pro 双持的竖折屏。",
    "初めての技適なし。すべての元凶。": "第一台无技适手机。一切的元凶。",
    "技適あるからちょっとな。…でも多分また買う。": "有技适所以有点那个……不过大概还会再买。",
    "現メイン機。": "现役主力机。",
    "山根博士に預けて深圳へ…": "托付给山根博士带去深圳了…",
    "2億画素カメラと120W急速充電。": "2亿像素相机和120W快充。",
    "とにかく安く買える縦折り。": "总之很便宜就能买到的竖折屏。",
    "ZEISS T* とジンバル超広角。全部入りの沼の入口。": "蔡司 T* 镀膜加云台超广角。全能型的入坑之作。",
    "フラッグシップSoC＋6400mAhを格安で。コスパの暴力。": "旗舰芯片＋6400mAh，价格还便宜。性价比暴力。",
    "5800mAhで厚さ約7.98mm。物理的バグ。": "5800mAh 却只有约7.98mm厚。物理 bug。",
    "開いて5.4mm。当時最薄クラスの横折り。": "展开仅5.4mm。当时最薄级别的横折屏。",
    "8 Gen 3 にペリスコープ望遠まで載せた価格破壊。": "8 Gen 3 还塞进潜望长焦的价格屠夫。",
    "Exmor T と光学ズーム。イヤホンジャックもSDも残ってる。": "Exmor T 加光学变焦。耳机孔和 SD 卡槽都还在。",
    "外折りで折り目がほぼ見えない大画面。": "外折设计，大屏几乎看不到折痕。",
    "閉じて9.2mm・226g。普通のスマホ並みに薄い横折り。": "折叠后9.2mm、226g。和普通手机一样薄的横折屏。",
    "1インチ＋50MP×4のLeica。カメラ機の到達点。": "1英寸＋4颗5000万像素徕卡镜头。影像旗舰的巅峰。",
    "10段階の可変絞り。XMAGE の空気感。": "10档可变光圈。XMAGE 的空气感。",
    "V1+ チップと ZEISS の4眼。夜景が強い。": "V1+ 芯片和蔡司四摄。夜景很强。",
    "Snapdragon 8 Gen 1（Dimensity 9000版もあり）": "Snapdragon 8 Gen 1（另有天玑 9000 版）",
    "ZEISS 搭載 Xperia で撮った写真に、Xperia × ZEISS のロゴと撮影情報（焦点距離・F値・SS・ISO・日時）の透かしを入れるアプリ。": "给蔡司 Xperia 拍摄的照片加上 Xperia × ZEISS 标志和拍摄信息（焦距・光圈・快门・ISO・日期）水印的应用。",
    "Xperia 向けウォーターマークのスタンダード版。": "面向 Xperia 的水印应用标准版。",
    "画面のみオフ": "仅关闭屏幕", "画面だけを消して、裏の動作はそのまま続けられるアプリ。": "只关闭屏幕、后台继续运行的应用。",
    "Spotify 歌詞同期": "Spotify 歌词同步", "Spotify の再生に合わせて歌詞を同期表示する。製作中。": "配合 Spotify 播放同步显示歌词。制作中。",
  },
  "zh-TW": {
    "技適なしスマホ": "無技適手機", "中華スマホ": "中國手機", "折りたたみ": "折疊機", "香港版": "港版", "ガジェット": "3C",
    "技適あり時代": "有技適時代", "ここから技適なし沼": "從這裡開始掉進無技適大坑",
    "最後にまともに使った技適あり。Libero Flip と2台持ち。": "最後認真用過的有技適手機。和 Libero Flip 雙持。",
    "12T Pro と2台持ちしてた縦折り。": "和 12T Pro 雙持的上下翻摺機。",
    "初めての技適なし。すべての元凶。": "第一支無技適手機。一切的元凶。",
    "技適あるからちょっとな。…でも多分また買う。": "有技適所以有點那個……不過大概還會再買。",
    "現メイン機。": "現役主力機。",
    "山根博士に預けて深圳へ…": "託付給山根博士帶去深圳了…",
    "2億画素カメラと120W急速充電。": "2億畫素相機和120W快充。",
    "とにかく安く買える縦折り。": "總之很便宜就能買到的上下翻摺機。",
    "ZEISS T* とジンバル超広角。全部入りの沼の入口。": "蔡司 T* 鍍膜加雲台超廣角。全包式的入坑之作。",
    "フラッグシップSoC＋6400mAhを格安で。コスパの暴力。": "旗艦晶片＋6400mAh，價格還很便宜。CP值爆表。",
    "5800mAhで厚さ約7.98mm。物理的バグ。": "5800mAh 卻只有約7.98mm厚。物理 bug。",
    "開いて5.4mm。当時最薄クラスの横折り。": "展開僅5.4mm。當時最薄等級的左右摺疊機。",
    "8 Gen 3 にペリスコープ望遠まで載せた価格破壊。": "8 Gen 3 還塞進潛望式望遠的價格破壞者。",
    "Exmor T と光学ズーム。イヤホンジャックもSDも残ってる。": "Exmor T 加光學變焦。耳機孔和 SD 卡槽都還在。",
    "外折りで折り目がほぼ見えない大画面。": "外摺設計，大螢幕幾乎看不到摺痕。",
    "閉じて9.2mm・226g。普通のスマホ並みに薄い横折り。": "摺起來9.2mm、226g。和一般手機一樣薄的左右摺疊機。",
    "1インチ＋50MP×4のLeica。カメラ機の到達点。": "1吋＋4顆5000萬畫素徠卡鏡頭。拍照手機的巔峰。",
    "10段階の可変絞り。XMAGE の空気感。": "10段可變光圈。XMAGE 的空氣感。",
    "V1+ チップと ZEISS の4眼。夜景が強い。": "V1+ 晶片和蔡司四鏡頭。夜景很強。",
    "Snapdragon 8 Gen 1（Dimensity 9000版もあり）": "Snapdragon 8 Gen 1（另有天璣 9000 版）",
    "ZEISS 搭載 Xperia で撮った写真に、Xperia × ZEISS のロゴと撮影情報（焦点距離・F値・SS・ISO・日時）の透かしを入れるアプリ。": "替蔡司 Xperia 拍攝的照片加上 Xperia × ZEISS 標誌和拍攝資訊（焦距・光圈・快門・ISO・日期）浮水印的 App。",
    "Xperia 向けウォーターマークのスタンダード版。": "給 Xperia 用的浮水印 App 標準版。",
    "画面のみオフ": "僅關閉螢幕", "画面だけを消して、裏の動作はそのまま続けられるアプリ。": "只關閉螢幕、背景繼續運作的 App。",
    "Spotify 歌詞同期": "Spotify 歌詞同步", "Spotify の再生に合わせて歌詞を同期表示する。製作中。": "配合 Spotify 播放同步顯示歌詞。製作中。",
  },
  ko: {
    "技適なしスマホ": "해외 직구폰", "中華スマホ": "중국폰", "折りたたみ": "폴더블", "香港版": "홍콩판", "ガジェット": "가젯",
    "技適あり時代": "기테키 인증 시대", "ここから技適なし沼": "여기서부터 기테키 없는 늪",
    "最後にまともに使った技適あり。Libero Flip と2台持ち。": "마지막으로 제대로 쓴 기테키 인증 폰. Libero Flip과 투폰.",
    "12T Pro と2台持ちしてた縦折り。": "12T Pro와 투폰으로 쓰던 플립.",
    "初めての技適なし。すべての元凶。": "처음 쓴 기테키 없는 폰. 모든 것의 원흉.",
    "技適あるからちょっとな。…でも多分また買う。": "기테키 인증이라 좀 그렇긴 한데… 아마 또 살 듯.",
    "現メイン機。": "현재 메인 폰.",
    "山根博士に預けて深圳へ…": "야마네 박사에게 맡겨서 선전으로…",
    "2億画素カメラと120W急速充電。": "2억 화소 카메라와 120W 고속 충전.",
    "とにかく安く買える縦折り。": "아무튼 싸게 살 수 있는 플립.",
    "ZEISS T* とジンバル超広角。全部入りの沼の入口。": "ZEISS T*와 짐벌 초광각. 다 갖춘 늪의 입구.",
    "フラッグシップSoC＋6400mAhを格安で。コスパの暴力。": "플래그십 SoC + 6400mAh를 저렴하게. 가성비의 폭력.",
    "5800mAhで厚さ約7.98mm。物理的バグ。": "5800mAh인데 두께 약 7.98mm. 물리 버그.",
    "開いて5.4mm。当時最薄クラスの横折り。": "펼쳐서 5.4mm. 당시 최박급 폴드.",
    "8 Gen 3 にペリスコープ望遠まで載せた価格破壊。": "8 Gen 3에 잠망경 망원까지 넣은 가격 파괴.",
    "Exmor T と光学ズーム。イヤホンジャックもSDも残ってる。": "Exmor T와 광학 줌. 이어폰 잭도 SD도 남아 있다.",
    "外折りで折り目がほぼ見えない大画面。": "아웃폴딩이라 접힌 자국이 거의 안 보이는 대화면.",
    "閉じて9.2mm・226g。普通のスマホ並みに薄い横折り。": "접어서 9.2mm·226g. 일반 폰만큼 얇은 폴드.",
    "1インチ＋50MP×4のLeica。カメラ機の到達点。": "1인치 + 5000만 화소 ×4의 Leica. 카메라폰의 도달점.",
    "10段階の可変絞り。XMAGE の空気感。": "10단계 가변 조리개. XMAGE 특유의 공기감.",
    "V1+ チップと ZEISS の4眼。夜景が強い。": "V1+ 칩과 ZEISS 쿼드 카메라. 야경에 강하다.",
    "Snapdragon 8 Gen 1（Dimensity 9000版もあり）": "Snapdragon 8 Gen 1 (Dimensity 9000 버전도 있음)",
    "ZEISS 搭載 Xperia で撮った写真に、Xperia × ZEISS のロゴと撮影情報（焦点距離・F値・SS・ISO・日時）の透かしを入れるアプリ。": "ZEISS 탑재 Xperia로 찍은 사진에 Xperia × ZEISS 로고와 촬영 정보(초점 거리·F값·셔터 속도·ISO·일시) 워터마크를 넣는 앱.",
    "Xperia 向けウォーターマークのスタンダード版。": "Xperia용 워터마크 앱 스탠다드판.",
    "画面のみオフ": "화면만 끄기", "画面だけを消して、裏の動作はそのまま続けられるアプリ。": "화면만 끄고 백그라운드 동작은 그대로 계속하는 앱.",
    "Spotify 歌詞同期": "Spotify 가사 싱크", "Spotify の再生に合わせて歌詞を同期表示する。製作中。": "Spotify 재생에 맞춰 가사를 싱크 표시. 제작 중.",
  },
};

/* ---------- スペック表の用語（カメラ・ディスプレイの欄を単語ごとに置き換え） ---------- */
const TERMS = {
  en: [["光学ズーム望遠", "optical-zoom telephoto"], ["光学ズーム", "optical zoom"], ["超広角", "ultra-wide"], ["ペリスコープ", "periscope"], ["望遠", "telephoto"],
       ["ジンバル", "gimbal"], ["マクロ", "macro"], ["深度", "depth"], ["可変絞り", "variable aperture"], ["インチ", "-inch"], ["有機EL", "OLED"],
       ["外折り", "outward-folding "], ["曲面", "curved "], ["メイン", "Main"], ["カバー", "Cover"], ["サブ", "Sub"], ["閉じて", "closed: "]],
  "zh-CN": [["光学ズーム望遠", "光学变焦长焦"], ["光学ズーム", "光学变焦"], ["超広角", "超广角"], ["ペリスコープ", "潜望"], ["望遠", "长焦"],
       ["ジンバル", "云台"], ["マクロ", "微距"], ["深度", "景深"], ["可変絞り", "可变光圈"], ["インチ", "英寸"], ["有機EL", "OLED"],
       ["外折り", "外折"], ["曲面", "曲面"], ["メイン", "主屏"], ["カバー", "外屏"], ["サブ", "副屏"], ["閉じて", "折叠后"]],
  "zh-TW": [["光学ズーム望遠", "光學變焦望遠"], ["光学ズーム", "光學變焦"], ["超広角", "超廣角"], ["ペリスコープ", "潛望式"], ["望遠", "望遠"],
       ["ジンバル", "雲台"], ["マクロ", "微距"], ["深度", "景深"], ["可変絞り", "可變光圈"], ["インチ", "吋"], ["有機EL", "OLED"],
       ["外折り", "外摺"], ["曲面", "曲面"], ["メイン", "主螢幕"], ["カバー", "外螢幕"], ["サブ", "副螢幕"], ["閉じて", "摺起來"]],
  ko: [["光学ズーム望遠", "광학 줌 망원"], ["光学ズーム", "광학 줌"], ["超広角", "초광각"], ["ペリスコープ", "잠망경"], ["望遠", "망원"],
       ["ジンバル", "짐벌"], ["マクロ", "매크로"], ["深度", "심도"], ["可変絞り", "가변 조리개"], ["インチ", "인치"], ["有機EL", "OLED"],
       ["外折り", "아웃폴딩 "], ["曲面", "곡면 "], ["メイン", "메인"], ["カバー", "커버"], ["サブ", "서브"], ["閉じて", "접었을 때 "]],
};

/* ---------- 関数 ---------- */
const fill = (s, v) => v ? String(s).replace(/\{(\w+)\}/g, (m, k) => v[k] != null ? v[k] : m) : s;
function t(key, vars) {
  const s = (T[lang] && T[lang][key] != null) ? T[lang][key] : (T.ja[key] != null ? T.ja[key] : key);
  return fill(s, vars);
}
function tx(s) {
  if (lang === "ja" || s == null) return s;
  const d = DATA[lang];
  return d && d[s] != null ? d[s] : s;
}
function spec(s) {
  if (lang === "ja" || !s) return s;
  const d = DATA[lang];
  if (d && d[s] != null) return d[s];
  let r = String(s);
  (TERMS[lang] || []).forEach(([a, b]) => { r = r.split(a).join(b); });
  if (lang === "en" || lang === "ko") r = r.replace(/（/g, " (").replace(/）/g, ")").replace(/＋/g, "+").replace(/・/g, ", ").replace(/ {2,}/g, " ").replace(/ \)/g, ")");
  return r.trim();
}
function setLang(l) {
  if (!CODES.includes(l)) return;
  try { localStorage.setItem("lang", l); } catch (e) {}
  try { const u = new URL(location.href); if (u.searchParams.has("lang")) { u.searchParams.delete("lang"); history.replaceState(null, "", u); } } catch (e) {}
  location.reload();
}

/* ---------- HTML に書いてある文章（data-i18n）を置き換え ---------- */
const root = document.documentElement;
root.lang = lang;
if (lang !== "ja") {
  const d = T[lang] || {};
  document.querySelectorAll("[data-i18n]").forEach(el => { const k = el.dataset.i18n; if (d[k] != null) el.innerHTML = d[k]; });
  document.querySelectorAll("[data-i18n-content]").forEach(el => { const k = el.dataset.i18nContent; if (d[k] != null) el.setAttribute("content", d[k]); });
}

/* ---------- 言語ごとのフォント・言語ボタンの見た目 ---------- */
const FONT = { "zh-TW": "Noto+Sans+TC", ko: "Noto+Sans+KR" }[lang];
if (FONT) {
  const l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = `https://fonts.googleapis.com/css2?family=${FONT}:wght@400;700;900&display=swap`;
  document.head.appendChild(l);
}
const css = document.createElement("style");
css.textContent = `
html:lang(zh-CN) body { font-family: "Noto Sans SC", "Zen Kaku Gothic New", system-ui, sans-serif; }
html:lang(zh-TW) body { font-family: "Noto Sans TC", "Noto Sans SC", system-ui, sans-serif; }
html:lang(ko) body { font-family: "Noto Sans KR", system-ui, sans-serif; word-break: keep-all; }
.nav-lang { width: auto; padding: 0 10px; gap: 5px; grid-auto-flow: column; border-radius: 999px; font: 600 12px "JetBrains Mono", ui-monospace, monospace; }
.nav-lang svg { width: 17px; height: 17px; }
@media (max-width: 820px) { nav.top .nav-lang { margin-left: 0; } }
.seg.lang-seg { grid-auto-flow: row; grid-template-columns: repeat(3, 1fr); }
.ja-note { margin: 18px 0 0; padding: 12px 16px; border-radius: 14px; font-size: 13.5px; background: rgba(var(--edge), .14); border: 1px solid var(--line); }
.ja-note a { color: var(--accent); font-weight: 700; margin-left: 6px; }
`;
document.head.appendChild(css);

window.I18N = { lang, LANGS, SHORT, t, tx, spec, setLang };
})();
