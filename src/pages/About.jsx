import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion, useScroll, useTransform, useInView, animate } from 'framer-motion';
import { Rocket, Target, Heart, ChevronDown, Briefcase, Zap, Globe, DollarSign, ArrowRight, Code, BookOpen, Users, Award, Mail, MessageCircle, Link } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import ScrollReveal from '../components/ScrollReveal';
import TiltCard from '../components/TiltCard';
import MagneticButton from '../components/MagneticButton';

const Stat = ({ num, suffix, label }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (isInView) {
      const controls = animate(0, num, {
        duration: 2.5,
        ease: "easeOut",
        onUpdate(value) {
          setValue(Math.round(value));
        }
      });
      return () => controls.stop();
    }
  }, [isInView, num]);

  return (
    <div ref={ref} className="text-center bg-white/40 backdrop-blur-2xl border border-white/60 p-8 rounded-3xl shadow-[0_8px_32px_rgba(31,38,135,0.05)] hover:-translate-y-2 transition-transform duration-300">
      <div className="font-black text-5xl md:text-6xl text-[var(--color-brand-primary)] mb-2">
        {value}{suffix}
      </div>
      <div className="text-[var(--color-brand-text-secondary)] font-bold tracking-widest uppercase text-sm">
        {label}
      </div>
    </div>
  );
};

const Marquee = () => {
  return (
    <div className="w-full bg-[var(--color-brand-primary)] text-white overflow-hidden py-6 -rotate-2 scale-110 relative z-20 shadow-2xl my-20">
      <motion.div
        className="whitespace-nowrap flex font-black text-3xl md:text-5xl tracking-widest"
        animate={{ x: [0, -1000] }}
        transition={{ ease: "linear", duration: 15, repeat: Infinity }}
      >
        {[...Array(6)].map((_, i) => (
          <span key={i} className="mx-6">BUILD FEARLESSLY • LEARN AGGRESSIVELY • SHARE OPENLY •</span>
        ))}
      </motion.div>
    </div>
  );
};

const LinkedinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect width="4" height="12" x="2" y="9"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

