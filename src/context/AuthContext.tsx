import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import api from '../api';

interface AuthContextType {
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('easylab_admin_token')
  );

  const login = useCallback(async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    // The backend wraps everything in { success, message, data }
    const responseData = response.data.data || response.data;
    const accessToken: string = responseData.token || responseData.accessToken || responseData.access_token;
    
    if (!accessToken) throw new Error('Token not found in response');
    
    localStorage.setItem('easylab_admin_token', accessToken);
    setToken(accessToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('easylab_admin_token');
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
