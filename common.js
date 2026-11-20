/* 全ページ共通：壁紙・ナビ・フローティングボール・コントロールセンター・アニメーション */
(() => {
const S = window.SITE || {};
const root = document.documentElement;
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
const BASE = (document.querySelector('meta[name="site-base"]') || {}).content || "/";

const ICON = {
  bilibili: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="2.5" y="6.5" width="19" height="14" rx="4"/><path d="M7.5 2.8l3 3.4M16.5 2.8l-3 3.4M8.5 12.2v2M15.5 12.2v2"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>',
  discord: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.865-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.74 19.74 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .078-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.009c.12.1.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>',
  wechat: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 3.5C4.9 3.5 1.6 6.3 1.6 9.8c0 2 1.1 3.7 2.8 4.9l-.7 2.2 2.6-1.4c.9.3 1.8.4 2.7.4h.4a5.9 5.9 0 0 1-.2-1.5c0-3.6 3.4-6.5 7.6-6.5h.5C16.6 5.5 13.1 3.5 9 3.5zM6.3 7.4a.95.95 0 1 1 0 1.9.95.95 0 0 1 0-1.9zm5.4 0a.95.95 0 1 1 0 1.9.95.95 0 0 1 0-1.9z"/><path d="M22.4 14.4c0-2.9-2.8-5.2-6.3-5.2s-6.3 2.3-6.3 5.2 2.8 5.2 6.3 5.2c.7 0 1.4-.1 2.1-.3l2.1 1.1-.6-1.8c1.6-1 2.7-2.5 2.7-4.2zm-8.4-1.3a.8.8 0 1 1 0-1.6.8.8 0 0 1 0 1.6zm4.3 0a.8.8 0 1 1 0-1.6.8.8 0 0 1 0 1.6z"/></svg>',
  github: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>',
};

/* ---------- chrome（壁紙・ナビ・ボール・設定パネル）を差し込む ---------- */
const NAV = [["About", "#about"], ["布陣", "#lineup"], ["遍歴", "#history"], ["Blog", "#blog"], ["Projects", "#projects"], ["Follow", "#follow"]];
document.body.insertAdjacentHTML("afterbegin", `
<div class="wall" aria-hidden="true"><div class="blob a"></div><div class="blob b"></div><div class="blob c"></div><div class="blob d"></div></div>
<div class="grain" aria-hidden="true"></div>
<div class="cursor-light" id="cursorLight" aria-hidden="true"></div>
<nav class="top" id="nav"><div class="holder"><div class="bar glass">
  <a class="brand" href="${BASE}">${esc(S.name)}</a>
  <div class="links">${NAV.map(([t, h]) => `<a href="${BASE}${h}" data-sec="${h.slice(1)}">${t}</a>`).join("")}</div>
  <button class="nav-ctl" id="openCC" aria-label="表示設定を開く">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg>
  </button>
  <div class="progress"><i id="scrollProg"></i></div>
</div></div></nav>`);
document.body.insertAdjacentHTML("beforeend", `
<button class="ball glass" id="ball" aria-label="表示設定"><span class="core"></span></button>
<div class="cc-scrim" id="scrim"></div>
<div class="cc glass" id="cc" role="dialog" aria-label="表示設定">
  <h3>コントロールセンター <button class="x" id="closeCC" aria-label="閉じる">✕</button></h3>
  <div class="group"><div class="label">ガラス</div>
    <div class="glass-tiles" data-pref="glass">
      <button class="gt" data-v="frosted"><span class="pv"><i></i></span>すりガラス</button>
      <button class="gt" data-v="clear"><span class="pv"><i></i></span>クリア</button>
      <button class="gt" data-v="liquid"><span class="pv"><i></i></span>リキッド</button>
      <button class="gt" data-v="solid"><span class="pv"><i></i></span>ソリッド</button>
    </div></div>
  <div class="group"><div class="label">ぼかしの強さ</div><input type="range" id="blurK" min="0" max="2" step="0.05"></div>
  <div class="group"><div class="label">壁紙</div>
    <div class="walls" data-pref="wall">
      <button class="wb" data-v="aurora" aria-label="オーロラ" style="background:linear-gradient(135deg,#2fe0a8,#415fff,#b44fff)"></button>
      <button class="wb" data-v="sunset" aria-label="サンセット" style="background:linear-gradient(135deg,#ffb23d,#ff6a3d,#ff3d7f)"></button>
      <button class="wb" data-v="ocean" aria-label="オーシャン" style="background:linear-gradient(135deg,#6be3ff,#2d7dff,#3a3dd8)"></button>
      <button class="wb" data-v="sakura" aria-label="サクラ" style="background:linear-gradient(135deg,#ffc6dc,#ff8fbf,#c79bff)"></button>
      <button class="wb" data-v="mono" aria-label="モノクロ" style="background:linear-gradient(135deg,#d3d6db,#9aa0a9,#5b6068)"></button>
    </div></div>
  <div class="group"><div class="label">テーマ</div>
    <div class="seg" data-pref="theme"><button data-v="auto">自動</button><button data-v="light">ライト</button><button data-v="dark">ダーク</button></div></div>
  <div class="group switch"><span>アニメーション</span><button class="tog" id="animTog" aria-label="アニメーション"></button></div>
</div>
<div class="modal glass" id="modal" role="dialog"></div>
<div class="toast glass" id="toast"></div>`);

/* ---------- prefs ---------- */
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const prefs = { glass: "liquid", wall: "aurora", theme: "auto", blur: 1, anim: reduced ? "off" : "on" };
try { Object.assign(prefs, JSON.parse(localStorage.getItem("prefs") || "{}")); } catch (e) {}
const save = () => { try { localStorage.setItem("prefs", JSON.stringify(prefs)); } catch (e) {} };
function apply() {
  root.dataset.glass = prefs.glass; root.dataset.wall = prefs.wall; root.dataset.anim = prefs.anim;
  if (prefs.theme === "auto") delete root.dataset.theme; else root.dataset.theme = prefs.theme;
  root.style.setProperty("--blur-k", prefs.blur);
  document.querySelectorAll("[data-pref]").forEach(g => g.querySelectorAll("[data-v]").forEach(b =>
    b.setAttribute("aria-pressed", String(b.dataset.v === prefs[g.dataset.pref]))));
  $("blurK").value = prefs.blur;
  $("animTog").setAttribute("aria-pressed", String(prefs.anim === "on"));
}
document.querySelectorAll("[data-pref]").forEach(g => g.addEventListener("click", e => {
  const b = e.target.closest("[data-v]"); if (!b) return;
  prefs[g.dataset.pref] = b.dataset.v; apply(); save();
}));
$("blurK").addEventListener("input", e => { prefs.blur = +e.target.value; apply(); save(); });
$("animTog").addEventListener("click", () => { prefs.anim = prefs.anim === "on" ? "off" : "on"; apply(); save(); });
apply();

/* ---------- modal / toast ---------- */
function toast(msg) {
  const t = $("toast"); t.textContent = msg; t.classList.add("show");
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("show"), 1800);
}
function openModal({ icon, color, title, name, sub, qr, copy, url }) {
  $("modal").innerHTML = `
    ${icon ? `<div class="m-ic" style="background:${color}">${ICON[icon] || ""}</div>` : ""}
    <b style="font-size:17px">${esc(title)}</b>
    ${qr ? `<img src="${esc(qr)}" alt="${esc(title)} QRコード">` : ""}
    ${name ? `<div class="m-name">${esc(name)}</div>` : ""}
    ${sub ? `<div class="m-sub">${esc(sub)}</div>` : ""}
    <div class="m-btns">
      ${url ? `<a class="pill glass" href="${esc(url)}" target="_blank" rel="noopener">開く</a>` : ""}
      ${copy ? `<button class="pill glass" id="mCopy">コピー</button>` : ""}
      <button class="pill glass" id="mClose">閉じる</button>
    </div>`;
  document.body.classList.add("modal-open");
  $("mClose").onclick = closeAll;
  if (copy) $("mCopy").onclick = async () => {
    try { await navigator.clipboard.writeText(copy); toast("コピーしました"); } catch (e) { toast("コピーできませんでした"); }
  };
}
function openCC() { document.body.classList.add("cc-open"); }
function closeAll() { document.body.classList.remove("cc-open", "modal-open"); }
$("openCC").onclick = openCC;
$("closeCC").onclick = closeAll;
$("scrim").onclick = closeAll;
addEventListener("keydown", e => { if (e.key === "Escape") closeAll(); });

/* ---------- reveal ---------- */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add("in");
  e.target.dispatchEvent(new CustomEvent("revealed"));
  io.unobserve(e.target);
}), { threshold: 0, rootMargin: "0px 0px -60px 0px" });
function reveal(scope = document) {
  scope.querySelectorAll(".reveal:not([data-obs])").forEach(el => { el.dataset.obs = 1; io.observe(el); });
}

