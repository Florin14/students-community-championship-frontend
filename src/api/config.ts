import axios from "axios";

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

interface ApiAuthHandlers {
  getAccessToken: () => string | null;
  onUnauthorized: () => void;
}

export const setupAuthInterceptors = ({
  getAccessToken,
  onUnauthorized,
}: ApiAuthHandlers) => {
  api.interceptors.request.use((config) => {
    if (config.url === "/auth/login") {
      return config;
    }
    const accessToken = getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      if (
        axios.isAxiosError(error) &&
        error.response?.status === 401 &&
        error.config?.url !== "/auth/login"
      ) {
        const accessToken = getAccessToken();
        // A late response from an old session must not log out a new session.
        if (
          accessToken &&
          error.config?.headers.get("Authorization") === `Bearer ${accessToken}`
        ) {
          onUnauthorized();
        }
      }
      return Promise.reject(error);
    }
  );
};

export default api;
