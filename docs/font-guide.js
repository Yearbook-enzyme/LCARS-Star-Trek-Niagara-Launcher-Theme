const fontStacks = {
  system: {
    label: "System fallback",
    stack: 'Arial, Helvetica, sans-serif'
  },

  trekTngMonitors: {
    label: "Trek TNG Monitors",
    stack: '"Trek TNG Monitors", Arial, Helvetica, sans-serif'
  },
  contextUltra: {
    label: "Context Ultra Condensed SSi",
    stack: '"Context Ultra Condensed SSi", "Arial Narrow", Arial, sans-serif'
  },
  contextUltraBold: {
    label: "Context Ultra Condensed SSi Bold",
    stack: '"Context Ultra Condensed SSi", "Arial Narrow", Arial, sans-serif'
  },
  federation: {
    label: "Federation",
    stack: '"Federation", Arial, sans-serif'
  },
  federationWide: {
    label: "Federation Wide",
    stack: '"FederationWide", "Federation", Arial, sans-serif'
  },
  starfleetClassic: {
    label: "Trek Classic Ship Hull / Deusex",
    stack: '"Deusex", "Trek Classic Ship Hull", Arial, sans-serif'
  },
  starfleetFederation: {
    label: "Federation Starfleet",
    stack: '"FederationStarfleet", "Federation Starfleet", Arial, sans-serif'
  },
  beijing: {
    label: "Beijing SSi",
    stack: '"Beijing SSi", Arial, sans-serif'
  },

  jefferies: {
    label: "Jefferies Extended",
    stack: '"Jefferies", "Jefferies Extended", Arial, sans-serif'
  },
  trekMovie1: {
    label: "Trek Movie 1 / Berette",
    stack: '"Berette", Arial, sans-serif'
  },
  tosTitle: {
    label: "TOS Title / Trek Classic Credits",
    stack: '"Trek", Arial, sans-serif'
  },
  trekMovie2: {
    label: "Trek Movie 2 / Trek Generation 1",
    stack: '"Trek Generation 1", Arial, sans-serif'
  },

  klingon: {
    label: "KlingonTNG",
    stack: '"KlingonTNG", "Klingon", Arial, sans-serif'
  },
  vulcan: {
    label: "Modern Vulcan",
    stack: '"Modern vulcan 1.1", Arial, sans-serif'
  },
  romulan: {
    label: "Romulan",
    stack: '"Romulan", Arial, sans-serif'
  },
  bajoran: {
    label: "ST Bajoran Ideogram",
    stack: '"ST Bajoran Ideogram", Arial, sans-serif'
  },
  cardassian: {
    label: "ST Cardassian",
    stack: '"ST Cardassian", Arial, sans-serif'
  },
  dominion: {
    label: "ST Dominion",
    stack: '"ST Dominion", Arial, sans-serif'
  },
  ferengi: {
    label: "ST Ferengi R",
    stack: '"ST Ferengi R", Arial, sans-serif'
  },
  fabrini: {
    label: "Fabrini",
    stack: '"Fabrini", Arial, sans-serif'
  },
  tholian: {
    label: "Tholian",
    stack: '"Tholian", Arial, sans-serif'
  },
  trill: {
    label: "Trill",
    stack: '"Trill", Arial, sans-serif'
  },
  trekbats: {
    label: "Trekbats",
    stack: '"Trekbats", Arial, sans-serif'
  }
};

const fontChoice = document.getElementById("fontChoice");
const previewInput = document.getElementById("previewText");
const localFontFile = document.getElementById("localFontFile");
const fontStatus = document.getElementById("fontStatus");
const wallpaperCanvas = document.getElementById("niagaraWallpaperCanvas");

let localFontStack = "";

function applyFont(stack) {
  document.querySelectorAll(
    ".niagaraLauncherLayer, .launcherTime, .launcherDate, .launcherList, .launcherRow, .launcherAlphabet"
  ).forEach((el) => {
    el.style.fontFamily = stack;
  });

  // Keep mock icon letters readable even when the selected font is an alien script.
  document.querySelectorAll(".launcherIcon").forEach((el) => {
    el.style.fontFamily = "Arial, Helvetica, sans-serif";
  });
}

function updateFontPreview() {
  const text = previewInput?.value || "Machinations";
  const label = document.getElementById("fontPreviewText");
  if (label) label.textContent = text;

  if (localFontStack) {
    applyFont(localFontStack);
    if (fontStatus) {
      fontStatus.textContent = "Font status: using the font file you loaded directly into this browser session.";
    }
    return;
  }

  const info = fontStacks[fontChoice?.value || "system"] || fontStacks.system;
  applyFont(info.stack);

  if (fontStatus) {
    fontStatus.textContent = `Font status: trying CSS font stack for ${info.label}. If it does not visibly change, load the exact .ttf file below.`;
  }
}

