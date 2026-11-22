/**
 * Calls the UniFyle server. In development Vite forwards /api to http://localhost:8000.
 * The session lives in an httpOnly cookie set by the server at sign-in, so it is sent automatically.
 *
 *   const data = await api('/users/login', { method: 'POST', body: { email, password, client: 'web' } });
 *
 * Throws an Error whose message is safe to show to the person (the server's own message).
 * The error also carries `status` (HTTP code, 0 when the server cannot be reached).
 */
const BASE = import.meta.env.VITE_API_URL || '/api';

function fail(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

export async function api(path, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include',
    });
  } catch {
    throw fail('Cannot reach the server. Check that it is running.', 0);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw fail(data.message || data.error || 'Something went wrong. Try again.', res.status);
  return data;
}
