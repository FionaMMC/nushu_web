import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Calendar, User, ArrowRight } from 'lucide-react';
import Layout from '../components/layout/Layout';

const translations = {
  en: {
    hero: {
      title: 'Blog',
      subtitle: 'Insights, research, and stories about Nüshu culture and practice',
    },
    readMore: 'Read more',
    categories: 'Categories',
    allPosts: 'All Posts',
    research: 'Research',
    culture: 'Culture',
    practice: 'Practice',
    comingSoon: {
      title: 'Coming Soon',
      message: 'We\'re working on bringing you insightful articles and research updates. Check back soon!',
    },
  },
  zh: {
    hero: {
      title: '博客',
      subtitle: '关于女书文化和实践的见解、研究和故事',
    },
    readMore: '阅读更多',
    categories: '分类',
    allPosts: '全部文章',
    research: '研究',
    culture: '文化',
    practice: '实践',
    comingSoon: {
      title: '即将推出',
      message: '我们正在为您带来深刻的文章和研究更新。敬请期待！',
    },
  },
};

// Static blog posts (will be replaced with API data later)
const staticPosts = [
  {
    id: '1',
    title: 'The Origins of Nüshu: A Women\'s Script',
    excerpt: 'Exploring the historical and cultural context of Nüshu\'s development in Jiangyong County...',
    author: 'Research Team',
    date: '2024-01-15',
    category: 'Research',
    image: '/密语者.jpg',
  },
  {
    id: '2',
    title: 'Calligraphy Workshop Reflections',
    excerpt: 'Participants share their experiences learning Nüshu characters and strokes in our recent workshop...',
    author: 'Community',
    date: '2024-01-10',
    category: 'Practice',
    image: '/WechatIMG1020.jpg',
  },
  {
    id: '3',
    title: 'Women\'s Writing Systems Around the World',
    excerpt: 'Comparative study of unique writing systems developed by and for women across different cultures...',
    author: 'Research Team',
    date: '2024-01-05',
    category: 'Culture',
    image: '/nushu-embroidery.JPG',
  },
];

export default function Blog() {
  const [lang, setLang] = React.useState<'en' | 'zh'>('en');
  const t = translations[lang];
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');

  // For now, using static posts. This can be replaced with API calls later
  const posts = staticPosts;

  return (
    <Layout currentLang={lang} onLangChange={setLang}>
      {/* Hero Section */}
      <section className="relative py-28 lg:py-40 bg-nushu-warm-white">
        <div className="mx-auto w-full max-w-7xl px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <BookOpen className="w-8 h-8 text-nushu-terracotta" />
              <h1 className="font-serif text-4xl lg:text-6xl xl:text-7xl font-normal tracking-tight leading-[1.1] text-nushu-sage">
                {t.hero.title}
              </h1>
            </div>
            <p className="text-xl lg:text-2xl text-nushu-sage/80 leading-relaxed">
              {t.hero.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="py-12 bg-white border-b border-nushu-sage/10">
        <div className="mx-auto w-full max-w-7xl px-8 lg:px-12">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-nushu-sage/70">{t.categories}:</span>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-nushu-sage text-white'
                    : 'bg-white text-nushu-sage border border-nushu-sage/20 hover:bg-nushu-cream'
                }`}
              >
                {t.allPosts}
              </button>
              <button
                onClick={() => setSelectedCategory('research')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  selectedCategory === 'research'
                    ? 'bg-nushu-sage text-white'
                    : 'bg-white text-nushu-sage border border-nushu-sage/20 hover:bg-nushu-cream'
                }`}
              >
                {t.research}
              </button>
              <button
                onClick={() => setSelectedCategory('culture')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  selectedCategory === 'culture'
                    ? 'bg-nushu-sage text-white'
                    : 'bg-white text-nushu-sage border border-nushu-sage/20 hover:bg-nushu-cream'
                }`}
              >
                {t.culture}
              </button>
              <button
                onClick={() => setSelectedCategory('practice')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  selectedCategory === 'practice'
                    ? 'bg-nushu-sage text-white'
                    : 'bg-white text-nushu-sage border border-nushu-sage/20 hover:bg-nushu-cream'
                }`}
              >
                {t.practice}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-28 lg:py-36">
        <div className="mx-auto w-full max-w-7xl px-8 lg:px-12">
          {posts.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-nushu-sage/30 mx-auto mb-6" />
              <h3 className="text-2xl font-serif text-nushu-sage mb-4">{t.comingSoon.title}</h3>
              <p className="text-lg text-nushu-sage/70 max-w-2xl mx-auto">{t.comingSoon.message}</p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8 lg:gap-12">
              {posts.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group bg-white border border-nushu-sage/10 overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  {/* Image */}
                  <div className="aspect-[16/9] bg-nushu-cream overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-8">
                    {/* Meta */}
                    <div className="flex items-center gap-4 mb-4 text-sm text-nushu-sage/60">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(post.date).toLocaleDateString(lang === 'en' ? 'en-US' : 'zh-CN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{post.author}</span>
                      </div>
                    </div>

                    {/* Category */}
                    <div className="mb-3">
                      <span className="inline-block px-3 py-1 text-xs font-medium bg-nushu-terracotta/10 text-nushu-terracotta">
                        {post.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-xl lg:text-2xl font-serif text-nushu-sage mb-3 group-hover:text-nushu-terracotta transition-colors leading-tight">
                      {post.title}
                    </h2>

                    {/* Excerpt */}
                    <p className="text-nushu-sage/80 leading-relaxed mb-6">{post.excerpt}</p>

                    {/* Read More */}
                    <div className="flex items-center gap-2 text-nushu-terracotta font-medium group-hover:gap-4 transition-all">
                      <span>{t.readMore}</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
