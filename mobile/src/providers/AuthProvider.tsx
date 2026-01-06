import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { base44 } from '../api/base44Client';

interface AuthContextValue {
  user: any | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const token = await SecureStore.getItemAsync('token');
        if (token) {
          base44.setToken(token);
          const me = await base44.auth.me();
          setUser(me);
        }
      } catch (err) {
        console.warn('Auth init error', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = async (email: string, password: string) => {
    const { token, user: me } = await base44.auth.login(email, password);
    await SecureStore.setItemAsync('token', token);
    base44.setToken(token);
    setUser(me);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('token');
    base44.setToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
