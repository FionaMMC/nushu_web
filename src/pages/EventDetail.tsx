import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, MapPin, Clock, Tag, ExternalLink, Image as ImageIcon, FileText } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { Event, GalleryImage, BlogPost } from '../services/api';
import { navigateTo } from '../utils/navigation';

const API_BASE_URL = import.meta.env.VITE_API_URL || (
  typeof window !== 'undefined'
    ? (window.location.origin + '/api')
    : 'http://localhost:3001/api'
);

const translations = {
  en: {
    backToEvents: 'Back to Events',
    eventNotFound: 'Event not found',
    failedToLoad: 'Failed to load event',
    eventDetails: 'Event Details',
    date: 'Date',
    time: 'Time',
    venue: 'Venue',
    register: 'Register Now',
    relatedGallery: 'Related Gallery',
    relatedBlogs: 'Related Blog Posts',
    noGallery: 'No gallery images for this event yet.',
    noBlogs: 'No blog posts for this event yet.',
    readMore: 'Read More',
    current: 'Current',
    past: 'Past',
    by: 'By',
  },
  zh: {
    backToEvents: '返回活动列表',
    eventNotFound: '未找到活动',
    failedToLoad: '加载活动失败',
    eventDetails: '活动详情',
    date: '日期',
    time: '时间',
    venue: '地点',
    register: '立即报名',
    relatedGallery: '相关图库',
    relatedBlogs: '相关博客',
    noGallery: '暂无相关图片。',
    noBlogs: '暂无相关博客文章。',
    readMore: '阅读更多',
    current: '进行中',
    past: '已结束',
    by: '作者',
  },
};

