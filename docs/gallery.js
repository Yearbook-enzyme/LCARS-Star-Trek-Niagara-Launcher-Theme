async function loadGallery() {
  const res = await fetch(`gallery-data.json?t=${Date.now()}`);
  const data = await res.json();

  renderCards("wallpaperGrid", data.wallpapers, item => `
    <div class="card">
      <img src="${item.file}" alt="${item.title}">
      <div class="cardBody">
        <h3 class="cardTitle">${item.title}</h3>
        <div class="meta">
          <span class="tag">palette: ${item.palette}</span>
          <span class="tag">rhythm: ${item.rhythm}</span>
        </div>
        <a href="${item.file}" target="_blank" rel="noopener">Open full image</a>
      </div>
    </div>
  `);

  renderCards("iconGrid", data.icons, item => `
    <div class="card">
      <img src="${item.file}" alt="${item.title}">
      <div class="cardBody">
        <h3 class="cardTitle">${item.title}</h3>
        <div class="meta">
          <span class="tag">palette: ${item.palette}</span>
          <span class="tag">mode: ${item.mode}</span>
        </div>
        <a href="${item.file}" target="_blank" rel="noopener">Open full image</a>
      </div>
    </div>
  `);

  renderCards("fontGrid", data.fonts, item => `
    <div class="card">
      <img src="${item.file}" alt="${item.title}">
      <div class="cardBody">
        <h3 class="cardTitle">${item.title}</h3>
        <div class="meta">
          <span class="tag">font: ${item.font}</span>
        </div>
        <div style="color:#c9a66c; font-size:0.95rem; margin-bottom:12px;">${item.note}</div>
        <a href="${item.file}" target="_blank" rel="noopener">Open full image</a>
      </div>
    </div>
  `);
}

function renderCards(id, items, template) {
  const root = document.getElementById(id);
  root.innerHTML = items.map(template).join("");
}

loadGallery().catch(err => {
  console.error(err);
  document.body.insertAdjacentHTML(
    "beforeend",
    `<pre style="padding:24px;color:#ffb4a2;">${String(err)}</pre>`
  );
});
