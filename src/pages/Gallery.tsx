import React from 'react';
import { motion } from 'framer-motion';
import { Images, Loader2, AlertCircle } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useGalleryImages } from '../hooks/useApi';

const translations = {
  en: {
    hero: {
      title: 'Gallery',
      subtitle: 'Explore our collection of Nüshu calligraphy, workshops, and cultural heritage',
    },
    loading: 'Loading gallery...',
    error: 'Unable to load gallery images',
    noImages: 'No images available yet. Check back soon!',
  },
  zh: {
    hero: {
      title: '作品与现场',
      subtitle: '探索我们的女书书法、工作坊和文化遗产收藏',
    },
    loading: '加载画廊中...',
    error: '无法加载画廊图片',
    noImages: '暂无图片，敬请期待！',
  },
};

// Static gallery images from public folder
const staticGalleryImages = [
  {
    id: 'static-1',
    src: '/WechatIMG1020.jpg',
    title: 'Nüshu Calligraphy Workshop',
    alt: 'Students practicing Nüshu calligraphy',
    description: 'Workshop participants learning traditional Nüshu writing techniques',
  },
  {
    id: 'static-2',
    src: '/WechatIMG1021.jpg',
    title: 'Community Gathering',
    alt: 'Community members gathered for cultural activities',
    description: 'Cultural exchange and discussion session',
  },
  {
    id: 'static-3',
    src: '/crying-bride1.JPG',
    title: 'Traditional Nüshu Text',
    alt: 'Historical Nüshu manuscript',
    description: 'Example of traditional women\'s writing',
  },
  {
    id: 'static-4',
    src: '/crying-bride2.jpg',
    title: 'Nüshu Documentation',
    alt: 'Documentation of Nüshu texts',
    description: 'Preserving the written heritage',
  },
  {
    id: 'static-5',
    src: '/nushu-embroidery.JPG',
    title: 'Nüshu Embroidery',
    alt: 'Traditional embroidery with Nüshu characters',
    description: 'Integration of writing and textile arts',
  },
  {
    id: 'static-6',
    src: '/成人礼.JPG',
    title: 'Coming of Age Ceremony',
    alt: 'Traditional coming of age ceremony',
    description: 'Cultural celebration and rite of passage',
  },
  {
    id: 'static-7',
    src: '/密语者.jpg',
    title: 'The Secret Writers',
    alt: 'Historical photo of Nüshu practitioners',
    description: 'Women who preserved the writing tradition',
  },
  {
    id: 'static-8',
    src: '/永州地图.jpg',
    title: 'Yongzhou Regional Map',
    alt: 'Map showing Nüshu region',
    description: 'Geographic origins of Nüshu culture',
  },
  {
    id: 'static-9',
    src: '/坐歌堂.JPG',
    title: 'Zuoge Hall',
    alt: 'Traditional singing hall',
    description: 'Cultural gathering space for women',
  },
];

export default function Gallery() {
  const [lang, setLang] = React.useState<'en' | 'zh'>('en');
  const t = translations[lang];

  const {
    images: galleryImages,
    loading: galleryLoading,
    error: galleryError,
  } = useGalleryImages({ limit: 20, sort: 'priority' });

  // Use dynamic images if available, otherwise fallback to static images
  const displayImages =
    galleryImages.length > 0
      ? galleryImages.map((img) => ({
          id: img._id,
          src: img.thumbnailUrl,
          title: img.title,
          alt: img.alt,
          description: img.description || '',
        }))
      : staticGalleryImages;

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
          {galleryLoading ? (
            <div className="text-center py-16">
              <Loader2 className="w-16 h-16 text-nushu-sage/30 mx-auto mb-6 animate-spin" />
              <p className="text-nushu-sage/70">{t.loading}</p>
            </div>
          ) : galleryError && displayImages.length === 0 ? (
            <div className="text-center py-16">
              <AlertCircle className="w-16 h-16 text-nushu-sage/30 mx-auto mb-6" />
              <p className="text-nushu-sage/70">{t.error}</p>
            </div>
          ) : displayImages.length === 0 ? (
            <div className="text-center py-16">
              <Images className="w-16 h-16 text-nushu-sage/30 mx-auto mb-6" />
              <p className="text-nushu-sage/70">{t.noImages}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              {displayImages.map((image, index) => (
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
                      <h3 className="font-serif text-lg mb-2">{image.title}</h3>
                      {image.description && (
                        <p className="text-sm text-white/90 line-clamp-2">
                          {image.description}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
