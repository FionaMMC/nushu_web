import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User, Tag, Clock } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { blogApi, BlogPost } from '../services/api';
import { navigateTo } from '../utils/navigation';

export default function BlogDetail() {
  const [lang, setLang] = useState<'en' | 'zh'>('en');
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract blog ID from URL path
  const id = window.location.pathname.split('/blog/')[1];

  useEffect(() => {
    const loadPost = async () => {
      if (!id) {
        setError('No blog post ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await blogApi.getById(id);
        setPost(response.post);
      } catch (err) {
        console.error('Error loading blog post:', err);
        setError('Failed to load blog post');
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [id]);

  if (loading) {
    return (
      <Layout currentLang={lang} onLangChange={setLang}>
        <div className="min-h-screen bg-nushu-warm-white flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-nushu-terracotta"></div>
        </div>
      </Layout>
    );
  }

  if (error || !post) {
    return (
      <Layout currentLang={lang} onLangChange={setLang}>
        <div className="min-h-screen bg-nushu-warm-white py-28">
          <div className="mx-auto w-full max-w-3xl px-8 text-center">
            <h1 className="text-3xl font-serif text-nushu-sage mb-4">
              {error || 'Blog post not found'}
            </h1>
            <button
              onClick={() => navigateTo('/blog')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-nushu-terracotta text-white rounded-lg hover:bg-nushu-terracotta/90 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
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
        <div className="mx-auto w-full max-w-4xl px-8 py-6">
          <button
            onClick={() => navigateTo('/blog')}
            className="inline-flex items-center gap-2 text-nushu-sage hover:text-nushu-terracotta transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Blog</span>
          </button>
        </div>
      </div>

      {/* Article */}
      <article className="bg-nushu-warm-white py-16 lg:py-24">
        <div className="mx-auto w-full max-w-4xl px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Category Badge */}
            {post.category && (
              <div className="mb-6">
                <span className="inline-block px-4 py-2 text-sm font-medium bg-nushu-terracotta/10 text-nushu-terracotta rounded">
                  {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
                </span>
              </div>
            )}

            {/* Title */}
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-serif text-nushu-sage mb-8 leading-tight">
              {post.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 mb-12 pb-8 border-b border-nushu-sage/10">
              <div className="flex items-center gap-2 text-nushu-sage/70">
                <User className="w-5 h-5" />
                <span className="font-medium">{post.author}</span>
              </div>
              <div className="flex items-center gap-2 text-nushu-sage/70">
                <Calendar className="w-5 h-5" />
                <span>
                  {new Date(post.date).toLocaleDateString(lang === 'en' ? 'en-US' : 'zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-nushu-sage/70">
                <Clock className="w-5 h-5" />
                <span>{Math.ceil(post.content.split(' ').length / 200)} min read</span>
              </div>
            </div>

            {/* Featured Image */}
            {post.imageUrl && (
              <div className="mb-12 rounded-lg overflow-hidden shadow-lg">
                <img
                  src={post.imageUrl}
                  alt={post.imageAlt || post.title}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}

            {/* Excerpt */}
            {post.excerpt && (
              <div className="mb-8 p-6 bg-nushu-cream rounded-lg border-l-4 border-nushu-terracotta">
                <p className="text-lg lg:text-xl text-nushu-sage/80 italic leading-relaxed">
                  {post.excerpt}
                </p>
              </div>
            )}

            {/* Content */}
            <div className="prose prose-lg max-w-none">
              <div
                className="text-nushu-sage/90 leading-relaxed space-y-6 whitespace-pre-wrap"
                style={{
                  fontSize: '1.125rem',
                  lineHeight: '1.75rem',
                }}
              >
                {post.content}
              </div>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-nushu-sage/10">
                <div className="flex items-center gap-3 flex-wrap">
                  <Tag className="w-5 h-5 text-nushu-sage/60" />
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, idx) => (
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

            {/* Back to Blog Button */}
            <div className="mt-16 pt-8 border-t border-nushu-sage/10">
              <button
                onClick={() => navigateTo('/blog')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-nushu-sage text-white rounded-lg hover:bg-nushu-sage/90 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to All Posts</span>
              </button>
            </div>
          </motion.div>
        </div>
      </article>
    </Layout>
  );
}
