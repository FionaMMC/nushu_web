import React from 'react';
import { motion } from 'framer-motion';
import { Users, HeartHandshake, Calendar, BookOpen, Images, Mail } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { navigateTo } from '../utils/navigation';
import { useUpcomingEvents } from '../hooks/useApi';

const translations = {
  en: {
    hero: {
      title: 'Nushu Culture & Research Association',
      subtitle: 'Researching, practicing, and sharing the living art of Nüshu through study, workshops, and community.',
      ctaPrimary: 'See upcoming events',
      ctaSecondary: 'Learn more about us',
    },
    stats: [
      { icon: Users, label: 'Student led', value: 'Community' },
      { icon: HeartHandshake, label: 'Open to all', value: 'Inclusive' },
      { icon: Calendar, label: 'Regular events', value: 'Active' },
    ],
    sections: {
      about: {
        title: 'About Nüshu',
        description: 'A unique women-associated script from Jiangyong, Hunan, connecting philology, material culture, gender history, and artistic practice.',
      },
      events: {
        title: 'Upcoming Events',
        description: 'Join our community through workshops, seminars, and cultural events.',
        cta: 'View all events',
      },
      gallery: {
        title: 'Gallery',
        description: 'Explore our collection of Nüshu calligraphy and cultural heritage.',
        cta: 'Visit gallery',
      },
      contact: {
        title: 'Get Involved',
        description: 'Become a member, volunteer, or propose a collaboration.',
        cta: 'Contact us',
      }
    }
  },
  zh: {
    hero: {
      title: '女书文化与研究协会',
      subtitle: '以学术与实践并重的方式，研究、书写并分享女书的当代生命力。',
      ctaPrimary: '查看近期活动',
      ctaSecondary: '了解更多',
    },
    stats: [
      { icon: Users, label: '学生主导', value: '社区' },
      { icon: HeartHandshake, label: '开放包容', value: '多元' },
      { icon: Calendar, label: '定期活动', value: '活跃' },
    ],
    sections: {
      about: {
        title: '关于女书',
        description: '来自湖南江永的独特女性文字，连接文字学、物质文化、性别史与艺术实践。',
      },
      events: {
        title: '近期活动',
        description: '通过工作坊、学术讲座和文化活动加入我们的社区。',
        cta: '查看所有活动',
      },
      gallery: {
        title: '画廊',
        description: '探索我们的女书书法和文化遗产收藏。',
        cta: '访问画廊',
      },
      contact: {
        title: '参与其中',
        description: '成为会员、志愿者或提出合作建议。',
        cta: '联系我们',
      }
    }
  }
};

