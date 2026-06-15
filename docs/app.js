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
  const gap = Math.max(8, t * 0.45);

  const curveSlider =
    document.getElementById("curveSize") || document.getElementById("radius");
  const curve = Math.max(t * 2, Number(curveSlider.value) * 2.4);

  const railStart = w * 0.44;
  const railTopY = barY - t - gap / 2;
  const railBottomY = barY + gap / 2;
  const right = w;
  const rightW = w - spineX;
  const outerR = curve;

  c.fillStyle = "#000";
  c.fillRect(0, 0, w, h);

  function rect(x, y, rw, rh, color) {
    c.fillStyle = color;
    c.fillRect(x, y, rw, rh);
  }

  // ---- left segmented rails ----
  rect(0, railTopY, w * 0.24, t, palette[0]);
  rect(w * 0.25, railTopY, w * 0.18, t, palette[1]);

  rect(0, railBottomY, w * 0.24, t, palette[0]);
  rect(w * 0.25, railBottomY, w * 0.18, t, palette[1]);

  // ---- right-side block layout ----
  const blockGap = gap * 1.2;

  const topOrangeH = h * 0.085;
  const midOrangeH = h * 0.08;
  const goldH = h * 0.23;
  const creamH = h * 0.17;
  const bottomRedH = h * 0.27;

  const topOrangeY = 0;
  const topRedY = topOrangeY + topOrangeH + blockGap;

  // top elbow ends at the top center rail
  const topRedBottom = railTopY + t;

  // lower elbow starts at lower center rail and ends before the short orange block
  const lowerRedTop = railBottomY;
  const lowerRedBottom = railBottomY + t + curve;

  const midOrangeY = lowerRedBottom + blockGap;
  const goldY = midOrangeY + midOrangeH + blockGap;
  const creamY = goldY + goldH + blockGap;
  const bottomRedY = creamY + creamH + blockGap;

  // ---- top orange block ----
  rect(spineX, topOrangeY, rightW, topOrangeH, palette[1]);

  // ---- top elbow / upper red section ----
  c.fillStyle = palette[2];
  c.beginPath();
  c.moveTo(railStart, railTopY);                         // inner top rail start
  c.lineTo(spineX - curve, railTopY);                   // toward inner curve
  c.quadraticCurveTo(spineX, railTopY, spineX, topRedY); // inner elbow curve
  c.lineTo(right, topRedY);                             // top edge across
  c.lineTo(right, topRedBottom - outerR);               // down right side
  c.quadraticCurveTo(right, topRedBottom, right - outerR, topRedBottom); // outer rounded corner
  c.lineTo(railStart, topRedBottom);                    // bottom edge back left
  c.closePath();
  c.fill();

  // ---- bottom elbow / lower red section ----
  c.fillStyle = palette[2];
  c.beginPath();
  c.moveTo(railStart, lowerRedTop);                     // top-left at lower rail
  c.lineTo(right - outerR, lowerRedTop);                // across top
  c.quadraticCurveTo(right, lowerRedTop, right, lowerRedTop + outerR); // outer rounded corner
  c.lineTo(right, lowerRedBottom);                      // down right edge
  c.lineTo(spineX, lowerRedBottom);                     // bottom edge to spine
  c.quadraticCurveTo(spineX, railBottomY + t, spineX - curve, railBottomY + t); // inner elbow curve
  c.lineTo(railStart, railBottomY + t);                 // back left
  c.closePath();
  c.fill();

  // ---- remaining straight right-side blocks ----
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
