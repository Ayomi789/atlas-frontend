// Thin client around the Atlas Express API.
// Every backend response follows { success, message?, data? }.

const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000';

const TOKEN_KEY = 'atlas_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data?: T;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);

  const isFormData = options.body instanceof FormData;
  if (!isFormData) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  } catch {
    throw new ApiError(
      'Could not reach the server. Is the backend running?',
      0
    );
  }

  let body: ApiEnvelope<T> | null = null;
  try {
    body = await res.json();
  } catch {
    // no JSON body (e.g. 204)
  }

  if (!res.ok || !body?.success) {
    throw new ApiError(body?.message || `Request failed (${res.status})`, res.status);
  }

  return body.data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: body !== undefined ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  upload: <T>(path: string, file: File, fieldName = 'file') => {
    const form = new FormData();
    form.append(fieldName, file);
    return request<T>(path, { method: 'POST', body: form });
  },
};
