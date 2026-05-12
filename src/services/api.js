import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ── Session helpers ──────────────────────────────────────────────────────────

export const getSession = () => {
  try {
    return JSON.parse(localStorage.getItem("nexo_session"));
  } catch {
    return null;
  }
};

export const setSession = (data) => {
  localStorage.setItem("nexo_session", JSON.stringify(data));
};

export const clearSession = () => {
  localStorage.removeItem("nexo_session");
  localStorage.removeItem("nexo_products_cache");
  localStorage.removeItem("nexo_vehicles_cache");
};

export const pingService = async (serviceName) => {
  try {
    const { data } = await api.get(`/api/v1/ping/${serviceName}`, {
      timeout: 4000,
    });
    return { ok: data?.status === "UP", data };
  } catch (err) {
    return { ok: false, error: err };
  }
};

export const logout = async () => {
  const session = getSession();
  try {
    if (session?.refreshToken) {
      await api.post("/auth/logout", { refreshToken: session.refreshToken });
    }
  } finally {
    clearSession();
    window.location.href = "/login";
  }
};

// ── Request interceptor: attach Bearer token ─────────────────────────────────

api.interceptors.request.use((config) => {
  const session = getSession();
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
});

// ── Response interceptor: auto-refresh on 401 ───────────────────────────────

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token),
  );
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const orig = error.config;

    if (
      error.response?.status === 401 &&
      !orig._retry &&
      !orig.url?.includes("/auth/login")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) =>
          failedQueue.push({ resolve, reject }),
        ).then((token) => {
          orig.headers.Authorization = `Bearer ${token}`;
          return api(orig);
        });
      }

      orig._retry = true;
      isRefreshing = true;

      const session = getSession();
      if (!session?.refreshToken) {
        clearSession();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken: session.refreshToken,
        });
        setSession({
          ...session,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        });
        processQueue(null, data.accessToken);
        orig.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(orig);
      } catch (e) {
        processQueue(e, null);
        clearSession();
        window.location.href = "/login";
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// ── Paginated fetch helper (Spring Boot Page<T>) ─────────────────────────────

export const PAGE_SIZE = 20;

export const fetchPage = async (
  url,
  { page = 0, size = PAGE_SIZE, params = {}, signal } = {},
) => {
  const { data } = await api.get(url, {
    params: { ...params, page, size },
    signal,
  });

  if (data && Array.isArray(data.content)) {
    return {
      items: data.content,
      page: data.number ?? page,
      last: data.last ?? true,
      totalElements: data.totalElements ?? data.content.length,
      totalPages: data.totalPages ?? 1,
    };
  }

  const arr = Array.isArray(data) ? data : [];
  return {
    items: arr,
    page,
    last: true,
    totalElements: arr.length,
    totalPages: 1,
  };
};

export default api;
