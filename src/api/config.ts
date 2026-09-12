import axios from "axios";

import { AUTH_STORAGE_KEY } from "../utils/storageKeys";

// Resolution order, most specific first:
//   1. runtime-config.js, written by the container at start-up - this is what
//      lets a single image be deployed to every environment.
//   2. VITE_API_URL, inlined at build time - `npm run dev` and static hosts.
//   3. the local backend.
const runtimeUrl = window.__SCC_CONFIG__?.API_URL?.trim();
const envUrl = (import.meta.env?.VITE_API_URL as string | undefined)?.trim();
const baseURL =
  (runtimeUrl && runtimeUrl.length > 0 ? runtimeUrl : undefined) ??
  (envUrl && envUrl.length > 0 ? envUrl : undefined) ??
  "http://localhost:8000/";

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (config.url?.includes("/auth/login")) {
    return config;
  }
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { accessToken?: string };
      if (parsed.accessToken) {
        config.headers.Authorization = `Bearer ${parsed.accessToken}`;
      }
    }
  } catch {
    // storage unavailable - request goes out unauthenticated
  }
  return config;
});

export default api;
