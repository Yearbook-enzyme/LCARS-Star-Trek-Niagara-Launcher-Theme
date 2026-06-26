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

async function exportIcons(browser, baseUrl) {
  const page = await browser.newPage({ viewport: { width: 1600, height: 1400 } });
  await page.goto(`${baseUrl}/docs/icon-generator.html`, { waitUntil: "networkidle" });

  await page.evaluate(text => {
    document.getElementById("appText").value = text;
  }, sampleApps);

  await page.click("#parseApps");
  await page.waitForTimeout(400);

  const out = [];

  for (const cfg of iconMatrix) {
    await page.evaluate(({ palette, mode }) => {
      document.getElementById("palette").value = palette;
      document.getElementById("colorMode").value = mode;
      if (window.render) window.render();
    }, cfg);

    await page.waitForTimeout(150);

    const preview = await page.locator(".previewWrap.widePreview").first();
    const filename = `${slug(cfg.palette)}-${slug(cfg.mode)}.png`;
    const rel = `gallery-assets/icons/${filename}`;
    const abs = path.join(docsDir, rel);

    await preview.screenshot({ path: abs });

    out.push({
      title: cfg.title,
      palette: cfg.palette,
      mode: cfg.mode,
      file: rel
    });
  }

  await page.close();
  return out;
}

function fontPageHtml(fontName, note) {
  const safeFont = fontName.replace(/"/g, "");
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>${safeFont}</title>
<style>
  body {
    margin: 0;
    background: #000;
    color: #f7d7a8;
    font-family: system-ui, sans-serif;
  }
  .card {
    width: 1200px;
    height: 420px;
    box-sizing: border-box;
    padding: 32px 36px;
    border-top: 18px solid #ff9500;
    border-right: 140px solid #d62b18;
    border-bottom: 18px solid #bf5af2;
    border-left: 18px solid #e8bd88;
    background: #000;
  }
  .label {
    color: #ff9500;
    font-size: 18px;
    letter-spacing: 0.08em;
    margin-bottom: 18px;
    text-transform: uppercase;
  }
  .title {
    font-family: "${safeFont}", system-ui, sans-serif;
    color: #ffffff;
    font-size: 72px;
    line-height: 1.0;
    margin: 0 0 18px 0;
  }
  .sample {
    font-family: "${safeFont}", system-ui, sans-serif;
    color: #f7d7a8;
    font-size: 34px;
    line-height: 1.3;
    margin: 0 0 18px 0;
  }
  .note {
    color: #d7b083;
    font-size: 20px;
  }
</style>
</head>
<body>
  <div class="card">
    <div class="label">LCARS Font Specimen</div>
    <h1 class="title">${safeFont}</h1>
    <p class="sample">Niagara Launcher • LCARS Interface • App Labels • Command Surface</p>
    <p class="note">${note}</p>
  </div>
</body>
</html>`;
}

async function exportFonts(browser) {
  const page = await browser.newPage({ viewport: { width: 1200, height: 420 } });
  const out = [];

  for (const cfg of fontConfigs) {
    await page.setContent(fontPageHtml(cfg.font, cfg.note), { waitUntil: "load" });
    await page.waitForTimeout(100);

    const filename = `${slug(cfg.font)}.png`;
    const rel = `gallery-assets/fonts/${filename}`;
    const abs = path.join(docsDir, rel);

    await page.screenshot({ path: abs });

    out.push({
      title: cfg.title,
      font: cfg.font,
      note: cfg.note,
      file: rel
    });
  }

  await page.close();
  return out;
}

async function main() {
  await ensureDirs();
  const server = await startServer();
  const baseUrl = "http://127.0.0.1:4173";

  const launchOptions = {
    headless: true
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
    await browser.close();
    server.close();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
