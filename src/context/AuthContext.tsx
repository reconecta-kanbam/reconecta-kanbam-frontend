import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { isAuthenticated, logoutUser } from '../api/services/usuario';

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  logout: () => void;
  updateAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<boolean>(false); // ← Começa false
  const [loading, setLoading] = useState(true); // ← Começa true

  const updateAuth = () => {
    const authenticated = isAuthenticated();
    console.log("🔐 AuthContext: isAuthenticated =", authenticated);
    setAuth(authenticated);
  };

  useEffect(() => {
    console.log("🔄 AuthContext: Inicializando...");
    updateAuth();
    setLoading(false); // ← Para de carregar após verificar

    // Escuta mudanças no storage (multi-tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'access_token') {
        console.log("🔄 AuthContext: Token mudou em outra aba");
        updateAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const logout = () => {
    console.log("🚪 AuthContext: Fazendo logout...");
    logoutUser();
    setAuth(false); // ← Atualiza imediatamente
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