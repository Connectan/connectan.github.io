/* 管理画面（パスワード → 暗号化保存した GitHub トークンを復号 → GitHub API で記事・プロジェクト・お知らせを保存） */
(() => {
"use strict";
if (window.top !== window.self) { document.body.innerHTML = ""; return; } // クリックジャッキング防止

const OWNER = "Connectan", REPO = "connectan.github.io", BRANCH = "main";
const API = "https://api.github.com";
const REPO_API = `${API}/repos/${OWNER}/${REPO}`;
const RAW = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}`;
const VAULT = "admin/vault.json", PROJECTS = "data/projects.json", NEWS = "data/news.json", HOME = "data/home.json";
const ITER = 1000000;                 // PBKDF2 の回数
const IDLE_MS = 30 * 60 * 1000;       // 30分操作がなければロック
const AAD = new TextEncoder().encode("connectan.github.io/admin/v1");
const DEMO = location.hostname === "localhost" && location.search.includes("demo"); // ローカル確認用
const U = window.UI, $ = (id) => document.getElementById(id), esc = U.esc, toast = U.toast;
const today = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

// 旧管理画面がこのブラウザに保存したトークン。初期設定で暗号化して引き継いだら消す
let legacyToken = "";
try { legacyToken = localStorage.getItem("gh_token") || ""; } catch (e) {}
const dropLegacy = () => { try { localStorage.removeItem("gh_token"); } catch (e) {} legacyToken = ""; };

let token = null;   // 復号したトークン（メモリの中だけ）
let vault = null;   // { data, sha }

/* ================= 暗号 ================= */
const rand = (n) => crypto.getRandomValues(new Uint8Array(n));
const toB64 = (u8) => { let s = ""; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); };
const fromB64 = (b) => Uint8Array.from(atob(b.replace(/\s/g, "")), c => c.charCodeAt(0));
async function deriveKey(pw, salt, iter) {
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(pw.normalize("NFKC")), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: iter, hash: "SHA-256" }, base,
    { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}
async function seal(tok, pw) {
  const salt = rand(16), iv = rand(12);
  const key = await deriveKey(pw, salt, ITER);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv, additionalData: AAD }, key,
    new TextEncoder().encode(JSON.stringify({ t: tok }))));
  return { v: 1, kdf: "PBKDF2-SHA256", iter: ITER, cipher: "AES-256-GCM", salt: toB64(salt), iv: toB64(iv), ct: toB64(ct), updated: new Date().toISOString() };
}
async function unseal(data, pw) {
  if (!data || data.v !== 1) throw new Error("vault の形式が違います");
  const key = await deriveKey(pw, fromB64(data.salt), data.iter);
  try {
    const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromB64(data.iv), additionalData: AAD }, key, fromB64(data.ct));
    return JSON.parse(new TextDecoder().decode(pt)).t;
  } catch (e) { throw new Error("パスワードが違います"); }
}
function pwProblem(pw) {
  if (pw.length < 4) return "PIN は4文字以上にしてね（数字だけでもOK）";
  return "";
}

/* ================= GitHub API ================= */
async function ghUrl(url, opts = {}) {
  if (DEMO) return demoApi(url, opts);
  const tok = opts.token || token;
  const headers = { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
  if (tok && !opts.anon) headers.Authorization = "Bearer " + tok;
  if (opts.body) headers["Content-Type"] = "application/json";
  const r = await fetch(url, { method: opts.method || "GET", cache: "no-store", credentials: "omit", referrerPolicy: "no-referrer",
    headers, body: opts.body ? JSON.stringify(opts.body) : undefined });
  if (r.status === 404 && opts.allow404) return null;
  if (!r.ok) {
    const j = await r.json().catch(() => ({}));
    const e = new Error(explain(r.status, j.message || "")); e.status = r.status; throw e;
  }
  return r.status === 204 ? null : r.json();
}
const gh = (path, opts) => ghUrl(REPO_API + path, opts);
function explain(status, msg) {
  if (status === 401) return "GitHub トークンが無効か期限切れです。「設定」→「GitHub トークンを更新」から新しいトークンを入れてね。";
  if (status === 403 && /not accessible/i.test(msg)) return "トークンに書き込み権限がありません。\nトークン作成画面で Repository access に connectan.github.io を選び、Contents を「Read and write」にしてね。";
  if (status === 403 && /rate limit/i.test(msg)) return "GitHub の回数制限に引っかかりました。少し待ってからもう一度。";
  if (status === 404) return "見つかりません（トークンが connectan.github.io にアクセスできない可能性があります）";
  if (status === 409 || status === 422) return "他の場所で同時に更新されたみたい。ページを読み込み直してね。";
  return `${status} ${msg}`;
}
const encPath = (p) => p.split("/").map(encodeURIComponent).join("/");
const getFile = (path, opts = {}) => gh(`/contents/${encPath(path)}?ref=${BRANCH}`, opts);
const putFile = (path, content, message, sha, opts = {}) =>
  gh(`/contents/${encPath(path)}`, { ...opts, method: "PUT", body: { message, content, branch: BRANCH, ...(sha ? { sha } : {}) } });
const delFile = (path, sha, message) =>
  gh(`/contents/${encPath(path)}`, { method: "DELETE", body: { message, sha, branch: BRANCH } });
const b64enc = (str) => toB64(new TextEncoder().encode(str));
const b64dec = (b) => new TextDecoder().decode(fromB64(b));
const blobB64 = (blob) => new Promise((res, rej) => {
  const fr = new FileReader(); fr.onload = () => res(String(fr.result).split(",")[1]); fr.onerror = rej; fr.readAsDataURL(blob);
});
// JSON ファイルの読み書き（保存直前に最新の sha を取り直す）
async function readJSON(path, fallback) {
  const f = await getFile(path, { allow404: true });
  return f ? JSON.parse(b64dec(f.content)) : fallback;
}
async function writeJSON(path, data, message) {
  const f = await getFile(path, { allow404: true });
  await putFile(path, b64enc(JSON.stringify(data, null, 2) + "\n"), message, f && f.sha);
}

// 暗号化したトークンは GitHub には置かず、このブラウザの中だけに保存する（＝トークンを持っている端末でしか開けない）
const LOCAL_VAULT = "connectan-admin-vault-v2", MAX_FAILS = 10;
async function loadVault() {
  let data = null;
  try { data = JSON.parse(localStorage.getItem(LOCAL_VAULT) || "null"); } catch (e) {}
  vault = data ? { data } : null;
  return vault;
}
async function saveVault(data) {
  data.fails = 0;
  localStorage.setItem(LOCAL_VAULT, JSON.stringify(data));
  vault = { data };
}
function forgetDevice() { try { localStorage.removeItem(LOCAL_VAULT); } catch (e) {} vault = null; token = null; }
// PIN を間違えた回数を数えて、MAX_FAILS 回でこの端末からトークンを消す
async function tryUnlock(pin) {
  await loadVault();
  if (!vault) throw new Error("このブラウザにはトークンがありません。ページを読み込み直して、トークンを入れてね");
  try {
    const tok = await unseal(vault.data, pin);
    vault.data.fails = 0; localStorage.setItem(LOCAL_VAULT, JSON.stringify(vault.data));
    return tok;
  } catch (e) {
    const fails = (vault.data.fails || 0) + 1;
    if (fails >= MAX_FAILS) { forgetDevice(); throw new Error(`${MAX_FAILS}回間違えたので、このブラウザからトークンを消しました。ページを読み込み直して、トークンを入れ直してね`); }
    vault.data.fails = fails; localStorage.setItem(LOCAL_VAULT, JSON.stringify(vault.data));
    throw new Error(`PIN が違います（あと ${MAX_FAILS - fails} 回）`);
  }
}

/* ================= 画面 ================= */
const VIEWS = ["vSetup", "vLogin", "vList", "vHome", "vDevices", "vPicks", "vProjects", "vNews", "vSettings", "vEdit"];
function show(v, tab) {
  VIEWS.forEach(id => $(id).hidden = id !== v);
  $("tabs").hidden = !tab;
  document.querySelectorAll("#tabs a").forEach(a => a.classList.toggle("on", a.dataset.tab === tab));
  document.body.classList.toggle("editing", v === "vEdit");
  scrollTo(0, 0);
}
async function busyBtn(btn, fn) {
  btn.disabled = true; const label = btn.textContent;
  try { return await fn(); } finally { btn.disabled = false; btn.textContent = label; }
}
const onEnter = (input, btn) => input.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); btn.click(); } });

// 汎用ダイアログ。data-x を持つボタンの値で resolve
function dialog(html, onOpen) {
  return new Promise(resolve => {
    $("dlgBox").innerHTML = html; $("dlg").hidden = false;
    if (onOpen) onOpen($("dlgBox"));
    $("dlgBox").onclick = (e) => {
      const b = e.target.closest("[data-x]"); if (!b) return;
      const box = $("dlgBox"); $("dlg").hidden = true; resolve({ value: b.dataset.x, box });
    };
  });
}

async function boot() {
  $("app").hidden = false;
  try { await loadVault(); }
  catch (e) { show("vLogin"); $("loginErr").textContent = "GitHub に接続できませんでした: " + e.message; return; }
  if (!vault) {
    show("vSetup");
    if (legacyToken) { $("sToken").value = legacyToken; $("legacyNote").hidden = false; $("sPw1").focus(); }
    return;
  }
  dropLegacy();   // 設定済みなら旧トークンは不要
  show("vLogin"); $("lPw").focus();
}

/* ---- 初期設定 ---- */
$("setupBtn").onclick = () => busyBtn($("setupBtn"), async () => {
  const err = $("setupErr"); err.textContent = "";
  const tok = $("sToken").value.trim(), p1 = $("sPw1").value, p2 = $("sPw2").value;
  if (!/^(github_pat_|ghp_)[A-Za-z0-9_]{20,}$/.test(tok)) { err.textContent = "トークンの形が違うみたい（github_pat_ で始まるもの）"; return; }
  const bad = pwProblem(p1); if (bad) { err.textContent = bad; return; }
  if (p1 !== p2) { err.textContent = "パスワードが一致しません"; return; }
  $("setupBtn").textContent = "暗号化して保存中…";
  try {
    await loadVault();
    if (vault) { err.textContent = "もう設定済みです。ページを読み込み直してログインしてね。"; return; }
    await gh("", { token: tok });
    await saveVault(await seal(tok, p1));
    token = tok; dropLegacy();
    ["sToken", "sPw1", "sPw2"].forEach(id => $(id).value = "");
    toast("設定しました！");
    startIdle(); route();
  } catch (e) { err.textContent = e.message; }
});

/* ---- ログイン ---- */
$("loginBtn").onclick = () => busyBtn($("loginBtn"), async () => {
  $("loginErr").textContent = ""; $("loginBtn").textContent = "確認中…";
  try {
    token = await tryUnlock($("lPw").value);
    $("lPw").value = "";
    startIdle(); route();
  } catch (e) { $("loginErr").textContent = e.message; $("lPw").select(); if (!vault) setTimeout(() => location.reload(), 2500); }
});
onEnter($("lPw"), $("loginBtn"));

/* ---- 自動ロック ---- */
let idleTimer = null, idleBound = false;
function startIdle() {
  const reset = () => { clearTimeout(idleTimer); if (token) idleTimer = setTimeout(lock, IDLE_MS); };
  if (!idleBound) { ["pointerdown", "keydown", "wheel", "touchstart"].forEach(ev => addEventListener(ev, reset, { passive: true })); idleBound = true; }
  reset();
}
function lock() {
  token = null; clearTimeout(idleTimer);
  $("lock").hidden = false; $("uPw").value = ""; $("unlockErr").textContent = ""; $("uPw").focus();
}
$("unlockBtn").onclick = () => busyBtn($("unlockBtn"), async () => {
  $("unlockErr").textContent = ""; $("unlockBtn").textContent = "確認中…";
  try { token = await tryUnlock($("uPw").value); $("uPw").value = ""; $("lock").hidden = true; startIdle(); }
  catch (e) { $("unlockErr").textContent = e.message; if (!vault) setTimeout(() => location.reload(), 2500); }
});
onEnter($("uPw"), $("unlockBtn"));
$("lockBtn").onclick = lock;

/* ---- ルーティング ---- */
function route() {
  if (!token) return;
  const h = decodeURIComponent(location.hash.slice(1));
  if (h === "new") openEditor(null);
  else if (h.startsWith("edit=")) openEditor(h.slice(5));
  else if (h === "settings") show("vSettings", "settings");
  else if (h === "home") openHome();
  else if (h === "devices") openDevices();
  else if (h === "picks") listPicks();
  else if (h === "projects") listProjects();
  else if (h === "news") listNews();
  else listPosts();
}
addEventListener("hashchange", () => {
  if (!$("vEdit").hidden && dirty && !confirm("保存していない変更があります。移動しますか？（書きかけはこのブラウザに残っています）")) return;
  if ((homeDirty || devDirty) && !confirm("トップ／端末の変更がまだ保存されていません。移動すると消えます。いいですか？")) return;
  dirty = false; homeDirty = devDirty = false; route();
});
$("newBtn").onclick = () => { pendingProject = null; location.hash = "new"; };

/* ---- 設定 ---- */
$("changePwBtn").onclick = () => busyBtn($("changePwBtn"), async () => {
  const err = $("changePwErr"); err.className = "err"; err.textContent = "";
  const p0 = $("cPw0").value, p1 = $("cPw1").value, p2 = $("cPw2").value;
  const bad = pwProblem(p1); if (bad) { err.textContent = bad; return; }
  if (p1 !== p2) { err.textContent = "新しいパスワードが一致しません"; return; }
  if (p1 === p0) { err.textContent = "今と同じパスワードです"; return; }
  $("changePwBtn").textContent = "変更中…";
  try {
    const tok = await tryUnlock(p0);
    await saveVault(await seal(tok, p1));
    token = tok;
    ["cPw0", "cPw1", "cPw2"].forEach(id => $(id).value = "");
    err.className = "err ok"; err.textContent = "変更しました。次回から新しいパスワードでログインしてね。";
  } catch (e) { err.textContent = e.message; }
});
$("changeTokBtn").onclick = () => busyBtn($("changeTokBtn"), async () => {
  const err = $("changeTokErr"); err.className = "err"; err.textContent = "";
  const pw = $("tPw").value, tok = $("tToken").value.trim();
  if (!/^(github_pat_|ghp_)[A-Za-z0-9_]{20,}$/.test(tok)) { err.textContent = "トークンの形が違うみたい"; return; }
  $("changeTokBtn").textContent = "更新中…";
  try {
    await tryUnlock(pw);
    await gh("", { token: tok });
    await saveVault(await seal(tok, pw));
    token = tok;
    ["tPw", "tToken"].forEach(id => $(id).value = "");
    err.className = "err ok"; err.textContent = "更新しました。";
  } catch (e) { err.textContent = e.message; }
});
$("forgetBtn").onclick = () => {
  if (!confirm("このブラウザに保存しているトークンを消します。次に開くときはトークンを入れ直す必要があります。いいですか？")) return;
  dirty = false; forgetDevice(); location.reload();
};

/* ================= front matter ================= */
const unq = (s) => {
  s = s.trim();
  if (s.startsWith('"') && s.endsWith('"')) return s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  if (s.startsWith("'") && s.endsWith("'")) return s.slice(1, -1).replace(/''/g, "'");
  return s.replace(/\s+#.*$/, "");
};
function parseFM(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: text };
  const meta = {}; let last = null;
  m[1].split(/\r?\n/).forEach(line => {
    const li = line.match(/^\s+-\s+(.*)$/);
    if (li && last) { (Array.isArray(meta[last]) ? meta[last] : (meta[last] = [])).push(unq(li[1])); return; }
    const kv = line.match(/^([\w-]+):\s*(.*)$/); if (!kv) return;
    last = kv[1]; const v = kv[2].trim();
    if (v.startsWith("[")) meta[last] = v.replace(/^\[|\]\s*(#.*)?$/g, "").split(",").map(unq).filter(Boolean);
    else if (v === "") meta[last] = [];
    else if (/^(true|false)(\s+#.*)?$/.test(v)) meta[last] = v.startsWith("true");
    else meta[last] = unq(v);
  });
  return { meta, body: m[2] };
}
const yq = (s) => '"' + String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, " ") + '"';
const MANAGED = ["title", "tags", "pinned", "cover", "description", "layout", "date", "published"];
function buildFM(m, extra = {}) {
  const L = ["---", `title: ${yq(m.title)}`];
  if (m.tags.length) L.push(`tags: [${m.tags.map(yq).join(", ")}]`);
  if (m.pinned) L.push("pinned: " + (typeof m.pinned === "number" ? m.pinned : "true"));   // 番号（1〜3）はおすすめの順番
  if (m.cover) L.push(`cover: ${yq(m.cover)}`);
  if (m.description) L.push(`description: ${yq(m.description)}`);
  if (m.hidden) L.push("published: false");   // 非公開（サイト・一覧・お知らせ・RSS に出ない）
  for (const [k, v] of Object.entries(extra)) {   // 管理画面が知らない項目（published など）はそのまま残す
    if (MANAGED.includes(k) || !/^[\w-]+$/.test(k)) continue;
    if (typeof v === "boolean") L.push(`${k}: ${v}`);
    else if (Array.isArray(v)) L.push(`${k}: [${v.map(yq).join(", ")}]`);
    else if (v !== "" && v != null) L.push(`${k}: ${yq(v)}`);
  }
  L.push("---");
  return L.join("\n");
}
const toRaw = (s) => String(s || "").split("(/images/").join(`(${RAW}/images/`);
const fromRaw = (s) => String(s || "").split(`${RAW}/images/`).join("/images/");
const rawUrl = (u) => u && u.startsWith("/images/") ? RAW + u : u;

/* ================= 記事一覧 ================= */
let postIndex = [];   // 一覧（お知らせのプレビューにも使う）
async function fetchPosts() {
  const [posts, drafts] = await Promise.all([getFile("_posts", { allow404: true }), getFile("_drafts", { allow404: true })]);
  const files = [...(drafts || []).map(f => ({ ...f, draft: true })), ...(posts || []).map(f => ({ ...f, draft: false }))]
    .filter(f => f.name && f.name.endsWith(".md"));
  const full = await Promise.all(files.map(async f => ({ ...f, meta: parseFM(b64dec((await getFile(f.path)).content)).meta })));
  full.sort((a, b) => (b.draft - a.draft) || b.name.localeCompare(a.name));
  postIndex = full;
  return full;
}
async function listPosts() {
  show("vList", "posts");
  setSelecting(false);
  $("plist").innerHTML = `<div class="glass panel muted">読み込み中…</div>`;
  try {
    const full = await fetchPosts();
    if (!full.length) { $("plist").innerHTML = `<div class="glass panel muted">まだ記事がありません。「＋ 新しい記事」から書けます。</div>`; return; }
    $("plist").innerHTML = full.map(f => {
      const hidden = f.meta.published === false;
      return `<a class="glass pitem tilt" href="#edit=${encodeURIComponent(f.path)}" data-path="${esc(f.path)}">
        <span class="chk"></span>
        ${f.meta.cover ? `<img class="thumb" src="${esc(rawUrl(f.meta.cover))}" alt="" loading="lazy">` : `<span class="thumb"></span>`}
        <div class="t">${esc(f.meta.title || f.name)}<small class="mono">${esc(f.draft ? "下書き" : f.name.slice(0, 10))}</small></div>
        ${f.meta.pinned ? `<span class="badge b-pick">おすすめ${pickNo(f.meta.pinned) ? " " + pickNo(f.meta.pinned) : ""}</span>` : ""}
        <span class="badge ${f.draft || hidden ? "b-wip" : "b-done"}">${f.draft ? "下書き" : hidden ? "非公開" : "公開中"}</span>
      </a>`;
    }).join("");
  } catch (e) { $("plist").innerHTML = `<div class="glass panel err">${esc(e.message)}</div>`; }
}

/* ---- 一覧から選んで削除（1回のコミットでまとめて消す） ---- */
let selecting = false;
const selected = new Set();
function setSelecting(on) {
  selecting = on; selected.clear();
  $("plist").classList.toggle("selecting", on);
  $("plist").querySelectorAll(".pitem.sel").forEach(el => el.classList.remove("sel"));
  $("selBar").hidden = !on; $("selBtn").hidden = on; $("newBtn").hidden = on;
  updateSel();
}
function updateSel() {
  $("selInfo").textContent = selected.size ? `${selected.size} 件を選択中` : "削除する記事をタップして選んでください";
  $("selDel").disabled = !selected.size;
  $("selDel").textContent = selected.size ? `${selected.size} 件を削除する` : "削除する";
}
$("selBtn").onclick = () => setSelecting(true);
$("selCancel").onclick = () => setSelecting(false);
$("plist").addEventListener("click", e => {
  if (!selecting) return;
  const el = e.target.closest(".pitem[data-path]");
  if (!el) return;
  e.preventDefault();
  const p = el.dataset.path;
  if (selected.has(p)) selected.delete(p); else selected.add(p);
  el.classList.toggle("sel", selected.has(p));
  updateSel();
});
$("selDel").onclick = () => busyBtn($("selDel"), async () => {
  const items = postIndex.filter(f => selected.has(f.path));
  if (!items.length) return;
  const names = items.map(f => "・" + (f.meta.title || f.name)).join("\n");
  if (!confirm(`次の ${items.length} 件の記事を削除します。元に戻せません。よろしいですか？\n\n${names}`)) return;
  try {
    await commitFiles(items.map(f => ({ path: f.path, remove: true })),
      items.length === 1 ? `削除: ${items[0].meta.title || items[0].name}` : `記事を ${items.length} 件削除`);
    toast(`${items.length} 件削除しました`);
    setSelecting(false);
    listPosts();
  } catch (e) { toast("削除できませんでした: " + e.message); }
});

/* ================= おすすめ記事（3つまとめて変更） ================= */
// front matter の pinned → 番号（1〜3）。true だけのときは 0（番号なしのおすすめ）
const pickNo = (v) => /^[1-9]$/.test(String(v)) ? +v : 0;
let pickCands = [];
async function listPicks() {
  show("vPicks", "picks");
  $("picksErr").className = "err"; $("picksErr").textContent = "読み込み中…";
  ["pick1", "pick2", "pick3"].forEach(id => $(id).innerHTML = "");
  try {
    const all = await fetchPosts();
    pickCands = all.filter(f => !f.draft && f.meta.published !== false);
    // 今のおすすめ：番号順 → 番号なしは新しい順
    const now = pickCands.filter(f => f.meta.pinned).sort((a, b) => ((pickNo(a.meta.pinned) || 9) - (pickNo(b.meta.pinned) || 9)) || b.name.localeCompare(a.name));
    const opts = `<option value="">（なし）</option>` + pickCands.map(f =>
      `<option value="${esc(f.path)}">${esc(f.name.slice(0, 10))}　${esc(f.meta.title || f.name)}</option>`).join("");
    ["pick1", "pick2", "pick3"].forEach((id, i) => { $(id).innerHTML = opts; $(id).value = now[i] ? now[i].path : ""; });
    $("picksErr").textContent = now.length > 3 ? `今おすすめになっている記事が ${now.length} 個あります。保存すると、ここで選んだ3つだけになります。` : "";
  } catch (e) { $("picksErr").textContent = e.message; }
}
// front matter の pinned 行だけを書き換える（ほかの行や本文はそのまま）
function setPinnedLine(text, no) {
  const m = text.match(/^(---\r?\n)([\s\S]*?)(\r?\n---)/);
  if (!m) return null;
  let lines = m[2].split(/\r?\n/).filter(l => !/^pinned:/.test(l));
  if (no) { const i = lines.findIndex(l => /^title:/.test(l)); lines.splice(i + 1, 0, "pinned: " + no); }
  return m[1] + lines.join("\n") + m[3] + text.slice(m[0].length);
}
// 複数のファイルを1回のコミットでまとめて保存
async function commitFiles(files, message) {
  const ref = await gh(`/git/ref/heads/${BRANCH}`);
  const base = await gh(`/git/commits/${ref.object.sha}`);
  const tree = await gh(`/git/trees`, { method: "POST", body: { base_tree: base.tree.sha,
    tree: files.map(f => f.remove ? { path: f.path, mode: "100644", type: "blob", sha: null }
                                  : { path: f.path, mode: "100644", type: "blob", content: f.content }) } });
  const c = await gh(`/git/commits`, { method: "POST", body: { message, tree: tree.sha, parents: [ref.object.sha] } });
  await gh(`/git/refs/heads/${BRANCH}`, { method: "PATCH", body: { sha: c.sha } });
}
$("picksClear").onclick = () => { ["pick1", "pick2", "pick3"].forEach(id => $(id).value = ""); $("picksErr").textContent = ""; };
$("picksSave").onclick = () => busyBtn($("picksSave"), async () => {
  const err = $("picksErr"); err.className = "err"; err.textContent = "";
  const chosen = ["pick1", "pick2", "pick3"].map(id => $(id).value);
  const picked = chosen.filter(Boolean);
  if (new Set(picked).size !== picked.length) { err.textContent = "同じ記事が2回選ばれています"; return; }
  const want = new Map(); chosen.forEach((p, i) => { if (p) want.set(p, i + 1); });
  $("picksSave").textContent = "保存中…";
  try {
    const files = [];
    for (const f of pickCands) {
      const j = await getFile(f.path);   // 最新の中身を取り直す
      const text = b64dec(j.content);
      const { meta } = parseFM(text);
      const before = meta.pinned ? (pickNo(meta.pinned) || "true") : 0, after = want.get(f.path) || 0;
      if (String(before) === String(after)) continue;
      const next = setPinnedLine(text, after);
      if (next == null) throw new Error(`${f.name} の書式が読めませんでした`);
      files.push({ path: f.path, content: next });
    }
    if (!files.length) { err.className = "err ok"; err.textContent = "変更はありません"; return; }
    const names = chosen.map((p, i) => p ? `${i + 1}. ${(pickCands.find(f => f.path === p).meta.title || p)}` : "").filter(Boolean);
    await commitFiles(files, "おすすめ記事を変更\n\n" + (names.join("\n") || "（なし）"));
    err.className = "err ok"; err.textContent = "保存しました。1〜2分でサイトに反映されます。";
    toast("おすすめ記事を保存しました");
  } catch (e) { err.textContent = "保存できませんでした: " + e.message; }
});

/* ================= エディタ ================= */
let curPick = 0;   // 開いている記事のおすすめ番号（編集画面で保存しても消さない）
let editor = null, cur = null, cover = "", dirty = false, busy = false, extraMeta = {}, pendingProject = null, lastSaved = null;
const isDark = () => document.documentElement.dataset.theme === "dark" ||
  (!document.documentElement.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches);

function makeEditor() {
  const embed = document.createElement("button");
  embed.type = "button"; embed.className = "toastui-editor-toolbar-icons embed-btn"; embed.textContent = "埋め込み";
  embed.onclick = () => {
    const url = (prompt("埋め込みたい X（ツイート）・YouTube・BiliBili・Spotify の URL を貼ってね\n※ 本文に URL だけの行を書いても、記事ページで自動的に埋め込みになります") || "").trim();
    if (!url) return;
    if (!/^https:\/\/(www\.|m\.|mobile\.|music\.)?(x\.com|twitter\.com|youtube\.com|youtu\.be|bilibili\.com|open\.spotify\.com)\//.test(url)) { toast("X・YouTube・BiliBili・Spotify の URL だけ埋め込めます"); return; }
    if (editor.isWysiwygMode()) editor.exec("addLink", { linkUrl: url, linkText: url });
    else editor.insertText("\n\n" + url + "\n\n");
  };
  // note みたいな「大見出し」「小見出し」ボタン
  const hBtn = (label, level, tip) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "toastui-editor-toolbar-icons hbtn"; b.textContent = label; b.title = tip;
    b.onclick = () => { editor.exec("heading", { level }); editor.focus(); };
    return { name: "h" + level, tooltip: tip, el: b };
  };
  // 間違えたときの「戻す」と、やっぱり合ってたときの「進む」
  const histBtn = (label, redo, tip) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "toastui-editor-toolbar-icons hbtn hist-btn"; b.textContent = label; b.title = tip; b.disabled = true;
    b.onclick = () => { histStep(redo); };
    return { name: redo ? "redo" : "undo", tooltip: tip, el: b };
  };
  const undoItem = histBtn("↶ 戻す", false, "ひとつ前に戻す（Ctrl+Z）"), redoItem = histBtn("↷ 進む", true, "戻したのをやり直す（Ctrl+Shift+Z）");
  undoBtn = undoItem.el; redoBtn = redoItem.el;
  editor = new toastui.Editor({
    el: $("editor"), height: "auto", minHeight: "60vh", initialEditType: "wysiwyg", previewStyle: "tab",
    language: "ja-JP", theme: isDark() ? "dark" : "default", usageStatistics: false, hideModeSwitch: false,
    placeholder: "本文を書く…  画像はドラッグ＆ドロップ / 貼り付け / 画像ボタンで入れられます",
    toolbarItems: [[undoItem, redoItem], [hBtn("大見出し", 2, "大見出し（目次に出ます）"), hBtn("小見出し", 3, "小見出し（目次に出ます）"), "heading"], ["bold", "italic", "strike"], ["hr", "quote"], ["ul", "ol"], ["image", "link", "table"],
                   [{ name: "embed", tooltip: "X / YouTube / BiliBili / Spotify を埋め込む", el: embed }], ["code", "codeblock"]],
    hooks: {
      // 貼り付け・画像ボタンから来た画像
      addImageBlobHook: (blob, cb) => {
        hideMask();
        imagePipeline(blob).then(url => { if (url) cb(url, ""); });
        return false;
      },
    },
  });
  editor.on("change", () => { dirty = true; setState(); backupSoon(); if (!$("tocPanel").hidden) renderToc(); updateHist(); });
  // 書き方（Markdown / 見たまま）を切り替えたら、そこを戻せる限界にする
  editor.on("changeMode", () => setTimeout(markHistoryBase, 0));
  // 記事を開いた時点より前（空っぽや、前に開いていた記事）には Ctrl+Z でも戻らないようにする
  $("editor").addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && e.key.toLowerCase() === "z" && !canUndo()) { e.preventDefault(); e.stopPropagation(); }
  }, true);
  // 書式ツールバー（画像・太字など）を画面下の操作バーへ移す → スクロールしても常に手元にある
  const tb = document.querySelector("#editor .toastui-editor-toolbar");
  if (tb) { $("dockTools").appendChild(tb); dispatchEvent(new Event("resize")); }
}

/* ---- 戻す / 進む ---- */
// Toast UI Editor が持っている編集履歴（Ctrl+Z と同じもの）をボタンから使う
let undoBtn = null, redoBtn = null;
const histBase = new WeakMap();   // 書き方ごとに「ここより前には戻らない」位置を覚えておく
const pmView = () => { const m = editor && editor.getCurrentModeEditor(); return m && m.view; };
function histCounts() {
  const v = pmView(); if (!v) return null;
  const p = v.state.plugins.find(p => p.key && p.key.startsWith("history$"));
  const s = p && p.getState(v.state);
  return s ? { v, done: s.done.eventCount, undone: s.undone.eventCount } : null;
}
function canUndo() { const h = histCounts(); return !!h && h.done > (histBase.get(h.v) || 0); }
function canRedo() { const h = histCounts(); return !!h && h.undone > 0; }
function updateHist() {
  if (undoBtn) undoBtn.disabled = !canUndo();
  if (redoBtn) redoBtn.disabled = !canRedo();
}
// 記事を読み込んだ直後などに呼ぶ。今の状態を「戻せる限界」にする
function markHistoryBase() {
  const h = histCounts(); if (h) histBase.set(h.v, h.done);
  updateHist();
}
function histStep(redo) {
  if (redo ? !canRedo() : !canUndo()) return;
  const v = pmView();
  const mac = /Mac|iP(hone|[oa]d)/.test(navigator.platform);
  v.dom.dispatchEvent(new KeyboardEvent("keydown", { key: redo ? "Z" : "z", code: "KeyZ", keyCode: 90,
    shiftKey: redo, metaKey: mac, ctrlKey: !mac, bubbles: true, cancelable: true }));
  updateHist();
}

/* ---- 目次（見出しを自動で読み取る） ---- */
function headings() {
  const out = []; let inCode = false;
  editor.getMarkdown().split("\n").forEach(line => {
    if (/^\s*```/.test(line)) inCode = !inCode;
    const m = !inCode && line.match(/^(#{2,3})\s+(.+?)\s*#*\s*$/);
    if (m) out.push({ level: m[1].length, text: m[2].replace(/[*_`]/g, "") });
  });
  return out;
}
function renderToc() {
  const hs = headings();
  $("tocList").innerHTML = hs.length
    ? hs.map((h, i) => `<li class="h${h.level}"><a data-i="${i}">${esc(h.text)}</a></li>`).join("")
    : `<li class="muted" style="list-style:none;margin-left:-1.2em">まだ見出しがありません。ツールバーの「大見出し」「小見出し」で付けられます。</li>`;
}
$("tocBtn").onclick = () => { const p = $("tocPanel"); p.hidden = !p.hidden; if (!p.hidden) renderToc(); };
$("tocList").onclick = (e) => {
  const a = e.target.closest("[data-i]"); if (!a) return;
  const root = editor.isWysiwygMode() ? document.querySelector(".toastui-editor-ww-container .ProseMirror") : null;
  const el = root && root.querySelectorAll("h2, h3")[+a.dataset.i];
  if (el) { el.scrollIntoView({ behavior: "smooth", block: "center" }); el.animate([{ background: "rgba(255,200,0,.35)" }, { background: "transparent" }], 1200); }
};
addEventListener("pointerdown", (e) => { if (!e.target.closest("#tocPanel,#tocBtn")) $("tocPanel").hidden = true; }, true);

async function openEditor(path) {
  show("vEdit");
  if (!editor) makeEditor();
  cur = null; cover = ""; dirty = false; extraMeta = {}; lastSaved = null; curPick = 0;
  let meta = {}, body = "";
  if (path) {
    if (!/^_(posts|drafts)\/[^/]+\.md$/.test(path)) { location.hash = ""; return; }
    $("state").textContent = "読み込み中…";
    try {
      const j = await getFile(path);
      ({ meta, body } = parseFM(b64dec(j.content)));
      const name = path.split("/").pop().replace(/\.md$/, "");
      const m = name.match(/^(\d{4}-\d{2}-\d{2})-(.*)$/);
      cur = { path, sha: j.sha, draft: path.startsWith("_drafts/"), date: m ? m[1] : today(), slug: m ? m[2] : name, hidden: meta.published === false };
      extraMeta = meta;
      curPick = pickNo(meta.pinned);
    } catch (e) { toast(e.message); location.hash = ""; return; }
  } else if (pendingProject) {
    ({ meta, body } = projectTemplate(pendingProject));
  }
  $("fTitle").value = meta.title || "";
  $("fTags").value = (meta.tags || []).join(", ");
  $("fDate").value = cur ? cur.date : today();
  $("fSlug").value = cur ? cur.slug : (meta.slug || "");
  $("fDesc").value = meta.description || "";
  $("fPinned").setAttribute("aria-pressed", String(!!meta.pinned));
  $("tocPanel").hidden = true;
  setCover(meta.cover ? rawUrl(meta.cover) : "");
  editor.setMarkdown(toRaw(body).trim(), false);
  markHistoryBase();
  $("meta").open = !cur;
  fitTitle(); dirty = false; setState();
  checkBackup(meta, body);
  if (!cur) $("fTitle").focus();
}
// 記事の状態：draft = 下書き（_drafts）/ hidden = 非公開（_posts + published: false）/ public = 公開中
const MODE_LABEL = { new: "新規", draft: "下書き", hidden: "非公開", public: "公開中" };
const curMode = () => !cur ? "new" : cur.draft ? "draft" : cur.hidden ? "hidden" : "public";
function postUrl(c) { return `/blog/${c.date.replace(/-/g, "/")}/${c.slug}/`; }
function setState() {
  const mode = curMode(), published = mode === "public";
  $("state").textContent = MODE_LABEL[mode] + (dirty ? " ・ 未保存" : "");
  const text = editor ? editor.getMarkdown().replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/[#>*`_\-\[\]()]/g, "").replace(/\s+/g, "") : "";
  $("stats").textContent = `${text.length.toLocaleString()}文字・約${Math.max(1, Math.round(text.length / 500))}分` +
    (lastSaved ? `・${lastSaved.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })} 保存` : "");
  $("delBtn").hidden = !cur;
  $("viewBtn").hidden = !published;
  if (published) $("viewBtn").href = postUrl(cur);
  $("draftBtn").textContent = published ? "公開をやめる ▾" : `${MODE_LABEL[mode === "new" ? "draft" : mode]}で保存 ▾`;
  $("pubBtn").textContent = published ? "更新する" : "公開する";
}
function fitTitle() { const t = $("fTitle"); t.style.height = "auto"; t.style.height = t.scrollHeight + "px"; }
$("fTitle").addEventListener("input", () => { fitTitle(); dirty = true; setState(); backupSoon(); });
["fTags", "fDate", "fSlug", "fDesc"].forEach(id => $(id).addEventListener("input", () => { dirty = true; setState(); backupSoon(); }));
$("fTitle").addEventListener("keydown", e => { if (e.key === "Enter" && !e.isComposing) { e.preventDefault(); editor.focus(); } });
$("fPinned").onclick = () => {
  const b = $("fPinned"); b.setAttribute("aria-pressed", String(b.getAttribute("aria-pressed") !== "true")); dirty = true; setState(); backupSoon();
};
$("backBtn").onclick = () => { location.hash = ""; };
addEventListener("beforeunload", e => { if (dirty) { e.preventDefault(); e.returnValue = ""; } });

/* ---- 書きかけの自動バックアップ（このブラウザの中だけ） ---- */
const backupKey = () => "admin-backup:" + (cur ? cur.path : "new");
let backupTimer = null;
function backupSoon() {
  clearTimeout(backupTimer);
  backupTimer = setTimeout(() => {
    try {
      localStorage.setItem(backupKey(), JSON.stringify({
        t: Date.now(), title: $("fTitle").value, md: fromRaw(editor.getMarkdown()), tags: $("fTags").value,
        desc: $("fDesc").value, slug: $("fSlug").value, date: $("fDate").value, cover: fromRaw(cover),
        pinned: $("fPinned").getAttribute("aria-pressed") === "true",
      }));
    } catch (e) {}
  }, 800);
}
function clearBackup(key) { try { localStorage.removeItem(key || backupKey()); } catch (e) {} }
function checkBackup(meta, body) {
  $("restore").hidden = true;
  let b = null; try { b = JSON.parse(localStorage.getItem(backupKey()) || "null"); } catch (e) {}
  if (!b || (b.md.trim() === String(body).trim() && b.title === (meta.title || ""))) return;
  $("restoreTime").textContent = new Date(b.t).toLocaleString("ja-JP");
  $("restore").hidden = false;
  $("restoreYes").onclick = () => {
    $("fTitle").value = b.title; $("fTags").value = b.tags; $("fDesc").value = b.desc; $("fSlug").value = b.slug;
    if (b.date) $("fDate").value = b.date;
    $("fPinned").setAttribute("aria-pressed", String(!!b.pinned));
    setCover(b.cover ? rawUrl(b.cover) : "");
    editor.setMarkdown(toRaw(b.md), false);
    markHistoryBase();
    fitTitle(); dirty = true; setState(); $("restore").hidden = true; toast("書きかけを復元しました");
  };
  $("restoreNo").onclick = () => { clearBackup(); $("restore").hidden = true; };
}

/* ---- 表紙 ---- */
function setCover(url) {
  cover = url;
  $("coverPv").hidden = !url; if (url) $("coverPv").src = url; else $("coverPv").removeAttribute("src");
  $("coverBox").classList.toggle("has", !!url);
  $("coverDel").hidden = $("coverCrop").hidden = !url;
  $("coverBtn").textContent = url ? "🖼 変更" : "🖼 表紙画像を選ぶ";
}
$("coverBtn").onclick = () => $("coverFile").click();
$("coverDel").onclick = () => { setCover(""); dirty = true; setState(); backupSoon(); };
$("coverFile").onchange = async (e) => {
  const f = e.target.files[0]; e.target.value = ""; if (!f) return;
  const url = await imagePipeline(f, { aspect: "1.7778", title: "表紙をトリミング（カードには全体が表示されます）" });
  if (url) { setCover(url); dirty = true; setState(); backupSoon(); }
};
$("coverCrop").onclick = async () => {
  if (!cover) return;
  try {
    const blob = await (await fetch(cover, { cache: "no-store" })).blob();
    const url = await imagePipeline(blob, { aspect: "1.7778", title: "表紙をトリミング", noSkip: true });
    if (url) { setCover(url); dirty = true; setState(); backupSoon(); }
  } catch (e) { toast("この画像は読み込めませんでした。選び直してね"); }
};

/* ================= 画像（トリミング → 縮小 → アップロード） ================= */
async function imagePipeline(file, opts = {}) {
  if (!file || !file.type || !file.type.startsWith("image/") || file.type === "image/svg+xml") { toast("画像ファイルだけ入れられます"); return null; }
  let blob = file;
  if (file.type !== "image/gif") {
    blob = await openCrop(file, opts);
    if (!blob) return null;
  }
  try { return await uploadImage(blob); }
  catch (e) { toast("画像のアップロードに失敗: " + e.message); return null; }
}
async function shrink(blob) {
  if (!/^image\/(jpeg|png|webp|heic|heif)$/.test(blob.type)) return blob;
  try {
    const bmp = await createImageBitmap(blob);
    const k = Math.min(1, 2400 / Math.max(bmp.width, bmp.height));
    if (k === 1 && blob.size < 1.5e6 && !/hei[cf]/.test(blob.type)) return blob;
    const c = document.createElement("canvas");
    c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
    const g = c.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height); g.drawImage(bmp, 0, 0, c.width, c.height);
    return await new Promise(r => c.toBlob(r, "image/jpeg", 0.86));
  } catch (e) { return blob; }
}
async function uploadImage(file) {
  toast("画像をアップロード中…");
  const blob = await shrink(file);
  if (blob.size > 20e6) throw new Error("画像が大きすぎます（20MBまで）");
  const ext = ({ "image/jpeg": "jpg", "image/png": "png", "image/gif": "gif", "image/webp": "webp" })[blob.type] || "jpg";
  const d = new Date(), y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0");
  const path = `images/${y}/${m}/${d.getTime()}-${toB64(rand(6)).replace(/[^a-z0-9]/gi, "").slice(0, 6).toLowerCase()}.${ext}`;
  if (DEMO) { toast("（デモ）画像を挿入"); return URL.createObjectURL(blob); }
  await putFile(path, await blobB64(blob), `画像: ${path}`);
  toast("画像を入れました");
  return `${RAW}/${path}`;
}

/* ---- トリミング UI ---- */
let cropState = null;
function openCrop(blob, { aspect = "free", title = "画像をトリミング", noSkip = false } = {}) {
  return new Promise(async (resolve) => {
    let bmp;
    try { bmp = await createImageBitmap(blob); } catch (e) { resolve(blob); return; }
    const cap = 4000, k = Math.min(1, cap / Math.max(bmp.width, bmp.height));
    let canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * k); canvas.height = Math.round(bmp.height * k);
    canvas.getContext("2d").drawImage(bmp, 0, 0, canvas.width, canvas.height);
    cropState = { canvas, aspect, rotated: false, resolve, blob, rect: null, url: null };
    $("cropTitle").textContent = title;
    $("cropSkip").hidden = noSkip;
    $("crop").hidden = false;
    setAspectButtons(aspect);
    await showCanvas();
  });
}
async function showCanvas() {
  const s = cropState;
  if (s.url) URL.revokeObjectURL(s.url);
  const b = await new Promise(r => s.canvas.toBlob(r, "image/jpeg", 0.92));
  s.url = URL.createObjectURL(b);
  const img = $("cropImg");
  await new Promise(r => { img.onload = r; img.src = s.url; });
  resetRect();
}
function aspectValue() {
  const s = cropState;
  if (s.aspect === "free") return null;
  if (s.aspect === "orig") return s.canvas.width / s.canvas.height;
  return +s.aspect;
}
function resetRect() {
  const img = $("cropImg"), W = img.clientWidth, H = img.clientHeight, a = aspectValue();
  let w = W * 0.9, h = H * 0.9;
  if (a) { if (w / h > a) w = h * a; else h = w / a; }
  cropState.rect = { x: (W - w) / 2, y: (H - h) / 2, w, h };
  drawRect();
}
function drawRect() {
  const r = cropState.rect, el = $("cropRect");
  el.style.left = r.x + "px"; el.style.top = r.y + "px"; el.style.width = r.w + "px"; el.style.height = r.h + "px";
}
function setAspectButtons(v) {
  document.querySelectorAll("#cropAspect [data-v]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.v === v)));
}
$("cropAspect").onclick = (e) => {
  const b = e.target.closest("[data-v]"); if (!b || !cropState) return;
  cropState.aspect = b.dataset.v; setAspectButtons(b.dataset.v); resetRect();
};
$("cropRot").onclick = async () => {
  const s = cropState; if (!s) return;
  const c = document.createElement("canvas"); c.width = s.canvas.height; c.height = s.canvas.width;
  const g = c.getContext("2d"); g.translate(c.width, 0); g.rotate(Math.PI / 2); g.drawImage(s.canvas, 0, 0);
  s.canvas = c; s.rotated = true; await showCanvas();
};
(() => {
  const el = $("cropRect"); let drag = null;
  el.addEventListener("pointerdown", (e) => {
    if (!cropState) return;
    e.preventDefault(); el.setPointerCapture(e.pointerId);
    drag = { h: e.target.dataset.h || "move", sx: e.clientX, sy: e.clientY, r: { ...cropState.rect } };
  });
  el.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const img = $("cropImg"), W = img.clientWidth, H = img.clientHeight, a = aspectValue(), r0 = drag.r, MIN = 40;
    const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
    let { x, y, w, h } = r0;
    if (drag.h === "move") {
      x = Math.min(Math.max(0, r0.x + dx), W - r0.w); y = Math.min(Math.max(0, r0.y + dy), H - r0.h);
    } else {
      const left = drag.h.includes("w"), top = drag.h.includes("n");
      const ax = left ? r0.x + r0.w : r0.x, ay = top ? r0.y + r0.h : r0.y;   // 動かない角
      let px = Math.min(Math.max(0, (left ? r0.x : r0.x + r0.w) + dx), W);
      let py = Math.min(Math.max(0, (top ? r0.y : r0.y + r0.h) + dy), H);
      w = Math.max(MIN, Math.abs(px - ax)); h = Math.max(MIN, Math.abs(py - ay));
      if (a) {
        if (w / h > a) w = h * a; else h = w / a;
        const maxW = left ? ax : W - ax, maxH = top ? ay : H - ay;
        if (w > maxW) { w = maxW; h = w / a; }
        if (h > maxH) { h = maxH; w = h * a; }
      } else {
        w = Math.min(w, left ? ax : W - ax); h = Math.min(h, top ? ay : H - ay);
      }
      x = left ? ax - w : ax; y = top ? ay - h : ay;
    }
    cropState.rect = { x, y, w, h }; drawRect();
  });
  const end = () => { drag = null; };
  el.addEventListener("pointerup", end); el.addEventListener("pointercancel", end);
})();
function closeCrop(result) {
  const s = cropState; if (!s) return;
  $("crop").hidden = true; if (s.url) URL.revokeObjectURL(s.url);
  cropState = null; s.resolve(result);
}
$("cropCancel").onclick = () => closeCrop(null);
$("cropSkip").onclick = async () => {
  const s = cropState; if (!s) return;
  if (!s.rotated) return closeCrop(s.blob);
  closeCrop(await new Promise(r => s.canvas.toBlob(r, "image/jpeg", 0.88)));
};
$("cropOk").onclick = async () => {
  const s = cropState; if (!s) return;
  const img = $("cropImg"), k = s.canvas.width / img.clientWidth, r = s.rect;
  const sx = Math.round(r.x * k), sy = Math.round(r.y * k), sw = Math.round(r.w * k), sh = Math.round(r.h * k);
  const out = document.createElement("canvas"), m = Math.min(1, 2400 / Math.max(sw, sh));
  out.width = Math.round(sw * m); out.height = Math.round(sh * m);
  const g = out.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, out.width, out.height);
  g.drawImage(s.canvas, sx, sy, sw, sh, 0, 0, out.width, out.height);
  closeCrop(await new Promise(res => out.toBlob(res, "image/jpeg", 0.88)));
};
addEventListener("keydown", e => { if (e.key === "Escape" && cropState) closeCrop(null); });

