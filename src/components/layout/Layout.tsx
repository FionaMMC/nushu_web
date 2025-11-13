import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { navigateTo } from '../../utils/navigation';

interface LayoutProps {
  children: React.ReactNode;
  currentLang?: 'en' | 'zh';
  onLangChange?: (lang: 'en' | 'zh') => void;
}

const translations = {
  en: {
    nav: {
      home: 'Home',
      about: 'About',
      events: 'Events',
      blog: 'Blog',
      gallery: 'Gallery',
      contact: 'Contact',
    },
    footer: {
      legal: `© ${new Date().getFullYear()} Nushu Culture & Research Association`,
      contact: 'Contact',
      events: 'Events',
    }
  },
  zh: {
    nav: {
      home: '首页',
      about: '关于我们',
      events: '活动',
      blog: '博客',
      gallery: '画廊',
      contact: '联系我们',
    },
    footer: {
      legal: `© ${new Date().getFullYear()} 女书文化与研究协会`,
      contact: '联系我们',
      events: '活动',
    }
  }
};

export default function Layout({ children, currentLang = 'en', onLangChange }: LayoutProps) {
  const [lang, setLang] = useState<'en' | 'zh'>(currentLang);
  const t = translations[lang];

  const handleLangChange = (newLang: 'en' | 'zh') => {
    setLang(newLang);
    onLangChange?.(newLang);
  };

  const navItems = [
    { label: t.nav.home, path: '/' },
    { label: t.nav.about, path: '/about' },
    { label: t.nav.events, path: '/events' },
    { label: t.nav.blog, path: '/blog' },
    { label: t.nav.gallery, path: '/gallery' },
    { label: t.nav.contact, path: '/contact' },
  ];

  const currentPath = window.location.pathname;

  return (
    <div className="min-h-screen bg-white text-nushu-sage flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur bg-white/95 border-b border-nushu-sage/10">
        <div className="mx-auto w-full max-w-7xl px-8 lg:px-12">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <motion.a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                navigateTo('/');
              }}
              className="flex items-center gap-3 group"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <img src="/Logo-2.JPG" alt="Nushu Logo" className="h-12 w-auto" />
              <span className="font-serif text-xl font-medium text-nushu-sage group-hover:text-nushu-terracotta transition-colors">
                Nushu Culture & Research Association
              </span>
            </motion.a>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-10 text-sm font-medium">
              {navItems.map((item) => (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={(e) => {
                    e.preventDefault();
                    navigateTo(item.path);
                  }}
                  className={`relative text-nushu-sage hover:text-nushu-terracotta transition-colors ${
                    currentPath === item.path ? 'text-nushu-terracotta' : ''
                  }`}
                >
                  {item.label}
                  {currentPath === item.path && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute -bottom-6 left-0 right-0 h-0.5 bg-nushu-terracotta"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </a>
              ))}
            </nav>

            {/* Language Switch */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleLangChange('en')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  lang === 'en'
                    ? 'bg-nushu-terracotta text-white'
                    : 'text-nushu-sage hover:bg-nushu-cream'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => handleLangChange('zh')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  lang === 'zh'
                    ? 'bg-nushu-terracotta text-white'
                    : 'text-nushu-sage hover:bg-nushu-cream'
                }`}
              >
                中文
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-nushu-sage/10 py-16 lg:py-20 bg-white">
        <div className="mx-auto w-full max-w-7xl px-8 lg:px-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <img src="/Logo-2.JPG" alt="Nushu Logo" className="h-8 w-auto opacity-80" />
              <span className="text-nushu-sage/80">{t.footer.legal}</span>
            </div>
            <div className="flex items-center gap-8 text-sm">
              <a
                href="/contact"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo('/contact');
                }}
                className="text-nushu-sage hover:text-nushu-terracotta transition-colors"
              >
                {t.footer.contact}
              </a>
              <a
                href="/events"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo('/events');
                }}
                className="text-nushu-sage hover:text-nushu-terracotta transition-colors"
              >
                {t.footer.events}
              </a>
              <a
                href="/gallery"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo('/gallery');
                }}
                className="text-nushu-sage hover:text-nushu-terracotta transition-colors"
              >
                {t.nav.gallery}
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
