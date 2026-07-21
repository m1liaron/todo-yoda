const TOKEN_KEY = 'access_token';

const setToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
}

const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
}

export { setToken, getToken, clearToken }