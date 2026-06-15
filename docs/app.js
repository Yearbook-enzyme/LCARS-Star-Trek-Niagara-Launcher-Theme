const canvas = document.getElementById("preview");
const ctx = canvas.getContext("2d");

const palettes = {
  classic: ["#e8bd88", "#df5a1f", "#d62b18", "#e99f35", "#efc38e"],
  red: ["#ffc0b8", "#e45a4e", "#d62b18", "#aa1d14", "#f08a28"],
  voyager: ["#f1c48e", "#d89b52", "#c96b38", "#8e5bb8", "#b9a0dd"],
  muted: ["#c98769", "#a9482a", "#8f241c", "#d09242", "#d7b083"]
};

function getSize() {
  const [w, h] = document.getElementById("preset").value.split("x").map(Number);
  return { w, h };
}

function drawWallpaper(targetCanvas) {
  const { w, h } = getSize();
  targetCanvas.width = w;
  targetCanvas.height = h;

  const c = targetCanvas.getContext("2d");
  const palette = palettes[document.getElementById("palette").value];

  const spineX = w * (Number(document.getElementById("spineX").value) / 100);
  const barY = h * (Number(document.getElementById("barY").value) / 100);
  const t = Number(document.getElementById("thickness").value);

  // Fixed LCARS design language:
  // gap is not user-configurable, and curvature is derived from the layout.
  const gap = Math.max(8, Math.round(t * 0.45));

  c.fillStyle = "#000";
  c.fillRect(0, 0, w, h);

  function rect(x, y, rw, rh, color) {
    c.fillStyle = color;
    c.fillRect(x, y, rw, rh);
  }

  // ---- main horizontal rail positions ----
  const railTopY = barY - t - gap / 2;
  const railBottomY = barY + gap / 2;

  // ---- left segmented rails with consistent gaps ----
  const leftSeg1W = w * 0.22;
  const leftSeg2W = w * 0.14;
  const railStart = leftSeg1W + gap + leftSeg2W + gap;

  rect(0, railTopY, leftSeg1W, t, palette[0]);
  rect(leftSeg1W + gap, railTopY, leftSeg2W, t, palette[1]);

  rect(0, railBottomY, leftSeg1W, t, palette[0]);
  rect(leftSeg1W + gap, railBottomY, leftSeg2W, t, palette[1]);

  // ---- right column / elbow geometry ----
  const right = w;
  const rightW = w - spineX;

  // fixed top block
  const topOrangeH = Math.round(h * 0.085);

  // the upper red elbow starts after a normal gap below the top orange block
  const topRedY = topOrangeH + gap;
  const topRedBottom = railTopY + t;

  // derive the elbow depth from the actual layout
  const elbowDepth = Math.max(60, topRedBottom - topRedY);
  const innerCurveX = Math.min(rightW * 0.42, elbowDepth * 0.34);
  const outerCurveR = innerCurveX;

  // lower red elbow mirrors the upper one, with the center gap extending fully right
  const lowerRedTop = railBottomY;
  const lowerRedBottom = lowerRedTop + elbowDepth;

  // Remaining blocks below lower elbow, using consistent gaps
  const remaining = Math.max(0, h - lowerRedBottom - gap * 4);

  const midOrangeH = Math.round(remaining * 0.12);
  const goldH = Math.round(remaining * 0.36);
  const creamH = Math.round(remaining * 0.24);

  const midOrangeY = lowerRedBottom + gap;
  const goldY = midOrangeY + midOrangeH + gap;
  const creamY = goldY + goldH + gap;
  const bottomRedY = creamY + creamH + gap;
  const bottomRedH = Math.max(0, h - bottomRedY);

  // ---- top orange block ----
  rect(spineX, 0, rightW, topOrangeH, palette[1]);

  // ---- upper red elbow ----
  c.fillStyle = palette[2];
  c.beginPath();
  c.moveTo(railStart, railTopY);
  c.lineTo(spineX - innerCurveX, railTopY);
  c.quadraticCurveTo(spineX, railTopY, spineX, topRedY);
  c.lineTo(right, topRedY);
  c.lineTo(right, topRedBottom - outerCurveR);
  c.quadraticCurveTo(right, topRedBottom, right - outerCurveR, topRedBottom);
  c.lineTo(railStart, topRedBottom);
  c.closePath();
  c.fill();

  // ---- lower red elbow ----
  c.fillStyle = palette[2];
  c.beginPath();
  c.moveTo(railStart, lowerRedTop);
  c.lineTo(right - outerCurveR, lowerRedTop);
  c.quadraticCurveTo(right, lowerRedTop, right, lowerRedTop + outerCurveR);
  c.lineTo(right, lowerRedBottom);
  c.lineTo(spineX, lowerRedBottom);
  c.quadraticCurveTo(spineX, railBottomY + t, spineX - innerCurveX, railBottomY + t);
  c.lineTo(railStart, railBottomY + t);
  c.closePath();
  c.fill();

  // ---- remaining right-side blocks ----
  rect(spineX, midOrangeY, rightW, midOrangeH, palette[1]);
  rect(spineX, goldY, rightW, goldH, palette[3]);
  rect(spineX, creamY, rightW, creamH, palette[4]);
  rect(spineX, bottomRedY, rightW, bottomRedH, palette[2]);
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