/* ---- ドラッグ＆ドロップ（オーバーレイが残らないように全部ここで処理） ---- */
const mask = $("dropmask");
let maskTimer = null;
function hideMask() { mask.hidden = true; clearTimeout(maskTimer); }
const hasFiles = (e) => [...((e.dataTransfer && e.dataTransfer.types) || [])].includes("Files");
addEventListener("dragover", (e) => {
  if ($("vEdit").hidden || !hasFiles(e)) return;
  e.preventDefault();
  mask.hidden = false;
  clearTimeout(maskTimer); maskTimer = setTimeout(hideMask, 300);   // ドラッグが外れたら自動で消える
}, true);
addEventListener("dragleave", (e) => { if (!e.relatedTarget) hideMask(); }, true);
addEventListener("dragend", hideMask, true);
addEventListener("drop", async (e) => {
  hideMask();
  if ($("vEdit").hidden || !hasFiles(e)) return;
  e.preventDefault(); e.stopPropagation();          // エディタ側の処理と二重にならないように
  const files = [...e.dataTransfer.files].filter(f => f.type.startsWith("image/"));
  if (!files.length) { toast("画像ファイルだけ入れられます"); return; }
  editor.focus();
  for (const f of files) {
    const url = files.length === 1 ? await imagePipeline(f) : await uploadImage(f).catch(err => { toast("アップロード失敗: " + err.message); return null; });
    if (url) editor.exec("addImage", { imageUrl: url, altText: "" });
  }
  hideMask();
}, true);
addEventListener("pointerdown", hideMask, true);
addEventListener("blur", hideMask);

