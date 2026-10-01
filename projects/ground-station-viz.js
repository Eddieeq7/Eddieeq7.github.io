/* ==========================================================================
   Ground-station pipeline — in-browser model.
   Mirrors the C++ project: same 18-byte header + CRC-32 wire format, same
   sliding-window SequenceTracker, APID-sharded SPSC rings. Timing is slowed
   down ~10,000× so individual packets are visible; nothing here is live data.
   ========================================================================== */

(() => {
  "use strict";

  const canvas = document.getElementById("gs-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  /* ---------- Protocol (port of src/protocol.cpp) ------------------------ */

  const CRC_TABLE = (() => {
    const t = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[i] = c >>> 0;
    }
    return t;
  })();
  const crc32 = (bytes, end) => {
    let c = 0xffffffff;
    for (let i = 0; i < end; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };

  const HEADER = 18, PAYLOAD = 8, FRAME = HEADER + PAYLOAD + 4;
  const APIDS = [
    { id: 1, name: "EPS", short: "E", what: "bus voltage" },
    { id: 2, name: "ADCS", short: "A", what: "body rate" },
    { id: 3, name: "THERMAL", short: "T", what: "panel temp" },
  ];

  function encode(apid, seq, t) {
    const b = new Uint8Array(FRAME);
    const dv = new DataView(b.buffer);
    dv.setUint16(0, 0x5a47, true);
    b[2] = 1;
    b[3] = apid;
    dv.setUint32(4, seq >>> 0, true);
    dv.setBigUint64(8, BigInt(Math.floor(t * 1e6)), true);
    dv.setUint16(16, PAYLOAD, true);
    const v = apid === 1 ? 28 + 0.4 * Math.sin(seq / 9) : apid === 2 ? 0.05 * Math.cos(seq / 3) : 21 + 6 * Math.sin(seq / 17);
    dv.setFloat32(18, v, true);
    dv.setFloat32(22, seq % 1000, true);
    dv.setUint32(HEADER + PAYLOAD, crc32(b, HEADER + PAYLOAD), true);
    return b;
  }

  function decode(b) {
    const dv = new DataView(b.buffer);
    if (b.length < HEADER + 4) return { err: "too_short" };
    if (dv.getUint16(0, true) !== 0x5a47) return { err: "bad_magic" };
    if (b[2] !== 1) return { err: "bad_version" };
    const len = dv.getUint16(16, true);
    if (b.length !== HEADER + len + 4) return { err: "length_mismatch" };
    const want = dv.getUint32(HEADER + len, true), got = crc32(b, HEADER + len);
    if (want !== got) return { err: "bad_crc", want, got };
    return { apid: b[3], seq: dv.getUint32(4, true), value: dv.getFloat32(18, true), crc: got };
  }

  /* ---------- SequenceTracker (port of src/sequence_tracker.cpp) --------- */

  const WINDOW = 1024;
  class Tracker {
    constructor() { this.reset(); }
    reset() {
      this.started = false; this.highest = 0; this.win = new Uint8Array(WINDOW);
      this.s = { received: 0, lost: 0, duplicates: 0, reordered: 0 };
    }
    observe(seq) {
      const s = this.s;
      if (!this.started) { this.started = true; this.highest = seq; this.win[seq % WINDOW] = 1; s.received++; return { v: "FIRST" }; }
      const delta = (seq - this.highest) | 0;
      if (delta > 0) {
        for (let i = 1; i <= Math.min(delta, WINDOW); i++) this.win[(this.highest + i) % WINDOW] = 0;
        this.highest = seq; this.win[seq % WINDOW] = 1; s.received++;
        if (delta === 1) return { v: "IN ORDER" };
        s.lost += delta - 1;
        return { v: "GAP", n: delta - 1 };
      }
      if (delta === 0 || (-delta < WINDOW && this.win[seq % WINDOW])) { s.duplicates++; return { v: "DUPLICATE" }; }
      this.win[seq % WINDOW] = 1; s.received++; s.reordered++;
      if (s.lost > 0) s.lost--;
      return { v: "REORDERED" };
    }
  }

  /* ---------- State ------------------------------------------------------ */

  const RING_CAP = 8;
  const cfg = { rate: 6, loss: 5, jitter: 600, dup: 3, corrupt: 2, workers: 2, service: 7 };
  let packets, socketQ, rings, workers, trackers, seqs, totals, nextEmit, apidTurn, inspected, logLines;

  function reset() {
    packets = []; socketQ = [];
    rings = Array.from({ length: cfg.workers }, () => []);
    workers = Array.from({ length: cfg.workers }, () => ({ busy: null, nextAt: 0, flash: null }));
    trackers = Object.fromEntries(APIDS.map((a) => [a.id, new Tracker()]));
    seqs = { 1: 0, 2: 0, 3: 0 };
    totals = { sent: 0, datagrams: 0, crc: 0, ringFull: 0, injectedLoss: 0 };
    nextEmit = 0; apidTurn = 0; inspected = null; logLines = [];
    renderStats(); renderLog(); renderInspector();
  }

  /* ---------- Layout ----------------------------------------------------- */

  let W = 0, H = 0, dpr = 1;
  const L = {};
  function layout() {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const narrow = W < 640;
    L.narrow = narrow;
    L.satX = narrow ? 26 : 54;
    L.linkA = L.satX + (narrow ? 18 : 34);
    L.linkB = W * (narrow ? 0.36 : 0.38);
    L.sockX = W * (narrow ? 0.43 : 0.445);
    L.rxX = W * (narrow ? 0.53 : 0.535);
    L.ringA = W * 0.6; L.ringB = W * (narrow ? 0.8 : 0.79);
    L.workX = W * (narrow ? 0.9 : 0.885);
    L.top = 46; L.bot = H - 22;
    L.pw = narrow ? 18 : 26; L.ph = narrow ? 11 : 15;
  }
  const satY = (apid) => L.top + ((L.bot - L.top) * (apid - 0.5)) / 3;
  const laneY = (w) => L.top + ((L.bot - L.top) * (w + 0.5)) / cfg.workers;
  const slotX = (i) => L.ringA + ((L.ringB - L.ringA) * (i + 0.5)) / RING_CAP;

  /* ---------- Colors ----------------------------------------------------- */

  let C = {};
  function readColors() {
    const s = getComputedStyle(document.documentElement);
    const g = (n) => s.getPropertyValue(n).trim();
    C = {
      ink: g("--ink"), ink2: g("--ink-2"), ink3: g("--ink-3"), rule: g("--rule"), rule2: g("--rule-strong"),
      paper: g("--paper"), paper2: g("--paper-2"), accent: g("--accent"),
      s: { 1: g("--series-1"), 2: g("--series-2"), 3: g("--series-3") },
      good: g("--good"), warn: g("--warn"), crit: g("--critical"),
    };
  }

  /* ---------- Simulation ------------------------------------------------- */

  const rnd = Math.random;
  let now = 0;

  function emit() {
    const a = APIDS[apidTurn++ % 3];
    const seq = seqs[a.id]++;
    const bytes = encode(a.id, seq, now);
    totals.sent++;
    const travel = 1500 + rnd() * cfg.jitter;
    const p = { apid: a.id, seq, bytes, stage: "link", t0: now, t1: now + travel, x: L.satX, y: satY(a.id), alpha: 1, corrupt: false };
    if (rnd() < cfg.loss / 100) { p.dieAt = 0.35 + rnd() * 0.45; totals.injectedLoss++; }
    if (rnd() < cfg.corrupt / 100) p.corruptAt = 0.3 + rnd() * 0.5;
    packets.push(p);
    if (rnd() < cfg.dup / 100) {
      packets.push({ ...p, bytes: bytes.slice(), dieAt: undefined, corruptAt: undefined, t1: now + 1500 + rnd() * cfg.jitter, dup: true });
    }
  }

  function step(dt) {
    now += dt;
    const interval = 1000 / cfg.rate;
    while (nextEmit <= now) { emit(); nextEmit += interval; }

    for (const p of packets) {
      if (p.stage === "link") {
        const k = Math.min(1, (now - p.t0) / (p.t1 - p.t0));
        p.x = L.linkA + (L.linkB - L.linkA) * k;
        p.y = satY(p.apid) + (L.top + (L.bot - L.top) / 2 - satY(p.apid)) * easeInOut(k);
        if (p.corruptAt !== undefined && k >= p.corruptAt && !p.corrupt) {
          p.corrupt = true;
          const byte = Math.floor(rnd() * FRAME), bit = Math.floor(rnd() * 8);
          p.bytes[byte] ^= 1 << bit;
          p.flipped = { byte, bit };
        }
        if (p.dieAt !== undefined && k >= p.dieAt) { p.stage = "lost"; p.tDie = now; }
        else if (k >= 1) { p.stage = "socket"; socketQ.push(p); totals.datagrams++; }
      } else if (p.stage === "lost") {
        p.alpha = Math.max(0, 1 - (now - p.tDie) / 700);
        if (p.alpha === 0) p.dead = true;
      } else if (p.stage === "toRing" || p.stage === "toWorker" || p.stage === "dropRing") {
        const k = Math.min(1, (now - p.m0) / p.md);
        p.x = p.fx + (p.tx - p.fx) * easeInOut(k);
        p.y = p.fy + (p.ty - p.fy) * easeInOut(k);
        if (k >= 1) {
          if (p.stage === "toRing") p.stage = "ring";
          else if (p.stage === "toWorker") finishAtWorker(p);
          else { p.stage = "lost"; p.tDie = now; }
        }
      } else if (p.stage === "done") {
        p.alpha = Math.max(0, 1 - (now - p.tDone) / 900);
        if (p.alpha === 0) p.dead = true;
      }
    }

    // Receive thread: epoll wakes when the socket is readable, drains to EAGAIN.
    if (socketQ.length) {
      while (socketQ.length) {
        const p = socketQ.shift();
        const shard = p.bytes.length > 3 ? p.bytes[3] % cfg.workers : 0;
        const ring = rings[shard];
        if (ring.length >= RING_CAP) {
          totals.ringFull++;
          log(`${apidName(p.apid)} seq ${p.seq} → ring ${shard} full, dropped (counted)`, "crit");
          move(p, "dropRing", L.rxX + 30, laneY(shard) + 24, 320);
        } else {
          ring.push(p);
          p.ring = shard;
          move(p, "toRing", slotX(ring.length - 1), laneY(shard), 320);
        }
      }
    }

    // Keep ring slot positions packed (head at the left); in-flight frames retarget.
    rings.forEach((ring, w) => ring.forEach((p, i) => {
      if (p.stage === "ring") { p.x = slotX(i); p.y = laneY(w); } else if (p.stage === "toRing") p.tx = slotX(i);
    }));

    // Workers pop from their own ring only.
    workers.forEach((wk, w) => {
      if (wk.busy || now < wk.nextAt) return;
      const head = rings[w][0];
      if (!head || head.stage !== "ring") return;
      rings[w].shift();
      wk.busy = head;
      move(head, "toWorker", L.workX, laneY(w), 260);
      head.worker = w;
      wk.nextAt = now + 1000 / cfg.service;
    });

    packets = packets.filter((p) => !p.dead);
  }

  function finishAtWorker(p) {
    const wk = workers[p.worker];
    wk.busy = null;
    const d = decode(p.bytes);
    inspected = { p, d };
    renderInspector();
    if (d.err) {
      totals.crc += d.err === "bad_crc" ? 1 : 0;
      wk.flash = { text: d.err === "bad_crc" ? "CRC ✕" : d.err, color: C.crit, t: now };
      log(`${apidName(p.apid)} frame rejected: ${d.err}${p.flipped ? ` (bit ${p.flipped.bit} of byte ${p.flipped.byte} flipped in transit)` : ""}`, "crit");
    } else {
      const r = trackers[d.apid].observe(d.seq);
      const label = r.v === "GAP" ? `GAP +${r.n} lost` : r.v;
      const color = r.v === "IN ORDER" || r.v === "FIRST" ? C.good : r.v === "GAP" ? C.crit : C.warn;
      wk.flash = { text: label, color, t: now };
      if (r.v !== "IN ORDER" && r.v !== "FIRST")
        log(`${apidName(d.apid)} seq ${d.seq} → ${label}${r.v === "REORDERED" ? " (lost count corrected)" : ""}`, r.v === "GAP" ? "crit" : "warn");
    }
    p.stage = "done"; p.tDone = now; p.verdictBad = !!d.err;
    renderStats();
  }

  function move(p, stage, tx, ty, ms) {
    p.stage = stage; p.fx = p.x; p.fy = p.y; p.tx = tx; p.ty = ty; p.m0 = now; p.md = ms;
  }
  const easeInOut = (k) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
  const apidName = (id) => APIDS[id - 1].name;

  /* ---------- Drawing ---------------------------------------------------- */

  function rr(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function label(text, x, y, color, align = "center", size = 10) {
    ctx.font = `500 ${size}px "JetBrains Mono", ui-monospace, monospace`;
    ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = "middle";
    ctx.fillText(text, x, y);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const fs = L.narrow ? 8 : 10;

    // Stage headings
    const heads = [[L.satX, "SAT"], [(L.linkA + L.linkB) / 2, L.narrow ? "LINK" : "RF LINK · loss/jitter"], [L.sockX, "UDP"],
                   [L.rxX, L.narrow ? "RX" : "RX · epoll"], [(L.ringA + L.ringB) / 2, L.narrow ? "SPSC" : "SPSC rings"], [L.workX, "WORKERS"]];
    heads.forEach(([x, t]) => label(t, x, 18, C.ink3, "center", fs));

    // Satellite sources
    APIDS.forEach((a) => {
      const y = satY(a.id);
      ctx.fillStyle = C.s[a.id];
      ctx.beginPath(); ctx.arc(L.satX, y, L.narrow ? 6 : 8, 0, Math.PI * 2); ctx.fill();
      if (!L.narrow) label(a.name, L.satX, y + 18, C.ink2, "center", 9);
    });

    // Link band
    ctx.strokeStyle = C.rule2; ctx.setLineDash([3, 5]); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(L.linkA, L.top - 6); ctx.lineTo(L.linkB, L.top - 6); ctx.moveTo(L.linkA, L.bot + 6); ctx.lineTo(L.linkB, L.bot + 6); ctx.stroke();
    ctx.setLineDash([]);

    // Socket + RX boxes
    const midY = L.top + (L.bot - L.top) / 2;
    ctx.strokeStyle = C.rule2; ctx.lineWidth = 1;
    rr(L.sockX - 14, L.top, 28, L.bot - L.top, 3); ctx.stroke();
    const rxActive = socketQ.length > 0 || packets.some((p) => p.stage === "toRing" || p.stage === "dropRing");
    ctx.strokeStyle = rxActive ? C.accent : C.rule2;
    rr(L.rxX - 16, midY - 30, 32, 60, 3); ctx.stroke();
    label(rxActive ? "●" : "○", L.rxX, midY, rxActive ? C.accent : C.ink3, "center", 12);

    // Rings
    for (let w = 0; w < cfg.workers; w++) {
      const y = laneY(w), cw = (L.ringB - L.ringA) / RING_CAP;
      for (let i = 0; i < RING_CAP; i++) {
        ctx.strokeStyle = C.rule; rr(L.ringA + i * cw + 1, y - L.ph / 2 - 4, cw - 2, L.ph + 8, 2); ctx.stroke();
      }
      const fill = rings[w].length / RING_CAP;
      ctx.fillStyle = fill >= 1 ? C.crit : fill > 0.6 ? C.warn : C.rule2;
      ctx.fillRect(L.ringA, y + L.ph / 2 + 8, (L.ringB - L.ringA) * fill, 2);
      if (!L.narrow) label(`ring ${w} · ${rings[w].length}/${RING_CAP}`, L.ringA, y - L.ph / 2 - 14, C.ink3, "left", 9);

      // worker box + verdict flash
      const wk = workers[w];
      ctx.strokeStyle = wk.busy ? C.ink : C.rule2;
      rr(L.workX - L.pw / 2 - 8, y - L.ph / 2 - 8, L.pw + 16, L.ph + 16, 3); ctx.stroke();
      if (wk.flash && now - wk.flash.t < 1100) {
        ctx.globalAlpha = Math.max(0, 1 - (now - wk.flash.t) / 1100);
        label(wk.flash.text, L.workX, y + L.ph / 2 + 20, wk.flash.color, "center", L.narrow ? 8 : 10);
        ctx.globalAlpha = 1;
      }
      if (!L.narrow) label(`w${w}`, L.workX + L.pw / 2 + 16, y, C.ink3, "left", 9);
    }

    // Packets
    for (const p of packets) {
      ctx.globalAlpha = p.alpha;
      const x = p.x - L.pw / 2, y = p.y - L.ph / 2;
      ctx.fillStyle = C.s[p.apid];
      rr(x, y, L.pw, L.ph, 3); ctx.fill();
      if (p.dup) { ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.setLineDash([2, 2]); rr(x - 2, y - 2, L.pw + 4, L.ph + 4, 4); ctx.stroke(); ctx.setLineDash([]); }
      if (p.corrupt) { ctx.fillStyle = C.crit; ctx.beginPath(); ctx.arc(x + L.pw, y, 3.5, 0, Math.PI * 2); ctx.fill(); }
      if (!L.narrow) label(`${APIDS[p.apid - 1].short}${p.seq}`, p.x, p.y + 0.5, "#fff", "center", 9);
      if (p.stage === "lost") label("✕", p.x, p.y - L.ph, C.crit, "center", 11);
      ctx.globalAlpha = 1;
    }
  }

  /* ---------- Side panels ------------------------------------------------ */

  const $ = (s) => document.querySelector(s);
  const statsBody = $("#gs-stats tbody"), statsFoot = $("#gs-stats tfoot");
  function renderStats() {
    if (!statsBody) return;
    statsBody.innerHTML = APIDS.map((a) => {
      const s = trackers[a.id].s;
      return `<tr><td><span class="swatch" style="background:var(--series-${a.id})"></span>${a.name}</td>
        <td class="num">${s.received}</td><td class="num">${s.lost}</td><td class="num">${s.duplicates}</td><td class="num">${s.reordered}</td></tr>`;
    }).join("");
    statsFoot.innerHTML = `<tr><td colspan="5">datagrams ${totals.datagrams} · CRC rejects ${totals.crc} · ring-full drops ${totals.ringFull} · <span title="ground truth the station can't see">injected loss ${totals.injectedLoss}</span></td></tr>`;
  }

  const logEl = $("#gs-log");
  function log(text, kind) {
    logLines.unshift({ text, kind });
    logLines.length = Math.min(logLines.length, 7);
    renderLog();
  }
  function renderLog() {
    if (!logEl) return;
    logEl.innerHTML = logLines.length
      ? logLines.map((l) => `<li data-k="${l.kind}">${l.text}</li>`).join("")
      : `<li class="muted">Anomalies show up here as the workers classify them.</li>`;
  }

  const insEl = $("#gs-inspector");
  function renderInspector() {
    if (!insEl) return;
    if (!inspected) { insEl.innerHTML = `<p class="muted">Waiting for the first frame to reach a worker…</p>`; return; }
    const { p, d } = inspected;
    const b = p.bytes;
    const fields = [["magic", 0, 2], ["ver", 2, 1], ["apid", 3, 1], ["seq", 4, 4], ["tx_ns", 8, 8], ["len", 16, 2], ["payload", 18, 8], ["crc32", 26, 4]];
    const hex = fields.map(([n, o, l]) => {
      const cells = Array.from(b.slice(o, o + l), (v, i) => {
        const flipped = p.flipped && p.flipped.byte === o + i;
        return `<span${flipped ? ' class="flip"' : ""}>${v.toString(16).padStart(2, "0")}</span>`;
      }).join(" ");
      return `<div class="f f-${n}"><b>${n}</b><code>${cells}</code></div>`;
    }).join("");
    const verdict = d.err
      ? `<span class="bad">rejected · ${d.err}</span>${d.err === "bad_crc" ? ` — computed <code>${d.got.toString(16).padStart(8, "0")}</code> ≠ received <code>${d.want.toString(16).padStart(8, "0")}</code>` : ""}`
      : `<span class="ok">valid</span> · ${apidName(d.apid)} seq ${d.seq} · ${APIDS[d.apid - 1].what} ${d.value.toFixed(2)} · crc <code>${d.crc.toString(16).padStart(8, "0")}</code>`;
    insEl.innerHTML = `<div class="hex">${hex}</div><p class="verdict">${verdict}</p>`;
  }

  /* ---------- Controls --------------------------------------------------- */

  document.querySelectorAll("[data-gs]").forEach((input) => {
    const key = input.dataset.gs, out = input.closest(".ctl")?.querySelector("output");
    const fmt = (v) => (key === "jitter" ? `±${v} ms` : key === "rate" || key === "service" ? `${v}/s` : `${v}%`);
    const sync = () => { cfg[key] = Number(input.value); if (out) out.textContent = fmt(input.value); };
    input.addEventListener("input", sync); sync();
  });
  document.querySelectorAll("[data-workers]").forEach((b) => b.addEventListener("click", () => {
    cfg.workers = Number(b.dataset.workers);
    document.querySelectorAll("[data-workers]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    reset(); layout();
  }));
  $("#gs-reset")?.addEventListener("click", reset);
  $("#gs-burst")?.addEventListener("click", () => { for (let i = 0; i < 36; i++) { emit(); } });
  const playBtn = $("#gs-play");
  let playing = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const syncPlay = () => { if (playBtn) playBtn.textContent = playing ? "Pause" : "Play"; };
  playBtn?.addEventListener("click", () => { playing = !playing; syncPlay(); });
  syncPlay();

  /* ---------- Loop ------------------------------------------------------- */

  let visible = true, last = performance.now();
  if ("IntersectionObserver" in window) new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);
  function frame(t) {
    const dt = Math.min(64, t - last); last = t;
    if (playing && visible && !document.hidden) step(dt);
    draw();
    requestAnimationFrame(frame);
  }

  readColors(); layout(); reset();
  // ?ff=<ms> fast-forwards the model (used for screenshots).
  const ff = Number(new URLSearchParams(location.search).get("ff")) || 0;
  for (let t = 0; t < ff; t += 16) step(16);
  new MutationObserver(readColors).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", readColors);
  window.addEventListener("resize", layout);
  requestAnimationFrame(frame);
})();
