let galleryData = {
  wallpapers: [],
  icons: [],
  fonts: []
};

const state = {
  search: "",
  wallpaperPalette: "",
  wallpaperRhythm: "",
  iconPalette: "",
  iconMode: "",
  font: ""
};

async function loadGallery() {
  const res = await fetch(`gallery-data.json?t=${Date.now()}`);
  galleryData = await res.json();

  populateFilters();
  wireControls();
  renderAll();
}

function wireControls() {
  const bind = (id, key) => {
    const el = document.getElementById(id);
    el.addEventListener("input", () => {
      state[key] = el.value;
      renderAll();
    });
  };

  bind("globalSearch", "search");
  bind("wallpaperPaletteFilter", "wallpaperPalette");
  bind("wallpaperRhythmFilter", "wallpaperRhythm");
  bind("iconPaletteFilter", "iconPalette");
  bind("iconModeFilter", "iconMode");
  bind("fontFilter", "font");

  document.getElementById("resetFilters").addEventListener("click", () => {
    Object.keys(state).forEach(key => state[key] = "");

    for (const id of [
      "globalSearch",
      "wallpaperPaletteFilter",
      "wallpaperRhythmFilter",
      "iconPaletteFilter",
      "iconModeFilter",
      "fontFilter"
    ]) {
      document.getElementById(id).value = "";
    }

    renderAll();
  });
}

function populateFilters() {
  fillSelect("wallpaperPaletteFilter", unique(galleryData.wallpapers.map(x => x.palette)), "All palettes");
  fillSelect("wallpaperRhythmFilter", unique(galleryData.wallpapers.map(x => x.rhythm)), "All rhythms");
  fillSelect("iconPaletteFilter", unique(galleryData.icons.map(x => x.palette)), "All palettes");
  fillSelect("iconModeFilter", unique(galleryData.icons.map(x => x.mode)), "All color modes");
  fillSelect("fontFilter", unique(galleryData.fonts.map(x => x.font)), "All fonts");
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => humanize(a).localeCompare(humanize(b)));
}

function fillSelect(id, values, defaultLabel) {
  const select = document.getElementById(id);
  const current = select.value;

  select.innerHTML = `<option value="">${escapeHtml(defaultLabel)}</option>` +
    values.map(value => `<option value="${escapeHtml(value)}">${escapeHtml(humanize(value))}</option>`).join("");

  select.value = current;
}

function renderAll() {
  const wallpapers = galleryData.wallpapers.filter(item =>
    matchesSearch(item) &&
    matchesValue(item.palette, state.wallpaperPalette) &&
    matchesValue(item.rhythm, state.wallpaperRhythm)
  );

  const icons = galleryData.icons.filter(item =>
    matchesSearch(item) &&
    matchesValue(item.palette, state.iconPalette) &&
    matchesValue(item.mode, state.iconMode)
  );

  const fonts = galleryData.fonts.filter(item =>
    matchesSearch(item) &&
    matchesValue(item.font, state.font)
  );

  renderCards("wallpaperGrid", "wallpaperEmpty", wallpapers, item => `
    <article class="card wallpaper">
      <img loading="lazy" src="${escapeHtml(item.file)}" alt="${escapeHtml(item.title)}">
      <div class="cardBody">
        <h3 class="cardTitle">${escapeHtml(item.title)}</h3>
        <div class="meta">
          <span class="tag">palette: ${escapeHtml(humanize(item.palette))}</span>
          <span class="tag">rhythm: ${escapeHtml(humanize(item.rhythm))}</span>
        </div>
        <a href="${escapeHtml(item.file)}" target="_blank" rel="noopener">Open full image</a>
      </div>
    </article>
  `);

  renderCards("iconGrid", "iconEmpty", icons, item => `
    <article class="card icon">
      <img loading="lazy" src="${escapeHtml(item.file)}" alt="${escapeHtml(item.title)}">
      <div class="cardBody">
        <h3 class="cardTitle">${escapeHtml(item.title)}</h3>
        <div class="meta">
          <span class="tag">palette: ${escapeHtml(humanize(item.palette))}</span>
          <span class="tag">mode: ${escapeHtml(humanize(item.mode))}</span>
        </div>
        <a href="${escapeHtml(item.file)}" target="_blank" rel="noopener">Open full image</a>
      </div>
    </article>
  `);

  renderCards("fontGrid", "fontEmpty", fonts, item => `
    <article class="card font">
      <img loading="lazy" src="${escapeHtml(item.file)}" alt="${escapeHtml(item.title)}">
      <div class="cardBody">
        <h3 class="cardTitle">${escapeHtml(item.title)}</h3>
        <div class="meta">
          <span class="tag">font: ${escapeHtml(item.font)}</span>
        </div>
        <div style="color:#c9a66c; font-size:0.95rem; margin-bottom:12px;">${escapeHtml(item.note || "")}</div>
        <a href="${escapeHtml(item.file)}" target="_blank" rel="noopener">Open full image</a>
      </div>
    </article>
  `);

  updateCounts(wallpapers.length, icons.length, fonts.length);
}

function renderCards(gridId, emptyId, items, template) {
  const grid = document.getElementById(gridId);
  const empty = document.getElementById(emptyId);

  grid.innerHTML = items.map(template).join("");
  empty.style.display = items.length ? "none" : "block";
}

function matchesValue(actual, expected) {
  return !expected || actual === expected;
}

function matchesSearch(item) {
  const q = state.search.trim().toLowerCase();
  if (!q) return true;

  const haystack = Object.values(item)
    .filter(value => typeof value === "string")
    .join(" ")
    .toLowerCase();

  return q.split(/\s+/).every(part => haystack.includes(part));
}

function updateCounts(wallpaperCount, iconCount, fontCount) {
  document.getElementById("wallpaperCount").textContent =
    `${wallpaperCount}/${galleryData.wallpapers.length}`;

  document.getElementById("iconCount").textContent =
    `${iconCount}/${galleryData.icons.length}`;

  document.getElementById("fontCount").textContent =
    `${fontCount}/${galleryData.fonts.length}`;

  const totalShown = wallpaperCount + iconCount + fontCount;
  const totalAll = galleryData.wallpapers.length + galleryData.icons.length + galleryData.fonts.length;

  document.getElementById("overallStats").textContent =
    `Showing ${totalShown} of ${totalAll} generated gallery items.`;
}

function humanize(value) {
  if (!value) return "";

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
    themeMono: "Theme-Matched Monochrome",
    categoryPalette: "Theme Palette By Category",
    sequentialRainbow: "Rainbow Sequence Mode"
  };

  if (special[value]) return special[value];

  return String(value)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase());
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

loadGallery().catch(err => {
  console.error(err);
  document.body.insertAdjacentHTML(
    "beforeend",
    `<pre style="padding:24px;color:#ffb4a2;">${escapeHtml(String(err))}</pre>`
  );
});