/* ---------- scroll: nav, progress ---------- */
const nav = $("nav");
const navLinks = [...nav.querySelectorAll(".links a")];
const scrollHooks = [];
function onScroll() {
  const y = scrollY, vh = innerHeight;
  nav.classList.toggle("scrolled", y > 40);
  const max = document.documentElement.scrollHeight - vh;
  $("scrollProg").style.setProperty("--sp", max > 0 ? y / max : 0);
  let cur = "";
  document.querySelectorAll("main section[id]").forEach(s => { if (s.getBoundingClientRect().top < vh * 0.4) cur = s.id; });
  if (document.body.dataset.page === "blog") cur = "blog";
  navLinks.forEach(a => a.classList.toggle("on", a.dataset.sec === cur));
  scrollHooks.forEach(f => f(vh));
}
addEventListener("scroll", onScroll, { passive: true });
addEventListener("resize", onScroll);

/* ---------- tilt + glare + cursor light ---------- */
if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
  document.body.classList.add("has-pointer");
  const cl = $("cursorLight"); let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;
  addEventListener("pointermove", e => { tx = e.clientX; ty = e.clientY; });
  (function loop() {
    cx += (tx - cx) * 0.12; cy += (ty - cy) * 0.12;
    cl.style.transform = `translate(${cx}px, ${cy}px)`;
    requestAnimationFrame(loop);
  })();
  document.addEventListener("pointermove", e => {
    const el = e.target.closest(".tilt"); if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--mx", x * 100 + "%"); el.style.setProperty("--my", y * 100 + "%");
    if (prefs.anim !== "on" || (el.classList.contains("reveal") && !el.classList.contains("in"))) return;
    const k = el.classList.contains("main") || el.classList.contains("big") ? 4 : 8;
    el.style.transform = `perspective(900px) rotateX(${(0.5 - y) * k}deg) rotateY(${(x - 0.5) * k}deg)`;
  });
  document.addEventListener("pointerout", e => {
    const el = e.target.closest(".tilt");
    if (el && !el.contains(e.relatedTarget)) el.style.transform = "";
  });
}

