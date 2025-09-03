import React, { useState, useEffect } from 'react';
import NusHuSocietySite from './App';
import AdminApp from './components/admin/AdminApp';

const Router: React.FC = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  
  useEffect(() => {
    // Handle browser navigation
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
  
  // Handle routing
  if (currentPath === '/admin' || currentPath.startsWith('/admin/')) {
    return <AdminApp />;
  }
  
  return <NusHuSocietySite />;
};

export default Router;