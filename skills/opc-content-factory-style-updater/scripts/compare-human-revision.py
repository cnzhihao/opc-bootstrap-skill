#!/usr/bin/env python3
import argparse, json, pathlib, statistics

SCRIPT = "compare-human-revision.py"
ACTION = "对比 AI 初稿与人工修订稿"

def load_json(path):
    return json.loads(pathlib.Path(path).read_text(encoding="utf-8"))

def main():
    parser = argparse.ArgumentParser(description=f"{SCRIPT} - local analysis helper")
    parser.add_argument("--input", required=True, help="Input JSON file")
    parser.add_argument("--output", help="Optional output JSON path")
    args = parser.parse_args()
    data = load_json(args.input)
    items = data.get("items", []) if isinstance(data, dict) else []
    texts = [str(item.get("text") or item.get("content") or item.get("title") or "") for item in items if isinstance(item, dict)]
    lengths = [len(t) for t in texts]
    result = {
        "ok": True,
        "action": ACTION,
        "itemCount": len(items),
        "averageLength": round(statistics.mean(lengths), 2) if lengths else 0,
        "findings": data.get("findings", []) if isinstance(data, dict) else [],
        "warnings": [] if items else ["No items found in input"],
    }
    text = json.dumps(result, ensure_ascii=False, indent=2)
    if args.output:
        pathlib.Path(args.output).write_text(text + "\n", encoding="utf-8")
    else:
        print(text)

if __name__ == "__main__":
    main()
