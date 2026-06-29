let galleryData = {
  wallpapers: [],
  icons: [],
  fonts: []
};

const state = {
  search: "",
  themeCategory: "",
  wallpaperCategory: "",
  wallpaperPalette: "",
  wallpaperRhythm: "",
  iconCategory: "",
  iconPalette: "",
  iconMode: "",
  font: ""
};

async function loadGallery() {
  const response = await fetch(`gallery-data.json?t=${Date.now()}`);
  if (!response.ok) {
    throw new Error(`Could not load gallery-data.json: HTTP ${response.status}`);
  }

  galleryData = await response.json();
  populateFilters();
  wireControls();
  renderAll();
}

function themeItems() {
  return Object.entries(window.LCARS_THEME_PALETTES || {}).map(([id, def]) => ({
    id,
    title: def.label || humanize(id),
    palette: id,
    category: def.category || "Theme",
    tags: def.tags || [],
    colors: def.colors || [],
    type: "theme"
  }));
}

function wireControls() {
  const bind = (id, key) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", () => {
      state[key] = el.value;
      renderAll();
    });
  };

  bind("globalSearch", "search");
  bind("themeCategoryFilter", "themeCategory");
  bind("wallpaperCategoryFilter", "wallpaperCategory");
  bind("wallpaperPaletteFilter", "wallpaperPalette");
  bind("wallpaperRhythmFilter", "wallpaperRhythm");
  bind("iconCategoryFilter", "iconCategory");
  bind("iconPaletteFilter", "iconPalette");
  bind("iconModeFilter", "iconMode");
  bind("fontFilter", "font");

  document.getElementById("resetFilters")?.addEventListener("click", () => {
    Object.keys(state).forEach(key => state[key] = "");

    for (const id of [
      "globalSearch",
      "themeCategoryFilter",
      "wallpaperCategoryFilter",
      "wallpaperPaletteFilter",
      "wallpaperRhythmFilter",
      "iconCategoryFilter",
      "iconPaletteFilter",
      "iconModeFilter",
      "fontFilter"
    ]) {
      const el = document.getElementById(id);
      if (el) el.value = "";
    }

    renderAll();
  });

  // These buttons existed for capped sections. The gallery now shows all matching cards by default.
  for (const id of ["showAllThemes", "showAllWallpapers", "showAllIcons", "showAllFonts"]) {
    const button = document.getElementById(id);
    if (button) button.hidden = true;
  }
}

function populateFilters() {
  const categories = window.LCARS_PALETTE_CATEGORIES ||
    unique(themeItems().map(item => item.category));

  fillSelect("themeCategoryFilter", categories, "All categories", value => value);
  fillSelect("wallpaperCategoryFilter", categories, "All categories", value => value);
  fillSelect("iconCategoryFilter", categories, "All categories", value => value);

  fillSelect("wallpaperPaletteFilter", unique(galleryData.wallpapers.map(item => item.palette)), "All palettes");
  fillSelect("wallpaperRhythmFilter", unique(galleryData.wallpapers.map(item => item.rhythm)), "All rhythms");
  fillSelect("iconPaletteFilter", unique(galleryData.icons.map(item => item.palette)), "All palettes");
  fillSelect("iconModeFilter", unique(galleryData.icons.map(item => item.mode)), "All color mappings");
  fillSelect("fontFilter", unique(galleryData.fonts.map(item => item.font)), "All fonts", value => value);
}

function unique(values) {
  return [...new Set(values.filter(Boolean))]
    .sort((a, b) => humanize(a).localeCompare(humanize(b)));
}

function fillSelect(id, values, defaultLabel, formatter = humanize) {
  const select = document.getElementById(id);
  if (!select) return;

  const current = select.value;
  select.innerHTML = `<option value="">${escapeHtml(defaultLabel)}</option>` +
    values.map(value => `<option value="${escapeHtml(value)}">${escapeHtml(formatter(value))}</option>`).join("");

  select.value = [...select.options].some(option => option.value === current) ? current : "";
}

function renderAll() {
  const themes = themeItems().filter(item =>
    matchesSearch(item) &&
    matchesValue(item.category, state.themeCategory)
  );

  const wallpapers = galleryData.wallpapers.filter(item => {
    const enriched = withPaletteMeta(item);
    return matchesSearch(enriched) &&
      matchesValue(enriched.paletteCategory, state.wallpaperCategory) &&
      matchesValue(item.palette, state.wallpaperPalette) &&
      matchesValue(item.rhythm, state.wallpaperRhythm);
  });

  const icons = galleryData.icons.filter(item => {
    const enriched = withPaletteMeta(item);
    return matchesSearch(enriched) &&
      matchesValue(enriched.paletteCategory, state.iconCategory) &&
      matchesValue(item.palette, state.iconPalette) &&
      matchesValue(item.mode, state.iconMode);
  });

  const fonts = galleryData.fonts.filter(item =>
    matchesSearch(item) &&
    matchesValue(item.font, state.font)
  );

  renderCards("themeGrid", "themeEmpty", themes, renderThemeCard);
  renderCards("wallpaperGrid", "wallpaperEmpty", wallpapers, renderWallpaperCard);
  renderCards("iconGrid", "iconEmpty", icons, renderIconCard);
  renderCards("fontGrid", "fontEmpty", fonts, renderFontCard);

  updateCounts(themes.length, wallpapers.length, icons.length, fonts.length);
}

