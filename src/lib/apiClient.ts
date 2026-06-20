/**
 * src/lib/apiClient.ts
 *
 * Professional-grade Axios instance for all CRM API calls.
 *
 * Features
 * ─────────
 * • Base URL pulled from NEXT_PUBLIC_API_URL env variable
 * • Request interceptor — attaches Bearer JWT + unique X-Request-ID trace header
 * • Token refresh — on 401, queues pending requests and silently refreshes token
 *   then replays all queued requests; only redirects to /login when refresh fails
 * • Response interceptor — structured ApiError for 401 / 403 / 422 / 429 / 5xx
 * • AbortController helper — cancel any in-flight request
 * • Typed helper wrappers: get, post, put, patch, del
 */

import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
  isAxiosError,
} from 'axios';

// ─── Constants ────────────────────────────────────────────────────────────────

export const TOKEN_KEY         = 'crm_access_token';
export const REFRESH_TOKEN_KEY = 'crm_refresh_token';
const COOKIE_NAME              = 'crm_token';

// ─── Token helpers ────────────────────────────────────────────────────────────

function getLocalToken(): string | null {
  if (typeof window === 'undefined') return null;
  try   { return localStorage.getItem(TOKEN_KEY);  }
  catch { return null; }
}

function getCookieToken(): string | null {
  if (typeof document === 'undefined') return null;
  try {
    const match = document.cookie
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${COOKIE_NAME}=`));
    return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : null;
  } catch { return null; }
}

function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  try   { return localStorage.getItem(REFRESH_TOKEN_KEY); }
  catch { return null; }
}

/**
 * Resolve the best available access token.
 * Priority: localStorage → HttpOnly-safe cookie → null
 */
export function resolveToken(): string | null {
  return getLocalToken() ?? getCookieToken();
}

/** Persist a token pair after a successful login / refresh. */
export function persistTokens(access: string, refresh?: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
}

/** Wipe all locally stored credentials (called on logout or failed refresh). */
export function clearTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  document.cookie = `${COOKIE_NAME}=; Max-Age=0; path=/`;
}

// ─── Structured error class ───────────────────────────────────────────────────

export interface ApiErrorPayload {
  status:   number;
  code:     string;
  message:  string;
  errors?:  Record<string, string[]>;
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly code:   string;
  public readonly errors?: Record<string, string[]>;

  constructor(payload: ApiErrorPayload) {
    super(payload.message);
    this.name   = 'ApiError';
    this.status = payload.status;
    this.code   = payload.code;
    this.errors = payload.errors;
  }

  static isNetworkError(err: unknown): boolean {
    return isAxiosError(err) && !err.response;
  }

  static is(err: unknown): err is ApiError {
    return err instanceof ApiError;
  }
}

// Suppress Next.js Turbopack dev-overlay for known handled ApiErrors.
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const r = event.reason;
    if (
      r instanceof ApiError ||
      r?.name === 'ApiError' ||
      (typeof r === 'object' && r?.code === 'NETWORK_ERROR')
    ) {
      event.preventDefault();
      console.warn('[ApiClient] Handled rejection (dev-overlay suppressed):', r?.message ?? r);
    }
  });
}

// ─── Redirect helper ──────────────────────────────────────────────────────────

let _isRedirecting = false;

function redirectToLogin(reason?: string): void {
  if (typeof window === 'undefined' || _isRedirecting) return;
  _isRedirecting = true;
  clearTokens();
  const url = new URL('/login', window.location.origin);
  if (reason) url.searchParams.set('reason', reason);
  const currentPath = window.location.pathname + window.location.search;
  if (currentPath !== '/' && currentPath !== '/login') {
    url.searchParams.set('returnTo', currentPath);
  }
  window.location.replace(url.toString());
}

// ─── Token Refresh Queue ──────────────────────────────────────────────────────

let _isRefreshing = false;
let _refreshSubscribers: Array<(token: string | null) => void> = [];

/**
 * Subscribe to the refresh event.
 * All 401'd requests are queued here until a new token is available.
 */
function subscribeTokenRefresh(callback: (token: string | null) => void): void {
  _refreshSubscribers.push(callback);
}

/**
 * Notify all queued requests with the new token (or null on failure).
 */
function flushRefreshSubscribers(token: string | null): void {
  _refreshSubscribers.forEach((cb) => cb(token));
  _refreshSubscribers = [];
}

/**
 * Attempt to refresh the access token using the stored refresh token.
 * Returns the new access token string, or null if it fails.
 */
async function attemptTokenRefresh(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await axios.post<{ token: string; refreshToken?: string }>(
      `${process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:5000/api'}/auth/refresh`,
      { refreshToken },
      { headers: { 'Content-Type': 'application/json' }, timeout: 10_000 },
    );
    const { token, refreshToken: newRefresh } = res.data;
    persistTokens(token, newRefresh);
    return token;
  } catch {
    return null;
  }
}

// ─── Axios instance ───────────────────────────────────────────────────────────

const apiClient: AxiosInstance = axios.create({
  baseURL:         process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:5000/api',
  timeout:         15_000,
  headers: {
    'Content-Type': 'application/json',
    Accept:         'application/json',
  },
  withCredentials: true,
});

// ─── Request interceptor ──────────────────────────────────────────────────────

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = resolveToken();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Attach unique request trace ID (visible in backend logs)
    config.headers['X-Request-ID'] =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    return config;
  },
  (error: unknown) => Promise.reject(error),
);

// ─── Response interceptor ─────────────────────────────────────────────────────

