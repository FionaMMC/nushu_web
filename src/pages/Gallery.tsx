import React from 'react';
import { motion } from 'framer-motion';
import { Images } from 'lucide-react';
import Layout from '../components/layout/Layout';

const translations = {
  en: {
    hero: {
      title: 'Gallery',
      subtitle: 'Explore our collection of Nüshu calligraphy, workshops, and cultural heritage',
    },
  },
  zh: {
    hero: {
      title: '作品与现场',
      subtitle: '探索我们的女书书法、工作坊和文化遗产收藏',
    },
  },
};

// Gallery images from public folder
const galleryImages = [
  {
    id: '1',
    src: '/WechatIMG1020.jpg',
    title: 'Nüshu Calligraphy Workshop',
    titleZh: '女书书法工作坊',
    alt: 'Students practicing Nüshu calligraphy',
    description: 'Workshop participants learning traditional Nüshu writing techniques',
    descriptionZh: '工作坊参与者学习传统女书书写技巧',
  },
  {
    id: '2',
    src: '/WechatIMG1021.jpg',
    title: 'Community Gathering',
    titleZh: '社区聚会',
    alt: 'Community members gathered for cultural activities',
    description: 'Cultural exchange and discussion session',
    descriptionZh: '文化交流和讨论会',
  },
  {
    id: '3',
    src: '/crying-bride1.JPG',
    title: 'Traditional Nüshu Text',
    titleZh: '传统女书文本',
    alt: 'Historical Nüshu manuscript',
    description: 'Example of traditional women\'s writing',
    descriptionZh: '传统女性书写范例',
  },
  {
    id: '4',
    src: '/crying-bride2.jpg',
    title: 'Nüshu Documentation',
    titleZh: '女书文献',
    alt: 'Documentation of Nüshu texts',
    description: 'Preserving the written heritage',
    descriptionZh: '保护书写遗产',
  },
  {
    id: '5',
    src: '/nushu-embroidery.JPG',
    title: 'Nüshu Embroidery',
    titleZh: '女书刺绣',
    alt: 'Traditional embroidery with Nüshu characters',
    description: 'Integration of writing and textile arts',
    descriptionZh: '书写与纺织艺术的融合',
  },
  {
    id: '6',
    src: '/成人礼.JPG',
    title: 'Coming of Age Ceremony',
    titleZh: '成人礼',
    alt: 'Traditional coming of age ceremony',
    description: 'Cultural celebration and rite of passage',
    descriptionZh: '文化庆典与成年仪式',
  },
  {
    id: '7',
    src: '/密语者.jpg',
    title: 'The Secret Writers',
    titleZh: '密语者',
    alt: 'Historical photo of Nüshu practitioners',
    description: 'Women who preserved the writing tradition',
    descriptionZh: '保护书写传统的女性',
  },
  {
    id: '8',
    src: '/永州地图.jpg',
    title: 'Yongzhou Regional Map',
    titleZh: '永州地图',
    alt: 'Map showing Nüshu region',
    description: 'Geographic origins of Nüshu culture',
    descriptionZh: '女书文化的地理起源',
  },
  {
    id: '9',
    src: '/坐歌堂.JPG',
    title: 'Zuoge Hall',
    titleZh: '坐歌堂',
    alt: 'Traditional singing hall',
    description: 'Cultural gathering space for women',
    descriptionZh: '女性的文化聚会空间',
  },
];

export default function Gallery() {
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
            <div className="flex items-center gap-4 mb-6">
              <Images className="w-8 h-8 text-nushu-terracotta" />
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

      {/* Gallery Grid */}
      <section className="py-28 lg:py-36">
        <div className="mx-auto w-full max-w-7xl px-8 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {galleryImages.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="aspect-[3/4] bg-nushu-cream overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300 relative"
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement?.classList.add(
                      'bg-gradient-to-b',
                      'from-nushu-sage/10',
                      'to-nushu-terracotta/10'
                    );
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <div className="p-6 text-white w-full">
                    <h3 className="font-serif text-lg mb-2">
                      {lang === 'en' ? image.title : image.titleZh}
                    </h3>
                    <p className="text-sm text-white/90 line-clamp-2">
                      {lang === 'en' ? image.description : image.descriptionZh}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
