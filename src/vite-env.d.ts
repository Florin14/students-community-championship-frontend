/// <reference types="vite/client" />

/**
 * Configuration injected at container start by docker/40-runtime-config.sh and
 * loaded from /runtime-config.js before the bundle. Every field is optional:
 * outside a container the file ships as an empty object.
 */
interface SccRuntimeConfig {
  API_URL?: string;
  ENV?: string;
  APP_VERSION?: string;
  GIT_SHA?: string;
}

interface Window {
  __SCC_CONFIG__?: SccRuntimeConfig;
}
