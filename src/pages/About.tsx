import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, Heart, Globe, PenTool, Sparkles } from 'lucide-react';
import Layout from '../components/layout/Layout';

const translations = {
  en: {
    hero: {
      title: 'About Us',
      subtitle: 'Preserving and celebrating Nüshu culture through research, practice, and community',
    },
    mission: {
      title: 'Our Mission',
      content: 'We are dedicated to the study and contemporary practice of Nüshu, a women-associated script from Jiangyong, Hunan. Our work connects philology, material culture, gender history, and artistic practice. We host reading groups, calligraphy sessions, and public talks in collaboration with scholars and community custodians.',
    },
    values: [
      {
        icon: BookOpen,
        title: 'Research Excellence',
        description: 'We pursue rigorous academic inquiry into Nüshu\'s linguistic, historical, and cultural dimensions.',
      },
      {
        icon: PenTool,
        title: 'Artistic Practice',
        description: 'We maintain and develop Nüshu calligraphy as a living art form through workshops and practice.',
      },
      {
        icon: Users,
        title: 'Community Building',
        description: 'We create inclusive spaces for learning, sharing, and celebrating Nüshu heritage.',
      },
      {
        icon: Globe,
        title: 'Cultural Bridge',
        description: 'We connect contemporary practitioners with traditional custodians and global communities.',
      },
      {
        icon: Heart,
        title: 'Inclusive Spirit',
        description: 'We welcome people of all backgrounds interested in women\'s writing systems and cultural heritage.',
      },
      {
        icon: Sparkles,
        title: 'Innovation',
        description: 'We explore new ways to preserve, practice, and promote Nüshu in the modern world.',
      },
    ],
    history: {
      title: 'About Nüshu',
      content: 'Nüshu is a syllabic script that developed among women in Jiangyong County, Hunan Province, China. Used primarily for correspondence, poetry, and personal expression, Nüshu represents a unique form of women\'s culture and sisterhood. Today, efforts to preserve and revitalize this remarkable script continue through research, education, and artistic practice.',
    },
    activities: {
      title: 'What We Do',
      items: [
        {
          title: 'Reading Groups',
          description: 'Regular sessions discussing scholarship on Nüshu, women\'s writing systems, and related topics.',
        },
        {
          title: 'Calligraphy Workshops',
          description: 'Hands-on practice sessions learning Nüshu characters, strokes, and artistic techniques.',
        },
        {
          title: 'Academic Seminars',
          description: 'Public talks and discussions with scholars, researchers, and community experts.',
        },
        {
          title: 'Cultural Events',
          description: 'Exhibitions, performances, and celebrations connecting Nüshu to broader cultural contexts.',
        },
      ],
    },
  },
  zh: {
    hero: {
      title: '关于我们',
      subtitle: '通过研究、实践与社区建设，保护和弘扬女书文化',
    },
    mission: {
      title: '我们的使命',
      content: '本社团致力于湖南江永女书的历史文献与当代表达研究。我们跨越文字学、性别史与物质文化研究，并开展书写工作坊与学术讲座，与学者和社区守护者合作，共同探索女书的当代生命力。',
    },
    values: [
      {
        icon: BookOpen,
        title: '学术卓越',
        description: '我们对女书的语言学、历史和文化维度进行严谨的学术研究。',
      },
      {
        icon: PenTool,
        title: '艺术实践',
        description: '通过工作坊和练习，我们维护和发展女书书法作为一种活的艺术形式。',
      },
      {
        icon: Users,
        title: '社区建设',
        description: '我们创建包容的空间，用于学习、分享和庆祝女书遗产。',
      },
      {
        icon: Globe,
        title: '文化桥梁',
        description: '我们连接当代实践者、传统守护者和全球社区。',
      },
      {
        icon: Heart,
        title: '包容精神',
        description: '我们欢迎所有对女性书写系统和文化遗产感兴趣的人。',
      },
      {
        icon: Sparkles,
        title: '创新发展',
        description: '我们探索在现代世界中保护、实践和推广女书的新方式。',
      },
    ],
    history: {
      title: '关于女书',
      content: '女书是一种在中国湖南省江永县妇女中发展起来的音节文字。主要用于通信、诗歌和个人表达，女书代表了一种独特的女性文化和姐妹情谊形式。今天，通过研究、教育和艺术实践，保护和复兴这一非凡文字的努力仍在继续。',
    },
    activities: {
      title: '我们的活动',
      items: [
        {
          title: '读书会',
          description: '定期讨论女书、女性书写系统及相关主题的学术研究。',
        },
        {
          title: '书法工作坊',
          description: '实践课程，学习女书字符、笔画和艺术技巧。',
        },
        {
          title: '学术讲座',
          description: '与学者、研究人员和社区专家进行公开讲座和讨论。',
        },
        {
          title: '文化活动',
          description: '展览、表演和庆祝活动，将女书与更广泛的文化背景联系起来。',
        },
      ],
    },
  },
};

