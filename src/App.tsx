import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Feather, HeartHandshake, Images, Mail, MapPin, Users, Calendar, Globe, PenTool } from "lucide-react";

// Simple, dependency-light starter for a society site. 
// TailwindCSS classes are used for styling; no external UI kit required to run.
// Replace placeholder text and images as needed. Deploy with Vercel or Netlify.

const en = {
  nav: { home: "Home", about: "About", events: "Events", resources: "Resources", gallery: "Gallery", join: "Join" },
  hero: {
    title: "Sydney University Nüshu Society",
    subtitle: "Researching, practicing, and sharing the living art of Nüshu through study, workshops, and community.",
    ctaPrimary: "See upcoming events",
    ctaSecondary: "What is Nüshu?"
  },
  about: {
    heading: "About the Society",
    body:
      "We are a student-led society at the University of Sydney dedicated to the study and contemporary practice of Nüshu, a women-associated script from Jiangyong, Hunan. Our work connects philology, material culture, gender history, and artistic practice. We host reading groups, calligraphy sessions, and public talks in collaboration with scholars and community custodians.",
  },
  events: {
  heading: "Events",
  list: [
    {
      title: "Welcome Seminar: Introduction to Nüshu",
      location: "Law Library, Law Group Study Room M107",
      date: "2025-08-14",
      time: "18:00 – 20:00",
      description: "A welcoming session to introduce Nüshu for the semester, including an overview, practice, and social time.",
      tags: ["Seminar", "Social"]
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
  footer: { legal: "© "+new Date().getFullYear()+" Sydney University Nüshu Society" }
};

const zh = {
  nav: { home: "首页", about: "社团简介", events: "活动", resources: "资源", gallery: "画廊", join: "加入" },
  hero: {
    title: "悉尼大学女书社",
    subtitle: "以学术与实践并重的方式，研究、书写并分享女书的当代生命力。",
    ctaPrimary: "查看近期活动",
    ctaSecondary: "什么是女书"
  },
  about: {
    heading: "关于我们",
    body:
      "本社团由悉尼大学学生发起，关注女书的历史语境与当代表达，跨越语言学、性别史与物质文化研究，开展艺术工作坊与学术讲座。欢迎不同学科背景的同学加入。",
  },
  events: {
    heading: "活动预告",
      title_zh: "迎新研讨会：女书简史",
      location_zh: "USYD, Law Library, Law Group Study Room M107",
      date: "2025-08-14",
      time: "18:00 – 20:00",
      description_zh: "本学期的欢迎活动，介绍女书的起源、历史及其文化意涵，包括概述、交流和讨论时间。",
      tags: ["Seminar", "Social"]
    },
  },
  resources: {
    heading: "学习资源",
    blurb:
      "入门资料、参考书目与工作坊讲义。以下为示例，欢迎通过表单补充建议。",
  },
  gallery: { heading: "作品与现场" },
  join: {
    heading: "加入与联系",
    blurb:
      "填写表单即可成为会员或提出合作建议，我们将以邮件回复。",
    name: "姓名",
    email: "邮箱",
    msg: "留言",
    submit: "发送",
    thanks: "已收到，我们会尽快联系您。",
  },
  footer: { legal: "© "+new Date().getFullYear()+" 悉尼大学女书社" }
};

const sampleEvents = [
  {
    title: "Welcome Night and Intro to Nüshu",
    date: "2025-08-22",
    time: "18:00",
    venue: "Old Teachers College, Seminar Room 203",
    tags: ["Talk", "Social"],
    blurb: "A short primer on the script, followed by tea and handwriting practice.",
  },
  {
    title: "Calligraphy Workshop: Slender Gold to Nüshu Lines",
    date: "2025-09-05",
    time: "16:00",
    venue: "Fisher Library, Learning Studio 1",
    tags: ["Workshop"],
    blurb: "Technique drills, stroke analysis, and stitched-letter forms on cloth.",
  },
];

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

function LanguageSwitch({ lang, setLang }: { lang: "en"|"zh"; setLang: (l: "en"|"zh") => void }) {
  return (
    <div className="flex items-center gap-2">
      <button onClick={() => setLang("en")} className={`px-3 py-1 rounded-full text-sm border ${lang==="en"?"bg-gray-900 text-white border-gray-900":"bg-white border-gray-300"}`}>EN</button>
      <button onClick={() => setLang("zh")} className={`px-3 py-1 rounded-full text-sm border ${lang==="zh"?"bg-gray-900 text-white border-gray-900":"bg-white border-gray-300"}`}>中文</button>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center rounded-full px-3 py-1 text-xs border border-gray-300">{children}</span>;
}

function Container({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-6xl px-6">{children}</div>;
}

function Section({ id, title, icon: Icon, children }: { id: string; title: string; icon?: any; children: React.ReactNode }) {
  return (
    <section id={id} className="py-20">
      <Container>
        <div className="flex items-center gap-3 mb-8">
          {Icon && <Icon className="w-6 h-6" />}
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">{title}</h2>
        </div>
        {children}
      </Container>
    </section>
  );
}

function EventCard({ e }: { e: any }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-2xl border p-6 shadow-sm bg-white">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <h3 className="text-lg font-medium">{e.title}</h3>
        <div className="flex items-center gap-2 text-sm"><Calendar className="w-4 h-4" /><span>{e.date}</span><span>·</span><span>{e.time}</span></div>
      </div>
      <div className="mt-1 flex items-center gap-2 text-sm text-gray-600"><MapPin className="w-4 h-4" /><span>{e.venue}</span></div>
      <p className="mt-3 text-gray-800 leading-relaxed">{e.blurb}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {e.tags?.map((t: string) => <Tag key={t}>{t}</Tag>)}
      </div>
    </motion.div>
  );
}

export default function NusHuSocietySite() {
  const [lang, setLang] = useState<"en"|"zh">("en");
  const t = useMemo(() => (lang === "en" ? en : zh), [lang]);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    console.log("Form submitted:", payload);
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f7f5] to-white text-gray-900">
      <header className="sticky top-0 z-30 backdrop-blur bg-white/80 border-b">
        <Container>
          <div className="flex items-center justify-between h-16">
            <a href="#home" className="flex items-center gap-2">
              <Feather className="w-5 h-5" />
              <span className="font-semibold">Nüshu Society</span>
            </a>
            <nav className="hidden md:flex items-center gap-8 text-sm">
              <a href="#home" className="hover:underline">{t.nav.home}</a>
              <a href="#about" className="hover:underline">{t.nav.about}</a>
              <a href="#events" className="hover:underline">{t.nav.events}</a>
              <a href="#resources" className="hover:underline">{t.nav.resources}</a>
              <a href="#gallery" className="hover:underline">{t.nav.gallery}</a>
              <a href="#join" className="hover:underline">{t.nav.join}</a>
            </nav>
            <LanguageSwitch lang={lang} setLang={setLang} />
          </div>
        </Container>
      </header>

      <section id="home" className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-rose-100/60 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-amber-100/60 blur-3xl" />
        </div>
        <Container>
          <div className="py-24 md:py-36 grid md:grid-cols-2 gap-10 items-center">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <h1 className="text-3xl md:text-5xl font-semibold tracking-tight leading-tight">
                {t.hero.title}
              </h1>
              <p className="mt-5 text-lg text-gray-700 leading-relaxed">
                {t.hero.subtitle}
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a href="#events" className="px-5 py-3 rounded-xl bg-gray-900 text-white">{t.hero.ctaPrimary}</a>
                <a href="#about" className="px-5 py-3 rounded-xl border">{t.hero.ctaSecondary}</a>
              </div>
              <div className="mt-6 flex items-center gap-4 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>Student led</span>
                <HeartHandshake className="w-4 h-4" />
                <span>Open to all faculties</span>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="relative">
              <div className="aspect-[4/3] rounded-3xl border bg-white shadow-sm overflow-hidden">
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-1 p-4">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border" />
                  ))}
                </div>
                <div className="absolute bottom-4 right-4 flex items-center gap-2 text-sm bg-white/80 backdrop-blur px-3 py-1.5 rounded-full border">
                  <Images className="w-4 h-4" />
                  <span>Replace with society photos</span>
                </div>
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      <Section id="about" title={t.about.heading} icon={Feather}>
        <div className="grid md:grid-cols-3 gap-8 items-start">
          <p className="md:col-span-2 text-gray-800 leading-relaxed">
            {t.about.body}
          </p>
          <div className="rounded-2xl border p-6 shadow-sm bg-white">
            <div className="flex items-center gap-2 text-sm"><BookOpen className="w-4 h-4"/><span>Research and practice</span></div>
            <div className="mt-2 text-sm text-gray-600">Reading groups, calligraphy, and public humanities.</div>
            <div className="mt-4 flex flex-wrap gap-2"><Tag>English</Tag><Tag>中文</Tag><Tag>Workshops</Tag></div>
          </div>
        </div>
      </Section>

      <Section id="events" title={t.events.heading} icon={Calendar}>
        <div className="grid md:grid-cols-2 gap-6">
          {(sampleEvents.length === 0) && (
            <div className="text-gray-600">{t.events.empty}</div>
          )}
          {sampleEvents.map((e) => <EventCard key={e.title} e={e} />)}
        </div>
      </Section>

      <Section id="resources" title={t.resources.heading} icon={BookOpen}>
        <p className="text-gray-800 leading-relaxed max-w-3xl">{t.resources.blurb}</p>
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          {resources.map((r) => (
            <a key={r.title} href={r.href} className="group rounded-2xl border p-6 bg-white shadow-sm hover:shadow transition">
              <div className="flex items-center gap-3"><r.icon className="w-5 h-5" /><h3 className="font-medium">{r.title}</h3></div>
              <p className="mt-2 text-sm text-gray-700">{r.desc}</p>
              <div className="mt-3 text-sm underline">Open</div>
            </a>
          ))}
        </div>
      </Section>

      <Section id="gallery" title={t.gallery.heading} icon={Images}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-2xl border bg-white overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100" />
            </div>
          ))}
        </div>
      </Section>

      <Section id="join" title={t.join.heading} icon={Mail}>
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <p className="text-gray-800 leading-relaxed">{t.join.blurb}</p>
          <form onSubmit={handleSubmit} className="rounded-2xl border p-6 bg-white shadow-sm">
            {submitted ? (
              <div className="text-green-700 font-medium">{t.join.thanks}</div>
            ) : (
              <>
                <label className="block text-sm font-medium">{t.join.name}</label>
                <input name="name" required className="mt-1 w-full rounded-xl border px-3 py-2" placeholder="Jane Doe" />
                <label className="block text-sm font-medium mt-4">{t.join.email}</label>
                <input name="email" type="email" required className="mt-1 w-full rounded-xl border px-3 py-2" placeholder="you@uni.sydney.edu.au" />
                <label className="block text-sm font-medium mt-4">{t.join.msg}</label>
                <textarea name="message" rows={4} className="mt-1 w-full rounded-xl border px-3 py-2" placeholder="Tell us how you want to participate" />
                <button type="submit" className="mt-5 px-5 py-3 rounded-xl bg-gray-900 text-white">{t.join.submit}</button>
              </>
            )}
          </form>
        </div>
      </Section>

      <footer className="border-t py-10 text-sm text-gray-600">
        <Container>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2"><Feather className="w-4 h-4" /><span>{t.footer.legal}</span></div>
            <div className="flex items-center gap-4">
              <a href="#join" className="underline">Contact</a>
              <a href="#resources" className="underline">Resources</a>
              <a href="#events" className="underline">Events</a>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
}
