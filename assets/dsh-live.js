/* dsh-live.js - the red-amber-green bench for learn-dashboard-design-with-phoebe
 *
 * Real numbers: 581 days of the Brazilian E-Commerce Public Dataset by Olist (Kaggle, CC BY-NC-SA
 * 4.0), shipped as DERIVED daily aggregates only in dsh-daily.js (orders placed, revenue, mean
 * delivery delay against the estimate, late share). The running case, Saltmarsh, is constructed;
 * the series are Olist's.
 *
 * What is MEASURED here, in the browser, for the reader's thresholds on one KPI card:
 *   the colour of the card on every scored day, false-alarm days per month, separate alarm
 *   episodes, missed changes, detection delay, time in each colour, and the rolling context band.
 * What is a RULE of this course, printed on the widget, not a fact about Olist:
 *   a REAL change is a sustained shift for the worse found by a window-sliding search (two adjacent
 *   28-day windows, robust discrepancy >= 2.0, peaks at least 28 days apart).
 * Ladder: fixed -> spread -> band -> persist -> score; anti-lever "tighten"; break button "hide".
 * The Python reference (materials/dsh-reference.py) runs the same steps in the same order and must
 * print the same numbers (materials/compare-ladder.py). selfTest() runs on load.
 */
(function (root) {
  "use strict";

  var W = 28, TW = 28, K = 2.0, D = 14, MONTH = 30.4375;
  var KPIS = [
    { key: "late", label: "Late deliveries", sign: 1, scale: 1000, unit: "% of delivered orders after the estimate", fmt: function (v) { return (v * 100).toFixed(1) + "%"; }, question: "Are deliveries slipping this week?" },
    { key: "delay", label: "Delivery vs estimate", sign: 1, scale: 10, unit: "days, delivered minus estimated (negative = early)", fmt: function (v) { return (v > 0 ? "+" : "") + v.toFixed(1) + " d"; }, question: "How far from the promised date are we landing?" },
    { key: "orders", label: "Orders placed", sign: -1, scale: 1, unit: "orders per day", fmt: function (v) { return Math.round(v).toLocaleString("en-US"); }, question: "Did demand fall?" },
    { key: "revenue", label: "Revenue", sign: -1, scale: 1, unit: "BRL of items ordered per day", fmt: function (v) { return "R$ " + Math.round(v).toLocaleString("en-US"); }, question: "Did the money fall?" }
  ];
  var RUNGS = [
    { id: "fixed", label: "1 · Fixed thresholds", note: "Set at launch from the first 28 days (median + 1 s amber, + 2 s red) and never revisited." },
    { id: "spread", label: "2 · From the series' spread", note: "Median and spread of the WHOLE series. Hindsight: nobody has this on launch day." },
    { id: "band", label: "3 · A context band on the card", note: "Trailing 28-day median and spread, recomputed daily; the card draws the band and colours against it." },
    { id: "persist", label: "4 · + persistence", note: "Band, and the colour changes only after two consecutive days agree." },
    { id: "score", label: "5 · The scorecard", note: "Rung 4 on all four cards side by side: which card earns its colour?" },
    { id: "tighten", label: "Tighten to catch everything", anti: true, note: "Rung 4 with amber at 0.5 s and red at 1 s. Misses go to zero; look at what it costs." },
    { id: "hide", label: "Hide the variance", brk: true, note: "Show a 28-day average as the point, no band, against the static thresholds. The card looks calm." }
  ];

  /* ---------- engine (mirrors dsh-reference.py, step for step) ---------- */
  function median(xs) {
    var ys = xs.slice().sort(function (a, b) { return a - b; });
    var m = ys.length >> 1;
    return ys.length % 2 ? ys[m] : (ys[m - 1] + ys[m]) / 2;
  }
  function spread(xs, m) {
    var d = new Array(xs.length);
    for (var i = 0; i < xs.length; i++) d[i] = Math.abs(xs[i] - m);
    return 1.4826 * median(d);
  }
  function series(data, kpi) {
    return data[kpi.key].map(function (x) { return kpi.sign * x / kpi.scale; });
  }
  function truth(u) {
    var n = u.length, disc = new Array(n), t, i;
    for (t = 0; t < n; t++) disc[t] = 0;
    for (t = TW; t <= n - TW; t++) {
      var left = u.slice(t - TW, t), ml = median(left), s = spread(left, ml);
      if (s < 1e-9) s = 1e-9;
      disc[t] = (median(u.slice(t, t + TW)) - ml) / s;
    }
    var peaks = [];
    for (t = TW + 1; t < n - TW; t++) if (disc[t] >= K && disc[t] >= disc[t - 1] && disc[t] > disc[t + 1]) peaks.push(t);
    peaks.sort(function (a, b) { return disc[b] - disc[a] || a - b; });
    var chosen = [];
    for (i = 0; i < peaks.length; i++) {
      var ok = true;
      for (var j = 0; j < chosen.length; j++) if (Math.abs(peaks[i] - chosen[j]) < TW) { ok = false; break; }
      if (ok) chosen.push(peaks[i]);
    }
    chosen.sort(function (a, b) { return a - b; });
    return { changes: chosen, disc: disc };
  }
  function states(u, rung, kA, kR) {
    var n = u.length, st = new Array(n), band = new Array(n), t, m, s, A, R;
    for (t = 0; t < n; t++) { st[t] = -1; band[t] = null; }
    if (rung === "fixed") {
      m = median(u.slice(0, W)); s = spread(u.slice(0, W), m); A = m + kA * s; R = m + kR * s;
      for (t = W; t < n; t++) { st[t] = u[t] >= R ? 2 : u[t] >= A ? 1 : 0; band[t] = [m - s, m, m + s]; }
    } else if (rung === "spread" || rung === "hide") {
      m = median(u); s = spread(u, m); A = m + kA * s; R = m + kR * s;
      for (t = W; t < n; t++) {
        var x = u[t];
        if (rung === "hide") { x = 0; for (var q = t - W + 1; q <= t; q++) x += u[q]; x = x / W; }
        st[t] = x >= R ? 2 : x >= A ? 1 : 0;
        band[t] = rung === "spread" ? [m - s, m, m + s] : null;
      }
    } else {
      var raw = new Array(n);
      for (t = 0; t < n; t++) raw[t] = -1;
      for (t = W; t < n; t++) {
        var win = u.slice(t - W, t); m = median(win); s = spread(win, m);
        raw[t] = u[t] >= m + kR * s ? 2 : u[t] >= m + kA * s ? 1 : 0;
        band[t] = [m - s, m, m + s];
      }
      if (rung === "band") st = raw;
      else { st[W] = raw[W]; for (t = W + 1; t < n; t++) st[t] = raw[t] === raw[t - 1] ? raw[t] : st[t - 1]; }
    }
    return { st: st, band: band };
  }
  function round2(x) { return Math.round(x * 100) / 100; }
  function round4(x) { return Math.round(x * 10000) / 10000; }
  function score(st, changes, n) {
    var S = W, E = n - TW, days = E - S, counts = [0, 0, 0], t, i;
    for (t = S; t < E; t++) counts[st[t]] += 1;
    var episodes = [];
    t = S;
    while (t < E) {
      if (st[t] > 0) { var a = t; while (t < E && st[t] > 0) t++; episodes.push([a, t]); }
      else t++;
    }
    function inWindow(day) { for (var k = 0; k < changes.length; k++) if (changes[k] <= day && day < changes[k] + D) return true; return false; }
    var falseEps = 0;
    for (i = 0; i < episodes.length; i++) {
      var hit = false;
      for (t = episodes[i][0]; t < episodes[i][1]; t++) if (inWindow(t)) { hit = true; break; }
      if (!hit) falseEps++;
    }
    var falseDays = 0;
    for (t = S; t < E; t++) if (st[t] > 0 && !inWindow(t)) falseDays++;
    var detected = 0, delays = [];
    for (i = 0; i < changes.length; i++) {
      var c = changes[i], first = null;
      for (t = c; t < Math.min(c + D, E); t++) if (st[t] > 0) { first = t; break; }
      if (first === null) continue;
      detected++; delays.push(first - c);
    }
    var sumD = 0; for (i = 0; i < delays.length; i++) sumD += delays[i];
    return {
      scoredDays: days, changes: changes.length, episodes: episodes.length, falseEpisodes: falseEps,
      alarmsPerMonth: round2(falseEps / (days / MONTH)), falseDays: falseDays,
      falseDaysPerMonth: round2(falseDays / (days / MONTH)), missed: changes.length - detected,
      meanDelay: delays.length ? round2(sumD / delays.length) : null,
      share: counts.map(function (c) { return round4(c / days); }),
      episodeList: episodes
    };
  }
  function params(rung) { return rung === "tighten" ? [0.5, 1.0] : [1.0, 2.0]; }
  var CANON_RUNGS = ["fixed", "spread", "band", "persist", "tighten", "hide"];
  function canon(data) {
    var out = { n: data.n, start: data.start, end: data.end, rule: { W: W, TW: TW, K: K, D: D }, kpis: {} };
    KPIS.forEach(function (kpi) {
      var u = series(data, kpi), tr = truth(u), row = { changes: tr.changes, rungs: {} };
      CANON_RUNGS.forEach(function (rung) {
        var p = params(rung), sc = score(states(u, rung, p[0], p[1]).st, tr.changes, data.n);
        delete sc.episodeList;
        row.rungs[rung] = sc;
      });
      out.kpis[kpi.key] = row;
    });
    return out;
  }
  function selfTest() {
    var n = 200, step = 120, seed = 12345, u = [], i;
    for (i = 0; i < n; i++) {
      seed = (48271 * seed) % 2147483647;
      u.push((i < step ? 10.0 : 22.0) + (seed / 2147483647 - 0.5));
    }
    var ch = truth(u).changes;
    if (ch.length !== 1 || Math.abs(ch[0] - step) > 1) return false;
    var sc = score(states(u, "persist", 1.0, 2.0).st, ch, n);
    if (Math.abs(sc.share[0] + sc.share[1] + sc.share[2] - 1) > 1e-3 || sc.missed !== 0) return false;
    var sc2 = score(states(u, "band", 1e9, 1e9).st, ch, n);
    if (sc2.episodes !== 0 || sc2.missed !== 1) return false;
    return true;
  }

  /* ---------- UI ---------- */
  var rootEl, data, els = {}, cache = {};
  var state = { kpi: "late", rung: "persist", kA: 1.0, kR: 2.0, day: null };
  var COL = ["var(--state-green)", "var(--state-amber)", "var(--state-red)"];
  var COL50 = ["var(--state-green-50)", "var(--state-amber-50)", "var(--state-red-50)"];
  var NAMES = ["green", "amber", "red"];

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function kpiOf(key) { for (var i = 0; i < KPIS.length; i++) if (KPIS[i].key === key) return KPIS[i]; return KPIS[0]; }
  function dateOf(i) {
    var d = new Date(data.start + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() + i);
    return d.toISOString().slice(0, 10);
  }
  function prep(key) {
    if (!cache[key]) { var kpi = kpiOf(key), u = series(data, kpi); cache[key] = { kpi: kpi, u: u, tr: truth(u) }; }
    return cache[key];
  }
  function run(key, rung, kA, kR) {
    var p = prep(key), r = rung === "score" ? "persist" : rung;
    var ks = r === "tighten" ? [0.5, 1.0] : [kA, kR];
    var s = states(p.u, r, ks[0], ks[1]);
    return { st: s.st, band: s.band, sc: score(s.st, p.tr.changes, data.n), ks: ks, changes: p.tr.changes, u: p.u, kpi: p.kpi };
  }
  function shown(kpi, v) { return kpi.fmt(kpi.sign * v); }

  function buildUI() {
    var h = '<div class="dsh-top">' +
      '<label class="dsh-pick">KPI card <select id="dsh-kpi">' + KPIS.map(function (k) { return '<option value="' + k.key + '">' + esc(k.label) + '</option>'; }).join("") + '</select></label>' +
      '<span class="dsh-q" id="dsh-q"></span></div>' +
      '<div class="mb-presets" id="dsh-rungs">' + RUNGS.map(function (r) {
        return '<label class="mb-preset' + (r.anti || r.brk ? " is-anti" : "") + '" data-rung="' + r.id + '"><input type="radio" name="dsh-rung" value="' + r.id + '">' +
          '<span class="mb-pname">' + esc(r.label) + (r.anti ? ' <em class="mb-anti">anti-lever</em>' : "") + (r.brk ? ' <em class="mb-anti">break</em>' : "") + '</span>' +
          '<span class="mb-pnote">' + esc(r.note) + '</span></label>';
      }).join("") + '</div>' +
      '<div class="dsh-sliders" id="dsh-sliders">' +
      '<label>Amber at <input type="range" id="dsh-ka" min="0.25" max="3" step="0.25" value="1"><output id="dsh-kao">1.0 s</output></label>' +
      '<label>Red at <input type="range" id="dsh-kr" min="0.5" max="4" step="0.25" value="2"><output id="dsh-kro">2.0 s</output></label>' +
      '<label>Day <input type="range" id="dsh-day" min="' + W + '" max="' + (data.n - TW - 1) + '" step="1" value="' + (data.n - TW - 1) + '"><output id="dsh-dayo"></output></label>' +
      '</div>' +
      '<p class="mb-verdict" id="dsh-verdict"></p>' +
      '<div class="dsh-grid"><div class="dsh-cardwrap" id="dsh-card"></div><div class="mb-metrics" id="dsh-metrics"></div></div>' +
      '<div class="ab-card"><h4>Every scored day, coloured by your thresholds <span class="mb-mkind is-measured">measured</span></h4><div class="dsh-stage" id="dsh-strip"></div></div>' +
      '<div class="ab-card" id="dsh-score" hidden><h4>Scorecard: all four cards at rung 4 <span class="mb-mkind is-measured">measured</span></h4><div class="dt-tablewrap" id="dsh-scoretab"></div></div>' +
      '<p class="mb-hint" id="dsh-rule"></p><p class="mb-hint" id="dsh-src"></p>';
    rootEl.innerHTML = h;
    els.kpi = rootEl.querySelector("#dsh-kpi"); els.q = rootEl.querySelector("#dsh-q");
    els.ka = rootEl.querySelector("#dsh-ka"); els.kr = rootEl.querySelector("#dsh-kr"); els.day = rootEl.querySelector("#dsh-day");
    els.kao = rootEl.querySelector("#dsh-kao"); els.kro = rootEl.querySelector("#dsh-kro"); els.dayo = rootEl.querySelector("#dsh-dayo");
    els.verdict = rootEl.querySelector("#dsh-verdict"); els.card = rootEl.querySelector("#dsh-card"); els.metrics = rootEl.querySelector("#dsh-metrics");
    els.strip = rootEl.querySelector("#dsh-strip"); els.score = rootEl.querySelector("#dsh-score"); els.scoretab = rootEl.querySelector("#dsh-scoretab");
    els.rule = rootEl.querySelector("#dsh-rule"); els.src = rootEl.querySelector("#dsh-src"); els.sliders = rootEl.querySelector("#dsh-sliders");
    els.kpi.value = state.kpi;
    els.kpi.addEventListener("change", function () { state.kpi = els.kpi.value; render(); });
    rootEl.querySelectorAll('input[name="dsh-rung"]').forEach(function (inp) {
      inp.addEventListener("change", function () { state.rung = inp.value; render(); });
    });
    els.ka.addEventListener("input", function () { state.kA = +els.ka.value; if (state.kR < state.kA) { state.kR = state.kA; els.kr.value = state.kR; } render(); });
    els.kr.addEventListener("input", function () { state.kR = +els.kr.value; if (state.kA > state.kR) { state.kA = state.kR; els.ka.value = state.kA; } render(); });
    els.day.addEventListener("input", function () { state.day = +els.day.value; render(); });
    state.day = +els.day.value;
    els.rule.textContent = "The course's rule for a real change (not a fact about Olist): orient each KPI so that larger is worse, slide two adjacent " + TW + "-day windows, " +
      "discrepancy = (median of the next " + TW + " days minus median of the previous " + TW + ") divided by 1.4826 x MAD of the previous " + TW + "; a real change is a peak of that curve at or above " + K.toFixed(1) +
      ", peaks at least " + TW + " days apart, worse direction only. A change counts as caught if the card leaves green within " + D + " days of it; any other non-green day is a false alarm. " +
      "Scored days: " + W + " to " + (data.n - TW - 1) + " of " + data.n + " (the rule needs " + TW + " days on each side). Window-sliding search after Truong, Oudre and Vayatis (2020), section 5.2.1. One-day spikes are not changes by this rule.";
    els.src.textContent = "Real numbers: " + data.n + " days, " + data.start + " to " + data.end + ", from the Brazilian E-Commerce Public Dataset by Olist (Kaggle, CC BY-NC-SA 4.0), shipped here as derived daily aggregates only: " +
      "orders placed, item revenue, mean delivery date minus estimated date, and the share delivered late, per calendar day; no order, customer, product or review leaves the source. " +
      "Trim: " + data.trim + ". Saltmarsh, the retailer in the sessions, is constructed; the series are Olist's.";
    rootEl.querySelector('input[value="' + state.rung + '"]').checked = true;
    render();
  }

  function metric(label, value, unit, kind) {
    return '<div class="mb-metric"><span class="mb-mlabel">' + esc(label) + '</span><span class="mb-mvalue">' + esc(value) + '</span>' +
      (unit ? '<span class="mb-munit">' + esc(unit) + '</span>' : "") + '<span class="mb-mkind ' + (kind === "rule" ? "is-heuristic" : "is-measured") + '">' + (kind === "rule" ? "course rule" : "measured") + '</span></div>';
  }

  function render() {
    var kpi = kpiOf(state.kpi), r = run(state.kpi, state.rung, state.kA, state.kR), sc = r.sc, n = data.n;
    var base = run(state.kpi, "persist", 1.0, 2.0).sc;
    els.q.textContent = kpi.question + " · " + kpi.unit;
    rootEl.querySelectorAll(".mb-preset").forEach(function (l) { l.classList.toggle("is-on", l.getAttribute("data-rung") === state.rung); });
    var fixedK = state.rung === "tighten";
    els.ka.disabled = fixedK; els.kr.disabled = fixedK;
    els.kao.textContent = r.ks[0].toFixed(2).replace(/\.?0+$/, "") + " s"; els.kro.textContent = r.ks[1].toFixed(2).replace(/\.?0+$/, "") + " s";
    if (fixedK) { els.ka.value = 0.5; els.kr.value = 1; } else { els.ka.value = state.kA; els.kr.value = state.kR; }
    var day = Math.min(Math.max(state.day, W), n - TW - 1);
    els.dayo.textContent = dateOf(day);

    /* the card */
    var v = r.u[day], st = r.st[day], band = r.band[day], prev = r.u[day - 1];
    var shownV = state.rung === "hide" ? (function () { var x = 0; for (var q = day - W + 1; q <= day; q++) x += r.u[q]; return x / W; })() : v;
    var delta = kpi.sign * (shownV - prev);
    var deltaTxt = (delta > 0 ? "+" : "") + (kpi.key === "late" ? (delta * 100).toFixed(1) + " pts" : kpi.key === "delay" ? delta.toFixed(1) + " d" : Math.round(delta).toLocaleString("en-US"));
    var cardH = '<div class="dsh-card" style="--sc:' + COL[st] + ';--sc50:' + COL50[st] + '">' +
      '<div class="dsh-chead"><span class="dsh-ctitle">' + esc(kpi.label) + '</span><span class="dsh-cstate">' + NAMES[st].toUpperCase() + '</span></div>' +
      '<div class="dsh-cval">' + esc(shown(kpi, shownV)) + '</div>' +
      '<div class="dsh-cdelta">' + esc(deltaTxt) + ' vs the day before' + (state.rung === "hide" ? ' · 28-day average shown' : '') + '</div>' +
      '<div class="dsh-cband">' + (band ? 'context band ' + esc(shown(kpi, band[0])) + ' to ' + esc(shown(kpi, band[2])) + ', middle ' + esc(shown(kpi, band[1])) +
        (state.rung === "band" || state.rung === "persist" || state.rung === "tighten" || state.rung === "score" ? ' (trailing 28 days)' : state.rung === "fixed" ? ' (first 28 days, frozen)' : ' (whole series)') : 'no band shown') + '</div>' +
      '<div class="dsh-cdate">' + dateOf(day) + ' · Saltmarsh weekly ops card (constructed), Olist numbers</div></div>';
    els.card.innerHTML = cardH;

    /* metrics */
    var m = metric("False-alarm days per month", sc.falseDaysPerMonth.toFixed(2), sc.falseDays + " red or amber days with no real change", "measured") +
      metric("Separate alarm episodes", String(sc.episodes), sc.falseEpisodes + " of them with no real change (" + sc.alarmsPerMonth.toFixed(2) + " per month)", "measured") +
      metric("Real changes missed", sc.missed + " of " + sc.changes, sc.changes ? "never flagged within " + D + " days" : "none for the worse in this span", "rule") +
      metric("Days to flag a change", sc.meanDelay === null ? (sc.changes ? "never" : "n/a") : sc.meanDelay.toFixed(1), "mean, from the change day", "measured") +
      metric("Time green / amber / red", (sc.share[0] * 100).toFixed(0) + " / " + (sc.share[1] * 100).toFixed(0) + " / " + (sc.share[2] * 100).toFixed(0) + "%", "of " + sc.scoredDays + " scored days", "measured");
    els.metrics.innerHTML = m;

    /* verdict */
    var vt, cls = "is-ok";
    if (state.rung === "tighten") {
      cls = "is-bad";
      vt = "Worse decision: misses " + base.missed + " to " + sc.missed + ", but false-alarm days per month " + base.falseDaysPerMonth.toFixed(2) + " to " + sc.falseDaysPerMonth.toFixed(2) +
        " and the card is red " + (sc.share[2] * 100).toFixed(0) + "% of days against " + (base.share[2] * 100).toFixed(0) + "% at rung 4. A card that is red a quarter of the time stops being read.";
    } else if (state.rung === "hide") {
      cls = "is-bad";
      vt = "False calm: green " + (sc.share[0] * 100).toFixed(0) + "% of days and only " + sc.episodes + " episode" + (sc.episodes === 1 ? "" : "s") + ", yet " + sc.missed + " of " + sc.changes + " real change" + (sc.changes === 1 ? "" : "s") +
        " never flagged within " + D + " days. A 28-day average moves at most 1/28 of a shift per day, so the calm is the smoothing, not the operation.";
    } else if (state.rung === "fixed") {
      cls = sc.falseDaysPerMonth > 8 ? "is-bad" : "is-ok";
      vt = "Launch thresholds: " + sc.falseDaysPerMonth.toFixed(2) + " false-alarm days per month, " + sc.missed + " of " + sc.changes + " changes missed, red " + (sc.share[2] * 100).toFixed(0) + "% of days. The first four weeks decided every colour for the next " + Math.round(sc.scoredDays / 7) + " weeks.";
    } else {
      cls = sc.falseDaysPerMonth <= base.falseDaysPerMonth && sc.missed <= base.missed ? "is-good" : "is-ok";
      vt = RUNGS.filter(function (x) { return x.id === state.rung; })[0].label.replace(/^\d · /, "") + ": " + sc.falseDaysPerMonth.toFixed(2) + " false-alarm days per month, " + sc.missed + " of " + sc.changes + " real changes missed, " +
        (sc.meanDelay === null ? "" : sc.meanDelay.toFixed(1) + " days to flag on average, ") + "green " + (sc.share[0] * 100).toFixed(0) + "% of days.";
    }
    els.verdict.className = "mb-verdict " + cls; els.verdict.textContent = vt;

    drawStrip(r, day);

    /* scorecard */
    els.score.hidden = state.rung !== "score";
    if (state.rung === "score") {
      var rows = KPIS.map(function (k) {
        var x = run(k.key, "persist", state.kA, state.kR), s = x.sc;
        return '<tr><th>' + esc(k.label) + '<em>' + esc(k.question) + '</em></th><td>' + s.changes + '</td><td>' + s.falseDaysPerMonth.toFixed(2) + '</td><td>' + s.missed + '</td><td>' +
          (s.meanDelay === null ? "n/a" : s.meanDelay.toFixed(1)) + '</td><td>' + (s.share[0] * 100).toFixed(0) + ' / ' + (s.share[1] * 100).toFixed(0) + ' / ' + (s.share[2] * 100).toFixed(0) + '</td></tr>';
      }).join("");
      els.scoretab.innerHTML = '<table class="dt-table"><thead><tr><th>Card</th><th>Real changes</th><th>False-alarm days / month</th><th>Missed</th><th>Days to flag</th><th>Green / amber / red %</th></tr></thead><tbody>' + rows + '</tbody></table>';
    }
  }

  function drawStrip(r, day) {
    var n = data.n, Wd = 880, H = 230, L = 46, Rm = 14, T = 14, plotB = 170, railY = 184, railH = 14;
    var S = W, E = n - TW, xs = function (i) { return L + (i - S) / (E - 1 - S) * (Wd - L - Rm); };
    var lo = Infinity, hi = -Infinity, i, u = r.u, kpi = r.kpi;
    for (i = S; i < E; i++) { if (u[i] < lo) lo = u[i]; if (u[i] > hi) hi = u[i]; if (r.band[i]) { if (r.band[i][0] < lo) lo = r.band[i][0]; if (r.band[i][2] > hi) hi = r.band[i][2]; } }
    var pad = (hi - lo) * 0.06; lo -= pad; hi += pad;
    var ys = function (v) { return T + (hi - v) / (hi - lo) * (plotB - T); };
    var s = '<svg viewBox="0 0 ' + Wd + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(kpi.label) + ' day by day, the context band, the colour of the card each day, and the real changes by the rule">';
    /* band ribbon */
    if (r.band[S]) {
      var top = "", bot = "";
      for (i = S; i < E; i++) { top += (i === S ? "M" : "L") + xs(i).toFixed(1) + " " + ys(r.band[i][2]).toFixed(1) + " "; }
      for (i = E - 1; i >= S; i--) { bot += "L" + xs(i).toFixed(1) + " " + ys(r.band[i][0]).toFixed(1) + " "; }
      s += '<path class="dsh-band" d="' + top + bot + 'Z"/>';
      var mid = "";
      for (i = S; i < E; i++) mid += (i === S ? "M" : "L") + xs(i).toFixed(1) + " " + ys(r.band[i][1]).toFixed(1) + " ";
      s += '<path class="dsh-mid" d="' + mid + '"/>';
    }
    /* series */
    var d = "";
    for (i = S; i < E; i++) d += (i === S ? "M" : "L") + xs(i).toFixed(1) + " " + ys(u[i]).toFixed(1) + " ";
    s += '<path class="dsh-line" d="' + d + '"/>';
    /* changes */
    r.changes.forEach(function (c) {
      s += '<rect class="dsh-win" x="' + xs(c).toFixed(1) + '" y="' + T + '" width="' + (xs(c + D) - xs(c)).toFixed(1) + '" height="' + (plotB - T) + '"/>';
      s += '<path class="dsh-chg" d="M' + xs(c).toFixed(1) + ' ' + T + ' V' + plotB + '"/>';
    });
    /* rail */
    var runStart = S, cur = r.st[S];
    for (i = S + 1; i <= E; i++) {
      if (i === E || r.st[i] !== cur) {
        s += '<rect x="' + xs(runStart).toFixed(1) + '" y="' + railY + '" width="' + Math.max(0.8, xs(i === E ? E - 1 : i) - xs(runStart) + (i === E ? 1.4 : 0)).toFixed(1) + '" height="' + railH + '" fill="' + COL[cur] + '"/>';
        if (i < E) { runStart = i; cur = r.st[i]; }
      }
    }
    /* cursor */
    s += '<path class="dsh-cursor" d="M' + xs(day).toFixed(1) + ' ' + (T - 4) + ' V' + (railY + railH + 4) + '"/>';
    /* axes */
    s += '<text class="dsh-ax" x="' + (L - 6) + '" y="' + (T + 10) + '" text-anchor="end">' + esc(shown(kpi, kpi.sign > 0 ? hi : lo)) + '</text>';
    s += '<text class="dsh-ax" x="' + (L - 6) + '" y="' + plotB + '" text-anchor="end">' + esc(shown(kpi, kpi.sign > 0 ? lo : hi)) + '</text>';
    s += '<text class="dsh-ax" x="' + L + '" y="' + (H - 6) + '">' + dateOf(S) + '</text>';
    s += '<text class="dsh-ax" x="' + (Wd - Rm) + '" y="' + (H - 6) + '" text-anchor="end">' + dateOf(E - 1) + '</text>';
    s += '<text class="dsh-ax" x="' + (Wd / 2) + '" y="' + (H - 6) + '" text-anchor="middle">' + r.changes.length + ' real change' + (r.changes.length === 1 ? "" : "s") + ' by the rule (vertical lines, with the ' + D + '-day catch window)</text>';
    s += '</svg>';
    els.strip.innerHTML = s;
  }

  function init() {
    rootEl = document.getElementById("dsh-bench");
    if (!rootEl || !root.DSH_DAILY) return;
    data = root.DSH_DAILY;
    if (!selfTest()) {
      rootEl.innerHTML = '<p class="mb-verdict is-bad">Engine self-test failed: the bench will not show numbers it cannot trust.</p>';
      return;
    }
    var k = rootEl.getAttribute("data-kpi"); if (k !== null && k !== "") state.kpi = k;
    var g = rootEl.getAttribute("data-rung"); if (g !== null && g !== "") state.rung = g;
    buildUI();
    root.DSH_LIVE = {
      set: function (kpi, rung, kA, kR, day) {
        if (kpi) { state.kpi = kpi; els.kpi.value = kpi; }
        if (rung) { state.rung = rung; rootEl.querySelector('input[value="' + rung + '"]').checked = true; }
        if (kA !== undefined && kA !== null) state.kA = kA;
        if (kR !== undefined && kR !== null) state.kR = kR;
        if (day !== undefined && day !== null) { state.day = day; els.day.value = day; }
        render();
      },
      state: state,
      run: function (kpi, rung, kA, kR) { var x = run(kpi, rung, kA, kR); delete x.sc.episodeList; return x.sc; },
      canon: function () { return canon(data); }
    };
  }

  var api = { KPIS: KPIS, median: median, spread: spread, series: series, truth: truth, states: states, score: score, canon: canon, selfTest: selfTest, W: W, TW: TW, K: K, D: D };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
  }
})(typeof window !== "undefined" ? window : this);
