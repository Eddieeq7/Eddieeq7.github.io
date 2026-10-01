/* ==========================================================================
   Small Language Model page — renders data exported from the real trained
   checkpoint (data/slm-data.js, produced by `python -m slm.export`).
   ========================================================================== */

(() => {
  "use strict";
  const D = window.SLM_DATA;
  if (!D) return;
  const $ = (s) => document.querySelector(s);
  const NS = "http://www.w3.org/2000/svg";
  const el = (tag, attrs = {}, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    if (parent) parent.appendChild(n);
    return n;
  };
  const fmt = (n, d = 3) => Number(n).toFixed(d);
  const vis = (s) => s.replace(/\n/g, "↵").replace(/ /g, "·");

  /* ---------- Tooltip ---------------------------------------------------- */
  const tip = document.createElement("div");
  tip.className = "tooltip"; tip.setAttribute("role", "status");
  document.body.appendChild(tip);
  const showTip = (html, x, y) => {
    tip.innerHTML = html; tip.classList.add("is-on");
    const r = tip.getBoundingClientRect();
    tip.style.left = Math.min(window.innerWidth - r.width - 8, x + 14) + "px";
    tip.style.top = Math.max(8, y - r.height - 10) + "px";
  };
  const hideTip = () => tip.classList.remove("is-on");

  /* ---------- Fill in numbers ------------------------------------------- */
  document.querySelectorAll("[data-slm]").forEach((n) => {
    const v = n.dataset.slm.split(".").reduce((o, k) => (o == null ? o : o[k]), D);
    // Values arrive already rounded by build_site_data.py; print them as-is.
    if (v != null) n.textContent = Number.isInteger(v) ? v.toLocaleString() : String(v);
  });

  /* ---------- Attention explorer ---------------------------------------- */
  const tokens = D.tokens, T = tokens.length;
  let layer = D.attention.length - 1, head = 0, query = T - 1;

  const layerSeg = $("#attn-layer"), headSeg = $("#attn-head");
  const mkSeg = (host, n, get, set, prefix) => {
    host.innerHTML = "";
    for (let i = 0; i < n; i++) {
      const b = document.createElement("button");
      b.type = "button"; b.textContent = `${prefix}${i + 1}`;
      b.setAttribute("aria-pressed", String(i === get()));
      b.addEventListener("click", () => { set(i); [...host.children].forEach((c, j) => c.setAttribute("aria-pressed", String(j === i))); renderAttn(); });
      host.appendChild(b);
    }
  };
  mkSeg(layerSeg, D.attention.length, () => layer, (v) => (layer = v), "");
  mkSeg(headSeg, D.attention[0].length, () => head, (v) => (head = v), "");

  const strip = $("#attn-tokens");
  strip.innerHTML = tokens.map((t, i) => `<button type="button" class="tok" data-i="${i}" title="token ${i} · id ${D.token_ids[i]}">${escapeHtml(vis(t))}</button>`).join("");
  strip.addEventListener("click", (e) => {
    const b = e.target.closest(".tok"); if (!b) return;
    query = Number(b.dataset.i); renderAttn();
  });

  const heat = $("#attn-heat");
  function heatColor(v) {
    const s = getComputedStyle(document.documentElement);
    const a = s.getPropertyValue("--heat-0").split(",").map(Number), b = s.getPropertyValue("--heat-1").split(",").map(Number);
    const k = Math.pow(v, 0.6); // perceptual lift for small weights
    return `rgb(${a.map((x, i) => Math.round(x + (b[i] - x) * k)).join(",")})`;
  }

  function renderAttn() {
    const A = D.attention[layer][head];
    // token strip: background = weight from the selected query to each key
    strip.querySelectorAll(".tok").forEach((b, j) => {
      const w = j <= query ? A[query][j] : 0;
      b.style.background = j <= query ? heatColor(w) : "transparent";
      b.style.color = w > 0.35 ? "var(--paper)" : "";
      b.classList.toggle("is-q", j === query);
      b.classList.toggle("is-future", j > query);
    });
    const top = A[query].map((w, j) => ({ w, j })).filter((o) => o.j <= query).sort((a, b) => b.w - a.w).slice(0, 3);
    $("#attn-caption").innerHTML = `When the model reads <b>${escapeHtml(vis(tokens[query]))}</b>, it focuses most on ` +
      top.map((o) => `<b>${escapeHtml(vis(tokens[o.j]))}</b> (${(o.w * 100).toFixed(0)}%)`).join(", ") + `. <span style="color:var(--text-3)">Layer ${layer + 1}, head ${head + 1}.</span>`;

    // heatmap matrix
    heat.innerHTML = "";
    const size = heat.clientWidth || 600, cell = size / T;
    heat.setAttribute("viewBox", `0 0 ${size} ${size}`);
    for (let i = 0; i < T; i++) {
      for (let j = 0; j <= i; j++) {
        const r = el("rect", { x: j * cell, y: i * cell, width: Math.max(0.5, cell - (cell > 6 ? 1 : 0)), height: Math.max(0.5, cell - (cell > 6 ? 1 : 0)), fill: heatColor(A[i][j]) }, heat);
        r.dataset.i = i; r.dataset.j = j;
      }
    }
    el("rect", { x: 0, y: query * cell, width: size, height: cell, fill: "none", stroke: "var(--accent)", "stroke-width": 1.5 }, heat);
  }
  heat.addEventListener("mousemove", (e) => {
    const r = e.target.closest("rect"); if (!r || r.dataset.i == null) return hideTip();
    const i = +r.dataset.i, j = +r.dataset.j;
    showTip(`query <b>${escapeHtml(vis(tokens[i]))}</b> [${i}] → key <b>${escapeHtml(vis(tokens[j]))}</b> [${j}]<br>weight ${fmt(D.attention[layer][head][i][j], 3)}`, e.clientX, e.clientY);
  });
  heat.addEventListener("mouseleave", hideTip);
  heat.addEventListener("click", (e) => { const r = e.target.closest("rect"); if (r && r.dataset.i != null) { query = +r.dataset.i; renderAttn(); } });

  /* ---------- Next-token bars ------------------------------------------- */
  const nt = $("#next-token");
  if (nt) {
    const max = D.next_token[0].p;
    nt.innerHTML = D.next_token.map((o) => `<li><code>${escapeHtml(vis(o.token))}</code><span class="bar"><i style="width:${(o.p / max) * 100}%"></i></span><span class="p">${(o.p * 100).toFixed(1)}%</span></li>`).join("");
  }

  /* ---------- Loss curve ------------------------------------------------ */
  function lossChart() {
    const svg = $("#loss-chart"); if (!svg) return;
    svg.innerHTML = "";
    const W = svg.clientWidth || 640, H = 300, m = { l: 44, r: 16, t: 14, b: 30 };
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const pts = D.curve, xs = pts.map((p) => p.step);
    const ys = pts.flatMap((p) => [p.train_loss, p.val_loss]).filter((v) => v < 5);
    const x0 = 0, x1 = Math.max(...xs), y0 = Math.floor(Math.min(...ys) * 2) / 2, y1 = Math.ceil(Math.max(...ys) * 2) / 2;
    const X = (v) => m.l + ((v - x0) / (x1 - x0)) * (W - m.l - m.r);
    const Y = (v) => m.t + (1 - (Math.min(v, y1) - y0) / (y1 - y0)) * (H - m.t - m.b);
    for (let v = y0; v <= y1 + 1e-9; v += 0.5) {
      el("line", { x1: m.l, x2: W - m.r, y1: Y(v), y2: Y(v), stroke: "var(--grid)", "stroke-width": 1 }, svg);
      el("text", { x: m.l - 8, y: Y(v) + 4, "text-anchor": "end", class: "tick" }, svg).textContent = v.toFixed(1);
    }
    const step = x1 > 4000 ? 1000 : 500;
    for (let v = 0; v <= x1; v += step) el("text", { x: X(v), y: H - 8, "text-anchor": "middle", class: "tick" }, svg).textContent = v === 0 ? "0" : `${v / 1000}k`;
    el("line", { x1: m.l, x2: W - m.r, y1: H - m.b, y2: H - m.b, stroke: "var(--axis)" }, svg);
    if (pts[0].val_loss > y1) el("text", { x: X(0) + 8, y: m.t + 10, class: "tick" }, svg).textContent = `↑ step 0: ${pts[0].val_loss.toFixed(2)} (axis clipped)`;
    const best = pts.find((p) => p.step === D.best_step);
    if (best) {
      el("line", { x1: X(best.step), x2: X(best.step), y1: m.t, y2: H - m.b, stroke: "var(--axis)", "stroke-dasharray": "3 4" }, svg);
      el("text", { x: X(best.step) + 6, y: m.t + 10, class: "tick" }, svg).textContent = `best val @ ${best.step}`;
    }
    [["train_loss", "var(--series-1)"], ["val_loss", "var(--series-2)"]].forEach(([k, c]) => {
      el("path", { d: pts.map((p, i) => `${i ? "L" : "M"}${X(p.step)},${Y(p[k])}`).join(""), fill: "none", stroke: c, "stroke-width": 2, "stroke-linejoin": "round", "stroke-linecap": "round" }, svg);
      const last = pts[pts.length - 1];
      el("text", { x: X(last.step) - 4, y: Y(last[k]) + (k === "val_loss" ? -8 : 16), "text-anchor": "end", class: "dlabel" }, svg).textContent = k === "val_loss" ? "validation" : "train";
    });
    const cross = el("line", { y1: m.t, y2: H - m.b, stroke: "var(--ink-3)", "stroke-width": 1, opacity: 0 }, svg);
    const dots = ["train_loss", "val_loss"].map((k, i) => el("circle", { r: 4, fill: i ? "var(--series-2)" : "var(--series-1)", stroke: "var(--paper)", "stroke-width": 2, opacity: 0 }, svg));
    const hit = el("rect", { x: m.l, y: m.t, width: W - m.l - m.r, height: H - m.t - m.b, fill: "transparent" }, svg);
    hit.addEventListener("mousemove", (e) => {
      const r = svg.getBoundingClientRect(), sx = ((e.clientX - r.left) / r.width) * W;
      const p = pts.reduce((a, b) => (Math.abs(X(b.step) - sx) < Math.abs(X(a.step) - sx) ? b : a));
      cross.setAttribute("x1", X(p.step)); cross.setAttribute("x2", X(p.step)); cross.setAttribute("opacity", 1);
      dots[0].setAttribute("cx", X(p.step)); dots[0].setAttribute("cy", Y(p.train_loss));
      dots[1].setAttribute("cx", X(p.step)); dots[1].setAttribute("cy", Y(p.val_loss));
      dots.forEach((d) => d.setAttribute("opacity", 1));
      showTip(`step ${p.step}<br>train ${fmt(p.train_loss)} · val ${fmt(p.val_loss)}<br>lr ${p.lr.toExponential(1)}`, e.clientX, e.clientY);
    });
    hit.addEventListener("mouseleave", () => { hideTip(); cross.setAttribute("opacity", 0); dots.forEach((d) => d.setAttribute("opacity", 0)); });
  }

  /* ---------- Sweep small multiples ------------------------------------- */
  function sweepCharts() {
    const host = $("#sweep"); if (!host || !D.sweep) return;
    host.innerHTML = "";
    const names = { block_size: "Context length (pieces it can read back)", n_embd: "Model width (embedding size)", lr: "Learning rate" };
    const all = D.sweep.results.map((r) => r.best_val_loss);
    const lo = Math.floor(Math.min(...all) * 10) / 10 - 0.1, hi = Math.ceil(Math.max(...all) * 10) / 10;
    Object.keys(names).forEach((axis) => {
      const rows = D.sweep.results.filter((r) => r.axis === axis);
      const fig = document.createElement("figure"); fig.className = "sweep-fig";
      fig.innerHTML = `<figcaption>${names[axis]}</figcaption>`;
      const svg = el("svg", { role: "img", "aria-label": `${names[axis]} vs best validation loss` }, fig);
      host.appendChild(fig);
      const W = 260, H = 190, m = { l: 34, r: 8, t: 18, b: 26 };
      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      const bw = (W - m.l - m.r) / rows.length;
      const Y = (v) => m.t + (1 - (v - lo) / (hi - lo)) * (H - m.t - m.b);
      [lo, (lo + hi) / 2, hi].forEach((v) => {
        el("line", { x1: m.l, x2: W - m.r, y1: Y(v), y2: Y(v), stroke: "var(--grid)" }, svg);
        el("text", { x: m.l - 6, y: Y(v) + 3, "text-anchor": "end", class: "tick" }, svg).textContent = v.toFixed(2);
      });
      const best = Math.min(...rows.map((r) => r.best_val_loss));
      rows.forEach((r, i) => {
        const x = m.l + i * bw + bw * 0.2, w = bw * 0.6, y = Y(r.best_val_loss);
        const isBase = r.value === D.sweep.baseline[axis];
        // Dot plot, not bars: the y-axis doesn't start at zero, so bar length would mislead.
        el("circle", { cx: x + w / 2, cy: y, r: 6, fill: r.best_val_loss === best ? "var(--accent)" : "var(--ink-3)", stroke: "var(--paper-2)", "stroke-width": 2 }, svg);
        el("text", { x: x + w / 2, y: y - 12, "text-anchor": "middle", class: "dlabel" }, svg).textContent = r.best_val_loss.toFixed(3);
        el("text", { x: x + w / 2, y: H - 8, "text-anchor": "middle", class: "tick" }, svg).textContent = axis === "lr" ? r.value.toExponential(0).replace("e-", "e-") : r.value + (isBase ? "*" : "");
        const hit = el("rect", { x: m.l + i * bw, y: m.t, width: bw, height: H - m.t - m.b, fill: "transparent" }, svg);
        hit.addEventListener("mousemove", (e) => showTip(`${r.run}<br>best val ${fmt(r.best_val_loss)} · ${(r.params / 1e6).toFixed(2)}M params`, e.clientX, e.clientY));
        hit.addEventListener("mouseleave", hideTip);
      });
    });
    const tb = $("#sweep-table tbody");
    if (tb) tb.innerHTML = D.sweep.results.map((r) => `<tr><td>${({ block_size: "context length", n_embd: "width", lr: "learning rate" })[r.axis]}</td><td>${r.value}</td><td class="num">${fmt(r.best_val_loss)}</td><td class="num">${(r.params / 1e6).toFixed(2)}M</td></tr>`).join("");
  }

  /* ---------- Samples & merges ------------------------------------------ */
  const samples = $("#samples");
  if (samples) samples.innerHTML = D.samples.slice(0, 1).map((s) => `<pre class="sample">${escapeHtml(s.trim())}</pre>`).join("");
  const merges = $("#merges");
  if (merges) merges.innerHTML = D.merges_preview.map((m, i) => `<li title="merge #${i}, token id ${256 + i}"><code>${escapeHtml(vis(m))}</code></li>`).join("");

  function escapeHtml(s) { return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]); }

  const all = () => { renderAttn(); lossChart(); sweepCharts(); };
  all();
  let rt; window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(all, 150); });
  new MutationObserver(renderAttn).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", renderAttn);
})();
