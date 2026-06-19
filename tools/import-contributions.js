#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const input = process.argv[2];
const write = process.argv.includes("--write");
const minCountArg = process.argv.find(arg => arg.startsWith("--min-count="));
const minCount = minCountArg ? Number(minCountArg.split("=")[1]) : 1;

const categories = new Set([
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
  "unknown"
]);

if (!input) {
  console.error("Usage: node tools/import-contributions.js /path/to/contributions.jsonl [--write] [--min-count=1]");
  process.exit(1);
}

const dbPath = path.join(process.cwd(), "docs/data/app-categories.json");
const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));

const packageRe = /^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z0-9_]+)+$/;
const tallies = new Map();

function addVote(app) {
  if (!app || typeof app !== "object") return;

  const pkg = String(app.package || "").trim();
  if (!packageRe.test(pkg)) return;

  const label = String(app.label || "").trim().slice(0, 120);
  const categoryRaw = String(app.category || "unknown").trim();
  const category = categories.has(categoryRaw) ? categoryRaw : "unknown";
  const component = String(app.component || "").trim().slice(0, 240);

  if (!tallies.has(pkg)) {
    tallies.set(pkg, {
      package: pkg,
      labels: new Map(),
      categories: new Map(),
      components: new Map(),
      count: 0
    });
  }

  const t = tallies.get(pkg);
  t.count += 1;

  if (label) t.labels.set(label, (t.labels.get(label) || 0) + 1);
  if (category) t.categories.set(category, (t.categories.get(category) || 0) + 1);
  if (component) t.components.set(component, (t.components.get(component) || 0) + 1);
}

function winner(map, fallback = "") {
  let best = fallback;
  let bestCount = -1;

  for (const [value, count] of map.entries()) {
    if (count > bestCount) {
      best = value;
      bestCount = count;
    }
  }

  return best;
}

const lines = fs.readFileSync(input, "utf8").split(/\r?\n/).filter(Boolean);

for (const line of lines) {
  try {
    const record = JSON.parse(line);
    const apps = Array.isArray(record.apps) ? record.apps : [];
    for (const app of apps) addVote(app);
  } catch {
  }
}

const changes = [];

for (const [pkg, t] of [...tallies.entries()].sort(([a], [b]) => a.localeCompare(b))) {
  if (t.count < minCount) continue;

  const current = db[pkg] || {};
  const label = winner(t.labels, current.label || pkg.split(".").pop() || pkg);
  const category = winner(t.categories, current.category || "unknown");
  const component = winner(t.components, current.component || "");

  const next = {
    ...current,
    label,
    category
  };

  if (component) next.component = component;

  const before = JSON.stringify(current);
  const after = JSON.stringify(next);

  if (before !== after) {
    changes.push({
      package: pkg,
      count: t.count,
      before: current,
      after: next
    });

    db[pkg] = next;
  }
}

console.log(`Read contribution records: ${lines.length}`);
console.log(`Packages with votes: ${tallies.size}`);
console.log(`Changes that would be applied: ${changes.length}`);

for (const change of changes.slice(0, 80)) {
  console.log(`${change.package} (${change.count})`);
  console.log(`  before: ${JSON.stringify(change.before)}`);
  console.log(`  after:  ${JSON.stringify(change.after)}`);
}

if (changes.length > 80) {
  console.log(`...and ${changes.length - 80} more`);
}

if (write) {
  const sorted = Object.fromEntries(
    Object.entries(db).sort(([a], [b]) => a.localeCompare(b))
  );

  fs.writeFileSync(dbPath, JSON.stringify(sorted, null, 2) + "\n");
  console.log(`Wrote ${dbPath}`);
} else {
  console.log("Dry run only. Add --write to update app-categories.json.");
}
