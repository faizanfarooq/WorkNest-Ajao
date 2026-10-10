export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public fieldErrors: Record<string, string[]> = {},
  ) {
    super(message);
  }
}

// The access token lives only in memory; the refresh token is an httpOnly cookie the browser sends for us.
let accessToken: string | null = null;
let refreshing: Promise<any> | null = null;
let onSessionLost: () => void = () => {};

export const setAccessToken = (t: string | null) => {
  accessToken = t;
};
export const setSessionLostHandler = (fn: () => void) => {
  onSessionLost = fn;
};

/** One shared refresh at a time, so parallel 401s don't race and burn the single-use cookie. */
export function refreshSession() {
  refreshing ??= fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })
    .then(async (res) => {
      if (!res.ok) return null;
      const data = await res.json();
      accessToken = data.accessToken;
      return data;
    })
    .catch(() => null)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

type Options = Omit<RequestInit, 'body'> & { body?: unknown; query?: Record<string, unknown> };

export async function api<T = any>(path: string, opts: Options = {}, retry = true): Promise<T> {
  const { body, query, headers, ...rest } = opts;
  let url = `/api${path}`;
  if (query) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
    if (qs.size) url += `?${qs}`;
  }

  const isForm = body instanceof FormData;
  const res = await fetch(url, {
    credentials: 'include',
    ...rest,
    headers: {
      ...(body !== undefined && !isForm ? { 'Content-Type': 'application/json' } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
  });

  if (res.status === 401 && retry && !path.startsWith('/auth/')) {
    const session = await refreshSession();
    if (session) return api<T>(path, opts, false);
    onSessionLost();
  }

  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error ?? 'Request failed', data.details ?? {});
  return data as T;
}

/** Fetches a protected file with the bearer token and opens it in a new tab. */
export async function openProtectedFile(path: string) {
  const tab = window.open('', '_blank');
  const load = () => fetch(`/api${path}`, { headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {} });
  let res = await load();
  if (res.status === 401 && (await refreshSession())) res = await load();
  if (!res.ok) {
    tab?.close();
    throw new ApiError(res.status, 'Could not open the file');
  }
  const url = URL.createObjectURL(await res.blob());
  if (tab) tab.location.href = url;
  else window.location.href = url;
}
