export const STORAGE_TOKEN_KEY = "neoconnect_token";
export const STORAGE_USER_KEY = "neoconnect_user";

export function saveSession({ token, user }) {
  localStorage.setItem(STORAGE_TOKEN_KEY, token);
  localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(STORAGE_TOKEN_KEY);
  localStorage.removeItem(STORAGE_USER_KEY);
}

export function getSessionUser() {
  const raw = localStorage.getItem(STORAGE_USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (_err) {
    return null;
  }
}

export function isAuthenticated() {
  return Boolean(localStorage.getItem(STORAGE_TOKEN_KEY));
}
