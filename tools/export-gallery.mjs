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
  { palette: "classic", rhythm: "standard", title: "Classic Warm · Standard LCARS stack" },
  { palette: "tng", rhythm: "balanced", title: "TNG Pastel · Balanced terminal blocks" },
  { palette: "voyager", rhythm: "tallLower", title: "Voyager Soft · Tall lower panels" },
  { palette: "red", rhythm: "standard", title: "Red Alert · Standard LCARS stack" },
  { palette: "medical", rhythm: "balanced", title: "Medical Teal · Balanced terminal blocks" },
  { palette: "opsBlue", rhythm: "staccato", title: "Operations Blue · Short accent blocks" },
  { palette: "spectrum", rhythm: "spectrumFlow", title: "Spectrum Rainbow · Spectrum flow" },
  { palette: "trueRainbow", rhythm: "spectrumFlow", title: "True Rainbow · Spectrum flow" },
  { palette: "pastelRainbow", rhythm: "spectrumFlow", title: "Pastel Rainbow · Spectrum flow" },
  { palette: "eink", rhythm: "balanced", title: "E-Ink Soft · Balanced terminal blocks" },
  { palette: "terminal", rhythm: "staccato", title: "Terminal Green · Short accent blocks" }
];

const iconConfigs = [
  { palette: "classic", mode: "themeMono", title: "Classic · Theme-matched monochrome" },
  { palette: "classic", mode: "categoryPalette", title: "Classic · Theme palette by category" },
  { palette: "spectrum", mode: "rainbow", title: "Spectrum · Rainbow category mode" },
  { palette: "trueRainbow", mode: "sequentialRainbow", title: "True Rainbow · Rainbow sequence mode" },
  { palette: "pastelRainbow", mode: "sequentialRainbow", title: "Pastel Rainbow · Rainbow sequence mode" },
  { palette: "terminal", mode: "themeMono", title: "Terminal Green · Theme-matched monochrome" }
];

const fontConfigs = [
  { font: "Federation", title: "Federation", note: "Recommended default for everyday launcher labels" },
  { font: "Federation Wide", title: "Federation Wide", note: "Broader display text" },
  { font: "Trek TNG Monitors", title: "Trek TNG Monitors", note: "More console-accurate computer readout feel" },
  { font: "Context Ultra Condensed", title: "Context Ultra Condensed", note: "Narrow LCARS label style" },
  { font: "Jefferies Extended", title: "Jefferies Extended", note: "Display/title style" }
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

  for (const cfg of wallpaperConfigs) {
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

  for (const cfg of iconConfigs) {
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
