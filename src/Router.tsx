import React, { useState, useEffect } from 'react';
import NusHuSocietySite from './App';
import AdminApp from './components/admin/AdminApp';
import ComingSoon from './components/ComingSoon';

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
  
  // Resource pages
  if (currentPath === '/resources/primer') {
    return (
      <ComingSoon 
        title="Starter Primer" 
        subtitle="A comprehensive introduction to Nüshu fundamentals"
        description="This two-page primer will cover phonology, ductus, and materials needed to begin your Nüshu journey. Perfect for beginners and workshop participants."
        expectedDate="Early 2024"
      />
    );
  }
  
  if (currentPath === '/resources/reading-list') {
    return (
      <ComingSoon 
        title="Reading List" 
        subtitle="Essential scholarship and ethnographies"
        description="A curated bibliography of key academic works, historical documents, and contemporary research on Nüshu and women's writing systems."
        expectedDate="Spring 2024"
      />
    );
  }
  
  if (currentPath === '/resources/workshop-sheet') {
    return (
      <ComingSoon 
        title="Workshop Sheet" 
        subtitle="Printable practice materials"
        description="Downloadable practice grids, exemplar strokes, and guided exercises for calligraphy workshops and self-study sessions."
        expectedDate="February 2024"
      />
    );
  }
  
  return <NusHuSocietySite />;
};

export default Router;