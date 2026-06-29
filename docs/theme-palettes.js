// Shared LCARS palette registry for wallpapers, icons, and gallery previews.
(function () {
  const CATEGORY_ORDER = [
    "Classic LCARS",
    "Star Trek Factions",
    "Pride / Identity",
    "Regional / Flags",
    "Mood / Function",
    "Accessibility",
    "Retro Computing",
    "Space / Nature"
  ];

  const DEFINITIONS = {
    classic: { label: "Classic Warm LCARS", category: "Classic LCARS", tags: ["warm", "canon", "orange"], colors: ["#e8bd88", "#df5a1f", "#d62b18", "#e09a3f", "#dfb98a"] },
    tng: { label: "TNG Pastel LCARS", category: "Classic LCARS", tags: ["enterprise-d", "pastel"], colors: ["#ffcc99", "#ff9900", "#cc3300", "#cc6699", "#9999cc"] },
    ds9: { label: "DS9 Muted Station", category: "Classic LCARS", tags: ["station", "muted"], colors: ["#c8a46a", "#b8542a", "#9e271c", "#8f6238", "#c19a70"] },
    voyager: { label: "Voyager Soft", category: "Classic LCARS", tags: ["voyager", "soft"], colors: ["#f1c48e", "#d89b52", "#c96b38", "#8e5bb8", "#b9a0dd"] },
    command: { label: "Command Gold", category: "Classic LCARS", tags: ["command", "gold"], colors: ["#ffd89a", "#f0a43a", "#d65a28", "#ffc85a", "#ffe2b3"] },
    red: { label: "Red Alert", category: "Classic LCARS", tags: ["alert", "red"], colors: ["#ffc0b8", "#e45a4e", "#d62b18", "#aa1d14", "#f08a28"] },
    security: { label: "Security Red", category: "Classic LCARS", tags: ["security", "tactical"], colors: ["#ffc7c7", "#d96464", "#b32626", "#7c1d1d", "#f08a28"] },
    science: { label: "Science Blue/Purple", category: "Classic LCARS", tags: ["science", "blue", "purple"], colors: ["#c9b8ff", "#8f72d8", "#4d47a9", "#73b7e8", "#d8d0ff"] },
    medical: { label: "Medical Teal", category: "Classic LCARS", tags: ["medical", "teal"], colors: ["#b6ffe4", "#46c2a6", "#167f7a", "#f1c96a", "#e8d7a0"] },
    opsBlue: { label: "Operations Blue", category: "Classic LCARS", tags: ["operations", "blue"], colors: ["#99c9ff", "#4d8bd8", "#2f5fa3", "#9f7dd6", "#d0c3ff"] },
    lowerDecks: { label: "Lower Decks Bright", category: "Classic LCARS", tags: ["bright", "animated"], colors: ["#ffd6a5", "#ff9f1c", "#e71d36", "#2ec4b6", "#cbf3f0"] },
    latinum: { label: "Latinum Gold", category: "Classic LCARS", tags: ["gold", "warm"], colors: ["#f7d58c", "#c99732", "#8a5c1b", "#f1aa30", "#ffe0a3"] },
    romulan: { label: "Romulan Green", category: "Star Trek Factions", tags: ["romulan", "green"], colors: ["#c8f7c5", "#65b96f", "#2e7d32", "#8fbf66", "#d4e8c3"] },
    muted: { label: "Muted OLED", category: "Accessibility", tags: ["oled", "muted", "low-light"], colors: ["#c98769", "#a9482a", "#8f241c", "#d09242", "#d7b083"] },
    grayscale: { label: "Grayscale LCARS", category: "Accessibility", tags: ["monochrome", "neutral"], colors: ["#e8e8e8", "#b7b7b7", "#777777", "#9a9a9a", "#d8d8d8"] },
    eink: { label: "E-Ink Soft", category: "Accessibility", tags: ["e-ink", "soft"], colors: ["#f0ead8", "#c8bfa8", "#817969", "#a69a80", "#e2d7bd"] },
    terminal: { label: "Terminal Green", category: "Retro Computing", tags: ["terminal", "green"], colors: ["#b7ffb7", "#5edc5e", "#1e9b1e", "#77cc77", "#d4ffd4"] },
    spectrum: { label: "Spectrum Rainbow LCARS", category: "Pride / Identity", tags: ["rainbow", "spectrum"], colors: ["#ff2d55", "#ff9500", "#ffd60a", "#32d74b", "#0a84ff", "#bf5af2"] },
    trueRainbow: { label: "True Rainbow LCARS", category: "Pride / Identity", tags: ["rainbow", "pride"], colors: ["#ff1744", "#ff9100", "#ffea00", "#00e676", "#00b0ff", "#7c4dff"] },
    pastelRainbow: { label: "Pastel Rainbow LCARS", category: "Pride / Identity", tags: ["rainbow", "pastel"], colors: ["#ff9aa2", "#ffb347", "#fff275", "#77dd77", "#89cff0", "#b39ddb"] },
    highContrast: { label: "High Contrast", category: "Accessibility", tags: ["contrast", "readability"], colors: ["#ffffff", "#ff9f1c", "#ff2e2e", "#ffd23f", "#f7f7f7"] },

    klingon: { label: "Klingon Tactical", category: "Star Trek Factions", tags: ["klingon", "tactical", "red"], colors: ["#ffb085", "#b9301c", "#6f1511", "#d46a28", "#2a1714"] },
    borg: { label: "Borg Diagnostic", category: "Star Trek Factions", tags: ["borg", "green", "diagnostic"], colors: ["#baffc9", "#4fd36b", "#0d7f2f", "#d9f99d", "#1f2f22"] },
    cardassian: { label: "Cardassian Command", category: "Star Trek Factions", tags: ["cardassian", "bronze", "ochre"], colors: ["#f0c27b", "#b06d28", "#6e3f19", "#c89543", "#3a2b22"] },
    vulcan: { label: "Vulcan Science Academy", category: "Star Trek Factions", tags: ["vulcan", "copper", "logic"], colors: ["#f2c6a0", "#b75f3a", "#783326", "#c9a04c", "#6e7784"] },
    section31: { label: "Section 31", category: "Star Trek Factions", tags: ["section 31", "stealth", "monochrome"], colors: ["#f4f7fb", "#9ba6b3", "#1f2733", "#5d6f86", "#05070a"] },
    dominion: { label: "Dominion Violet", category: "Star Trek Factions", tags: ["dominion", "purple"], colors: ["#d8c6ff", "#8e65c8", "#52316f", "#d5a044", "#2d2238"] },
    ferengi: { label: "Ferengi Exchange", category: "Star Trek Factions", tags: ["ferengi", "latinum", "commerce"], colors: ["#ffe7a3", "#d69c28", "#8a5d13", "#64c5b4", "#362512"] },

    progressPride: { label: "Progress Pride", category: "Pride / Identity", tags: ["pride", "progress"], colors: ["#e40303", "#ff8c00", "#ffed00", "#008026", "#24408e", "#732982", "#5bcefa", "#f5a9b8", "#ffffff", "#613915", "#000000"] },
    trans: { label: "Trans Pride", category: "Pride / Identity", tags: ["trans", "pride"], colors: ["#5bcefa", "#f5a9b8", "#ffffff", "#f5a9b8", "#5bcefa"] },
    bi: { label: "Bi Pride", category: "Pride / Identity", tags: ["bi", "pride"], colors: ["#d60270", "#9b4f96", "#0038a8", "#f07db4", "#4d7bd8"] },
    pan: { label: "Pan Pride", category: "Pride / Identity", tags: ["pan", "pride"], colors: ["#ff218c", "#ffd800", "#21b1ff", "#ff7ab8", "#ffe766"] },
    ace: { label: "Ace Pride", category: "Pride / Identity", tags: ["ace", "pride"], colors: ["#000000", "#a3a3a3", "#ffffff", "#800080", "#d6c2ff"] },
    aro: { label: "Aro Pride", category: "Pride / Identity", tags: ["aro", "pride"], colors: ["#3da542", "#a7d379", "#ffffff", "#a9a9a9", "#000000"] },
    nonbinary: { label: "Nonbinary Pride", category: "Pride / Identity", tags: ["nonbinary", "pride"], colors: ["#fff430", "#ffffff", "#9c59d1", "#000000", "#d9b8ff"] },
    genderfluid: { label: "Genderfluid Pride", category: "Pride / Identity", tags: ["genderfluid", "pride"], colors: ["#ff75a2", "#ffffff", "#be18d6", "#000000", "#333ebd"] },
    lesbian: { label: "Lesbian Pride", category: "Pride / Identity", tags: ["lesbian", "pride"], colors: ["#d52d00", "#ef7627", "#ff9a56", "#ffffff", "#d162a4", "#b55690", "#a30262"] },
    intersex: { label: "Intersex Pride", category: "Pride / Identity", tags: ["intersex", "pride"], colors: ["#ffd800", "#7902aa", "#ffd800", "#7902aa", "#fff1a6"] },

    usa: { label: "USA Flag-Inspired", category: "Regional / Flags", tags: ["usa", "red", "blue"], colors: ["#ffffff", "#b22234", "#3c3b6e", "#d9e6ff", "#ff9f9f"] },
    ohio: { label: "Ohio Burgee", category: "Regional / Flags", tags: ["ohio", "burgee"], colors: ["#ffffff", "#bb0000", "#003f87", "#d7e7ff", "#ffb3b3"] },
    japan: { label: "Japan Minimal", category: "Regional / Flags", tags: ["japan", "minimal"], colors: ["#ffffff", "#bc002d", "#f4d8d8", "#1a1a1a", "#f7f7f7"] },
    brazil: { label: "Brazil Flag-Inspired", category: "Regional / Flags", tags: ["brazil", "green", "yellow"], colors: ["#009739", "#ffdf00", "#002776", "#ffffff", "#6bd48a"] },
    ukraine: { label: "Ukraine Flag-Inspired", category: "Regional / Flags", tags: ["ukraine", "blue", "yellow"], colors: ["#0057b7", "#ffd700", "#8ab6ff", "#fff0a6", "#002f6c"] },
    wales: { label: "Wales Flag-Inspired", category: "Regional / Flags", tags: ["wales", "dragon"], colors: ["#ffffff", "#d30731", "#00ad36", "#f4c7c7", "#9be5ad"] },
    scotland: { label: "Scotland Saltire", category: "Regional / Flags", tags: ["scotland", "blue"], colors: ["#0065bd", "#ffffff", "#8cc8ff", "#d9f0ff", "#003a70"] },
    tibet: { label: "Tibet Flag-Inspired", category: "Regional / Flags", tags: ["tibet", "saffron", "red"], colors: ["#f4c430", "#be1e2d", "#ffffff", "#0047ab", "#ffd866"] },
    eu: { label: "EU Blue/Gold", category: "Regional / Flags", tags: ["eu", "blue", "gold"], colors: ["#003399", "#ffcc00", "#5f7dff", "#fff0a6", "#001f60"] },
    canada: { label: "Canada Flag-Inspired", category: "Regional / Flags", tags: ["canada", "red", "white"], colors: ["#ff0000", "#ffffff", "#c8102e", "#ffd6d6", "#7a0019"] },
    mexico: { label: "Mexico Flag-Inspired", category: "Regional / Flags", tags: ["mexico", "green", "red"], colors: ["#006847", "#ffffff", "#ce1126", "#c9a25d", "#6fbf9c"] },

    sleepMode: { label: "Sleep Mode", category: "Mood / Function", tags: ["sleep", "night", "low-light"], colors: ["#3f2b56", "#6c4a78", "#b07bac", "#f2d7ee", "#1b1524"] },
    dreamMode: { label: "Dream Mode", category: "Mood / Function", tags: ["dream", "violet", "night"], colors: ["#b8a1ff", "#6f5bd8", "#33206f", "#f0c36a", "#080517"] },
    meditation: { label: "Meditation Mode", category: "Mood / Function", tags: ["meditation", "saffron", "warm"], colors: ["#ffe0a3", "#d8902f", "#8e2f24", "#f5c542", "#2d1612"] },
    focus: { label: "Focus Mode", category: "Mood / Function", tags: ["focus", "cyan", "navy"], colors: ["#b7f7ff", "#1fb7d6", "#123a66", "#f08a28", "#071421"] },
    stealth: { label: "Stealth Mode", category: "Mood / Function", tags: ["stealth", "dark"], colors: ["#d8dbe2", "#707782", "#222832", "#3b4658", "#05070a"] },
    engineering: { label: "Engineering Alert", category: "Mood / Function", tags: ["engineering", "warning"], colors: ["#ffe0a3", "#ff9f1c", "#d62b18", "#ffd23f", "#4b1d10"] },
    medicalScan: { label: "Medical Scan", category: "Mood / Function", tags: ["medical", "scan"], colors: ["#d7fff4", "#47d7b8", "#157f83", "#e7f7ff", "#063236"] },
    lowLight: { label: "Warm Night", category: "Mood / Function", tags: ["night", "amber", "low-light"], colors: ["#f0b35a", "#b96b24", "#6a2d17", "#d48a35", "#180a05"] },
    morningBriefing: { label: "Morning Briefing", category: "Mood / Function", tags: ["morning", "bright"], colors: ["#fff2b8", "#ffb84d", "#ff6b35", "#8ecae6", "#023047"] },

    oledBlack: { label: "OLED Black", category: "Accessibility", tags: ["oled", "black", "battery"], colors: ["#ffffff", "#d0d0d0", "#888888", "#ff9f1c", "#121212"] },
    softContrast: { label: "Soft Contrast", category: "Accessibility", tags: ["soft", "readability"], colors: ["#f3e7d3", "#c89b62", "#8b5e3c", "#d8c4a8", "#3a2c24"] },
    deuteranopia: { label: "Deuteranopia-Friendly", category: "Accessibility", tags: ["colorblind", "deuteranopia"], colors: ["#f0e442", "#0072b2", "#56b4e9", "#e69f00", "#ffffff"] },
    protanopia: { label: "Protanopia-Friendly", category: "Accessibility", tags: ["colorblind", "protanopia"], colors: ["#f0e442", "#0072b2", "#56b4e9", "#009e73", "#ffffff"] },
    tritanopia: { label: "Tritanopia-Friendly", category: "Accessibility", tags: ["colorblind", "tritanopia"], colors: ["#d55e00", "#009e73", "#cc79a7", "#f0e442", "#ffffff"] },

    crtGreen: { label: "CRT Green", category: "Retro Computing", tags: ["crt", "green"], colors: ["#d6ffd6", "#7cff7c", "#21d121", "#00a000", "#003800"] },
    amberTerminal: { label: "Amber Terminal", category: "Retro Computing", tags: ["terminal", "amber"], colors: ["#ffe6a3", "#ffb000", "#cc7a00", "#8a4f00", "#2a1600"] },
    ibmBlue: { label: "IBM Blue", category: "Retro Computing", tags: ["ibm", "blue"], colors: ["#d7e8ff", "#6aa8ff", "#1f5fbf", "#92b8d8", "#0d2240"] },
    cyberdeck: { label: "Cyberdeck", category: "Retro Computing", tags: ["cyberdeck", "portable"], colors: ["#aaffee", "#24d0ba", "#ff9f1c", "#ff4d6d", "#091014"] },
    synthwave: { label: "Synthwave Console", category: "Retro Computing", tags: ["synthwave", "neon"], colors: ["#ff71ce", "#b967ff", "#01cdfe", "#05ffa1", "#2d0b59"] },

    solarFlare: { label: "Solar Flare", category: "Space / Nature", tags: ["sun", "flare"], colors: ["#fff0a6", "#ffb000", "#ff5a1f", "#c81d11", "#331006"] },
    nebula: { label: "Nebula", category: "Space / Nature", tags: ["nebula", "purple", "blue"], colors: ["#e0c3fc", "#8ec5fc", "#6a4c93", "#ff77a9", "#12071f"] },
    europa: { label: "Europa Ice", category: "Space / Nature", tags: ["ice", "europa"], colors: ["#f4fbff", "#bde0fe", "#89c2d9", "#c2b280", "#27384a"] },
    mars: { label: "Mars Colony", category: "Space / Nature", tags: ["mars", "red", "desert"], colors: ["#f2b07b", "#c75d2c", "#7f2f1d", "#d9985f", "#24100a"] },
    titan: { label: "Titan Haze", category: "Space / Nature", tags: ["titan", "haze"], colors: ["#ffd28a", "#c77d36", "#6b4a2d", "#d9b36f", "#1d1712"] },
    forest: { label: "Forest Biome", category: "Space / Nature", tags: ["forest", "green"], colors: ["#d8f3dc", "#74c69d", "#2d6a4f", "#b7e4c7", "#081c15"] },
    ocean: { label: "Deep Ocean", category: "Space / Nature", tags: ["ocean", "blue"], colors: ["#caf0f8", "#48cae4", "#0077b6", "#90e0ef", "#03045e"] },
    desert: { label: "Desert Terminal", category: "Space / Nature", tags: ["desert", "sand"], colors: ["#ffe8b6", "#d89b52", "#a45c32", "#c9a66b", "#2b1810"] },
    autumn: { label: "Autumn Stack", category: "Space / Nature", tags: ["autumn", "warm"], colors: ["#ffd6a5", "#f77f00", "#d62828", "#6a994e", "#432818"] },

  };

  const CUSTOM_DEFAULTS = ["#e8bd88", "#df5a1f", "#d62b18", "#e09a3f", "#dfb98a", "#bf5af2"];
  const CUSTOM_STORAGE_KEY = "lcarsCustomPaletteV1";

  function normalizeHex(value, fallback) {
    const text = String(value || "").trim();
    return /^#[0-9a-fA-F]{6}$/.test(text) ? text : fallback;
  }

  function customPalette(prefix = "customPalette") {
    return CUSTOM_DEFAULTS.map((fallback, index) => {
      const input = document.getElementById(`${prefix}${index}`);
      return normalizeHex(input?.value, fallback);
    });
  }

  function paletteColors(id, options = {}) {
    if (id === "custom") return customPalette(options.prefix || "customPalette");
    const def = DEFINITIONS[id] || DEFINITIONS.classic;
    return [...def.colors];
  }

  function paletteLabel(id) {
    if (id === "custom") return "Custom Palette";
    return (DEFINITIONS[id] || DEFINITIONS.classic).label;
  }

  function paletteCategory(id) {
    if (id === "custom") return "Custom";
    return (DEFINITIONS[id] || DEFINITIONS.classic).category;
  }

  function groupedPalettes() {
    const groups = new Map(CATEGORY_ORDER.map(category => [category, []]));
    for (const [id, def] of Object.entries(DEFINITIONS)) {
      if (!groups.has(def.category)) groups.set(def.category, []);
      groups.get(def.category).push({ id, ...def });
    }
    for (const entries of groups.values()) entries.sort((a, b) => a.label.localeCompare(b.label));
    return [...groups.entries()].filter(([, entries]) => entries.length);
  }

  function populatePaletteSelect(selectOrId, options = {}) {
    const select = typeof selectOrId === "string" ? document.getElementById(selectOrId) : selectOrId;
    if (!select) return;

    const previous = select.value || options.defaultValue || "classic";
    select.innerHTML = "";

    for (const [category, entries] of groupedPalettes()) {
      const group = document.createElement("optgroup");
      group.label = category;
      for (const entry of entries) {
        const option = document.createElement("option");
        option.value = entry.id;
        option.textContent = entry.label;
        group.appendChild(option);
      }
      select.appendChild(group);
    }

    if (options.includeCustom !== false) {
      const group = document.createElement("optgroup");
      group.label = "Custom";
      const option = document.createElement("option");
      option.value = "custom";
      option.textContent = "Custom Palette";
      group.appendChild(option);
      select.appendChild(group);
    }

    const requested = new URLSearchParams(window.location.search).get("palette");
    const next = requested || previous;
    select.value = [...select.options].some(option => option.value === next) ? next : "classic";
  }

  function installCustomPaletteControls({ prefix = "customPalette", selectId = "palette", onChange } = {}) {
    const select = document.getElementById(selectId);
    const inputs = CUSTOM_DEFAULTS.map((fallback, index) => document.getElementById(`${prefix}${index}`)).filter(Boolean);
    if (!inputs.length) return;

    try {
      const stored = JSON.parse(localStorage.getItem(CUSTOM_STORAGE_KEY) || "null");
      if (Array.isArray(stored)) {
        inputs.forEach((input, index) => input.value = normalizeHex(stored[index], CUSTOM_DEFAULTS[index]));
      }
    } catch {}

    const persistAndRefresh = () => {
      try {
        localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(inputs.map(input => normalizeHex(input.value, "#000000"))));
      } catch {}
      if (typeof onChange === "function") onChange();
    };

    for (const input of inputs) {
      input.addEventListener("input", persistAndRefresh);
      input.addEventListener("change", persistAndRefresh);
    }

    select?.addEventListener("change", () => {
      const panel = document.getElementById("customPaletteEditor");
      if (panel) panel.open = select.value === "custom" || panel.open;
      if (typeof onChange === "function") onChange();
    });
  }

  function paletteColorsToCss(colors) {
    const usable = colors && colors.length ? colors : CUSTOM_DEFAULTS;
    return usable.map((color, index) => `${color} ${index * 100 / usable.length}% ${(index + 1) * 100 / usable.length}%`).join(", ");
  }

  window.LCARS_PALETTE_CATEGORIES = CATEGORY_ORDER;
  window.LCARS_THEME_PALETTES = DEFINITIONS;
  window.lcarsPaletteColors = paletteColors;
  window.lcarsPaletteLabel = paletteLabel;
  window.lcarsPaletteCategory = paletteCategory;
  window.lcarsGroupedPalettes = groupedPalettes;
  window.lcarsPopulatePaletteSelect = populatePaletteSelect;
  window.lcarsInstallCustomPaletteControls = installCustomPaletteControls;
  window.lcarsPaletteCssPreview = paletteColorsToCss;
})();
