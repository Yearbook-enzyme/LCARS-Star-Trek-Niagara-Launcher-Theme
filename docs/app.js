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

// Locked reference geometry from the source wallpaper
const REF = {
  docW: 690,
  docH: 1536,

  innerCurveW: 66.673,
  innerCurveH: 77.433,
  outerCurveW: 101.697,
  outerCurveH: 113.301,
  centerGap: 20.466,

  railThickness: 26.0,
  leftSeg1W: 145.0,
  leftSeg2W: 145.0,
  leftGap: 7.0,

  topOrangeH: 126.0,
  midOrangeH: 84.0,
  goldH: 255.0,
  creamH: 235.0
};

const K = 0.5522847498307936;

function getSize() {
  const preset = document.getElementById("preset").value;

  if (preset === "custom") {
    const w = Math.max(200, Number(document.getElementById("customW").value) || 1080);
    const h = Math.max(200, Number(document.getElementById("customH").value) || 2400);
    return { w, h };
  }

  const [w, h] = preset.split("x").map(Number);
  return { w, h };
}

function rect(c, x, y, w, h, color) {
  c.fillStyle = color;
  c.fillRect(x, y, w, h);
}

// Quarter-ellipse helpers
function qLB_RT(c, x0, yTop, x1, yBottom) {
  const dx = x1 - x0;
  const dy = yBottom - yTop;
  c.bezierCurveTo(
    x0 + K * dx, yBottom,
    x1, yTop + K * dy,
    x1, yTop
  );
}

function qRT_LB(c, x0, yTop, x1, yBottom) {
  const dx = x1 - x0;
  const dy = yBottom - yTop;
  c.bezierCurveTo(
    x1, yTop + K * dy,
    x0 + K * dx, yBottom,
    x0, yBottom
  );
}

function qLT_RB(c, x0, yTop, x1, yBottom) {
  const dx = x1 - x0;
  const dy = yBottom - yTop;
  c.bezierCurveTo(
    x0 + K * dx, yTop,
    x1, yBottom - K * dy,
    x1, yBottom
  );
}

function qRB_LT(c, x0, yTop, x1, yBottom) {
  const dx = x1 - x0;
  const dy = yBottom - yTop;
  c.bezierCurveTo(
    x1, yBottom - K * dy,
    x0 + K * dx, yTop,
    x0, yTop
  );
}

function drawWallpaper(targetCanvas) {
  const { w, h } = getSize();
  targetCanvas.width = w;
  targetCanvas.height = h;

  const c = targetCanvas.getContext("2d");
  const palette = palettes[document.getElementById("palette").value];

  const sx = w / REF.docW;
  const sy = h / REF.docH;

  const spineX = w * (Number(document.getElementById("spineX").value) / 100);
  const barY = h * (Number(document.getElementById("barY").value) / 100);

  const innerW = REF.innerCurveW * sx;
  const innerH = REF.innerCurveH * sy;
  const outerW = REF.outerCurveW * sx;
  const outerH = REF.outerCurveH * sy;
  const centerGap = REF.centerGap * sy;

  const railH = REF.railThickness * sy;
  const leftSeg1W = REF.leftSeg1W * sx;
  const leftSeg2W = REF.leftSeg2W * sx;
  const leftGap = REF.leftGap * sx;

  const topOrangeH = REF.topOrangeH * sy;
  const midOrangeH = REF.midOrangeH * sy;
  const goldH = REF.goldH * sy;
  const creamH = REF.creamH * sy;

  c.fillStyle = "#000";
  c.fillRect(0, 0, w, h);

  const railTopY = barY - centerGap / 2 - railH;
  const railBottomY = barY + centerGap / 2;

  const railStart = leftSeg1W + leftGap + leftSeg2W + leftGap;

  rect(c, 0, railTopY, leftSeg1W, railH, palette[0]);
  rect(c, leftSeg1W + leftGap, railTopY, leftSeg2W, railH, palette[1]);

  rect(c, 0, railBottomY, leftSeg1W, railH, palette[0]);
  rect(c, leftSeg1W + leftGap, railBottomY, leftSeg2W, railH, palette[1]);

  const topRedY = railTopY - innerH;
  const topRedBottom = railTopY + railH;

  const lowerRedTop = railBottomY;
  const lowerRedBottom = railBottomY + railH + innerH;

  const rightW = w - spineX;
  const blockGap = centerGap;

  const midOrangeY = lowerRedBottom + blockGap;
  const goldY = midOrangeY + midOrangeH + blockGap;
  const creamY = goldY + goldH + blockGap;
  const bottomRedY = creamY + creamH + blockGap;
  const bottomRedH = Math.max(0, h - bottomRedY);

  rect(c, spineX, 0, rightW, topOrangeH, palette[1]);

  c.fillStyle = palette[2];
  c.beginPath();
  c.moveTo(railStart, railTopY);
  c.lineTo(spineX - innerW, railTopY);
  qLB_RT(c, spineX - innerW, topRedY, spineX, railTopY);
  c.lineTo(w, topRedY);
  c.lineTo(w, topRedBottom - outerH);
  qRT_LB(c, w - outerW, topRedBottom - outerH, w, topRedBottom);
  c.lineTo(railStart, topRedBottom);
  c.closePath();
  c.fill();

  c.fillStyle = palette[2];
  c.beginPath();
  c.moveTo(railStart, lowerRedTop);
  c.lineTo(w - outerW, lowerRedTop);
  qLT_RB(c, w - outerW, lowerRedTop, w, lowerRedTop + outerH);
  c.lineTo(w, lowerRedBottom);
  c.lineTo(spineX, lowerRedBottom);
  qRB_LT(c, spineX - innerW, railBottomY + railH, spineX, lowerRedBottom);
  c.lineTo(railStart, railBottomY + railH);
  c.closePath();
  c.fill();

  rect(c, spineX, midOrangeY, rightW, midOrangeH, palette[1]);
  rect(c, spineX, goldY, rightW, goldH, palette[3]);
  rect(c, spineX, creamY, rightW, creamH, palette[4]);
  rect(c, spineX, bottomRedY, rightW, bottomRedH, palette[2]);
}

function redrawPreview() {
  const { w, h } = getSize();
  const previewHeight = 900;
  const scale = previewHeight / h;

  canvas.width = w * scale;
  canvas.height = h * scale;

  const temp = document.createElement("canvas");
  drawWallpaper(temp);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(temp, 0, 0, canvas.width, canvas.height);
}

function updateCustomVisibility() {
  const isCustom = document.getElementById("preset").value === "custom";
  document.getElementById("customSize").hidden = !isCustom;
}

document.querySelectorAll("select, input").forEach(el => {
  el.addEventListener("input", () => {
    updateCustomVisibility();
    redrawPreview();
  });
});

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

updateCustomVisibility();
redrawPreview();
