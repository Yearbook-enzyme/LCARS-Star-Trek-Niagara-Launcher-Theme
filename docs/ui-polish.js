(() => {
  if (location.pathname.endsWith("/icon-generator.html") || location.pathname.endsWith("/icon-generator")) {
    return;
  }

  const USER_MAPPINGS_KEY = "lcarsIconGeneratorUserMappingsV1";
  const BUILD_HISTORY_KEY = "lcarsIconGeneratorBuildHistoryV1";
  const SAMPLE_URL = "samples/sample-launchable-components.txt";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function addStylesheet() {
    if ($('link[href="ui-polish.css"]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "ui-polish.css";
    document.head.appendChild(link);
  }

  function addStartFlow() {
    const title = $("h1");
    if (!title || !/LCARS Niagara Launcher Theme/i.test(title.textContent || "")) return;
    if ($(".lcars-start-flow")) return;

    const flow = document.createElement("section");
    flow.className = "lcars-start-flow";
    flow.innerHTML = `
      <h2>Start here</h2>
      <div class="lcars-flow-grid">
        <div class="lcars-flow-step"><strong>01</strong><span>Generate a Niagara wallpaper.</span></div>
        <div class="lcars-flow-step"><strong>02</strong><span>Export your Android launcher app list.</span></div>
        <div class="lcars-flow-step"><strong>03</strong><span>Generate matching LCARS icons.</span></div>
        <div class="lcars-flow-step"><strong>04</strong><span>Build the signed icon-pack APK.</span></div>
        <div class="lcars-flow-step"><strong>05</strong><span>Apply wallpaper and icon pack in Niagara.</span></div>
      </div>
    `;

    const wallpaperHeading = $$("h2").find(h => /Wallpaper Generator/i.test(h.textContent || ""));
    if (wallpaperHeading) {
      wallpaperHeading.parentNode.insertBefore(flow, wallpaperHeading);
    } else {
      title.insertAdjacentElement("afterend", flow);
    }
  }

  function copyButtonsForCodeBlocks() {
    for (const pre of $$("pre")) {
      if (pre.closest(".lcars-copy-wrap")) continue;

      const wrap = document.createElement("div");
      wrap.className = "lcars-copy-wrap";
      pre.parentNode.insertBefore(wrap, pre);
      wrap.appendChild(pre);

      const button = document.createElement("button");
      button.type = "button";
      button.className = "lcars-copy-btn";
      button.textContent = "Copy";
      button.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(pre.textContent || "");
          button.textContent = "Copied";
          setTimeout(() => button.textContent = "Copy", 1200);
        } catch {
          button.textContent = "Copy failed";
          setTimeout(() => button.textContent = "Copy", 1500);
        }
      });

      wrap.appendChild(button);
    }
  }

  function getAppRows() {
    const tables = $$("table");
    let best = null;
    let bestRows = [];

    for (const table of tables) {
      const rows = $$("tbody tr", table);
      if (rows.length > bestRows.length && table.textContent.match(/Package|Category|Source/i)) {
        best = table;
        bestRows = rows;
      }
    }

    return { table: best, rows: bestRows };
  }

  function rowCategory(row) {
    const select = $("select", row);
    if (select) {
      const value = select.value || "";
      const text = select.options?.[select.selectedIndex]?.textContent || "";
      return `${value} ${text}`.toLowerCase();
    }
    return row.textContent.toLowerCase();
  }

  function rowSource(row) {
    const cells = $$("td", row);
    return (cells[cells.length - 1]?.textContent || "").toLowerCase();
  }

  function rowNeedsReview(row) {
    const cat = rowCategory(row);
    const source = rowSource(row);
    return cat.includes("unknown") || source.includes("guess") || source.includes("guessed");
  }

  function reviewStats() {
    const { rows } = getAppRows();
    const stats = {
      total: rows.length,
      visible: 0,
      unknown: 0,
      guessed: 0,
      saved: 0,
      known: 0
    };

    for (const row of rows) {
      if (!row.classList.contains("lcars-hidden-by-filter")) stats.visible += 1;

      const cat = rowCategory(row);
      const source = rowSource(row);

      if (cat.includes("unknown")) stats.unknown += 1;
      if (source.includes("guess") || source.includes("guessed")) stats.guessed += 1;
      if (source.includes("saved")) stats.saved += 1;
      if (source.includes("known")) stats.known += 1;
    }

    return stats;
  }

  function ensureIconGeneratorControls() {
    const appText = $("#appText");
    const parseButton = $("#parseApps");
    if (!appText || !parseButton) return;

    if (!$("#loadSampleApps")) {
      const button = document.createElement("button");
      button.id = "loadSampleApps";
      button.type = "button";
      button.textContent = "Load Sample App List";
      parseButton.insertAdjacentElement("afterend", button);
      button.addEventListener("click", loadSampleApps);
    }

    if (!$(".lcars-review-toolbar")) {
      const toolbar = document.createElement("section");
      toolbar.className = "lcars-review-toolbar";
      toolbar.innerHTML = `
        <label>
          Search apps
          <input id="lcarsAppSearch" type="search" placeholder="Discord, Spotify, com.openai...">
        </label>
        <label>
          Review filter
          <select id="lcarsReviewFilter">
            <option value="all">All apps</option>
            <option value="needs">Needs review: unknown or guessed</option>
            <option value="unknown">Unknown category only</option>
            <option value="guessed">Guessed only</option>
            <option value="saved">Saved local mappings</option>
            <option value="known">Known database mappings</option>
          </select>
        </label>
        <div class="lcars-review-actions">
          <button type="button" id="lcarsUnknownFirst">Sort unknown first</button>
          <button type="button" id="lcarsShowNeedsReview" class="secondary">Show only needs review</button>
          <button type="button" id="lcarsShowAll" class="secondary">Show all</button>
        </div>
        <div id="lcarsReviewCounts" class="lcars-review-counts">Parse an app list to review categories.</div>
      `;
      parseButton.closest("section, form, div")?.insertAdjacentElement("afterend", toolbar);

      $("#lcarsAppSearch")?.addEventListener("input", applyAppFilters);
      $("#lcarsReviewFilter")?.addEventListener("change", applyAppFilters);
      $("#lcarsUnknownFirst")?.addEventListener("click", sortUnknownFirst);
      $("#lcarsShowNeedsReview")?.addEventListener("click", () => {
        $("#lcarsReviewFilter").value = "needs";
        applyAppFilters();
      });
      $("#lcarsShowAll")?.addEventListener("click", () => {
        $("#lcarsReviewFilter").value = "all";
        $("#lcarsAppSearch").value = "";
        applyAppFilters();
      });
    }

    ensureMappingTools();
    ensureBuildReview();
    ensureBuildHistory();
  }

  function ensureMappingTools() {
    if ($(".lcars-mapping-tools")) return;

    const buildButton = $("#buildApk");
    const anchor = buildButton?.parentElement || $("#parseApps")?.closest("section, form, div");
    if (!anchor) return;

    const tools = document.createElement("section");
    tools.className = "lcars-mapping-tools";
    tools.innerHTML = `
      <strong>Saved category tools</strong>
      <div class="lcars-mapping-actions">
        <button type="button" id="lcarsExportMappings">Export saved mappings</button>
        <button type="button" id="lcarsImportMappings" class="secondary">Import saved mappings</button>
        <button type="button" id="lcarsClearMappings" class="secondary">Clear saved mappings</button>
      </div>
      <input id="lcarsImportMappingsFile" type="file" accept="application/json,.json" hidden>
    `;

    anchor.insertAdjacentElement("beforeend", tools);

    $("#lcarsExportMappings")?.addEventListener("click", exportMappings);
    $("#lcarsImportMappings")?.addEventListener("click", () => $("#lcarsImportMappingsFile")?.click());
    $("#lcarsImportMappingsFile")?.addEventListener("change", importMappings);
    $("#lcarsClearMappings")?.addEventListener("click", clearMappings);
  }

  function ensureBuildReview() {
    const buildButton = $("#buildApk");
    if (!buildButton) return;

    if (!$("#lcarsBuildReview")) {
      const panel = document.createElement("section");
      panel.id = "lcarsBuildReview";
      panel.className = "lcars-build-review warn";
      panel.innerHTML = `
        <strong>Build review:</strong>
        <span id="lcarsBuildReviewText">Parse an app list before building.</span>
        <label class="lcars-review-checkbox">
          <input id="lcarsCategoriesReviewed" type="checkbox">
          <span>I reviewed the app categories and they look good enough to build.</span>
        </label>
      `;
      buildButton.insertAdjacentElement("beforebegin", panel);
    }

    if (!buildButton.dataset.lcarsGateAttached) {
      buildButton.dataset.lcarsGateAttached = "1";
      buildButton.addEventListener("click", event => {
        const checkbox = $("#lcarsCategoriesReviewed");
        if (checkbox && !checkbox.checked) {
          event.preventDefault();
          event.stopImmediatePropagation();
          updateBuildReview();
          const text = $("#lcarsBuildReviewText");
          if (text) text.textContent = "Review the categories first, then check the review box to build.";
        }
      }, true);
    }
  }

  function ensureBuildHistory() {
    const buildButton = $("#buildApk");
    if (!buildButton || $("#lcarsBuildHistory")) return;

    const panel = document.createElement("section");
    panel.id = "lcarsBuildHistory";
    panel.className = "lcars-build-history";
    panel.hidden = true;
    panel.innerHTML = `
      <strong>Recent APK builds</strong>
      <div id="lcarsBuildHistoryList"></div>
    `;

    buildButton.insertAdjacentElement("afterend", panel);
    renderBuildHistory();
  }

  function applyAppFilters() {
    const { rows } = getAppRows();
    const query = ($("#lcarsAppSearch")?.value || "").toLowerCase().trim();
    const filter = $("#lcarsReviewFilter")?.value || "all";

    for (const row of rows) {
      const text = row.textContent.toLowerCase();
      const cat = rowCategory(row);
      const source = rowSource(row);

      let show = true;

      if (query && !text.includes(query)) show = false;

      if (filter === "needs") show = show && rowNeedsReview(row);
      if (filter === "unknown") show = show && cat.includes("unknown");
      if (filter === "guessed") show = show && (source.includes("guess") || source.includes("guessed"));
      if (filter === "saved") show = show && source.includes("saved");
      if (filter === "known") show = show && source.includes("known");

      row.classList.toggle("lcars-hidden-by-filter", !show);
    }

    updateReviewCounts();
    updateBuildReview();
  }

  function sortUnknownFirst() {
    const { table, rows } = getAppRows();
    const tbody = $("tbody", table);
    if (!tbody) return;

    const sorted = [...rows].sort((a, b) => {
      const ar = rowNeedsReview(a) ? 0 : 1;
      const br = rowNeedsReview(b) ? 0 : 1;
      if (ar !== br) return ar - br;
      return a.textContent.localeCompare(b.textContent);
    });

    for (const row of sorted) tbody.appendChild(row);
    applyAppFilters();
  }

  function updateReviewCounts() {
    const counts = $("#lcarsReviewCounts");
    if (!counts) return;

    const s = reviewStats();
    counts.textContent = `${s.total} apps. ${s.visible} shown. ${s.unknown} unknown. ${s.guessed} guessed. ${s.saved} saved. ${s.known} known.`;
  }

  function updateBuildReview() {
    const panel = $("#lcarsBuildReview");
    const text = $("#lcarsBuildReviewText");
    if (!panel || !text) return;

    const s = reviewStats();

    if (!s.total) {
      panel.classList.remove("ready");
      panel.classList.add("warn");
      text.textContent = "Parse an app list before building.";
      return;
    }

    const needs = s.unknown + s.guessed;
    panel.classList.toggle("ready", needs === 0);
    panel.classList.toggle("warn", needs > 0);

    if (needs > 0) {
      text.textContent = `${s.total} apps ready, but ${needs} may need review (${s.unknown} unknown, ${s.guessed} guessed).`;
    } else {
      text.textContent = `${s.total} apps ready. No unknown or guessed categories detected.`;
    }
  }

  async function loadSampleApps() {
    const appText = $("#appText");
    const parseButton = $("#parseApps");
    if (!appText) return;

    try {
      const response = await fetch(SAMPLE_URL);
      appText.value = await response.text();
      parseButton?.click();
    } catch {
      appText.value = "com.discord/com.discord.main.MainDefault\ncom.openai.chatgpt/com.openai.chatgpt.MainActivity\ncom.spotify.music/com.spotify.music.MainActivity";
      parseButton?.click();
    }
  }

  function exportMappings() {
    const data = localStorage.getItem(USER_MAPPINGS_KEY) || "{}";
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "lcars-saved-category-mappings.json";
    document.body.appendChild(a);
    a.click();
    a.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function importMappings(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      JSON.parse(text);
      localStorage.setItem(USER_MAPPINGS_KEY, text);
      alert("Saved mappings imported. Re-parse your app list to apply them.");
    } catch {
      alert("Could not import mappings. The file was not valid JSON.");
    } finally {
      event.target.value = "";
    }
  }

  function clearMappings() {
    if (!confirm("Clear saved local app category mappings in this browser?")) return;
    localStorage.removeItem(USER_MAPPINGS_KEY);
    alert("Saved mappings cleared. Re-parse your app list to see fresh guesses.");
  }

  function loadBuildHistory() {
    try {
      return JSON.parse(localStorage.getItem(BUILD_HISTORY_KEY) || "[]");
    } catch {
      return [];
    }
  }

  function saveBuildHistory(items) {
    localStorage.setItem(BUILD_HISTORY_KEY, JSON.stringify(items.slice(0, 8)));
  }

  function addBuildHistory(item) {
    const items = loadBuildHistory().filter(existing => existing.status_url !== item.status_url);
    items.unshift(item);
    saveBuildHistory(items);
    renderBuildHistory();
  }

  function updateBuildHistory(statusUrl, patch) {
    if (!statusUrl) return;
    const items = loadBuildHistory();
    const idx = items.findIndex(item => item.status_url === statusUrl);
    if (idx < 0) return;
    items[idx] = { ...items[idx], ...patch };
    saveBuildHistory(items);
    renderBuildHistory();
  }

  function renderBuildHistory() {
    const panel = $("#lcarsBuildHistory");
    const list = $("#lcarsBuildHistoryList");
    if (!panel || !list) return;

    const items = loadBuildHistory();
    panel.hidden = items.length === 0;
    list.innerHTML = "";

    for (const item of items.slice(0, 5)) {
      const div = document.createElement("div");
      div.className = "lcars-history-item";
      const date = item.created_at ? new Date(item.created_at).toLocaleString() : "unknown time";
      const status = item.status || "queued";
      const count = item.app_count ? `${item.app_count} apps` : "unknown app count";

      div.innerHTML = `
        <div>${escapeHtml(status)} — ${escapeHtml(count)}</div>
        <small>${escapeHtml(date)}</small>
        ${item.download_url ? `<a href="${escapeHtml(item.download_url)}">Download APK</a>` : ""}
      `;
      list.appendChild(div);
    }
  }

  function installFetchHistoryWatcher() {
    if (window.__lcarsFetchHistoryWatcher) return;
    window.__lcarsFetchHistoryWatcher = true;

    const originalFetch = window.fetch.bind(window);

    window.fetch = async (...args) => {
      const response = await originalFetch(...args);

      try {
        const url = typeof args[0] === "string" ? args[0] : args[0]?.url || "";
        const clone = response.clone();
        const data = await clone.json();

        if (data && data.status_url) {
          addBuildHistory({
            job_id: data.job_id || "",
            status_url: data.status_url,
            status: data.status || "queued",
            app_count: countCurrentApps(),
            created_at: new Date().toISOString()
          });
        }

        if (data && (data.download_url || data.status || data.error)) {
          updateBuildHistory(url, {
            status: data.status || (data.error ? "failed" : "done"),
            download_url: data.download_url || undefined,
            error: data.error || data.message || undefined,
            completed_at: data.download_url || data.error ? new Date().toISOString() : undefined
          });
        }
      } catch {
      }

      return response;
    };
  }

  function countCurrentApps() {
    const { rows } = getAppRows();
    return rows.length;
  }

  function observeIconTable() {
    if (window.__lcarsIconTableHooksInstalled) return;
    window.__lcarsIconTableHooksInstalled = true;

    const updateSoon = () => {
      for (const delay of [50, 250, 800]) {
        setTimeout(() => {
          ensureIconGeneratorControls();
          applyAppFilters();
          renderBuildHistory();
        }, delay);
      }
    };

    $("#parseApps")?.addEventListener("click", updateSoon);
    $("#loadSampleApps")?.addEventListener("click", updateSoon);

    document.addEventListener("change", event => {
      const target = event.target;
      if (target && target.matches && target.matches('input[type="file"]')) {
        updateSoon();
      }
    });

    updateSoon();
  }


  function init() {
    addStylesheet();
    addStartFlow();
    copyButtonsForCodeBlocks();
    ensureIconGeneratorControls();
    installFetchHistoryWatcher();

    if ($("#appText") || $("#parseApps")) {
      observeIconTable();
      applyAppFilters();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
