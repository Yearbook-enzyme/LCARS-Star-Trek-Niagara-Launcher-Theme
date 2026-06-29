// Extends the existing wallpaper generator with shared categorized palettes and custom colors.
(function () {
  function getPalette() {
    const id = document.getElementById("palette")?.value || "classic";
    if (window.lcarsPaletteColors) return window.lcarsPaletteColors(id);
    return palettes[id] || palettes.classic;
  }

  drawWallpaper = function drawWallpaper(targetCanvas) {
    const { w, h } = getSize();
    targetCanvas.width = w;
    targetCanvas.height = h;

    const c = targetCanvas.getContext("2d");
    const paletteId = document.getElementById("palette")?.value || "classic";
    const palette = getPalette();
    const paletteLength = Math.max(1, palette.length);

    const sx = w / REF.docW;
    const sy = h / REF.docH;

    const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

    const rhythmName = document.getElementById("panelRhythm")?.value || "standard";
    const rhythms = {
      standard: { top: 1.00, mid: 1.00, gold: 1.00, cream: 1.00, bottomMin: 1.00, colors: [1, 2, 1, 3, 4, 2] },
      stepped: { top: 0.78, mid: 0.62, gold: 1.22, cream: 0.82, bottomMin: 1.20, colors: [3, 2, 1, 4, 0, 2] },
      tallLower: { top: 0.90, mid: 1.30, gold: 0.76, cream: 1.18, bottomMin: 0.95, colors: [1, 2, 3, 1, 4, 2] },
      staccato: { top: 0.58, mid: 0.52, gold: 0.72, cream: 0.56, bottomMin: 1.65, colors: [4, 2, 1, 3, 0, 2] },
      balanced: { top: 0.86, mid: 0.92, gold: 0.92, cream: 0.92, bottomMin: 1.12, colors: [0, 2, 1, 3, 4, 2] },
      spectrumFlow: { top: 0.92, mid: 0.96, gold: 1.02, cream: 0.96, bottomMin: 1.08, colors: [0, 1, 2, 3, 4, 5] }
    };

    const rhythm = rhythms[rhythmName] || rhythms.standard;
    const colorMappingName = document.getElementById("colorMapping")?.value || "role";
    const panelSlotCount = 6;

    const pick = (index, fallback = 0) => {
      const chosen = Number.isFinite(index) ? index : fallback;
      return palette[((chosen % paletteLength) + paletteLength) % paletteLength] ||
        palette[((fallback % paletteLength) + paletteLength) % paletteLength] ||
        "#d62b18";
    };

    const roleIndexForPanel = (slot, fallback) => rhythm.colors[slot] ?? fallback ?? 0;

    const sweepIndexForPanel = (slot) => slot;

    const reverseSweepIndexForPanel = (slot) => panelSlotCount - 1 - slot;

    // Samples across the entire palette from first stripe to last stripe.
    // This keeps ROYGBIV, pride, and regional flag palettes from getting trapped
    // in the old LCARS role-color repeat pattern.
    const flagIndexForPanel = (slot) => {
      if (paletteLength <= 1) return 0;
      return Math.round((slot / (panelSlotCount - 1)) * (paletteLength - 1));
    };

    // Useful for palettes whose identity is symmetrical or should feel balanced
    // across the upper/lower LCARS stack.
    const mirrorIndexForPanel = (slot) => {
      const folded = slot <= 2 ? slot : panelSlotCount - 1 - slot;
      return folded;
    };

    const mappedIndexForPanel = (slot, fallback) => {
      switch (colorMappingName) {
        case "sweep":
          return sweepIndexForPanel(slot);
        case "reverseSweep":
          return reverseSweepIndexForPanel(slot);
        case "flagStripes":
          return flagIndexForPanel(slot);
        case "mirrorStripes":
          return mirrorIndexForPanel(slot);
        case "role":
        default:
          return roleIndexForPanel(slot, fallback);
      }
    };

    const colorForPanel = (slot, fallback) => pick(mappedIndexForPanel(slot, fallback), fallback);

    // Custom Palette gets a direct one-control-per-section mode.
    // Built-in palettes still use the selected Color mapping.
    const sectionColorForCustomPalette = (sectionIndex, slot, fallback) => {
      if (paletteId === "custom" && paletteLength >= 11) return pick(sectionIndex, fallback);
      return colorForPanel(slot, fallback);
    };

    const rawSpineX = w * (value("spineX", 67) / 100);
    const thicknessScaleRaw = value("thickness", REF.railThickness) / REF.railThickness;
    const segmentScale = value("segmentScale", 100) / 100;

    const tRaw = REF.railThickness * sy * thicknessScaleRaw;
    const t = clamp(tRaw, Math.max(3, h * 0.004), Math.max(6, Math.min(h * 0.055, w * 0.09)));
    const safeThicknessScale = t / (REF.railThickness * sy || 1);

    const gap = clamp(REF.centerGap * sy * safeThicknessScale, Math.max(3, h * 0.0035), Math.max(4, h * 0.032));
    const innerW = REF.innerCurveW * sx * safeThicknessScale;
    const innerH = REF.innerCurveH * sy * safeThicknessScale;
    const outerW = REF.outerCurveW * sx * safeThicknessScale;
    const outerH = REF.outerCurveH * sy * safeThicknessScale;

    const edgeInset = clamp(w * (value("edgeInset", 4) / 100), 0, w * 0.18);
    const visibleRight = w - edgeInset;

    const spineX = clamp(
      rawSpineX,
      Math.max(w * 0.22, innerW + w * 0.10),
      Math.max(w * 0.30, visibleRight - Math.max(w * 0.08, outerW * 1.2))
    );

    let leftGap = REF.leftGap * sx * safeThicknessScale;
    let leftSeg1W = REF.leftSeg1W * sx * segmentScale;
    let leftSeg2W = REF.leftSeg2W * sx * segmentScale;

    const maxRailStart = Math.max(0, spineX - innerW - leftGap);
    const desiredRailStart = leftSeg1W + leftGap + leftSeg2W + leftGap;

    if (desiredRailStart > maxRailStart) {
      const segmentTotal = Math.max(1, leftSeg1W + leftSeg2W);
      const scaledTotal = Math.max(0, maxRailStart - leftGap * 2);
      const segScale = scaledTotal / segmentTotal;
      leftSeg1W *= segScale;
      leftSeg2W *= segScale;
    }

    const railStart = Math.max(0, Math.min(maxRailStart, leftSeg1W + leftGap + leftSeg2W + leftGap));
    const right = visibleRight;
    const rightW = Math.max(0, right - spineX);

    const topOrangeY = 0;
    const topOrangeH = clamp(REF.topOrangeH * sy * rhythm.top, h * 0.028, h * 0.18);
    const topRedY = topOrangeY + topOrangeH + gap;
    const desiredRailTopY = h * (value("barY", 19) / 100) - t - gap / 2;

    const minRailTopY = topRedY + Math.max(innerH, outerH - t) + gap * 0.4;
    const maxRailTopY = Math.max(minRailTopY, h - (t * 2 + gap * 3 + innerH + h * 0.10));
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

    rect(c, 0, railTopY, leftSeg1W, t, sectionColorForCustomPalette(0, 0, 0));
    rect(c, leftSeg1W + leftGap, railTopY, leftSeg2W, t, sectionColorForCustomPalette(1, 2, 1));
    rect(c, 0, railBottomY, leftSeg1W, t, sectionColorForCustomPalette(2, 0, 0));
    rect(c, leftSeg1W + leftGap, railBottomY, leftSeg2W, t, sectionColorForCustomPalette(3, 2, 1));

    rect(c, spineX, topOrangeY, rightW, topOrangeH, sectionColorForCustomPalette(4, 0, 1));

    c.fillStyle = sectionColorForCustomPalette(5, 1, 2);
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

    c.fillStyle = sectionColorForCustomPalette(6, 1, 2);
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

    rect(c, spineX, midOrangeY, rightW, midOrangeH, sectionColorForCustomPalette(7, 2, 1));
    rect(c, spineX, goldY, rightW, goldH, sectionColorForCustomPalette(8, 3, 3));
    rect(c, spineX, creamY, rightW, creamH, sectionColorForCustomPalette(9, 4, 4));
    rect(c, spineX, bottomRedY, rightW, bottomRedH, sectionColorForCustomPalette(10, 5, 2));
  };

  function install() {
    window.lcarsPopulatePaletteSelect?.("palette");
    window.lcarsInstallCustomPaletteControls?.({ selectId: "palette", onChange: () => {
      if (typeof updateAll === "function") updateAll();
    }});
    if (typeof updateAll === "function") updateAll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", install);
  } else {
    install();
  }
})();


