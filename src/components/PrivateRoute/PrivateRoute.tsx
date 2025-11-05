import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  console.log("🔒 PrivateRoute:", { isAuthenticated, loading });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-[#4c010c] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("❌ PrivateRoute: Não autenticado, redirecionando para /login");
    return <Navigate to="/login" replace />;
  }

  console.log("✅ PrivateRoute: Autenticado, renderizando conteúdo");
  return <>{children}</>;
};

export default PrivateRoute;