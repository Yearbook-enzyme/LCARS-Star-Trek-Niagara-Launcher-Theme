// /home/logan/LCARS-Star-Trek-Niagara-Launcher-Theme/docs/app.js

const canvas = document.getElementById("preview");
const ctx = canvas.getContext("2d");

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
  highContrast: ["#ffffff", "#ff9f1c", "#ff2e2e", "#ffd23f", "#f7f7f7"]
};

const REF = {
  docW: 690,
  docH: 1536,
  railThickness: 26,
  centerGap: 20.466,
  leftSeg1W: 145,
  leftSeg2W: 145,
  leftGap: 7,
  topOrangeH: 126,
  lowerRedH: 186,
  midOrangeH: 84,
  goldH: 255,
  creamH: 235,
  innerRadius: 77.433,
  spineMinW: 110,
  divider: 8
};

function getSize() {
  const preset = document.getElementById("preset").value;

  if (preset === "custom") {
    return {
      w: Math.max(200, Number(document.getElementById("customW").value) || 1080),
      h: Math.max(200, Number(document.getElementById("customH").value) || 2400)
    };
  }

  const [w, h] = preset.split("x").map(Number);
  return { w, h };
}

function value(id, fallback) {
  const element = document.getElementById(id);
  return element ? Number(element.value) : fallback;
}

function clamp(number, min, max) {
  return Math.max(min, Math.min(max, number));
}

function fillRect(context, x, y, w, h, color) {
  if (w <= 0 || h <= 0) {
    return;
  }

  context.fillStyle = color;
  context.fillRect(x, y, w, h);
}

function getControls() {
  return {
    spinePct: value("spineX", 67) / 100,
    barPct: value("barY", 19) / 100,
    thicknessScale: value("thickness", 26) / REF.railThickness,
    segmentPct: value("segmentScale", 100) / 100
  };
}

function getRefGeometry(controls) {
  const t = clamp(controls.thicknessScale, 0.6, 2.5);
  const segmentPct = clamp(controls.segmentPct, 0.2, 1.5);

  const railH = REF.railThickness * t;
  const gap = REF.centerGap * t;
  const divider = REF.divider * t;
  const innerR = REF.innerRadius * t;

  const leftGap = REF.leftGap * t;
  const leftSeg1W = REF.leftSeg1W * segmentPct;
  const leftSeg2W = REF.leftSeg2W * segmentPct;
  const railStart = leftSeg1W + leftGap + leftSeg2W + leftGap;

  const minSpineX = railStart + innerR + 12;
  const maxSpineX = REF.docW - REF.spineMinW;
  const spineX = clamp(controls.spinePct * REF.docW, minSpineX, maxSpineX);
  const spineW = REF.docW - spineX;

  const topOrangeH = REF.topOrangeH * t;
  const topRedTop = topOrangeH + divider;

  const midOrangeH = REF.midOrangeH * t;
  const goldH = REF.goldH * t;
  const creamH = REF.creamH * t;
  const lowerRedH = Math.max(REF.lowerRedH * t, railH + innerR);

  const minBarCenterY = topRedTop + innerR + railH + gap / 2;
  const requiredBelow =
    lowerRedH +
    divider +
    midOrangeH +
    divider +
    goldH +
    divider +
    creamH +
    divider +
    80 * t;
  const maxBarCenterY = REF.docH - requiredBelow;
  const safeMaxBarCenterY = Math.max(minBarCenterY, maxBarCenterY);

  const barCenterY = clamp(controls.barPct * REF.docH, minBarCenterY, safeMaxBarCenterY);

  const upperBarTop = barCenterY - gap / 2 - railH;
  const upperBarBottom = upperBarTop + railH;
  const lowerBarTop = barCenterY + gap / 2;
  const lowerBarBottom = lowerBarTop + railH;

  const topRedBottom = upperBarBottom;
  const lowerRedTop = lowerBarTop;
  const lowerRedBottom = lowerRedTop + lowerRedH;

  const midOrangeY = lowerRedBottom + divider;
  const goldY = midOrangeY + midOrangeH + divider;
  const creamY = goldY + goldH + divider;
  const bottomRedY = creamY + creamH + divider;

  return {
    railH,
    gap,
    divider,
    innerR,
    leftGap,
    leftSeg1W,
    leftSeg2W,
    railStart,
    spineX,
    spineW,
    topOrangeH,
    topRedTop,
    topRedBottom,
    upperBarTop,
    upperBarBottom,
    lowerBarTop,
    lowerBarBottom,
    lowerRedTop,
    lowerRedBottom,
    midOrangeY,
    midOrangeH,
    goldY,
    goldH,
    creamY,
    creamH,
    bottomRedY
  };
}

