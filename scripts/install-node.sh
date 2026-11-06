#!/usr/bin/env bash
# The spine's toolchain: Node pinned to the plan's exact version, installed into .toolchain/
# (gitignored). spine.py runs every step with this node first on PATH.
set -euo pipefail
NODE_VERSION=26.13.0
cd "$(dirname "$0")/.."
dest=".toolchain/node-v$NODE_VERSION"
if [ -x "$dest/bin/node" ]; then echo "node $NODE_VERSION already in $dest"; exit 0; fi
case "$(uname -s)-$(uname -m)" in
  Linux-x86_64) plat=linux-x64 ;;
  Linux-aarch64) plat=linux-arm64 ;;
  Darwin-arm64) plat=darwin-arm64 ;;
  Darwin-x86_64) plat=darwin-x64 ;;
  *) echo "unsupported platform $(uname -sm)" >&2; exit 1 ;;
esac
mkdir -p .toolchain
url="https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-$plat.tar.xz"
echo "fetching $url"
curl -fsSL "$url" | tar -xJ -C .toolchain
mv ".toolchain/node-v$NODE_VERSION-$plat" "$dest"
"$dest/bin/node" --version
