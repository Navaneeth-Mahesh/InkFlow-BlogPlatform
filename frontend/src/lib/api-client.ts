const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

export interface ListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

interface ApiErrorBody {
  success: false;
  statusCode: number;
  message: string;
  errors?: Array<{ field?: string; message: string }>;
}

export class ApiClientError extends Error {
  statusCode: number;
  errors?: Array<{ field?: string; message: string }>;

  constructor(body: ApiErrorBody) {
    super(body.message);
    this.statusCode = body.statusCode;
    this.errors = body.errors;
  }
}

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) return null;
      const body = await res.json();
      accessToken = body.data.accessToken;
      return accessToken;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  skipAuthRetry?: boolean;
  isFormData?: boolean;
}

async function rawRequest(path: string, options: RequestOptions = {}) {
  const { body, isFormData, skipAuthRetry, headers, ...rest } = options;

  const finalHeaders: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(headers as Record<string, string>),
  };
  if (accessToken) finalHeaders.Authorization = `Bearer ${accessToken}`;

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    credentials: "include",
    body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
  });

  if (res.status === 401 && !skipAuthRetry) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return rawRequest(path, { ...options, skipAuthRetry: true });
    }
  }

  const text = await res.text();
  const json = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new ApiClientError(
      json ?? { success: false, statusCode: res.status, message: res.statusText }
    );
  }

  return json;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const json = await rawRequest(path, options);
  return json.data as T;
}

async function requestWithMeta<T>(
  path: string,
  options: RequestOptions = {}
): Promise<{ data: T; meta?: ListMeta }> {
  const json = await rawRequest(path, options);
  return { data: json.data, meta: json.meta };
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "DELETE" }),
  getWithMeta: <T>(path: string, options?: RequestOptions) =>
    requestWithMeta<T>(path, { ...options, method: "GET" }),
};

export { refreshAccessToken };
