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

function drawWallpaper(targetCanvas, exportScale = 1) {
  const { w, h } = getSize();
  targetCanvas.width = w * exportScale;
  targetCanvas.height = h * exportScale;

  const c = targetCanvas.getContext("2d");
  c.setTransform(exportScale, 0, 0, exportScale, 0, 0);

  const palette = palettes[document.getElementById("palette").value];

  const spineX = w * (Number(document.getElementById("spineX").value) / 100);
  const barY = h * (Number(document.getElementById("barY").value) / 100);
  const t = Number(document.getElementById("thickness").value);
  const gap = Math.max(8, t * 0.45);
  const r = Number(document.getElementById("radius").value);

  c.fillStyle = "#000";
  c.fillRect(0, 0, w, h);

  const rightW = w - spineX;
  const leftEnd = spineX - t * 1.7;

  function rect(x, y, rw, rh, color) {
    c.fillStyle = color;
    c.fillRect(x, y, rw, rh);
  }

  function roundRect(x, y, rw, rh, radius, color) {
    const rr = Math.min(radius, rw / 2, rh / 2);
    c.fillStyle = color;
    c.beginPath();
    c.moveTo(x + rr, y);
    c.lineTo(x + rw - rr, y);
    c.quadraticCurveTo(x + rw, y, x + rw, y + rr);
    c.lineTo(x + rw, y + rh - rr);
    c.quadraticCurveTo(x + rw, y + rh, x + rw - rr, y + rh);
    c.lineTo(x + rr, y + rh);
    c.quadraticCurveTo(x, y + rh, x, y + rh - rr);
    c.lineTo(x, y + rr);
    c.quadraticCurveTo(x, y, x + rr, y);
    c.fill();
  }

  // left horizontal segmented rails
  rect(0, barY - t - gap / 2, w * 0.24, t, palette[0]);
  rect(w * 0.25, barY - t - gap / 2, w * 0.18, t, palette[1]);
  rect(w * 0.44, barY - t - gap / 2, leftEnd - w * 0.44, t, palette[2]);

  rect(0, barY + gap / 2, w * 0.24, t, palette[0]);
  rect(w * 0.25, barY + gap / 2, w * 0.18, t, palette[1]);
  rect(w * 0.44, barY + gap / 2, leftEnd - w * 0.44, t, palette[2]);

  // LCARS curved junction - cleaner two rail shape
  function lcarsRail(y, flip, color) {
    c.fillStyle = color;
    c.beginPath();

    const curveStart = spineX - t * 1.8;
    const curveEnd = spineX;
    const railH = t * 3.0;
    const yy = y;

    if (!flip) {
      c.moveTo(leftEnd, yy);
      c.lineTo(curveStart, yy);
      c.quadraticCurveTo(curveEnd, yy, curveEnd, yy - railH);
      c.lineTo(w, yy - railH);
      c.lineTo(w, yy);
      c.lineTo(leftEnd, yy);
    } else {
      c.moveTo(leftEnd, yy);
      c.lineTo(w, yy);
      c.lineTo(w, yy + railH);
      c.lineTo(curveEnd, yy + railH);
      c.quadraticCurveTo(curveEnd, yy, curveStart, yy);
      c.lineTo(leftEnd, yy);
    }

    c.closePath();
    c.fill();
  }

  lcarsRail(barY - gap / 2, false, palette[2]);
  lcarsRail(barY + gap / 2 + t, true, palette[2]);

  // right vertical blocks
  const x = spineX;
  const blockGap = gap * 1.2;
  let y = 0;

  const blocks = [
    [h * 0.085, palette[1]],
    [h * 0.23, palette[2]],
    [h * 0.08, palette[1]],
    [h * 0.23, palette[3]],
    [h * 0.17, palette[4]],
    [h * 0.27, palette[2]]
  ];

  for (const [bh, color] of blocks) {
    rect(x, y, rightW, bh, color);
    y += bh + blockGap;
  }
}

function redrawPreview() {
  const { w, h } = getSize();
  const previewHeight = 900;
  const scale = previewHeight / h;

  canvas.width = w * scale;
  canvas.height = h * scale;

  const temp = document.createElement("canvas");
  drawWallpaper(temp, 1);

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(temp, 0, 0, canvas.width, canvas.height);
}

document.querySelectorAll("select, input").forEach(el => {
  el.addEventListener("input", redrawPreview);
});

document.getElementById("download").addEventListener("click", () => {
  const exportCanvas = document.createElement("canvas");
  drawWallpaper(exportCanvas, 1);

  const { w, h } = getSize();
  const palette = document.getElementById("palette").value;

  const link = document.createElement("a");
  link.download = `lcars-niagara-${palette}-${w}x${h}.png`;
  link.href = exportCanvas.toDataURL("image/png");
  link.click();
});

redrawPreview();