export default function Home() {
  const [lang, setLang] = React.useState<'en' | 'zh'>('en');
  const t = translations[lang];
  const { events = [] } = useUpcomingEvents(10);

  // Filter only current events
  const currentEvents = events.filter(event => event.status === 'current').slice(0, 3);

  const heroPhotos = [
    '/WechatIMG1020.jpg',
    '/WechatIMG1021.jpg',
    '/crying-bride2.jpg',
    '/nushu-embroidery.JPG',
    '/crying-bride1.JPG',
    '/成人礼.JPG',
    '/坐歌堂.JPG',
    '/永州地图.jpg',
  ];

  return (
    <Layout currentLang={lang} onLangChange={setLang}>
      {/* Hero Section */}
      <section className="relative">
        <div className="mx-auto w-full max-w-7xl px-8 lg:px-12">
          <div className="py-28 lg:py-40 grid lg:grid-cols-12 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-7"
            >
              <h1 className="font-serif text-4xl lg:text-6xl xl:text-7xl font-normal tracking-tight leading-[1.1] text-nushu-sage mb-8">
                {t.hero.title}
              </h1>
              <p className="text-xl lg:text-2xl text-nushu-sage/80 leading-relaxed mb-12 max-w-2xl">
                {t.hero.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-6 mb-12">
                <motion.button
                  onClick={() => navigateTo('/events')}
                  className="inline-flex items-center justify-center px-8 py-4 bg-nushu-terracotta text-white font-medium hover:bg-nushu-terracotta/90 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {t.hero.ctaPrimary}
                </motion.button>
                <motion.button
                  onClick={() => navigateTo('/about')}
                  className="inline-flex items-center justify-center px-8 py-4 border border-nushu-sage text-nushu-sage font-medium hover:bg-nushu-cream transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {t.hero.ctaSecondary}
                </motion.button>
              </div>
              <div className="flex items-center gap-8 text-sm text-nushu-sage/70">
                {t.stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center gap-2"
                  >
                    <stat.icon className="w-5 h-5" />
                    <span>{stat.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-5"
            >
              <div className="aspect-[3/4] bg-nushu-cream relative overflow-hidden">
                <div className="absolute inset-0 grid grid-cols-2 grid-rows-4 gap-2 p-6">
                  {heroPhotos.slice(0, 8).map((photo, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.3 + i * 0.05 }}
                      className="overflow-hidden hover:scale-105 transition-transform duration-300"
                    >
                      <img
                        src={photo}
                        alt=""
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="py-28 lg:py-36 bg-nushu-warm-white">
        <div className="mx-auto w-full max-w-7xl px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl"
          >
            <div className="flex items-center gap-4 mb-8">
              <BookOpen className="w-7 h-7 text-nushu-terracotta" />
              <h2 className="font-serif text-3xl lg:text-5xl font-normal tracking-tight text-nushu-sage">
                {t.sections.about.title}
              </h2>
            </div>
            <p className="text-xl lg:text-2xl leading-relaxed text-nushu-sage/90 font-light mb-8">
              {t.sections.about.description}
            </p>
            <motion.button
              onClick={() => navigateTo('/about')}
              className="inline-flex items-center gap-2 text-nushu-terracotta hover:gap-4 transition-all font-medium"
              whileHover={{ x: 5 }}
            >
              <span>Learn more</span>
              <span className="text-xl">→</span>
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Events Preview */}
      <section className="py-28 lg:py-36">
        <div className="mx-auto w-full max-w-7xl px-8 lg:px-12">
          <div className="flex items-center justify-between mb-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-4 mb-4">
                <Calendar className="w-7 h-7 text-nushu-terracotta" />
                <h2 className="font-serif text-3xl lg:text-5xl font-normal tracking-tight text-nushu-sage">
                  {t.sections.events.title}
                </h2>
              </div>
              <p className="text-lg text-nushu-sage/80 max-w-2xl">
                {t.sections.events.description}
              </p>
            </motion.div>
            <motion.button
              onClick={() => navigateTo('/events')}
              className="hidden lg:inline-flex items-center gap-2 px-6 py-3 bg-nushu-terracotta text-white font-medium hover:bg-nushu-terracotta/90 transition-all"
              whileHover={{ scale: 1.05 }}
            >
              {t.sections.events.cta}
            </motion.button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {currentEvents.length > 0 ? (
              currentEvents.map((event, index) => (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white border border-nushu-sage/10 p-8 hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onClick={() => navigateTo('/events')}
                >
                  <div className="mb-3">
                    <span className="inline-block px-3 py-1 text-xs font-medium bg-nushu-terracotta/10 text-nushu-terracotta uppercase tracking-wide">
                      Current
                    </span>
                  </div>
                  <h3 className="text-xl font-serif text-nushu-sage mb-3">{event.title}</h3>
                  <p className="text-sm text-nushu-sage/70 mb-4">{event.date} • {event.time}</p>
                  <p className="text-nushu-sage/80 leading-relaxed">{event.blurb}</p>
                </motion.div>
              ))
            ) : (
              <div className="lg:col-span-3 text-center py-12">
                <Calendar className="w-12 h-12 text-nushu-sage/30 mx-auto mb-4" />
                <p className="text-nushu-sage/70">No current events at the moment. Check back soon!</p>
              </div>
            )}
          </div>

          <motion.button
            onClick={() => navigateTo('/events')}
            className="lg:hidden mt-8 w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-nushu-terracotta text-white font-medium hover:bg-nushu-terracotta/90 transition-all"
            whileHover={{ scale: 1.02 }}
          >
            {t.sections.events.cta}
          </motion.button>
        </div>
      </section>

      {/* Gallery & Contact CTA */}
      <section className="py-28 lg:py-36 bg-nushu-cream">
        <div className="mx-auto w-full max-w-7xl px-8 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-nushu-sage text-white p-12 cursor-pointer hover:scale-[1.02] transition-transform"
              onClick={() => navigateTo('/gallery')}
            >
              <Images className="w-12 h-12 mb-6" />
              <h3 className="font-serif text-3xl lg:text-4xl mb-4">{t.sections.gallery.title}</h3>
              <p className="text-white/90 text-lg mb-6 leading-relaxed">{t.sections.gallery.description}</p>
              <div className="inline-flex items-center gap-2 font-medium hover:gap-4 transition-all">
                <span>{t.sections.gallery.cta}</span>
                <span className="text-xl">→</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-nushu-terracotta text-white p-12 cursor-pointer hover:scale-[1.02] transition-transform"
              onClick={() => navigateTo('/contact')}
            >
              <Mail className="w-12 h-12 mb-6" />
              <h3 className="font-serif text-3xl lg:text-4xl mb-4">{t.sections.contact.title}</h3>
              <p className="text-white/90 text-lg mb-6 leading-relaxed">{t.sections.contact.description}</p>
              <div className="inline-flex items-center gap-2 font-medium hover:gap-4 transition-all">
                <span>{t.sections.contact.cta}</span>
                <span className="text-xl">→</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
