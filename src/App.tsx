import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Feather,
  HeartHandshake,
  Images,
  Mail,
  MapPin,
  Users,
  Calendar,
  Globe,
  PenTool,
  Heart,
} from "lucide-react";

/* =========================================
   Text content (EN / ZH)
========================================= */
const en = {
  nav: {
    home: "Home",
    about: "About",
    events: "Events",
    resources: "Resources",
    gallery: "Gallery",
    join: "Join",
  },
  hero: {
    title: "Sydney University Nüshu Society",
    subtitle:
      "Researching, practicing, and sharing the living art of Nüshu through study, workshops, and community.",
    ctaPrimary: "See upcoming events",
    ctaSecondary: "What is Nüshu?",
  },
  about: {
    heading: "About the Society",
    body: "We are a student-led society at the University of Sydney dedicated to the study and contemporary practice of Nüshu, a women-associated script from Jiangyong, Hunan. Our work connects philology, material culture, gender history, and artistic practice. We host reading groups, calligraphy sessions, and public talks in collaboration with scholars and community custodians.",
  },
  events: {
    heading: "Events",
    empty: "No events are scheduled yet. Check back soon or subscribe below.",
  },
  resources: {
    heading: "Resources",
    blurb:
      "Curated materials for learning and teaching, including primers, bibliographies, and workshop sheets. The selection below is a start; contribute suggestions via the contact form.",
  },
  gallery: { heading: "Gallery" },
  join: {
    heading: "Join and Contact",
    blurb:
      "Become a member, volunteer, or propose a collaboration. Complete the form and we will follow up by email.",
    name: "Full name",
    email: "Email",
    msg: "Your message",
    submit: "Send",
    thanks: "Thank you. We will be in touch shortly.",
  },
  footer: {
    legal: "© " + new Date().getFullYear() + " Sydney University Nüshu Society",
  },
};

const zh = {
  nav: {
    home: "首页",
    about: "社团简介",
    events: "活动",
    resources: "资源",
    gallery: "画廊",
    join: "加入",
  },
  hero: {
    title: "悉尼大学女书社",
    subtitle: "以学术与实践并重的方式，研究、书写并分享女书的当代生命力。",
    ctaPrimary: "查看近期活动",
    ctaSecondary: "什么是女书",
  },
  about: {
    heading: "关于我们",
    body: "本社团由悉尼大学学生发起，关注湖南江永女书的历史文献与当代表达，跨越文字学、性别史与物质文化研究，并开展书写工作坊与学术讲座。欢迎不同学科背景的同学加入。",
  },
  events: {
    heading: "活动预告",
    empty: "暂时没有排期，欢迎订阅邮件以获取更新。",
  },
  resources: {
    heading: "学习资源",
    blurb: "入门资料、参考书目与工作坊讲义。以下为示例，欢迎通过表单补充建议。",
  },
  gallery: { heading: "作品与现场" },
  join: {
    heading: "加入与联系",
    blurb: "填写表单即可成为会员或提出合作建议，我们将以邮件回复。",
    name: "姓名",
    email: "邮箱",
    msg: "留言",
    submit: "发送",
    thanks: "已收到，我们会尽快联系您。",
  },
  footer: { legal: "© " + new Date().getFullYear() + " 悉尼大学女书社" },
};

/* =========================================
   Events + helpers
========================================= */
const toKey = (title: string) =>
  "wish:" + title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

// Event management system - can be easily connected to a CMS or API
interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  tags: string[];
  blurb: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  registrationLink?: string;
  capacity?: number;
  currentRegistrations?: number;
}

