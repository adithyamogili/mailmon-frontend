const API_BASE = `${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/api`;

function getToken() {
  return localStorage.getItem('session_token');
}

export function setToken(token) {
  if (token) {
    localStorage.setItem('session_token', token);
  } else {
    localStorage.removeItem('session_token');
  }
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { headers, ...options });

  if (res.status === 401) {
    setToken(null);
    throw new Error('Unauthorized');
  }

  if (res.status === 429) {
    throw new Error('Too many requests. Please slow down.');
  }

  const contentType = res.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');

  if (!res.ok) {
    if (isJson) {
      const data = await res.json();
      throw new Error(data.error || 'Request failed');
    }
    throw new Error(`Server error (${res.status})`);
  }

  return isJson ? await res.json() : await res.text();
}

export const getMe = () => request('/auth/me');
export const logout = () => request('/auth/logout', { method: 'POST' }).then(() => setToken(null));
export const googleLogin = async (credential) => {
  const data = await request('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ credential }),
  });
  setToken(data.token);
  return data;
};
export const getGmailConnectURL = () => request('/gmail/connect');
export const disconnectGmail = () => request('/gmail/disconnect', { method: 'POST' });
export const updateCron = (enabled, intervalMinutes) =>
  request('/cron', {
    method: 'PUT',
    body: JSON.stringify({ enabled, interval_minutes: intervalMinutes }),
  });
export const getTelegramLinkCode = () => request('/telegram/link-code');
export const deleteAccount = () => request('/account', { method: 'DELETE' }).then(() => setToken(null));
