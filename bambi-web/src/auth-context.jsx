// auth-context.jsx — useAuth hook + provider. Restores session from localStorage on mount.
import React from 'react';
import api from './api.js';

const AuthCtx = React.createContext(null);

const LS_TOKEN = 'bambi_token';
const LS_USER = 'bambi_user';

function loadStoredUser() {
  try {
    const raw = localStorage.getItem(LS_USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  // Initialise from localStorage so admin/user stay logged in across refreshes.
  const initialToken = (typeof localStorage !== 'undefined' && localStorage.getItem(LS_TOKEN)) || null;
  const initialUser = initialToken ? loadStoredUser() : null;

  const [token, setTokenState] = React.useState(initialToken);
  const [user, setUser] = React.useState(initialUser);

  // Sync api singleton with current token on first render.
  React.useEffect(() => {
    if (initialToken) api.setToken(initialToken);
    // If we have a token but couldn't read the cached user, decode from JWT.
    if (initialToken && !initialUser) {
      const payload = api.decodeJwt(initialToken);
      if (payload) {
        setUser({
          id: Number(payload.UserId || payload.sub),
          username: payload.Username || payload.unique_name || '',
          role: (payload.Role || payload.role || '').toLowerCase(),
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setSession = React.useCallback((tok, u) => {
    setTokenState(tok);
    setUser(u);
    api.setToken(tok);
    if (tok) {
      localStorage.setItem(LS_TOKEN, tok);
      if (u) localStorage.setItem(LS_USER, JSON.stringify(u));
    } else {
      localStorage.removeItem(LS_TOKEN);
      localStorage.removeItem(LS_USER);
    }
  }, []);

  const login = React.useCallback(async (creds) => {
    const { token, user } = await api.login(creds);
    setSession(token, user);
    return user;
  }, [setSession]);

  const register = React.useCallback(async (data) => {
    const { token, user } = await api.register(data);
    setSession(token, user);
    return user;
  }, [setSession]);

  const logout = React.useCallback(() => {
    setSession(null, null);
  }, [setSession]);

  const role = (user?.role || '').toLowerCase() || null;
  const isAdmin = role === 'admin';
  const isLoggedIn = !!token;

  const value = { token, user, role, isAdmin, isLoggedIn, login, register, logout, setSession };
  return React.createElement(AuthCtx.Provider, { value }, children);
}

export function useAuth() {
  const v = React.useContext(AuthCtx);
  if (!v) throw new Error('useAuth outside provider');
  return v;
}
