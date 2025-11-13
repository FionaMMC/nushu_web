import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Calendar, Users, HeartHandshake, Heart, Loader2, AlertCircle } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { contactsApi, eventsApi, Event } from '../services/api';

const translations = {
  en: {
    hero: {
      title: 'Join and Contact',
      subtitle: 'Become a member, volunteer, or propose a collaboration',
    },
    cards: [
      {
        icon: Users,
        title: 'Membership',
        description:
          'Join our community of students interested in Nüshu research and practice. Access exclusive workshops, reading groups, and academic discussions.',
        benefits: [
          'Weekly reading groups',
          'Calligraphy workshops',
          'Academic seminars',
          'Community events',
        ],
      },
      {
        icon: HeartHandshake,
        title: 'Collaboration',
        description:
          'Partner with us on research projects, cultural events, or educational initiatives. We welcome academic and community collaborations.',
        benefits: [
          'Research partnerships',
          'Cultural events',
          'Educational programs',
          'Public lectures',
        ],
      },
      {
        icon: Heart,
        title: 'Support',
        description:
          'Help preserve and promote Nüshu culture through volunteering, donations, or spreading awareness in your networks.',
        benefits: [
          'Event volunteering',
          'Research assistance',
          'Community outreach',
          'Social media support',
        ],
      },
    ],
    form: {
      title: 'Get in Touch',
      subtitle: 'Ready to join our community or have questions about our work? We\'d love to hear from you.',
      name: 'Full name',
      email: 'Email',
      interest: 'Interest Area',
      interestedEvent: 'Interested in Event?',
      message: 'Your message',
      submit: 'Send',
      sending: 'Sending...',
      thanks: 'Message Sent Successfully',
      thanksMessage: 'Thank you. We will be in touch shortly.',
      sendAnother: 'Send another message',
      errorMessage: 'Please fill in all required fields.',
      allFieldsRequired: 'All fields are required',
    },
    interests: {
      select: 'Select your interest...',
      membership: 'Become a member',
      collaboration: 'Propose collaboration',
      volunteering: 'Volunteer opportunities',
      research: 'Research inquiry',
      other: 'Other',
    },
    events: {
      select: 'None',
      loading: 'Loading events...',
    },
    contact: {
      email: 'Email',
      emailValue: 'nushu.culture.research.assoc@gmail.com',
      location: 'Location',
      locationValue: 'University of Sydney\nCamperdown Campus',
      responseTime: 'Response Time',
      responseTimeValue: 'Within 48 hours',
      followText: 'Follow us for updates on workshops, events, and Nüshu research developments.',
    },
  },
  zh: {
    hero: {
      title: '加入与联系',
      subtitle: '成为会员、志愿者或提出合作建议',
    },
    cards: [
      {
        icon: Users,
        title: '会员资格',
        description: '加入我们对女书研究和实践感兴趣的学生社区。参加专属工作坊、读书会和学术讨论。',
        benefits: ['每周读书会', '书法工作坊', '学术讲座', '社区活动'],
      },
      {
        icon: HeartHandshake,
        title: '合作',
        description: '在研究项目、文化活动或教育计划上与我们合作。我们欢迎学术和社区合作。',
        benefits: ['研究合作', '文化活动', '教育项目', '公开讲座'],
      },
      {
        icon: Heart,
        title: '支持',
        description: '通过志愿服务、捐赠或在您的网络中传播意识来帮助保护和推广女书文化。',
        benefits: ['活动志愿者', '研究协助', '社区外展', '社交媒体支持'],
      },
    ],
    form: {
      title: '联系我们',
      subtitle: '准备加入我们的社区或对我们的工作有疑问？我们很乐意听到您的声音。',
      name: '姓名',
      email: '邮箱',
      interest: '兴趣领域',
      interestedEvent: '感兴趣的活动？',
      message: '留言',
      submit: '发送',
      sending: '发送中...',
      thanks: '消息发送成功',
      thanksMessage: '已收到，我们会尽快联系您。',
      sendAnother: '发送另一条消息',
      errorMessage: '请填写所有必填字段。',
      allFieldsRequired: '所有字段都是必填的',
    },
    interests: {
      select: '选择您的兴趣...',
      membership: '成为会员',
      collaboration: '提议合作',
      volunteering: '志愿者机会',
      research: '研究咨询',
      other: '其他',
    },
    events: {
      select: '无',
      loading: '加载活动中...',
    },
    contact: {
      email: '邮箱',
      emailValue: 'nushu.society@sydney.edu.au',
      location: '地点',
      locationValue: '悉尼大学\nCamperdown 校区',
      responseTime: '响应时间',
      responseTimeValue: '48小时内',
      followText: '关注我们以获取工作坊、活动和女书研究发展的更新。',
    },
  },
};

