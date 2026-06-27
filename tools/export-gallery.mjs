import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promises as fs } from "node:fs";
import { chromium } from "playwright";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const docsDir = path.join(repoRoot, "docs");
const outBase = path.join(docsDir, "gallery-assets");

const wallpaperConfigs = [
  { palette: "classic", title: "Classic Warm LCARS" },
  { palette: "tng", title: "TNG Pastel LCARS" },
  { palette: "ds9", title: "DS9 Muted Station" },
  { palette: "voyager", title: "Voyager Soft" },
  { palette: "command", title: "Command Gold" },
  { palette: "red", title: "Red Alert" },
  { palette: "security", title: "Security Red" },
  { palette: "science", title: "Science Blue/Purple" },
  { palette: "medical", title: "Medical Teal" },
  { palette: "opsBlue", title: "Operations Blue" },
  { palette: "lowerDecks", title: "Lower Decks Bright" },
  { palette: "latinum", title: "Latinum Gold" },
  { palette: "romulan", title: "Romulan Green" },
  { palette: "muted", title: "Muted OLED" },
  { palette: "grayscale", title: "Grayscale LCARS" },
  { palette: "eink", title: "E-Ink Soft" },
  { palette: "terminal", title: "Terminal Green" },
  { palette: "spectrum", title: "Spectrum Rainbow LCARS" },
  { palette: "trueRainbow", title: "True Rainbow LCARS" },
  { palette: "pastelRainbow", title: "Pastel Rainbow LCARS" },
  { palette: "highContrast", title: "High Contrast" }
];

const rhythmConfigs = [
  { rhythm: "standard", title: "Standard LCARS stack" },
  { rhythm: "stepped", title: "Stepped color rhythm" },
  { rhythm: "tallLower", title: "Tall lower panels" },
  { rhythm: "staccato", title: "Short accent blocks" },
  { rhythm: "balanced", title: "Balanced terminal blocks" },
  { rhythm: "spectrumFlow", title: "Spectrum flow" }
];

const wallpaperMatrix = wallpaperConfigs.flatMap(palette =>
  rhythmConfigs.map(rhythm => ({
    palette: palette.palette,
    rhythm: rhythm.rhythm,
    title: `${palette.title} · ${rhythm.title}`
  }))
);

const iconPaletteConfigs = [
  { palette: "classic", title: "Classic Warm LCARS" },
  { palette: "tng", title: "TNG Pastel LCARS" },
  { palette: "ds9", title: "DS9 Muted Station" },
  { palette: "voyager", title: "Voyager Soft" },
  { palette: "command", title: "Command Gold" },
  { palette: "red", title: "Red Alert" },
  { palette: "security", title: "Security Red" },
  { palette: "science", title: "Science Blue/Purple" },
  { palette: "medical", title: "Medical Teal" },
  { palette: "opsBlue", title: "Operations Blue" },
  { palette: "lowerDecks", title: "Lower Decks Bright" },
  { palette: "latinum", title: "Latinum Gold" },
  { palette: "romulan", title: "Romulan Green" },
  { palette: "muted", title: "Muted OLED" },
  { palette: "grayscale", title: "Grayscale LCARS" },
  { palette: "eink", title: "E-Ink Soft" },
  { palette: "terminal", title: "Terminal Green" },
  { palette: "spectrum", title: "Spectrum Rainbow LCARS" },
  { palette: "trueRainbow", title: "True Rainbow LCARS" },
  { palette: "pastelRainbow", title: "Pastel Rainbow LCARS" },
  { palette: "highContrast", title: "High Contrast" }
];

const iconModeConfigs = [
  { mode: "themeMono", title: "Theme-matched monochrome" },
  { mode: "categoryPalette", title: "Theme palette by category" }
];

const iconMatrix = iconPaletteConfigs.flatMap(palette =>
  iconModeConfigs.map(mode => ({
    palette: palette.palette,
    mode: mode.mode,
    title: `${palette.title} · ${mode.title}`
  }))
);

