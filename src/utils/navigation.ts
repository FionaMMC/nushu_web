// Navigation utility functions
export const navigateTo = (path: string) => {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
};

export const createNavigationHandler = (path: string) => (e: React.MouseEvent) => {
  e.preventDefault();
  navigateTo(path);
};

// Helper for external links
export const handleExternalLink = (url: string) => (e: React.MouseEvent) => {
  e.preventDefault();
  window.open(url, '_blank', 'noopener,noreferrer');
};