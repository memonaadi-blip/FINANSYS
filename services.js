/* =====================================================================
   WHAT WE DO — a pinned stack of service screens (content.js → services)
   As you scroll, the current screen drops back and dims while the next
   one rises in front (GSAP ScrollTrigger, scrubbed). Each screen pairs
   the sub-services with a chart/diagram that animates when it arrives.
   Chart colours (validated for CVD + contrast on the navy surface):
     gold #B8843D, slate-blue #5A86D8; status: good #6FB28A, due #D98B62.
   ===================================================================== */
(() => {
  const S = window.SITE, F = window.__fs;
  const root = document.getElementById("showcase");
  if (!S || !S.services || !F || !root) return;
  const { esc, accent, icon, reduce } = F;
  const SV = S.services, N = SV.items.length;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const fmt = v => v.toLocaleString("en-US");
  const C = { a: "#B8843D", b: "#5A86D8", good: "#6FB28A", due: "#D98B62" };

  /* ---------- charts & diagrams ---------- */
  const VIZ = {
    // grouped columns: two series on one axis, legend + selective end labels, per-slot hover targets
    plan(d) {
      const W = 520, H = 220, pl = 46, pr = 10, pt = 16, pb = 26;
      const all = d.series.flatMap(s => s.values), max = Math.ceil(Math.max(...all) / 500) * 500;
      const iw = W - pl - pr, ih = H - pt - pb, n = d.years.length, slot = iw / n, bw = 18, gap = 2;
      const y = v => pt + ih - (v / max) * ih;
      const ticks = [0, .25, .5, .75, 1].map(f => Math.round(max * f));
      const col = (x, v, cls, i) => {
        const top = y(v), base = pt + ih, r = Math.min(4, base - top);
        return `<path class="col ${cls}" style="--i:${i}" d="M${x},${base}V${top + r}Q${x},${top} ${x + r},${top}H${x + bw - r}Q${x + bw},${top} ${x + bw},${top + r}V${base}Z"/>`;
      };
      let g = ticks.map(t => `<line class="gl" x1="${pl}" x2="${W - pr}" y1="${y(t)}" y2="${y(t)}"/><text class="tk" x="${pl - 8}" y="${y(t) + 3.5}" text-anchor="end">${fmt(t)}</text>`).join("");
      d.years.forEach((yr, i) => {
        const cx = pl + slot * i + slot / 2, x0 = cx - bw - gap / 2;
        g += col(x0, d.series[0].values[i], "s0", i) + col(cx + gap / 2, d.series[1].values[i], "s1", i);
        g += `<text class="tk" x="${cx}" y="${H - 8}" text-anchor="middle">${yr}</text>`;
        g += `<rect class="hit" x="${pl + slot * i}" y="${pt}" width="${slot}" height="${ih}" data-tip="${esc(yr)} · ${d.series.map(s => `${s.name} ${fmt(s.values[i])}`).join(" · ")} (${esc(d.unit)})"/>`;
      });
      const last = n - 1, lx = pl + slot * last + slot / 2;
      g += `<text class="lbl" x="${lx - bw / 2 - gap / 2}" y="${y(d.series[0].values[last]) - 6}" text-anchor="middle">${fmt(d.series[0].values[last])}</text>`;
      g += `<text class="lbl" x="${lx + bw / 2 + gap / 2}" y="${y(d.series[1].values[last]) - 6}" text-anchor="middle">${fmt(d.series[1].values[last])}</text>`;
      return `
        <div class="viz-kpis">${d.kpis.map(([l, v]) => `<div class="kpi"><span>${esc(l)}</span><b>${esc(v)}</b></div>`).join("")}</div>
        <figure class="viz-fig">
          <figcaption><span>${esc(d.title)} <em>${esc(d.unit)}</em></span>
            <span class="viz-legend">${d.series.map((s, i) => `<span><i style="background:${i ? C.b : C.a}"></i>${esc(s.name)}</span>`).join("")}</span></figcaption>
          <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(d.title)}: ${d.years.map((yr, i) => `${yr} ${d.series.map(s => `${s.name} ${s.values[i]}`).join(", ")}`).join("; ")} (${esc(d.unit)})">${g}</svg>
        </figure>`;
    },

    // org-structure diagram + deal-stage stepper
    structure(d) {
      const W = 520, H = 210, pw = 170, ph = 50, cw = 150, chh = 50;
      const px = (W - pw) / 2, py = 10, cy = 140, step = (W - cw * 3) / 4;
      let g = "";
      d.children.forEach((c, i) => {
        const cx = step + i * (cw + step), mx = cx + cw / 2;
        g += `<path class="link${i === d.focus ? " on" : ""}" style="--i:${i}" d="M${W / 2},${py + ph} C${W / 2},${py + ph + 40} ${mx},${cy - 40} ${mx},${cy}"/>`;
      });
      const node = (x, y0, w, h, [t, s], cls = "") => `<g class="node ${cls}"><rect x="${x}" y="${y0}" width="${w}" height="${h}" rx="10"/><text class="nt" x="${x + w / 2}" y="${y0 + 21}" text-anchor="middle">${esc(t)}</text><text class="ns" x="${x + w / 2}" y="${y0 + 37}" text-anchor="middle">${esc(s)}</text></g>`;
      g += node(px, py, pw, ph, d.parent, "root");
      d.children.forEach((c, i) => { g += node(step + i * (cw + step), cy, cw, chh, c, i === d.focus ? "focus" : ""); });
      const glyph = st => st === "done" ? icon("check") : st === "now" ? `<i class="pulse"></i>` : `<i class="ring"></i>`;
      return `
        <figure class="viz-fig">
          <figcaption><span>${esc(d.title)} <em>${esc(d.unit)}</em></span><span class="viz-legend"><span><i style="background:${C.a}"></i>Transaction in focus</span></span></figcaption>
          <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(d.parent[0])} owning ${d.children.map(c => c[0]).join(", ")}">${g}</svg>
        </figure>
        <ol class="viz-steps" aria-label="Deal stages">${d.steps.map(([t, st]) => `<li class="${st}" data-tip="${esc(t)} · ${st === "done" ? "complete" : st === "now" ? "in progress" : "upcoming"}">${glyph(st)}<span>${esc(t)}</span></li>`).join("")}</ol>`;
    },

    // data-flow diagram with moving packets (incl. e-invoice hand-off to FBR / PRA) + migration meters
    systems(d) {
      const W = 640, H = 200;
      const n = (id, x, y0, w, t, st, cls = "") => ({ id, x, y: y0, w, h: 46, t, s: st, cls });
      const nodes = [
        n("leg", 4, 77, 100, "Legacy ledgers", "historic data"),
        n("rec", 122, 77, 104, "Reconciliation", "audit trail"),
        n("sap", 244, 67, 122, "SAP S/4HANA", "FICO core", "hub"),
        n("inv", 392, 22, 112, "Digital invoicing", "e-invoices"),
        n("bi", 392, 132, 112, "Reporting & BI", "Power BI"),
        n("fbr", 530, 0, 106, "FBR", "Federal Board of Revenue", "auth"),
        n("pra", 530, 56, 106, "PRA", "Punjab Revenue Auth.", "auth"),
      ];
      const by = Object.fromEntries(nodes.map(o => [o.id, o]));
      const cy = o => o.y + o.h / 2;
      const link = (a, b, i, col) => {
        const A = by[a], B = by[b], ax = A.x + A.w, ay = cy(A), bx = B.x, by2 = cy(B);
        const p = `M${ax},${ay} C${ax + 16},${ay} ${bx - 16},${by2} ${bx},${by2}`;
        return `<path id="sv-l${i}" class="link on" style="--i:${i}" d="${p}"/>` +
          (reduce ? "" : `<circle class="pkt" r="3.5" fill="${col}"><animateMotion dur="${1.5 + i * .2}s" repeatCount="indefinite" begin="${i * .25}s"><mpath href="#sv-l${i}"/></animateMotion></circle>`);
      };
      let g = link("leg", "rec", 0, C.a) + link("rec", "sap", 1, C.a) + link("sap", "inv", 2, C.b) + link("sap", "bi", 3, C.b) +
        link("inv", "fbr", 4, C.b) + link("inv", "pra", 5, C.b);
      g += nodes.map(o => `<g class="node ${o.cls}" data-tip="${esc(o.t)} · ${esc(o.s)}"><rect x="${o.x}" y="${o.y}" width="${o.w}" height="${o.h}" rx="10"/><text class="nt" x="${o.x + o.w / 2}" y="${o.y + 20}" text-anchor="middle">${esc(o.t)}</text><text class="ns" x="${o.x + o.w / 2}" y="${o.y + 35}" text-anchor="middle">${esc(o.s)}</text></g>`).join("");
      return `
        <figure class="viz-fig">
          <figcaption><span>${esc(d.title)} <em>${esc(d.unit)}</em></span>
            <span class="viz-legend"><span><i style="background:${C.a}"></i>Inbound data</span><span><i style="background:${C.b}"></i>Outbound · e-invoices to FBR &amp; PRA</span></span></figcaption>
          <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Legacy ledgers flow through reconciliation into SAP S/4HANA, which feeds digital invoicing (integrated with FBR and PRA) and reporting">${g}</svg>
        </figure>
        <div class="viz-meters">${d.meters.map(([l, v], i) => `<div class="meter" data-tip="${esc(l)} · ${v}%"><span>${esc(l)}</span><b>${v}%</b><i><em style="--w:${v}%;--i:${i}"></em></i></div>`).join("")}</div>`;
    },

    // compliance calendar (status markers with icon + label) + effective-tax-rate comparison
    tax(d) {
      const W = 520, lw = 132, top = 26, rh = 30, H = top + d.rows.length * rh + 8;
      const cw = (W - lw - 8) / d.months.length;
      let g = d.months.map((m, i) => `<text class="tk${i === d.now ? " now" : ""}" x="${lw + cw * i + cw / 2}" y="14" text-anchor="middle">${m}</text>`).join("");
      g += `<rect class="nowband" x="${lw + cw * d.now + 2}" y="20" width="${cw - 4}" height="${d.rows.length * rh + 4}" rx="6"/>`;
      d.rows.forEach(([name, when], r) => {
        const yy = top + r * rh + rh / 2;
        g += `<text class="rowlbl" x="0" y="${yy + 4}">${esc(name)}</text><line class="gl" x1="${lw}" x2="${W - 8}" y1="${yy}" y2="${yy}"/>`;
        const idx = when === "monthly" ? d.months.map((_, i) => i) : when;
        idx.forEach(i => {
          const x = lw + cw * i + cw / 2, st = i < d.now ? "filed" : i === d.now ? "due" : "next";
          const lab = st === "filed" ? "Filed" : st === "due" ? "Due this month" : "Upcoming";
          g += `<g class="mk ${st}" style="--i:${i}" data-tip="${esc(name)} · ${d.months[i]} · ${lab}"><circle cx="${x}" cy="${yy}" r="12" class="hitc"/><circle cx="${x}" cy="${yy}" r="6.5" class="dot"/>` +
            (st === "filed" ? `<path d="M${x - 3},${yy}l2,2l4,-4" class="gly"/>` : st === "due" ? `<path d="M${x},${yy - 3}v3.5M${x},${yy + 2.6}v.4" class="gly"/>` : "") + `</g>`;
        });
      });
      const max = Math.max(...d.etr.map(e => e[1])) * 1.15;
      return `
        <figure class="viz-fig">
          <figcaption><span>${esc(d.title)} <em>${esc(d.unit)}</em></span>
            <span class="viz-legend"><span><i class="st filed"></i>Filed</span><span><i class="st due"></i>Due</span><span><i class="st next"></i>Upcoming</span></span></figcaption>
          <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(d.title)}: filings before ${d.months[d.now]} complete, ${d.months[d.now]} filings due">${g}</svg>
        </figure>
        <figure class="viz-fig viz-etr">
          <figcaption><span>Effective tax rate <em>illustrative</em></span></figcaption>
          ${d.etr.map(([l, v], i) => `<div class="etr" data-tip="${esc(l)} · ${v}%"><span>${esc(l)}</span><i><em style="--w:${(v / max) * 100}%;background:${i ? C.a : C.b}"></em></i><b>${v}%</b></div>`).join("")}
        </figure>`;
    },
  };

  /* ---------- markup ---------- */
  const pad = i => String(i + 1).padStart(2, "0");
  root.classList.add("svc-mode");
  root.innerHTML = `
    <header class="svc-intro">
      <h2>${esc(SV.lead)} ${accent(SV.accent)}${esc(SV.tail || "")}</h2>
      ${SV.sub ? `<p>${esc(SV.sub)}</p>` : ""}
    </header>
    <div class="svc-pin" style="--n:${N}">
      <div class="svc-sticky">
        <div class="svc-stack">${SV.items.map((s, i) => `
          <article class="svc-card" data-i="${i}" aria-label="${esc(s.title)}">
            <div class="svc-win">
              <div class="svc-titlebar">
                <span class="lights" aria-hidden="true"><i></i><i></i><i></i></span>
                <div class="svc-tabs" role="tablist" aria-label="Services">${SV.items.map((t, k) => `
                  <button type="button" role="tab" class="svc-tab${k === i ? " on" : ""}" data-i="${k}" aria-selected="${k === i}" tabindex="${k === i ? 0 : -1}">
                    ${icon(t.icon || "folder")}<span>${esc(t.short || t.title)}</span>${k === i ? `<i class="x" aria-hidden="true">${icon("x")}</i>` : ""}
                  </button>`).join("")}
                </div>
              </div>
              <div class="svc-toolbar">
                <div class="svc-ttl">
                  <span class="crumb">${icon("folder")} FINANSYS <em>/</em> <b>${esc(s.title)}</b></span>
                  <p class="svc-brief">${esc(s.tagline)}</p>
                </div>
                <div class="svc-actions" aria-hidden="true"><span class="sbtn">${icon("share")}Share</span><span class="sbtn">${icon("layers")}Export</span><span class="svc-tag">${pad(i)} / ${pad(N - 1)}</span></div>
              </div>
              <div class="svc-body">
                <ol class="svc-list">${s.items.map((it, k) => `<li data-k="${k}"><b>${esc(it.t)}</b><span>${esc(it.d)}</span></li>`).join("")}</ol>
                <div class="svc-viz">${(VIZ[s.viz] || (() => ""))(s.data || {})}</div>
              </div>
              <div class="svc-status"><span><i class="live"></i>Live workspace · synced just now</span><span>${esc(s.items.length + " services")} · FINANSYS Advisory</span></div>
            </div>
          </article>`).join("")}
        </div>
        <nav class="svc-dots" aria-label="Services">${SV.items.map((s, i) => `<button type="button" data-i="${i}" aria-label="${esc(s.title)}"><span>${esc(s.short || s.title)}</span><i></i></button>`).join("")}</nav>
      </div>
    </div>`;

  const pin = $(".svc-pin", root), cards = $$(".svc-card", root), dots = $$(".svc-dots button", root);

  /* ---------- tooltip (one shared element) ---------- */
  const tip = document.createElement("div");
  tip.className = "viz-tip"; tip.setAttribute("role", "tooltip");
  document.body.append(tip);
  root.addEventListener("pointermove", e => {
    const t = e.target.closest("[data-tip]");
    if (!t) { tip.classList.remove("on"); return; }
    tip.textContent = t.dataset.tip;
    const x = Math.min(e.clientX + 14, innerWidth - tip.offsetWidth - 10);
    tip.style.transform = `translate(${x}px, ${e.clientY - 38}px)`;
    tip.classList.add("on");
  });
  root.addEventListener("pointerleave", () => tip.classList.remove("on"));

  /* ---------- state ---------- */
  let active = -1;
  function setActive(i) {
    if (i === active) return;
    active = i;
    cards.forEach((c, k) => c.classList.toggle("active", k === i));
    dots.forEach((d, k) => { d.classList.toggle("on", k === i); d.setAttribute("aria-current", k === i ? "step" : "false"); });
  }
  function setRow(i, f) {   // highlight sub-services one by one while a screen holds
    const rows = $$(".svc-list li", cards[i]);
    const k = Math.min(rows.length - 1, Math.max(0, Math.floor(f * rows.length)));
    rows.forEach((r, j) => r.classList.toggle("on", j === k));
  }
  // intro reveal
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .2 });
  io.observe($(".svc-intro", root));

  /* ---------- scroll choreography ---------- */
  const G = window.gsap, ST = window.ScrollTrigger;
  if (!G || !ST || reduce) {
    // static fallback: screens in normal flow, each with its own heading
    root.classList.add("svc-static");
    cards.forEach((c, i) => { c.classList.add("active"); setRow(i, 0); });
    return;
  }
  G.registerPlugin(ST);
  const below = () => innerHeight * 1.05;            // waiting screens sit a full viewport below, never peeking in
  G.set(cards.slice(1), { y: below });
  const HOLD = 1, MOVE = 1;
  // state follows the *scrubbed* timeline (its onUpdate fires every frame while the scrub catches up),
  // not the raw scroll position — so the active screen is right even after a big jump
  const tl = G.timeline({ defaults: { ease: "power2.inOut" }, onUpdate: () => sync() });
  const starts = [0];                               // timeline time at which each screen starts holding
  for (let i = 1; i < N; i++) {
    tl.to({}, { duration: HOLD });
    const at = tl.duration();
    tl.to(cards[i - 1], { scale: .92, yPercent: -7, autoAlpha: .32, duration: MOVE }, at)
      .fromTo(cards[i], { y: below }, { y: 0, duration: MOVE, ease: "power3.out" }, at);
    for (let j = 0; j < i - 1; j++) tl.to(cards[j], { scale: .92 - .04 * (i - 1 - j), yPercent: -7 - 5 * (i - 1 - j), autoAlpha: 0, duration: MOVE }, at);
    starts.push(at + MOVE);
  }
  tl.to({}, { duration: HOLD });
  const total = tl.duration();
  ST.create({
    trigger: pin, start: "top top", end: "bottom bottom", scrub: .8, animation: tl, invalidateOnRefresh: true,
  });
  function sync() {
    const t = tl.time();
    let i = 0;
    for (let k = 1; k < N; k++) if (t >= starts[k] - MOVE * .5) i = k;
    setActive(i);
    const holdStart = i === 0 ? 0 : starts[i], holdEnd = i < N - 1 ? starts[i + 1] - MOVE : total;
    setRow(i, (t - holdStart) / Math.max(holdEnd - holdStart, .001));
  }
  setActive(0); setRow(0, 0);
  const jumpTo = i => {
    const st = ST.getAll().find(x => x.trigger === pin);
    if (!st) return;
    scrollTo({ top: st.start + (st.end - st.start) * ((i === 0 ? 0 : starts[i]) / total) + 2, behavior: "smooth" });
  };
  $$(".svc-tab", root).forEach(t => t.addEventListener("click", () => jumpTo(+t.dataset.i)));
  dots.forEach((d, i) => d.addEventListener("click", () => {
    const st = ST.getAll().find(s => s.trigger === pin);
    if (!st) return;
    const target = st.start + (st.end - st.start) * ((i === 0 ? 0 : starts[i]) / total) + 2;
    scrollTo({ top: target, behavior: "smooth" });
  }));
  addEventListener("load", () => ST.refresh());
})();
