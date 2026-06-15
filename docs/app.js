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
  const curve = Number(document.getElementById("radius").value) * 1.8;

  c.fillStyle = "#000";
  c.fillRect(0, 0, w, h);

  function rect(x, y, rw, rh, color) {
    c.fillStyle = color;
    c.fillRect(x, y, rw, rh);
  }

  function topCurve() {
    c.fillStyle = palette[2];
    c.beginPath();
    c.moveTo(w * 0.44, barY - t - gap / 2);
    c.lineTo(spineX - curve, barY - t - gap / 2);
    c.quadraticCurveTo(spineX, barY - t - gap / 2, spineX, barY - t - gap / 2 - curve);
    c.lineTo(w, barY - t - gap / 2 - curve);
    c.lineTo(w, barY - gap / 2);
    c.lineTo(w * 0.44, barY - gap / 2);
    c.closePath();
    c.fill();
  }

  function bottomCurve() {
    c.fillStyle = palette[2];
    c.beginPath();
    c.moveTo(w * 0.44, barY + gap / 2);
    c.lineTo(w, barY + gap / 2);
    c.lineTo(w, barY + gap / 2 + curve);
    c.lineTo(spineX, barY + gap / 2 + curve);
    c.quadraticCurveTo(spineX, barY + gap / 2 + t, spineX - curve, barY + gap / 2 + t);
    c.lineTo(w * 0.44, barY + gap / 2 + t);
    c.closePath();
    c.fill();
  }

  // Left rails
  rect(0, barY - t - gap / 2, w * 0.24, t, palette[0]);
  rect(w * 0.25, barY - t - gap / 2, w * 0.18, t, palette[1]);

  rect(0, barY + gap / 2, w * 0.24, t, palette[0]);
  rect(w * 0.25, barY + gap / 2, w * 0.18, t, palette[1]);

  topCurve();
  bottomCurve();

  // Right blocks
  const rightW = w - spineX;
  let y = 0;
  const blockGap = gap * 1.2;

  const blocks = [
    [h * 0.085, palette[1]],
    [h * 0.23, palette[2]],
    [h * 0.08, palette[1]],
    [h * 0.23, palette[3]],
    [h * 0.17, palette[4]],
    [h * 0.27, palette[2]]
  ];

  for (const [bh, color] of blocks) {
    rect(spineX, y, rightW, bh, color);
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
