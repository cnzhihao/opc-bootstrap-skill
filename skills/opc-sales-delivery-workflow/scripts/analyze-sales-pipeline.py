#!/usr/bin/env python3
"""Local-only sales pipeline analysis for opc-sales-delivery-workflow.

Accepts JSON input with customer_leads, delivery_projects and payment_records arrays.
Prints a compact JSON report; never calls Feishu/network services.
"""
from __future__ import annotations

import argparse
import json
from collections import Counter, defaultdict
from datetime import date, datetime
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional

ACTION = "analyze-sales-pipeline"


def load_payload(path: str) -> Dict[str, Any]:
    source = Path(path)
    if not source.exists():
        raise FileNotFoundError(f"Input file does not exist: {path}")
    return json.loads(source.read_text(encoding="utf-8"))


def as_list(value: Any) -> List[Any]:
    if value is None:
        return []
    if isinstance(value, list):
        return value
    return [value]


def fields(item: Any) -> Dict[str, Any]:
    if isinstance(item, dict) and isinstance(item.get("fields"), dict):
        return item["fields"]
    return item if isinstance(item, dict) else {}


def first_value(row: Dict[str, Any], names: Iterable[str], default: Any = None) -> Any:
    for name in names:
        value = row.get(name)
        if value not in (None, "", []):
            return value
    return default


def to_number(value: Any) -> float:
    if value is None:
        return 0.0
    if isinstance(value, (int, float)):
        return float(value)
    text = str(value).replace(",", "").replace("¥", "").replace("￥", "").strip()
    try:
        return float(text)
    except ValueError:
        return 0.0


def parse_date(value: Any) -> Optional[date]:
    if value in (None, ""):
        return None
    if isinstance(value, (int, float)):
        try:
            return datetime.fromtimestamp(value / 1000 if value > 10_000_000_000 else value).date()
        except (OSError, ValueError):
            return None
    text = str(value).strip()
    for fmt in ("%Y-%m-%d", "%Y/%m/%d", "%Y.%m.%d", "%Y-%m-%d %H:%M:%S"):
        try:
            return datetime.strptime(text, fmt).date()
        except ValueError:
            continue
    return None


def status_bucket(value: Any) -> str:
    text = str(value or "").strip().lower()
    if any(token in text for token in ["won", "成交", "已签", "signed", "closed won"]):
        return "won"
    if any(token in text for token in ["lost", "丢单", "流失", "closed lost"]):
        return "lost"
    if any(token in text for token in ["暂停", "pause"]):
        return "paused"
    if any(token in text for token in ["交付", "delivery", "进行", "doing"]):
        return "delivery"
    if any(token in text for token in ["提案", "报价", "proposal", "quote"]):
        return "proposal"
    if any(token in text for token in ["洽谈", "跟进", "contact", "lead"]):
        return "lead"
    return text or "unknown"


def analyze(payload: Dict[str, Any]) -> Dict[str, Any]:
    lead_rows = [fields(item) for item in as_list(payload.get("customer_leads"))]
    project_rows = [fields(item) for item in as_list(payload.get("delivery_projects"))]
    payment_rows = [fields(item) for item in as_list(payload.get("payment_records"))]

    lead_stage_counts = Counter(status_bucket(first_value(row, ["阶段", "Stage", "stage", "状态", "Status"])) for row in lead_rows)
    project_status_counts = Counter(status_bucket(first_value(row, ["状态", "Status", "status", "交付状态"])) for row in project_rows)

    projected_amount_by_stage: Dict[str, float] = defaultdict(float)
    for row in lead_rows:
        stage = status_bucket(first_value(row, ["阶段", "Stage", "stage", "状态", "Status"]))
        amount = to_number(first_value(row, ["预计金额", "金额", "Amount", "amount", "合同额"], 0))
        projected_amount_by_stage[stage] += amount

    payment_total = 0.0
    overdue_items = []
    today = date.today()
    for row in payment_rows:
        amount = to_number(first_value(row, ["金额", "回款金额", "Amount", "amount"], 0))
        payment_total += amount
        due_date = parse_date(first_value(row, ["应回款日期", "Due Date", "due_date", "截止时间"]))
        status = status_bucket(first_value(row, ["状态", "Status", "status"]))
        if due_date and due_date < today and status not in {"won", "done", "paid", "已回款"}:
            overdue_items.append({
                "customer": first_value(row, ["客户", "Customer", "customer", "项目", "Project"], "未命名客户/项目"),
                "amount": amount,
                "due_date": due_date.isoformat(),
                "status": first_value(row, ["状态", "Status", "status"], None),
            })

    active_projects = []
    for row in project_rows:
        bucket = status_bucket(first_value(row, ["状态", "Status", "status", "交付状态"]))
        if bucket not in {"won", "lost", "paused"}:
            active_projects.append({
                "project": first_value(row, ["项目", "项目名称", "Project", "Name", "name"], "未命名项目"),
                "status": first_value(row, ["状态", "Status", "status", "交付状态"], None),
                "next_milestone": first_value(row, ["下一里程碑", "Next Milestone", "next_milestone", "下一步"], None),
                "owner": first_value(row, ["负责人", "Owner", "owner"], None),
            })

    risks = []
    if overdue_items:
        risks.append(f"{len(overdue_items)} 笔回款逾期")
    if project_status_counts.get("unknown", 0):
        risks.append(f"{project_status_counts['unknown']} 个项目状态缺失或未标准化")
    if lead_stage_counts.get("unknown", 0):
        risks.append(f"{lead_stage_counts['unknown']} 条线索阶段缺失或未标准化")

    return {
        "ok": True,
        "action": ACTION,
        "local_only": True,
        "input_counts": {
            "customer_leads": len(lead_rows),
            "delivery_projects": len(project_rows),
            "payment_records": len(payment_rows),
        },
        "lead_stage_counts": dict(lead_stage_counts),
        "project_status_counts": dict(project_status_counts),
        "projected_amount_by_stage": {key: round(value, 2) for key, value in projected_amount_by_stage.items()},
        "payment_total": round(payment_total, 2),
        "overdue_payments": overdue_items,
        "active_projects": active_projects,
        "risks": risks,
        "generated_at": datetime.now().isoformat(timespec="seconds"),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Analyze sales/delivery pipeline from a local JSON payload.")
    parser.add_argument("--input", required=True, help="Path to sample/input JSON")
    args = parser.parse_args()
    payload = load_payload(args.input)
    result = analyze(payload)
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
