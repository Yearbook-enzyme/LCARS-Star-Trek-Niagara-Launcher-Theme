# LCARS Niagara Theme maintenance

Maintenance notes for the LCARS Niagara Launcher Theme project.

## Project paths

Repo: `~/LCARS-Star-Trek-Niagara-Launcher-Theme`
GitHub Pages: `https://yearbook-enzyme.github.io/LCARS-Star-Trek-Niagara-Launcher-Theme/`
cPanel builder: `https://lcars-builder.machinations.space`

## Normal deploy flow

```bash
cd ~/LCARS-Star-Trek-Niagara-Launcher-Theme
git status --short
git add .
git commit -m "Describe change"
git push
```

## Check whether GitHub Pages has caught up

```bash
curl -fsSL "https://yearbook-enzyme.github.io/LCARS-Star-Trek-Niagara-Launcher-Theme/icon-generator.html?deploycheck=$(date +%s)" | grep -n "icon-generator.js\|style.css\|ui-polish"
```

## Update shared app-category mappings from submissions

```bash
cd ~/LCARS-Star-Trek-Niagara-Launcher-Theme
TOKEN="$(cat .secrets-local/cpanel-builder-callback-token.txt)"
curl -fsSL -H "Authorization: Bearer $TOKEN" "https://lcars-builder.machinations.space/export-contributions.php" -o /tmp/lcars-contributions.jsonl
wc -l /tmp/lcars-contributions.jsonl
REPORT="reports/app-category-import-$(date +%Y-%m-%d).md"
nix-shell -p nodejs_22 --run "node tools/import-contributions.js /tmp/lcars-contributions.jsonl --min-count=1 --report=$REPORT"
```

If the dry run looks sane:

```bash
REPORT="reports/app-category-import-$(date +%Y-%m-%d).md"
nix-shell -p nodejs_22 --run "node tools/import-contributions.js /tmp/lcars-contributions.jsonl --min-count=1 --write --report=$REPORT"
git diff --stat docs/data/app-categories.json "$REPORT"
git diff docs/data/app-categories.json "$REPORT" | less
git add docs/data/app-categories.json "$REPORT"
git commit -m "Import contributed app category mappings"
git push
```

Do not use `--include-package-only` unless you intentionally trust package-only submissions.

## Update cPanel builder backend

Use this when PHP files in `server/cpanel-builder/` change.

```bash
cd ~/LCARS-Star-Trek-Niagara-Launcher-Theme
rm -f /tmp/lcars-builder-cpanel.zip
nix-shell -p zip --run 'cd server/cpanel-builder && zip -r /tmp/lcars-builder-cpanel.zip . -x config.php "jobs/*"'
ls -lh /tmp/lcars-builder-cpanel.zip
```

Upload and extract the ZIP into `/home/machinat/lcars-builder.machinations.space`. Keep the existing remote `config.php`.

## Cleanup old build jobs/APKs

```bash
cd ~/LCARS-Star-Trek-Niagara-Launcher-Theme
TOKEN="$(cat .secrets-local/cpanel-builder-callback-token.txt)"
curl -fsSL -H "Authorization: Bearer $TOKEN" "https://lcars-builder.machinations.space/cleanup.php?days=7&dry_run=1"
curl -fsSL -H "Authorization: Bearer $TOKEN" "https://lcars-builder.machinations.space/cleanup.php?days=7"
```

## Release tag

```bash
cd ~/LCARS-Star-Trek-Niagara-Launcher-Theme
git checkout main
git pull
git status --short
git tag -a v0.1-mvp -m "LCARS Niagara Theme MVP"
git push origin v0.1-mvp
```
