import fs from "node:fs";

const jobPath = process.argv[2] || "builder/work/job.json";
const job = JSON.parse(fs.readFileSync(jobPath, "utf8"));

function fail(message) {
  console.error(`APK job validation failed: ${message}`);
  process.exit(1);
}

if (!job || typeof job !== "object" || Array.isArray(job)) {
  fail("job JSON must be an object.");
}

if (!Array.isArray(job.apps)) {
  console.error("Top-level job keys:", Object.keys(job));
  fail("job.apps must be an array.");
}

if (!job.apps.length) {
  fail("job.apps is empty.");
}

const missingPackage = [];
for (let i = 0; i < job.apps.length; i += 1) {
  const app = job.apps[i];
  if (!app || typeof app !== "object" || typeof app.package !== "string" || !app.package.trim()) {
    missingPackage.push({
      index: i,
      keys: app && typeof app === "object" ? Object.keys(app) : [],
      type: typeof app
    });
  }
}

console.log(`APK job validation: ${job.apps.length} apps found.`);

if (missingPackage.length) {
  console.error("First invalid app entries, showing keys only for privacy:");
  console.error(JSON.stringify(missingPackage.slice(0, 10), null, 2));
  fail(`${missingPackage.length} app entries are missing package.`);
}

const withComponent = job.apps.filter(app => typeof app.component === "string" && app.component.includes("/")).length;
console.log(`APK job validation: ${withComponent} apps include launcher components.`);
