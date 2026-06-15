#!/usr/bin/env bash
set -euo pipefail

mkdir -p "$HOME/lcars-app-export"

cmd package list packages -3 \
  | sed 's/^package://' \
  | sort \
  > "$HOME/lcars-app-export/user-apps.txt"

echo "Exported to: $HOME/lcars-app-export/user-apps.txt"
echo "Upload that file to the LCARS Icon Generator."
