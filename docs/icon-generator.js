const palettes = {
  classic: ["#e8bd88", "#df5a1f", "#d62b18", "#e09a3f", "#dfb98a"],
  tng: ["#ffcc99", "#ff9900", "#cc3300", "#cc6699", "#9999cc"],
  ds9: ["#c8a46a", "#b8542a", "#9e271c", "#8f6238", "#c19a70"],
  voyager: ["#f1c48e", "#d89b52", "#c96b38", "#8e5bb8", "#b9a0dd"],
  command: ["#ffd89a", "#f0a43a", "#d65a28", "#ffc85a", "#ffe2b3"],
  red: ["#ffc0b8", "#e45a4e", "#d62b18", "#aa1d14", "#f08a28"],
  science: ["#c9b8ff", "#8f72d8", "#4d47a9", "#73b7e8", "#d8d0ff"],
  medical: ["#b6ffe4", "#46c2a6", "#167f7a", "#f1c96a", "#e8d7a0"],
  romulan: ["#c8f7c5", "#65b96f", "#2e7d32", "#8fbf66", "#d4e8c3"],
  muted: ["#c98769", "#a9482a", "#8f241c", "#d09242", "#d7b083"],
  eink: ["#f0ead8", "#c8bfa8", "#817969", "#a69a80", "#e2d7bd"],
  terminal: ["#b7ffb7", "#5edc5e", "#1e9b1e", "#77cc77", "#d4ffd4"],
  spectrum: ["#ff2d55", "#ff9500", "#ffd60a", "#32d74b", "#0a84ff", "#bf5af2"]
};

const categoryLabels = {
  communication: "Communication / Social",
  browser: "Browser / Internet",
  media: "Media / Audio",
  health: "Health / Fitness",
  ai: "AI / Knowledge",
  tools: "Tools / Utilities",
  productivity: "Productivity",
  photography: "Photography",
  maps: "Maps / Travel",
  finance: "Finance",
  shopping: "Shopping",
  games: "Games",
  reading: "Reading / News",
  security: "Security / Privacy",
  system: "System",
  unknown: "Unknown"
};

const categoryOrder = Object.keys(categoryLabels);

const categoryRules = {
  communication: ["discord", "signal", "telegram", "whatsapp", "messenger", "mail", "gmail", "reddit", "chat"],
  browser: ["browser", "chrome", "firefox", "brave", "vivaldi", "kiwi", "opera", "edge"],
  media: ["music", "audio", "video", "spotify", "poweramp", "youtube", "grayjay", "vlc", "podcast"],
  health: ["fitbit", "withings", "health", "fitness", "sleep", "oura", "garmin", "strava"],
  ai: ["openai", "chatgpt", "claude", "perplexity", "gemini", "copilot"],
  tools: ["termux", "tool", "calculator", "file", "manager", "scanner"],
  productivity: ["calendar", "keep", "docs", "sheets", "notion", "todo", "tasks", "office", "drive"],
  photography: ["camera", "photo", "photos", "gallery", "snapseed", "lightroom"],
  maps: ["maps", "navigation", "waze", "uber", "lyft"],
  finance: ["bank", "wallet", "cash", "paypal", "venmo", "coinbase"],
  shopping: ["amazon", "ebay", "shop", "store", "target", "walmart"],
  games: ["game", "steam", "xbox", "playstation", "minecraft"],
  reading: ["reader", "news", "feed", "kindle", "book"],
  security: ["vpn", "auth", "password", "bitwarden", "proton", "security"],
  system: ["android", "settings", "system", "launcher", "keyboard"]
};

let knownApps = {};
let parsedApps = [];
const USER_MAPPINGS_STORAGE_KEY = "lcarsIconGeneratorUserMappingsV1";
let userMappings = {};

function setStatus(text) {
  document.getElementById("status").textContent = text;
}

function loadUserMappings() {
  try {
    const raw = localStorage.getItem(USER_MAPPINGS_STORAGE_KEY);
    userMappings = raw ? JSON.parse(raw) : {};
  } catch {
    userMappings = {};
  }
}

function persistUserMappings() {
  try {
    localStorage.setItem(USER_MAPPINGS_STORAGE_KEY, JSON.stringify(userMappings));
  } catch {
  }
}

function localMappingCount() {
  return Object.keys(userMappings || {}).length;
}

function mappingKeysForApp(app) {
  const keys = [];
  if (app.component) keys.push(`component:${app.component}`);
  if (app.package) keys.push(`package:${app.package}`);
  return keys;
}

