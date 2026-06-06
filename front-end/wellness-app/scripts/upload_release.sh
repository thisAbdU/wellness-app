#!/usr/bin/env bash
# Simple helper to upload an APK to a GitHub Release using `gh`.
# Usage:
#   ./upload_release.sh v1.2.3 /path/to/app-release.apk

set -euo pipefail

if [ "$#" -ne 2 ]; then
  echo "Usage: $0 <tag> <apk-path>"
  exit 2
fi

TAG="$1"
APK_PATH="$2"

if ! command -v gh >/dev/null 2>&1; then
  echo "gh CLI not found. Install from https://github.com/cli/cli"
  exit 3
fi

REPO=$(git config --get remote.origin.url || true)
if [ -z "$REPO" ]; then
  echo "No git remote origin found. Run this script inside the repo with a remote set."
fi

# Create a release (if it already exists, `gh` will error; user can use `gh release upload` instead)
echo "Creating GitHub release $TAG (if it already exists, manually upload assets)"
gh release create "$TAG" "$APK_PATH" --title "$TAG" --notes "APK release $TAG"

echo "Uploaded $APK_PATH to release $TAG"