// Sample events - this can be replaced with API calls or CMS integration
const createEventsData = (): Event[] => [
  {
    id: "welcome-seminar-2025",
    title: "Welcome Seminar: Introduction to Nüshu",
    date: "2025-08-14",
    time: "18:00 – 20:00",
    venue: "Law Library, Law Group Study Room M107",
    tags: ["Seminar", "Social"],
    blurb: "A welcoming session to introduce Nüshu for the semester, including an overview, practice, and social time.",
    status: "upcoming",
    registrationLink: "#",
    capacity: 30,
    currentRegistrations: 12
  },
  {
    id: "calligraphy-workshop-sept",
    title: "Calligraphy Workshop: Slender Gold to Nüshu Lines",
    date: "2025-09-05",
    time: "16:00 – 18:30",
    venue: "Fisher Library, Learning Studio 1",
    tags: ["Workshop", "Hands-on"],
    blurb: "Technique drills, stroke analysis, and stitched-letter forms on cloth. Materials provided.",
    status: "upcoming",
    registrationLink: "#",
    capacity: 20,
    currentRegistrations: 18
  },
  {
    id: "reading-group-oct",
    title: "Reading Group: Women's Scripts in Historical Context",
    date: "2025-10-12",
    time: "14:00 – 16:00",
    venue: "Quadrangle Building, Room S414",
    tags: ["Reading Group", "Academic"],
    blurb: "Discussion of recent scholarship on women's writing systems across cultures, with focus on Nüshu documentation.",
    status: "upcoming",
    capacity: 15,
    currentRegistrations: 7
  }
];

const sampleEvents = createEventsData();

const resources = [
  {
    title: "Starter Primer (PDF)",
    href: "#",
    desc: "A two-page primer on phonology, ductus, and materials.",
    icon: BookOpen,
  },
  {
    title: "Reading List",
    href: "#",
    desc: "Key scholarship and ethnographies for deeper study.",
    icon: Globe,
  },
  {
    title: "Workshop Sheet",
    href: "#",
    desc: "Printable grid and exemplar strokes for practice.",
    icon: PenTool,
  },
];