function savedMappingFor(app) {
  for (const key of mappingKeysForApp(app)) {
    if (userMappings[key]) return userMappings[key];
  }
  return null;
}

function saveUserMapping(app) {
  if (!app || !app.package) return;

  const data = {
    label: app.label || knownLabelForPackage(app.package),
    package: app.package,
    component: app.component || "",
    category: app.category || "unknown"
  };

  for (const key of mappingKeysForApp(app)) {
    userMappings[key] = data;
  }

  persistUserMappings();
}

function saveUserMappingsForApps(apps) {
  for (const app of apps || []) {
    saveUserMapping(app);
  }
}

async function loadKnownApps() {
  try {
    const response = await fetch("data/app-categories.json");
    knownApps = await response.json();
    setStatus(`Loaded ${Object.keys(knownApps).length} known app mappings and ${localMappingCount()} saved local mappings.`);
  } catch {
    setStatus("Could not load known app database. Heuristics still work.");
  }
}

function isPackageName(text) {
  return /^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z0-9_]+)+$/.test(text);
}

function smartLabelFromPackage(pkg) {
  const overrides = {
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

  if (overrides[pkg]) return overrides[pkg];

  const generic = new Set([
    "com", "org", "net", "io", "ai", "app", "co", "de", "jp", "ru", "us", "gov", "ml", "md", "fi", "nl", "no", "eu", "dev", "chat", "air",
    "android", "mobile", "client", "release", "gold", "pro", "free", "fdroid", "flutter", "main", "launcher", "companion", "community",
    "browser", "music", "app"
  ]);

  const parts = String(pkg || "")
    .split(".")
    .map(x => x.trim())
    .filter(Boolean);

  const meaningful = parts.filter(part => !generic.has(part.toLowerCase()));
  const picked = meaningful.length ? meaningful[meaningful.length - 1] : (parts[parts.length - 1] || pkg || "App");

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

  return String(picked)
    .replace(/[_-]+/g, " ")
    .split(/\s+/)
    .map(word => acronyms[word.toLowerCase()] || word.replace(/\b\w/g, ch => ch.toUpperCase()))
    .join(" ");
}

function inferLabel(pkg) {
  return smartLabelFromPackage(pkg);
}

function slug(text) {
  return String(text || "app").toLowerCase().replace(/[^a-z0-9._-]+/g, "_").replace(/^_+|_+$/g, "") || "app";
}

function findComponentToken(text) {
  const componentInfo = String(text || "").match(/ComponentInfo\{([^}]+)\}/);
  if (componentInfo) return componentInfo[1];

  const component = String(text || "").match(/[a-zA-Z][a-zA-Z0-9_]*(?:\.[a-zA-Z0-9_]+)+\/[^\s,|;]+/);
  return component ? component[0] : "";
}

function findPackageToken(text) {
  const pkg = String(text || "").match(/\b[a-zA-Z][a-zA-Z0-9_]*(?:\.[a-zA-Z0-9_]+)+\b/);
  return pkg ? pkg[0] : "";
}

function cleanLabelText(text) {
  return String(text || "")
    .replace(/ComponentInfo\{[^}]+\}/g, " ")
    .replace(/[a-zA-Z][a-zA-Z0-9_]*(?:\.[a-zA-Z0-9_]+)+\/[^\s,|;]+/g, " ")
    .replace(/\b[a-zA-Z][a-zA-Z0-9_]*(?:\.[a-zA-Z0-9_]+)+\b/g, " ")
    .replace(/^[\s,|;:\-–—>]+|[\s,|;:\-–—>]+$/g, "")
    .trim();
}

function knownLabelForPackage(pkg) {
  return userMappings[`package:${pkg}`]?.label || knownApps[pkg]?.label || knownApps[pkg]?.name || inferLabel(pkg);
}

