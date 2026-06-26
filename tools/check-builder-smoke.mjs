import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

const repoRoot = path.resolve(new URL("..", import.meta.url).pathname);
const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "lcars-builder-smoke-"));
const templateSrc = path.join(repoRoot, "builder/android-template");
const projectDir = path.join(tmpRoot, "android-template");
const jobPath = path.join(tmpRoot, "smoke-job.json");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function read(file) {
  return fs.readFileSync(file, "utf8");
}

const builderPackagePath = path.join(repoRoot, "builder/package.json");
assert(fs.existsSync(builderPackagePath), "builder/package.json is missing.");
const builderPackage = JSON.parse(read(builderPackagePath));
assert(
  builderPackage.type === "commonjs",
  'builder/package.json must contain { "type": "commonjs" } so builder/*.js files can use require().'
);

fs.cpSync(templateSrc, projectDir, { recursive: true });

const job = {
  iconPackName: "LCARS Smoke Test Icons",
  accentColor: "#d62b18",
  folderColor: "#d62b18",
  apps: [
    {
      label: "Discord",
      package: "com.discord",
      activity: "com.discord.main.MainDefault",
      component: "com.discord/com.discord.main.MainDefault",
      color: "#ff9500"
    },
    {
      label: "Settings",
      package: "com.android.settings",
      activity: "com.android.settings.Settings",
      color: "#0a84ff"
    }
  ]
};

fs.writeFileSync(jobPath, JSON.stringify(job, null, 2));

execFileSync(
  process.execPath,
  [
    path.join(repoRoot, "builder/scripts/generate-icon-pack.js"),
    jobPath,
    projectDir
  ],
  {
    cwd: repoRoot,
    stdio: "inherit"
  }
);

const appfilterPath = path.join(projectDir, "app/src/main/res/xml/appfilter.xml");
const drawablePath = path.join(projectDir, "app/src/main/res/xml/drawable.xml");
const appfilter = read(appfilterPath);
const drawable = read(drawablePath);

assert(
  appfilter.includes('ComponentInfo{com.discord/com.discord.main.MainDefault}'),
  "appfilter.xml did not include the full Discord launcher component."
);

assert(
  appfilter.includes('ComponentInfo{com.android.settings/com.android.settings.Settings}'),
  "appfilter.xml did not include the full Settings launcher component."
);

assert(
  !appfilter.includes('ComponentInfo{com.discord/com.discord}"'),
  "appfilter.xml contains package/package fallback for Discord; full component mapping broke."
);

for (const name of ["ic_folder", "ic_folder_lcars", "folder_icon", "ic_launcher_folder"]) {
  const drawableFile = path.join(projectDir, `app/src/main/res/drawable/${name}.xml`);
  assert(fs.existsSync(drawableFile), `Missing generated folder drawable: ${name}.xml`);
  assert(drawable.includes(`<item drawable="${name}" />`), `drawable.xml missing ${name}`);
}

console.log("Builder smoke test passed.");
