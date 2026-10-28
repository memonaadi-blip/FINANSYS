/* =====================================================================
   APP — renders the page from window.SITE (content.js) and wires up
   scroll scenes, interactive app windows, quick-look and the AI chat.
   ===================================================================== */
(() => {
  const S = window.SITE;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const md = s => esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/\*(.+?)\*/g, "<em>$1</em>");
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sleep = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));
  const hash = str => { let h = 2166136261; for (const c of String(str)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  const rng = seed => { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };

  /* ---------- icons ---------- */
  const ICONS = {
    compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
    sparkle: '<path d="M12 3c.6 4.6 2.4 6.4 7 7-4.6.6-6.4 2.4-7 7-.6-4.6-2.4-6.4-7-7 4.6-.6 6.4-2.4 7-7z"/><path d="M19 3v4M17 5h4"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
    columns: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16M15 4v16"/>',
    gallery: '<rect x="3" y="3" width="18" height="13" rx="2"/><path d="M4 20h3M10.5 20h3M17 20h3"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    home: '<path d="M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/>',
    bot: '<rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 4v4M9 13.5h.01M15 13.5h.01M2 14v2M22 14v2"/>',
    folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    play: '<path d="M7 5v14l11-7z" fill="currentColor"/>',
    arrowL: '<path d="m15 18-6-6 6-6"/>',
    arrowR: '<path d="m9 18 6-6-6-6"/>',
    sync: '<path d="M21 12a9 9 0 0 1-15.5 6.2M3 12A9 9 0 0 1 18.5 5.8M18.5 2v4h-4M5.5 22v-4h4"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
    history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
    sliders: '<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>',
    eyeoff: '<path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6 0 9.5 7 9.5 7a17 17 0 0 1-3 3.9M6.6 6.6C3.9 8.4 2.5 12 2.5 12S6 19 12 19a9.6 9.6 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    tag: '<path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
    shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
    wifioff: '<path d="M2 8.8a15 15 0 0 1 4.2-2.6M22 8.8A15 15 0 0 0 10.7 5M5 12.5a10 10 0 0 1 4-2.3M19 12.5a10 10 0 0 0-2.4-1.6M8.5 16a5 5 0 0 1 7 0M12 20h.01M3 3l18 18"/>',
    cursor: '<path d="m4 4 7 17 2.5-7.5L21 11z"/>',
    pointer: '<path d="M4 3l16 7-7 2-2 7z" fill="currentColor"/>',
    chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.7A8 8 0 1 1 21 12z"/>',
    star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    send: '<path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/>',
    check: '<path d="m5 12 5 5L20 7"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  };
  const icon = (n, cls = "") => `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ""}</svg>`;
  const LOGO = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5 3h15.5l-2.2 4H9.4v3.2h7.4l-2.1 3.8H9.4V21L5 18.6z"/></svg>`;
  const logoTile = () => S.brand.mark
    ? `<span class="logo-tile"><img src="${esc(S.brand.mark)}" alt="" width="64" height="64" decoding="async"></span>`
    : `<span class="logo-tile">${LOGO}</span>`;
  const wordmark = () => {
    const [a, b] = S.brand.wordmark || [S.brand.name, ""];
    return `<span class="wordmark" aria-label="${esc(S.brand.name)}"><span class="wm-a">${esc(a)}</span><span class="wm-b">${esc(b)}</span></span>`;
  };
  const underline = () => `<svg class="ul" viewBox="0 0 200 16" preserveAspectRatio="none" aria-hidden="true"><path d="M3 10 C 50 4, 120 3, 197 7"/><path d="M28 14 C 80 10, 140 11, 186 12"/></svg>`;
  const accent = w => `<span class="accent">${esc(w)}${underline()}</span>`;
  const VIEW_IC = { grid: "grid", list: "list", column: "columns", gallery: "gallery" };

  /* =====================================================================
     THUMBNAILS — CSS-drawn previews for each file kind
     ===================================================================== */
  const lines = (r, n, opts = {}) => Array.from({ length: n }, (_, i) =>
    `<i class="ln${opts.g && i === 0 ? " g" : ""}" style="width:${Math.round(45 + r() * 55)}%"></i>`).join("");

  function thumb(f) {
    const r = rng(hash(f.name || f.label || f.symbol || f.kind));
    const ttl = f.label ? `<div class="th-ttl">${esc(f.label)}</div>` : "";
    switch (f.kind) {
      case "chart": {
        const bars = Array.from({ length: 8 }, (_, i) => 22 + r() * 60 + i * 2.5);
        return `<div class="th th-chart">${ttl}<div class="th-k">${(r() * 20 + 4).toFixed(1)}%</div><div class="bars">${bars.map((h, i) => `<i class="${i === 7 ? "last" : ""}" style="height:${Math.min(h, 100)}%"></i>`).join("")}</div></div>`;
      }
      case "pie": {
        const a = 25 + r() * 25, b = a + 15 + r() * 20, c = b + 8 + r() * 15;
        return `<div class="th th-pie">${ttl}<div class="pie" style="background:conic-gradient(var(--gold) 0 ${a}%, var(--blue) 0 ${b}%, var(--ivory) 0 ${c}%, var(--steel) 0)"></div><div class="legend"><i style="background:var(--gold)"></i><i style="background:var(--blue)"></i><i style="background:var(--ivory)"></i></div></div>`;
      }
      case "sheet": {
        const rows = Array.from({ length: 9 }, (_, i) => `<div class="row${i === 0 ? " hd" : i === 8 ? " tot" : ""}">${Array.from({ length: 4 }, () => `<span class="${r() < .12 && i && i < 8 ? "e" : ""}"></span>`).join("")}</div>`).join("");
        return `<div class="th th-sheet">${rows}</div>`;
      }
      case "notice":
        return `<div class="th th-notice"><span class="seal"></span><i class="ln h" style="width:70%;align-self:center"></i>${ttl}${lines(r, 6)}<span class="stamp">NOTICE</span></div>`;
      case "ticker": {
        const up = !String(f.change || "").startsWith("-");
        let y = 30, pts = [];
        for (let i = 0; i <= 10; i++) { y = clamp(y + (r() - (up ? .62 : .38)) * 12, 4, 36); pts.push(`${i * 10},${y.toFixed(1)}`); }
        const col = up ? "var(--up)" : "var(--down)";
        return `<div class="th th-tick"><b>${esc(f.symbol || "TICK")}</b><span class="chg ${up ? "up" : "dn"}">${esc(f.change || "")}</span><svg viewBox="0 0 100 40" preserveAspectRatio="none"><path class="area" d="M${pts.join(" L")} L100,40 L0,40Z" fill="${col}"/><path d="M${pts.join(" L")}" stroke="${col}"/></svg></div>`;
      }
      case "receipt":
        return `<div class="th th-receipt"><i class="ln h" style="width:50%;align-self:center"></i>${lines(r, 7)}<div class="amt">PKR ${Math.round(r() * 900 + 40)},${String(Math.round(r() * 999)).padStart(3, "0")}</div></div>`;
      case "memo":
        return `<div class="th th-memo"><div class="memo-hd">${esc(f.label || "Memo")}</div>${lines(r, 3)}<i class="ln" style="width:0;height:.3em;background:none"></i>${lines(r, 5)}</div>`;
      default: /* statement */
        return `<div class="th th-statement"><i class="ln g" style="width:28%;height:.9em"></i>${ttl}<i class="ln h" style="width:62%"></i>${lines(r, 4)}<div class="th-tbl">${"<i></i>".repeat(15)}</div></div>`;
    }
  }

  /* =====================================================================
     NAV + HERO
     ===================================================================== */
  $("#topnav").innerHTML = `
    <a class="logo" href="#top" aria-label="${esc(S.brand.name)} home">${logoTile()}${wordmark()}</a>
    <div class="nav-r">
      <a class="btn btn-ghost" href="${esc(S.nav.login.href)}">${esc(S.nav.login.label)}</a>
      <a class="btn btn-gold" href="${esc(S.nav.cta.href)}">${logoTile().replace("logo-tile", "logo-tile sm")}${esc(S.nav.cta.label)}</a>
    </div>`;

  /* =====================================================================
     HERO STAGE — one pinned, scroll-scrubbed scene:
     desk + 3D laptop → props fly off → laptop turns away → files burst out
     → top-down desk, heading types in → search demo with landing cards
     ===================================================================== */
  const H = S.hero, ST = S.stage || {};
  const D = S.discover;
  $("#hero").innerHTML = `
    <div class="hero-sticky">
      <div class="scene${ST.heroImage ? " photo" : ""}"${ST.heroImage ? ` style="--hero-img:url('${esc(ST.heroImage)}')"` : ""}>
        <div class="wall"></div><div class="tabletop"></div>
        <div class="scene-shade"></div>
        <div class="scene-dim"></div>
      </div>
      ${ST.heroMode === "video" && ST.heroVideo ? `<div class="video-rig"><canvas class="video-canvas" aria-label="Laptop on a desk at night; as you scroll it turns and documents swirl out"></canvas></div>` : ""}
      ${ST.heroMode === "photo" && ST.heroPhoto ? `
      <div class="photo-rig"><div class="photo-frame">
        <img class="photo-img" src="${esc(ST.heroPhoto.src)}" alt="" decoding="async" fetchpriority="high">
        ${(ST.heroPhoto.covers || []).map(c => `<i class="cover" style="left:${c.box[0] * 100}%;top:${c.box[1] * 100}%;width:${c.box[2] * 100}%;height:${c.box[3] * 100}%;background:${esc(c.bg)};border-radius:${esc(c.round || 0)};filter:blur(${+c.blur || 0}px)"></i>`).join("")}
        <img class="photo-screen" src="${esc(ST.screenImage || "assets/screen-ui.png")}" alt="App preview on the laptop screen">
        <i class="screen-glass"></i>
        <i class="screen-spill"></i>
      </div></div>` : ""}
      <div class="hero-copy">
        <h1>${esc(H.titleLead)} ${accent(H.titleAccent)}</h1>
        ${H.subtitle ? `<p class="hero-sub">${esc(H.subtitle)}</p>` : ""}
        ${H.primary || H.secondary ? `<div class="hero-ctas">
          ${H.primary ? `<a class="btn btn-light btn-lg" href="${esc(H.primary.href)}">${logoTile().replace("logo-tile", "logo-tile sm")}${esc(H.primary.label)}</a>` : ""}
          ${H.secondary ? `<a class="btn btn-dark btn-lg" href="${esc(H.secondary.href)}">${icon("play")}${esc(H.secondary.label)}</a>` : ""}
        </div>` : ""}
      </div>
      <div class="lap-wrap"><div class="lap3d"></div><div class="lap">
        <div class="lid"><div class="lid-screen"><div class="scaler"><div class="win-host"></div></div></div><span class="lid-cam"></span></div>
        <div class="base"><i class="kb"></i><i class="pad"></i></div>
      </div></div>
      <div class="burst" aria-hidden="true"></div>
      <div class="desk-layer${ST.deskImage ? " photo" : ""}"${ST.deskImage ? ` style="--desk-img:url('${esc(ST.deskImage)}')"` : ""}>
        <div class="desk-surface"></div>
        <div class="desk-cards"></div>
        <div class="desk-center"><div class="desk-box">
          <div class="searchbar" role="img" aria-label="Animated search demo">${icon("search")}<span class="q" data-ph="${esc(D.placeholder)}"></span><span class="caret"></span><kbd>⌘K</kbd></div>
          <div class="desk-meta"></div>
          <h2 class="typed"><span class="t1"></span> <span class="accent"><span class="t2"></span>${underline()}</span></h2>
        </div></div>
      </div>
      <div class="scroll-hint"${H.scrollHint ? "" : " hidden"}><i></i>${esc(H.scrollHint || "")}</div>
    </div>`;
  requestAnimationFrame(() => setTimeout(() => $(".hero-copy").classList.add("in"), 150));

  /* =====================================================================
     APP WINDOW COMPONENT
     ===================================================================== */
  const wins = [];
  let activeWin = null;

  function mountWindow(host, cfg) {
    const w = { host, cfg, files: cfg.files || [], view: cfg.view || "grid", sel: 0, played: false, busy: false };
    host.innerHTML = `
      <div class="win">
        <div class="win-bar">
          <span class="lights"><i></i><i></i><i></i></span>
          <span class="win-nav">${icon("arrowL")}${icon("arrowR")}</span>
          <span class="crumb">${icon("folder")} Home <em>/</em> <b>${esc(cfg.folder)}</b></span>
          <span class="vsw">${Object.keys(VIEW_IC).map(v => `<button type="button" data-v="${v}" title="${v[0].toUpperCase() + v.slice(1)} view" aria-label="${v} view">${icon(VIEW_IC[v])}</button>`).join("")}</span>
        </div>
        <div class="win-body">
          <aside class="win-side">
            ${S.app.main.map(m => `<div class="side-i${m.ai ? " ai" : ""}${m.label === (cfg.side || "Portfolio") ? " on" : ""}">${icon(m.icon)}${esc(m.label)}</div>`).join("")}
            <div class="side-lbl">Folders</div>
            ${S.app.folders.map(f => `<div class="side-i${f === cfg.folder ? " on" : ""}">${icon("folder", "fold")}${esc(f)}</div>`).join("")}
          </aside>
          <div class="win-main" tabindex="0" aria-label="Files in ${esc(cfg.folder)}"></div>
          <aside class="win-agent">
            <div class="ag-head">${icon("bot")} Advisor <span class="ag-model">AI · Analyst</span></div>
            <div class="ag-log" aria-live="polite"><div class="ag-empty">Ask anything about the ${w.files.length} files in <b>${esc(cfg.folder)}</b>.</div></div>
            <form class="ag-form"><input type="text" placeholder="Ask about these files…" aria-label="Ask the advisor"><button type="submit" aria-label="Send">${icon("send")}</button></form>
          </aside>
        </div>
      </div>`;
    w.el = $(".win", host);
    w.main = $(".win-main", host);
    w.log = $(".ag-log", host);

    $$(".vsw button", host).forEach(b => b.addEventListener("click", () => { w.view = b.dataset.v; activeWin = w; renderMain(w); }));
    w.main.addEventListener("click", e => {
      const it = e.target.closest("[data-i]"); if (!it) return;
      activeWin = w; select(w, +it.dataset.i);
    });
    w.main.addEventListener("dblclick", e => { const it = e.target.closest("[data-i]"); if (it) openPeek(w.files[+it.dataset.i]); });
    w.main.addEventListener("keydown", e => {
      const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (step) { e.preventDefault(); select(w, clamp(w.sel + step, 0, w.files.length - 1)); }
      if (e.key === "Enter") openPeek(w.files[w.sel]);
    });
    w.el.addEventListener("pointerdown", () => { activeWin = w; });
    $(".ag-form", host).addEventListener("submit", e => {
      e.preventDefault();
      const inp = $("input", e.currentTarget), q = inp.value.trim();
      if (!q || w.busy) return;
      inp.value = ""; ask(w, q);
    });

    renderMain(w);
    wins.push(w);
    return w;
  }

  function renderMain(w) {
    const { files, sel } = w;
    $$(".vsw button", w.el).forEach(b => b.classList.toggle("on", b.dataset.v === w.view));
    w.main.dataset.view = w.view;
    const fileCard = (f, i) => `<div class="file${i === sel ? " sel" : ""}" data-i="${i}" title="${esc(f.name)}">${thumb(f)}<span class="fname">${esc(f.name)}</span></div>`;
    let html = "";
    if (w.view === "grid") {
      html = `<div class="fgrid">${files.map(fileCard).join("")}</div>`;
    } else if (w.view === "list") {
      html = `<table class="flist"><thead><tr><th>Name</th><th>Tag</th><th>Modified</th><th>Size</th></tr></thead><tbody>${files.map((f, i) =>
        `<tr class="${i === sel ? "sel" : ""}" data-i="${i}"><td><span class="mini">${thumb(f)}</span>${esc(f.name)}</td><td><span class="tagc">${esc(f.tag)}</span></td><td>${esc(f.date)}</td><td>${esc(f.size)}</td></tr>`).join("")}</tbody></table>`;
    } else if (w.view === "column") {
      const f = files[sel];
      html = `<div class="fcols">
        <div>${S.app.folders.map(n => `<div class="crow${n === w.cfg.folder ? " on" : ""}">${icon("folder")}<span>${esc(n)}</span></div>`).join("")}</div>
        <div>${files.map((x, i) => `<div class="crow${i === sel ? " on" : ""}" data-i="${i}"><span>${esc(x.name)}</span></div>`).join("")}</div>
        <div class="cprev">${thumb(f)}<b>${esc(f.name)}</b><small>${esc(f.tag)} · ${esc(f.size)} · ${esc(f.date)}</small></div>
      </div>`;
    } else {
      const f = files[sel];
      html = `<div class="fgal"><div class="gal-big">${thumb(f)}<div class="gal-info"><b>${esc(f.name)}</b><span>${esc(f.tag)}</span><span>${esc(f.date)} · ${esc(f.size)}</span></div></div><div class="gal-strip">${files.map(fileCard).join("")}</div></div>`;
    }
    w.main.innerHTML = html;
    if (!reduce) { w.main.classList.remove("swap"); void w.main.offsetWidth; w.main.classList.add("swap"); }
  }

  function select(w, i) {
    w.sel = i;
    if (w.view === "column" || w.view === "gallery") { renderMain(w); w.main.classList.remove("swap"); }
    else $$("[data-i]", w.main).forEach(el => el.classList.toggle("sel", +el.dataset.i === i));
    const cur = $(`[data-i="${i}"]`, w.main);
    if (cur && w.view !== "column") cur.scrollIntoView({ block: "nearest", inline: "nearest" });
  }

  /* ---------- advisor chat ---------- */
  function addMsg(w, who, html) {
    const empty = $(".ag-empty", w.log); if (empty) empty.remove();
    const d = document.createElement("div");
    d.className = `msg ${who}`; d.innerHTML = html; w.log.append(d);
    w.log.scrollTop = w.log.scrollHeight;
    return d;
  }
  function scanFiles(w, names, on) {
    const idx = names.map(n => w.files.findIndex(f => f.name === n)).filter(i => i >= 0);
    $$("[data-i]", w.main).forEach(el => el.classList.toggle("scan", on && idx.includes(+el.dataset.i)));
  }
  async function think(w, steps, cites = []) {
    const ul = document.createElement("ul"); ul.className = "steps";
    addMsg(w, "bot", "").append(ul);
    scanFiles(w, cites, true);
    for (const s of steps) {
      const li = document.createElement("li");
      li.innerHTML = `<span class="spin"></span>${icon("check", "ok")}<span>${esc(s)}</span>`;
      ul.append(li); w.log.scrollTop = w.log.scrollHeight;
      await sleep(650);
      li.classList.add("done");
    }
    scanFiles(w, cites, false);
  }
  async function stream(w, text, cites = []) {
    const d = addMsg(w, "bot", "");
    const words = text.split(" ");
    for (let i = 0; i < words.length; i++) {
      d.textContent = words.slice(0, i + 1).join(" ").replace(/\*/g, "");
      w.log.scrollTop = w.log.scrollHeight;
      await sleep(26);
    }
    d.innerHTML = md(text);
    if (cites.length) {
      const c = document.createElement("div"); c.className = "cites";
      c.innerHTML = cites.map(n => `<button type="button" class="cite" title="Open ${esc(n)}">${esc(n)}</button>`).join("");
      c.addEventListener("click", e => {
        const b = e.target.closest(".cite"); if (!b) return;
        const i = w.files.findIndex(f => f.name === b.textContent);
        if (i >= 0) { select(w, i); openPeek(w.files[i]); }
      });
      d.append(c);
    }
    w.log.scrollTop = w.log.scrollHeight;
  }
  async function play(w) {
    const a = w.cfg.agent; if (!a || w.played) return;
    w.played = true; w.busy = true;
    await sleep(400);
    addMsg(w, "user", esc(a.prompt));
    await sleep(500);
    await think(w, a.steps, a.cites);
    await stream(w, a.answer, a.cites);
    w.busy = false;
  }
  async function ask(w, q) {
    w.busy = true;
    addMsg(w, "user", esc(q));
    const low = q.toLowerCase();
    const hit = S.agentReplies.find(r => r.match.some(k => low.includes(k)));
    await think(w, [`Searching ${w.files.length} files in ${w.cfg.folder}`, "Cross-checking figures"]);
    await stream(w, hit ? hit.reply : S.agentFallback);
    w.busy = false;
  }

  /* ---------- quick look (space bar) ---------- */
  const peek = $("#peek");
  let lastFocus = null;
  function openPeek(f) {
    if (!f) return;
    lastFocus = document.activeElement;
    peek.innerHTML = `
      <div class="peek-card" role="dialog" aria-modal="true" aria-label="Preview of ${esc(f.name)}">
        <div class="peek-bar"><b>${esc(f.name)}</b><button type="button" class="peek-x" aria-label="Close preview">${icon("x")}</button></div>
        <div class="peek-body">
          <div class="peek-thumb">${thumb(f)}</div>
          <dl><dt>Type</dt><dd>${esc(f.kind)}</dd><dt>Tag</dt><dd>${esc(f.tag)}</dd><dt>Modified</dt><dd>${esc(f.date)}</dd><dt>Size</dt><dd>${esc(f.size)}</dd><dt>AI access</dt><dd>${icon("check")} Visible</dd></dl>
        </div>
        <div class="peek-hint"><kbd>Space</kbd> or <kbd>Esc</kbd> to close · <kbd>Enter</kbd> on a file to preview</div>
      </div>`;
    peek.hidden = false;
    requestAnimationFrame(() => peek.classList.add("open"));
    $(".peek-x", peek).focus();
  }
  function closePeek() {
    if (peek.hidden) return;
    peek.classList.remove("open");
    setTimeout(() => { peek.hidden = true; peek.innerHTML = ""; }, 200);
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }
  peek.addEventListener("click", e => { if (e.target === peek || e.target.closest(".peek-x")) closePeek(); });
  const inView = el => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; };
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") return closePeek();
    if (e.key !== " " && e.code !== "Space") return;
    if (e.target.closest("input, textarea, [contenteditable]")) return;
    if (!peek.hidden) { e.preventDefault(); return closePeek(); }
    if (activeWin && inView(activeWin.el)) { e.preventDefault(); openPeek(activeWin.files[activeWin.sel]); }
  });

  /* mount hero window */
  const heroWin = mountWindow($(".win-host", $("#hero")), S.heroWindow);

  /* ---------- desk search cards ----------
     Each group = its curated cards from content.js, topped up with on-topic fillers to
     D.density (desktop / phone). Cards sit on a jittered grid that covers the whole desk,
     spill past the edges, and leave the centre clear for the search bar + heading. */
  const FILL = D.fill || {};
  const density = innerWidth < 720 ? (D.density && D.density.phone) || 22 : (D.density && D.density.desktop) || 48;
  const groupCards = D.groups.map((g, gi) => {
    const pool = FILL[gi] || FILL.default || [{ kind: "statement" }];
    const r = rng(hash("fill" + gi));
    const out = g.cards.slice(0, density);
    while (out.length < density) out.push({ ...pool[Math.floor(r() * pool.length)] });
    return out;
  });
  const totalHits = g => groupCards[g].length;
  const deskCards = $(".desk-cards");
  function deskSlots(n, seed) {
    const r = rng(hash(seed));
    const aspect = innerWidth / innerHeight;
    // clear zone for the search bar + heading, padded by roughly half a card so card edges stay out of it
    const padX = 7 * 1440 / Math.max(innerWidth, 360), padY = 10 * 860 / Math.max(innerHeight, 500);
    const zone = { x0: 26 - padX, x1: 74 + padX, y0: 31 - padY, y1: 69 + padY };
    const free = 1 - ((zone.x1 - zone.x0) / 108) * ((zone.y1 - zone.y0) / 112);
    const total = n / Math.max(free, .3) * 1.12;                     // enough cells outside the zone for every card
    let cols = Math.max(4, Math.round(Math.sqrt(total * aspect))), rows = Math.max(4, Math.ceil(total / cols));
    const cells = [];
    for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) {
      const cx = -4 + (col + .5) * (108 / cols), cy = -6 + (row + .5) * (112 / rows);
      const inCentre = cx > zone.x0 && cx < zone.x1 && cy > zone.y0 && cy < zone.y1;
      if (!inCentre) cells.push({ cx, cy, w: 108 / cols, h: 112 / rows, k: r() });
    }
    while (cells.length < n) cells.push({ ...cells[cells.length % Math.max(cells.length, 1)], k: r() });   // safety: reuse edge cells, never the centre
    cells.sort((p, q) => p.k - q.k);                                  // random pick when there are spare cells
    return cells.slice(0, n).map(c => {
      let x = c.cx + (r() - .5) * c.w * .7, y = c.cy + (r() - .5) * c.h * .7;
      // jitter must not push a card back into the clear zone
      if (x > zone.x0 && x < zone.x1 && y > zone.y0 && y < zone.y1) { x = c.cx; y = c.cy; }
      return { x, y };
    });
  }
  groupCards.forEach((cards, gi) => {
    const r = rng(hash("desk" + gi)), slots = deskSlots(cards.length, "slots" + gi);
    cards.forEach((c, i) => {
      const s = slots[i] || { x: r() * 100, y: r() * 100 };
      const el = document.createElement("div");
      el.className = "dcard"; el.dataset.g = gi;
      const w = c.kind === "ticker" || c.kind === "chart" ? 132 + r() * 34 : 104 + r() * 40;
      el.style.cssText = `left:${s.x.toFixed(2)}%;top:${s.y.toFixed(2)}%;--w:${w.toFixed(0)}px;--r:${((r() - .5) * 30).toFixed(1)}deg;--d:${Math.min(i * 22, 900)}ms;z-index:${Math.round(r() * 20)}`;
      el.innerHTML = thumb({ ...c, name: `desk-${gi}-${i}` });
      deskCards.append(el);
    });
  });
  const deskLayer = $(".desk-layer"), deskBox = $(".desk-box"), deskQ = $(".q", deskLayer), deskMeta = $(".desk-meta"), deskH = $(".typed", deskLayer);
  const t1 = $(".t1", deskH), t2 = $(".t2", deskH);
  let deskKey = "";
  function updateDesk(dp, active) {
    const G = D.groups.length, x = dp * G, band = Math.min(G - 1, Math.floor(x)), t = band === G - 1 ? Math.min(1, x - band) : x - band;
    const q = D.groups[band].query || "";
    const typed = band === 0 ? 0 : Math.round(clamp(t * 2.4, 0, 1) * q.length);
    deskQ.textContent = q.slice(0, typed);
    const ready = active && (band === 0 || typed >= q.length);
    const key = band + ":" + ready;
    if (key === deskKey) return;
    deskKey = key;
    $$(".dcard", deskCards).forEach(c => c.classList.toggle("on", ready && +c.dataset.g === band));
    deskH.classList.toggle("off", band !== 0);
    const cap = D.groups[band] && D.groups[band].caption;
    // each typed line gets its own short caption (content.js → discover.groups[n].caption); falls back to a match count
    deskMeta.innerHTML = band && ready ? (cap ? cap.map((t, k) => k ? `<span class="dot">·</span>${esc(t)}` : `<b>${esc(t)}</b>`).join("") : `<b>${totalHits(band)} matches</b> · ${esc(D.indexed)}`) : "";
  }

  /* ---------- file burst out of the laptop screen ---------- */
  const burst = $(".burst");
  const KINDS = ["statement", "chart", "sheet", "ticker", "pie", "notice", "memo", "receipt"];
  const SYMS = ["NVLT", "PKCEM", "AGRI5", "GILT27", "MERIDN", "TXT10"];
  const parts = Array.from({ length: innerWidth < 720 ? 40 : 72 }, (_, i) => {
    const r = rng(hash("burst" + i));
    const el = document.createElement("div");
    el.className = "bc";
    const kind = KINDS[i % KINDS.length];
    el.style.width = `${Math.round(60 + r() * 70)}px`;
    el.innerHTML = thumb({ kind, name: "b" + i, symbol: SYMS[i % SYMS.length], change: r() > .3 ? "+1.2%" : "-0.6%" });
    burst.append(el);
    return { el, d: r() * .55, ex: -.25 + r() * .8, ey: .45 + r() * .75, cx: -.15 + r() * .35, cy: .1 + r() * .35, s: 1.4 + r() * 1.8, spin: (r() - .5) * 220, last: "" };
  });

  const heroEl = $("#hero"), lap = $(".lap"), lid = $(".lid"), heroCopy = $(".hero-copy"), sceneDim = $(".scene-dim"), hint = $(".scroll-hint"), wall = $(".scene .wall");

  /* ---------- photographed laptop: fit the photo, map the app onto its screen ---------- */
  const PH = ST.heroMode === "photo" ? ST.heroPhoto : null;
  const rig = PH && $(".photo-rig"), frame = PH && $(".photo-frame");
  let screenCentre = null;                                   // in frame px
  // 3×3 homography helpers (maps the unit rect of an element onto any quad → CSS matrix3d)
  const adj = m => [m[4] * m[8] - m[5] * m[7], m[2] * m[7] - m[1] * m[8], m[1] * m[5] - m[2] * m[4], m[5] * m[6] - m[3] * m[8], m[0] * m[8] - m[2] * m[6], m[2] * m[3] - m[0] * m[5], m[3] * m[7] - m[4] * m[6], m[1] * m[6] - m[0] * m[7], m[0] * m[4] - m[1] * m[3]];
  const mm = (a, b) => { const c = []; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { let v = 0; for (let k = 0; k < 3; k++) v += a[3 * i + k] * b[3 * k + j]; c[3 * i + j] = v; } return c; };
  const mv = (m, v) => [m[0] * v[0] + m[1] * v[1] + m[2] * v[2], m[3] * v[0] + m[4] * v[1] + m[5] * v[2], m[6] * v[0] + m[7] * v[1] + m[8] * v[2]];
  const basis = p => { const m = [p[0][0], p[1][0], p[2][0], p[0][1], p[1][1], p[2][1], 1, 1, 1]; const v = mv(adj(m), [p[3][0], p[3][1], 1]); return mm(m, [v[0], 0, 0, 0, v[1], 0, 0, 0, v[2]]); };
  function quadTransform(w, h, tl, tr, br, bl) {
    const t = mm(basis([tl, tr, bl, br]), adj(basis([[0, 0], [w, 0], [0, h], [w, h]])));
    const n = t.map(x => x / t[8]);
    return `matrix3d(${[n[0], n[3], 0, n[6], n[1], n[4], 0, n[7], 0, 0, 1, 0, n[2], n[5], 0, n[8]].map(x => +x.toFixed(10)).join(",")})`;
  }
  function layoutPhoto() {
    if (!PH) return;
    const vw = innerWidth, vh = innerHeight, L = PH.laptop, span = L.bottom - L.top;
    let H = Math.min(1.56 * vh, 2.3 * vw) / PH.ratio;
    const copyBottom = heroCopy.offsetTop + heroCopy.offsetHeight;
    const top = Math.max(copyBottom + 18, vh * .34);
    H = Math.min(H, (vh - 64 - top) / span);                // whole laptop visible above the section nav
    const W = H * PH.ratio;
    Object.assign(frame.style, { width: `${W}px`, height: `${H}px`, left: `${vw / 2 - L.centerX * W}px`, top: `${top - L.top * H}px` });
    const q = PH.screen.map(([x, y]) => [x * W, y * H]);
    const sw = 1000, sh = 625, tf = quadTransform(sw, sh, q[0], q[1], q[2], q[3]);
    [$(".photo-screen", frame), $(".screen-glass", frame)].forEach(el => { el.style.width = `${sw}px`; el.style.height = `${sh}px`; el.style.transform = tf; });
    const kb = PH.keyboard;
    Object.assign($(".screen-spill", frame).style, { left: `${kb[0] * W}px`, top: `${kb[1] * H}px`, width: `${kb[2] * W}px`, height: `${kb[3] * H}px` });
    screenCentre = { x: (q[0][0] + q[1][0] + q[2][0] + q[3][0]) / 4, y: (q[0][1] + q[1][1] + q[2][1] + q[3][1]) / 4 };
    frame.style.transformOrigin = `${screenCentre.x}px ${screenCentre.y}px`;
  }
  if (PH) { heroEl.classList.add("photo-mode"); layoutPhoto(); addEventListener("resize", () => { layoutPhoto(); onScroll(); }); }

  /* ---------- scroll-scrubbed brand film (stage.heroMode "video") ---------- */
  const HV = ST.heroMode === "video" ? ST.heroVideo : null;
  const vrig = HV && $(".video-rig"), vcan = HV && $(".video-canvas"), vctx = HV && vcan.getContext("2d");
  const frames = HV ? new Array(HV.count) : [];
  let vFrame = 0, vTarget = 0, vRaf = 0, vDrawn = -1, vFit = null;
  // the shown frame glides toward the scroll-driven target (frame-rate independent), so fast wheel flicks don't skip frames
  let vLast = 0;
  function vStep(now) {
    vRaf = 0;
    const dt = Math.min(64, now - (vLast || now - 16)); vLast = now;
    const k = reduce ? 1 : 1 - Math.exp(-dt / 70), d = vTarget - vFrame;
    vFrame = Math.abs(d) < .004 ? vTarget : vFrame + d * k;
    drawVideo(false);
    if (vFrame !== vTarget) vRaf = requestAnimationFrame(vStep); else vLast = 0;
  }
  if (HV) {
    heroEl.classList.add("video-mode");
    // pick the frame set for this screen: the 1920px set on large / high-DPI screens, the 1024px set on phones
    const setW = innerWidth * Math.min(devicePixelRatio || 1, 2) > 1300 ? 1920 : 1024;
    const url = i => HV.frames.replace("{w}", setW).replace("{n}", String(i + 1).padStart(3, "0"));
    const load = i => new Promise(res => {
      if (frames[i]) return res();
      const im = new Image();
      im.decoding = "async";
      const done = src => { frames[i] = src; if (Math.abs(i - vFrame) < 3) drawVideo(true); res(); };
      // decode up front (ImageBitmap) so the first draw of a frame never stalls the scroll
      im.onload = () => window.createImageBitmap ? createImageBitmap(im).then(done, () => done(im)) : done(im);
      im.onerror = res;
      im.src = url(i);
    });
    // progressive: first frame, then coarse → fine passes so scrubbing works before everything arrives
    (async () => {
      await load(0);
      for (const step of [16, 8, 4, 2, 1]) {
        const batch = [];
        for (let i = 0; i < HV.count; i += step) batch.push(load(i));
        await Promise.all(batch);
      }
    })();
  }
  function fitVideo() {
    if (!HV) return;
    const dpr = Math.min(devicePixelRatio || 1, 2), vw = innerWidth, vh = innerHeight;
    vcan.width = Math.round(vw * dpr); vcan.height = Math.round(vh * dpr);
    const [fw, fh] = HV.size, Lp = HV.laptop;
    const copyBottom = heroCopy.offsetTop + heroCopy.offsetHeight;
    const top0 = Math.max(copyBottom + 16, vh * .3);
    let s = Math.max(vw / fw, vh / fh);                                   // cover
    s = Math.min(s, (vh - 64 - top0) / ((Lp.bottom - Lp.top) * fh));       // whole laptop between copy and section nav
    if (vw / vh < .9) s = Math.min(s, (vw * .94) / (Lp.width * fw));       // phones: keep the laptop on screen
    const w = fw * s, h = fh * s;
    // centre the laptop in the space between the headline and the section nav (matters on tall phones)
    const avail = vh - 64 - top0, lapH = (Lp.bottom - Lp.top) * h;
    const lapTop = top0 + Math.max(0, (avail - lapH) / 2);
    vFit = { dpr, x: vw * .5 - Lp.centerX * w, y: lapTop - Lp.top * h, w, h, vw, vh };
    vDrawn = -1; drawVideo(true);
  }
  function drawVideo(force) {
    if (!HV || !vFit) return;
    // vFrame is fractional: draw frame i, then cross-fade frame i+1 by the fraction → no stepping between frames
    const i = Math.floor(vFrame), frac = vFrame - i;
    let img = frames[i];
    for (let d = 1; !img && d < HV.count; d++) img = frames[i - d] || frames[i + d];
    const next = frac > .02 ? frames[i + 1] : null;
    const key = i + (next ? Math.round(frac * 64) / 64 : 0);
    if (!img || (!force && vDrawn === key)) return;
    vDrawn = key;
    const { dpr, x, y, w, h, vw, vh } = vFit, c = vctx;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.imageSmoothingEnabled = true; c.imageSmoothingQuality = "high";
    c.fillStyle = "#0E1422"; c.fillRect(0, 0, vw, vh);
    c.drawImage(img, x, y, w, h);
    if (next) { c.globalAlpha = frac; c.drawImage(next, x, y, w, h); c.globalAlpha = 1; }
    // melt any frame edge that sits inside the viewport into the page colour
    const fade = (x0, y0, x1, y1) => { const g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, "rgba(14,20,34,1)"); g.addColorStop(1, "rgba(14,20,34,0)"); return g; };
    if (y > 0) { c.fillStyle = fade(0, y, 0, y + h * .14); c.fillRect(0, y, vw, h * .14); }
    if (y + h < vh) { c.fillStyle = fade(0, y + h, 0, y + h * .86); c.fillRect(0, y + h * .86, vw, h * .14 + 1); }
    if (x > 0) { c.fillStyle = fade(x, 0, x + w * .1, 0); c.fillRect(x, 0, w * .1, vh); c.fillStyle = fade(x + w, 0, x + w * .9, 0); c.fillRect(x + w * .9, 0, w * .1 + 1, vh); }
  }
  if (HV) { fitVideo(); addEventListener("resize", () => { fitVideo(); updateStage(window.__heroP || 0); onScroll(); }); }

  /* ---------- the scrubbed timeline ---------- */
  const seg = (p, a, b) => clamp((p - a) / (b - a), 0, 1);
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const lerp = (a, b, t) => a + (b - a) * t;
  const headA = D.heading[0], headB = D.heading[1];
  function updateStage(p) {
    // 1. copy + props leave
    const pa = ease(seg(p, 0, .12));
    heroCopy.style.opacity = 1 - seg(p, 0, .07);
    heroCopy.style.transform = `translateY(${-pa * 80}px)`;
    hint.style.opacity = 1 - seg(p, 0, .02);
    // camera "dollies" into the photo and racks focus as the laptop leaves
    const pd = ease(seg(p, .03, .36));
    wall.style.transform = `scale(${(1.04 + pd * .14).toFixed(4)}) translateY(${(pd * -2).toFixed(2)}%)`;
    wall.style.filter = pd > .01 ? `blur(${(pd * 7).toFixed(1)}px) brightness(${(1 - pd * .35).toFixed(3)})` : "";
    window.__heroP = p;
    if (HV) {
      // slow push-in gets the first stretch of scroll, the turn + document swirl the rest
      const st = HV.settle || 0, last = HV.count - 1;
      const f = p < .1 ? (p / .1) * st : st + seg(p, .1, .42) * (last - st);
      vTarget = clamp(f, 0, last);
      if (frozen !== null) { vFrame = vTarget; drawVideo(false); } else if (!vRaf) vRaf = requestAnimationFrame(vStep);
      vrig.style.opacity = 1 - seg(p, .41, .47);
    }
    if (window.Laptop3D) window.Laptop3D.update(p);
    let origin = null;
    if (PH) {
      // camera pushes in toward the laptop screen, background racks out of focus
      const pz = ease(seg(p, .03, .34));
      frame.style.transform = `scale(${(1 + pz * 1.15).toFixed(4)})`;
      frame.style.filter = pz > .01 ? `blur(${(pz * 4).toFixed(1)}px) brightness(${(1 - pz * .4).toFixed(3)})` : "";
      rig.style.opacity = 1 - seg(p, .4, .47);
      // transform-origin is the screen centre, so the screen stays put while everything scales around it
      origin = { x: parseFloat(frame.style.left) + screenCentre.x, y: parseFloat(frame.style.top) + screenCentre.y };
      if (window.Docs3D) window.Docs3D.update(p, origin);
    }
    // 2. laptop turns away + recedes to the right
    const pb = ease(seg(p, .04, .32));
    lap.style.transform = `translate3d(${pb * 20}vw, ${-pb * 6}vh, ${-pb * 420}px) rotateX(${lerp(-16, 6, pb)}deg) rotateY(${lerp(0, -42, pb)}deg) rotateZ(${lerp(0, 4, pb)}deg)`;
    $(".lap-wrap").style.opacity = 1 - seg(p, .4, .47);
    sceneDim.style.opacity = seg(p, .08, .34) * .75;
    // 3. files burst out of the screen
    const pc = heroEl.classList.contains("has-3d") ? 0 : seg(p, .14, .44);
    const lr = lid.getBoundingClientRect();
    const sx = origin ? origin.x : lr.left + lr.width / 2, sy = origin ? origin.y : lr.top + lr.height / 2, W = innerWidth, Hh = innerHeight;
    parts.forEach(o => {
      const t = clamp((pc - o.d) / .42, 0, 1);
      let tf = "", op = 0, bl = 0;
      if (t > 0 && t < 1) {
        const k = ease(t), u = 1 - k;
        const ex = o.ex * W, ey = o.ey * Hh, cx = sx + o.cx * W - W * .2, cy = sy + o.cy * Hh;
        const x = u * u * sx + 2 * u * k * cx + k * k * ex, y = u * u * sy + 2 * u * k * cy + k * k * ey;
        const sc = .12 + k * o.s;
        tf = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%) rotate(${(o.spin * k).toFixed(1)}deg) scale(${sc.toFixed(3)})`;
        op = Math.min(1, t * 6) * (1 - seg(t, .8, 1));
        bl = sc > 1.3 ? (sc - 1.3) * 4 : 0;
      }
      const key = tf + op.toFixed(2) + bl.toFixed(1);
      if (key === o.last) return;
      o.last = key;
      o.el.style.transform = tf; o.el.style.opacity = op.toFixed(2);
      o.el.style.filter = bl ? `blur(${bl.toFixed(1)}px)` : "";
    });
    // 4. top-down desk fades in, heading types
    deskLayer.style.opacity = seg(p, .36, .47);
    deskLayer.style.pointerEvents = p > .45 ? "auto" : "none";
    const pt = seg(p, .45, .54), full = headA + " " + headB, n = Math.round(pt * full.length);
    t1.textContent = full.slice(0, Math.min(n, headA.length));
    t2.textContent = n > headA.length + 1 ? full.slice(headA.length + 1, n) : "";
    deskH.classList.toggle("in", pt >= 1);
    deskH.classList.toggle("caret-on", pt > 0 && pt < 1);
    deskBox.style.setProperty("--sb", seg(p, .53, .58));
    // 5. search demo
    updateDesk(seg(p, .55, 1), pt >= 1);
  }

  // keep the window inside the laptop screen at a fixed "desktop" resolution
  const scaler = $(".scaler"), lidScreen = $(".lid-screen");
  const fitScreen = () => scaler.style.setProperty("--k", (lidScreen.clientWidth / 1180).toFixed(4));
  fitScreen();
  addEventListener("resize", fitScreen);

  /* =====================================================================
     SHOWCASE
     ===================================================================== */
  const arrow = `<svg viewBox="0 0 34 30" aria-hidden="true"><path d="M2 4c10 0 20 4 24 18M20 18l6 5 3-7"/></svg>`;
  const showcase = $("#showcase");
  // helpers shared with services.js (the pinned "What we do" stack renders there when S.services is set)
  window.__fs = { esc, accent, icon, reduce };
  if (!S.services) S.showcase.forEach(it => {
    const art = document.createElement("article");
    art.className = "show";
    art.innerHTML = `
      <header class="show-head rv">
        ${it.note ? `<span class="note">${esc(it.note)}${arrow}</span>` : ""}
        <h2>${esc(it.lead)} ${accent(it.accent)}${esc(it.tail || "")}</h2>
      </header>
      <div class="show-stage rv" style="--wall:${esc(it.wall)}"><div class="win-slot"></div></div>
      <div class="perfect rv">${icon("star")}<span>Perfect for:</span>${it.perfect.map(p => `<span class="chip">${esc(p)}</span>`).join("")}</div>`;
    showcase.append(art);
    mountWindow($(".win-slot", art), it.window);
  });

  /* =====================================================================
     FEATURES (bento)
     ===================================================================== */
  const VIS = {
    sync: () => `<div class="vx-sync"><div class="col"><span class="node">Bank</span><span class="node">Broker</span></div><div class="col"><span class="wire"></span><span class="wire rev"></span></div><div class="hub">${logoTile()}</div><div class="col"><span class="wire rev"></span><span class="wire"></span></div><div class="col"><span class="node">ERP</span><span class="node">Payroll</span></div></div>`,
    versions: () => `<ul class="vx-ver">${[["v14", "FY27 forecast updated", "You · 2 min ago"], ["v13", "Rate scenario added", "Advisor · 1 h ago"], ["v12", "Q3 actuals imported", "Bank sync · Yesterday"], ["v11", "Budget approved", "CFO · 3 days ago"], ["v10", "Initial model", "You · 2 weeks ago"]].map(([v, t, s], i) => `<li class="${i ? "" : "cur"}"><span><b>${v}</b> · ${t}<small>${s}</small></span><button type="button">${i ? "Restore" : "Current"}</button></li>`).join("")}</ul>`,
    share: () => `<div class="vx-share"><div class="lnk"><span>${esc(S.brand.name.toLowerCase())}.app/s/family-portfolio</span><button type="button">Copy</button></div><div class="perm">${icon("lock")} Anyone with the link · View only · Expires in 30 days</div></div>`,
    views: () => `<div class="vx-views" data-v="grid"><span class="vsw">${Object.keys(VIEW_IC).map((v, i) => `<button type="button" class="${i ? "" : "on"}" data-v="${v}" aria-label="${v} view">${icon(VIEW_IC[v])}</button>`).join("")}</span><div class="lay">${"<i></i>".repeat(12)}</div></div>`,
    team: () => `<div class="vx-team"><div class="avs">${[["AK", "#E8E2D8"], ["SM", "#A88C6E"], ["FR", "#69717F"], ["+3", "#243048"]].map(([t, c]) => `<span class="av" style="background:${c}">${t}</span>`).join("")}</div><span class="cur" style="left:12%;top:8%;color:#A88C6E">${icon("pointer")}<span style="background:#A88C6E">CFO</span></span><span class="cur" style="right:10%;bottom:6%;color:#69717F;animation-delay:-3s">${icon("pointer")}<span style="background:#69717F">Advisor</span></span></div>`,
    toggle: () => `<div class="vx-toggle on"><div class="fileline"><span class="mini">${thumb({ kind: "sheet", name: "sal" })}</span>Salary Register FY26.xlsx</div><button type="button" aria-pressed="true"><span class="sw"></span><span class="lbl">Hidden from AI</span></button></div>`,
    props: () => `<div class="vx-props">${[["Risk", "Moderate"], ["Tax lot", "2023-A"], ["Maturity", "Jun 2027"], ["Beneficiary", "Family Trust"], ["Currency", "PKR"], ["Sector", "Property"], ["Advisor", "S. Malik"], ["Review", "Quarterly"], ["Liquidity", "T+2"]].map(([k, v]) => `<span><em>${k}</em>${v}</span>`).join("")}</div>`,
    shield: () => `<div class="vx-shield"><span class="ring"></span><span class="ring r2"></span>${icon("shield")}</div>`,
    offline: () => `<div class="vx-off"><span class="pill"><i class="dot"></i><span class="st">Offline</span></span><span class="q">3 changes queued</span></div>`,
    peek: () => `<div class="vx-peek"><kbd>space</kbd><div class="pk">${thumb({ kind: "statement", name: "peek", label: "P&L" })}</div></div>`,
    chat: () => `<div class="vx-chat"><div class="b me"><small>You</small>Can we prepay the facility this year?</div><div class="b adv"><small>Advisor · live</small>Yes, cash headroom stays above PKR 1bn. Let me show you…</div><div class="b adv typing"><i></i><i></i><i></i></div></div>`,
  };
  VIS.context = () => `<div class="vx-ctx"><div class="stack">${[0, 1, 2, 3, 4].map(i => thumb({ kind: i % 2 ? "sheet" : "statement", name: "ctx" + i }).replace('<div class="th ', `<div style="--i:${i}" class="th `)).join("")}</div><div class="cnt"><b data-count="3214">0</b><span>files in one conversation</span></div><div class="threads"><span><i class="spin"></i>10-yr margin study</span><span><i class="spin"></i>Debt covenant check</span><span><i class="spin"></i>Dividend forecast</span></div></div>`;

  const FT = S.features;
  $("#features").innerHTML = `
    <div class="sec-head rv"><h2>${esc(FT.lead)}<br>${accent(FT.accent)}</h2></div>
    <div class="bento">${FT.items.map(f => `
      <article class="fc rv${f.wide ? " wide" : ""}${f.tall ? " tall" : ""}">
        <div class="fc-vis">${VIS[f.vis] ? VIS[f.vis]() : ""}</div>
        <div class="fc-t">${icon(f.icon)}${esc(f.title)}${f.soon ? '<span class="soon">Coming soon</span>' : ""}</div>
        <p>${esc(f.text)}</p>
      </article>`).join("")}
    </div>`;

  // feature interactions
  $$(".fc").forEach(fc => fc.addEventListener("pointermove", e => {
    const r = fc.getBoundingClientRect();
    fc.style.setProperty("--mx", `${e.clientX - r.left}px`); fc.style.setProperty("--my", `${e.clientY - r.top}px`);
  }));
  $$(".vx-toggle").forEach(t => $("button", t).addEventListener("click", () => {
    const on = t.classList.toggle("on");
    $("button", t).setAttribute("aria-pressed", on);
    $(".lbl", t).textContent = on ? "Hidden from AI" : "Visible to AI";
  }));
  $$(".vx-views").forEach(v => $$("button", v).forEach(b => b.addEventListener("click", () => {
    v.dataset.v = b.dataset.v; $$("button", v).forEach(x => x.classList.toggle("on", x === b));
  })));
  $$(".vx-share button").forEach(b => b.addEventListener("click", () => {
    const link = "https://" + $(".lnk span", b.closest(".vx-share")).textContent;
    try { navigator.clipboard && navigator.clipboard.writeText(link); } catch (_) { /* ignore */ }
    b.textContent = "Copied ✓"; setTimeout(() => (b.textContent = "Copy"), 1600);
  }));
  $$(".vx-ver").forEach(list => list.addEventListener("click", e => {
    const li = e.target.closest("li"); if (!li || !e.target.closest("button") || li.classList.contains("cur")) return;
    $$("li", list).forEach(x => { x.classList.toggle("cur", x === li); $("button", x).textContent = x === li ? "Current" : "Restore"; });
  }));
  $$(".vx-off").forEach(o => setInterval(() => {
    const on = o.classList.toggle("online");
    $(".st", o).textContent = on ? "Back online" : "Offline";
    $(".q", o).textContent = on ? "All changes synced" : "3 changes queued";
  }, 2600));

  /* =====================================================================
     CTA + FOOTER + PILL NAV
     ===================================================================== */
  const C = S.cta;
  $("#cta").innerHTML = `
    <div class="cta-in rv">
      ${logoTile()}
      <h2>${esc(C.title)}<br>${accent(C.accent)}</h2>
      <p>${esc(C.text)}</p>
      <div class="cta-btns">
        <a class="btn btn-gold btn-lg" href="${esc(C.primary.href)}">${esc(C.primary.label)}</a>
        <a class="btn btn-dark btn-lg" href="${esc(C.secondary.href)}">${icon("users")}${esc(C.secondary.label)}</a>
      </div>
    </div>`;
  $("#footer").innerHTML = `
    <a class="logo" href="#top" aria-label="${esc(S.brand.name)} home">${logoTile()}${wordmark()}</a>
    <nav aria-label="Footer">${S.footer.links.map(l => `<a href="${esc(l.href)}">${esc(l.label)}</a>`).join("")}</nav>
    <span>© ${new Date().getFullYear()} ${esc(S.brand.name)}</span>
    <p class="disc">${esc(S.footer.disclaimer)}${(ST.credits || []).length ? ` Photography: ${ST.credits.map(c => `<a href="${esc(c.href)}" target="_blank" rel="noopener">${esc(c.label)}</a>`).join(" · ")} (Unsplash).` : ""}</p>`;

  const PILLS = [["discover", "About Us", "users", "#top"], ["showcase", "What we do", "sparkle", "#showcase"], ["features", "Features", "grid", "#features"]];
  $("#pillnav").innerHTML = PILLS.map(([k, l, ic]) => `<button type="button" data-k="${k}">${icon(ic)}<span>${l}</span></button>`).join("");
  $$("#pillnav button").forEach(b => b.addEventListener("click", () => {
    const target = PILLS.find(p => p[0] === b.dataset.k)[3];
    target === "#top" ? scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }) : $(target).scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  }));

  /* =====================================================================
     SCROLL + OBSERVERS
     ===================================================================== */
  const hero = $("#hero"), topnav = $("#topnav");
  const progress = el => { const r = el.getBoundingClientRect(), total = r.height - innerHeight; return total > 0 ? clamp(-r.top / total, 0, 1) : 0; };
  // ?stage=0.3 freezes the hero timeline at that point (handy when tuning the scroll scene)
  const stageParam = new URLSearchParams(location.search).get("stage");
  const frozen = stageParam === null ? null : clamp(+stageParam, 0, 1);
  // Smooth scroll-linked motion: GSAP ScrollTrigger scrubs a proxy progress value with a small lag,
  // so the film and everything tied to it ease toward the scroll position instead of jumping per wheel tick.
  let smoothHero = false;
  if (frozen === null && window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    const proxy = { p: progress(hero) };
    const mm = gsap.matchMedia();
    const build = scrub => gsap.to(proxy, {
      p: 1, ease: "none",
      onUpdate: () => updateStage(proxy.p),
      scrollTrigger: { trigger: hero, start: "top top", end: "bottom bottom", scrub, invalidateOnRefresh: true },
    });
    mm.add("(prefers-reduced-motion: no-preference)", () => { build(.85); });
    mm.add("(prefers-reduced-motion: reduce)", () => { build(true); });
    smoothHero = true;
    addEventListener("load", () => ScrollTrigger.refresh());
  }
  function onScroll() {
    if (frozen !== null) updateStage(frozen);
    else if (!smoothHero && inView(hero)) updateStage(reduce ? (progress(hero) > .3 ? 1 : 0) : progress(hero));
    topnav.classList.toggle("scrolled", scrollY > 20);
    const y = scrollY + innerHeight * .45;
    const k = y >= $("#features").offsetTop ? "features" : y >= showcase.offsetTop ? "showcase" : "discover";
    $$("#pillnav button").forEach(b => b.classList.toggle("on", b.dataset.k === k));
  }
  let ticking = false;
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; onScroll(); }); } }, { passive: true });
  addEventListener("resize", onScroll);
  onScroll();

  // reveal-on-scroll + count-ups
  const countUp = el => {
    const end = +el.dataset.count, t0 = performance.now(), dur = reduce ? 0 : 1400;
    const tick = now => { const k = dur ? clamp((now - t0) / dur, 0, 1) : 1; el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))).toLocaleString(); if (k < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add("in");
    $$("[data-count]", e.target).forEach(countUp);
    io.unobserve(e.target);
  }), { threshold: .15, rootMargin: "0px 0px -8% 0px" });
  $$(".rv").forEach(el => io.observe(el));

  // autoplay each advisor demo when its window is well in view
  const wio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const w = wins.find(x => x.el === e.target);
    if (w) { activeWin = w; play(w); }
    wio.unobserve(e.target);
  }), { threshold: .45 });
  wins.filter(w => w !== heroWin).forEach(w => wio.observe(w.el));
  setTimeout(() => { activeWin = activeWin || heroWin; play(heroWin); }, 1400);

  /* ?capture=screen | ?capture=docs — render the textures used by laptop3d.js
     (screenshot the page at 1440×900 → assets/screen-ui.png, 1200×800 → assets/docs-atlas.png) */
  const capture = new URLSearchParams(location.search).get("capture");
  if (capture) {
    const root = document.createElement("div");
    root.className = `cap-root cap-${capture}`;
    document.body.classList.add("capturing");
    document.body.append(root);
    if (capture === "screen") {
      root.append(heroWin.host);
      heroWin.played = false; play(heroWin);
    } else {
      const DOCS = [
        { kind: "statement", label: "Balance sheet", name: "cap0" }, { kind: "chart", label: "Revenue", name: "cap1" },
        { kind: "sheet", name: "cap2" }, { kind: "ticker", symbol: "NVLT", change: "+2.4%", name: "cap3" },
        { kind: "pie", label: "Allocation", name: "cap4" }, { kind: "notice", label: "Tax notice", name: "cap5" },
        { kind: "memo", label: "Board memo", name: "cap6" }, { kind: "receipt", name: "cap7" },
      ];
      root.innerHTML = DOCS.map(d => `<div class="cap-cell">${thumb(d)}</div>`).join("");
    }
  }
})();