function normalizeLine(line) {
  let clean = String(line || "")
    .trim()
    .replace(/^[-*•]\s*/, "")
    .replace(/^package:/, "");

  if (!clean || clean.startsWith("#")) return null;

  const tokens = clean.split(/[,|;\t]+/).map(x => x.trim()).filter(Boolean);
  const componentRaw = findComponentToken(clean);
  const component = componentRaw ? parseAndroidComponentText(componentRaw) : null;

  if (component) {
    const label = cleanLabelText(clean) || knownLabelForPackage(component.package);
    return {
      package: component.package,
      component: component.component,
      label,
      id: component.component
    };
  }

  const pkg = findPackageToken(clean);

  if (pkg) {
    let activity = "";
    for (const token of tokens) {
      const t = token.trim();
      if (t === pkg) continue;
      if (t.startsWith(".")) activity = pkg + t;
      else if (t.startsWith(pkg + ".")) activity = t;
    }

    const label = cleanLabelText(clean) || knownLabelForPackage(pkg);

    if (activity) {
      return {
        package: pkg,
        component: `${pkg}/${activity}`,
        label,
        id: `${pkg}/${activity}`
      };
    }

    return {
      package: pkg,
      label,
      id: pkg
    };
  }

  const label = clean.replace(/^["']|["']$/g, "").trim();
  if (!label) return null;

  return {
    package: "",
    label,
    id: `label:${slug(label)}`
  };
}

function parseText(text) {
  const items = text.split(/\r?\n/).map(normalizeLine).filter(Boolean);
  const map = new Map();
  for (const item of items) map.set(item.id, item);
  return [...map.values()].sort((a, b) => a.label.localeCompare(b.label));
}

function categorize(app) {
  const saved = savedMappingFor(app);
  if (saved) {
    if (saved.label && (!app.label || app.label === inferLabel(app.package || ""))) {
      app.label = saved.label;
    }
    return { category: saved.category || "unknown", source: "saved" };
  }

  if (app.package && knownApps[app.package]) {
    return { category: knownApps[app.package].category || "unknown", source: "known" };
  }

  const haystack = `${app.package} ${app.label}`.toLowerCase();
  let best = { category: "unknown", score: 0 };

  for (const [category, terms] of Object.entries(categoryRules)) {
    let score = 0;
    for (const term of terms) if (haystack.includes(term)) score += term.length;
    if (score > best.score) best = { category, score };
  }

  if (best.score > 0) return { category: best.category, source: "guess" };
  return { category: "unknown", source: "unknown" };
}

function enrich(apps) {
  return apps.map(app => ({ ...app, ...categorize(app) }));
}

function hexToRgb(hex) {
  const c = hex.replace("#", "");
  return { r: parseInt(c.slice(0, 2), 16), g: parseInt(c.slice(2, 4), 16), b: parseInt(c.slice(4, 6), 16) };
}

function rgbToHex({ r, g, b }) {
  const h = v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

function mix(aHex, bHex, amount) {
  const a = hexToRgb(aHex);
  const b = hexToRgb(bHex);
  return rgbToHex({ r: a.r + (b.r - a.r) * amount, g: a.g + (b.g - a.g) * amount, b: a.b + (b.b - a.b) * amount });
}

function colorFor(category, localIndex) {
  const palette = palettes[document.getElementById("palette").value] || palettes.classic;
  const mode = document.getElementById("colorMode").value;
  const catIndex = Math.max(0, categoryOrder.indexOf(category));

  if (mode === "rainbow") {
    const rainbow = ["#ff595e", "#ff924c", "#ffca3a", "#8ac926", "#52a7ff", "#6a4c93", "#c77dff", "#aaaaaa"];
    return mix(rainbow[catIndex % rainbow.length], "#ffffff", (localIndex % 5) * 0.035);
  }

  if (mode === "categoryPalette") {
    return mix(palette[catIndex % palette.length], "#ffffff", (localIndex % 5) * 0.035);
  }

  const base = palette[2] || palette[0];
  const offset = catIndex - categoryOrder.length / 2;
  let color = offset < 0 ? mix(base, "#ffffff", Math.abs(offset) * 0.035) : mix(base, "#000000", Math.abs(offset) * 0.035);
  return mix(color, localIndex % 2 ? "#ffffff" : "#000000", (localIndex % 5) * 0.025);
}

function assignments() {
  const counts = {};
  return parsedApps.map(app => {
    const n = counts[app.category] || 0;
    counts[app.category] = n + 1;
    return { ...app, color: colorFor(app.category, n) };
  });
}

function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawIcon(size, color) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  const margin = size * 0.11;
  const square = size - margin * 2;
  const radius = size * 0.16;

  const gradient = ctx.createLinearGradient(0, margin, 0, margin + square);
  gradient.addColorStop(0, mix(color, "#ffffff", 0.08));
  gradient.addColorStop(1, mix(color, "#000000", 0.08));

  roundedRect(ctx, margin, margin, square, square, radius);
  ctx.fillStyle = gradient;
  ctx.fill();

  return canvas;
}

function escapeHtml(text) {
  return String(text || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function render() {
  const assigned = assignments();

  document.getElementById("summary").textContent =
    `${assigned.length} apps parsed. ${assigned.filter(a => a.source === "known").length} known, ${assigned.filter(a => a.source === "guess").length} guessed, ${assigned.filter(a => a.category === "unknown").length} unknown.`;

  const preview = document.getElementById("iconPreview");
  preview.innerHTML = "";

  for (const app of assigned.slice(0, 40)) {
    const item = document.createElement("div");
    item.className = "iconPreviewItem";
    item.innerHTML = `<div class="generatedIcon" style="background:${app.color}"></div><span>${app.label}</span>`;
    preview.appendChild(item);
  }

  const tbody = document.querySelector("#appsTable tbody");
  tbody.innerHTML = "";

  for (const app of assigned) {
    const tr = document.createElement("tr");

    const select = document.createElement("select");
    for (const cat of categoryOrder) {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = categoryLabels[cat];
      if (cat === app.category) opt.selected = true;
      select.appendChild(opt);
    }
    select.addEventListener("change", () => {
      const target = parsedApps.find(x => x.id === app.id);
      if (target) {
        target.category = select.value;
        target.source = "saved";
        saveUserMapping(target);
      }
      render();
    });

    const packageCell = app.package
      ? `${escapeHtml(app.package)}${app.component ? `<br><small>${escapeHtml(app.component)}</small>` : ""}`
      : "(name only)";

    tr.innerHTML = `
      <td><div class="generatedIcon mini" style="background:${app.color}"></div></td>
      <td>${escapeHtml(app.label)}</td>
      <td>${packageCell}</td>
      <td></td>
      <td>${escapeHtml(app.source)}</td>
    `;
    tr.children[3].appendChild(select);
    tbody.appendChild(tr);
  }
}

function processInput(text) {
  parsedApps = enrich(parseText(text));
  render();

  const savedCount = parsedApps.filter(app => app.source === "saved").length;
  const suffix = savedCount ? ` ${savedCount} saved local mappings applied.` : "";
  setStatus(parsedApps.length ? `App list parsed locally.${suffix}` : "No apps found.");
}

function contributionPayload(apps = parsedApps) {
  return {
    source: "lcars-icon-generator",
    submitted_at: new Date().toISOString(),
    apps: apps
      .filter(app => app.package)
      .map(app => ({
        label: app.label || knownLabelForPackage(app.package),
        package: app.package,
        component: app.component || "",
        category: app.category || "unknown",
        source: app.source || "unknown"
      }))
  };
}

function contributionJSON() {
  const out = {};
  for (const app of parsedApps) {
    if (!app.package || knownApps[app.package]) continue;
    out[app.package] = {
      label: app.label,
      component: app.component || "",
      category: app.category
    };
  }
  return JSON.stringify(out, null, 2);
}

function canvasBlob(canvas) {
  return new Promise(resolve => canvas.toBlob(resolve, "image/png"));
}

async function downloadZip() {
  if (!parsedApps.length) return setStatus("Parse an app list first.");
  if (!window.JSZip) return setStatus("ZIP library did not load.");

  const zip = new JSZip();
  const size = Number(document.getElementById("iconSize").value);
  const manifest = [];

  for (const app of assignments()) {
    const canvas = drawIcon(size, app.color);
    const blob = await canvasBlob(canvas);
    const name = slug(app.package || app.label);
    zip.file(`icons/${name}.png`, blob);
    manifest.push({ file: `icons/${name}.png`, package: app.package, label: app.label, category: app.category, color: app.color });
  }

  zip.file("icon-manifest.json", JSON.stringify(manifest, null, 2));
  zip.file("unknown-app-contribution.json", contributionJSON());

  const blob = await zip.generateAsync({ type: "blob" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "lcars-niagara-icons.zip";
  link.click();
}

document.getElementById("parseApps").addEventListener("click", () => processInput(document.getElementById("appText").value));
document.getElementById("downloadZip").addEventListener("click", downloadZip);

document.getElementById("copyUnknowns").addEventListener("click", async () => {
  await navigator.clipboard.writeText(contributionJSON());
  setStatus("Unknown-app contribution JSON copied.");
});

document.getElementById("appFile").addEventListener("change", async event => {
  const file = event.target.files[0];
  if (!file) return;
  const text = await file.text();
  document.getElementById("appText").value = text;
  processInput(text);
});

document.querySelectorAll("#palette, #colorMode, #iconSize").forEach(el => el.addEventListener("input", render));

loadUserMappings();
loadKnownApps();

const APK_BUILDER_BASE = "https://lcars-builder.machinations.space";

function setApkBuildStatus(text) {
  const panel = document.getElementById("apkBuildPanel");
  const status = document.getElementById("apkBuildStatus");
  if (panel) panel.hidden = false;
  if (status) status.textContent = text;
}

function setApkDownload(url) {
  const link = document.getElementById("apkDownloadLink");
  if (!link) return;
  link.href = url;
  link.hidden = false;
}

function clearApkDownload() {
  const link = document.getElementById("apkDownloadLink");
  if (!link) return;
  link.href = "#";
  link.hidden = true;
}

function parseAndroidComponentText(value) {
  const raw = String(value || "").replace(/^package:/, "").trim();

  if (!raw.includes("/")) return null;

  const slashIndex = raw.indexOf("/");
  const pkg = raw.slice(0, slashIndex).trim();
  let activity = raw.slice(slashIndex + 1).trim();

  if (!pkg || !activity || !pkg.includes(".")) return null;

  if (activity.startsWith(".")) {
    activity = pkg + activity;
  }

  return {
    package: pkg,
    component: `${pkg}/${activity}`
  };
}

function appToApkJobEntry(app) {
  const raw = app.package || app.packageName || app.id || app.label || app.name || "";
  const parsedComponent = parseAndroidComponentText(raw);

  const pkg = parsedComponent
    ? parsedComponent.package
    : String(raw).replace(/^package:/, "").trim();

  const labelRaw = app.label || app.name || pkg;
  const label = parseAndroidComponentText(labelRaw) ? pkg : labelRaw;

  const entry = {
    package: pkg,
    label,
    category: app.category || "unknown",
    color: app.color || "#d62b18"
  };

  if (parsedComponent) {
    entry.component = parsedComponent.component;
  } else {
    if (app.component) {
      const parsedStoredComponent = parseAndroidComponentText(app.component);
      entry.component = parsedStoredComponent ? parsedStoredComponent.component : app.component;
    }
    if (app.activity) entry.activity = app.activity;
  }

  return entry;
}

function createApkJobFromParsedApps() {
  const apps = (parsedApps || [])
    .map(appToApkJobEntry)
    .filter(app => app.package);

  if (!apps.length) {
    throw new Error("Parse an app list before building an APK.");
  }

  return {
    iconPackName: "LCARS Niagara Icons",
    applicationId: "com.yearbookenzyme.lcarsiconpack.generated",
    palette: document.getElementById("palette")?.value || "classic",
    colorMode: document.getElementById("colorMode")?.value || "themeMono",
    apps
  };
}

async function readBuilderJson(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { error: text || `HTTP ${response.status}` };
  }
}

async function pollApkBuild(statusUrl) {
  for (let i = 0; i < 80; i += 1) {
    const response = await fetch(statusUrl, { cache: "no-store" });
    const data = await readBuilderJson(response);

    if (!response.ok) {
      throw new Error(data.error || `Status request failed with HTTP ${response.status}`);
    }

    const status = data.status || "unknown";
    const message = data.message ? ` — ${data.message}` : "";
    setApkBuildStatus(`APK build ${status}${message}`);

    if (status === "done") {
      if (!data.download_url) {
        throw new Error("Build finished but no download_url was returned.");
      }
      setApkDownload(data.download_url);
      setStatus("Signed APK ready.");
      return data;
    }

    if (status === "failed") {
      throw new Error(data.message || "APK build failed.");
    }

    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  throw new Error("APK build timed out while waiting for the server.");
}


async function submitMappingContribution(apps, { requireOptIn = true, updateStatus = false } = {}) {
  const checkbox = document.getElementById("shareMappings");

  if (requireOptIn && !checkbox?.checked) {
    if (updateStatus) {
      setStatus("To submit reviewed mappings, first check “Share parsed app mappings.”");
    }
    return { ok: false, skipped: true, reason: "sharing-not-enabled" };
  }

  saveUserMappingsForApps(apps);

  const payload = contributionPayload(apps);

  if (!payload.apps.length) {
    if (updateStatus) setStatus("No package mappings found to submit.");
    return { ok: false, skipped: true, reason: "empty-payload" };
  }

  try {
    const response = await fetch(`${APK_BUILDER_BASE}/contribute.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await readBuilderJson(response);

    if (!response.ok) {
      throw new Error(data.error || `Mapping submit failed with HTTP ${response.status}`);
    }

    if (updateStatus) {
      setStatus(`Submitted ${data.accepted ?? payload.apps.length} reviewed app mappings for database improvement.`);
    }

    return { ok: true, accepted: data.accepted ?? payload.apps.length };
  } catch (error) {
    console.warn("Mapping contribution failed", error);
    if (updateStatus) setStatus(`Mapping submit error: ${error.message}`);
    return { ok: false, error };
  }
}

async function submitReviewedMappings() {
  const button = document.getElementById("submitMappings");

  try {
    if (!parsedApps.length) {
      setStatus("Parse and review an app list before submitting mappings.");
      return;
    }

    if (button) {
      button.disabled = true;
      button.textContent = "Submitting mappings...";
    }

    await submitMappingContribution(assignments(), { updateStatus: true });
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = "Submit Reviewed Mappings";
    }
  }
}

async function buildSignedApk() {
  const button = document.getElementById("buildApk");

  try {
    clearApkDownload();

    if (button) {
      button.disabled = true;
      button.textContent = "Building APK...";
    }

    const job = createApkJobFromParsedApps();

    await submitMappingContribution(job.apps);

    setStatus("Sending APK build request...");
    setApkBuildStatus("Sending build request to LCARS APK builder...");

    const response = await fetch(`${APK_BUILDER_BASE}/build.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(job)
    });

    const data = await readBuilderJson(response);

    if (!response.ok) {
      throw new Error(data.error || `Build request failed with HTTP ${response.status}`);
    }

    if (!data.status_url) {
      throw new Error("Builder did not return a status_url.");
    }

    setStatus("APK build queued.");
    setApkBuildStatus(`APK build queued. Job ${data.job_id || ""}`.trim());

    await pollApkBuild(data.status_url);
  } catch (error) {
    console.error(error);
    setStatus(`APK build error: ${error.message}`);
    setApkBuildStatus(`APK build error: ${error.message}`);
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = "Build Signed APK";
    }
  }
}

document.getElementById("buildApk")?.addEventListener("click", buildSignedApk);
document.getElementById("submitMappings")?.addEventListener("click", submitReviewedMappings);

function parseApkInputLinesFromTextarea() {
  const text = document.getElementById("appText")?.value || "";
  return text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith("#"));
}

function guessLabelFromPackage(pkg) {
  const last = String(pkg || "").split(".").filter(Boolean).pop() || pkg || "App";
  return last
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, ch => ch.toUpperCase());
}


function colorForApkJob(app, index) {
  if (app.color && /^#[0-9a-fA-F]{6}$/.test(app.color)) {
    return app.color;
  }

  const lcars = [
    "#d62b18",
    "#df5a1f",
    "#e09a3f",
    "#dfb98a",
    "#be4b3f",
    "#f0c48c"
  ];

  return lcars[index % lcars.length];
}

function jobEntryFromCurrentApp(app, index) {
  return {
    package: app.package,
    component: app.component || "",
    label: app.label || knownLabelForPackage(app.package),
    category: app.category || "unknown",
    color: app.color || colorForApkJob(app, index)
  };
}

function createApkJobFromTextareaFirst() {
  const currentApps = parsedApps && parsedApps.length
    ? assignments().filter(app => app.package)
    : [];

  if (currentApps.length) {
    return currentApps.map(jobEntryFromCurrentApp);
  }

  const text = document.getElementById("appText")?.value || "";
  const lineApps = enrich(parseText(text)).filter(app => app.package);

  if (lineApps.length) {
    return lineApps.map(jobEntryFromCurrentApp);
  }

  return (parsedApps || [])
    .map(appToApkJobEntry)
    .filter(app => app.package);
}

function createApkJobFromParsedApps() {
  const apps = createApkJobFromTextareaFirst();

  if (!apps.length) {
    throw new Error("Parse or paste an Android app list before building an APK.");
  }

  return {
    iconPackName: "LCARS Niagara Icons",
    applicationId: "com.yearbookenzyme.lcarsiconpack.generated",
    palette: document.getElementById("palette")?.value || "classic",
    colorMode: document.getElementById("colorMode")?.value || "themeMono",
    apps
  };
}
