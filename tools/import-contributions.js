#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const input = process.argv[2];
const write = process.argv.includes("--write");
const includePackageOnly = process.argv.includes("--include-package-only");
const reportArg = process.argv.find(arg => arg.startsWith("--report="));
const reportPath = reportArg ? reportArg.split("=").slice(1).join("=") : "";
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

const categoryRules = {
  communication: ["discord", "signal", "telegram", "whatsapp", "messenger", "mail", "gmail", "reddit", "chat", "slack", "mastodon", "revolt", "fastmail", "zoom"],
  browser: ["browser", "chrome", "firefox", "brave", "vivaldi", "kiwi", "opera", "edge", "torbrowser", "waterfox", "vanadium"],
  media: ["music", "audio", "video", "spotify", "poweramp", "youtube", "grayjay", "vlc", "podcast", "qobuz", "bandcamp", "foobar", "shazam", "libby", "kindle"],
  health: ["fitbit", "withings", "health", "fitness", "sleep", "oura", "garmin", "strava", "cronometer"],
  ai: ["openai", "chatgpt", "sora", "claude", "perplexity", "gemini", "copilot", "anythingllm"],
  tools: ["termux", "tool", "calculator", "file", "manager", "scanner", "bitwarden", "aegis", "tasker", "tailscale", "wireguard", "localsend", "ntfy", "ssh", "vnc"],
  productivity: ["calendar", "keep", "docs", "sheets", "notion", "todo", "tasks", "office", "drive", "obsidian", "markor"],
  photography: ["camera", "photo", "photos", "gallery", "snapseed", "lightroom", "fujifilm", "flickr", "scaniverse"],
  maps: ["maps", "navigation", "waze", "uber", "lyft", "magicearth", "streetcomplete"],
  finance: ["bank", "wallet", "cash", "paypal", "venmo", "coinbase", "chase", "fidelity", "vanguard", "ledger"],
  shopping: ["amazon", "ebay", "shop", "store", "target", "walmart", "menards", "mcdonalds"],
  games: ["game", "steam", "xbox", "playstation", "minecraft", "chess", "lichess", "dolphin"],
  reading: ["reader", "news", "feed", "kindle", "book", "feeder", "bookwyrm", "khan"],
  security: ["vpn", "auth", "password", "bitwarden", "proton", "security", "aegis", "authy", "auditor"]
};

const labelOverrides = {
  "com.openai.chatgpt": "ChatGPT",
  "com.openai.sora": "Sora",
  "com.brave.browser": "Brave",
  "com.spotify.music": "Spotify",
  "com.discord": "Discord",
  "com.Slack": "Slack",
  "com.aircoookie.WLED": "WLED",
  "com.fitbit.FitbitMobile": "Fitbit",
  "com.x8bit.bitwarden": "Bitwarden",
  "md.obsidian": "Obsidian",
  "org.fdroid.fdroid": "F-Droid",
  "org.telegram.messenger": "Telegram",
  "org.torproject.torbrowser": "Tor Browser",
  "com.google.android.youtube": "YouTube",
  "com.google.android.apps.maps": "Google Maps"
};

const genericLabelWords = new Set([
  "android", "app", "mobile", "client", "release", "gold", "pro", "free", "fdroid", "flutter", "main", "launcher", "companion", "community",
  "browser", "music", "package", "activity", "default", "splash", "unknown"
]);

if (!input) {
  console.error("Usage: node tools/import-contributions.js /path/to/contributions.jsonl [--write] [--min-count=1] [--include-package-only] [--report=reports/app-category-import.md]");
  process.exit(1);
}

const dbPath = path.join(process.cwd(), "docs/data/app-categories.json");
const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));

const packageRe = /^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z0-9_]+)+$/;
const componentRe = /^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z0-9_]+)+\/[^\s]+$/;

const tallies = new Map();
const stats = {
  records: 0,
  appsSeen: 0,
  appsAccepted: 0,
  skippedNoComponent: 0,
  skippedBadPackage: 0,
  skippedBadComponent: 0
};

