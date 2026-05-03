import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiError {
  statusCode: number;
  message: string[];
  timestamp: string;
  path: string;
}

export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly messages: string[],
    public readonly path?: string
  ) {
    super(messages[0] ?? "Unknown error");
    this.name = "HttpError";
  }

  get isUnauthorized() {
    return this.statusCode === 401;
  }
  get isForbidden() {
    return this.statusCode === 403;
  }
  get isNotFound() {
    return this.statusCode === 404;
  }
  get isConflict() {
    return this.statusCode === 409;
  }
  get isServerError() {
    return this.statusCode >= 500;
  }
}

// ─── Token helpers ─────────────────────────────────────────────────────────────

export const tokenStorage = {
  get: () => localStorage.getItem("access_token"),
  set: (token: string) => localStorage.setItem("access_token", token),
  clear: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("auth_user");
  },
};

// ─── Factory ───────────────────────────────────────────────────────────────────

function createHttpClient(): AxiosInstance {
  const BASE_URL =
    (import.meta as any).env?.VITE_API_URL ?? "http://localhost:3000/api/v1";

  const client = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    timeout: 15_000,
    headers: { "Content-Type": "application/json" },
  });

  // ── Request: inject JWT ────────────────────────────────────────────────────
  client.interceptors.request.use((config) => {
    const token = tokenStorage.get();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // ── Response: normalise errors ────────────────────────────────────────────
  client.interceptors.response.use(
    (res) => res,
    (err: AxiosError<ApiError>) => {
      if (err.response) {
        const { status, data } = err.response;

        // 401 → clear session and redirect to login
        if (status === 401) {
          tokenStorage.clear();
          window.dispatchEvent(new CustomEvent("auth:expired"));
        }

        const messages: string[] = Array.isArray(data?.message)
          ? data.message
          : [data?.message ?? err.message ?? "Request failed"];

        throw new HttpError(status, messages, data?.path);
      }

      if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
        throw new HttpError(408, ["Request timed out. Please try again."]);
      }

      if (!err.response) {
        throw new HttpError(0, ["Network error. Check your connection."]);
      }

      throw err;
    }
  );

  return client;
}

export const httpClient = createHttpClient();

// ─── Utility: cancellable request ─────────────────────────────────────────────

export function withAbortController<T>(
  fn: (signal: AbortSignal) => Promise<T>
): { promise: Promise<T>; cancel: () => void } {
  const controller = new AbortController();
  return {
    promise: fn(controller.signal),
    cancel: () => controller.abort(),
  };
}

// ─── Generic typed GET/POST/PATCH/DELETE helpers ──────────────────────────────

export async function get<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const { data } = await httpClient.get<T>(url, config);
  return data;
}

export async function post<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const { data } = await httpClient.post<T>(url, body, config);
  return data;
}

export async function patch<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const { data } = await httpClient.patch<T>(url, body, config);
  return data;
}

export async function del<T = void>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const { data } = await httpClient.delete<T>(url, config);
  return data;
}
