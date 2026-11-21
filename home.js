/* トップページの描画（中身は data.js） */
(() => {
const S = window.SITE, U = window.UI, { $, esc, ICON } = U;
const I = U.I18N || window.I18N || { t: (k) => k, tx: (s) => s, spec: (s) => s }, T = I.t, tx = I.tx;

/* ---------- hero ---------- */
$("heroName").innerHTML = [...S.name].map((c, i) => c === " " ? " " : `<span class="ch" style="--i:${i}">${esc(c)}</span>`).join("");
setTimeout(() => $("heroName").classList.add("shine"), 1800);
$("heroReading").textContent = S.reading;
if (S.aka) $("heroAka").textContent = "a.k.a. " + S.aka;

const rot = $("rot");
rot.innerHTML = S.rotatingWords.map((w, i) => `<span class="${i ? "" : "on"}">${esc(tx(w))}</span>`).join("");
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

/* ---------- プロジェクト・お知らせは data/*.json ---------- */
const getJSON = (p) => fetch(U.BASE + p, { cache: "no-cache" }).then(r => r.ok ? r.json() : null).catch(() => null);
const extra = Promise.all([getJSON("data/projects.json"), getJSON("data/news.json")]).then(([pj, nw]) => {
  if (Array.isArray(pj)) S.projects = pj;
  if (Array.isArray(nw)) S.news = nw;
});

/* ---------- お知らせ（名前の下）：記事・プロジェクト・news から新しい順に3件 ---------- */
extra.then(() => {
  const el = $("notice"); if (!el) return;
  const norm = (d) => String(d || "").trim().replace(/-/g, "/");
  const items = [];
  (S.news || []).forEach(n => n && n.text && n.date && items.push({ date: norm(n.date), text: tx(n.text), url: n.url || "" }));
  (S.projects || []).forEach(p => {
    if (p.public === false || !p.date) return;
    items.push({ date: norm(p.date), url: p.page || p.repo || "#projects",
      text: T(p.status === "wip" ? "notice.wip" : "notice.done", { n: tx(p.name) }) });
  });
  U.loadPosts().then(posts => {
    posts.forEach(p => p.date && items.push({ date: norm(p.date), url: p.url, text: T("notice.post", { n: p.title }) }));
    const list = items.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
    if (!list.length) return;
    el.innerHTML = `<span class="n-bell" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg></span>
      <span class="n-label mono">NEW</span>
      <span class="n-track">${list.map((n, i) => `<a class="n-item ${i ? "" : "on"}" href="${esc(n.url || "#")}">
        <span class="n-date mono">${esc(n.date)}</span><span class="n-text">${esc(n.text)}</span></a>`).join("")}</span>`;
    el.hidden = false;
    setTimeout(() => el.classList.add("show"), 30);
    if (list.length < 2) return;
    let ni = 0;
    setInterval(() => {
      if (U.prefs.anim !== "on" || el.matches(":hover")) return;
      const its = el.querySelectorAll(".n-item"), prev = its[ni];
      ni = (ni + 1) % its.length;
      prev.classList.remove("on"); prev.classList.add("out");
      its[ni].classList.remove("out"); its[ni].classList.add("on");
      setTimeout(() => prev.classList.remove("out"), 650);
    }, 4200);
  });
});

/* ---------- SNS ---------- */
const L = S.links || {};
const SNS = [
  { key: "x",        title: "X",        color: "#111111", ...(L.x || {}) },
  { key: "bilibili", title: "BiliBili", color: "#00a1d6", ...(L.bilibili || {}) },
  { key: "discord",  title: "Discord",  color: "#5865f2", ...(L.discord || {}) },
  { key: "wechat",   title: "WeChat",   color: "#07c160", ...(L.wechat || {}) },
];
if (L.github) SNS.push({ key: "github", title: "GitHub", color: "#6e40c9", name: "@" + L.github, url: "https://github.com/" + L.github });

// URL があって ID が無いもの（X / BiliBili / GitHub）は直接リンク。それ以外はタップで詳細（名前・ID・QR・コピー）
// 直接リンクで QR もあるもの（BiliBili）は、カードに QR ボタンを付ける
const direct = (s) => s.url && !s.id;
const attrs = (s, i) => direct(s) ? `href="${esc(s.url)}" target="_blank" rel="noopener"` : `href="#" data-sns="${i}"`;
const QR_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3"/></svg>';
$("heroLinks").innerHTML = SNS.map((s, i) => `<a class="pill glass" ${attrs(s, i)}>${ICON[s.key]}${s.title}</a>`).join("");
$("followGrid").innerHTML = SNS.map((s, i) => `
  <div class="sns glass tilt reveal" style="--d:${i}">
    <a class="sns-main" ${attrs(s, i)}>
      <div class="ic" style="--c:${s.color}">${ICON[s.key]}</div>
      <div><b>${s.title}</b><br><span>${esc(s.name || "")}</span></div>
    </a>
    ${s.qr ? `<button type="button" class="qr-btn" data-sns="${i}" aria-label="${esc(T("sns.qr", { t: s.title }))}">${QR_ICON}QR</button>` : ""}
  </div>`).join("");
document.addEventListener("click", e => {
  const a = e.target.closest("[data-sns]"); if (!a) return;
  e.preventDefault();
  const s = SNS[+a.dataset.sns];
  U.openModal({
    icon: s.key, color: s.color, title: s.title, name: s.name, qr: s.qr, url: s.url,
    sub: s.id ? "ID: " + s.id : (s.url || s.qr ? "" : T("sns.search")),
    copy: s.id || (s.url ? "" : s.name),
  });
});

/* ---------- stats（技適なしだけ数える） ---------- */
const D = S.devices;
const color = (d) => S.brands[d.maker] || "#888";
const ng = D.filter(d => !d.giteki);
const brandCount = {};
ng.forEach(d => brandCount[d.maker] = (brandCount[d.maker] || 0) + 1);
const stats = [
  [ng.length, T("stats.all")],
  [ng.filter(d => d.status !== "retired").length, T("stats.now")],
  [ng.filter(d => d.fold).length, T("stats.fold")],
  [Object.keys(brandCount).length, T("stats.makers")],
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

/* ---------- 端末スペック表（名前を押すと出る） ---------- */
const devName = (d, cls) => d.spec
  ? `<button type="button" class="${cls} dev-name" data-dev="${D.indexOf(d)}" title="${esc(T("spec.see"))}">${esc(d.name)}<span class="dev-i" aria-hidden="true">i</span></button>`
  : `<span class="${cls}">${esc(d.name)}</span>`;
document.addEventListener("click", e => {
  const b = e.target.closest("[data-dev]"); if (!b) return;
  const d = D[+b.dataset.dev], s = d.spec || {};
  const row = (k, v) => v ? `<div class="sp-row"><span>${k}</span><b>${esc(v)}</b></div>` : "";
  const m = $("modal");
  m.classList.add("spec");
  m.style.setProperty("--brand", color(d));
  m.innerHTML = `
    <div class="sp-head"><span class="sp-maker">${esc(d.maker)}</span>
      ${d.giteki ? `<span class="badge">${T("spec.giteki")}</span>` : ""}${d.fold ? `<span class="badge b-fold">Foldable</span>` : ""}</div>
    <div class="sp-name">${esc(d.name)}</div>
    <div class="sp-rows">
      ${row("SoC", I.spec(s.soc))}${row(T("spec.year"), s.year && T("spec.yearV", { y: s.year }))}${row(T("spec.camera"), I.spec(s.camera))}${row(T("spec.display"), I.spec(s.display))}
    </div>
    ${s.point ? `<div class="sp-point"><span>${T("spec.point")}</span>${esc(tx(s.point))}</div>` : ""}
    <div class="m-btns"><button class="pill glass" id="spClose">${T("m.close")}</button></div>`;
  document.body.classList.add("modal-open");
  $("spClose").onclick = () => document.body.classList.remove("modal-open");
});
// 他のモーダル（SNS）を開くときはスペック表の見た目を外す
document.addEventListener("click", e => { if (e.target.closest("[data-sns]")) $("modal").classList.remove("spec"); }, true);

/* ---------- lineup ---------- */
$("lineupDate").textContent = T("lineup.asOf", { d: S.lineupDate });
const order = { main: 0, active: 1, away: 2 };
$("lineupGrid").innerHTML = D.filter(d => d.status !== "retired").sort((a, b) => order[a.status] - order[b.status]).map((d, i) => {
  const isMain = d.status === "main";
  const badges = [
    isMain ? `<span class="badge b-main">MAIN</span>` : "",
    d.status === "away" ? `<span class="badge b-away">${T("badge.away")}</span>` : "",
    d.fold ? `<span class="badge b-fold">Foldable</span>` : "",
    d.region ? `<span class="badge">${esc(tx(d.region))}</span>` : "",
  ].join("");
  return `<div class="glass device tilt reveal ${isMain ? "main" : ""}" style="--brand:${color(d)};--d:${i}">
    ${isMain ? `<div class="glow"></div>` : ""}<span class="stripe"></span>
    <div>
      <div class="maker">${esc(d.maker)}</div>
      ${devName(d, "name")}
      <div class="badges">${badges}</div>
      ${d.note ? `<p class="note ${d.status === "away" ? "away-dots" : ""}">${esc(d.status === "away" ? tx(d.note).replace(/…$/, "") : tx(d.note))}</p>` : ""}
    </div>
  </div>`;
}).join("");

/* ---------- brands ---------- */
$("brandbar").innerHTML = Object.entries(brandCount)
  .map(([b, n], i) => `<div style="--brand:${S.brands[b] || "#888"};flex:${n};--d:${i}" title="${esc(T("brand.count", { b, n }))}"></div>`).join("");
$("legend").innerHTML = Object.entries(brandCount)
  .map(([b, n]) => `<span style="--brand:${S.brands[b] || "#888"}"><i></i>${esc(b)} <span class="mono">${n}</span></span>`).join("");

/* ---------- timeline ---------- */
const STATE = { main: T("st.main"), active: T("st.active"), away: T("st.away"), retired: T("st.retired") };
const tl = $("timeline");
tl.innerHTML = D.map(d => `
  ${d.chapter ? `<li class="chapter"><span class="dot"></span><span class="item glass">${esc(tx(d.chapter))}</span></li>` : ""}
  <li class="${d.status !== "retired" ? "now" : ""} ${d.giteki ? "giteki" : ""}" style="--brand:${color(d)}">
    <span class="dot"></span>
    <div class="item">
      ${devName(d, "t-name")}<span class="t-maker">${esc(d.maker)}</span>
      <span class="t-state">${STATE[d.status] || ""}</span>
      ${d.note ? `<p class="t-note">${esc(tx(d.note))}</p>` : ""}
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
    $("blogFeatured").innerHTML = `<div class="glass empty reveal">${T("blog.empty")}</div>`;
  } else {
    $("blogFeatured").innerHTML = picks.map((p, i) => U.postCard(p, { big: true, d: i })).join("");
    $("blogLatest").innerHTML = latest.map((p, i) => U.postCard(p, { d: i })).join("");
  }
  U.reveal($("blog"));
});

/* ---------- projects（public: false は出さない） ---------- */
extra.then(() => {
const P = (S.projects || []).filter(p => p.public !== false);
const projCard = (p, i) => {
  const links = [
    p.download ? `<a class="dl" href="${esc(p.download)}" target="_blank" rel="noopener">⬇ ${esc(tx(p.downloadLabel) || T("pj.download"))}</a>` : "",
    p.page ? `<a href="${esc(p.page)}">${T("pj.page")}</a>` : "",
    p.repo ? `<a href="${esc(p.repo)}" target="_blank" rel="noopener">GitHub →</a>` : "",
  ].join("");
  const img = p.image ? `<span class="p-img" style="--bg:url('${esc(p.image).replace(/'/g, "%27")}')"><img src="${esc(p.image)}" alt="" loading="lazy"></span>` : "";
  const tags = (p.tags || []).map(t => `<span class="badge">#${esc(t)}</span>`).join("");
  return `<div class="glass project tilt reveal" style="--d:${i}">
    ${img}
    <h3>${esc(tx(p.name))}${p.version ? ` <small class="p-ver mono">${esc(p.version)}</small>` : ""}</h3>
    <p>${esc(tx(p.desc))}</p>
    ${tags ? `<div class="p-tags">${tags}</div>` : ""}
    <div class="meta">
      <span class="badge ${p.status === "wip" ? "b-wip" : "b-done"}">${T(p.status === "wip" ? "pj.wip" : "pj.done")}</span>
      ${links || `<span class="soon">${T("pj.soon")}</span>`}
    </div>
  </div>`;
};
const done = P.filter(p => p.status !== "wip"), wip = P.filter(p => p.status === "wip");
$("projectWrap").innerHTML =
  (done.length ? `<div class="proj-group reveal">${T("pj.gDone")}</div><div class="projects">${done.map(projCard).join("")}</div>` : "") +
  (wip.length ? `<div class="proj-group reveal">${T("pj.gWip")}</div><div class="projects">${wip.map(projCard).join("")}</div>` : "");
U.reveal($("projects"));
});

U.reveal();
})();