export default function About() {
  const [lang, setLang] = React.useState<'en' | 'zh'>('en');
  const t = translations[lang];

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
            <h1 className="font-serif text-4xl lg:text-6xl xl:text-7xl font-normal tracking-tight leading-[1.1] text-nushu-sage mb-8">
              {t.hero.title}
            </h1>
            <p className="text-xl lg:text-2xl text-nushu-sage/80 leading-relaxed">
              {t.hero.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-28 lg:py-36">
        <div className="mx-auto w-full max-w-7xl px-8 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-4 mb-8">
                <BookOpen className="w-8 h-8 text-nushu-terracotta" />
                <h2 className="font-serif text-3xl lg:text-5xl font-normal tracking-tight text-nushu-sage">
                  {t.mission.title}
                </h2>
              </div>
              <p className="text-xl leading-relaxed text-nushu-sage/90 font-light">
                {t.mission.content}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative aspect-[4/3] bg-nushu-cream overflow-hidden"
            >
              <img
                src="/WechatIMG1020.jpg"
                alt="Nüshu practice"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-28 lg:py-36 bg-nushu-warm-white">
        <div className="mx-auto w-full max-w-7xl px-8 lg:px-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-serif text-3xl lg:text-5xl font-normal tracking-tight text-nushu-sage mb-16 text-center"
          >
            Our Values
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {t.values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-8 border border-nushu-sage/10 hover:shadow-lg transition-all duration-300"
              >
                <value.icon className="w-10 h-10 text-nushu-terracotta mb-6" />
                <h3 className="text-xl font-serif text-nushu-sage mb-4">{value.title}</h3>
                <p className="text-nushu-sage/80 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* History of Nüshu */}
      <section className="py-28 lg:py-36">
        <div className="mx-auto w-full max-w-7xl px-8 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative aspect-[4/3] bg-nushu-cream overflow-hidden order-2 lg:order-1"
            >
              <img
                src="/密语者.jpg"
                alt="Nüshu history"
                className="w-full h-full object-cover"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-1 lg:order-2"
            >
              <h2 className="font-serif text-3xl lg:text-5xl font-normal tracking-tight text-nushu-sage mb-8">
                {t.history.title}
              </h2>
              <p className="text-xl leading-relaxed text-nushu-sage/90 font-light">
                {t.history.content}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Activities */}
      <section className="py-28 lg:py-36 bg-nushu-cream">
        <div className="mx-auto w-full max-w-7xl px-8 lg:px-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-serif text-3xl lg:text-5xl font-normal tracking-tight text-nushu-sage mb-16"
          >
            {t.activities.title}
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-8">
            {t.activities.items.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-10 border-l-4 border-nushu-terracotta hover:shadow-lg transition-all duration-300"
              >
                <h3 className="text-2xl font-serif text-nushu-sage mb-4">{activity.title}</h3>
                <p className="text-lg text-nushu-sage/80 leading-relaxed">{activity.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
