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
  topRedH: 194,
  lowerRedH: 186,
  midOrangeH: 84,
  goldH: 255,
  creamH: 235,
  elbowRadius: 77.433,
  topCornerRadius: 113.301
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
  const el = document.getElementById(id);
  return el ? Number(el.value) : fallback;
}

function fillRect(c, x, y, w, h, color) {
  if (w <= 0 || h <= 0) return;
  c.fillStyle = color;
  c.fillRect(x, y, w, h);
}

function moveTo(c, x, y) {
  c.moveTo(Math.round(x) + 0.5, Math.round(y) + 0.5);
}

function lineTo(c, x, y) {
  c.lineTo(Math.round(x) + 0.5, Math.round(y) + 0.5);
}

function clamp(valueToClamp, min, max) {
  return Math.max(min, Math.min(max, valueToClamp));
}

function quarterArc(c, cx, cy, r, start, end, anticlockwise = false) {
  if (r <= 0) {
    c.lineTo(cx, cy);
    return;
  }
  c.arc(cx, cy, r, start, end, anticlockwise);
}

function getControls() {
  return {
    spinePct: value("spineX", 67) / 100,
    barPct: value("barY", 19) / 100,
    thicknessPx: value("thickness", 26),
    segmentPct: value("segmentScale", 100) / 100
  };
}