export default function EventDetail() {
  const [lang, setLang] = useState<'en' | 'zh'>('en');
  const [event, setEvent] = useState<Event | null>(null);
  const [galleries, setGalleries] = useState<GalleryImage[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const t = translations[lang];

  // Extract event ID from URL path
  const id = window.location.pathname.split('/events/')[1];

  useEffect(() => {
    const loadEventData = async () => {
      if (!id) {
        setError('No event ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch event details
        const eventResponse = await fetch(`${API_BASE_URL}/web-events?eventId=${id}`);
        if (!eventResponse.ok) {
          throw new Error('Failed to fetch event');
        }
        const eventData = await eventResponse.json();
        setEvent(eventData.data.event);

        // Fetch related galleries
        try {
          const galleryResponse = await fetch(`${API_BASE_URL}/gallery?eventId=${id}`);
          if (galleryResponse.ok) {
            const galleryData = await galleryResponse.json();
            setGalleries(galleryData.data.images || []);
          }
        } catch (err) {
          console.warn('Failed to fetch galleries:', err);
        }

        // Fetch related blogs
        try {
          const blogResponse = await fetch(`${API_BASE_URL}/blog?eventId=${id}`);
          if (blogResponse.ok) {
            const blogData = await blogResponse.json();
            setBlogs(blogData.data.posts || []);
          }
        } catch (err) {
          console.warn('Failed to fetch blogs:', err);
        }

      } catch (err) {
        console.error('Error loading event:', err);
        setError('Failed to load event');
      } finally {
        setLoading(false);
      }
    };

    loadEventData();
  }, [id]);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(
        lang === 'en' ? 'en-US' : 'zh-CN',
        {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }
      );
    } catch {
      return dateStr;
    }
  };

  const formatBlogDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(
        lang === 'en' ? 'en-US' : 'zh-CN',
        {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }
      );
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <Layout currentLang={lang} onLangChange={setLang}>
        <div className="min-h-screen bg-nushu-warm-white flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-nushu-terracotta"></div>
        </div>
      </Layout>
    );
  }

  if (error || !event) {
    return (
      <Layout currentLang={lang} onLangChange={setLang}>
        <div className="min-h-screen bg-nushu-warm-white py-28">
          <div className="mx-auto w-full max-w-3xl px-8 text-center">
            <h1 className="text-3xl font-serif text-nushu-sage mb-4">
              {error || t.eventNotFound}
            </h1>
            <button
              onClick={() => navigateTo('/events')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-nushu-terracotta text-white rounded-lg hover:bg-nushu-terracotta/90 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t.backToEvents}
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentLang={lang} onLangChange={setLang}>
      {/* Back Button */}
      <div className="bg-white border-b border-nushu-sage/10">
        <div className="mx-auto w-full max-w-7xl px-8 py-6">
          <button
            onClick={() => navigateTo('/events')}
            className="inline-flex items-center gap-2 text-nushu-sage hover:text-nushu-terracotta transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.backToEvents}</span>
          </button>
        </div>
      </div>

      {/* Hero Poster Image */}
      {event.posterImageUrl && (
        <div className="w-full h-[40vh] lg:h-[50vh] overflow-hidden bg-nushu-sage/5">
          <img
            src={event.posterImageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Event Details */}
      <article className="bg-nushu-warm-white py-16 lg:py-24">
        <div className="mx-auto w-full max-w-7xl px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Status Badge */}
            <div className="mb-6">
              <span
                className={`inline-block px-4 py-2 text-sm font-medium uppercase tracking-wide ${
                  event.status === 'current'
                    ? 'bg-nushu-terracotta/10 text-nushu-terracotta'
                    : 'bg-nushu-sage/10 text-nushu-sage'
                }`}
              >
                {t[event.status]}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-serif text-nushu-sage mb-8 leading-tight">
              {event.title}
            </h1>

            {/* Meta Information */}
            <div className="grid md:grid-cols-3 gap-6 mb-12 pb-8 border-b border-nushu-sage/10">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-nushu-terracotta mt-1 flex-shrink-0" />
                <div>
                  <div className="text-sm text-nushu-sage/60 mb-1">{t.date}</div>
                  <div className="font-medium text-nushu-sage">{formatDate(event.date)}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-nushu-terracotta mt-1 flex-shrink-0" />
                <div>
                  <div className="text-sm text-nushu-sage/60 mb-1">{t.time}</div>
                  <div className="font-medium text-nushu-sage">{event.time}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-nushu-terracotta mt-1 flex-shrink-0" />
                <div>
                  <div className="text-sm text-nushu-sage/60 mb-1">{t.venue}</div>
                  <div className="font-medium text-nushu-sage">{event.venue}</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-12">
              <p className="text-lg lg:text-xl text-nushu-sage/90 leading-relaxed">
                {event.blurb}
              </p>
            </div>

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="mb-12 pb-8 border-b border-nushu-sage/10">
                <div className="flex items-center gap-3 flex-wrap">
                  <Tag className="w-5 h-5 text-nushu-sage/60" />
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 text-sm bg-white border border-nushu-sage/20 text-nushu-sage rounded-full hover:bg-nushu-cream transition-colors"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Registration Button */}
            {event.registrationLink && event.status === 'current' && (
              <div className="mb-16">
                <a
                  href={event.registrationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-nushu-terracotta text-white text-lg font-medium rounded-lg hover:bg-nushu-terracotta/90 transition-all duration-300 hover:scale-105"
                >
                  <span>{t.register}</span>
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            )}

            {/* Related Gallery Section */}
            {galleries.length > 0 && (
              <div className="mb-16">
                <div className="flex items-center gap-3 mb-8">
                  <ImageIcon className="w-6 h-6 text-nushu-terracotta" />
                  <h2 className="text-3xl font-serif text-nushu-sage">{t.relatedGallery}</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {galleries.map((image) => (
                    <motion.div
                      key={image._id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      className="group relative aspect-square overflow-hidden bg-nushu-sage/5 rounded-lg"
                    >
                      <img
                        src={image.imageUrl}
                        alt={image.alt}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <p className="text-white text-sm font-medium line-clamp-2">
                            {image.title}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Related Blog Posts Section */}
            {blogs.length > 0 && (
              <div className="mb-16">
                <div className="flex items-center gap-3 mb-8">
                  <FileText className="w-6 h-6 text-nushu-terracotta" />
                  <h2 className="text-3xl font-serif text-nushu-sage">{t.relatedBlogs}</h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {blogs.map((post) => (
                    <motion.article
                      key={post._id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      onClick={() => navigateTo(`/blog/${post._id}`)}
                      className="group cursor-pointer bg-white border border-nushu-sage/10 overflow-hidden hover:shadow-lg transition-all duration-300"
                    >
                      {post.imageUrl && (
                        <div className="aspect-video overflow-hidden bg-nushu-sage/5">
                          <img
                            src={post.imageUrl}
                            alt={post.imageAlt || post.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        {post.category && (
                          <div className="mb-3">
                            <span className="text-xs font-medium text-nushu-terracotta uppercase tracking-wide">
                              {post.category}
                            </span>
                          </div>
                        )}
                        <h3 className="text-xl font-serif text-nushu-sage mb-3 group-hover:text-nushu-terracotta transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-nushu-sage/60 mb-4">
                          <span>{t.by} {post.author}</span>
                          <span>•</span>
                          <span>{formatBlogDate(post.date)}</span>
                        </div>
                        {post.excerpt && (
                          <p className="text-nushu-sage/80 line-clamp-3 mb-4">
                            {post.excerpt}
                          </p>
                        )}
                        <div className="inline-flex items-center gap-2 text-nushu-terracotta font-medium text-sm group-hover:gap-3 transition-all">
                          <span>{t.readMore}</span>
                          <span>→</span>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>
              </div>
            )}

            {/* Back to Events Button */}
            <div className="mt-16 pt-8 border-t border-nushu-sage/10">
              <button
                onClick={() => navigateTo('/events')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-nushu-sage text-white rounded-lg hover:bg-nushu-sage/90 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t.backToEvents}</span>
              </button>
            </div>
          </motion.div>
        </div>
      </article>
    </Layout>
  );
}
