import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { isAuthenticated, logoutUser } from '../api/services/usuario';

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  logout: () => void;
  updateAuth: () => void; // Adicionado para atualizar manualmente
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<boolean>(isAuthenticated());
  const [loading, setLoading] = useState(true);

  const updateAuth = () => {
    setAuth(isAuthenticated());
  };

  useEffect(() => {
    updateAuth();
    setLoading(false);

    // Escuta mudanças no storage (para multi-tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'access_token') {
        updateAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const logout = () => {
    logoutUser();
    updateAuth(); // Atualiza imediatamente após logout
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: auth, loading, logout, updateAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};