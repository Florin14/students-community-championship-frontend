#!/bin/sh
# Write the runtime configuration the app reads before it boots.
#
# The bundle is built once and deployed everywhere, so it cannot have the API
# host compiled into it - `VITE_API_URL` is inlined at build time and would pin
# the image to one environment. index.html loads /runtime-config.js first, and
# this script rewrites that file from the container's environment at every
# start, which is the same pattern the other platforms use.
set -eu

CONFIG_FILE=/usr/share/nginx/html/runtime-config.js

cat > "$CONFIG_FILE" <<EOF
// Generated at container start - do not edit, every restart overwrites it.
window.__SCC_CONFIG__ = {
  "API_URL": "${API_URL:-}",
  "ENV": "${ENV:-local}",
  "APP_VERSION": "${APP_VERSION:-dev}",
  "GIT_SHA": "${GIT_SHA:-dev}"
};
EOF

echo "[runtime-config] API_URL=${API_URL:-<empty>} ENV=${ENV:-local}"
