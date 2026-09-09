import axios from "axios";

import { AUTH_STORAGE_KEY } from "../utils/storageKeys";

const envUrl = (import.meta.env?.VITE_API_URL as string | undefined)?.trim();
const baseURL = envUrl && envUrl.length > 0 ? envUrl : "http://localhost:8000/";

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