const fontConfigs = [
  { font: "Federation", title: "Federation", note: "Recommended default for everyday launcher labels" },
  { font: "Federation Wide", title: "Federation Wide", note: "Broader display text" },
  { font: "Trek TNG Monitors", title: "Trek TNG Monitors", note: "More console-accurate computer readout feel" },
  { font: "Context Ultra Condensed", title: "Context Ultra Condensed", note: "Narrow LCARS label style" },
  { font: "Context Ultra Condensed Bold", title: "Context Ultra Condensed Bold", note: "Stronger narrow LCARS labels" },
  { font: "Jefferies Extended", title: "Jefferies Extended", note: "Elongated starship-like display text" },
  { font: "TOS Title", title: "TOS Title", note: "Original-series retro title feel" },
  { font: "Trek Movie 1", title: "Trek Movie 1", note: "Theatrical display styling" },
  { font: "Trek Movie 2", title: "Trek Movie 2", note: "Alternate theatrical display styling" },
  { font: "Starfleet", title: "Starfleet", note: "Starship-flavored accent text" },
  { font: "Classic Ship Hull", title: "Classic Ship Hull", note: "Hull marking style accent text" },
  { font: "Klingon", title: "Klingon", note: "Alien-script decorative accent" },
  { font: "Vulcan", title: "Vulcan", note: "Alien-script decorative accent" },
  { font: "Romulan", title: "Romulan", note: "Alien-script decorative accent" },
  { font: "Bajoran", title: "Bajoran", note: "Alien-script decorative accent" },
  { font: "Cardassian", title: "Cardassian", note: "Alien-script decorative accent" },
  { font: "Dominion", title: "Dominion", note: "Alien-script decorative accent" },
  { font: "Ferengi", title: "Ferengi", note: "Alien-script decorative accent" },
  { font: "Tholian", title: "Tholian", note: "Alien-script decorative accent" },
  { font: "Trill", title: "Trill", note: "Alien-script decorative accent" },
  { font: "Trekbats", title: "Trekbats", note: "Symbol/decorative accent font" }
];

const sampleApps = [
  "com.discord/com.discord.main.MainDefault",
  "com.brave.browser/com.google.android.apps.chrome.Main",
  "com.openai.chatgpt/com.openai.chatgpt.MainActivity",
  "com.fitbit.FitbitMobile/com.fitbit.FitbitMobile.MainActivity",
  "com.google.android.youtube/com.google.android.youtube.HomeActivity",
  "org.joinmastodon.android/org.joinmastodon.android.MainActivity",
  "org.torproject.torbrowser/org.torproject.torbrowser.BrowserActivity",
  "com.spotify.music/com.spotify.music.MainActivity",
  "md.obsidian/md.obsidian.MainActivity",
  "org.fdroid.fdroid/org.fdroid.fdroid.views.main.MainActivity",
  "io.homeassistant.companion.android/io.homeassistant.companion.android.launch.LaunchActivity",
  "com.google.android.apps.maps/com.google.android.maps.MapsActivity"
].join("\n");

async function ensureDirs() {
  await fs.mkdir(path.join(outBase, "wallpapers"), { recursive: true });
  await fs.mkdir(path.join(outBase, "icons"), { recursive: true });
  await fs.mkdir(path.join(outBase, "fonts"), { recursive: true });
}

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return {
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".nlt": "application/octet-stream"
  }[ext] || "application/octet-stream";
}

async function serveFile(req, res) {
  const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
  let filePath = path.join(repoRoot, urlPath === "/" ? "docs/index.html" : urlPath.replace(/^\/+/, ""));

  try {
    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) filePath = path.join(filePath, "index.html");
    const data = await fs.readFile(filePath);
    res.writeHead(200, { "Content-Type": contentType(filePath) });
    res.end(data);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
}

