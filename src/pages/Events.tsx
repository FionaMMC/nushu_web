import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Loader2, AlertCircle, Mail } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useUpcomingEvents } from '../hooks/useApi';
import { Event as ApiEvent } from '../services/api';

const translations = {
  en: {
    hero: {
      title: 'Events',
      subtitle: 'Join our community through workshops, seminars, and cultural events. All skill levels welcome.',
    },
    stats: {
      eventsAvailable: 'events available',
    },
    status: {
      current: 'Current',
      past: 'Past',
    },
    empty: {
      title: 'No Events Yet',
      message: 'No events are scheduled yet. Check back soon or subscribe below.',
      cta: 'Get Notified',
    },
    loading: {
      title: 'Loading Events...',
      message: 'Please wait while we fetch the latest events.',
    },
    error: 'Unable to load events. Please try again later.',
    register: 'Register',
  },
  zh: {
    hero: {
      title: '活动预告',
      subtitle: '通过工作坊、学术讲座和文化活动加入我们的社区。欢迎各种水平的参与者。',
    },
    stats: {
      eventsAvailable: '场活动',
    },
    status: {
      current: '进行中',
      past: '已结束',
    },
    empty: {
      title: '暂无活动',
      message: '暂时没有排期，欢迎订阅邮件以获取更新。',
      cta: '获取通知',
    },
    loading: {
      title: '加载活动中...',
      message: '请稍候，我们正在获取最新活动信息。',
    },
    error: '无法加载活动信息，请稍后再试。',
    register: '报名',
  },
};

function EventCard({ event, lang }: { event: ApiEvent; lang: 'en' | 'zh' }) {
  const t = translations[lang];

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(
        lang === 'en' ? 'en-US' : 'zh-CN',
        {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }
      );
    } catch {
      return dateStr;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative bg-white border border-nushu-sage/10 overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      {/* Status indicator */}
      <div
        className={`absolute top-0 left-0 w-full h-1 ${
          event.status === 'current' ? 'bg-nushu-terracotta' : 'bg-nushu-sage'
        }`}
      />

      <div className="p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span
                className={`px-3 py-1 text-xs font-medium uppercase tracking-wide ${
                  event.status === 'current'
                    ? 'bg-nushu-terracotta/10 text-nushu-terracotta'
                    : 'bg-nushu-sage/10 text-nushu-sage'
                }`}
              >
                {t.status[event.status]}
              </span>
            </div>
            <h3 className="text-xl lg:text-2xl font-serif font-normal text-nushu-sage leading-tight group-hover:text-nushu-terracotta transition-colors">
              {event.title}
            </h3>
          </div>
        </div>

        {/* Event details */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-4 text-nushu-sage/80">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="font-medium">{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-nushu-sage/40 rounded-full" />
              <span>{event.time}</span>
            </div>
          </div>

          <div className="flex items-start gap-2 text-nushu-sage/80">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="text-sm">{event.venue}</span>
          </div>
        </div>

        <p className="text-nushu-sage/90 leading-relaxed mb-6">{event.blurb}</p>

        {/* Tags and registration */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex flex-wrap gap-2">
            {event.tags.map((tag: string) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 text-xs font-medium bg-nushu-cream text-nushu-sage border border-nushu-sage/20"
              >
                {tag}
              </span>
            ))}
          </div>

          {event.registrationLink && event.status === 'current' && (
            <a
              href={event.registrationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-nushu-sage text-white text-sm font-medium hover:bg-nushu-sage/90 transition-all duration-300 hover:scale-105"
            >
              <span>{t.register}</span>
              <span className="text-xs">→</span>
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function Events() {
  const [lang, setLang] = useState<'en' | 'zh'>('en');
  const t = translations[lang];
  const {
    events = [],
    loading: eventsLoading,
    error: eventsError,
  } = useUpcomingEvents(50);

  // Sort events by date (most recent first)
  const sortedEvents = [...events].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <Layout currentLang={lang} onLangChange={setLang}>
      {/* Hero Section */}
      <section className="relative py-28 lg:py-40 bg-nushu-warm-white">
        <div className="mx-auto w-full max-w-7xl px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mb-16"
          >
            <div className="flex items-center gap-4 mb-6">
              <Calendar className="w-8 h-8 text-nushu-terracotta" />
              <h1 className="font-serif text-4xl lg:text-6xl xl:text-7xl font-normal tracking-tight leading-[1.1] text-nushu-sage">
                {t.hero.title}
              </h1>
            </div>
            <p className="text-xl lg:text-2xl text-nushu-sage/80 leading-relaxed">
              {t.hero.subtitle}
            </p>
          </motion.div>

          {/* Stats */}
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-nushu-terracotta text-white">
            <Calendar className="w-5 h-5" />
            <span className="text-sm font-medium">
              {events.length} {t.stats.eventsAvailable}
            </span>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-28 lg:py-36">
        <div className="mx-auto w-full max-w-7xl px-8 lg:px-12">
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8 lg:gap-12">
            {eventsLoading ? (
              <div className="lg:col-span-2 xl:col-span-3">
                <div className="text-center py-16">
                  <Loader2 className="w-16 h-16 text-nushu-sage/30 mx-auto mb-6 animate-spin" />
                  <h3 className="text-xl font-serif text-nushu-sage mb-4">
                    {t.loading.title}
                  </h3>
                  <p className="text-nushu-sage/70">{t.loading.message}</p>
                </div>
              </div>
            ) : sortedEvents.length === 0 ? (
              <div className="lg:col-span-2 xl:col-span-3">
                <div className="text-center py-16">
                  <Calendar className="w-16 h-16 text-nushu-sage/30 mx-auto mb-6" />
                  <h3 className="text-xl font-serif text-nushu-sage mb-4">
                    {t.empty.title}
                  </h3>
                  <p className="text-nushu-sage/70 mb-8">{t.empty.message}</p>
                  <a
                    href="/contact"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-nushu-terracotta text-white font-medium hover:bg-nushu-terracotta/90 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    <span>{t.empty.cta}</span>
                  </a>
                </div>
              </div>
            ) : (
              sortedEvents.map((event: ApiEvent) => (
                <EventCard key={event._id} event={event} lang={lang} />
              ))
            )}

            {/* Show error indicator if API fails */}
            {eventsError && (
              <div className="lg:col-span-2 xl:col-span-3">
                <div className="flex items-center justify-center gap-2 mt-6 px-4 py-2 bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  <span>{t.error}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
