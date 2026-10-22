#!/usr/bin/env python3
"""Build the daily series behind the red-amber-green bench (session 6) from the Olist dataset.

Source: Brazilian E-Commerce Public Dataset by Olist, Kaggle, version 2
  kagglehub.dataset_download("olistbr/brazilian-ecommerce")   (no Kaggle login needed)
  Licence: CC BY-NC-SA 4.0. Only DERIVED daily aggregates leave this script: counts, sums and
  means per calendar day. No order id, customer id, product, review text or any row is shipped.

What is shipped (assets/dsh-daily.js, generated with json.dumps):
  start      first calendar day kept (ISO date)
  orders     orders placed per day (all statuses, by purchase timestamp), integer
  revenue    sum of item prices (BRL, items table joined on order_id) for orders placed that day,
             rounded to whole BRL, integer
  delay      mean of (delivered date - estimated date) in days, over the orders placed that day
             that were delivered and carry both dates; tenths of a day, integer; null if none
  late       share of those delivered orders that arrived after the estimate, per mille, integer;
             null if none
Trim rule (stated on the widget): the daily series is cut to whole weeks. Keep from the first
Monday such that every day of the following 7 has at least MIN_ORDERS orders placed, to the last
Sunday such that every day of the preceding 7 has at least MIN_ORDERS. Olist's first months
(late 2016) and its last weeks (after August 2018) are sparse because the data was extracted
mid-stream; they are dropped and the widget says so.

Usage:
  python3 -I build-olist-daily.py <dir holding the 9 olist csv files> <repo>   # writes assets/dsh-daily.js
"""
from __future__ import annotations

import csv
import json
import sys
from collections import defaultdict
from datetime import date, datetime, timedelta
from pathlib import Path

MIN_ORDERS = 20
FMT = "%Y-%m-%d %H:%M:%S"


def parse(ts: str) -> datetime | None:
    return datetime.strptime(ts, FMT) if ts else None


def build(src: Path, repo: Path) -> None:
    orders = {}
    with open(src / "olist_orders_dataset.csv", newline="", encoding="utf-8") as f:
        for r in csv.DictReader(f):
            orders[r["order_id"]] = r
    revenue_by_order: dict[str, float] = defaultdict(float)
    with open(src / "olist_order_items_dataset.csv", newline="", encoding="utf-8") as f:
        for r in csv.DictReader(f):
            revenue_by_order[r["order_id"]] += float(r["price"])

    day_orders: dict[date, int] = defaultdict(int)
    day_rev: dict[date, float] = defaultdict(float)
    day_delay: dict[date, list[float]] = defaultdict(list)
    for oid, r in orders.items():
        placed = parse(r["order_purchase_timestamp"])
        if placed is None:
            continue
        d = placed.date()
        day_orders[d] += 1
        day_rev[d] += revenue_by_order.get(oid, 0.0)
        if r["order_status"] == "delivered" and r["order_delivered_customer_date"] and r["order_estimated_delivery_date"]:
            got = parse(r["order_delivered_customer_date"])
            est = parse(r["order_estimated_delivery_date"])
            day_delay[d].append((got - est).total_seconds() / 86400.0)

    first, last = min(day_orders), max(day_orders)
    days = [first + timedelta(i) for i in range((last - first).days + 1)]
    cnt = [day_orders.get(d, 0) for d in days]

    # trim to whole weeks, Monday to Sunday
    def ok(i: int) -> bool:
        return all(cnt[j] >= MIN_ORDERS for j in range(i, i + 7))
    start_i = next(i for i, d in enumerate(days) if d.weekday() == 0 and i + 7 <= len(days) and ok(i))
    end_i = next(i for i in range(len(days) - 1, -1, -1) if days[i].weekday() == 6 and i - 6 >= 0 and ok(i - 6))
    kept = days[start_i:end_i + 1]
    assert len(kept) % 7 == 0

    out = {
        "source": "Brazilian E-Commerce Public Dataset by Olist (Kaggle, v2), CC BY-NC-SA 4.0; derived daily aggregates only",
        "trim": f"whole weeks from the first Monday whose following 7 days all have >= {MIN_ORDERS} orders to the last such Sunday; "
                f"dropped {start_i} leading and {len(days) - 1 - end_i} trailing days",
        "fullSpan": [first.isoformat(), last.isoformat()],
        "start": kept[0].isoformat(),
        "end": kept[-1].isoformat(),
        "n": len(kept),
        "orders": [day_orders.get(d, 0) for d in kept],
        "revenue": [int(round(day_rev.get(d, 0.0))) for d in kept],
        "delay": [int(round(10 * sum(day_delay[d]) / len(day_delay[d]))) if day_delay.get(d) else None for d in kept],
        "late": [int(round(1000 * sum(1 for x in day_delay[d] if x > 0) / len(day_delay[d]))) if day_delay.get(d) else None for d in kept],
        "units": {"orders": "orders placed per day", "revenue": "BRL, whole units", "delay": "tenths of a day, delivered minus estimated",
                  "late": "per mille of delivered orders arriving after the estimate"},
    }
    js = ("/* Derived from the Brazilian E-Commerce Public Dataset by Olist (Kaggle, CC BY-NC-SA 4.0). "
          "Daily aggregates only: counts, sums, means per calendar day. No rows, ids or text. "
          "Generated by materials/build-olist-daily.py */\n"
          "window.DSH_DAILY = " + json.dumps(out, separators=(",", ":")) + ";\n")
    (repo / "assets" / "dsh-daily.js").write_text(js, encoding="utf-8")
    print(f"days in data {len(days)} ({first} to {last}); kept {len(kept)} ({kept[0]} to {kept[-1]}), "
          f"{len(kept) // 7} weeks; dropped {start_i} leading, {len(days) - 1 - end_i} trailing")
    print(f"orders kept {sum(out['orders'])} of {len(orders)}; revenue kept {sum(out['revenue']):,} BRL; "
          f"days with no delivered order: {sum(1 for x in out['delay'] if x is None)}")
    print(f"wrote {repo / 'assets' / 'dsh-daily.js'} ({(repo / 'assets' / 'dsh-daily.js').stat().st_size:,} bytes)")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    build(Path(sys.argv[1]), Path(sys.argv[2]))
