import React, { useState, useEffect } from 'react';
import AdminApp from './components/admin/AdminApp';
import Home from './pages/Home';
import About from './pages/About';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';

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

  // Main pages
  if (currentPath === '/about') {
    return <About />;
  }

  if (currentPath === '/events') {
    return <Events />;
  }

  if (currentPath.startsWith('/events/')) {
    return <EventDetail />;
  }

  if (currentPath === '/blog') {
    return <Blog />;
  }

  if (currentPath.startsWith('/blog/')) {
    return <BlogDetail />;
  }

  if (currentPath === '/gallery') {
    return <Gallery />;
  }

  if (currentPath === '/contact') {
    return <Contact />;
  }

  // Home page (default)
  return <Home />;
};

export default Router;