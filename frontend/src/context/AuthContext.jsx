import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('colorido_admin_token'));
  const [adminEmail, setAdminEmail] = useState(localStorage.getItem('colorido_admin_email'));
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);

  useEffect(() => {
    setIsAuthenticated(!!token);
  }, [token]);

  const login = (accessToken, email) => {
    localStorage.setItem('colorido_admin_token', accessToken);
    localStorage.setItem('colorido_admin_email', email);
    setToken(accessToken);
    setAdminEmail(email);
  };

  const logout = () => {
    localStorage.removeItem('colorido_admin_token');
    localStorage.removeItem('colorido_admin_email');
    setToken(null);
    setAdminEmail(null);
  };

  return (
    <AuthContext.Provider value={{ token, adminEmail, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
