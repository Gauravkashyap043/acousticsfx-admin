import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { getToken, setToken as persistToken, clearToken } from '../lib/api';

type AuthContextValue = {
  token: string | null;
  isAuthenticated: boolean;
  setToken: (token: string | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => getToken());

  const setToken = useCallback((value: string | null) => {
    if (value) {
      persistToken(value);
      setTokenState(value);
    } else {
      clearToken();
      setTokenState(null);
    }
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setTokenState(null);
  }, []);

  // Sync token from storage (e.g. another tab)
  useEffect(() => {
    const stored = getToken();
    if (stored !== token) setTokenState(stored);
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: !!token,
        setToken,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