// Custom Palette default mapping helper.
// Custom block colors are most intuitive as a direct Block 1 -> Block 6 sweep.
// This hook only auto-switches from the old default LCARS role mapping to Palette sweep;
// after the user manually chooses another mapping, it stays out of the way.
(function () {
  function fireChange(el) {
    el.dispatchEvent(new Event("change", { bubbles: true }));
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function setupCustomPaletteSweepDefault() {
    const palette = document.getElementById("palette");
    const mapping = document.getElementById("colorMapping");
    if (!palette || !mapping || mapping.dataset.customPaletteSweepPatch === "true") return;

    mapping.dataset.customPaletteSweepPatch = "true";
    mapping.dataset.userTouched = "false";
    mapping.dataset.internalChange = "false";

    mapping.addEventListener("change", () => {
      if (mapping.dataset.internalChange !== "true") {
        mapping.dataset.userTouched = "true";
      }
    });

    function maybeUseSweep() {
      if (
        palette.value === "custom" &&
        mapping.dataset.userTouched !== "true" &&
        (mapping.value === "role" || mapping.value === "" || mapping.value == null)
      ) {
        mapping.dataset.internalChange = "true";
        mapping.value = "sweep";
        fireChange(mapping);
        mapping.dataset.internalChange = "false";

        if (typeof window.drawWallpaper === "function") {
          window.drawWallpaper();
        }
      }
    }

    palette.addEventListener("change", maybeUseSweep);
    palette.addEventListener("input", maybeUseSweep);
    maybeUseSweep();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupCustomPaletteSweepDefault);
  } else {
    setupCustomPaletteSweepDefault();
  }
})();