function drawUpperRed(context, g, color) {
  context.fillStyle = color;
  context.beginPath();
  context.moveTo(g.railStart, g.upperBarTop);
  context.lineTo(g.spineX - g.innerR, g.upperBarTop);
  context.arc(
    g.spineX - g.innerR,
    g.upperBarTop - g.innerR,
    g.innerR,
    Math.PI / 2,
    0,
    true
  );
  context.lineTo(g.spineX, g.topRedTop);
  context.lineTo(REF.docW, g.topRedTop);
  context.lineTo(REF.docW, g.topRedBottom);
  context.lineTo(g.railStart, g.topRedBottom);
  context.closePath();
  context.fill();
}

function drawLowerRed(context, g, color) {
  context.fillStyle = color;
  context.beginPath();
  context.moveTo(g.railStart, g.lowerRedTop);
  context.lineTo(REF.docW, g.lowerRedTop);
  context.lineTo(REF.docW, g.lowerRedBottom);
  context.lineTo(g.spineX, g.lowerRedBottom);
  context.lineTo(g.spineX, g.lowerBarBottom + g.innerR);
  context.arc(
    g.spineX - g.innerR,
    g.lowerBarBottom + g.innerR,
    g.innerR,
    0,
    -Math.PI / 2,
    true
  );
  context.lineTo(g.railStart, g.lowerBarBottom);
  context.closePath();
  context.fill();
}

function drawReferenceWallpaper(context, palette, controls) {
  const g = getRefGeometry(controls);

  fillRect(context, 0, 0, REF.docW, REF.docH, "#000");

  fillRect(context, g.spineX, 0, g.spineW, g.topOrangeH, palette[1]);

  fillRect(context, 0, g.upperBarTop, g.leftSeg1W, g.railH, palette[0]);
  fillRect(context, g.leftSeg1W + g.leftGap, g.upperBarTop, g.leftSeg2W, g.railH, palette[1]);

  fillRect(context, 0, g.lowerBarTop, g.leftSeg1W, g.railH, palette[0]);
  fillRect(context, g.leftSeg1W + g.leftGap, g.lowerBarTop, g.leftSeg2W, g.railH, palette[1]);

  drawUpperRed(context, g, palette[2]);
  drawLowerRed(context, g, palette[2]);

  fillRect(context, g.spineX, g.midOrangeY, g.spineW, g.midOrangeH, palette[1]);
  fillRect(context, g.spineX, g.goldY, g.spineW, g.goldH, palette[3]);
  fillRect(context, g.spineX, g.creamY, g.spineW, g.creamH, palette[4]);
  fillRect(context, g.spineX, g.bottomRedY, g.spineW, REF.docH - g.bottomRedY, palette[2]);
}

function drawWallpaper(targetCanvas) {
  const { w, h } = getSize();
  const palette = palettes[document.getElementById("palette").value] || palettes.classic;
  const controls = getControls();

  targetCanvas.width = w;
  targetCanvas.height = h;

  const context = targetCanvas.getContext("2d");
  context.clearRect(0, 0, w, h);
  context.fillStyle = "#000";
  context.fillRect(0, 0, w, h);

  const scale = Math.min(w / REF.docW, h / REF.docH);
  const offsetX = w - REF.docW * scale;
  const offsetY = 0;

  context.save();
  context.translate(offsetX, offsetY);
  context.scale(scale, scale);
  drawReferenceWallpaper(context, palette, controls);
  context.restore();
}

function redrawPreview() {
  const { w, h } = getSize();
  const maxPreviewW = 520;
  const maxPreviewH = Math.min(window.innerHeight * 0.88, 900);
  const previewScale = Math.min(maxPreviewW / w, maxPreviewH / h);

  canvas.width = Math.max(1, Math.round(w * previewScale));
  canvas.height = Math.max(1, Math.round(h * previewScale));

  const exportCanvas = document.createElement("canvas");
  drawWallpaper(exportCanvas);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(exportCanvas, 0, 0, canvas.width, canvas.height);
}

function updateCustomVisibility() {
  const customSize = document.getElementById("customSize");

  if (!customSize) {
    return;
  }

  customSize.hidden = document.getElementById("preset").value !== "custom";
}

function updateAll() {
  updateCustomVisibility();
  redrawPreview();
}

document.querySelectorAll("select, input").forEach((element) => {
  element.addEventListener("input", updateAll);
  element.addEventListener("change", updateAll);
});

window.addEventListener("resize", redrawPreview);

document.getElementById("download").addEventListener("click", () => {
  const exportCanvas = document.createElement("canvas");
  drawWallpaper(exportCanvas);

  const { w, h } = getSize();
  const palette = document.getElementById("palette").value;

  const link = document.createElement("a");
  link.download = `lcars-niagara-${palette}-${w}x${h}.png`;
  link.href = exportCanvas.toDataURL("image/png");
  link.click();
});

updateAll();