function getGeometry(w, h, controls) {
  const sx = w / REF.docW;
  const sy = h / REF.docH;
  const baseScale = Math.min(sx, sy);
  const motifScale = controls.thicknessPx / REF.railThickness;

  const railH = Math.max(8, controls.thicknessPx * baseScale);
  const gap = Math.max(6, REF.centerGap * baseScale * motifScale);
  const divider = Math.max(3, Math.round(railH * 0.18));

  const leftGap = Math.max(2, REF.leftGap * baseScale * motifScale);
  const leftSeg1W = REF.leftSeg1W * sx * controls.segmentPct;
  const leftSeg2W = REF.leftSeg2W * sx * controls.segmentPct;
  const railStart = leftSeg1W + leftGap + leftSeg2W + leftGap;

  const minSpineX = railStart + 40 * baseScale;
  const maxSpineX = w - 80 * baseScale;
  const spineX = clamp(w * controls.spinePct, minSpineX, maxSpineX);
  const spineW = Math.max(40 * baseScale, w - spineX);

  const elbowRadius = clamp(
    REF.elbowRadius * baseScale * motifScale,
    railH * 0.85,
    Math.max(railH * 1.2, spineW * 0.8)
  );

  const topCornerRadius = clamp(
    REF.topCornerRadius * baseScale * motifScale,
    railH * 1.25,
    Math.max(railH * 1.8, spineW * 1.6)
  );

  const topOrangeH = Math.max(30 * baseScale, REF.topOrangeH * sy * motifScale);
  const topRedTop = topOrangeH + divider;
  const topRedBottomRef = topRedTop + REF.topRedH * sy * motifScale;

  const barCenterY = h * controls.barPct;
  const upperBarTop = barCenterY - gap / 2 - railH;
  const upperBarBottom = upperBarTop + railH;
  const lowerBarTop = upperBarBottom + gap;
  const lowerBarBottom = lowerBarTop + railH;

  const minBarTop = topRedTop + topCornerRadius + railH * 0.5;
  const maxBarTop = h - railH * 6;
  const adjustedUpperBarTop = clamp(upperBarTop, minBarTop, maxBarTop);
  const adjustedUpperBarBottom = adjustedUpperBarTop + railH;
  const adjustedLowerBarTop = adjustedUpperBarBottom + gap;
  const adjustedLowerBarBottom = adjustedLowerBarTop + railH;

  const upperJoinRadius = clamp(
    elbowRadius,
    railH * 0.8,
    Math.max(railH, adjustedUpperBarTop - topRedTop - railH * 0.25)
  );

  const topRedBottom = Math.max(topRedBottomRef, adjustedUpperBarBottom);
  const lowerRedTop = adjustedLowerBarTop;
  const lowerRedBottom = lowerRedTop + Math.max(railH + divider, REF.lowerRedH * sy * motifScale);

  const blockGap = divider;
  const midOrangeY = lowerRedBottom + blockGap;
  const midOrangeH = Math.max(18 * baseScale, REF.midOrangeH * sy * motifScale);
  const goldY = midOrangeY + midOrangeH + blockGap;
  const goldH = Math.max(40 * baseScale, REF.goldH * sy * motifScale);
  const creamY = goldY + goldH + blockGap;
  const creamH = Math.max(40 * baseScale, REF.creamH * sy * motifScale);
  const bottomRedY = creamY + creamH + blockGap;

  return {
    w,
    h,
    railH,
    gap,
    divider,
    leftGap,
    leftSeg1W,
    leftSeg2W,
    railStart,
    spineX,
    spineW,
    topOrangeH,
    topRedTop,
    topRedBottom,
    upperBarTop: adjustedUpperBarTop,
    upperBarBottom: adjustedUpperBarBottom,
    lowerBarTop: adjustedLowerBarTop,
    lowerBarBottom: adjustedLowerBarBottom,
    upperJoinRadius,
    topCornerRadius,
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

function drawUpperRed(c, g, color) {
  const rTop = clamp(g.topCornerRadius, 0, Math.max(0, g.topRedBottom - g.topRedTop - 1));
  const rJoin = clamp(
    g.upperJoinRadius,
    0,
    Math.max(0, Math.min(g.spineX - g.railStart - 1, g.upperBarTop - g.topRedTop - 1))
  );

  c.fillStyle = color;
  c.beginPath();
  moveTo(c, g.railStart, g.upperBarTop);
  lineTo(c, g.spineX - rJoin, g.upperBarTop);
  quarterArc(c, g.spineX - rJoin, g.upperBarTop - rJoin, rJoin, Math.PI / 2, 0, true);
  lineTo(c, g.spineX, g.topRedTop + rTop);
  quarterArc(c, g.spineX + rTop, g.topRedTop + rTop, rTop, Math.PI, Math.PI * 1.5);
  lineTo(c, g.w, g.topRedTop);
  lineTo(c, g.w, g.topRedBottom);
  lineTo(c, g.railStart, g.topRedBottom);
  c.closePath();
  c.fill();
}

function drawLowerRed(c, g, color) {
  const rJoin = clamp(
    g.upperJoinRadius,
    0,
    Math.max(0, Math.min(g.spineX - g.railStart - 1, g.lowerRedBottom - g.lowerBarTop - 1))
  );

  c.fillStyle = color;
  c.beginPath();
  moveTo(c, g.railStart, g.lowerBarTop);
  lineTo(c, g.w, g.lowerBarTop);
  lineTo(c, g.w, g.lowerRedBottom);
  lineTo(c, g.spineX, g.lowerRedBottom);
  lineTo(c, g.spineX, g.lowerBarTop + rJoin);
  quarterArc(c, g.spineX - rJoin, g.lowerBarTop + rJoin, rJoin, 0, Math.PI * 1.5, true);
  lineTo(c, g.railStart, g.lowerBarTop);
  c.closePath();
  c.fill();
}

function drawWallpaper(targetCanvas) {
  const { w, h } = getSize();
  targetCanvas.width = w;
  targetCanvas.height = h;

  const c = targetCanvas.getContext("2d");
  const palette = palettes[document.getElementById("palette").value] || palettes.classic;
  const controls = getControls();
  const g = getGeometry(w, h, controls);

  c.clearRect(0, 0, w, h);
  c.fillStyle = "#000";
  c.fillRect(0, 0, w, h);

  fillRect(c, g.spineX, 0, g.spineW, g.topOrangeH, palette[1]);

  fillRect(c, 0, g.upperBarTop, g.leftSeg1W, g.railH, palette[0]);
  fillRect(c, g.leftSeg1W + g.leftGap, g.upperBarTop, g.leftSeg2W, g.railH, palette[1]);
  fillRect(c, 0, g.lowerBarTop, g.leftSeg1W, g.railH, palette[0]);
  fillRect(c, g.leftSeg1W + g.leftGap, g.lowerBarTop, g.leftSeg2W, g.railH, palette[1]);

  drawUpperRed(c, g, palette[2]);
  drawLowerRed(c, g, palette[2]);

  fillRect(c, g.spineX, g.midOrangeY, g.spineW, g.midOrangeH, palette[1]);
  fillRect(c, g.spineX, g.goldY, g.spineW, g.goldH, palette[3]);
  fillRect(c, g.spineX, g.creamY, g.spineW, g.creamH, palette[4]);
  fillRect(c, g.spineX, g.bottomRedY, g.spineW, h - g.bottomRedY, palette[2]);
}

function redrawPreview() {
  const { w, h } = getSize();

  const maxPreviewW = 520;
  const maxPreviewH = Math.min(window.innerHeight * 0.88, 900);
  const scale = Math.min(maxPreviewW / w, maxPreviewH / h);

  canvas.width = Math.max(1, Math.round(w * scale));
  canvas.height = Math.max(1, Math.round(h * scale));

  const temp = document.createElement("canvas");
  drawWallpaper(temp);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(temp, 0, 0, canvas.width, canvas.height);
}

function updateCustomVisibility() {
  const customSize = document.getElementById("customSize");
  if (!customSize) return;
  customSize.hidden = document.getElementById("preset").value !== "custom";
}

function updateAll() {
  updateCustomVisibility();
  redrawPreview();
}

document.querySelectorAll("select, input").forEach((el) => {
  el.addEventListener("input", updateAll);
  el.addEventListener("change", updateAll);
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