/* ---- 保存・削除 ---- */
// mode: "draft" | "hidden" | "public"
async function save(mode) {
  if (busy || !token) return;
  const title = $("fTitle").value.trim();
  if (!title) { toast("タイトルを入れてね"); $("fTitle").focus(); return; }
  if (curMode() === "public" && mode !== "public" &&
      !confirm(`公開中の記事を${MODE_LABEL[mode]}にします（サイトから消えます）。いいですか？`)) return;
  const asDraft = mode === "draft", hidden = mode === "hidden";
  const date = /^\d{4}-\d{2}-\d{2}$/.test($("fDate").value) ? $("fDate").value : today();
  let slug = $("fSlug").value.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
  if (!slug) slug = "post-" + Date.now().toString(36);
  $("fSlug").value = slug;
  const md = fromRaw(editor.getMarkdown()).trim();
  const text = buildFM({
    title, tags: $("fTags").value.split(/[,、，]/).map(s => s.trim()).filter(Boolean),
    pinned: $("fPinned").getAttribute("aria-pressed") === "true" ? (curPick || true) : false,
    cover: cover ? fromRaw(cover) : "", description: $("fDesc").value.trim(), hidden,
  }, extraMeta) + "\n\n" + md + "\n";
  const path = asDraft ? `_drafts/${slug}.md` : `_posts/${date}-${slug}.md`;
  const oldKey = backupKey();

  busy = true; ["pubBtn", "draftBtn"].forEach(id => $(id).disabled = true);
  try {
    let sha = cur && cur.path === path ? cur.sha : undefined;
    if (!sha) {
      const ex = await getFile(path, { allow404: true });
      if (ex) { if (!confirm("同じURLの記事がもうあります。上書きしますか？")) return; sha = ex.sha; }
    }
    const res = await putFile(path, b64enc(text), `${asDraft ? "下書き" : hidden ? "記事（非公開）" : "記事"}: ${title}`, sha);
    if (cur && cur.path !== path) await delFile(cur.path, cur.sha, `移動: ${title}`);
    cur = { path, sha: res.content.sha, draft: asDraft, date, slug, hidden };
    clearBackup(oldKey); clearBackup();
    dirty = false; lastSaved = new Date(); setState();
    history.replaceState(null, "", "#edit=" + encodeURIComponent(path));
    if (asDraft) toast("下書きを保存しました");
    else if (cur.hidden) toast("非公開で保存しました（サイトには出ません）");
    else {
      const url = postUrl(cur);
      if (pendingProject) {   // プロジェクトの紹介記事なら、プロジェクトにリンクを付ける
        try {
          const list = await readJSON(PROJECTS, []);
          const p = list.find(x => x.id === pendingProject);
          if (p && !p.page) { p.page = url; await writeJSON(PROJECTS, list, `プロジェクト「${p.name}」に紹介記事をリンク`); }
        } catch (e) { toast("プロジェクトへのリンク付けに失敗: " + e.message); }
        pendingProject = null;
      }
      U.openModal({ title: "公開しました 🎉", name: title, sub: "1〜2分でサイトに反映されます", url, copy: location.origin + url });
    }
  } catch (e) { toast("保存できませんでした: " + e.message); }
  finally { busy = false; ["pubBtn", "draftBtn"].forEach(id => $(id).disabled = false); }
}
$("pubBtn").onclick = () => save("public");
// 「保存 ▾」：下書き / 非公開 / 公開 を選んで保存（どの状態からでも行き来できる）
$("draftBtn").onclick = async () => {
  if (busy) return;
  const now = curMode();
  const opt = (x, icon, name, desc) =>
    `<button type="button" class="opt${now === x ? " now" : ""}" data-x="${x}"><span>${icon}</span><div><b>${name}${now === x ? "（今の状態）" : ""}</b><small>${desc}</small></div></button>`;
  const r = await dialog(`
    <h3>どう保存する？</h3>
    ${opt("draft", "📝", "下書き", "書きかけ置き場に保存。サイトには出ません")}
    ${opt("hidden", "🔒", "非公開", "記事として保存。サイト・ブログ一覧・お知らせには出ません")}
    ${opt("public", "🌐", "公開", "サイトに公開します")}
    <div class="row" style="margin-top:12px"><span class="spacer"></span><button class="btn" data-x="">やめる</button></div>`);
  if (r.value) save(r.value);
};
$("delBtn").onclick = async () => {
  if (!cur || !confirm(`「${$("fTitle").value}」を削除します。元に戻せません。よろしいですか？`)) return;
  try { await delFile(cur.path, cur.sha, `削除: ${$("fTitle").value}`); clearBackup(); dirty = false; toast("削除しました"); location.hash = ""; }
  catch (e) { toast("削除できませんでした: " + e.message); }
};
addEventListener("keydown", e => {
  if ((e.ctrlKey || e.metaKey) && e.key === "s" && !$("vEdit").hidden) { e.preventDefault(); const m = curMode(); save(m === "new" ? "draft" : m); }
});