apiClient.interceptors.response.use(
  // ── Happy path ──
  (response: AxiosResponse) => response,

  // ── Error path ──
  async (error: unknown) => {
    if (!isAxiosError(error)) {
      return Promise.reject(error);
    }

    const { response, request, config: originalConfig } = error;

    // ── No response: network or timeout ──
    if (!response) {
      if (error.code === 'ECONNABORTED') {
        return Promise.reject(new ApiError({
          status:  0,
          code:    'REQUEST_TIMEOUT',
          message: 'The request timed out. Please try again.',
        }));
      }
      return Promise.reject(new ApiError({
        status:  0,
        code:    'NETWORK_ERROR',
        message: 'Unable to reach the server. Please check your connection.',
      }));
    }

    const { status, data } = response as AxiosResponse<{
      message?: string;
      code?:    string;
      errors?:  Record<string, string[]>;
    }>;

    // ── 401 Unauthorized — attempt silent token refresh ──
    if (status === 401) {
      const url: string = (request as XMLHttpRequest)?.responseURL ?? '';
      const isAuthEndpoint =
        url.includes('/auth/login') ||
        url.includes('/auth/refresh');

      // Don't try to refresh for auth endpoints themselves
      if (isAuthEndpoint) {
        return Promise.reject(new ApiError({
          status:  401,
          code:    data?.code   ?? 'UNAUTHORIZED',
          message: data?.message ?? 'Invalid credentials.',
        }));
      }

      // If a refresh is already in progress, queue this request
      if (_isRefreshing) {
        return new Promise<AxiosResponse>((resolve, reject) => {
          subscribeTokenRefresh((newToken) => {
            if (!newToken) {
              reject(new ApiError({
                status:  401,
                code:    'SESSION_EXPIRED',
                message: 'Your session has expired. Please log in again.',
              }));
              return;
            }
            // Replay the original request with the new token
            const retryConfig: InternalAxiosRequestConfig = {
              ...(originalConfig as InternalAxiosRequestConfig),
              headers: {
                ...(originalConfig as InternalAxiosRequestConfig).headers,
                Authorization: `Bearer ${newToken}`,
              },
            };
            resolve(apiClient(retryConfig));
          });
        });
      }

      // First 401 — start the refresh flow
      _isRefreshing = true;
      const newToken = await attemptTokenRefresh();
      _isRefreshing = false;

      if (newToken) {
        flushRefreshSubscribers(newToken);
        // Replay the original request with new token
        const retryConfig: InternalAxiosRequestConfig = {
          ...(originalConfig as InternalAxiosRequestConfig),
          headers: {
            ...(originalConfig as InternalAxiosRequestConfig).headers,
            Authorization: `Bearer ${newToken}`,
          },
        };
        return apiClient(retryConfig);
      } else {
        // Refresh failed — clear session and go to login
        flushRefreshSubscribers(null);
        redirectToLogin('session_expired');
        return Promise.reject(new ApiError({
          status:  401,
          code:    'SESSION_EXPIRED',
          message: 'Your session has expired. Please log in again.',
        }));
      }
    }

    // ── 403 Forbidden ──
    if (status === 403) {
      return Promise.reject(new ApiError({
        status:  403,
        code:    data?.code   ?? 'FORBIDDEN',
        message: data?.message ?? "You don't have permission to perform this action.",
      }));
    }

    // ── 422 Validation error ──
    if (status === 422) {
      return Promise.reject(new ApiError({
        status:  422,
        code:    data?.code   ?? 'VALIDATION_ERROR',
        message: data?.message ?? 'Please correct the highlighted fields.',
        errors:  data?.errors,
      }));
    }

    // ── 429 Rate limited ──
    if (status === 429) {
      const retryAfter = response.headers['retry-after'];
      return Promise.reject(new ApiError({
        status:  429,
        code:    'RATE_LIMITED',
        message: retryAfter
          ? `Too many requests. Please wait ${retryAfter}s before retrying.`
          : 'Too many requests. Please slow down.',
      }));
    }

    // ── 5xx Server errors ──
    if (status >= 500) {
      return Promise.reject(new ApiError({
        status,
        code:    data?.code   ?? 'SERVER_ERROR',
        message: data?.message ?? 'An unexpected server error occurred. Please try again later.',
      }));
    }

    // ── All other errors ──
    return Promise.reject(new ApiError({
      status,
      code:    data?.code   ?? 'API_ERROR',
      message: data?.message ?? `Request failed with status ${status}.`,
      errors:  data?.errors,
    }));
  },
);

// ─── Typed convenience wrappers ───────────────────────────────────────────────

export async function get<T>(
  url:     string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res = await apiClient.get<T>(url, config);
  return res.data;
}

export async function post<T>(
  url:     string,
  data?:   unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res = await apiClient.post<T>(url, data, config);
  return res.data;
}

export async function put<T>(
  url:     string,
  data?:   unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res = await apiClient.put<T>(url, data, config);
  return res.data;
}

export async function patch<T>(
  url:     string,
  data?:   unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res = await apiClient.patch<T>(url, data, config);
  return res.data;
}

export async function del<T>(
  url:     string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res = await apiClient.delete<T>(url, config);
  return res.data;
}

/**
 * Create a cancellable request config.
 * Usage:
 *   const { config, cancel } = makeCancellable();
 *   get('/leads', config);
 *   // later: cancel('Component unmounted');
 */
export function makeCancellable(): {
  config: { signal: AbortSignal };
  cancel: (reason?: string) => void;
} {
  const controller = new AbortController();
  return {
    config: { signal: controller.signal },
    cancel: (reason?: string) => controller.abort(reason),
  };
}

// ─── Default export ───────────────────────────────────────────────────────────

export default apiClient;