/* ---------- floating ball (draggable) ---------- */
const ball = $("ball");
let drag = null;
ball.addEventListener("pointerdown", e => {
  const r = ball.getBoundingClientRect();
  drag = { dx: e.clientX - r.left, dy: e.clientY - r.top, sx: e.clientX, sy: e.clientY, moved: false };
  ball.setPointerCapture(e.pointerId);
});
ball.addEventListener("pointermove", e => {
  if (!drag) return;
  if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 6) drag.moved = true;
  if (!drag.moved) return;
  ball.classList.add("dragging");
  ball.style.right = "auto"; ball.style.bottom = "auto";
  ball.style.left = (e.clientX - drag.dx) + "px"; ball.style.top = (e.clientY - drag.dy) + "px";
});
ball.addEventListener("pointerup", () => {
  if (!drag) return;
  const moved = drag.moved; drag = null;
  ball.classList.remove("dragging");
  if (!moved) { openCC(); return; }
  const r = ball.getBoundingClientRect();
  ball.style.left = (r.left + r.width / 2 < innerWidth / 2 ? 14 : innerWidth - r.width - 14) + "px";
  ball.style.top = Math.max(80, Math.min(innerHeight - r.height - 14, r.top)) + "px";
});

/* ---------- footer ---------- */
const foot = document.querySelector("footer.foot .inner");
if (foot) foot.innerHTML = `<span>© ${new Date().getFullYear()} ${esc(S.name)}</span>
  <span><a href="${BASE}blog/">Blog</a> · <a href="${BASE}feed.xml">RSS</a>${S.links && S.links.github ? ` · <a href="https://github.com/${esc(S.links.github)}" target="_blank" rel="noopener">GitHub</a>` : ""}</span>`;

/* ---------- ブログ記事一覧を読む（Jekyll が posts.json を生成） ---------- */
let postsCache;
function loadPosts() {
  postsCache = postsCache || fetch(BASE + "posts.json", { cache: "no-cache" })
    .then(r => r.ok ? r.text() : "[]")
    .then(t => { try { const a = JSON.parse(t); return Array.isArray(a) ? a : []; } catch (e) { return []; } })
    .catch(() => []);
  return postsCache;
}
function postCard(p, { big = false, d = 0 } = {}) {
  const tags = (p.tags || []).map(t => `<span class="badge">#${esc(t)}</span>`).join("");
  const cover = big && p.cover ? `<img class="cover" src="${esc(p.cover)}" alt="" loading="lazy">` : "";
  return `<a class="glass post-card tilt reveal ${big ? "big" : ""} ${cover ? "has-cover" : ""}" href="${esc(p.url)}" style="--d:${d}">
    <div style="display:flex;flex-direction:column;gap:8px">
      <div class="p-tags">${p.pinned ? `<span class="badge b-pick">おすすめ</span>` : ""}<span class="p-date mono">${esc(p.date)}</span></div>
      <h3 class="p-title">${esc(p.title)}</h3>
      ${p.excerpt ? `<p class="p-ex">${esc(p.excerpt)}</p>` : ""}
      <div class="p-tags">${tags}<span class="arrow">読む →</span></div>
    </div>${cover}
  </a>`;
}

window.UI = { $, esc, ICON, BASE, prefs, toast, openModal, reveal, onScroll: (f) => scrollHooks.push(f), loadPosts, postCard };
requestAnimationFrame(() => { reveal(); onScroll(); });
})();
