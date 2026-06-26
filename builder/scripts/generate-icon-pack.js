const fs = require("fs");
const path = require("path");

const jobPath = process.argv[2] || "builder/input/sample-job.json";
const projectDir = process.argv[3] || "builder/android-template";

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function mkdirp(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function write(file, content) {
  mkdirp(path.dirname(file));
  fs.writeFileSync(file, content);
}

function escapeXml(text) {
  return String(text || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function slug(text) {
  return String(text || "app")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "_")
    .replace(/^_+|_+$/g, "") || "app";
}

function androidResourceName(app, used) {
  let base = slug(app.package || app.label)
    .replace(/[.-]+/g, "_")
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/^_+|_+$/g, "");

  if (!base) base = "app";
  if (!base.startsWith("ic_")) base = `ic_${base}`;
  if (!/^[a-z_]/.test(base)) base = `ic_${base}`;

  let name = base;
  let n = 2;
  while (used.has(name)) {
    name = `${base}_${n}`;
    n += 1;
  }
  used.add(name);
  return name;
}

function normalizeHex(color, fallback = "#d62b18") {
  const c = String(color || "").trim();
  if (/^#[0-9a-fA-F]{6}$/.test(c)) return c.toLowerCase();
  return fallback;
}

function componentFor(app) {
  function expandComponent(raw, fallbackPackage) {
    let c = String(raw || "").trim();

    if (c.startsWith("ComponentInfo{") && c.endsWith("}")) {
      c = c.slice("ComponentInfo{".length, -1);
    }

    if (c.includes("/")) {
      const parts = c.split("/");
      const pkg = parts[0];
      let activity = parts.slice(1).join("/");
      if (activity.startsWith(".")) activity = pkg + activity;
      return `ComponentInfo{${pkg}/${activity}}`;
    }

    if (fallbackPackage && c.startsWith(".")) {
      return `ComponentInfo{${fallbackPackage}/${fallbackPackage}${c}}`;
    }

    if (fallbackPackage && c) {
      return `ComponentInfo{${fallbackPackage}/${c}}`;
    }

    return c;
  }

  if (app.component) return expandComponent(app.component, app.package);
  if (app.package && app.activity) return expandComponent(app.activity, app.package);
  if (app.package) return `ComponentInfo{${app.package}/${app.package}}`;
  return "";
}

function roundedSquareVectorXml(color) {
  const fill = normalizeHex(color);

  return `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="432dp"
    android:height="432dp"
    android:viewportWidth="432"
    android:viewportHeight="432">

    <path
        android:fillColor="${fill}"
        android:pathData="M120,48 L312,48 C351.8,48 384,80.2 384,120 L384,312 C384,351.8 351.8,384 312,384 L120,384 C80.2,384 48,351.8 48,312 L48,120 C48,80.2 80.2,48 120,48 Z" />

    <path
        android:fillColor="#ffffff"
        android:fillAlpha="0.12"
        android:pathData="M132,72 L300,72 C326.5,72 348,93.5 348,120 L348,146 L84,146 L84,120 C84,93.5 105.5,72 132,72 Z" />
</vector>
`;
}

function launcherIconXml() {
  return `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path android:fillColor="#000000" android:pathData="M0,0h108v108h-108z" />
    <path android:fillColor="#d62b18" android:pathData="M22,18h64c4.4,0 8,3.6 8,8v56c0,4.4 -3.6,8 -8,8h-64c-4.4,0 -8,-3.6 -8,-8v-56c0,-4.4 3.6,-8 8,-8z" />
    <path android:fillColor="#e8bd88" android:pathData="M28,30h34v9h-34zM28,48h52v9h-52zM28,66h42v9h-42z" />
</vector>
`;
}

function folderIconXml(color) {
  const fill = normalizeHex(color, "#d62b18");

  return `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="432dp"
    android:height="432dp"
    android:viewportWidth="432"
    android:viewportHeight="432">

    <path
        android:fillColor="#000000"
        android:pathData="M0,0h432v432h-432z" />

    <path
        android:fillColor="${fill}"
        android:pathData="M54,120 C54,94 75,78 101,78 L164,78 C176,78 187,84 194,94 L216,126 L331,126 C357,126 378,147 378,173 L378,307 C378,333 357,354 331,354 L101,354 C75,354 54,333 54,307 Z" />

    <path
        android:fillColor="#ffffff"
        android:fillAlpha="0.16"
        android:pathData="M84,156 L348,156 L348,188 L84,188 Z" />

    <path
        android:fillColor="#000000"
        android:fillAlpha="0.35"
        android:pathData="M84,222 L310,222 L310,244 L84,244 Z M84,266 L270,266 L270,288 L84,288 Z" />

    <path
        android:fillColor="#ffffff"
        android:fillAlpha="0.10"
        android:pathData="M101,96 L160,96 C170,96 179,101 184,109 L204,138 L78,138 L78,119 C78,106 88,96 101,96 Z" />
</vector>
`;
}

function appfilterXml(entries) {
  const items = entries
    .map(app => `    <item component="${escapeXml(app.component)}" drawable="${app.resName}" />`)
    .join("\n");

  return `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- Generated by LCARS Niagara Icon Builder. -->
    <!-- Package-only input uses best-effort component placeholders. -->
${items}
</resources>
`;
}

function drawableXml(entries) {
  const items = entries
    .map(app => `    <item drawable="${app.resName}" />`)
    .join("\n");

  return `<?xml version="1.0" encoding="utf-8"?>
<resources>
${items}
</resources>
`;
}

function themeResourcesXml(entries) {
  const items = entries
    .map(app => `        <item drawable="${app.resName}" name="${escapeXml(app.label)}" />`)
    .join("\n");

  return `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <category title="LCARS Icons">
${items}
    </category>
</resources>
`;
}

const job = readJson(jobPath);
const appName = job.iconPackName || "LCARS Niagara Icons";
const used = new Set();

const entries = (job.apps || [])
  .filter(app => app && app.package)
  .map(app => {
    const resName = androidResourceName(app, used);
    return {
      package: app.package,
      activity: app.activity || "",
      component: componentFor(app),
      label: app.label || app.package,
      category: app.category || "unknown",
      color: normalizeHex(app.color),
      resName
    };
  });

if (!entries.length) {
  throw new Error("No package-based apps found in job JSON.");
}

const drawableDir = path.join(projectDir, "app/src/main/res/drawable");
const xmlDir = path.join(projectDir, "app/src/main/res/xml");
const assetsDir = path.join(projectDir, "app/src/main/assets");
const valuesDir = path.join(projectDir, "app/src/main/res/values");

mkdirp(drawableDir);
mkdirp(xmlDir);
mkdirp(assetsDir);
mkdirp(valuesDir);

write(path.join(drawableDir, "ic_launcher.xml"), launcherIconXml());

const folderDrawableNames = [
  "ic_folder",
  "ic_folder_lcars",
  "folder",
  "folder_icon",
  "ic_launcher_folder"
];

for (const name of folderDrawableNames) {
  write(path.join(drawableDir, `${name}.xml`), folderIconXml(job.folderColor || job.accentColor || "#d62b18"));
}

for (const app of entries) {
  write(path.join(drawableDir, `${app.resName}.xml`), roundedSquareVectorXml(app.color));
}

const specialEntries = folderDrawableNames.map(name => ({
  resName: name,
  label: name === "ic_folder_lcars" ? "LCARS Folder" : "Folder",
  component: "",
  category: "special",
  color: normalizeHex(job.folderColor || job.accentColor || "#d62b18")
}));

const drawableEntries = [...specialEntries, ...entries];

write(path.join(xmlDir, "appfilter.xml"), appfilterXml(entries));
write(path.join(xmlDir, "drawable.xml"), drawableXml(drawableEntries));
write(path.join(xmlDir, "icon_pack.xml"), drawableXml(drawableEntries));

write(path.join(assetsDir, "appfilter.xml"), appfilterXml(entries));
write(path.join(assetsDir, "drawable.xml"), drawableXml(drawableEntries));
write(path.join(assetsDir, "theme_resources.xml"), themeResourcesXml(drawableEntries));
write(path.join(assetsDir, "icon-manifest.json"), JSON.stringify({
  special: specialEntries,
  apps: entries
}, null, 2));

write(path.join(valuesDir, "strings.xml"), `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">${escapeXml(appName)}</string>
</resources>
`);

console.log(`Generated ${entries.length} icon resources for ${appName}.`);