async function loadLocalFontFile() {
  const file = localFontFile?.files?.[0];
  if (!file) return;

  try {
    const buffer = await file.arrayBuffer();
    const safeName = `LCARSLocalPreview${Date.now()}`;
    const face = new FontFace(safeName, buffer);
    await face.load();
    document.fonts.add(face);
    localFontStack = `"${safeName}", Arial, Helvetica, sans-serif`;
    updateFontPreview();

    if (fontStatus) {
      fontStatus.textContent = `Font status: loaded ${file.name} directly for this preview session.`;
    }
  } catch (error) {
    console.error(error);
    localFontStack = "";
    if (fontStatus) {
      fontStatus.textContent = `Font status: could not load ${file.name}. Try another .ttf or .otf file.`;
    }
  }
}

function rect(c, x, y, w, h, color) {
  if (w <= 0 || h <= 0) return;
  c.fillStyle = color;
  c.fillRect(x, y, w, h);
}

function drawWallpaperReplica() {
  if (!wallpaperCanvas) return;

  const c = wallpaperCanvas.getContext("2d");
  const w = wallpaperCanvas.width;
  const h = wallpaperCanvas.height;

  c.fillStyle = "#000";
  c.fillRect(0, 0, w, h);

  const palette = ["#e8bd88", "#df5a1f", "#d62b18", "#e09a3f", "#dfb98a"];
  const spineX = w * 0.67;
  const rightW = w - spineX;
  const t = h * 0.021;
  const gap = h * 0.013;
  const barY = h * 0.19;
  const railTopY = barY - t - gap / 2;
  const railBottomY = barY + gap / 2;

  const leftGap = w * 0.010;
  const leftSeg1W = w * 0.21;
  const leftSeg2W = w * 0.21;
  const railStart = leftSeg1W + leftGap + leftSeg2W + leftGap;

  const innerW = w * 0.095;
  const innerH = h * 0.050;
  const outerW = w * 0.147;
  const outerH = h * 0.074;

  const topOrangeH = h * 0.082;
  const topRedY = topOrangeH + gap;
  const topRedBottom = railTopY + t;

  const lowerRedTop = railBottomY;
  const lowerRedBottom = railBottomY + t + innerH;

  const midOrangeH = h * 0.055;
  const goldH = h * 0.166;
  const creamH = h * 0.153;
  const midOrangeY = lowerRedBottom + gap;
  const goldY = midOrangeY + midOrangeH + gap;
  const creamY = goldY + goldH + gap;
  const bottomRedY = creamY + creamH + gap;

  // left rails
  rect(c, 0, railTopY, leftSeg1W, t, palette[0]);
  rect(c, leftSeg1W + leftGap, railTopY, leftSeg2W, t, palette[1]);
  rect(c, 0, railBottomY, leftSeg1W, t, palette[0]);
  rect(c, leftSeg1W + leftGap, railBottomY, leftSeg2W, t, palette[1]);

  // top block
  rect(c, spineX, 0, rightW, topOrangeH, palette[1]);

  // upper elbow, close to main generator proportions
  c.fillStyle = palette[2];
  c.beginPath();
  c.moveTo(railStart, railTopY);
  c.lineTo(spineX - innerW, railTopY);
  c.quadraticCurveTo(spineX, railTopY, spineX, railTopY - innerH);
  c.lineTo(spineX, topRedY);
  c.lineTo(w, topRedY);
  c.lineTo(w, topRedBottom - outerH);
  c.quadraticCurveTo(w, topRedBottom, w - outerW, topRedBottom);
  c.lineTo(railStart, topRedBottom);
  c.closePath();
  c.fill();

  // lower elbow
  c.fillStyle = palette[2];
  c.beginPath();
  c.moveTo(railStart, lowerRedTop);
  c.lineTo(w - outerW, lowerRedTop);
  c.quadraticCurveTo(w, lowerRedTop, w, lowerRedTop + outerH);
  c.lineTo(w, lowerRedBottom);
  c.lineTo(spineX, lowerRedBottom);
  c.quadraticCurveTo(spineX, railBottomY + t, spineX - innerW, railBottomY + t);
  c.lineTo(railStart, railBottomY + t);
  c.closePath();
  c.fill();

  rect(c, spineX, midOrangeY, rightW, midOrangeH, palette[1]);
  rect(c, spineX, goldY, rightW, goldH, palette[3]);
  rect(c, spineX, creamY, rightW, creamH, palette[4]);
  rect(c, spineX, bottomRedY, rightW, h - bottomRedY, palette[2]);
}

fontChoice?.addEventListener("change", () => {
  localFontStack = "";
  if (localFontFile) localFontFile.value = "";
  updateFontPreview();
});

previewInput?.addEventListener("input", updateFontPreview);
localFontFile?.addEventListener("change", loadLocalFontFile);

drawWallpaperReplica();
updateFontPreview();
