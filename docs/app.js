const canvas = document.getElementById("preview");
const ctx = canvas.getContext("2d");

const palettes = {
  classic: ["#e8bd88", "#df5a1f", "#d62b18", "#e09a3f", "#dfb98a"],
  red: ["#ffc0b8", "#e45a4e", "#d62b18", "#aa1d14", "#f08a28"],
  voyager: ["#f1c48e", "#d89b52", "#c96b38", "#8e5bb8", "#b9a0dd"],
  muted: ["#c98769", "#a9482a", "#8f241c", "#d09242", "#d7b083"]
};

// Locked reference geometry from the source wallpaper
const REF = {
  docW: 690,
  docH: 1536,

  // Your measured geometry
  innerCurveW: 66.673,
  innerCurveH: 77.433,
  outerCurveW: 101.697,
  outerCurveH: 113.301,
  centerGap: 20.466,

  // Locked structural values (approx from the reference wallpaper)
  railThickness: 26.0,
  leftSeg1W: 145.0,
  leftSeg2W: 145.0,
  leftGap: 7.0,

  // Right-side block layout
  topOrangeH: 126.0,
  midOrangeH: 84.0,
  goldH: 255.0,
  creamH: 235.0
};

const K = 0.5522847498307936; // Bezier quarter-ellipse constant

function getSize() {
  const [w, h] = document.getElementById("preset").value.split("x").map(Number);
  return { w, h };
}

function rect(c, x, y, w, h, color) {
  c.fillStyle = color;
  c.fillRect(x, y, w, h);
}

// Quarter ellipse helpers
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

  // Only these stay user-adjustable
  const spineX = w * (Number(document.getElementById("spineX").value) / 100);
  const barY = h * (Number(document.getElementById("barY").value) / 100);

  // Locked reference-scaled geometry
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

  // Horizontal rail positions
  const railTopY = barY - centerGap / 2 - railH;
  const railBottomY = barY + centerGap / 2;

  // Left segmented rails
  const railStart = leftSeg1W + leftGap + leftSeg2W + leftGap;

  rect(c, 0, railTopY, leftSeg1W, railH, palette[0]);
  rect(c, leftSeg1W + leftGap, railTopY, leftSeg2W, railH, palette[1]);

  rect(c, 0, railBottomY, leftSeg1W, railH, palette[0]);
  rect(c, leftSeg1W + leftGap, railBottomY, leftSeg2W, railH, palette[1]);

  // Upper red elbow geometry
  const topRedY = railTopY - innerH;
  const topRedBottom = railTopY + railH;

  // Lower red elbow geometry
  const lowerRedTop = railBottomY;
  const lowerRedBottom = railBottomY + railH + innerH;

  const rightW = w - spineX;

  // Right-side remaining blocks, using the same vertical gap as the center gap
  const blockGap = centerGap;

  const midOrangeY = lowerRedBottom + blockGap;
  const goldY = midOrangeY + midOrangeH + blockGap;
  const creamY = goldY + goldH + blockGap;
  const bottomRedY = creamY + creamH + blockGap;
  const bottomRedH = Math.max(0, h - bottomRedY);

  // Top orange block
  rect(c, spineX, 0, rightW, topOrangeH, palette[1]);

  // Upper red elbow
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

  // Lower red elbow
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

  // Remaining right-side blocks
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

document.querySelectorAll("select, input").forEach(el => {
  el.addEventListener("input", redrawPreview);
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

redrawPreview();
