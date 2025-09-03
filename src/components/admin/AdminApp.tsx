import React, { useState, useEffect } from 'react';
import { adminApi, authStorage } from '../../services/api';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import { Loader2 } from 'lucide-react';

const AdminApp: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = authStorage.getToken();
      
      if (!token) {
        setIsLoading(false);
        return;
      }
      
      try {
        // Verify the token is still valid
        await adminApi.verifyToken(token);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Token verification failed:', error);
        // Clear invalid token
        authStorage.removeToken();
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-nushu-warm-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-nushu-sage animate-spin mx-auto mb-4" />
          <p className="text-nushu-sage">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  return <AdminDashboard />;
};

export default AdminApp;