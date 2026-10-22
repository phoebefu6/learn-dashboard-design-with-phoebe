#!/usr/bin/env python3
"""Python reference for the red-amber-green bench (assets/dsh-live.js), step for step.

Reads assets/dsh-daily.js (derived Olist daily aggregates, see build-olist-daily.py), runs the
whole ladder for every KPI and prints the canon. The browser engine must print the same numbers:
  node materials/dsh-node.js <repo>              # the SAME engine file, run in node
  python3 materials/dsh-reference.py <repo>      # this file, human-readable
  python3 materials/dsh-reference.py --json <repo>
  python3 materials/compare-ladder.py <repo>     # compares the two by VALUE (and fails on a planted fault)

The course's rule for a REAL change (printed on the widget; a rule of this course, not a fact about
Olist): orient every KPI so that larger means worse (orders and revenue are negated). Slide two
adjacent 28-day windows along the series; the discrepancy at day t is (median of the next 28 days -
median of the previous 28 days) / (1.4826 x MAD of the previous 28 days). A real change is a local
peak of that curve at or above K = 2.0, keeping the highest peaks first and no two within 28 days.
Only shifts for the WORSE count; improvements are not scored. One-day spikes are not changes by
this rule. Window-sliding search follows Truong, Oudre and Vayatis (2020), section 5.2.1.

Ladder (every rung colours each scored day green, amber or red):
  fixed    thresholds frozen at launch: median and spread of the FIRST 28 days, amber at +kA s,
           red at +kR s, never revisited
  spread   thresholds from the whole series' own median and spread (static, hindsight)
  band     a trailing 28-day median and spread, recomputed every day; thresholds move with it; the
           band (median, +/- 1 s) is what the card draws
  persist  band + persistence: the colour changes only after two consecutive days agree
  score    persist, for all four KPIs side by side
  tighten  ANTI-LEVER: persist with kA = 0.5, kR = 1.0 ("catch everything")
  hide     BREAK: the card shows a trailing 28-day MEAN as the point, no band, against the static
           spread thresholds; it looks calm because the average moves at most 1/28 of a shift a day
Scoring, over days 28 .. n-29 (the truth needs 28 days each side): an alarm episode is a run of
non-green days; it is a false alarm if none of its days falls inside [c, c+14) of a real change c;
a change is detected if any day in [c, c+14) is non-green, else missed; delay is the first
non-green day minus c. The headline "false-alarm days per month" = non-green days outside every
change window / (scored days / 30.4375); "alarm episodes per month" counts runs instead.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

W = 28          # rolling and launch window
TW = 28         # truth window each side
K = 2.0         # truth peak threshold
D = 14          # detection window after a change
MONTH = 30.4375
KPIS = [
    ("late", "Late deliveries", 1, 1000.0, "share of delivered orders arriving after the estimate"),
    ("delay", "Delivery vs estimate", 1, 10.0, "mean days delivered minus estimated (negative = early)"),
    ("orders", "Orders placed", -1, 1.0, "orders placed per day"),
    ("revenue", "Revenue", -1, 1.0, "BRL of items ordered per day"),
]
RUNGS = ["fixed", "spread", "band", "persist", "tighten", "hide"]


def median(xs):
    ys = sorted(xs)
    m = len(ys) // 2
    return ys[m] if len(ys) % 2 else (ys[m - 1] + ys[m]) / 2


def spread(xs, m):
    return 1.4826 * median([abs(x - m) for x in xs])


def truth(u):
    n = len(u)
    disc = [0.0] * n
    for t in range(TW, n - TW + 1):
        left = u[t - TW:t]
        ml = median(left)
        s = spread(left, ml)
        if s < 1e-9:
            s = 1e-9
        disc[t] = (median(u[t:t + TW]) - ml) / s
    peaks = [t for t in range(TW + 1, n - TW) if disc[t] >= K and disc[t] >= disc[t - 1] and disc[t] > disc[t + 1]]
    peaks.sort(key=lambda t: (-disc[t], t))
    chosen = []
    for t in peaks:
        if all(abs(t - c) >= TW for c in chosen):
            chosen.append(t)
    chosen.sort()
    return chosen, disc


def states(u, rung, kA, kR):
    """Return (state per day: 0 green 1 amber 2 red, or -1 before scoring; band [lo, mid, hi] per day or None)."""
    n = len(u)
    st = [-1] * n
    band = [None] * n
    if rung == "fixed":
        m0 = median(u[:W]); s0 = spread(u[:W], m0)
        A, R = m0 + kA * s0, m0 + kR * s0
        for t in range(W, n):
            st[t] = 2 if u[t] >= R else 1 if u[t] >= A else 0
            band[t] = [m0 - s0, m0, m0 + s0]
    elif rung in ("spread", "hide"):
        m = median(u); s = spread(u, m)
        A, R = m + kA * s, m + kR * s
        for t in range(W, n):
            x = u[t] if rung == "spread" else sum(u[t - W + 1:t + 1]) / W
            st[t] = 2 if x >= R else 1 if x >= A else 0
            band[t] = [m - s, m, m + s] if rung == "spread" else None
    else:  # band, persist, tighten
        raw = [-1] * n
        for t in range(W, n):
            win = u[t - W:t]
            m = median(win); s = spread(win, m)
            raw[t] = 2 if u[t] >= m + kR * s else 1 if u[t] >= m + kA * s else 0
            band[t] = [m - s, m, m + s]
        if rung == "band":
            st = raw
        else:
            st[W] = raw[W]
            for t in range(W + 1, n):
                st[t] = raw[t] if raw[t] == raw[t - 1] else st[t - 1]
    return st, band


def score(st, changes, n):
    S, E = W, n - TW
    days = E - S
    counts = [0, 0, 0]
    for t in range(S, E):
        counts[st[t]] += 1
    # episodes
    episodes = []
    t = S
    while t < E:
        if st[t] > 0:
            a = t
            while t < E and st[t] > 0:
                t += 1
            episodes.append((a, t))
        else:
            t += 1
    def in_window(day):
        return any(c <= day < c + D for c in changes)
    false_eps = sum(1 for a, b in episodes if not any(in_window(x) for x in range(a, b)))
    false_days = sum(1 for t in range(S, E) if st[t] > 0 and not in_window(t))
    detected, delays = 0, []
    for c in changes:
        hit = next((x for x in range(c, min(c + D, E)) if st[x] > 0), None)
        if hit is None:
            continue
        detected += 1
        delays.append(hit - c)
    missed = len(changes) - detected
    return {
        "scoredDays": days,
        "changes": len(changes),
        "episodes": len(episodes),
        "falseEpisodes": false_eps,
        "alarmsPerMonth": round(false_eps / (days / MONTH), 2),
        "falseDays": false_days,
        "falseDaysPerMonth": round(false_days / (days / MONTH), 2),
        "missed": missed,
        "meanDelay": round(sum(delays) / len(delays), 2) if delays else None,
        "share": [round(c / days, 4) for c in counts],
    }


def series(data, key, sign, scale):
    return [sign * x / scale for x in data[key]]


def params(rung):
    return (0.5, 1.0) if rung == "tighten" else (1.0, 2.0)


def canon(data):
    out = {"n": data["n"], "start": data["start"], "end": data["end"], "rule": {"W": W, "TW": TW, "K": K, "D": D}, "kpis": {}}
    for key, label, sign, scale, _ in KPIS:
        u = series(data, key, sign, scale)
        changes, _ = truth(u)
        row = {"changes": changes, "rungs": {}}
        for rung in RUNGS:
            kA, kR = params(rung)
            st, _ = states(u, rung, kA, kR)
            row["rungs"][rung] = score(st, changes, data["n"])
        out["kpis"][key] = row
    return out


def self_test():
    """Property: a planted 40-sigma step at day 120 of a flat noisy series is the ONLY change found,
    within one day of 120 (robust scaling can shift a noisy peak by a day); colour shares sum to the
    scored days; infinite thresholds give zero alarms and every change missed. A planted fault in
    the window, the peak rule or the threshold direction fails this (proved with --plant-fault)."""
    n, step = 200, 120
    seed = 12345
    u = []
    for i in range(n):
        seed = (48271 * seed) % 2147483647   # Park-Miller; 48271 x 2^31 < 2^53, so JS doubles match exactly
        noise = (seed / 2147483647) - 0.5     # uniform -0.5 .. 0.5
        u.append((10.0 if i < step else 22.0) + noise)
    changes, _ = truth(u)
    assert len(changes) == 1 and abs(changes[0] - step) <= 1, changes
    st, _ = states(u, "persist", 1.0, 2.0)
    sc = score(st, changes, n)
    assert abs(sum(sc["share"]) - 1.0) < 1e-3, sc
    assert sc["missed"] == 0, sc
    st2, _ = states(u, "band", 1e9, 1e9)
    sc2 = score(st2, changes, n)
    assert sc2["episodes"] == 0 and sc2["missed"] == 1, sc2
    return True


def load(repo: Path):
    s = (repo / "assets" / "dsh-daily.js").read_text(encoding="utf-8")
    return json.loads(s[s.index("{"):s.rindex("}") + 1])


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    repo = Path(args[0]) if args else Path(__file__).resolve().parent.parent
    self_test()
    c = canon(load(repo))
    if "--json" in sys.argv:
        print(json.dumps(c, sort_keys=True))
    else:
        print(f"{c['n']} days {c['start']} to {c['end']}; rule W={W} TW={TW} K={K} D={D}; selfTest passed")
        for key, label, *_ in KPIS:
            row = c["kpis"][key]
            print(f"\n{label} ({key}): {len(row['changes'])} real changes at days {row['changes']}")
            print(f"  {'rung':8} {'fdays/mo':>8} {'fdays':>5} {'ep/mo':>6} {'falseEp':>7} {'episodes':>8} {'missed':>6} {'delay':>6}  green/amber/red")
            for rung in RUNGS:
                r = row["rungs"][rung]
                print(f"  {rung:8} {r['falseDaysPerMonth']:>8} {r['falseDays']:>5} {r['alarmsPerMonth']:>6} {r['falseEpisodes']:>7} {r['episodes']:>8} {r['missed']:>6} "
                      f"{str(r['meanDelay']):>6}  {r['share'][0]:.3f}/{r['share'][1]:.3f}/{r['share'][2]:.3f}")
