// Default runtime configuration, used when the app runs outside a container
// (`npm run dev`, `npm run preview`, a static host like Vercel). The container
// overwrites this file at start-up - see docker/40-runtime-config.sh.
//
// Empty on purpose: with no API_URL the app falls back to VITE_API_URL from the
// build, and then to http://localhost:8000/.
window.__SCC_CONFIG__ = {};
