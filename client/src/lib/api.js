/**
 * Calls the UniFyle server. In development Vite forwards /api to http://localhost:5000.
 * The signed-in person's token (saved by AuthContext) is attached automatically.
 *
 *   const data = await api('/auth/login', { method: 'POST', body: { email, password } });
 *
 * Throws an Error whose message is safe to show to the person (the server's own message).
 * The error also carries `status` (HTTP code, 0 when the server cannot be reached) and the server's `code`.
 */
const BASE = import.meta.env.VITE_API_URL || '/api';

function tokenFromSession() {
  try { return JSON.parse(sessionStorage.getItem('unifyle:user'))?.token ?? null; } catch { return null; }
}

function fail(message, status, code) {
  const err = new Error(message);
  err.status = status;
  err.code = code;
  return err;
}

/** `token` overrides the saved one (used while a temporary password is being replaced). */
export async function api(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const bearer = token ?? tokenFromSession();
  if (bearer) headers.Authorization = `Bearer ${bearer}`;

  let res;
  try {
    res = await fetch(`${BASE}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw fail('Cannot reach the server. Check that it is running.', 0);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw fail(data.error || 'Something went wrong. Try again.', res.status, data.code);
  return data;
}
