/* トップページの描画（中身は data.js） */
(() => {
const S = window.SITE, U = window.UI, { $, esc, ICON } = U;

/* ---------- hero ---------- */
$("heroName").innerHTML = [...S.name].map((c, i) => c === " " ? " " : `<span class="ch" style="--i:${i}">${esc(c)}</span>`).join("");
setTimeout(() => $("heroName").classList.add("shine"), 1800);
$("heroReading").textContent = S.reading;
if (S.aka) $("heroAka").textContent = "a.k.a. " + S.aka;

const rot = $("rot");
rot.innerHTML = S.rotatingWords.map((w, i) => `<span class="${i ? "" : "on"}">${esc(w)}</span>`).join("");
let ri = 0;
const fit = () => { rot.style.width = rot.children[ri].offsetWidth + "px"; };
document.fonts.ready.then(fit); addEventListener("resize", fit); fit();
setInterval(() => {
  if (U.prefs.anim !== "on") return;
  const spans = rot.children, prev = spans[ri];
  ri = (ri + 1) % spans.length;
  prev.classList.remove("on"); prev.classList.add("out");
  spans[ri].classList.remove("out"); spans[ri].classList.add("on");
  fit();
  setTimeout(() => prev.classList.remove("out"), 750);
}, 2600);

/* ---------- SNS ---------- */
const L = S.links || {};
const SNS = [
  { key: "x",        title: "X",        color: "#111111", ...(L.x || {}) },
  { key: "bilibili", title: "BiliBili", color: "#00a1d6", ...(L.bilibili || {}) },
  { key: "discord",  title: "Discord",  color: "#5865f2", ...(L.discord || {}) },
  { key: "wechat",   title: "WeChat",   color: "#07c160", ...(L.wechat || {}) },
];
if (L.github) SNS.push({ key: "github", title: "GitHub", color: "#6e40c9", name: "@" + L.github, url: "https://github.com/" + L.github });

// URL があって ID/QR が無いものは直接リンク。それ以外はタップで詳細（名前・ID・QR・コピー）を出す
const direct = (s) => s.url && !s.id && !s.qr;
const attrs = (s, i) => direct(s) ? `href="${esc(s.url)}" target="_blank" rel="noopener"` : `href="#" data-sns="${i}"`;
$("heroLinks").innerHTML = SNS.map((s, i) => `<a class="pill glass" ${attrs(s, i)}>${ICON[s.key]}${s.title}</a>`).join("");
$("followGrid").innerHTML = SNS.map((s, i) => `
  <a class="sns glass tilt reveal" style="--d:${i}" ${attrs(s, i)}>
    <div class="ic" style="--c:${s.color}">${ICON[s.key]}</div>
    <div><b>${s.title}</b><br><span>${esc(s.name || "")}</span></div>
  </a>`).join("");
document.addEventListener("click", e => {
  const a = e.target.closest("[data-sns]"); if (!a) return;
  e.preventDefault();
  const s = SNS[+a.dataset.sns];
  U.openModal({
    icon: s.key, color: s.color, title: s.title, name: s.name, qr: s.qr, url: s.url,
    sub: s.id ? "ID: " + s.id : (s.url ? "" : "この名前で検索してね"),
    copy: s.id || s.name,
  });
});

/* ---------- stats（技適なしだけ数える） ---------- */
const D = S.devices;
const color = (d) => S.brands[d.maker] || "#888";
const ng = D.filter(d => !d.giteki);
const brandCount = {};
ng.forEach(d => brandCount[d.maker] = (brandCount[d.maker] || 0) + 1);
const stats = [
  [ng.length, "歴代の技適なし端末"],
  [ng.filter(d => d.status !== "retired").length, "現在の布陣"],
  [ng.filter(d => d.fold).length, "歴代の折りたたみ"],
  [Object.keys(brandCount).length, "触ってきたメーカー"],
];
$("stats").innerHTML = stats.map(([n, l], i) =>
  `<div class="glass stat tilt reveal" style="--d:${i}"><b class="mono" data-count="${n}">0</b><span>${l}</span></div>`).join("");
function countUp(el) {
  const to = +el.dataset.count;
  if (U.prefs.anim !== "on") { el.textContent = to; return; }
  const t0 = performance.now();
  (function f(t) {
    const p = Math.min(1, (t - t0) / 1400);
    el.textContent = Math.round(to * (1 - Math.pow(1 - p, 4)));
    if (p < 1) requestAnimationFrame(f);
  })(t0);
}
$("stats").querySelectorAll(".stat").forEach(c => c.addEventListener("revealed", () => countUp(c.querySelector("[data-count]"))));

/* ---------- lineup ---------- */
$("lineupDate").textContent = S.lineupDate + " 時点";
const order = { main: 0, active: 1, away: 2 };
$("lineupGrid").innerHTML = D.filter(d => d.status !== "retired").sort((a, b) => order[a.status] - order[b.status]).map((d, i) => {
  const isMain = d.status === "main";
  const badges = [
    isMain ? `<span class="badge b-main">MAIN</span>` : "",
    d.status === "away" ? `<span class="badge b-away">出張中</span>` : "",
    d.fold ? `<span class="badge b-fold">Foldable</span>` : "",
    d.region ? `<span class="badge">${esc(d.region)}</span>` : "",
  ].join("");
  const phone = isMain && d.fold
    ? `<div class="foldphone" aria-hidden="true"><div class="panel l"></div><div class="panel r"><span class="cam"></span></div></div>` : "";
  return `<div class="glass device tilt reveal ${isMain ? "main" : ""}" style="--brand:${color(d)};--d:${i}">
    ${isMain ? `<div class="glow"></div>` : ""}<span class="stripe"></span>
    <div>
      <div class="maker">${esc(d.maker)}</div>
      <div class="name">${esc(d.name)}</div>
      <div class="badges">${badges}</div>
      ${d.note ? `<p class="note ${d.status === "away" ? "away-dots" : ""}">${esc(d.status === "away" ? d.note.replace(/…$/, "") : d.note)}</p>` : ""}
    </div>${phone}
  </div>`;
}).join("");

/* ---------- brands ---------- */
$("brandbar").innerHTML = Object.entries(brandCount)
  .map(([b, n], i) => `<div style="--brand:${S.brands[b] || "#888"};flex:${n};--d:${i}" title="${esc(b)} ${n}台"></div>`).join("");
$("legend").innerHTML = Object.entries(brandCount)
  .map(([b, n]) => `<span style="--brand:${S.brands[b] || "#888"}"><i></i>${esc(b)} <span class="mono">${n}</span></span>`).join("");

/* ---------- timeline ---------- */
const STATE = { main: "メイン", active: "現役", away: "出張中", retired: "卒業" };
const tl = $("timeline");
tl.innerHTML = D.map(d => `
  ${d.chapter ? `<li class="chapter"><span class="dot"></span><span class="item glass">${esc(d.chapter)}</span></li>` : ""}
  <li class="${d.status !== "retired" ? "now" : ""} ${d.giteki ? "giteki" : ""}" style="--brand:${color(d)}">
    <span class="dot"></span>
    <div class="item">
      <span class="t-name">${esc(d.name)}</span><span class="t-maker">${esc(d.maker)}</span>
      <span class="t-state">${STATE[d.status] || ""}</span>
      ${d.note ? `<p class="t-note">${esc(d.note)}</p>` : ""}
    </div>
  </li>`).join("");
U.onScroll(vh => {
  const r = tl.getBoundingClientRect(), mark = vh * 0.72;
  tl.style.setProperty("--p", Math.max(0, Math.min(1, (mark - r.top) / r.height)));
  tl.querySelectorAll("li").forEach(li => li.classList.toggle("lit", li.getBoundingClientRect().top < mark));
});

/* ---------- blog ---------- */
U.loadPosts().then(posts => {
  const picks = posts.filter(p => p.pinned).slice(0, 2);
  const latest = posts.filter(p => !p.pinned).slice(0, 4);
  if (!posts.length) {
    $("blogFeatured").innerHTML = `<div class="glass empty reveal">まだ記事はありません。そのうち書きます。</div>`;
  } else {
    $("blogFeatured").innerHTML = picks.map((p, i) => U.postCard(p, { big: true, d: i })).join("");
    $("blogLatest").innerHTML = latest.map((p, i) => U.postCard(p, { d: i })).join("");
  }
  U.reveal($("blog"));
});

/* ---------- projects ---------- */
const P = S.projects || [];
const projCard = (p, i) => {
  const links = [
    p.page ? `<a href="${esc(p.page)}">詳細ページ →</a>` : "",
    p.repo ? `<a href="${esc(p.repo)}" target="_blank" rel="noopener">GitHub →</a>` : "",
  ].join("");
  return `<div class="glass project tilt reveal" style="--d:${i}">
    <h3>${esc(p.name)}</h3>
    <p>${esc(p.desc)}</p>
    <div class="meta">
      <span class="badge ${p.status === "wip" ? "b-wip" : "b-done"}">${p.status === "wip" ? "製作中" : "完成"}</span>
      ${links || `<span class="soon">ページ準備中</span>`}
    </div>
  </div>`;
};
const done = P.filter(p => p.status !== "wip"), wip = P.filter(p => p.status === "wip");
$("projectWrap").innerHTML =
  (done.length ? `<div class="proj-group reveal">作ったもの</div><div class="projects">${done.map(projCard).join("")}</div>` : "") +
  (wip.length ? `<div class="proj-group reveal">製作中</div><div class="projects">${wip.map(projCard).join("")}</div>` : "");

U.reveal();
})();
