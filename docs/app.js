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
  spectrum: ["#ff2d55", "#ff9500", "#ffd60a", "#32d74b", "#0a84ff", "#bf5af2"],
  highContrast: ["#ffffff", "#ff9f1c", "#ff2e2e", "#ffd23f", "#f7f7f7"]
};

const REF = {
  docW: 690,
  docH: 1536,

  railThickness: 26,
  centerGap: 20.466,

  innerCurveW: 66.673,
  innerCurveH: 77.433,
  outerCurveW: 101.697,
  outerCurveH: 113.301,

  leftSeg1W: 145,
  leftSeg2W: 145,
  leftGap: 7,

  topOrangeH: 126,
  midOrangeH: 84,
  goldH: 255,
  creamH: 235
};

const K = 0.5522847498307936;

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

function rect(c, x, y, w, h, color) {
  if (w <= 0 || h <= 0) return;
  c.fillStyle = color;
  c.fillRect(x, y, w, h);
}

function qLB_RT(c, x0, yTop, x1, yBottom) {
  const dx = x1 - x0;
  const dy = yBottom - yTop;
  c.bezierCurveTo(x0 + K * dx, yBottom, x1, yTop + K * dy, x1, yTop);
}

function qRT_LB(c, x0, yTop, x1, yBottom) {
  const dx = x1 - x0;
  const dy = yBottom - yTop;
  c.bezierCurveTo(x1, yTop + K * dy, x0 + K * dx, yBottom, x0, yBottom);
}

function qLT_RB(c, x0, yTop, x1, yBottom) {
  const dx = x1 - x0;
  const dy = yBottom - yTop;
  c.bezierCurveTo(x0 + K * dx, yTop, x1, yBottom - K * dy, x1, yBottom);
}

function qRB_LT(c, x0, yTop, x1, yBottom) {
  const dx = x1 - x0;
  const dy = yBottom - yTop;
  c.bezierCurveTo(x1, yBottom - K * dy, x0 + K * dx, yTop, x0, yTop);
}

