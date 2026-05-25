// auth-context.jsx — useAuth hook + provider. Stores JWT in memory only.
const AuthCtx = React.createContext(null);

function AuthProvider({ children }) {
  const [token, setTokenState] = React.useState(null);
  const [user, setUser] = React.useState(null);

  const setSession = React.useCallback((tok, u) => {
    setTokenState(tok);
    setUser(u);
    window.BambiAPI.setToken(tok);
  }, []);

  const login = React.useCallback(async (creds) => {
    const { token, user } = await window.BambiAPI.login(creds);
    setSession(token, user);
    return user;
  }, [setSession]);

  const register = React.useCallback(async (data) => {
    const { token, user } = await window.BambiAPI.register(data);
    setSession(token, user);
    return user;
  }, [setSession]);

  const logout = React.useCallback(() => {
    setSession(null, null);
  }, [setSession]);

  // role derived from JWT — explicit per spec ("On login, decode JWT and store role in state")
  const role = user?.role || null;
  const isAdmin = role === "admin";
  const isLoggedIn = !!token;

  const value = { token, user, role, isAdmin, isLoggedIn, login, register, logout };
  return React.createElement(AuthCtx.Provider, { value }, children);
}

function useAuth() {
  const v = React.useContext(AuthCtx);
  if (!v) throw new Error("useAuth outside provider");
  return v;
}

Object.assign(window, { AuthProvider, useAuth, AuthCtx });
