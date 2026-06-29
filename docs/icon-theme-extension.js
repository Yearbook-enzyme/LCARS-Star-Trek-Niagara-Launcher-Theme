// Extends the existing icon generator with shared categorized palettes and custom colors.
(function () {
  function palette() {
    const id = document.getElementById("palette")?.value || "classic";
    if (window.lcarsPaletteColors) return window.lcarsPaletteColors(id);
    return palettes[id] || palettes.classic;
  }

  function safeCategoryOrder() {
    try {
      return categoryOrder;
    } catch {
      return ["communication", "browser", "media", "health", "ai", "tools", "productivity", "photography", "maps", "finance", "shopping", "games", "reading", "security", "system", "unknown"];
    }
  }

  colorFor = function colorFor(category, localIndex) {
    const pal = palette();
    const len = Math.max(1, pal.length);
    const mode = document.getElementById("colorMode")?.value || "themeMono";
    const order = safeCategoryOrder();
    const catIndex = Math.max(0, order.indexOf(category));

    if (mode === "categoryPalette") {
      return mix(pal[catIndex % len], "#ffffff", (localIndex % 5) * 0.035);
    }

    if (mode === "paletteSequence") {
      const base = pal[(catIndex + localIndex) % len] || pal[0];
      return mix(base, localIndex % 2 ? "#ffffff" : "#000000", (localIndex % 5) * 0.025);
    }

    if (mode === "reverseSweep") {
      const seq = (catIndex + localIndex) % len;
      const reversedIndex = (len - 1 - seq + len) % len;
      const base = pal[reversedIndex] || pal[0];
      return mix(base, localIndex % 2 ? "#ffffff" : "#000000", (localIndex % 5) * 0.025);
    }

    if (mode === "flagStripes") {
      const maxIndex = Math.max(1, order.length - 1);
      const paletteIndex = Math.round((catIndex / maxIndex) * (len - 1));
      const base = pal[paletteIndex] || pal[0];
      return mix(base, "#ffffff", (localIndex % 4) * 0.03);
    }

    if (mode === "mirrorStripes") {
      const mirrorIndex = catIndex <= (order.length - 1) / 2
        ? catIndex
        : (order.length - 1 - catIndex);
      const maxMirror = Math.max(1, Math.ceil(order.length / 2) - 1);
      const paletteIndex = Math.round((mirrorIndex / maxMirror) * (len - 1));
      const base = pal[paletteIndex] || pal[0];
      return mix(base, localIndex % 2 ? "#ffffff" : "#000000", (localIndex % 5) * 0.02);
    }

    if (mode === "softDiagnostic") {
      const base = pal[(catIndex * 2 + 2) % len] || pal[0];
      const softened = mix(base, "#ffffff", 0.10 + (localIndex % 3) * 0.025);
      return mix(softened, "#000000", Math.min(0.22, catIndex * 0.008));
    }

    const base = pal[2 % len] || pal[0];
    const offset = catIndex - order.length / 2;
    const directional = offset < 0
      ? mix(base, "#ffffff", Math.abs(offset) * 0.035)
      : mix(base, "#000000", Math.abs(offset) * 0.035);
    return mix(directional, localIndex % 2 ? "#ffffff" : "#000000", (localIndex % 5) * 0.025);
  };

  function install() {
    window.lcarsPopulatePaletteSelect?.("palette");
    window.lcarsInstallCustomPaletteControls?.({ selectId: "palette", onChange: () => {
      if (typeof render === "function") render();
    }});

    const select = document.getElementById("colorMode");
    const extras = [
      ["paletteSequence", "Palette sweep"],
      ["reverseSweep", "Palette sweep reversed"],
      ["flagStripes", "Flag stripes"],
      ["mirrorStripes", "Mirrored stripes"],
      ["softDiagnostic", "Soft diagnostic accents"]
    ];

    if (select) {
      for (const [value, label] of extras) {
        if (![...select.options].some(option => option.value === value)) {
          const option = document.createElement("option");
          option.value = value;
          option.textContent = label;
          select.appendChild(option);
        }
      }
    }

    if (typeof render === "function") render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", install);
  } else {
    install();
  }
})();