export default function Contact() {
  const [lang, setLang] = useState<'en' | 'zh'>('en');
  const t = translations[lang];
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await eventsApi.getAll({ status: 'current', limit: 50 });
        setEvents(data.events);
      } catch (error) {
        console.error('Failed to load events:', error);
      } finally {
        setEventsLoading(false);
      }
    }
    loadEvents();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());

    const name = payload.name as string;
    const email = payload.email as string;
    const message = payload.message as string;
    const interestedEvent = payload.interestedEvent as string;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      setSubmitError(t.form.errorMessage);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      await contactsApi.submit({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        interestedEvent: interestedEvent || '',
      });

      setSubmitted(true);
    } catch (error) {
      console.error('Contact form submission error:', error);
      setSubmitError('Failed to send message. Please try again or contact us directly.');
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setSubmitted(false);
    setSubmitError(null);
    setSubmitting(false);
  }

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
              <Mail className="w-8 h-8 text-nushu-terracotta" />
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

      {/* Ways to Engage */}
      <section className="py-28 lg:py-36">
        <div className="mx-auto w-full max-w-7xl px-8 lg:px-12">
          <div className="grid lg:grid-cols-3 gap-12">
            {t.cards.map((card, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`bg-white p-10 border-t-4 ${
                  index === 0
                    ? 'border-nushu-terracotta'
                    : index === 1
                    ? 'border-nushu-sage'
                    : 'border-nushu-terracotta/60'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center mb-6 ${
                    index === 0
                      ? 'bg-nushu-terracotta/10'
                      : index === 1
                      ? 'bg-nushu-sage/10'
                      : 'bg-nushu-terracotta/10'
                  }`}
                >
                  <card.icon
                    className={`w-6 h-6 ${
                      index === 0
                        ? 'text-nushu-terracotta'
                        : index === 1
                        ? 'text-nushu-sage'
                        : 'text-nushu-terracotta'
                    }`}
                  />
                </div>
                <h3 className="text-xl font-serif text-nushu-sage mb-4">{card.title}</h3>
                <p className="text-nushu-sage/80 leading-relaxed mb-6">{card.description}</p>
                <ul className="space-y-2 text-sm text-nushu-sage/70">
                  {card.benefits.map((benefit, i) => (
                    <li key={i}>• {benefit}</li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-28 lg:py-36 bg-nushu-cream">
        <div className="mx-auto w-full max-w-7xl px-8 lg:px-12">
          <div className="bg-white">
            <div className="grid lg:grid-cols-2">
              {/* Left Side - Contact Info */}
              <div className="bg-nushu-sage text-white p-10 lg:p-16">
                <h3 className="font-serif text-3xl lg:text-4xl font-normal mb-8 leading-tight">
                  {t.form.title}
                </h3>
                <p className="text-white/90 text-lg leading-relaxed mb-12">{t.form.subtitle}</p>

                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <Mail className="w-5 h-5 text-white/80 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-white font-medium mb-1">{t.contact.email}</h4>
                      <p className="text-white/80 text-sm">{t.contact.emailValue}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <MapPin className="w-5 h-5 text-white/80 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-white font-medium mb-1">{t.contact.location}</h4>
                      <p className="text-white/80 text-sm whitespace-pre-line">
                        {t.contact.locationValue}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Calendar className="w-5 h-5 text-white/80 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-white font-medium mb-1">{t.contact.responseTime}</h4>
                      <p className="text-white/80 text-sm">{t.contact.responseTimeValue}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-white/20">
                  <p className="text-white/70 text-sm">{t.contact.followText}</p>
                </div>
              </div>

              {/* Right Side - Form */}
              <div className="p-10 lg:p-16">
                {submitted ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-nushu-terracotta rounded-full flex items-center justify-center mx-auto mb-6">
                      <Mail className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-3xl font-serif text-nushu-sage mb-4">{t.form.thanks}</h3>
                    <p className="text-nushu-sage/80 text-lg mb-8">{t.form.thanksMessage}</p>
                    <button
                      onClick={resetForm}
                      className="text-nushu-terracotta hover:text-nushu-terracotta/80 font-medium transition-colors"
                    >
                      {t.form.sendAnother}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                      <h3 className="text-2xl font-serif text-nushu-sage mb-2">
                        Contact Form
                      </h3>
                      <p className="text-nushu-sage/70 text-sm">{t.form.allFieldsRequired}</p>
                      {submitError && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                            <p className="text-red-700 text-sm">{submitError}</p>
                          </div>
                        </div>
                      )}
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
                          {t.form.name}
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
                          {t.form.email}
                        </label>
                      </div>

                      <div className="relative">
                        <select
                          name="interest"
                          required
                          className="w-full border-0 border-b-2 border-nushu-sage/20 pb-4 pt-6 bg-transparent focus:border-nushu-terracotta focus:outline-none transition-colors text-nushu-sage"
                        >
                          <option value="" className="text-nushu-sage/40">
                            {t.interests.select}
                          </option>
                          <option value="membership" className="text-nushu-sage">
                            {t.interests.membership}
                          </option>
                          <option value="collaboration" className="text-nushu-sage">
                            {t.interests.collaboration}
                          </option>
                          <option value="volunteering" className="text-nushu-sage">
                            {t.interests.volunteering}
                          </option>
                          <option value="research" className="text-nushu-sage">
                            {t.interests.research}
                          </option>
                          <option value="other" className="text-nushu-sage">
                            {t.interests.other}
                          </option>
                        </select>
                        <label className="block text-sm font-medium text-nushu-sage/60 mb-2">
                          {t.form.interest}
                        </label>
                      </div>

                      <div className="relative">
                        <select
                          name="interestedEvent"
                          className="w-full border-0 border-b-2 border-nushu-sage/20 pb-4 pt-6 bg-transparent focus:border-nushu-terracotta focus:outline-none transition-colors text-nushu-sage"
                        >
                          <option value="" className="text-nushu-sage">
                            {t.events.select}
                          </option>
                          {eventsLoading ? (
                            <option disabled className="text-nushu-sage/40">
                              {t.events.loading}
                            </option>
                          ) : (
                            events.map((event) => (
                              <option key={event._id} value={event.title} className="text-nushu-sage">
                                {event.title} - {event.date}
                              </option>
                            ))
                          )}
                        </select>
                        <label className="block text-sm font-medium text-nushu-sage/60 mb-2">
                          {t.form.interestedEvent}
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
                          {t.form.message}
                        </label>
                      </div>
                    </div>

                    <div className="pt-6">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-nushu-terracotta text-white py-4 px-8 font-medium hover:bg-nushu-terracotta/90 transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-nushu-terracotta focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        {submitting ? (
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>{t.form.sending}</span>
                          </div>
                        ) : (
                          <>{t.form.submit} →</>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
