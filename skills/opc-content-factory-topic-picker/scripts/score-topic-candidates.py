#!/usr/bin/env python3
"""Score topic candidates from a local CSV/JSON export.

Python is local-only and does not call Lark APIs. The default formula emphasizes
OPC leverage: pain, founder experience, evidence, conversion potential, novelty,
and production readiness.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

import pandas as pd

DEFAULT_WEIGHTS = {
    'pain': 0.22,
    'founder_experience': 0.18,
    'evidence': 0.16,
    'conversion': 0.18,
    'novelty': 0.12,
    'production_readiness': 0.14,
}


def load_rows(path: Path) -> pd.DataFrame:
    if path.suffix.lower() == '.csv':
        return pd.read_csv(path)
    if path.suffix.lower() == '.json':
        data = json.loads(path.read_text(encoding='utf-8'))
        return pd.DataFrame(data if isinstance(data, list) else data.get('candidates', data.get('rows', [])))
    raise ValueError(f'Unsupported input format: {path.suffix}')


def load_weights(path: str | None) -> dict[str, float]:
    if not path:
        return DEFAULT_WEIGHTS
    loaded = json.loads(Path(path).read_text(encoding='utf-8'))
    weights = {**DEFAULT_WEIGHTS, **{k: float(v) for k, v in loaded.items()}}
    total = sum(weights.values())
    return {k: v / total for k, v in weights.items()} if total else DEFAULT_WEIGHTS


def score(df: pd.DataFrame, weights: dict[str, float]) -> pd.DataFrame:
    result = df.copy()
    for col in weights:
        if col not in result.columns:
            result[col] = 0
        result[col] = pd.to_numeric(result[col], errors='coerce').fillna(0).clip(0, 10)
    result['score'] = sum(result[col] * weight for col, weight in weights.items()).round(2)
    if 'production_effort' in result.columns:
        effort = pd.to_numeric(result['production_effort'], errors='coerce').fillna(0).clip(0, 10)
        result['score'] = (result['score'] - effort * 0.05).round(2)
    result['recommendation'] = pd.cut(
        result['score'],
        bins=[-1, 5.99, 7.49, 10],
        labels=['观察/暂停', '备选', '优先推进']
    ).astype(str)
    return result.sort_values(['score'], ascending=False)


def main() -> None:
    parser = argparse.ArgumentParser(description='Score local topic candidates.')
    parser.add_argument('--input', required=True, help='CSV or JSON candidates file')
    parser.add_argument('--weights', help='Optional JSON weights override')
    parser.add_argument('--output', help='Optional JSON output path')
    parser.add_argument('--top', type=int, default=10, help='Number of candidates to print')
    args = parser.parse_args()

    weights = load_weights(args.weights)
    scored = score(load_rows(Path(args.input)), weights)
    cols = [c for c in ['title', 'pillar', 'audience', 'score', 'recommendation', *weights.keys()] if c in scored.columns]
    rows: list[dict[str, Any]] = scored.head(args.top)[cols].to_dict(orient='records')
    output = {'weights': weights, 'count': int(len(scored)), 'top': rows}
    text = json.dumps(output, ensure_ascii=False, indent=2)
    if args.output:
        Path(args.output).write_text(text + '\n', encoding='utf-8')
    print(text)


if __name__ == '__main__':
    main()
