#!/usr/bin/env python3
"""Collect and summarize local weekly content metrics.

Python is intentionally local-only: it reads CSV/JSON exports and writes JSON summary
for the weekly report drafting step. It does not call Lark APIs.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

import pandas as pd


def load_rows(path: Path) -> pd.DataFrame:
    if path.suffix.lower() == '.csv':
        return pd.read_csv(path)
    if path.suffix.lower() == '.json':
        data = json.loads(path.read_text(encoding='utf-8'))
        return pd.DataFrame(data if isinstance(data, list) else data.get('rows', []))
    raise ValueError(f'Unsupported input format: {path.suffix}')


def numeric_sum(df: pd.DataFrame, column: str) -> float:
    if column not in df.columns:
        return 0.0
    return float(pd.to_numeric(df[column], errors='coerce').fillna(0).sum())


def summarize(df: pd.DataFrame, week: str | None = None) -> dict[str, Any]:
    if week and 'week' in df.columns:
        df = df[df['week'].astype(str) == week]

    published = int(len(df))
    views = numeric_sum(df, 'views')
    likes = numeric_sum(df, 'likes')
    comments = numeric_sum(df, 'comments')
    saves = numeric_sum(df, 'saves')
    leads = numeric_sum(df, 'leads')
    engagement = likes + comments + saves

    by_platform: dict[str, Any] = {}
    if 'platform' in df.columns and not df.empty:
        grouped = df.groupby('platform', dropna=False)
        for platform, part in grouped:
            by_platform[str(platform)] = {
                'published_count': int(len(part)),
                'views': numeric_sum(part, 'views'),
                'engagement': numeric_sum(part, 'likes') + numeric_sum(part, 'comments') + numeric_sum(part, 'saves'),
                'leads': numeric_sum(part, 'leads'),
            }

    top_items: list[dict[str, Any]] = []
    if not df.empty:
        sort_col = 'views' if 'views' in df.columns else df.columns[0]
        display_cols = [c for c in ['title', 'platform', 'views', 'likes', 'comments', 'saves', 'leads'] if c in df.columns]
        top_items = df.sort_values(sort_col, ascending=False).head(5)[display_cols].to_dict(orient='records')

    return {
        'week': week,
        'published_count': published,
        'views': views,
        'likes': likes,
        'comments': comments,
        'saves': saves,
        'leads': leads,
        'engagement': engagement,
        'engagement_rate_per_view': round(engagement / views, 4) if views else 0,
        'by_platform': by_platform,
        'top_items': top_items,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description='Summarize local weekly content metrics export.')
    parser.add_argument('--input', required=True, help='CSV or JSON metrics export')
    parser.add_argument('--week', help='Optional week code filter, e.g. 2026-06-W4')
    parser.add_argument('--output', help='Optional JSON output path')
    args = parser.parse_args()

    summary = summarize(load_rows(Path(args.input)), args.week)
    text = json.dumps(summary, ensure_ascii=False, indent=2)
    if args.output:
        Path(args.output).write_text(text + '\n', encoding='utf-8')
    print(text)


if __name__ == '__main__':
    main()
