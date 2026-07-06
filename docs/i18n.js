(() => {
  const STORAGE_KEY = "lcarsLanguage";

  const STRINGS = {
    en: {
      languageLabel: "Language",
      english: "English",
      siteTitle: "LCARS Niagara Launcher Theme",
      accessibilityNoteTitle: "Accessibility note",
      accessibilityNoteBody:
        "For better color distinction, try the High Contrast, Grayscale LCARS, or E-Ink Soft palettes. The webpage also includes keyboard focus outlines, skip links, screen-reader status messages, and a text description of the wallpaper preview."
    }
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function getLanguage() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && STRINGS[saved]) return saved;
    return "en";
  }

  function applyLanguage(lang) {
    const strings = STRINGS[lang] || STRINGS.en;
    document.documentElement.lang = lang;

    for (const el of $$("[data-i18n]")) {
      const key = el.dataset.i18n;
      if (strings[key]) el.textContent = strings[key];
    }

    localStorage.setItem(STORAGE_KEY, lang);
  }

  function installLanguagePicker() {
    if ($("#lcarsLanguageSelect")) return;

    const main = $("main");
    if (!main) return;

    const wrap = document.createElement("label");
    wrap.className = "languagePicker";
    wrap.innerHTML = `
      <span data-i18n="languageLabel">Language</span>
      <select id="lcarsLanguageSelect" aria-label="Language">
        <option value="en" data-i18n="english">English</option>
      </select>
    `;

    main.insertAdjacentElement("afterbegin", wrap);

    const select = $("#lcarsLanguageSelect");
    select.value = getLanguage();
    select.addEventListener("change", () => applyLanguage(select.value));
  }

  function init() {
    installLanguagePicker();
    applyLanguage(getLanguage());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