function titleCase(text) {
  const acronyms = {
    wled: "WLED",
    vnc: "VNC",
    vpn: "VPN",
    sms: "SMS",
    ssh: "SSH",
    pdf: "PDF",
    nfc: "NFC",
    gps: "GPS",
    ai: "AI"
  };

  return String(text || "")
    .replace(/[_-]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map(word => acronyms[word.toLowerCase()] || word.replace(/\b\w/g, ch => ch.toUpperCase()))
    .join(" ");
}

function labelLooksGeneric(label) {
  const clean = String(label || "").trim().toLowerCase();
  if (!clean) return true;
  if (genericLabelWords.has(clean)) return true;
  if (clean.length <= 2) return true;
  return false;
}

function inferLabel(pkg) {
  if (labelOverrides[pkg]) return labelOverrides[pkg];

  const genericParts = new Set([
    "com", "org", "net", "io", "ai", "app", "co", "de", "jp", "ru", "us", "gov", "ml", "md", "fi", "nl", "no", "eu", "dev", "chat", "air",
    "android", "mobile", "client", "release", "gold", "pro", "free", "fdroid", "flutter", "main", "launcher", "companion", "community",
    "browser", "music", "app"
  ]);

  const parts = String(pkg || "").split(".").map(x => x.trim()).filter(Boolean);
  const meaningful = parts.filter(part => !genericParts.has(part.toLowerCase()));
  return titleCase(meaningful.length ? meaningful[meaningful.length - 1] : (parts[parts.length - 1] || pkg));
}

function inferCategory(pkg, label) {
  const haystack = `${pkg} ${label}`.toLowerCase();
  let best = { category: "unknown", score: 0 };

  for (const [category, terms] of Object.entries(categoryRules)) {
    let score = 0;
    for (const term of terms) {
      if (haystack.includes(term)) score += term.length;
    }
    if (score > best.score) best = { category, score };
  }

  return best.score > 0 ? best.category : "unknown";
}

function isPlatformPackage(pkg) {
  return (
    pkg === "android" ||
    pkg.startsWith("android.") ||
    pkg.startsWith("com.android.") ||
    pkg.startsWith("app.grapheneos.")
  );
}

function normalizeCategory(pkg, label, category) {
  let c = categories.has(category) ? category : "unknown";

  if (c === "system" && !isPlatformPackage(pkg)) {
    c = "unknown";
  }

  if (c === "unknown") {
    c = inferCategory(pkg, label);
  }

  return c;
}

function addVote(app) {
  stats.appsSeen += 1;

  if (!app || typeof app !== "object") return;

  const pkg = String(app.package || "").trim();
  if (!packageRe.test(pkg)) {
    stats.skippedBadPackage += 1;
    return;
  }

  const component = String(app.component || "").trim().slice(0, 240);

  if (!component && !includePackageOnly) {
    stats.skippedNoComponent += 1;
    return;
  }

  if (component && !componentRe.test(component)) {
    stats.skippedBadComponent += 1;
    return;
  }

  const rawLabel = String(app.label || "").trim().slice(0, 120);
  const label = labelLooksGeneric(rawLabel) ? inferLabel(pkg) : rawLabel;
  const categoryRaw = String(app.category || "unknown").trim();
  const category = normalizeCategory(pkg, label, categoryRaw);

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
  stats.appsAccepted += 1;

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
    stats.records += 1;
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
  const label = current.label || winner(t.labels, inferLabel(pkg));
  const category = current.category && current.category !== "unknown"
    ? current.category
    : winner(t.categories, inferCategory(pkg, label));
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

console.log(`Read contribution records: ${stats.records}`);
console.log(`Apps seen: ${stats.appsSeen}`);
console.log(`Apps accepted: ${stats.appsAccepted}`);
console.log(`Skipped no component: ${stats.skippedNoComponent}`);
console.log(`Skipped bad package: ${stats.skippedBadPackage}`);
console.log(`Skipped bad component: ${stats.skippedBadComponent}`);
console.log(`Packages with accepted votes: ${tallies.size}`);
console.log(`Changes that would be applied: ${changes.length}`);

for (const change of changes.slice(0, 100)) {
  console.log(`${change.package} (${change.count})`);
  console.log(`  before: ${JSON.stringify(change.before)}`);
  console.log(`  after:  ${JSON.stringify(change.after)}`);
}

if (changes.length > 100) {
  console.log(`...and ${changes.length - 100} more`);
}

function markdownReport() {
  const lines = [];
  const now = new Date().toISOString();
  const added = changes.filter(change => !change.before || !Object.keys(change.before).length);
  const updated = changes.filter(change => change.before && Object.keys(change.before).length);
  const unknownToKnown = changes.filter(change =>
    change.before?.category === "unknown" &&
    change.after?.category &&
    change.after.category !== "unknown"
  );

  lines.push(`# LCARS app-category import report`);
  lines.push("");
  lines.push(`Generated: ${now}`);
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`- Contribution records read: ${stats.records}`);
  lines.push(`- Apps seen: ${stats.appsSeen}`);
  lines.push(`- Apps accepted: ${stats.appsAccepted}`);
  lines.push(`- Skipped, no component: ${stats.skippedNoComponent}`);
  lines.push(`- Skipped, bad package: ${stats.skippedBadPackage}`);
  lines.push(`- Skipped, bad component: ${stats.skippedBadComponent}`);
  lines.push(`- Packages with accepted votes: ${tallies.size}`);
  lines.push(`- Changes applied or proposed: ${changes.length}`);
  lines.push(`- New packages: ${added.length}`);
  lines.push(`- Updated existing packages: ${updated.length}`);
  lines.push(`- Unknown → known category improvements: ${unknownToKnown.length}`);
  lines.push(`- Minimum vote count: ${minCount}`);
  lines.push(`- Package-only entries included: ${includePackageOnly ? "yes" : "no"}`);
  lines.push("");
  lines.push("## Changes");
  lines.push("");
  lines.push("| Package | Votes | Before | After |");
  lines.push("|---|---:|---|---|");

  for (const change of changes) {
    const before = change.before?.category || "(new)";
    const after = change.after?.category || "unknown";
    const label = change.after?.label || change.before?.label || "";
    lines.push(`| \`${change.package}\` | ${change.count} | ${before} | ${after}${label ? ` / ${label}` : ""} |`);
  }

  lines.push("");
  lines.push("## Notes");
  lines.push("");
  lines.push("- Component-backed submissions are preferred because Niagara icon replacement needs exact Android launcher components.");
  lines.push("- Package-only entries are ignored unless `--include-package-only` is passed intentionally.");
  lines.push("- Review any surprising labels before committing, especially generic labels inferred from package names.");

  return lines.join("\n") + "\n";
}

if (reportPath) {
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, markdownReport());
  console.log(`Wrote report ${reportPath}`);
}

if (write) {
  const sorted = Object.fromEntries(
    Object.entries(db).sort(([a], [b]) => a.localeCompare(b))
  );

  fs.writeFileSync(dbPath, JSON.stringify(sorted, null, 2) + "\n");
  console.log(`Wrote ${dbPath}`);
} else {
  console.log("Dry run only. Add --write to update app-categories.json.");
  console.log("Package-only entries are ignored by default. Use --include-package-only only when you trust the input.");
}
