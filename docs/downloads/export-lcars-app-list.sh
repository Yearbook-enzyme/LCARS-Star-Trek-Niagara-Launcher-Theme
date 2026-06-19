#!/usr/bin/env bash
set -euo pipefail

OUTPUT="${1:-lcars-launchable-components.txt}"
RAW="${OUTPUT%.txt}-raw-query.txt"
PACKAGES="${OUTPUT%.txt}-packages.txt"

if ! command -v adb >/dev/null 2>&1; then
  echo "adb was not found. Install Android platform-tools first."
  exit 1
fi

adb start-server >/dev/null

DEVICE_COUNT="$(adb devices | awk 'NR > 1 && $2 == "device" { count++ } END { print count + 0 }')"

if [ "$DEVICE_COUNT" -eq 0 ]; then
  echo "No authorized Android device found."
  echo "Connect your phone, enable USB debugging, and accept the authorization prompt."
  exit 1
fi

if [ "$DEVICE_COUNT" -gt 1 ]; then
  echo "More than one Android device is connected."
  echo "Disconnect extras or set ANDROID_SERIAL before running this script."
  adb devices
  exit 1
fi

adb shell cmd package query-activities \
  --brief \
  -a android.intent.action.MAIN \
  -c android.intent.category.LAUNCHER \
  | tr -d '\r' > "$RAW"

awk '
function trim(s) {
  gsub(/^[ \t]+|[ \t]+$/, "", s)
  return s
}

function normalize(c, parts, pkg, act) {
  gsub(/^component=/, "", c)
  gsub(/^ComponentInfo\{/, "", c)
  gsub(/\}$/, "", c)
  gsub(/[},]$/, "", c)

  split(c, parts, "/")
  pkg = parts[1]
  act = parts[2]

  if (pkg == "" || act == "") return ""

  if (act ~ /^\./) {
    act = pkg act
  }

  return pkg "/" act
}

{
  line = trim($0)

  if (line ~ /^[A-Za-z][A-Za-z0-9_]*(\.[A-Za-z0-9_]+)+\/[^[:space:]]+$/) {
    print normalize(line)
  } else if (match(line, /[A-Za-z][A-Za-z0-9_]*(\.[A-Za-z0-9_]+)+\/[^[:space:]}]+/)) {
    print normalize(substr(line, RSTART, RLENGTH))
  }
}
' "$RAW" | sort -u > "$OUTPUT"

cut -d/ -f1 "$OUTPUT" | sort -u > "$PACKAGES"

COUNT="$(wc -l < "$OUTPUT" | tr -d ' ')"

echo
echo "Created LCARS app list:"
echo "$OUTPUT"
echo
echo "Launcher components found: $COUNT"
echo
echo "Also created:"
echo "$PACKAGES"
echo "$RAW"
echo
echo "Preview:"
head -n 30 "$OUTPUT"