function drawWallpaper(targetCanvas) {
  const { w, h } = getSize();
  targetCanvas.width = w;
  targetCanvas.height = h;

  const c = targetCanvas.getContext("2d");
  const palette = palettes[document.getElementById("palette").value] || palettes.classic;

  const sx = w / REF.docW;
  const sy = h / REF.docH;

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  const rhythmName = document.getElementById("panelRhythm")?.value || "standard";
  const rhythms = {
    standard: {
      top: 1.00,
      mid: 1.00,
      gold: 1.00,
      cream: 1.00,
      bottomMin: 1.00,
      colors: [1, 2, 1, 3, 4, 2]
    },
    stepped: {
      top: 0.78,
      mid: 0.62,
      gold: 1.22,
      cream: 0.82,
      bottomMin: 1.20,
      colors: [3, 2, 1, 4, 0, 2]
    },
    tallLower: {
      top: 0.90,
      mid: 1.30,
      gold: 0.76,
      cream: 1.18,
      bottomMin: 0.95,
      colors: [1, 2, 3, 1, 4, 2]
    },
    staccato: {
      top: 0.58,
      mid: 0.52,
      gold: 0.72,
      cream: 0.56,
      bottomMin: 1.65,
      colors: [4, 2, 1, 3, 0, 2]
    },
    balanced: {
      top: 0.86,
      mid: 0.92,
      gold: 0.92,
      cream: 0.92,
      bottomMin: 1.12,
      colors: [0, 2, 1, 3, 4, 2]
    },
    spectrumFlow: {
      top: 0.92,
      mid: 0.96,
      gold: 1.02,
      cream: 0.96,
      bottomMin: 1.08,
      colors: [0, 1, 2, 3, 4, 5]
    }
  };

  const rhythm = rhythms[rhythmName] || rhythms.standard;
  const colorForPanel = (slot, fallback) => palette[rhythm.colors[slot] ?? fallback] || palette[fallback];

  const rawSpineX = w * (value("spineX", 67) / 100);
  const thicknessScaleRaw = value("thickness", REF.railThickness) / REF.railThickness;
  const segmentScale = value("segmentScale", 100) / 100;

  const tRaw = REF.railThickness * sy * thicknessScaleRaw;
  const t = clamp(
    tRaw,
    Math.max(3, h * 0.004),
    Math.max(6, Math.min(h * 0.055, w * 0.09))
  );

  const safeThicknessScale = t / (REF.railThickness * sy || 1);

  const gap = clamp(
    REF.centerGap * sy * safeThicknessScale,
    Math.max(3, h * 0.0035),
    Math.max(4, h * 0.032)
  );

  const innerW = REF.innerCurveW * sx * safeThicknessScale;
  const innerH = REF.innerCurveH * sy * safeThicknessScale;
  const outerW = REF.outerCurveW * sx * safeThicknessScale;
  const outerH = REF.outerCurveH * sy * safeThicknessScale;

  const spineX = clamp(
    rawSpineX,
    Math.max(w * 0.22, innerW + w * 0.10),
    Math.max(w * 0.30, w - Math.max(w * 0.08, outerW * 1.2))
  );

  let leftGap = REF.leftGap * sx * safeThicknessScale;
  let leftSeg1W = REF.leftSeg1W * sx * segmentScale;
  let leftSeg2W = REF.leftSeg2W * sx * segmentScale;

  // Guardrail: keep horizontal rails out of the inner elbow curve.
  const maxRailStart = Math.max(0, spineX - innerW - leftGap);
  const desiredRailStart = leftSeg1W + leftGap + leftSeg2W + leftGap;

  if (desiredRailStart > maxRailStart) {
    const segmentTotal = Math.max(1, leftSeg1W + leftSeg2W);
    const scaledTotal = Math.max(0, maxRailStart - leftGap * 2);
    const segScale = scaledTotal / segmentTotal;
    leftSeg1W *= segScale;
    leftSeg2W *= segScale;
  }

  const railStart = Math.max(
    0,
    Math.min(maxRailStart, leftSeg1W + leftGap + leftSeg2W + leftGap)
  );

  const right = w;
  const rightW = right - spineX;

  const topOrangeY = 0;
  const topOrangeH = clamp(REF.topOrangeH * sy * rhythm.top, h * 0.028, h * 0.18);
  const topRedY = topOrangeY + topOrangeH + gap;

  const desiredRailTopY = h * (value("barY", 19) / 100) - t - gap / 2;

  // Guardrail: prevent the top block and upper elbow from colliding.
  const minRailTopY = topRedY + Math.max(innerH, outerH - t) + gap * 0.4;
  const maxRailTopY = Math.max(
    minRailTopY,
    h - (t * 2 + gap * 3 + innerH + h * 0.10)
  );

  const railTopY = clamp(desiredRailTopY, minRailTopY, maxRailTopY);
  const railBottomY = railTopY + t + gap;
  const topRedBottom = railTopY + t;

  const lowerRedTop = railBottomY;
  const lowerRedBottom = railBottomY + t + innerH;

  let midOrangeH = REF.midOrangeH * sy * rhythm.mid;
  let goldH = REF.goldH * sy * rhythm.gold;
  let creamH = REF.creamH * sy * rhythm.cream;

  const lowerStart = lowerRedBottom + gap;
  const lowerAvailable = Math.max(0, h - lowerStart);
  const desiredLowerGaps = gap * 3;
  const minBottomRedH = Math.max(t, h * 0.035 * rhythm.bottomMin);
  const lowerFixedTotal = midOrangeH + goldH + creamH + desiredLowerGaps + minBottomRedH;

  // Guardrail: compress lower decorative blocks on extreme aspect ratios/settings.
  if (lowerFixedTotal > lowerAvailable) {
    const scalable = Math.max(1, midOrangeH + goldH + creamH);
    const availableForScalable = Math.max(0, lowerAvailable - desiredLowerGaps - minBottomRedH);
    const stackScale = clamp(availableForScalable / scalable, 0.12, 1);
    midOrangeH *= stackScale;
    goldH *= stackScale;
    creamH *= stackScale;
  }

  const midOrangeY = lowerStart;
  const goldY = midOrangeY + midOrangeH + gap;
  const creamY = goldY + goldH + gap;
  const bottomRedY = creamY + creamH + gap;
  const bottomRedH = Math.max(0, h - bottomRedY);

  c.fillStyle = "#000";
  c.fillRect(0, 0, w, h);

  // Left segmented rails.
  rect(c, 0, railTopY, leftSeg1W, t, colorForPanel(0, 0));
  rect(c, leftSeg1W + leftGap, railTopY, leftSeg2W, t, colorForPanel(2, 1));
  rect(c, 0, railBottomY, leftSeg1W, t, colorForPanel(0, 0));
  rect(c, leftSeg1W + leftGap, railBottomY, leftSeg2W, t, colorForPanel(2, 1));

  // Top block stays anchored to the top.
  rect(c, spineX, topOrangeY, rightW, topOrangeH, colorForPanel(0, 1));

  // Upper elbow stretches from top block down to the rail.
  c.fillStyle = colorForPanel(1, 2);
  c.beginPath();
  c.moveTo(railStart, railTopY);
  c.lineTo(spineX - innerW, railTopY);
  qLB_RT(c, spineX - innerW, railTopY - innerH, spineX, railTopY);
  c.lineTo(spineX, topRedY);
  c.lineTo(right, topRedY);
  c.lineTo(right, topRedBottom - outerH);
  qRT_LB(c, right - outerW, topRedBottom - outerH, right, topRedBottom);
  c.lineTo(railStart, topRedBottom);
  c.closePath();
  c.fill();

  // Lower elbow.
  c.fillStyle = colorForPanel(1, 2);
  c.beginPath();
  c.moveTo(railStart, lowerRedTop);
  c.lineTo(right - outerW, lowerRedTop);
  qLT_RB(c, right - outerW, lowerRedTop, right, lowerRedTop + outerH);
  c.lineTo(right, lowerRedBottom);
  c.lineTo(spineX, lowerRedBottom);
  qRB_LT(c, spineX - innerW, railBottomY + t, spineX, lowerRedBottom);
  c.lineTo(railStart, railBottomY + t);
  c.closePath();
  c.fill();

  // Lower blocks fill downward from the moving lower elbow.
  rect(c, spineX, midOrangeY, rightW, midOrangeH, colorForPanel(2, 1));
  rect(c, spineX, goldY, rightW, goldH, colorForPanel(3, 3));
  rect(c, spineX, creamY, rightW, creamH, colorForPanel(4, 4));
  rect(c, spineX, bottomRedY, rightW, bottomRedH, colorForPanel(5, 2));
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