function startServer(port = 4173) {
  const server = http.createServer((req, res) => {
    serveFile(req, res).catch(err => {
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      res.end(String(err));
    });
  });

  return new Promise(resolve => {
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}

function slug(text) {
  return String(text).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

async function writeDataUrl(filePath, dataUrl) {
  const base64 = dataUrl.split(",")[1];
  await fs.writeFile(filePath, Buffer.from(base64, "base64"));
}

async function exportWallpapers(browser, baseUrl) {
  const page = await browser.newPage({ viewport: { width: 1400, height: 1100 } });
  await page.goto(`${baseUrl}/docs/index.html`, { waitUntil: "networkidle" });

  const out = [];

  for (const cfg of wallpaperMatrix) {
    await page.evaluate(({ palette, rhythm }) => {
      document.getElementById("preset").value = "1080x2400";
      document.getElementById("palette").value = palette;
      document.getElementById("panelRhythm").value = rhythm;
      if (window.updateAll) window.updateAll();
    }, cfg);

    await page.waitForTimeout(120);

    const dataUrl = await page.evaluate(() => {
      const exportCanvas = document.createElement("canvas");
      window.drawWallpaper(exportCanvas);
      return exportCanvas.toDataURL("image/png");
    });

    const filename = `${slug(cfg.palette)}-${slug(cfg.rhythm)}.png`;
    const rel = `gallery-assets/wallpapers/${filename}`;
    const abs = path.join(docsDir, rel);

    await writeDataUrl(abs, dataUrl);

    out.push({
      title: cfg.title,
      palette: cfg.palette,
      rhythm: cfg.rhythm,
      file: rel
    });
  }

  await page.close();
  return out;
}


function escapeXml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function writeSvg(filePath, svg) {
  await fs.writeFile(filePath, svg, "utf8");
}

function phoneMockupSvg({ title, palette, mode = "categoryPalette", font = "system-ui", note = "" }) {
  const colors = palette || ["#ff1744", "#ff9100", "#ffea00", "#00e676", "#00b0ff", "#7c4dff"];
  const safeTitle = escapeXml(title);
  const safeFont = escapeXml(font || "system-ui");
  const safeNote = escapeXml(note || "");

  const apps = [
    ["Discord", "communication"],
    ["Brave", "browser"],
    ["ChatGPT", "ai"],
    ["Grayjay", "media"],
    ["Feeder", "reading"],
    ["Gallery", "photography"],
    ["Health", "health"],
    ["Withings", "health"],
    ["Reddit", "communication"],
    ["Chess", "games"],
    ["lichess", "games"],
    ["Settings", "system"]
  ];

  const categoryIndex = {
    communication: 0,
    browser: 1,
    ai: 2,
    media: 3,
    reading: 4,
    photography: 5,
    health: 1,
    games: 2,
    system: 4
  };

  const iconColor = (category, index) => {
    if (mode === "themeMono") {
      return index % 2 ? (colors[2] || colors[0]) : (colors[1] || colors[0]);
    }

    return colors[categoryIndex[category] % colors.length] || colors[0];
  };

  const appRows = apps.map(([name, category], index) => {
    const y = 450 + index * 76;
    const color = iconColor(category, index);

    return `
      <rect x="68" y="${y}" width="46" height="46" rx="11" fill="${color}" />
      <rect x="75" y="${y + 6}" width="32" height="7" rx="4" fill="#ffffff" opacity="0.14" />
      <text x="146" y="${y + 31}" class="appName">${escapeXml(name)}</text>`;
  }).join("");

  const blockHeights = [92, 132, 178, 210, 235, 190];
  let y = 0;
  const blocks = colors.map((color, index) => {
    const h = blockHeights[index % blockHeights.length];
    const out = `<rect x="512" y="${y}" width="178" height="${h}" fill="${color}" />`;
    y += h + 16;
    return out;
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="760" height="1500" viewBox="0 0 760 1500">
  <style>
    .time, .date, .appName {
      font-family: "${safeFont}", system-ui, sans-serif;
      fill: #ffffff;
    }

    .time {
      font-size: 78px;
      letter-spacing: 2px;
    }

    .date {
      font-size: 22px;
      opacity: 0.9;
    }

    .appName {
      font-size: 22px;
      letter-spacing: 1px;
    }

    .caption {
      font-family: system-ui, sans-serif;
      fill: #ffd3a0;
      font-size: 18px;
    }
  </style>

  <rect width="760" height="1500" fill="#101010" />
  <rect x="35" y="40" width="690" height="1420" rx="54" fill="#000000" />

  <clipPath id="phoneClip">
    <rect x="35" y="40" width="690" height="1420" rx="54" />
  </clipPath>

  <g clip-path="url(#phoneClip)">
    <rect x="35" y="40" width="690" height="1420" fill="#000000" />

    <rect x="0" y="225" width="130" height="23" fill="${colors[0] || "#ff1744"}" />
    <rect x="135" y="225" width="166" height="23" fill="${colors[2] || "#ffea00"}" />
    <rect x="306" y="225" width="419" height="58" rx="29" fill="${colors[1] || "#ff9100"}" />

    ${blocks}

    <text x="68" y="405" class="time">7:31</text>
    <text x="68" y="438" class="date">Fri, Jun 26 · 72°</text>

    ${appRows}

    <text x="68" y="1380" class="caption">${safeTitle}</text>
    ${safeNote ? `<text x="68" y="1408" class="caption" opacity="0.78">${safeNote}</text>` : ""}

    <circle cx="380" cy="1432" r="10" fill="#ffffff" />
  </g>
</svg>`;
}


function paletteForName(name) {
  const palettes = {
    classic: ["#e8bd88", "#df5a1f", "#d62b18", "#e09a3f", "#dfb98a"],
    tng: ["#ffcc99", "#ff9900", "#cc3300", "#cc6699", "#9999cc"],
    ds9: ["#c8a46a", "#b8542a", "#9e271c", "#8f6238", "#c19a70"],
    voyager: ["#f1c48e", "#d89b52", "#c96b38", "#8e5bb8", "#b9a0dd"],
    command: ["#ffd89a", "#f0a43a", "#d65a28", "#ffc85a", "#ffe2b3"],
    red: ["#ffc0b8", "#e45a4e", "#d62b18", "#aa1d14", "#f08a28"],
    security: ["#ffc7c7", "#d96464", "#b32626", "#7c1d1d", "#f08a28"],
    science: ["#c9b8ff", "#8f72d8", "#4d47a9", "#73b7e8", "#d8d0ff"],
    medical: ["#b6ffe4", "#46c2a6", "#167f7a", "#f1c96a", "#e8d7a0"],
    opsBlue: ["#99c9ff", "#4d8bd8", "#2f5fa3", "#9f7dd6", "#d0c3ff"],
    lowerDecks: ["#ffd6a5", "#ff9f1c", "#e71d36", "#2ec4b6", "#cbf3f0"],
    latinum: ["#f7d58c", "#c99732", "#8a5c1b", "#f1aa30", "#ffe0a3"],
    romulan: ["#c8f7c5", "#65b96f", "#2e7d32", "#8fbf66", "#d4e8c3"],
    muted: ["#c98769", "#a9482a", "#8f241c", "#d09242", "#d7b083"],
    grayscale: ["#e8e8e8", "#b7b7b7", "#777777", "#9a9a9a", "#d8d8d8"],
    eink: ["#f0ead8", "#c8bfa8", "#817969", "#a69a80", "#e2d7bd"],
    terminal: ["#b7ffb7", "#5edc5e", "#1e9b1e", "#77cc77", "#d4ffd4"],
    spectrum: ["#ff2d55", "#ff9500", "#ffd60a", "#32d74b", "#0a84ff", "#bf5af2"],
    trueRainbow: ["#ff1744", "#ff9100", "#ffea00", "#00e676", "#00b0ff", "#7c4dff"],
    pastelRainbow: ["#ff9aa2", "#ffb347", "#fff275", "#77dd77", "#89cff0", "#b39ddb"],
    highContrast: ["#ffffff", "#ff9f1c", "#ff2e2e", "#ffd23f", "#f7f7f7"]
  };

  return palettes[name] || palettes.classic;
}

async function exportIcons() {
  const out = [];

  for (const cfg of iconMatrix) {
    const filename = `${slug(cfg.palette)}-${slug(cfg.mode)}.svg`;
    const rel = `gallery-assets/icons/${filename}`;
    const abs = path.join(docsDir, rel);

    await writeSvg(abs, phoneMockupSvg({
      title: cfg.title,
      palette: paletteForName(cfg.palette),
      mode: cfg.mode,
      note: "Niagara-style icon preview"
    }));

    out.push({
      title: cfg.title,
      palette: cfg.palette,
      mode: cfg.mode,
      file: rel
    });
  }

  return out;
}

async function exportFonts() {
  const out = [];

  for (const cfg of fontConfigs) {
    const filename = `${slug(cfg.font)}.svg`;
    const rel = `gallery-assets/fonts/${filename}`;
    const abs = path.join(docsDir, rel);

    await writeSvg(abs, phoneMockupSvg({
      title: cfg.title,
      palette: paletteForName("classic"),
      mode: "categoryPalette",
      font: cfg.font,
      note: cfg.note
    }));

    out.push({
      title: cfg.title,
      font: cfg.font,
      note: cfg.note,
      file: rel
    });
  }

  return out;
}

async function main() {
  await ensureDirs();
  const server = await startServer();
  const baseUrl = "http://127.0.0.1:4173";

  const launchOptions = {
    headless: true,
    chromiumSandbox: false,
    args: [
      "--no-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--disable-crash-reporter",
      "--disable-crashpad",
      "--disable-breakpad",
    ]
  };

  if (process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH) {
    launchOptions.executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  }

  const browser = await chromium.launch(launchOptions);

  try {
    const wallpapers = await exportWallpapers(browser, baseUrl);
    const icons = await exportIcons(browser, baseUrl);
    const fonts = await exportFonts(browser);

    const galleryData = {
      generatedAt: new Date().toISOString(),
      wallpapers,
      icons,
      fonts
    };

    await fs.writeFile(
      path.join(docsDir, "gallery-data.json"),
      JSON.stringify(galleryData, null, 2)
    );

    console.log(`Generated ${wallpapers.length} wallpaper previews.`);
    console.log(`Generated ${icons.length} icon previews.`);
    console.log(`Generated ${fonts.length} font specimens.`);
    console.log("Wrote docs/gallery-data.json");
  } finally {
    await browser.close().catch(() => {});
    server.close();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