/* ================= プロジェクト ================= */
let projects = [], editing = null;
async function listProjects() {
  show("vProjects", "projects");
  $("projForm").hidden = true; $("ghImport").hidden = true;
  $("projList").innerHTML = `<div class="glass panel muted">読み込み中…</div>`;
  try { projects = await readJSON(PROJECTS, []); renderProjects(); }
  catch (e) { $("projList").innerHTML = `<div class="glass panel err">${esc(e.message)}</div>`; }
}
function renderProjects() {
  if (!projects.length) { $("projList").innerHTML = `<div class="glass panel muted">まだありません。「＋ 追加」か「GitHub から取り込む」でどうぞ。</div>`; return; }
  $("projList").innerHTML = projects.map((p, i) => `
    <div class="glass pitem ${p.public === false ? "off" : ""}">
      ${p.image ? `<img class="thumb" src="${esc(rawUrl(p.image))}" alt="" loading="lazy">` : `<span class="thumb"></span>`}
      <div class="t click" data-edit="${i}">${esc(p.name)}<small>${esc(p.desc || "")}</small></div>
      <span class="badge ${p.status === "wip" ? "b-wip" : "b-done"}">${p.status === "wip" ? "製作中" : "完成"}</span>
      <button class="btn sm glass" data-pub="${i}" title="サイトに出す/出さない">${p.public === false ? "🙈 非公開" : "👀 公開"}</button>
      <button class="btn sm" data-up="${i}" title="上へ" ${i ? "" : "disabled"}>↑</button>
      <button class="btn sm" data-edit="${i}">編集</button>
    </div>`).join("");
}
$("projList").onclick = async (e) => {
  const t = e.target.closest("[data-edit],[data-pub],[data-up]"); if (!t) return;
  if (t.dataset.edit) return openProjForm(+t.dataset.edit);
  const i = +(t.dataset.pub ?? t.dataset.up);
  await busyBtn(t, async () => {
    try {
      projects = await readJSON(PROJECTS, []);
      if (t.dataset.pub !== undefined) {
        const p = projects[i]; p.public = p.public === false;
        await writeJSON(PROJECTS, projects, `プロジェクト「${p.name}」を${p.public ? "公開" : "非公開"}に`);
        toast(p.public ? "公開にしました" : "非公開にしました");
      } else if (i > 0) {
        [projects[i - 1], projects[i]] = [projects[i], projects[i - 1]];
        await writeJSON(PROJECTS, projects, "プロジェクトの並び替え");
      }
      renderProjects();
    } catch (err) { toast(err.message); }
  });
};
function setSeg(id, v) { document.querySelectorAll(`#${id} [data-v]`).forEach(b => b.setAttribute("aria-pressed", String(b.dataset.v === v))); }
const segVal = (id) => (document.querySelector(`#${id} [aria-pressed="true"]`) || {}).dataset?.v;
$("pStatus").onclick = (e) => { const b = e.target.closest("[data-v]"); if (b) setSeg("pStatus", b.dataset.v); };
$("pPublic").onclick = () => {
  const on = $("pPublic").getAttribute("aria-pressed") !== "true";
  $("pPublic").setAttribute("aria-pressed", String(on)); $("pPublicLabel").textContent = on ? "公開" : "非公開";
};
function openProjForm(i, preset) {
  const p = i == null ? (preset || { status: "done", public: true }) : projects[i];
  editing = i == null ? null : i;
  $("pfTitle").textContent = i == null ? "プロジェクトを追加" : "プロジェクトを編集";
  $("pName").value = p.name || ""; $("pRepo").value = p.repo || ""; $("pPage").value = p.page || "";
  $("pDate").value = (p.date || "").replace(/\//g, "-"); $("pDesc").value = p.desc || "";
  $("pTags").value = (p.tags || []).join(", "); $("pVersion").value = p.version || "";
  $("pDl").value = p.download || ""; $("pDlLabel").value = p.downloadLabel || "";
  setProjImg(p.image ? rawUrl(p.image) : "");
  const m = String(p.page || "").match(/^\/blog\/(\d{4})\/(\d{2})\/(\d{2})\/([a-z0-9-]+)\/?$/);
  $("pPostBtn").hidden = !m;
  $("pPostBtn").onclick = () => { if (m) location.hash = "edit=" + encodeURIComponent(`_posts/${m[1]}-${m[2]}-${m[3]}-${m[4]}.md`); };
  setSeg("pStatus", p.status || "done");
  $("pPublic").setAttribute("aria-pressed", String(p.public !== false)); $("pPublicLabel").textContent = p.public !== false ? "公開" : "非公開";
  $("pDel").hidden = i == null;
  $("projForm").hidden = false; $("pName").focus();
  $("projForm").scrollIntoView({ behavior: "smooth", block: "start" });
}
$("newProjBtn").onclick = () => openProjForm(null);

// プロジェクト画像（16:9 でトリミング）
let projImg = "";
function setProjImg(url) {
  projImg = url;
  $("pImgPv").hidden = !url; if (url) $("pImgPv").src = url; else $("pImgPv").removeAttribute("src");
  $("pImgBox").classList.toggle("has", !!url);
  $("pImgDel").hidden = $("pImgCrop").hidden = !url;
  $("pImgBtn").textContent = url ? "🖼 変更" : "🖼 画像を選ぶ";
}
$("pImgBtn").onclick = () => $("pImgFile").click();
$("pImgDel").onclick = () => setProjImg("");
$("pImgFile").onchange = async (e) => {
  const f = e.target.files[0]; e.target.value = ""; if (!f) return;
  const url = await imagePipeline(f, { aspect: "1.7778", title: "プロジェクト画像をトリミング" });
  if (url) setProjImg(url);
};
$("pImgCrop").onclick = async () => {
  if (!projImg) return;
  try {
    const blob = await (await fetch(projImg, { cache: "no-store" })).blob();
    const url = await imagePipeline(blob, { aspect: "1.7778", title: "プロジェクト画像をトリミング", noSkip: true });
    if (url) setProjImg(url);
  } catch (e) { toast("この画像は読み込めませんでした。選び直してね"); }
};
$("pCancel").onclick = () => { $("projForm").hidden = true; };
$("pDel").onclick = () => busyBtn($("pDel"), async () => {
  if (editing == null) return;
  const name = projects[editing].name;
  if (!confirm(`プロジェクト「${name}」を削除しますか？`)) return;
  try {
    projects = await readJSON(PROJECTS, []);
    projects = projects.filter(p => p.name !== name);
    await writeJSON(PROJECTS, projects, `プロジェクト「${name}」を削除`);
    $("projForm").hidden = true; renderProjects(); toast("削除しました");
  } catch (e) { toast(e.message); }
});
const slugify = (s) => String(s).toLowerCase().normalize("NFKC").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
$("pSave").onclick = () => busyBtn($("pSave"), async () => {
  const name = $("pName").value.trim();
  if (!name) { toast("名前を入れてね"); return; }
  const repo = $("pRepo").value.trim();
  if (repo && !/^https:\/\//.test(repo)) { toast("リポジトリは https:// から始まる URL にしてね"); return; }
  try {
    projects = await readJSON(PROJECTS, []);
    const before = editing != null ? projects.find(p => p.id === projects[editing]?.id) || projects[editing] : null;
    const data = {
      id: (before && before.id) || slugify(name) || "p-" + Date.now().toString(36),
      name, status: segVal("pStatus") || "done", public: $("pPublic").getAttribute("aria-pressed") === "true",
      date: $("pDate").value || "", repo, page: $("pPage").value.trim(), desc: $("pDesc").value.trim(),
      tags: $("pTags").value.split(/[,、，]/).map(s => s.trim()).filter(Boolean),
      version: $("pVersion").value.trim(), download: $("pDl").value.trim(), downloadLabel: $("pDlLabel").value.trim(),
      image: projImg ? fromRaw(projImg) : "",
    };
    if (data.download && !/^(https:\/\/|\/)/.test(data.download)) { toast("ダウンロード URL は https:// か / で始めてね"); return; }
    if (!before && projects.some(p => p.id === data.id)) data.id += "-" + Date.now().toString(36).slice(-4);
    const isNew = !before;
    const becameDone = before && before.status === "wip" && data.status === "done";
    const becamePublic = before && before.public === false && data.public;
    if (isNew) projects.unshift(data); else projects[projects.indexOf(before)] = data;
    await writeJSON(PROJECTS, projects, `プロジェクト「${name}」を${isNew ? "追加" : "更新"}`);
    $("projForm").hidden = true; renderProjects(); toast("保存しました");
    if (data.public && (isNew || becameDone || becamePublic)) await followUp(data);
  } catch (e) { toast(e.message); }
});

// 保存したあと「お知らせ」「紹介記事」をまとめて聞く
async function followUp(p) {
  const verb = p.status === "wip" ? "の製作を始めました" : "が完成しました";
  const r = await dialog(`
    <h3>「${esc(p.name)}」を保存しました 🎉</h3>
    <p class="muted">ついでにやる？</p>
    <label class="opt"><input type="checkbox" id="fuNews" ${p.date ? "checked disabled" : "checked"}>
      <div><b>お知らせに出す</b><small>名前の下に「${esc(p.name)}」${verb}、と流れます${p.date ? "（日付が入っているので出ます）" : "（今日の日付を入れます）"}</small></div></label>
    <label class="opt"><input type="checkbox" id="fuBlog" ${p.page ? "" : "checked"}>
      <div><b>紹介記事を書く</b><small>ひな形入りのエディタを開きます。公開すると、このプロジェクトに記事のリンクが自動で付きます</small></div></label>
    <div class="row" style="margin-top:12px"><span class="spacer"></span><button class="btn" data-x="0">何もしない</button><button class="btn primary" data-x="1">OK</button></div>`);
  if (r.value !== "1") return;
  const wantNews = r.box.querySelector("#fuNews").checked && !p.date;
  const wantBlog = r.box.querySelector("#fuBlog").checked;
  if (wantNews) {
    try {
      projects = await readJSON(PROJECTS, []);
      const q = projects.find(x => x.id === p.id); if (q) q.date = today();
      await writeJSON(PROJECTS, projects, `プロジェクト「${p.name}」をお知らせに`);
      renderProjects(); toast("お知らせに出しました");
    } catch (e) { toast(e.message); }
  }
  if (wantBlog) { pendingProject = p.id; projectTplCache = p; location.hash = "new"; }
}
let projectTplCache = null;
function projectTemplate(id) {
  const p = projectTplCache && projectTplCache.id === id ? projectTplCache : projects.find(x => x.id === id) || {};
  return {
    meta: { title: `「${p.name}」を${p.status === "wip" ? "作り始めました" : "作りました"}`, tags: ["プロジェクト"], slug: p.id || "" },
    body: [
      p.desc || "",
      "",
      "## どんなもの？",
      "",
      "（ここに説明）",
      "",
      "## 使い方",
      "",
      "（ここに使い方）",
      "",
      ...(p.repo ? ["## ダウンロード / ソースコード", "", `[GitHub で見る](${p.repo})`, ""] : []),
    ].join("\n"),
  };
}

/* ---- GitHub から取り込む ---- */
$("ghImportBtn").onclick = () => busyBtn($("ghImportBtn"), async () => {
  const box = $("ghImport");
  box.hidden = false; box.innerHTML = `<span class="muted">GitHub のリポジトリを読み込み中…</span>`;
  try {
    projects = await readJSON(PROJECTS, []);
    const repos = (await ghUrl(`${API}/users/${OWNER}/repos?per_page=100&sort=created`))
      .filter(r => !r.fork && r.name.toLowerCase() !== REPO.toLowerCase());
    const have = new Set(projects.map(p => (p.repo || "").toLowerCase().replace(/\/$/, "")));
    const fresh = repos.filter(r => !have.has(r.html_url.toLowerCase()));
    box.innerHTML = `<div class="row"><h3 style="margin:0">GitHub から取り込む</h3><span class="spacer"></span><button class="btn sm" id="ghClose">閉じる</button></div>` +
      (fresh.length ? `<p class="muted">まだサイトに載っていないリポジトリ。押すと、内容が入った状態で追加フォームが開きます。</p><div class="plist">` +
        fresh.map((r, i) => `<div class="pitem glass"><div class="t">${esc(r.name)}<small>${esc(r.description || "説明なし")} ・ ${esc(r.created_at.slice(0, 10))}${r.private ? " ・ 🔒private" : ""}</small></div>
          <button class="btn sm primary" data-gh="${i}">追加</button></div>`).join("") + "</div>"
        : `<p class="muted">新しいリポジトリはありません（全部載っています）。</p>`);
    $("ghClose").onclick = () => { box.hidden = true; };
    box.onclick = (e) => {
      const b = e.target.closest("[data-gh]"); if (!b) return;
      const r = fresh[+b.dataset.gh];
      box.hidden = true;
      openProjForm(null, { name: r.name.replace(/[-_]+/g, " "), repo: r.html_url, desc: r.description || "", status: "done", public: !r.private, date: r.created_at.slice(0, 10) });
    };
  } catch (e) { box.innerHTML = `<span class="err">${esc(e.message)}</span>`; }
});

/* ================= お知らせ ================= */
let news = [];
async function listNews() {
  show("vNews", "news");
  $("nDate").value = today();
  $("newsList").innerHTML = `<div class="glass panel muted">読み込み中…</div>`;
  try {
    news = await readJSON(NEWS, []);
    renderNews();
    renderAutoNews();
  } catch (e) { $("newsList").innerHTML = `<div class="glass panel err">${esc(e.message)}</div>`; }
}
function renderNews() {
  $("newsList").innerHTML = news.length ? news.map((n, i) => `
    <div class="glass pitem"><div class="t">${esc(n.text)}<small class="mono">${esc(n.date)}${n.url ? " ・ " + esc(n.url) : ""}</small></div>
      <button class="btn sm danger" data-del="${i}">削除</button></div>`).join("")
    : `<div class="glass panel muted">手動のお知らせはまだありません。</div>`;
}
async function renderAutoNews() {
  const items = [];
  try { (await readJSON(PROJECTS, [])).forEach(p => p.public !== false && p.date && items.push(`${p.date} ・ 「${p.name}」の${p.status === "wip" ? "製作を始めました" : "完成"}`)); } catch (e) {}
  try {
    const posts = await fetch("/posts.json", { cache: "no-store" }).then(r => r.ok ? r.json() : []).catch(() => []);
    (Array.isArray(posts) ? posts : []).forEach(p => items.push(`${p.date} ・ 「${p.title}」をupしました`));
  } catch (e) {}
  items.sort().reverse();
  $("autoNews").innerHTML = items.length ? items.map(t => `<div class="glass pitem"><div class="t" style="font-weight:400">${esc(t)}</div></div>`).join("")
    : `<div class="glass panel muted">なし</div>`;
}
$("newsList").onclick = async (e) => {
  const b = e.target.closest("[data-del]"); if (!b) return;
  const n = news[+b.dataset.del]; if (!confirm(`「${n.text}」を消しますか？`)) return;
  await busyBtn(b, async () => {
    try {
      news = (await readJSON(NEWS, [])).filter(x => !(x.text === n.text && x.date === n.date));
      await writeJSON(NEWS, news, `お知らせを削除: ${n.text}`); renderNews(); toast("消しました");
    } catch (err) { toast(err.message); }
  });
};
$("nAdd").onclick = () => busyBtn($("nAdd"), async () => {
  const text = $("nText").value.trim(), date = $("nDate").value || today(), url = $("nUrl").value.trim();
  if (!text) { toast("内容を入れてね"); return; }
  if (url && !/^(https:\/\/|\/|#)/.test(url)) { toast("リンクは https:// か / か # で始めてね"); return; }
  try {
    news = await readJSON(NEWS, []);
    news.unshift({ date, text, url });
    await writeJSON(NEWS, news, `お知らせ: ${text}`);
    $("nText").value = ""; $("nUrl").value = ""; renderNews(); toast("追加しました");
  } catch (e) { toast(e.message); }
});

/* ================= トップページ・端末（data/home.json） ================= */
const BUILTIN = { picks: "⭐ おすすめ記事", about: "👋 はじめまして（自己紹介・数字）", lineup: "📱 現在の布陣", history: "🕰 端末遍歴",
  blog: "📝 ブログ", projects: "🧩 プロジェクト", follow: "💬 SNS" };
const W_TYPES = {
  text:  ["📝", "テキスト", "自由な文章（段落・太字・リンク）"],
  links: ["🔗", "リンク集", "ボタンが並ぶ（YouTube チャンネル、note など）"],
  image: ["🖼", "画像", "写真を1枚、大きく"],
  embed: ["▶", "埋め込み", "YouTube・BiliBili・Spotify・X をそのまま再生/表示"],
};
const STATUS = { main: "メイン", active: "現役", away: "出張中", retired: "卒業", recalled: "メーカー回収" };
let homeData = null, homeDirty = false, devDirty = false, wEditing = null, dEditing = null;

async function loadHome() {
  homeData = await readJSON(HOME, null);
  if (!homeData) throw new Error("data/home.json が見つかりません");
  homeData.devices = homeData.devices || []; homeData.layout = homeData.layout || [];
  homeData.brands = homeData.brands || {}; homeData.makers = homeData.makers || [];
  Object.keys(BUILTIN).forEach(id => { if (!homeData.layout.some(l => l.id === id)) homeData.layout.push({ id }); });
}
// 保存：画面で触った部分（keys）だけ最新の home.json に上書きする
async function saveHome(keys, message, btn) {
  await busyBtn(btn, async () => {
    try {
      const latest = await readJSON(HOME, {}) || {};
      keys.forEach(k => { latest[k] = homeData[k]; });
      await writeJSON(HOME, latest, message);
      toast("保存しました（1〜2分でサイトに反映）");
      homeDirty = devDirty = false;
    } catch (e) { toast(e.message); }
  });
  markDirty();   // busyBtn がボタンの文字を戻したあとに付け直す
}
function markDirty() {
  ["homeSave", "devSave"].forEach(id => {
    const d = id === "homeSave" ? homeDirty : devDirty;
    $(id).textContent = d ? "保存（未保存の変更あり）" : "保存";
  });
}
addEventListener("beforeunload", e => { if (homeDirty || devDirty) { e.preventDefault(); e.returnValue = ""; } });

/* ---- 🏠 トップ ---- */
async function openHome() {
  show("vHome", "home");
  $("wForm").hidden = true;
  $("layList").innerHTML = `<div class="glass panel muted">読み込み中…</div>`;
  try {
    await loadHome();
    $("hWords").value = (homeData.rotatingWords || []).join(", ");
    $("hSub").value = homeData.sub || "";
    $("hAbout").value = (homeData.about || []).join("\n\n");
    homeDirty = false; markDirty(); renderLayout();
  } catch (e) { $("layList").innerHTML = `<div class="glass panel err">${esc(e.message)}</div>`; }
}
function renderLayout() {
  const L = homeData.layout;
  $("layList").innerHTML = L.map((it, i) => {
    const w = !BUILTIN[it.id], t = w ? W_TYPES[it.type] || ["❔", "?"] : null;
    const name = w ? `${t[0]} ${esc(it.title || t[1])}` : esc(BUILTIN[it.id]);
    return `<div class="glass pitem ${it.hidden ? "off" : ""}">
      <div class="t ${w ? "click" : ""}" ${w ? `data-wedit="${i}"` : ""}>${name}<small>${w ? "ウィジェット：" + t[1] : "元からあるセクション"}</small></div>
      <button class="btn sm glass" data-hide="${i}">${it.hidden ? "🙈 非表示" : "👀 表示"}</button>
      <button class="btn sm" data-mv="${i}" data-d="-1" ${i ? "" : "disabled"} title="上へ">↑</button>
      <button class="btn sm" data-mv="${i}" data-d="1" ${i < L.length - 1 ? "" : "disabled"} title="下へ">↓</button>
      ${w ? `<button class="btn sm" data-wedit="${i}">編集</button>` : ""}
    </div>`;
  }).join("");
}
$("layList").onclick = (e) => {
  const b = e.target.closest("[data-hide],[data-mv],[data-wedit]"); if (!b) return;
  const L = homeData.layout;
  if (b.dataset.wedit !== undefined) return openWidget(+b.dataset.wedit);
  if (b.dataset.hide !== undefined) { const it = L[+b.dataset.hide]; it.hidden = !it.hidden; if (!it.hidden) delete it.hidden; }
  else { const i = +b.dataset.mv, j = i + +b.dataset.d; if (j < 0 || j >= L.length) return; [L[i], L[j]] = [L[j], L[i]]; }
  homeDirty = true; markDirty(); renderLayout();
};
["hWords", "hSub", "hAbout"].forEach(id => $(id).addEventListener("input", () => { homeDirty = true; markDirty(); }));

$("addWidgetBtn").onclick = async () => {
  const r = await dialog(`<h3>どのウィジェットを追加する？</h3>
    ${Object.entries(W_TYPES).map(([k, [ic, n, d]]) => `<button class="opt" data-x="${k}"><span>${ic}</span><div><b>${n}</b><small>${d}</small></div></button>`).join("")}
    <div class="row" style="margin-top:12px"><span class="spacer"></span><button class="btn" data-x="">やめる</button></div>`);
  if (!r.value) return;
  openWidget(null, r.value);
};
let wImg = "";
function setWImg(url) {
  wImg = url;
  $("wImgPv").hidden = !url; if (url) $("wImgPv").src = url; else $("wImgPv").removeAttribute("src");
  $("wImgBox").classList.toggle("has", !!url); $("wImgDel").hidden = !url;
  $("wImgBtn").textContent = url ? "🖼 変更" : "🖼 画像を選ぶ";
}
function openWidget(i, type) {
  const w = i == null ? { type } : homeData.layout[i];
  wEditing = i;
  $("wForm").dataset.type = w.type;
  $("wfTitle").textContent = `${W_TYPES[w.type][0]} ${W_TYPES[w.type][1]}を${i == null ? "追加" : "編集"}`;
  document.querySelectorAll("#wForm [data-wt]").forEach(el => el.hidden = el.dataset.wt !== w.type);
  $("wTitle").value = w.title || ""; $("wLabel").value = w.label || ""; $("wLead").value = w.lead || "";
  $("wText").value = w.type === "text" ? w.text || "" : ""; $("wCaption").value = w.type === "image" ? w.text || "" : "";
  $("wLinks").value = (w.links || []).map(l => `${l.label} | ${l.url}`).join("\n");
  $("wUrl").value = w.url || "";
  setWImg(w.image ? rawUrl(w.image) : "");
  $("wDel").hidden = i == null;
  $("wForm").hidden = false; $("wTitle").focus();
  $("wForm").scrollIntoView({ behavior: "smooth", block: "start" });
}
$("wImgBtn").onclick = () => $("wImgFile").click();
$("wImgDel").onclick = () => setWImg("");
$("wImgFile").onchange = async (e) => {
  const f = e.target.files[0]; e.target.value = ""; if (!f) return;
  const url = await imagePipeline(f, { title: "ウィジェットの画像をトリミング" });
  if (url) setWImg(url);
};
$("wCancel").onclick = () => { $("wForm").hidden = true; };
$("wDel").onclick = () => {
  if (wEditing == null) return;
  const w = homeData.layout[wEditing];
  if (!confirm(`ウィジェット「${w.title || W_TYPES[w.type][1]}」を消しますか？（「保存」を押すまでサイトは変わりません）`)) return;
  homeData.layout.splice(wEditing, 1);
  $("wForm").hidden = true; homeDirty = true; markDirty(); renderLayout();
};
$("wOk").onclick = () => {
  const type = $("wForm").dataset.type;
  const w = { id: wEditing == null ? "w-" + Date.now().toString(36) : homeData.layout[wEditing].id, type };
  const title = $("wTitle").value.trim(), label = $("wLabel").value.trim(), lead = $("wLead").value.trim();
  if (title) w.title = title; if (label) w.label = label; if (lead) w.lead = lead;
  if (type === "text") { w.text = $("wText").value.trim(); if (!w.text) return toast("本文を入れてね"); }
  if (type === "links") {
    w.links = $("wLinks").value.split("\n").map(l => l.trim()).filter(Boolean).map(l => {
      const k = l.lastIndexOf("|"); const label = k >= 0 ? l.slice(0, k).trim() : "", url = (k >= 0 ? l.slice(k + 1) : l).trim();
      return { label: label || url, url };
    });
    if (!w.links.length) return toast("リンクを1つ以上入れてね");
    const bad = w.links.find(l => !/^(https:\/\/|\/)/.test(l.url)); if (bad) return toast(`「${bad.url}」は https:// か / で始めてね`);
  }
  if (type === "image") { if (!wImg) return toast("画像を選んでね"); w.image = fromRaw(wImg); const c = $("wCaption").value.trim(); if (c) w.text = c; }
  if (type === "embed") {
    w.url = $("wUrl").value.trim();
    if (!/^https:\/\/(www\.|m\.|mobile\.|music\.)?(x\.com|twitter\.com|youtube\.com|youtu\.be|bilibili\.com|open\.spotify\.com)\//.test(w.url)) return toast("YouTube・BiliBili・Spotify・X の URL を入れてね");
  }
  if (wEditing == null) {
    w.hidden = undefined; delete w.hidden;
    const at = homeData.layout.findIndex(l => l.id === "follow");   // 新しいウィジェットは SNS の手前に
    homeData.layout.splice(at < 0 ? homeData.layout.length : at, 0, w);
  } else { if (homeData.layout[wEditing].hidden) w.hidden = true; homeData.layout[wEditing] = w; }
  $("wForm").hidden = true; homeDirty = true; markDirty(); renderLayout();
  toast("並びに入れました。「保存」でサイトに反映");
};
$("homeSave").onclick = () => {
  if (!homeData) return;
  homeData.rotatingWords = $("hWords").value.split(/[,、，]/).map(s => s.trim()).filter(Boolean);
  if (!homeData.rotatingWords.length) return toast("くるくる変わる言葉を1つ以上入れてね");
  homeData.sub = $("hSub").value.trim();
  homeData.about = $("hAbout").value.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean);
  saveHome(["rotatingWords", "sub", "about", "layout"], "トップページを更新", $("homeSave"));
};

/* ---- 📱 端末 ---- */
const slashDate = (d) => String(d || "").replace(/-/g, "/");
async function openDevices() {
  show("vDevices", "devices");
  $("devForm").hidden = true;
  $("devList").innerHTML = `<div class="glass panel muted">読み込み中…</div>`;
  try {
    await loadHome();
    $("dDate").value = String(homeData.lineupDate || "").replace(/\//g, "-");
    $("dMakers").value = homeData.makers.join(", ");
    devDirty = false; markDirty(); renderDevices();
  } catch (e) { $("devList").innerHTML = `<div class="glass panel err">${esc(e.message)}</div>`; }
}
const statusOpts = (v) => Object.entries(STATUS).map(([k, n]) => `<option value="${k}" ${k === v ? "selected" : ""}>${n}</option>`).join("");
function renderDevices() {
  const D = homeData.devices;
  $("devList").innerHTML = D.length ? D.map((d, i) => `
    <div class="glass pitem ${d.status === "retired" || d.status === "recalled" ? "off" : ""}">
      <span class="dot" style="background:${esc(homeData.brands[d.maker] || "#888")}"></span>
      <div class="t click" data-dedit="${i}">${d.chapter ? `<span class="chap">― ${esc(d.chapter)}</span>` : ""}${esc(d.name)}
        <small>${esc(d.maker)}${d.fold ? " ・ 折りたたみ" : ""}${d.giteki ? " ・ 技適あり" : ""}${d.region ? " ・ " + esc(d.region) : ""}${d.note ? " ・ " + esc(d.note) : ""}</small></div>
      <select data-st="${i}" aria-label="状態">${statusOpts(d.status)}</select>
      <button class="btn sm" data-dmv="${i}" data-d="-1" ${i ? "" : "disabled"} title="上へ">↑</button>
      <button class="btn sm" data-dmv="${i}" data-d="1" ${i < D.length - 1 ? "" : "disabled"} title="下へ">↓</button>
      <button class="btn sm" data-dedit="${i}">編集</button>
    </div>`).join("") : `<div class="glass panel muted">まだありません</div>`;
  // ブランド色：端末とメーカー一覧に出てくるメーカー全部
  const makers = [...new Set(D.map(d => d.maker).filter(Boolean))];
  $("dColors").innerHTML = makers.map(m => `<label><input type="color" data-color="${esc(m)}" value="${esc(/^#[0-9a-f]{6}$/i.test(homeData.brands[m] || "") ? homeData.brands[m] : "#888888")}">${esc(m)}</label>`).join("");
  $("dMakerList").innerHTML = makers.map(m => `<option value="${esc(m)}">`).join("");
}
const devChanged = () => { devDirty = true; markDirty(); };
$("devList").addEventListener("change", e => {
  const s = e.target.closest("[data-st]"); if (!s) return;
  const d = homeData.devices[+s.dataset.st];
  if (s.value === "main" && d.status !== "main") {   // メインは1台だけ。前のメインは現役に
    homeData.devices.forEach(x => { if (x !== d && x.status === "main") x.status = "active"; });
  }
  d.status = s.value; devChanged(); renderDevices();
});
$("devList").onclick = (e) => {
  const b = e.target.closest("[data-dmv],[data-dedit]"); if (!b) return;
  if (b.dataset.dedit !== undefined) return openDevForm(+b.dataset.dedit);
  const D = homeData.devices, i = +b.dataset.dmv, j = i + +b.dataset.d; if (j < 0 || j >= D.length) return;
  [D[i], D[j]] = [D[j], D[i]]; devChanged(); renderDevices();
};
$("dColors").addEventListener("input", e => { const c = e.target.closest("[data-color]"); if (c) { homeData.brands[c.dataset.color] = c.value; devChanged(); } });
$("dColors").addEventListener("change", () => renderDevices());
["dDate", "dMakers"].forEach(id => $(id).addEventListener("input", devChanged));
$("dToday").onclick = () => { $("dDate").value = today(); devChanged(); };
const togOn = (id) => $(id).getAttribute("aria-pressed") === "true";
["dFold", "dGiteki"].forEach(id => $(id).onclick = () => $(id).setAttribute("aria-pressed", String(!togOn(id))));
$("dStatus").innerHTML = statusOpts("active");
function openDevForm(i) {
  const d = i == null ? { status: "active", spec: {} } : homeData.devices[i], s = d.spec || {};
  dEditing = i;
  $("dfTitle").textContent = i == null ? "端末を追加" : "端末を編集";
  $("dMaker").value = d.maker || ""; $("dName").value = d.name || ""; $("dStatus").value = d.status || "active";
  $("dRegion").value = d.region || ""; $("dNote").value = d.note || ""; $("dChapter").value = d.chapter || "";
  $("dFold").setAttribute("aria-pressed", String(!!d.fold)); $("dGiteki").setAttribute("aria-pressed", String(!!d.giteki));
  $("dSoc").value = s.soc || ""; $("dYear").value = s.year || ""; $("dCamera").value = s.camera || ""; $("dDisplay").value = s.display || ""; $("dPoint").value = s.point || "";
  $("dDel").hidden = i == null;
  $("devForm").hidden = false; $("dMaker").focus();
  $("devForm").scrollIntoView({ behavior: "smooth", block: "start" });
}
$("newDevBtn").onclick = () => openDevForm(null);
$("dCancel").onclick = () => { $("devForm").hidden = true; };
$("dDel").onclick = () => {
  if (dEditing == null) return;
  const d = homeData.devices[dEditing];
  if (!confirm(`「${d.name}」を消しますか？（卒業ならプルダウンで「卒業」にするのがおすすめ。「保存」を押すまでサイトは変わりません）`)) return;
  homeData.devices.splice(dEditing, 1); $("devForm").hidden = true; devChanged(); renderDevices();
};
$("dOk").onclick = () => {
  const maker = $("dMaker").value.trim(), name = $("dName").value.trim();
  if (!maker || !name) return toast("メーカーと端末名を入れてね");
  const old = dEditing == null ? {} : homeData.devices[dEditing];
  const d = { ...old, maker, name, status: $("dStatus").value };
  const opt = { region: $("dRegion").value.trim(), note: $("dNote").value.trim(), chapter: $("dChapter").value.trim() };
  Object.entries(opt).forEach(([k, v]) => { if (v || k === "note") d[k] = v; else delete d[k]; });
  if (togOn("dFold")) d.fold = true; else delete d.fold;
  if (togOn("dGiteki")) d.giteki = true; else delete d.giteki;
  const spec = { soc: $("dSoc").value.trim(), year: $("dYear").value.trim(), camera: $("dCamera").value.trim(), display: $("dDisplay").value.trim(), point: $("dPoint").value.trim() };
  Object.keys(spec).forEach(k => { if (!spec[k]) delete spec[k]; });
  if (Object.keys(spec).length) d.spec = spec; else delete d.spec;
  if (d.status === "main") homeData.devices.forEach(x => { if (x !== old && x.status === "main") x.status = "active"; });
  if (dEditing == null) homeData.devices.push(d); else homeData.devices[dEditing] = d;
  if (!homeData.brands[maker]) homeData.brands[maker] = "#888888";
  $("devForm").hidden = true; devChanged(); renderDevices();
  toast("一覧に入れました。「保存」でサイトに反映");
};
$("devSave").onclick = () => {
  if (!homeData) return;
  homeData.lineupDate = slashDate($("dDate").value);
  homeData.makers = [...new Set($("dMakers").value.split(/[,、，\n]/).map(s => s.trim()).filter(Boolean))];
  saveHome(["devices", "lineupDate", "makers", "brands"], "端末を更新", $("devSave"));
};

/* ================= デモ（localhost だけ） ================= */
const demoFiles = {
  "data/projects.json": { content: b64enc(JSON.stringify([{ id: "screen-off", name: "画面のみオフ", status: "done", public: true, date: "", repo: "", page: "", desc: "画面だけを消すアプリ。" }])), sha: "p1" },
};
function demoApi(url, opts) {
  if (url === REPO_API) return { full_name: "demo" };
  if (url.includes("/users/")) return [
    { name: "screen-off", html_url: "https://github.com/Connectan/screen-off", description: "画面だけ消す", created_at: "2026-11-01T00:00:00Z", fork: false },
    { name: "spotify-lyrics-sync", html_url: "https://github.com/Connectan/spotify-lyrics-sync", description: "Spotify の歌詞を同期表示", created_at: "2026-11-15T00:00:00Z", fork: false },
  ];
  const p = decodeURIComponent(url.replace(REPO_API + "/contents/", "").replace(/\?.*$/, ""));
  if (opts.method === "PUT") { demoFiles[p] = { content: opts.body.content, sha: "s" + Date.now() }; return { content: { sha: demoFiles[p].sha } }; }
  if (opts.method === "DELETE") { delete demoFiles[p]; return null; }
  if (p === "_posts" || p === "_drafts") return Object.keys(demoFiles).filter(k => k.startsWith(p + "/")).map(k => ({ name: k.split("/").pop(), path: k }));
  if (demoFiles[p]) return { content: demoFiles[p].content, sha: demoFiles[p].sha };
  if (p === HOME) return fetch("/" + HOME, { cache: "no-store" }).then(r => r.text()).then(t => (demoFiles[p] = { content: b64enc(t), sha: "h1" }));
  if (opts.allow404) return null;
  const e = new Error("404"); e.status = 404; throw e;
}

boot();
})();