function renderThemeCard(item) {
  const colors = item.colors && item.colors.length
    ? item.colors
    : ["#e8bd88", "#df5a1f", "#d62b18", "#e09a3f", "#dfb98a"];

  const bars = colors
    .map(color => `<span class="paletteBar" style="background:${escapeHtml(color)}"></span>`)
    .join("");

  const rows = colors.slice(0, 4)
    .map(color => `<span class="lcarsMiniRow" style="background:${escapeHtml(color)}"></span>`)
    .join("");

  const tags = (item.tags || []).slice(0, 5)
    .map(tag => `<span class="tag">${escapeHtml(tag)}</span>`)
    .join("");

  return `
    <article class="card theme">
      <div class="palettePreview">
        <div class="paletteBars" style="--swatches:${colors.length}">${bars}</div>
        <div class="lcarsMini">${rows}</div>
      </div>
      <div class="cardBody">
        <h3 class="cardTitle">${escapeHtml(item.title)}</h3>
        <div class="meta">
          <span class="tag">${escapeHtml(item.category)}</span>
          ${tags}
        </div>
        <div class="cardActions">
          <a href="index.html?palette=${encodeURIComponent(item.id)}">Use for wallpaper</a>
          <a href="icon-generator.html?palette=${encodeURIComponent(item.id)}">Use for icons</a>
        </div>
      </div>
    </article>
  `;
}

function renderWallpaperCard(item) {
  return `
    <article class="card wallpaper">
      <img loading="lazy" src="${escapeHtml(item.file)}" alt="${escapeHtml(item.title)}">
      <div class="cardBody">
        <h3 class="cardTitle">${escapeHtml(item.title)}</h3>
        <div class="meta">
          <span class="tag">category: ${escapeHtml(paletteCategory(item.palette))}</span>
          <span class="tag">palette: ${escapeHtml(humanize(item.palette))}</span>
          <span class="tag">rhythm: ${escapeHtml(humanize(item.rhythm))}</span>
        </div>
        <a href="${escapeHtml(item.file)}" target="_blank" rel="noopener">Open full image</a>
      </div>
    </article>
  `;
}

function renderIconCard(item) {
  return `
    <article class="card icon">
      <img loading="lazy" src="${escapeHtml(item.file)}" alt="${escapeHtml(item.title)}">
      <div class="cardBody">
        <h3 class="cardTitle">${escapeHtml(item.title)}</h3>
        <div class="meta">
          <span class="tag">category: ${escapeHtml(paletteCategory(item.palette))}</span>
          <span class="tag">palette: ${escapeHtml(humanize(item.palette))}</span>
          <span class="tag">mapping: ${escapeHtml(humanize(item.mode))}</span>
        </div>
        <a href="${escapeHtml(item.file)}" target="_blank" rel="noopener">Open full image</a>
      </div>
    </article>
  `;
}