/* =========================================
   UI atoms
========================================= */
function LanguageSwitch({
  lang,
  setLang,
}: {
  lang: "en" | "zh";
  setLang: (l: "en" | "zh") => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setLang("en")}
        className={`px-4 py-2 text-sm font-medium transition-colors ${
          lang === "en"
            ? "bg-nushu-terracotta text-white"
            : "text-nushu-sage hover:bg-nushu-cream"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLang("zh")}
        className={`px-4 py-2 text-sm font-medium transition-colors ${
          lang === "zh"
            ? "bg-nushu-terracotta text-white"
            : "text-nushu-sage hover:bg-nushu-cream"
        }`}
      >
        中文
      </button>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-nushu-cream text-nushu-sage border border-nushu-sage/20">
      {children}
    </span>
  );
}
function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-7xl px-8 lg:px-12">{children}</div>
  );
}
function Section({
  id,
  title,
  icon: Icon,
  children,
}: {
  id: string;
  title: string;
  icon?: any;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="py-28 lg:py-36">
      <Container>
        <div className="mb-16 lg:mb-20">
          <div className="flex items-center gap-4 mb-6">
            {Icon && <Icon className="w-7 h-7 text-nushu-terracotta" />}
          </div>
          <h2 className="font-serif text-3xl lg:text-5xl font-normal tracking-tight text-nushu-sage leading-tight">
            {title}
          </h2>
        </div>
        {children}
      </Container>
    </section>
  );
}

/* =========================================
   Event card with heart + per-browser count
========================================= */
function EventCard({
  event,
  onDelta,
}: {
  event: Event;
  onDelta: (delta: number) => void;
}) {
  const [count, setCount] = useState<number>(0);
  const [liked, setLiked] = useState<boolean>(false);
  const key = toKey(event.title);

  useEffect(() => {
    const saved = window.localStorage.getItem(key);
    if (saved) {
      try {
        const { c, l } = JSON.parse(saved);
        if (typeof c === "number") setCount(c);
        if (typeof l === "boolean") setLiked(l);
      } catch {}
    }
  }, [key]);

  function persist(nextCount: number, nextLiked: boolean) {
    window.localStorage.setItem(
      key,
      JSON.stringify({ c: nextCount, l: nextLiked })
    );
  }

  function toggleHeart() {
    const nextLiked = !liked;
    const delta = nextLiked ? 1 : -1;
    const nextCount = Math.max(0, count + delta);
    setLiked(nextLiked);
    setCount(nextCount);
    persist(nextCount, nextLiked);
    onDelta(delta);
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  const isNearCapacity = event.capacity && event.currentRegistrations 
    ? (event.currentRegistrations / event.capacity) > 0.8 
    : false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative bg-white border border-nushu-sage/10 overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      {/* Status indicator */}
      <div className={`absolute top-0 left-0 w-full h-1 ${
        event.status === 'upcoming' ? 'bg-nushu-terracotta' :
        event.status === 'ongoing' ? 'bg-green-500' : 'bg-nushu-sage'
      }`} />
      
      <div className="p-8">
        {/* Header with wish button */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className={`px-3 py-1 text-xs font-medium uppercase tracking-wide ${
                event.status === 'upcoming' ? 'bg-nushu-terracotta/10 text-nushu-terracotta' :
                event.status === 'ongoing' ? 'bg-green-100 text-green-700' : 'bg-nushu-sage/10 text-nushu-sage'
              }`}>
                {event.status}
              </span>
              {isNearCapacity && (
                <span className="px-3 py-1 text-xs font-medium uppercase tracking-wide bg-amber-100 text-amber-700">
                  Almost Full
                </span>
              )}
            </div>
            <h3 className="text-xl lg:text-2xl font-serif font-normal text-nushu-sage leading-tight group-hover:text-nushu-terracotta transition-colors">
              {event.title}
            </h3>
          </div>
          
          <button
            aria-label="Wish to join"
            onClick={toggleHeart}
            className={`flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all ${
              liked
                ? "bg-nushu-terracotta text-white scale-105"
                : "bg-white text-nushu-sage hover:bg-nushu-cream border border-nushu-sage/20 hover:scale-105"
            }`}
          >
            <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
            <span>{count}</span>
          </button>
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
          
          {event.capacity && event.currentRegistrations !== undefined && (
            <div className="flex items-center gap-2 text-sm text-nushu-sage/60">
              <Users className="w-4 h-4" />
              <span>{event.currentRegistrations} / {event.capacity} registered</span>
              <div className="flex-1 bg-nushu-sage/10 rounded-full h-2 ml-2">
                <div 
                  className="bg-nushu-terracotta h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((event.currentRegistrations / event.capacity) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <p className="text-nushu-sage/90 leading-relaxed mb-6">{event.blurb}</p>

        {/* Tags and registration */}
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {event.tags.map((tag: string) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
          
          {event.registrationLink && event.status === 'upcoming' && (
            <a
              href={event.registrationLink}
              className="inline-flex items-center gap-2 px-4 py-2 bg-nushu-sage text-white text-sm font-medium hover:bg-nushu-sage/90 transition-all duration-300 hover:scale-105"
            >
              <span>Register</span>
              <span className="text-xs">→</span>
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* =========================================
   Page
========================================= */
export default function NusHuSocietySite() {
  const [lang, setLang] = useState<"en" | "zh">("en");
  const t = useMemo(() => (lang === "en" ? en : zh), [lang]);
  const [submitted, setSubmitted] = useState(false);

  // hero photos (place these files in /public)
  const heroPhotos = [
    "/WechatIMG1020.jpg",
    "/WechatIMG1021.jpg",
    "/crying-bride2.jpg",
    "/nushu-embroidery.JPG",
  ];

  // compute and keep a per-browser total wishes across all events
  const initialTotal = useMemo(() => {
    return sampleEvents.reduce((sum, ev) => {
      try {
        const raw = window.localStorage.getItem(toKey(ev.title));
        if (!raw) return sum;
        const obj = JSON.parse(raw);
        return sum + (typeof obj?.c === "number" ? obj.c : 0);
      } catch {
        return sum;
      }
    }, 0);
  }, []);
  const [totalWishes, setTotalWishes] = useState<number>(initialTotal);
  const handleDelta = (delta: number) =>
    setTotalWishes((x) => Math.max(0, x + delta));

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    console.log("Form submitted:", payload);
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-white text-nushu-sage">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur bg-white/95 border-b border-nushu-sage/10">
        <Container>
          <div className="flex items-center justify-between h-20">
            <a href="#home" className="flex items-center gap-3">
              <Feather className="w-6 h-6 text-nushu-terracotta" />
              <span className="font-serif text-xl font-medium text-nushu-sage">
                Nüshu Society
              </span>
            </a>
            <nav className="hidden lg:flex items-center gap-10 text-sm font-medium">
              <a
                href="#home"
                className="text-nushu-sage hover:text-nushu-terracotta transition-colors"
              >
                {t.nav.home}
              </a>
              <a
                href="#about"
                className="text-nushu-sage hover:text-nushu-terracotta transition-colors"
              >
                {t.nav.about}
              </a>
              <a
                href="#events"
                className="text-nushu-sage hover:text-nushu-terracotta transition-colors"
              >
                {t.nav.events}
              </a>
              <a
                href="#resources"
                className="text-nushu-sage hover:text-nushu-terracotta transition-colors"
              >
                {t.nav.resources}
              </a>
              <a
                href="#gallery"
                className="text-nushu-sage hover:text-nushu-terracotta transition-colors"
              >
                {t.nav.gallery}
              </a>
              <a
                href="#join"
                className="text-nushu-sage hover:text-nushu-terracotta transition-colors"
              >
                {t.nav.join}
              </a>
            </nav>
            <LanguageSwitch lang={lang} setLang={setLang} />
          </div>
        </Container>
      </header>

      {/* Hero */}
      <section id="home" className="relative">
        <Container>
          <div className="py-28 lg:py-40 grid lg:grid-cols-12 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7"
            >
              <h1 className="font-serif text-4xl lg:text-6xl xl:text-7xl font-normal tracking-tight leading-[1.1] text-nushu-sage mb-8">
                {t.hero.title}
              </h1>
              <p className="text-xl lg:text-2xl text-nushu-sage/80 leading-relaxed mb-12 max-w-2xl">
                {t.hero.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-6 mb-12">
                <a
                  href="#events"
                  className="inline-flex items-center justify-center px-8 py-4 bg-nushu-terracotta text-white font-medium hover:bg-nushu-terracotta/90 transition-colors"
                >
                  {t.hero.ctaPrimary}
                </a>
                <a
                  href="#about"
                  className="inline-flex items-center justify-center px-8 py-4 border border-nushu-sage text-nushu-sage font-medium hover:bg-nushu-cream transition-colors"
                >
                  {t.hero.ctaSecondary}
                </a>
              </div>
              <div className="flex items-center gap-8 text-sm text-nushu-sage/70">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>Student led</span>
                </div>
                <div className="flex items-center gap-2">
                  <HeartHandshake className="w-5 h-5" />
                  <span>Open to all faculties</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-5"
            >
              <div className="aspect-[3/4] bg-nushu-cream relative overflow-hidden">
                <div className="absolute inset-0 grid grid-cols-2 grid-rows-4 gap-2 p-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <img
                      key={i}
                      src={heroPhotos[i % heroPhotos.length]}
                      alt=""
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* About */}
      <Section id="about" title={t.about.heading} icon={Feather}>
        <div className="grid lg:grid-cols-5 gap-16 items-start">
          <div className="lg:col-span-3">
            <p className="text-xl lg:text-2xl leading-relaxed text-nushu-sage/90 font-light">
              {t.about.body}
            </p>
          </div>
          <div className="lg:col-span-2 bg-nushu-cream p-8 lg:p-10">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-6 h-6 text-nushu-terracotta" />
              <span className="font-medium text-nushu-sage">Research and practice</span>
            </div>
            <div className="text-nushu-sage/80 mb-6 leading-relaxed">
              Reading groups, calligraphy, and public humanities.
            </div>
            <div className="flex flex-wrap gap-3">
              <Tag>English</Tag>
              <Tag>中文</Tag>
              <Tag>Workshops</Tag>
            </div>
          </div>
        </div>
      </Section>

      {/* Events */}
      <section id="events" className="py-28 lg:py-36 bg-nushu-warm-white">
        <Container>
          <div className="mb-16 lg:mb-20">
            <div className="flex items-center gap-4 mb-6">
              <Calendar className="w-7 h-7 text-nushu-terracotta" />
            </div>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
              <div>
                <h2 className="font-serif text-3xl lg:text-5xl font-normal tracking-tight text-nushu-sage leading-tight mb-4">
                  {t.events.heading}
                </h2>
                <p className="text-lg text-nushu-sage/80 max-w-2xl leading-relaxed">
                  Join our community through workshops, seminars, and cultural events. All skill levels welcome.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-white border border-nushu-sage/10">
                  <Heart className="w-5 h-5 text-nushu-terracotta" />
                  <span className="text-nushu-sage text-sm">
                    <strong>{totalWishes}</strong> total wishes
                  </span>
                </div>
                
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-nushu-terracotta text-white">
                  <Users className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    {sampleEvents.reduce((sum, e) => sum + (e.currentRegistrations || 0), 0)} registered
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Event filters/categories - for future enhancement */}
          <div className="mb-12">
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2 bg-nushu-sage text-white text-sm font-medium">
                All Events
              </button>
              <button className="px-4 py-2 bg-white text-nushu-sage border border-nushu-sage/20 text-sm font-medium hover:bg-nushu-cream transition-colors">
                Workshops
              </button>
              <button className="px-4 py-2 bg-white text-nushu-sage border border-nushu-sage/20 text-sm font-medium hover:bg-nushu-cream transition-colors">
                Seminars
              </button>
              <button className="px-4 py-2 bg-white text-nushu-sage border border-nushu-sage/20 text-sm font-medium hover:bg-nushu-cream transition-colors">
                Reading Groups
              </button>
            </div>
          </div>

          {/* Events grid */}
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8 lg:gap-12">
            {sampleEvents.length === 0 ? (
              <div className="lg:col-span-2 xl:col-span-3">
                <div className="text-center py-16">
                  <Calendar className="w-16 h-16 text-nushu-sage/30 mx-auto mb-6" />
                  <h3 className="text-xl font-serif text-nushu-sage mb-4">No Upcoming Events</h3>
                  <p className="text-nushu-sage/70 mb-8">{t.events.empty}</p>
                  <a 
                    href="#join" 
                    className="inline-flex items-center gap-2 px-6 py-3 bg-nushu-terracotta text-white font-medium hover:bg-nushu-terracotta/90 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Get Notified</span>
                  </a>
                </div>
              </div>
            ) : (
              sampleEvents.map((event) => (
                <EventCard key={event.id} event={event} onDelta={handleDelta} />
              ))
            )}
          </div>
          
          {/* Add event interface for admins - placeholder for future enhancement */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-16 p-6 bg-white border border-dashed border-nushu-sage/30">
              <div className="text-center">
                <h3 className="text-lg font-medium text-nushu-sage mb-2">Event Management</h3>
                <p className="text-sm text-nushu-sage/70 mb-4">
                  This interface will allow authorized users to add, edit, and manage events.
                </p>
                <div className="flex justify-center gap-4">
                  <button className="px-4 py-2 bg-nushu-sage text-white text-sm font-medium hover:bg-nushu-sage/90 transition-colors">
                    + Add Event
                  </button>
                  <button className="px-4 py-2 bg-white text-nushu-sage border border-nushu-sage/20 text-sm font-medium hover:bg-nushu-cream transition-colors">
                    Manage Events
                  </button>
                </div>
              </div>
            </div>
          )}
        </Container>
      </section>

      {/* Resources */}
      <Section id="resources" title={t.resources.heading} icon={BookOpen}>
        <div className="max-w-5xl">
          <div className="mb-16">
            <p className="text-xl lg:text-2xl leading-relaxed text-nushu-sage/90 font-light max-w-2xl">
              {t.resources.blurb}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {resources.map((r, index) => (
              <a key={r.title} href={r.href} className="group block">
                <div
                  className={`h-full p-8 lg:p-10 transition-all duration-300 hover:scale-[1.02] ${
                    index === 0
                      ? "bg-nushu-terracotta text-white"
                      : index === 1
                      ? "bg-nushu-sage text-white"
                      : "bg-nushu-cream text-nushu-sage"
                  }`}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <r.icon
                      className={`w-8 h-8 ${
                        index === 0 || index === 1
                          ? "text-white/90"
                          : "text-nushu-terracotta"
                      }`}
                    />
                    <div
                      className={`text-sm font-medium tracking-wider uppercase ${
                        index === 0 || index === 1
                          ? "text-white/70"
                          : "text-nushu-sage/70"
                      }`}
                    >
                      Resource {String(index + 1).padStart(2, "0")}
                    </div>
                  </div>

                  <h3 className="text-2xl lg:text-3xl font-serif font-normal mb-4 leading-tight">
                    {r.title}
                  </h3>

                  <p
                    className={`text-lg leading-relaxed mb-8 ${
                      index === 0 || index === 1
                        ? "text-white/90"
                        : "text-nushu-sage/90"
                    }`}
                  >
                    {r.desc}
                  </p>

                  <div
                    className={`inline-flex items-center gap-2 font-medium ${
                      index === 0 || index === 1
                        ? "text-white"
                        : "text-nushu-terracotta"
                    } group-hover:gap-4 transition-all`}
                  >
                    <span>Access Resource</span>
                    <span className="text-xl">→</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </Section>

      {/* Gallery */}
      <Section id="gallery" title={t.gallery.heading} icon={Images}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[3/4] bg-nushu-cream overflow-hidden"
            >
              <div className="w-full h-full bg-gradient-to-b from-nushu-sage/10 to-nushu-terracotta/10" />
            </div>
          ))}
        </div>
      </Section>

      {/* Join */}
      <section id="join" className="py-28 lg:py-36 bg-nushu-cream">
        <Container>
          <div className="mb-16 lg:mb-20">
            <div className="flex items-center gap-4 mb-6">
              <Mail className="w-7 h-7 text-nushu-terracotta" />
            </div>
            <h2 className="font-serif text-3xl lg:text-5xl font-normal tracking-tight text-nushu-sage leading-tight mb-8">
              {t.join.heading}
            </h2>
            <p className="text-xl lg:text-2xl leading-relaxed text-nushu-sage/90 font-light max-w-3xl">
              {t.join.blurb}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12 lg:gap-16 mb-20">
            {/* Membership Card */}
            <div className="bg-white p-8 lg:p-10 border-t-4 border-nushu-terracotta">
              <div className="w-12 h-12 bg-nushu-terracotta/10 rounded-lg flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-nushu-terracotta" />
              </div>
              <h3 className="text-xl font-serif text-nushu-sage mb-4">
                Membership
              </h3>
              <p className="text-nushu-sage/80 leading-relaxed mb-6">
                Join our community of students interested in Nüshu research and
                practice. Access exclusive workshops, reading groups, and
                academic discussions.
              </p>
              <ul className="space-y-2 text-sm text-nushu-sage/70">
                <li>• Weekly reading groups</li>
                <li>• Calligraphy workshops</li>
                <li>• Academic seminars</li>
                <li>• Community events</li>
              </ul>
            </div>

            {/* Collaboration Card */}
            <div className="bg-white p-8 lg:p-10 border-t-4 border-nushu-sage">
              <div className="w-12 h-12 bg-nushu-sage/10 rounded-lg flex items-center justify-center mb-6">
                <HeartHandshake className="w-6 h-6 text-nushu-sage" />
              </div>
              <h3 className="text-xl font-serif text-nushu-sage mb-4">
                Collaboration
              </h3>
              <p className="text-nushu-sage/80 leading-relaxed mb-6">
                Partner with us on research projects, cultural events, or
                educational initiatives. We welcome academic and community
                collaborations.
              </p>
              <ul className="space-y-2 text-sm text-nushu-sage/70">
                <li>• Research partnerships</li>
                <li>• Cultural events</li>
                <li>• Educational programs</li>
                <li>• Public lectures</li>
              </ul>
            </div>

            {/* Support Card */}
            <div className="bg-white p-8 lg:p-10 border-t-4 border-nushu-terracotta/60">
              <div className="w-12 h-12 bg-nushu-terracotta/10 rounded-lg flex items-center justify-center mb-6">
                <Heart className="w-6 h-6 text-nushu-terracotta" />
              </div>
              <h3 className="text-xl font-serif text-nushu-sage mb-4">
                Support
              </h3>
              <p className="text-nushu-sage/80 leading-relaxed mb-6">
                Help preserve and promote Nüshu culture through volunteering,
                donations, or spreading awareness in your networks.
              </p>
              <ul className="space-y-2 text-sm text-nushu-sage/70">
                <li>• Event volunteering</li>
                <li>• Research assistance</li>
                <li>• Community outreach</li>
                <li>• Social media support</li>
              </ul>
            </div>
          </div>

          {/* Contact Form Section */}
          <div className="bg-white">
            <div className="grid lg:grid-cols-2">
              {/* Left Side - Contact Info */}
              <div className="bg-nushu-sage text-white p-10 lg:p-16">
                <h3 className="font-serif text-3xl lg:text-4xl font-normal mb-8 leading-tight">
                  Get in Touch
                </h3>
                <p className="text-white/90 text-lg leading-relaxed mb-12">
                  Ready to join our community or have questions about our work?
                  We'd love to hear from you.
                </p>

                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <Mail className="w-5 h-5 text-white/80 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-white font-medium mb-1">Email</h4>
                      <p className="text-white/80 text-sm">
                        nushu.society@sydney.edu.au
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <MapPin className="w-5 h-5 text-white/80 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-white font-medium mb-1">Location</h4>
                      <p className="text-white/80 text-sm">
                        University of Sydney
                        <br />
                        Camperdown Campus
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Calendar className="w-5 h-5 text-white/80 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-white font-medium mb-1">
                        Response Time
                      </h4>
                      <p className="text-white/80 text-sm">Within 48 hours</p>
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-white/20">
                  <p className="text-white/70 text-sm">
                    Follow us for updates on workshops, events, and Nüshu
                    research developments.
                  </p>
                </div>
              </div>

              {/* Right Side - Form */}
              <div className="p-10 lg:p-16">
                {submitted ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-nushu-terracotta rounded-full flex items-center justify-center mx-auto mb-6">
                      <Mail className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-3xl font-serif text-nushu-sage mb-4">
                      Message Sent Successfully
                    </h3>
                    <p className="text-nushu-sage/80 text-lg mb-8">
                      {t.join.thanks}
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="text-nushu-terracotta hover:text-nushu-terracotta/80 font-medium transition-colors"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                      <h3 className="text-2xl font-serif text-nushu-sage mb-2">
                        Contact Form
                      </h3>
                      <p className="text-nushu-sage/70 text-sm">
                        All fields are required
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div className="relative">
                        <input
                          name="name"
                          required
                          className="w-full border-0 border-b-2 border-nushu-sage/20 pb-4 pt-6 bg-transparent focus:border-nushu-terracotta focus:outline-none transition-colors peer placeholder-transparent"
                          placeholder="Full Name"
                          id="name"
                        />
                        <label
                          htmlFor="name"
                          className="absolute left-0 top-2 text-sm font-medium text-nushu-sage/60 transition-all peer-placeholder-shown:top-6 peer-placeholder-shown:text-base peer-placeholder-shown:text-nushu-sage/40 peer-focus:top-2 peer-focus:text-sm peer-focus:text-nushu-terracotta"
                        >
                          {t.join.name}
                        </label>
                      </div>

                      <div className="relative">
                        <input
                          name="email"
                          type="email"
                          required
                          className="w-full border-0 border-b-2 border-nushu-sage/20 pb-4 pt-6 bg-transparent focus:border-nushu-terracotta focus:outline-none transition-colors peer placeholder-transparent"
                          placeholder="Email Address"
                          id="email"
                        />
                        <label
                          htmlFor="email"
                          className="absolute left-0 top-2 text-sm font-medium text-nushu-sage/60 transition-all peer-placeholder-shown:top-6 peer-placeholder-shown:text-base peer-placeholder-shown:text-nushu-sage/40 peer-focus:top-2 peer-focus:text-sm peer-focus:text-nushu-terracotta"
                        >
                          {t.join.email}
                        </label>
                      </div>

                      <div className="relative">
                        <select
                          name="interest"
                          required
                          className="w-full border-0 border-b-2 border-nushu-sage/20 pb-4 pt-6 bg-transparent focus:border-nushu-terracotta focus:outline-none transition-colors text-nushu-sage"
                        >
                          <option value="" className="text-nushu-sage/40">
                            Select your interest...
                          </option>
                          <option
                            value="membership"
                            className="text-nushu-sage"
                          >
                            Become a member
                          </option>
                          <option
                            value="collaboration"
                            className="text-nushu-sage"
                          >
                            Propose collaboration
                          </option>
                          <option
                            value="volunteering"
                            className="text-nushu-sage"
                          >
                            Volunteer opportunities
                          </option>
                          <option value="research" className="text-nushu-sage">
                            Research inquiry
                          </option>
                          <option value="other" className="text-nushu-sage">
                            Other
                          </option>
                        </select>
                        <label className="block text-sm font-medium text-nushu-sage/60 mb-2">
                          Interest Area
                        </label>
                      </div>

                      <div className="relative">
                        <textarea
                          name="message"
                          rows={5}
                          required
                          className="w-full border-0 border-b-2 border-nushu-sage/20 pb-4 pt-6 bg-transparent focus:border-nushu-terracotta focus:outline-none resize-none transition-colors peer placeholder-transparent"
                          placeholder="Your Message"
                          id="message"
                        />
                        <label
                          htmlFor="message"
                          className="absolute left-0 top-2 text-sm font-medium text-nushu-sage/60 transition-all peer-placeholder-shown:top-6 peer-placeholder-shown:text-base peer-placeholder-shown:text-nushu-sage/40 peer-focus:top-2 peer-focus:text-sm peer-focus:text-nushu-terracotta"
                        >
                          {t.join.msg}
                        </label>
                      </div>
                    </div>

                    <div className="pt-6">
                      <button
                        type="submit"
                        className="w-full bg-nushu-terracotta text-white py-4 px-8 font-medium hover:bg-nushu-terracotta/90 transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-nushu-terracotta focus:ring-offset-2"
                      >
                        {t.join.submit} →
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Footer */}
      <footer className="border-t border-nushu-sage/10 py-16 lg:py-20">
        <Container>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <Feather className="w-5 h-5 text-nushu-terracotta" />
              <span className="text-nushu-sage/80">{t.footer.legal}</span>
            </div>
            <div className="flex items-center gap-8 text-sm">
              <a
                href="#join"
                className="text-nushu-sage hover:text-nushu-terracotta transition-colors"
              >
                Contact
              </a>
              <a
                href="#resources"
                className="text-nushu-sage hover:text-nushu-terracotta transition-colors"
              >
                Resources
              </a>
              <a
                href="#events"
                className="text-nushu-sage hover:text-nushu-terracotta transition-colors"
              >
                Events
              </a>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
}
