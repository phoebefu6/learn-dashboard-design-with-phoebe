#!/usr/bin/env python3
"""Compare the Python reference canon with the node run of the browser engine BY VALUE.
Usage: python3 materials/compare-ladder.py <repo> [--plant]
--plant multiplies one node number by 1.001 before comparing; the script must then FAIL (exit 1),
which proves the comparison sees a 0.1 percent fault. Exit 0 = every number agrees."""
import json, subprocess, sys
from pathlib import Path

repo = Path([a for a in sys.argv[1:] if not a.startswith("--")][0]).resolve()
py = json.loads(subprocess.run([sys.executable, str(repo / "materials/dsh-reference.py"), "--json", str(repo)],
                               check=True, capture_output=True, text=True).stdout)
nd = json.loads(subprocess.run(["node", str(repo / "materials/dsh-node.js"), str(repo)],
                               check=True, capture_output=True, text=True).stdout)
if "--plant" in sys.argv:
    nd["kpis"]["late"]["rungs"]["persist"]["falseDaysPerMonth"] *= 1.001

def walk(a, b, path, bad, n):
    if isinstance(a, dict):
        if set(a) != set(b):
            bad.append(f"{path}: keys {sorted(set(a) ^ set(b))}"); return n
        for k in a: n = walk(a[k], b[k], f"{path}.{k}", bad, n)
    elif isinstance(a, list):
        if len(a) != len(b):
            bad.append(f"{path}: length {len(a)} vs {len(b)}"); return n
        for i, (x, y) in enumerate(zip(a, b)): n = walk(x, y, f"{path}[{i}]", bad, n)
    else:
        n += 1
        if isinstance(a, (int, float)) and isinstance(b, (int, float)) and not isinstance(a, bool):
            if abs(a - b) > 1e-9 * max(1.0, abs(a)): bad.append(f"{path}: {a} vs {b}")
        elif a != b: bad.append(f"{path}: {a!r} vs {b!r}")
    return n

bad = []
n = walk(py, nd, "canon", bad, 0)
print(f"compared {n} values; {len(bad)} disagreements" + (" (planted fault)" if "--plant" in sys.argv else ""))
for line in bad[:20]: print("  " + line)
sys.exit(1 if bad else 0)