function quoteCssFontName(name) {
  return `"${String(name || "").replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
}

function fontAliases(font) {
  const aliases = {
    "Federation": ["Federation", "Federation Regular"],
    "Federation Wide": ["Federation Wide", "FederationWide"],
    "Trek TNG Monitors": ["Trek TNG Monitors", "TrekTNGMonitors", "TNG Monitors"],
    "Context Ultra Condensed": ["Context Ultra Condensed", "ContextUltraCondensed"],
    "Context Ultra Condensed Bold": ["Context Ultra Condensed Bold", "ContextUltraCondensedBold"],
    "Jefferies Extended": ["Jefferies Extended", "Jefferies", "Jefferies Extended Regular"],
    "TOS Title": ["TOS Title", "Star Trek TOS Title"],
    "Trek Movie 1": ["Trek Movie 1", "TrekMovie1"],
    "Trek Movie 2": ["Trek Movie 2", "TrekMovie2"],
    "Starfleet": ["Starfleet", "Starfleet Regular"],
    "Classic Ship Hull": ["Classic Ship Hull", "ClassicShipHull"],
    "Klingon": ["Klingon", "Klingon Regular", "KlingonTNG", "Klingon TNG"],
    "Vulcan": ["Vulcan", "Vulcan Regular"],
    "Romulan": ["Romulan", "Romulan Regular"],
    "Bajoran": ["Bajoran", "Bajoran Regular"],
    "Cardassian": ["Cardassian", "Cardassian Regular"],
    "Dominion": ["Dominion", "Dominion Regular"],
    "Ferengi": ["Ferengi", "Ferengi Regular"],
    "Tholian": ["Tholian", "Tholian Regular"],
    "Trill": ["Trill", "Trill Regular"],
    "Trekbats": ["Trekbats", "Trekbats Regular", "Trek Bats"]
  };

  const direct = String(font || "").trim();
  return [...new Set([direct, ...(aliases[direct] || [])].filter(Boolean))];
}

function fontStackFor(font) {
  return [
    ...fontAliases(font).map(quoteCssFontName),
    "system-ui",
    "sans-serif"
  ].join(", ");
}

function fontSampleFor(font) {
  const decorative = new Set([
    "Klingon",
    "Vulcan",
    "Romulan",
    "Bajoran",
    "Cardassian",
    "Dominion",
    "Ferengi",
    "Tholian",
    "Trill",
    "Trekbats"
  ]);

  if (decorative.has(font)) {
    return {
      primary: "LCARS 47",
      rows: ["STATUS", "VECTOR", "ARCHIVE"]
    };
  }

  return {
    primary: "LCARS 47",
    rows: ["ChatGPT", "Grayjay", "Feeder"]
  };
}

function renderFontCard(item) {
  const stack = fontStackFor(item.font);
  const sample = fontSampleFor(item.font);
  const rows = sample.rows
    .map(row => `<span>${escapeHtml(row)}</span>`)
    .join("");

  return `
    <article class="card font">
      <div class="fontLivePreview" style="font-family:${escapeHtml(stack)}">
        <div class="fontPreviewReadout">${escapeHtml(sample.primary)}</div>
        <div class="fontPreviewRows">${rows}</div>
      </div>
      <div class="cardBody">
        <h3 class="cardTitle">${escapeHtml(item.title)}</h3>
        <div class="meta">
          <span class="tag">font: ${escapeHtml(item.font)}</span>
        </div>
        <div class="fontCardNote">
          ${escapeHtml(item.note || "")}
          Live preview uses the font if it is installed locally; otherwise the browser falls back.
        </div>
        <a href="${escapeHtml(item.file)}" target="_blank" rel="noopener">Open generated PNG fallback</a>
      </div>
    </article>
  `;
}

function renderCards(gridId, emptyId, items, template) {
  const grid = document.getElementById(gridId);
  const empty = document.getElementById(emptyId);
  if (!grid || !empty) return;

  grid.innerHTML = items.map(template).join("");
  empty.style.display = items.length ? "none" : "block";
}

function withPaletteMeta(item) {
  const def = window.LCARS_THEME_PALETTES?.[item.palette] || {};
  return {
    ...item,
    paletteLabel: humanize(item.palette),
    paletteCategory: paletteCategory(item.palette),
    paletteTags: (def.tags || []).join(" ")
  };
}

function paletteCategory(id) {
  return window.lcarsPaletteCategory ? window.lcarsPaletteCategory(id) : "Generated";
}

function matchesValue(actual, expected) {
  return !expected || actual === expected;
}

function matchesSearch(item) {
  const query = state.search.trim().toLowerCase();
  if (!query) return true;

  const haystack = Object.values(item)
    .flatMap(value => Array.isArray(value) ? value : [value])
    .filter(value => typeof value === "string")
    .join(" ")
    .toLowerCase();

  return query.split(/\s+/).every(part => haystack.includes(part));
}

function updateCounts(themeCount, wallpaperCount, iconCount, fontCount) {
  setText("themeCount", `${themeCount}/${themeItems().length}`);
  setText("wallpaperCount", `${wallpaperCount}/${galleryData.wallpapers.length}`);
  setText("iconCount", `${iconCount}/${galleryData.icons.length}`);
  setText("fontCount", `${fontCount}/${galleryData.fonts.length}`);

  const totalShown = themeCount + wallpaperCount + iconCount + fontCount;
  const totalAll = themeItems().length + galleryData.wallpapers.length + galleryData.icons.length + galleryData.fonts.length;
  setText("overallStats", `Showing ${totalShown} of ${totalAll} matching gallery and theme-catalog items.`);
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function humanize(value) {
  if (!value) return "";

  if (window.lcarsPaletteLabel && window.LCARS_THEME_PALETTES?.[value]) {
    return window.lcarsPaletteLabel(value);
  }

  const special = {
    tng: "TNG Pastel LCARS",
    ds9: "DS9 Muted Station",
    opsBlue: "Operations Blue",
    lowerDecks: "Lower Decks Bright",
    eink: "E-Ink Soft",
    trueRainbow: "True Rainbow LCARS",
    pastelRainbow: "Pastel Rainbow LCARS",
    highContrast: "High Contrast",
    spectrumFlow: "Spectrum Flow",
    tallLower: "Tall Lower Panels",
    themeMono: "Theme Monochrome",
    categoryPalette: "Theme Palette By Category",
    sequentialRainbow: "Rainbow Sequence Mode",
    paletteSequence: "Palette Sweep",
    reverseSweep: "Palette Sweep Reversed",
    flagStripes: "Flag Stripes",
    mirrorStripes: "Mirrored Stripes",
    softDiagnostic: "Soft Diagnostic Accents"
  };

  if (special[value]) return special[value];

  return String(value)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, char => char.toUpperCase());
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

loadGallery().catch(error => {
  console.error(error);
  setText("overallStats", `Gallery load error: ${error.message}`);
  document.body.insertAdjacentHTML(
    "beforeend",
    `<pre style="padding:24px;color:#ffb4a2;">${escapeHtml(error.stack || String(error))}</pre>`
  );
});
