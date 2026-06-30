#!/usr/bin/env python3
import json
from pathlib import Path

APP_DB = Path("docs/data/app-categories.json")
CONTRIBS = Path("contributions.jsonl")
OUT = Path("docs/data/app-categories.merged.json")

ALLOWED_CATEGORIES = {
    "communication",
    "browser",
    "media",
    "health",
    "ai",
    "tools",
    "productivity",
    "photography",
    "maps",
    "finance",
    "shopping",
    "games",
    "reading",
    "security",
    "system",
    "unknown",
}

BAD_LABELS = {
    "",
    "app",
    "application",
    "android",
    "mainactivity",
    "launcher",
    "activity",
    "default",
    "mobile",
    "client",
    "package",
    "systemui",
}

def clean_label(label):
    return " ".join(str(label or "").strip().split())[:120]

def clean_category(category):
    category = str(category or "unknown").strip()
    return category if category in ALLOWED_CATEGORIES else "unknown"

def useful_label(label):
    label = clean_label(label)
    return label and label.lower() not in BAD_LABELS and len(label) >= 2

def valid_component(component, pkg):
    component = str(component or "").strip()
    return component.startswith(pkg + "/") and "/" in component and " " not in component

if not APP_DB.exists():
    raise SystemExit(f"Missing {APP_DB}")

if not CONTRIBS.exists():
    raise SystemExit(f"Missing {CONTRIBS}")

db = json.loads(APP_DB.read_text())

scanned = 0
added = 0
updated_unknown = 0
components_added = 0
labels_improved = 0
skipped = 0

with CONTRIBS.open() as f:
    for line in f:
        line = line.strip()
        if not line:
            continue

        try:
            record = json.loads(line)
        except json.JSONDecodeError:
            skipped += 1
            continue

        for app in record.get("apps", []):
            scanned += 1

            pkg = str(app.get("package", "")).strip()
            component = str(app.get("component", "")).strip()
            label = clean_label(app.get("label", ""))
            category = clean_category(app.get("category", "unknown"))

            # Important safety rule:
            # skip package-only dumps; only merge entries that include a real launcher component.
            if not pkg or "." not in pkg or not valid_component(component, pkg):
                skipped += 1
                continue

            if not useful_label(label):
                skipped += 1
                continue

            incoming = {
                "label": label,
                "category": category,
                "component": component,
            }

            if pkg not in db:
                db[pkg] = incoming
                added += 1
                continue

            current = db[pkg]

            if not current.get("component"):
                current["component"] = component
                components_added += 1

            if current.get("category", "unknown") == "unknown" and category != "unknown":
                current["category"] = category
                updated_unknown += 1

            if not useful_label(current.get("label", "")) and useful_label(label):
                current["label"] = label
                labels_improved += 1

OUT.write_text(json.dumps(dict(sorted(db.items())), indent=2, ensure_ascii=False) + "\n")

print(f"Contribution app rows scanned: {scanned}")
print(f"New packages added: {added}")
print(f"Unknown categories improved: {updated_unknown}")
print(f"Components added to existing packages: {components_added}")
print(f"Labels improved: {labels_improved}")
print(f"Skipped unsafe/unusable rows: {skipped}")
print(f"Wrote: {OUT}")