const TeamCard = ({ name, role, description, image, linkedin, delay }) => (
  <ScrollReveal delay={delay}>
    <TiltCard className="h-full">
      <div className="bg-white p-1 rounded-[2.5rem] h-full flex flex-col relative group shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(147,51,234,0.15)] transition-all duration-500 overflow-hidden">
        {/* Animated Gradient Border */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-blue-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
        
        <div className="bg-white rounded-[2.3rem] h-full p-6 flex flex-col relative z-10">
          <div className="w-full aspect-square rounded-[1.8rem] overflow-hidden mb-6 relative border border-gray-100 shadow-inner bg-gray-50">
            {image ? (
              <img src={image} alt={name} className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                <Users size={64} className="text-purple-300" />
              </div>
            )}
            
            {/* Overlay Gradient & Icon Pill */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/90 via-[#0f172a]/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end justify-center pb-6">
              {linkedin && (
                <a 
                  href={linkedin} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100 bg-white/20 hover:bg-[#f5b800] backdrop-blur-md border border-white/30 text-white hover:text-[#0f172a] px-5 py-2.5 rounded-full flex items-center gap-2 font-bold shadow-[0_8px_32px_rgba(31,38,135,0.2)]"
                >
                  <LinkedinIcon />
                  <span className="text-sm">Connect</span>
                </a>
              )}
            </div>
          </div>
          
          <div className="text-center mt-auto flex flex-col items-center">
            <h3 className="font-extrabold text-[1.35rem] text-gray-900 mb-1 tracking-tight">{name}</h3>
            <p className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 font-bold mb-4 uppercase tracking-wider text-xs">{role}</p>
            {description && <p className="text-gray-500 text-sm leading-relaxed font-medium">{description}</p>}
          </div>
        </div>
      </div>
    </TiltCard>
  </ScrollReveal>
);

const FAQItem = ({ question, answer, index }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className={`border-b transition-all duration-300 ${isOpen ? 'border-[var(--color-brand-primary)]' : 'border-gray-200'} py-5`}
    >
      <button 
        className="w-full flex justify-between items-center text-left font-bold text-gray-900 text-lg hover:text-[var(--color-brand-primary)] transition-colors group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`transition-transform duration-300 ${isOpen ? 'translate-x-2 text-[var(--color-brand-primary)]' : 'group-hover:translate-x-1'}`}>
          {question}
        </span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${isOpen ? 'bg-[var(--color-brand-primary)] text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-purple-100 group-hover:text-[var(--color-brand-primary)]'}`}>
          <ChevronDown className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} size={18} />
        </div>
      </button>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
        style={{ overflow: "hidden" }}
      >
        <p className="pt-4 pb-2 text-[var(--color-brand-text-secondary)] pl-2 border-l-2 border-[var(--color-brand-primary)] ml-2 leading-relaxed">
          {answer}
        </p>
      </motion.div>
    </motion.div>
  );
};

const FAQS = [
  { question: "Who can join DAKH?", answer: "Any college student with a passion for building can join. Whether you're into code, design, or marketing, there's a place for you." },
  { question: "Is the internship paid?", answer: "Our internships are project-based. Top performers on client projects receive stipends and profit-sharing." },
  { question: "How do I start a node at my campus?", answer: "Reach out via our contact page. We'll provide you with the roadmap, resources, and support to build a community." },
];

const TimelineStep = ({ icon: Icon, title, desc, delay, isLast }) => (
  <div className="relative flex gap-6 pb-12 last:pb-0 z-10">
    <ScrollReveal delay={delay} className="relative z-10 flex-shrink-0">
      <div className="w-12 h-12 rounded-full bg-white border-4 border-gray-100 flex items-center justify-center text-[var(--color-brand-primary)] shadow-[0_0_15px_rgba(70,18,72,0.1)] group-hover:border-[var(--color-brand-primary)] transition-colors">
        <Icon size={20} />
      </div>
    </ScrollReveal>
    
    <ScrollReveal delay={delay + 0.1} className="pt-2">
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-[var(--color-brand-text-secondary)] leading-relaxed">{desc}</p>
    </ScrollReveal>
  </div>
);

const ScrollTimeline = () => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start center", "end center"]
  });
  
  const height = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div ref={targetRef} className="relative flex-1 bg-white p-8 md:p-12 rounded-[2.5rem] shadow-[0_10px_50px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden group">
      {/* Animated drawing line */}
      <div className="absolute left-[3.25rem] top-14 bottom-14 w-1.5 bg-gray-100 rounded-full overflow-hidden">
        <motion.div style={{ height }} className="w-full bg-gradient-to-b from-[var(--color-brand-primary)] to-pink-500 origin-top"></motion.div>
      </div>

      <TimelineStep icon={BookOpen} title="1. Foundation" desc="Master the core concepts through our curated, production-focused learning modules." delay={0.1} />
      <TimelineStep icon={Code} title="2. Hands-on Building" desc="Apply your knowledge by building functional clones and mini-projects." delay={0.2} />
      <TimelineStep icon={Users} title="3. Client Projects" desc="Join our agency teams and work on live, paid projects for real businesses." delay={0.3} />
      <TimelineStep icon={Award} title="4. Industry Ready" desc="Graduate with an undeniable portfolio, references, and the confidence to conquer tech." delay={0.4} isLast={true} />
    </div>
  );
};

const About = () => {
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [events, setEvents] = useState([]);
  const [products, setProducts] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [blogForm, setBlogForm] = useState({ author_name: '', title: '', content: '' });
  const [isSubmittingBlog, setIsSubmittingBlog] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase.from('events').select('*').order('created_at', { ascending: false });
      if (data) setEvents(data);
    };
    const fetchBlogs = async () => {
      const { data } = await supabase.from('blogs').select('*').order('created_at', { ascending: false });
      if (data) setBlogs(data);
    };
    const fetchProducts = async () => {
      const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (data) setProducts(data);
    };
    fetchEvents();
    fetchBlogs();
    fetchProducts();
  }, []);

  const handleSubmitBlog = async (e) => {
    e.preventDefault();
    if (!blogForm.title || !blogForm.content || !blogForm.author_name) return;
    setIsSubmittingBlog(true);
    const { data, error } = await supabase.from('blogs').insert([blogForm]).select();
    setIsSubmittingBlog(false);
    if (error) {
      alert("Error submitting blog: " + error.message);
    } else {
      if (data) setBlogs([data[0], ...blogs]);
      setShowBlogModal(false);
      setBlogForm({ author_name: '', title: '', content: '' });
      alert("Blog submitted successfully!");
    }
  };
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  const yBlob1 = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const yBlob2 = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const yBlob3 = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <PageTransition>
      <div ref={containerRef} className="overflow-hidden bg-white">
        
        {/* EPIC HERO SECTION */}
        <section className="relative pt-32 pb-10 px-6 lg:px-8 max-w-7xl mx-auto flex flex-col justify-center items-center">
          {/* Animated Background Blobs */}
          <motion.div 
            style={{ y: yBlob1 }}
            className="absolute top-20 right-0 w-[500px] h-[500px] bg-[var(--color-brand-primary)] rounded-full blur-[180px] opacity-20 pointer-events-none -z-10"
            animate={{ scale: [1, 1.2, 1], x: [0, -50, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            style={{ y: yBlob2 }}
            className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[var(--color-brand-secondary)] rounded-full blur-[150px] opacity-20 pointer-events-none -z-10"
            animate={{ scale: [1, 1.3, 1], x: [0, 50, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />

          <div className="text-center max-w-5xl mx-auto relative z-10 pt-10">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
              className="inline-block mb-6 px-5 py-2 rounded-full bg-purple-50/80 backdrop-blur-md border border-purple-100 text-[var(--color-brand-primary)] font-bold text-sm tracking-wide uppercase"
            >
              ✨ Bridging Academia & Industry
            </motion.div>
            <h1 className="font-extrabold text-7xl md:text-[7rem] mb-8 tracking-tight leading-[1] flex flex-wrap justify-center items-center gap-x-6">
              <motion.span
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
                className="text-gray-900"
              >
                About
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, type: "spring", bounce: 0.4 }}
                className="text-gradient pb-2"
              >
                DAKH
              </motion.span>
            </h1>
            <ScrollReveal delay={0.4}>
              <p className="text-2xl md:text-3xl text-[var(--color-brand-text-secondary)] font-medium max-w-3xl mx-auto leading-relaxed">
                We are a student-led initiative equipping the next generation of builders with dimensional intelligence and production-level skills.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* LIVE STATS COUNTER */}
        <section className="py-20 px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Stat num={500} suffix="+" label="Students Impacted" />
            <Stat num={50} suffix="+" label="Colleges Connected" />
            <Stat num={20} suffix="+" label="Live Projects Built" />
          </div>
        </section>

        {/* INFINITE MARQUEE */}
        <Marquee />

        {/* PILLARS SECTION - Enhanced 3D Glassmorphism Cards */}
        <section className="pb-20 pt-10 px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
          {/* Vibrant Background Gradients to make glassmorphism pop */}
          <motion.div style={{ y: yBlob3 }} className="absolute inset-0 flex justify-between items-center pointer-events-none -z-10 opacity-50 max-w-6xl mx-auto">
            <div className="w-[400px] h-[400px] bg-blue-400/40 rounded-full blur-[120px] -translate-y-20"></div>
            <div className="w-[400px] h-[400px] bg-purple-400/40 rounded-full blur-[120px] translate-y-20"></div>
            <div className="w-[400px] h-[400px] bg-pink-400/40 rounded-full blur-[120px] -translate-y-10"></div>
          </motion.div>

          <div className="text-center mb-16">
            <ScrollReveal>
              <h2 className="font-black text-5xl md:text-6xl text-gray-900 mb-6">Our Core <span className="text-gradient">Pillars</span></h2>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ScrollReveal delay={0.1}>
              <TiltCard className="h-full">
                <div className="bg-white/40 backdrop-blur-3xl border border-white/60 p-10 rounded-[2.5rem] h-full flex flex-col relative overflow-hidden group shadow-[0_8px_32px_rgba(31,38,135,0.05)] hover:shadow-[0_20px_40px_rgba(70,18,72,0.15)] transition-all duration-500">
                  <div className="absolute -right-6 -top-6 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl group-hover:bg-blue-400/40 transition-all duration-500"></div>
                  <div className="w-16 h-16 bg-white shadow-sm border border-gray-100 text-blue-500 rounded-2xl flex items-center justify-center mb-8 relative z-10 group-hover:scale-110 transition-transform duration-500">
                    <Target size={32} />
                  </div>
                  <h3 className="font-extrabold text-4xl mb-4 text-gray-900 relative z-10">Mission</h3>
                  <p className="text-[var(--color-brand-text-secondary)] text-lg leading-relaxed relative z-10">
                    To equip college students with production-level skills by having them build real-world products in a structured agency environment.
                  </p>
                </div>
              </TiltCard>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <TiltCard className="h-full">
                <div className="bg-white/40 backdrop-blur-3xl border border-white/60 p-10 rounded-[2.5rem] h-full flex flex-col relative overflow-hidden group shadow-[0_8px_32px_rgba(31,38,135,0.05)] hover:shadow-[0_20px_40px_rgba(245,184,0,0.15)] transition-all duration-500">
                  <div className="absolute -right-6 -top-6 w-40 h-40 bg-yellow-400/20 rounded-full blur-3xl group-hover:bg-yellow-400/40 transition-all duration-500"></div>
                  <div className="w-16 h-16 bg-white shadow-sm border border-gray-100 text-[var(--color-brand-secondary)] rounded-2xl flex items-center justify-center mb-8 relative z-10 group-hover:scale-110 transition-transform duration-500">
                    <Rocket size={32} />
                  </div>
                  <h3 className="font-extrabold text-4xl mb-4 text-gray-900 relative z-10">Vision</h3>
                  <p className="text-[var(--color-brand-text-secondary)] text-lg leading-relaxed relative z-10">
                    To become the largest student-driven tech ecosystem in India, where every campus has a thriving node of DAKH builders.
                  </p>
                </div>
              </TiltCard>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <TiltCard className="h-full">
                <div className="bg-white/40 backdrop-blur-3xl border border-white/60 p-10 rounded-[2.5rem] h-full flex flex-col relative overflow-hidden group shadow-[0_8px_32px_rgba(31,38,135,0.05)] hover:shadow-[0_20px_40px_rgba(236,72,153,0.15)] transition-all duration-500">
                  <div className="absolute -right-6 -top-6 w-40 h-40 bg-pink-400/20 rounded-full blur-3xl group-hover:bg-pink-400/40 transition-all duration-500"></div>
                  <div className="w-16 h-16 bg-white shadow-sm border border-gray-100 text-pink-500 rounded-2xl flex items-center justify-center mb-8 relative z-10 group-hover:scale-110 transition-transform duration-500">
                    <Heart size={32} />
                  </div>
                  <h3 className="font-extrabold text-4xl mb-4 text-gray-900 relative z-10">Values</h3>
                  <p className="text-[var(--color-brand-text-secondary)] text-lg leading-relaxed relative z-10">
                    Learn aggressively, build fearlessly, and share openly. We believe in open-source collaboration and community-first growth.
                  </p>
                </div>
              </TiltCard>
            </ScrollReveal>
          </div>
        </section>

        {/* JOURNEY / TIMELINE SECTION */}
        <section className="py-32 px-6 lg:px-8 bg-gray-50/50 border-y border-gray-200/50 mt-10 relative overflow-hidden">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
            <div className="flex-1 lg:sticky lg:top-32 self-start">
              <ScrollReveal>
                <div className="inline-block mb-4 px-4 py-2 rounded-full bg-[var(--color-brand-secondary)]/10 text-[var(--color-brand-secondary)] font-black text-sm tracking-widest uppercase">
                  THE ROADMAP
                </div>
                <h2 className="font-black text-5xl md:text-6xl text-gray-900 mb-8 leading-tight">
                  The Journey of a <br/><span className="text-gradient">DAKH Builder</span>
                </h2>
                <p className="text-xl text-[var(--color-brand-text-secondary)] mb-8 max-w-lg leading-relaxed font-medium">
                  We don't just teach theory. We take you through a meticulously structured pipeline that transforms you from a student into an industry-ready professional.
                </p>
              </ScrollReveal>
            </div>
            
            <ScrollTimeline />
          </div>
        </section>

        {/* TEAM / FOUNDERS SECTION */}
        <section className="py-32 px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <ScrollReveal>
              <div className="inline-block mb-4 px-4 py-2 rounded-full bg-blue-50 text-blue-600 font-black text-sm tracking-widest uppercase border border-blue-100">
                THE TEAM
              </div>
              <h2 className="font-black text-5xl md:text-6xl text-gray-900 mb-6">Meet the <span className="text-gradient">Founders</span></h2>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <TeamCard 
              name="Dhivakar Balakrishnan" 
              role="CEO & Founder" 
              image="/team/dhivakar.png" 
              linkedin="https://www.linkedin.com/in/dhivakar-balakrishnan-378450284/"
              description="Driving the vision and strategy at DAKH, committed to bridging the gap between academia and industry."
              delay={0.1} 
            />
            <TeamCard 
              name="Joshva D" 
              role="Managing Director" 
              image="/team/joshva.png" 
              linkedin="https://www.linkedin.com/in/joshva-d-b491662b9/"
              description="Overseeing core operations and ensuring our educational initiatives deliver maximum impact."
              delay={0.2} 
            />
            <TeamCard 
              name="Narmadha S D" 
              role="Business Development Officer" 
              image="/team/narmadha.png" 
              linkedin="https://www.linkedin.com/in/narmadha-s-d-6716753aa/"
              description="Spearheading strategic partnerships and growth, connecting our student builders with real-world opportunities."
              delay={0.3} 
            />
            <TeamCard 
              name="Aswin S" 
              role="Operations & Marketing Executive" 
              image="/team/ashwin.jpg" 
              linkedin="https://www.linkedin.com/in/aswin-s-445545328/?skipRedirect=true"
              description="Orchestrating our marketing campaigns and streamlining day-to-day operations to scale our reach."
              delay={0.4} 
            />
            <TeamCard 
              name="Pardhavika Gopisetty" 
              role="HR Manager" 
              image="/team/pardhavika.jpeg" 
              linkedin="https://www.linkedin.com/in/pardhavika-gopisetty-7b9842295/"
              description="Fostering a culture of fearless building and managing our incredible community of talented students."
              delay={0.5} 
            />
            <TeamCard 
              name="Seetha Eswari S" 
              role="Operations Team" 
              image="/team/seetha.jpeg" 
              linkedin="https://www.linkedin.com/in/seetha-eswari-s-846a1037a/"
              description="Ensuring smooth operational workflows and supporting our mission to empower student builders."
              delay={0.6} 
            />
          </div>
        </section>

        {/* EVENTS GALLERY SECTION */}
        <section className="py-20 px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <ScrollReveal>
              <h2 className="font-black text-5xl md:text-6xl text-gray-900 mb-4">Our <span className="text-gradient">Events</span></h2>
              <p className="text-xl text-[var(--color-brand-text-secondary)] font-medium">Moments from our hackathons, meetups, and workshops.</p>
            </ScrollReveal>
          </div>
          {events.length === 0 ? (
            <div className="text-center p-12 bg-gray-50 rounded-3xl border border-gray-100">
              <p className="text-gray-500 font-medium">No events published yet.</p>
            </div>
          ) : (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              {events.map((event, i) => (
                <ScrollReveal key={event.id} delay={i * 0.1}>
                  <div className="break-inside-avoid rounded-3xl overflow-hidden shadow-xl group relative">
                    <img src={event.image_url} alt={event.title || 'Event'} className="w-full h-auto transform group-hover:scale-105 transition-transform duration-700" />
                    {event.title && (
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                        <h3 className="text-white font-bold text-xl">{event.title}</h3>
                      </div>
                    )}
                  </div>
                </ScrollReveal>
              ))}
            </div>
          )}
        </section>

        {/* PRODUCTS & SERVICES SECTION */}
        {products.length > 0 && (
          <section className="py-20 px-6 lg:px-8 max-w-7xl mx-auto border-t border-gray-100">
            <div className="text-center mb-16">
              <ScrollReveal>
                <h2 className="font-black text-5xl md:text-6xl text-gray-900 mb-4">Our <span className="text-gradient">Products & Services</span></h2>
                <p className="text-xl text-[var(--color-brand-text-secondary)] font-medium">Explore the innovative solutions we offer.</p>
              </ScrollReveal>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product, i) => (
                <ScrollReveal key={product.id} delay={i * 0.1}>
                  <a href={product.product_url} target="_blank" rel="noreferrer" className="block h-full group">
                    <TiltCard className="h-full">
                      <div className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-xl hover:shadow-2xl transition-shadow h-full flex flex-col">
                        <div className="relative h-64 w-full overflow-hidden bg-gray-50">
                          <img src={product.image_url} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                            <span className="text-white font-bold flex items-center gap-2">View Product <ArrowRight size={16} /></span>
                          </div>
                        </div>
                        <div className="p-6 bg-white text-center flex-grow flex items-center justify-center">
                          <h3 className="text-2xl font-black text-gray-900 group-hover:text-[var(--color-brand-primary)] transition-colors">{product.title}</h3>
                        </div>
                      </div>
                    </TiltCard>
                  </a>
                </ScrollReveal>
              ))}
            </div>
          </section>
        )}

        {/* COMMUNITY BLOGS SECTION */}
        <section className="py-20 px-6 lg:px-8 max-w-7xl mx-auto bg-purple-50/50 rounded-[3rem] my-10">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
            <div>
              <h2 className="font-black text-4xl md:text-5xl text-gray-900 mb-2">Community <span className="text-gradient">Blogs</span></h2>
              <p className="text-lg text-[var(--color-brand-text-secondary)] font-medium">Read thoughts and experiences from our builders.</p>
            </div>
            <button 
              onClick={() => setShowBlogModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-purple-500/30 transition-all flex items-center gap-2"
            >
              <BookOpen size={20} />
              Write a Blog
            </button>
          </div>

          {blogs.length === 0 ? (
            <div className="text-center p-12 bg-white rounded-3xl shadow-sm border border-gray-100">
              <p className="text-gray-500 font-medium">No blogs yet. Be the first to share your experience!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((blog, i) => (
                <ScrollReveal key={blog.id} delay={i * 0.1}>
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-full flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <h3 className="font-extrabold text-2xl text-gray-900 mb-4">{blog.title}</h3>
                    <p className="text-gray-600 mb-6 flex-grow line-clamp-4">{blog.content}</p>
                    <div className="flex items-center gap-3 mt-auto pt-6 border-t border-gray-100">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center font-bold text-purple-700">
                        {blog.author_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{blog.author_name}</p>
                        <p className="text-xs text-gray-500">{new Date(blog.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          )}
        </section>

        {/* FAQ SECTION */}
        <section className="py-32 px-6 lg:px-8 max-w-3xl mx-auto">
          <ScrollReveal>
            <h2 className="font-black text-5xl md:text-6xl mb-12 text-center text-gray-900">
              Got Questions?
            </h2>
          </ScrollReveal>
          <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-gray-200/60 shadow-[0_20px_60px_rgba(0,0,0,0.02)]">
            {FAQS.map((faq, i) => (
              <FAQItem key={i} index={i} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </section>

        {/* ENHANCED JOIN CTA SECTION */}
        <section className="px-6 lg:px-8 max-w-7xl mx-auto pb-32">
          <ScrollReveal>
            <div className="relative overflow-hidden rounded-[3rem] shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-[#2a082b] via-[#461248] to-[#1a051b]"></div>
              
              <motion.div 
                animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-[#f5b800]/10 rounded-full blur-[120px]"
              />
              <motion.div 
                animate={{ rotate: -360, scale: [1, 1.3, 1] }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute -bottom-[20%] -left-[10%] w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-[120px]"
              />
              
              <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px] border border-white/10 rounded-[3rem]"></div>

              <div className="relative z-10 px-8 py-24 md:px-20 md:py-32 flex flex-col lg:flex-row items-center gap-16">
                <div className="flex-1 text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-5 py-2 text-[#f5b800] text-sm font-bold tracking-wide mb-8 backdrop-blur-md">
                    <Zap size={16} fill="currentColor" />
                    APPLICATIONS OPEN
                  </div>
                  <h2 className="font-black text-6xl md:text-7xl text-white mb-6 leading-[1.1] tracking-tight">
                    Join as a <br/><span className="text-[#f5b800]">Freelancer</span>
                  </h2>
                  <p className="text-white/80 text-2xl mb-12 max-w-xl font-medium leading-relaxed">
                    Work on real client projects, earn while you learn, and build a portfolio that speaks for itself — all as a student.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
                    {[
                      { icon: DollarSign, label: 'Earn per Project', desc: 'Get paid for milestones' },
                      { icon: Globe, label: 'Remote First', desc: 'Work from anywhere' },
                      { icon: Briefcase, label: 'Build Portfolio', desc: 'Real clients & impact' },
                    ].map(({ icon: Icon, label, desc }) => (
                      <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md hover:bg-white/10 hover:-translate-y-2 transition-all duration-300">
                        <div className="w-12 h-12 bg-[#f5b800]/20 rounded-xl flex items-center justify-center mb-5">
                          <Icon size={24} className="text-[#f5b800]" />
                        </div>
                        <p className="text-white font-black text-lg mb-1">{label}</p>
                        <p className="text-white/60 text-sm font-medium">{desc}</p>
                      </div>
                    ))}
                  </div>

                  <MagneticButton>
                    <RouterLink
                      to="/apply"
                      target="_blank"
                      className="group inline-flex items-center gap-4 bg-[#f5b800] text-[#461248] font-black px-12 py-5 rounded-full text-xl transition-all duration-300 hover:shadow-[0_0_50px_rgba(245,184,0,0.4)] active:scale-95"
                    >
                      Apply Now
                      <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                    </RouterLink>
                  </MagneticButton>
                </div>

                <div className="flex-shrink-0 flex flex-col items-center gap-8 hidden lg:flex">
                  <motion.div 
                    animate={{ y: [-15, 15, -15] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                    className="w-64 h-64 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-xl shadow-2xl relative"
                  >
                    <div className="absolute inset-0 rounded-full border border-white/20 scale-110 animate-pulse"></div>
                    <div className="text-center">
                      <p className="text-[#f5b800] font-black text-8xl mb-2">∞</p>
                      <p className="text-white font-bold text-sm tracking-widest uppercase">Opportunities</p>
                    </div>
                  </motion.div>
                  <motion.div 
                    animate={{ y: [15, -15, 15] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="bg-white/5 border border-white/10 rounded-3xl px-10 py-8 text-center backdrop-blur-md shadow-xl"
                  >
                    <p className="text-white/80 font-bold text-sm mb-2 uppercase tracking-widest">Students from</p>
                    <p className="text-[#f5b800] font-black text-4xl">50+ Colleges</p>
                  </motion.div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </section>
      </div>

      {/* ADD BLOG MODAL */}
      {showBlogModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowBlogModal(false)}></div>
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full relative z-10 shadow-2xl">
            <h3 className="text-2xl font-black text-gray-900 mb-6">Write a Blog</h3>
            <form onSubmit={handleSubmitBlog} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Your Name</label>
                <input required type="text" value={blogForm.author_name} onChange={(e) => setBlogForm({...blogForm, author_name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Blog Title</label>
                <input required type="text" value={blogForm.title} onChange={(e) => setBlogForm({...blogForm, title: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50" placeholder="My journey with DAKH" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Content</label>
                <textarea required rows={5} value={blogForm.content} onChange={(e) => setBlogForm({...blogForm, content: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50" placeholder="Share your experience..."></textarea>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowBlogModal(false)} className="flex-1 px-4 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmittingBlog} className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors disabled:opacity-50">
                  {isSubmittingBlog ? 'Publishing...' : 'Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageTransition>
  );
};

export default About;
