import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Check, Laptop, Users, Building, Globe, Home as HomeIcon, Zap, Target, Award, Star, ArrowRight, CalendarDays, BookOpen, UserCheck, Lightbulb, Code2, Send, CheckCircle2, AlertTriangle, Briefcase, ChevronRight, Key, Download, Loader2, Share2 } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import ScrollReveal from '../components/ScrollReveal';
import TiltCard from '../components/TiltCard';
import CtaButton from '../components/CtaButton';
import InternshipModal from '../components/InternshipModal';

const DOMAINS = [
  'Web Development', 'App Development', 'AI & Machine Learning', 'UI/UX Design',
  'Python Full Stack', 'MERN Stack', 'Cyber Security', 'IoT',
  'Generative AI', 'Java Full Stack', 'Cloud Computing', 'Data Science'
];

// Badge Component
const CompletionBadge = ({ domain, name }) => {
  const colors = [
    { primary: '#2563eb', secondary: '#1e40af', ribbon: '#3b82f6' }, // Blue
    { primary: '#d97706', secondary: '#b45309', ribbon: '#f59e0b' }, // Gold
    { primary: '#dc2626', secondary: '#991b1b', ribbon: '#ef4444' }, // Red
    { primary: '#059669', secondary: '#047857', ribbon: '#10b981' }, // Green
    { primary: '#7c3aed', secondary: '#5b21b6', ribbon: '#8b5cf6' }, // Purple
  ];
  const color = colors[domain.length % colors.length];
  const year = new Date().getFullYear();

  return (
    <div className="relative w-64 h-64 mx-auto flex items-center justify-center hover:scale-105 transition-transform duration-300 mb-6">
      <svg viewBox="0 0 200 240" className="w-full h-full font-sans" style={{ filter: 'drop-shadow(0px 10px 15px rgba(0,0,0,0.15))' }}>
        {/* Ribbon tails at the bottom */}
        <path d="M40 170 L40 230 L65 210 L90 230 L90 170 Z" fill={color.secondary} />
        <path d="M110 170 L110 230 L135 210 L160 230 L160 170 Z" fill={color.secondary} />

        {/* Outer Hexagon */}
        <polygon points="100,10 180,50 180,140 100,180 20,140 20,50" fill={color.primary} />

        {/* Inner Hexagons */}
        <polygon points="100,18 172,55 172,135 100,172 28,135 28,55" fill="#f8fafc" />
        <polygon points="100,24 166,58 166,132 100,166 34,132 34,58" fill="#ffffff" />

        {/* Top Logo / Icon placeholder */}
        <g transform="translate(85, 30)">
          <path d="M15 0 L30 8 L30 22 L15 30 L0 22 L0 8 Z" fill={color.primary} />
          <path d="M15 4 L25 10 L25 20 L15 26 L5 20 L5 10 Z" fill="#ffffff" />
          <circle cx="15" cy="15" r="4" fill={color.primary} />
        </g>

        {/* Company Name */}
        <text x="100" y="78" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#475569">DAKH EDU SOLUTIONS</text>

        {/* INTERNSHIP COMPLETED text */}
        <text x="100" y="98" textAnchor="middle" fontSize="10" fontWeight="900" fill="#1e293b" letterSpacing="0.5">INTERNSHIP COMPLETED</text>

        {/* Center Ribbon Banner */}
        <path d="M-5 108 L205 108 L195 120.5 L205 133 L-5 133 L5 120.5 Z" fill={color.ribbon} />
        <path d="M-5 133 L20 133 L20 142 Z" fill={color.secondary} />
        <path d="M205 133 L180 133 L180 142 Z" fill={color.secondary} />

        {/* Domain Text */}
        <text x="100" y="124" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#ffffff" style={{ textTransform: 'uppercase' }}>
          {domain.length > 26 ? domain.substring(0, 26) + '...' : domain}
        </text>

        {/* Year */}
        <text x="100" y="155" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#64748b">{year}</text>
      </svg>
    </div>
  );
};

const MODES = {
  Online: {
    icon: Globe,
    desc: 'Learn from anywhere in the world. Access recorded sessions, live doubts clearance, and digital project submissions.'
  },
  Offline: {
    icon: Building,
    desc: 'Join us at our Chennai tech hub. Immerse yourself in a professional agency environment and build with peers.'
  },
  Hybrid: {
    icon: HomeIcon,
    desc: 'Get the best of both worlds. Attend core sessions offline and complete project work remotely.'
  }
};

const getDomainIcon = (domain) => {
  if (domain.includes('AI') || domain.includes('Data')) return '🤖';
  if (domain.includes('Web') || domain.includes('MERN')) return '💻';
  if (domain.includes('App')) return '📱';
  if (domain.includes('UI/UX')) return '🎨';
  if (domain.includes('Cyber')) return '🛡️';
  if (domain.includes('Cloud')) return '☁️';
  if (domain.includes('IoT')) return '🔌';
  if (domain.includes('Java') || domain.includes('Python')) return '☕';
  return '⚡';
};

// Default Fallback Roadmap Data
const DEFAULT_ROADMAP = [
  {
    num: 1,
    title: 'Online Orientation Meeting',
    desc: 'Attend the introductory Google Meet session where internship guidelines, project workflow, and expectations will be explained.',
    Icon: CalendarDays,
    icon_name: 'CalendarDays',
    bgIcon: 'bg-blue-600',
    textIcon: 'text-blue-600',
    shadowIcon: 'shadow-[0_0_20px_rgba(37,99,235,0.6)]',
    borderCard: 'hover:border-blue-400',
    textTitle: 'text-blue-900',
  },
  {
    num: 2,
    title: 'Learning Resources Shared',
    desc: 'Access curated open-source learning materials, documentation, tutorials, and reference resources provided by DAKH Edu Solutions.',
    Icon: BookOpen,
    icon_name: 'BookOpen',
    bgIcon: 'bg-green-600',
    textIcon: 'text-green-600',
    shadowIcon: 'shadow-[0_0_20px_rgba(22,163,74,0.6)]',
    borderCard: 'hover:border-green-400',
    textTitle: 'text-green-900',
  },
  {
    num: 3,
    title: 'Mentor Assignment',
    desc: 'A dedicated mentor will be assigned to guide you throughout the internship and support your learning journey.',
    Icon: UserCheck,
    icon_name: 'UserCheck',
    bgIcon: 'bg-orange-600',
    textIcon: 'text-orange-600',
    shadowIcon: 'shadow-[0_0_20px_rgba(234,88,12,0.6)]',
    borderCard: 'hover:border-orange-400',
    textTitle: 'text-orange-900',
  },
  {
    num: 4,
    title: 'Project Briefing',
    desc: 'A simple domain-based project will be assigned along with clear objectives, requirements, and submission guidelines.',
    Icon: Lightbulb,
    icon_name: 'Lightbulb',
    bgIcon: 'bg-purple-600',
    textIcon: 'text-purple-600',
    shadowIcon: 'shadow-[0_0_20px_rgba(147,51,234,0.6)]',
    borderCard: 'hover:border-purple-400',
    textTitle: 'text-purple-900',
  },
  {
    num: 5,
    title: 'Project Development',
    desc: 'Learn from the provided resources and complete the assigned project within the internship duration.',
    Icon: Code2,
    icon_name: 'Code2',
    bgIcon: 'bg-yellow-500',
    textIcon: 'text-yellow-600',
    shadowIcon: 'shadow-[0_0_20px_rgba(234,179,8,0.6)]',
    borderCard: 'hover:border-yellow-400',
    textTitle: 'text-yellow-700',
  },
  {
    num: 6,
    title: 'Project Submission & Review',
    desc: 'Submit your completed project to your assigned mentor for evaluation and feedback.',
    Icon: Send,
    icon_name: 'Send',
    bgIcon: 'bg-cyan-600',
    textIcon: 'text-cyan-600',
    shadowIcon: 'shadow-[0_0_20px_rgba(8,145,178,0.6)]',
    borderCard: 'hover:border-cyan-400',
    textTitle: 'text-cyan-900',
  },
];

// Helper to map string icon names from DB to Lucide React components
const iconMap = {
  CalendarDays, BookOpen, UserCheck, Lightbulb, Code2, Send, CheckCircle2, AlertTriangle, Briefcase
};

const Internship = () => {
  const [selectedDomain, setSelectedDomain] = useState(DOMAINS[0]);
  const [selectedMode, setSelectedMode] = useState('Online');
  const [isTrainMoving, setIsTrainMoving] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState({ name: '30 Days Mastery', price: '449' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roadmapSteps, setRoadmapSteps] = useState(DEFAULT_ROADMAP);

  // Certificate Verification states
  const [certEmail, setCertEmail] = useState('');
  const [certCode, setCertCode] = useState('');
  const [certLoading, setCertLoading] = useState(false);
  const [certError, setCertError] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [regBackup, setRegBackup] = useState(null);

  const handleCertSearch = async (e) => {
    e.preventDefault();
    setCertLoading(true);
    setCertError(null);
    setCertificate(null);
    setRegBackup(null);

    const cleanEmail = certEmail.trim().toLowerCase();
    const cleanCode = certCode.trim();

    try {
      const { data: certData, error: certErr } = await supabase
        .from('certificates')
        .select('*')
        .eq('email', cleanEmail)
        .eq('certificate_code', cleanCode)
        .maybeSingle();

      if (certErr) throw certErr;

      if (certData) {
        setCertificate(certData);
      } else {
        const { data: regData, error: regErr } = await supabase
          .from('registrations')
          .select('*')
          .eq('email', cleanEmail)
          .eq('intern_number', cleanCode)
          .maybeSingle();

        if (regErr) throw regErr;

        if (regData) {
          setRegBackup(regData);
          setCertError("Your internship record was found, but your certificate link has not been added by the admin yet. Please check back later.");
        } else {
          setCertError("No matching certificate record or intern registration found. Please verify your email and code.");
        }
      }
    } catch (err) {
      console.error(err);
      setCertError("An error occurred while fetching your certificate. Please try again.");
    } finally {
      setCertLoading(false);
    }
  };

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const { data, error } = await supabase
          .from('roadmap_steps')
          .select('*')
          .order('num', { ascending: true });

        if (!error && data && data.length > 0) {
          // Map the database rows to the format needed by the UI
          const formattedSteps = data.map(step => ({
            num: step.num,
            title: step.title,
            desc: step.description,
            Icon: iconMap[step.icon_name] || CalendarDays, // Fallback icon
            icon_name: step.icon_name,
            bgIcon: step.bg_icon,
            textIcon: step.text_icon,
            shadowIcon: step.shadow_icon,
            borderCard: step.border_card,
            textTitle: step.text_title,
          }));
          setRoadmapSteps(formattedSteps);
        }
      } catch (err) {
        console.error("Supabase not connected or error fetching roadmap. Using fallback.");
      }
    };

    fetchRoadmap();
  }, []);

  const [internProjects, setInternProjects] = useState([]);

  useEffect(() => {
    const fetchInternProjects = async () => {
      try {
        const { data, error } = await supabase
          .from('intern_projects')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) {
          setInternProjects(data);
        }
      } catch (err) {
        console.error("Error fetching intern projects:", err);
      }
    };

    fetchInternProjects();
  }, []);

  const handleApplyClick = (planName, price) => {
    setSelectedPlan({ name: planName, price: price });
    setIsModalOpen(true);
  };

  const ActiveModeIcon = MODES[selectedMode].icon;

  return (
    <PageTransition>
      {/* 1. Hero */}
      <section className="pt-32 pb-20 px-6 lg:px-8 max-w-5xl mx-auto text-center relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[var(--color-brand-primary)] rounded-full blur-[150px] opacity-20 pointer-events-none -z-10"></div>
        <ScrollReveal>
          <div className="inline-block px-4 py-1.5 rounded-full bg-white border border-gray-200 text-sm text-[var(--color-brand-text-secondary)] mb-6 shadow-sm">
            Internship Program
          </div>
          <h1 className="font-extrabold text-5xl md:text-7xl mb-6 text-gray-900">
            Kickstart Your <span className="text-gradient">Tech Career</span>
          </h1>
          <p className="text-lg md:text-xl text-[var(--color-brand-text-secondary)] mb-10 max-w-2xl mx-auto">
            Hands-on internships in 10+ domains. Real projects, certificates, and performance stipends.
          </p>
          <button onClick={() => handleApplyClick('Internship Program', '449')} className="px-10 py-5 bg-[var(--color-brand-primary)] text-white font-black rounded-full text-lg shadow-[0_0_30px_rgba(147,51,234,0.4)] hover:scale-105 transition-transform">
            Apply Now
          </button>

          <div className="flex flex-wrap justify-center gap-6 md:gap-12 mt-16 text-[var(--color-brand-text-secondary)] font-bold">
            <span className="flex items-center gap-2"><Check className="text-[var(--color-brand-secondary)]" /> 15+ Days</span>
            <span className="flex items-center gap-2"><Check className="text-[var(--color-brand-secondary)]" /> 10 Domains</span>
            <span className="flex items-center gap-2"><Check className="text-[var(--color-brand-secondary)]" /> ₹Performance Stipend</span>
          </div>
        </ScrollReveal>
      </section>

      {/* 2. Glassmorphism Infinite Train Carousel */}
      <section className="py-24 bg-gradient-to-b from-purple-50/50 to-transparent relative overflow-hidden border-y border-[rgba(0,0,0,0.05)]">
        {/* Background floating blobs for glassmorphism refraction */}
        <motion.div animate={{ y: [0, 30, 0], scale: [1, 1.1, 1] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute top-20 left-10 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-[120px] opacity-30 pointer-events-none"></motion.div>
        <motion.div animate={{ y: [0, -30, 0], scale: [1, 1.2, 1] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute top-40 right-10 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-[120px] opacity-30 pointer-events-none"></motion.div>
        <motion.div animate={{ x: [0, 40, 0], scale: [1, 1.1, 1] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} className="absolute -bottom-20 left-1/3 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-[120px] opacity-30 pointer-events-none"></motion.div>

        <div className="max-w-6xl mx-auto px-6 lg:px-8 relative z-10">
          <ScrollReveal>
            <h2 className="font-extrabold text-4xl md:text-5xl text-center mb-16 text-gray-900">Explore Our Domains</h2>
          </ScrollReveal>
        </div>

        {/* Infinite Marquee Container */}
        <div className="relative w-full flex overflow-hidden py-16 group relative z-10 [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)] min-h-[500px]">

          {/* Start Train Overlay Button */}
          {!isTrainMoving && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/10 backdrop-blur-[2px]">
              <button
                onClick={() => setIsTrainMoving(true)}
                className="px-10 py-5 bg-[var(--color-brand-primary)] text-white font-black rounded-full text-2xl shadow-[0_0_50px_rgba(147,51,234,0.6)] animate-pulse hover:scale-110 hover:animate-none transition-all border-4 border-white/20 flex items-center gap-4"
              >
                Start Train <Zap size={24} className="text-yellow-300" />
              </button>
            </div>
          )}

          {/* Train track background line */}
          <div className="absolute bottom-[2.5rem] left-0 w-full h-2 bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300 opacity-50 z-0 border-b border-gray-500"></div>

          <div className="animate-marquee flex items-end" style={{ animationDuration: '80s', animationPlayState: isTrainMoving ? 'running' : 'paused' }}>
            {['ENGINE', ...DOMAINS, 'ENGINE', ...DOMAINS].map((domain, i) => {
              const isLastCompartment = i === DOMAINS.length || i === (DOMAINS.length * 2 + 1);

              if (domain === 'ENGINE') {
                return (
                  <div key={`engine-${i}`} className="flex items-end shrink-0">
                    <div className="relative pb-6">
                      {/* Engine Body */}
                      <div className="w-[300px] h-[400px] shrink-0 p-8 rounded-[2rem] rounded-tl-[4rem] bg-gradient-to-br from-gray-800 to-gray-900 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col relative overflow-hidden z-10 border-b-8 border-gray-950">

                        {/* Steam Chimney (Top Left) */}
                        <div className="absolute top-0 left-8 w-16 h-28 bg-gradient-to-b from-gray-700 to-gray-900 rounded-t-xl border-t-4 border-gray-600 z-0">
                          {/* Smoke Puffs - only animate when moving */}
                          <div className={`absolute -top-12 left-1/2 -translate-x-1/2 w-10 h-10 bg-gray-300 rounded-full blur-[4px] opacity-60 ${isTrainMoving ? 'animate-[ping_2s_infinite]' : ''}`}></div>
                          <div className={`absolute -top-24 left-1/2 -translate-x-1/2 w-16 h-16 bg-gray-300 rounded-full blur-[8px] opacity-40 ${isTrainMoving ? 'animate-[ping_3s_infinite]' : ''}`}></div>
                        </div>

                        {/* Engine Window (Right Side) */}
                        <div className="w-24 h-24 bg-yellow-100/20 backdrop-blur-md rounded-2xl border-[4px] border-gray-700 mt-16 self-end relative overflow-hidden shadow-[inset_0_0_20px_rgba(250,204,21,0.2)] flex items-center justify-center">
                          {/* Driver Silhouette */}
                          <div className="w-12 h-16 bg-gray-950 rounded-t-full absolute bottom-0 shadow-lg"></div>
                        </div>

                        {/* Engine Details */}
                        <div className="mt-auto space-y-4">
                          <div className="h-4 w-full bg-[var(--color-brand-primary)] rounded-full shadow-[0_0_15px_rgba(147,51,234,0.5)]"></div>
                          <div className="h-4 w-3/4 bg-gray-700 rounded-full ml-auto"></div>
                          <div className="h-4 w-1/2 bg-gray-700 rounded-full ml-auto"></div>
                        </div>

                        <h3 className="font-black text-5xl text-white mt-8 tracking-widest text-center shadow-black drop-shadow-md">DAKH</h3>
                      </div>

                      {/* Cowcatcher / Grill (Front Left) */}
                      <div className="absolute bottom-6 -left-6 w-16 h-24 bg-gradient-to-r from-gray-700 to-gray-900 border-r-4 border-gray-800 rounded-bl-3xl transform -skew-x-[20deg] z-0 shadow-xl"></div>

                      {/* Big Engine Wheels */}
                      <div className="absolute -bottom-2 left-12 w-20 h-20 rounded-full bg-gray-900 border-[6px] border-gray-500 shadow-xl z-20 flex items-center justify-center animate-[spin_4s_linear_infinite_reverse]" style={{ animationPlayState: isTrainMoving ? 'running' : 'paused' }}>
                        <div className="w-4 h-4 bg-[var(--color-brand-primary)] rounded-full shadow-[0_0_10px_rgba(147,51,234,0.8)]"></div>
                        <div className="absolute inset-0 border-[4px] border-dashed border-gray-700 rounded-full"></div>
                        {/* Connecting Rod */}
                        <div className="absolute top-1/2 left-1/2 w-32 h-3 bg-gray-300 rounded-full origin-left -translate-y-1/2 shadow-md"></div>
                      </div>
                      <div className="absolute -bottom-2 right-6 w-20 h-20 rounded-full bg-gray-900 border-[6px] border-gray-500 shadow-xl z-20 flex items-center justify-center animate-[spin_4s_linear_infinite_reverse]" style={{ animationPlayState: isTrainMoving ? 'running' : 'paused' }}>
                        <div className="w-4 h-4 bg-[var(--color-brand-primary)] rounded-full shadow-[0_0_10px_rgba(147,51,234,0.8)]"></div>
                        <div className="absolute inset-0 border-[4px] border-dashed border-gray-700 rounded-full"></div>
                      </div>
                    </div>

                    {/* The Train Link connecting engine to first car */}
                    <div className="w-8 h-4 bg-gray-400 border-y-2 border-gray-500 shadow-inner relative z-0 flex items-center justify-center mb-16 mx-2 rounded-sm shrink-0">
                      <div className="w-full h-1 bg-gray-700"></div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={i} className={`flex items-end shrink-0 ${isLastCompartment ? 'mr-32' : ''}`}>
                  {/* The Train Compartment (Card) */}
                  <div className="relative pb-6">
                    {/* The Glass Card */}
                    <div className="w-[280px] sm:w-[320px] shrink-0 p-8 rounded-[2rem] bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(31,38,135,0.05)] hover:shadow-[0_20px_40px_rgba(147,51,234,0.15)] hover:border-purple-300/50 hover:-translate-y-2 transition-all duration-300 flex flex-col relative overflow-hidden group/card z-10 h-[400px]">
                      {/* Glossy Reflection overlay */}
                      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/60 to-transparent pointer-events-none rounded-t-[2rem]"></div>

                      <div className="flex items-center gap-4 mb-6 relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white to-purple-50 flex items-center justify-center text-3xl shadow-sm border border-white/80 group-hover/card:scale-110 group-hover/card:rotate-3 transition-transform duration-300">
                          {getDomainIcon(domain)}
                        </div>
                        <h3 className="font-black text-xl text-gray-900 tracking-tight leading-tight">{domain}</h3>
                      </div>

                      <div className="space-y-4 mb-8 relative z-10 flex-grow">
                        <div className="flex items-center justify-between text-sm font-bold text-gray-700 bg-white/60 px-4 py-3 rounded-xl border border-white/50 shadow-sm">
                          <span>Duration:</span>
                          <span className="text-[var(--color-brand-primary)]">15/30 Days</span>
                        </div>

                        <ul className="space-y-3 mt-5 text-sm font-bold text-gray-700">
                          <li className="flex items-center gap-3"><div className="bg-green-100 p-1 rounded-full"><Check size={14} className="text-green-600 font-black" /></div> Certificate</li>
                          <li className="flex items-center gap-3"><div className="bg-green-100 p-1 rounded-full"><Check size={14} className="text-green-600 font-black" /></div> Mentor Support</li>
                          <li className="flex items-center gap-3"><div className="bg-green-100 p-1 rounded-full"><Check size={14} className="text-green-600 font-black" /></div> Real Projects</li>
                        </ul>
                      </div>

                      <button onClick={() => handleApplyClick(`${domain} Internship`, '449')} className="mt-auto w-full py-4 rounded-xl bg-gray-900 text-white font-bold hover:bg-[var(--color-brand-primary)] hover:shadow-lg hover:shadow-purple-500/30 transition-all relative z-10 overflow-hidden group/btn flex items-center justify-center gap-2">
                        Apply Now <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </div>

                    {/* Train Wheels */}
                    <div className="absolute bottom-2 left-10 w-10 h-10 rounded-full bg-gray-800 border-[3px] border-gray-400 shadow-md z-20 flex items-center justify-center animate-[spin_4s_linear_infinite_reverse] transition-all" style={{ animationPlayState: isTrainMoving ? 'running' : 'paused' }}>
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      <div className="absolute inset-0 border-[2px] border-dashed border-gray-600 rounded-full"></div>
                    </div>
                    <div className="absolute bottom-2 right-10 w-10 h-10 rounded-full bg-gray-800 border-[3px] border-gray-400 shadow-md z-20 flex items-center justify-center animate-[spin_4s_linear_infinite_reverse] transition-all" style={{ animationPlayState: isTrainMoving ? 'running' : 'paused' }}>
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      <div className="absolute inset-0 border-[2px] border-dashed border-gray-600 rounded-full"></div>
                    </div>
                  </div>

                  {/* The Train Link / Connector - hidden if it's the very last compartment before the engine */}
                  {!isLastCompartment && (
                    <div className="w-8 h-4 bg-gray-400 border-y-2 border-gray-500 shadow-inner relative z-0 flex items-center justify-center mb-16 mx-2 rounded-sm shrink-0">
                      <div className="w-full h-1 bg-gray-700"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Internship Types */}
      <section className="py-24 px-6 lg:px-8 max-w-6xl mx-auto">
        <ScrollReveal>
          <h2 className="font-bold text-3xl md:text-4xl text-center mb-16">Internship Paths</h2>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ScrollReveal delay={0.1} className="h-full">
            <div className="bg-white p-8 rounded-3xl border border-gray-200 h-full glow-hover transition-all relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-[80px] opacity-10 pointer-events-none"></div>
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Laptop size={28} />
              </div>
              <h3 className="font-bold text-gray-900 text-2xl mb-4">Project-Based</h3>
              <p className="text-[var(--color-brand-text-secondary)] mb-6">
                Work on real products like HUBMAT and BUNKR. Ship real features to active users.
              </p>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2"><Check size={18} className="text-[var(--color-brand-secondary)] shrink-0 mt-0.5" /> Direct code contributions</li>
                <li className="flex items-start gap-2"><Check size={18} className="text-[var(--color-brand-secondary)] shrink-0 mt-0.5" /> Agile sprint participation</li>
                <li className="flex items-start gap-2"><Check size={18} className="text-[var(--color-brand-secondary)] shrink-0 mt-0.5" /> Architecture reviews</li>
              </ul>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.2} className="h-full">
            <div className="bg-white p-8 rounded-3xl border border-gray-200 h-full glow-hover transition-all relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-brand-primary)] rounded-full blur-[80px] opacity-10 pointer-events-none"></div>
              <div className="w-14 h-14 bg-purple-50 text-[var(--color-brand-primary)] rounded-xl flex items-center justify-center mb-6">
                <Users size={28} />
              </div>
              <h3 className="font-bold text-gray-900 text-2xl mb-4">Training-Based</h3>
              <p className="text-[var(--color-brand-text-secondary)] mb-6">
                Structured learning sessions, weekly assignments, and expert mentor reviews.
              </p>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2"><Check size={18} className="text-[var(--color-brand-secondary)] shrink-0 mt-0.5" /> Guided curriculum</li>
                <li className="flex items-start gap-2"><Check size={18} className="text-[var(--color-brand-secondary)] shrink-0 mt-0.5" /> Live Q&A sessions</li>
                <li className="flex items-start gap-2"><Check size={18} className="text-[var(--color-brand-secondary)] shrink-0 mt-0.5" /> Capstone project</li>
              </ul>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 4. Duration and Fees */}
      <section className="py-32 px-6 lg:px-8 max-w-7xl mx-auto">
        <ScrollReveal>
          <h2 className="font-bold text-3xl md:text-5xl text-center mb-4 text-gray-900">Simple, Transparent Pricing</h2>
          <p className="text-center text-[var(--color-brand-text-secondary)] text-lg mb-20 max-w-2xl mx-auto">Invest in your skills. Real projects, dedicated mentorship, and verified certificates.</p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8">
          {/* Project Based Intern */}
          <ScrollReveal delay={0.05}>
            <TiltCard className="h-full">
              <div className="card bg-white p-8 lg:p-10 rounded-[2.5rem] h-full flex flex-col items-center justify-between text-center group hover:border-pink-500 hover:shadow-[0_20px_40px_rgba(236,72,153,0.15)] transition-all">
                <div>
                  <div className="w-16 h-16 bg-pink-50 text-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <Award size={32} />
                  </div>
                  <h3 className="font-black text-gray-900 text-2xl mb-2">Project Based</h3>
                  <p className="text-[var(--color-brand-text-secondary)] mb-8 font-medium">Only for certificate. Complete a project in one of 50+ domains and get verified.</p>

                  <div className="text-5xl font-black text-gray-900 mb-2">₹149</div>
                  <div className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-8">+ tax / per person</div>
                </div>

                <button onClick={() => handleApplyClick('Project Based Intern', '149')} className="w-full py-4 rounded-2xl bg-pink-50 text-pink-600 font-bold hover:bg-pink-600 hover:text-white transition-colors">
                  Select Project Based
                </button>
              </div>
            </TiltCard>
          </ScrollReveal>

          {/* 15 Days Sprint */}
          <ScrollReveal delay={0.1}>
            <TiltCard className="h-full">
              <div className="card bg-white p-8 lg:p-10 rounded-[2.5rem] h-full flex flex-col items-center justify-between text-center group hover:border-blue-500 hover:shadow-[0_20px_40px_rgba(59,130,246,0.15)] transition-all">
                <div>
                  <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <Zap size={32} />
                  </div>
                  <h3 className="font-black text-gray-900 text-2xl mb-2">15 Days Sprint</h3>
                  <p className="text-[var(--color-brand-text-secondary)] mb-8 font-medium">Perfect for a short, intense learning sprint.</p>

                  <div className="text-5xl font-black text-gray-900 mb-2">₹229</div>
                  <div className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-8">per person</div>
                </div>

                <button onClick={() => handleApplyClick('15 Days Sprint', '229')} className="w-full py-4 rounded-2xl bg-blue-50 text-blue-600 font-bold hover:bg-blue-600 hover:text-white transition-colors">
                  Select 15 Days
                </button>
              </div>
            </TiltCard>
          </ScrollReveal>

          {/* 30 Days Mastery */}
          <ScrollReveal delay={0.2}>
            <TiltCard className="h-full">
              <div className="card bg-gray-900 text-white p-8 lg:p-10 rounded-[2.5rem] h-full flex flex-col items-center justify-between text-center relative border-gray-800 shadow-2xl xl:scale-105 z-10 hover:border-[var(--color-brand-primary)] overflow-visible">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[var(--color-brand-secondary)] text-gray-900 px-4 py-1 rounded-full font-bold text-xs uppercase tracking-wider shadow-lg whitespace-nowrap z-20">
                  Most Popular
                </div>
                <div>
                  <div className="w-16 h-16 bg-[rgba(147,51,234,0.2)] text-[var(--color-brand-energy)] rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Target size={32} />
                  </div>
                  <h3 className="font-black text-white text-2xl mb-2">30 Days Mastery</h3>
                  <p className="text-gray-400 mb-8 font-medium">Deep dive into tech stacks and build a capstone project.</p>

                  <div className="text-5xl font-black mb-2">₹449</div>
                  <div className="text-sm text-gray-400 font-bold uppercase tracking-wider mb-8">per person</div>
                </div>

                <button onClick={() => handleApplyClick('30 Days Mastery', '449')} className="w-full py-4 rounded-2xl bg-gradient-primary text-white font-bold hover:shadow-lg transition-all active:scale-95 shadow-[0_0_20px_rgba(147,51,234,0.4)]">
                  Select 30 Days
                </button>
              </div>
            </TiltCard>
          </ScrollReveal>

          {/* Team Offer */}
          <ScrollReveal delay={0.3}>
            <TiltCard className="h-full">
              <div className="card bg-white p-8 lg:p-10 rounded-[2.5rem] h-full flex flex-col items-center justify-between text-center group hover:border-[var(--color-brand-secondary)] hover:shadow-[0_20px_40px_rgba(250,204,21,0.15)] transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-brand-secondary)] rounded-full blur-[80px] opacity-20 pointer-events-none"></div>
                <div>
                  <div className="w-16 h-16 bg-yellow-50 text-[var(--color-brand-secondary)] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <Users size={32} />
                  </div>
                  <h3 className="font-black text-gray-900 text-2xl mb-2">Team Sprint <span className="text-sm text-yellow-600">(30 Days)</span></h3>
                  <p className="text-[var(--color-brand-text-secondary)] mb-8 font-medium">Massive discount! Build together with 5 friends.</p>

                  <div className="text-5xl font-black text-gray-900 mb-2">₹2001</div>
                  <div className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-8">for 5 members</div>
                </div>

                <button onClick={() => handleApplyClick('Team Sprint', '2001')} className="w-full py-4 rounded-2xl bg-yellow-50 text-yellow-600 font-bold hover:bg-[var(--color-brand-secondary)] hover:text-gray-900 transition-colors">
                  Select Team Offer
                </button>
              </div>
            </TiltCard>
          </ScrollReveal>
        </div>
      </section>

      {/* 5. Benefits */}
      <section className="py-24 px-6 lg:px-8 bg-purple-50/50 relative overflow-hidden border-t border-gray-100">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-brand-primary)] rounded-full blur-[120px] opacity-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[var(--color-brand-secondary)] rounded-full blur-[120px] opacity-10"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          <ScrollReveal>
            <h2 className="font-bold text-3xl md:text-4xl text-center mb-16 text-gray-900">Why Join DAKH?</h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Zap, title: 'Real Projects', desc: 'No dummy projects. Build tools that real people use.' },
              { icon: Target, title: 'Skill Enhancement', desc: 'Focus on in-demand tech stacks and modern architectures.' },
              { icon: Award, title: 'Performance Stipend', desc: 'Top performers earn stipends based on their project contributions.' },
              { icon: Star, title: 'Certificate', desc: 'Get a verified certificate of completion and LOR for top work.' }
            ].map((benefit, i) => (
              <ScrollReveal key={benefit.title} delay={i * 0.1}>
                <div className="card p-6 rounded-3xl bg-white h-full">
                  <benefit.icon size={32} className="text-[var(--color-brand-secondary)] mb-4" />
                  <h3 className="font-bold text-gray-900 text-xl mb-3">{benefit.title}</h3>
                  <p className="text-[var(--color-brand-text-secondary)] text-sm">{benefit.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Intern Projects Section */}
      {internProjects.length > 0 && (
        <section className="py-24 px-6 lg:px-8 bg-white relative overflow-hidden border-t border-gray-100">
          <div className="max-w-6xl mx-auto relative z-10">
            <ScrollReveal>
              <h2 className="font-bold text-3xl md:text-4xl text-center mb-16 text-gray-900">Our Intern Works</h2>
            </ScrollReveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {internProjects.map((project, index) => (
                <ScrollReveal delay={index * 0.1} key={project.id}>
                  <div className="card bg-white rounded-[2rem] overflow-hidden border border-gray-150 shadow-sm hover:shadow-xl transition-all group h-full flex flex-col">
                    <div className="aspect-video w-full overflow-hidden relative bg-gray-100">
                      <img src={project.linkedin_image_link} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                        <h3 className="text-white font-bold text-xl">{project.title}</h3>
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-grow justify-between gap-6">
                      <h3 className="font-bold text-gray-900 text-xl group-hover:text-purple-600 transition-colors line-clamp-2">
                        {project.title}
                      </h3>
                      <div className="flex gap-3">
                        <a href={project.vercel_link} target="_blank" rel="noreferrer" className="flex-1 text-center py-2.5 rounded-xl bg-purple-50 text-purple-700 font-bold text-sm hover:bg-purple-600 hover:text-white transition-colors border border-purple-100">
                          Live Site
                        </a>
                        <a href={project.github_link} target="_blank" rel="noreferrer" className="flex-1 text-center py-2.5 rounded-xl bg-gray-50 text-gray-700 font-bold text-sm hover:bg-gray-900 hover:text-white transition-colors border border-gray-200">
                          GitHub
                        </a>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. Internship Roadmap */}
      <section className="py-24 px-6 lg:px-8 bg-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="font-extrabold text-4xl md:text-5xl text-gray-900 mb-4 tracking-tight">INTERNSHIP <span className="text-[var(--color-brand-primary)]">ROADMAP</span></h2>
              <p className="text-lg md:text-xl text-[var(--color-brand-text-secondary)] font-medium">Your Journey. Your Project. Your Future.</p>
            </div>
          </ScrollReveal>

          <div className="relative py-10 max-w-5xl mx-auto mt-10">
            {/* The Animated Center Line (Desktop) & Left Line (Mobile) */}
            <div className="absolute left-[2.25rem] md:left-1/2 top-0 bottom-0 w-2 bg-gradient-to-b from-blue-400 via-purple-400 to-pink-400 opacity-20 transform md:-translate-x-1/2 rounded-full"></div>

            {roadmapSteps.map((step, index) => {
              const isEven = index % 2 === 0;
              return (
                <ScrollReveal delay={index * 0.1 + 0.1} key={index}>
                  <div className={`relative flex items-center justify-between group w-full mb-12 md:mb-16 ${isEven ? 'md:flex-row-reverse' : ''}`}>

                    {/* The Number Badge (Center on Desktop, Left on Mobile) */}
                    <div className={`absolute left-[2.25rem] md:left-1/2 transform -translate-x-1/2 w-14 h-14 rounded-full ${step.bgIcon} text-white font-black text-2xl flex items-center justify-center ${step.shadowIcon} border-4 border-white z-20 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-300`}>
                      {step.num}
                    </div>

                    {/* Empty Space for alignment on Desktop */}
                    <div className="hidden md:block w-5/12"></div>

                    {/* The Card */}
                    <div className="w-full pl-[5.5rem] md:pl-0 md:w-5/12 relative">
                      <div className={`bg-white/80 backdrop-blur-xl border-2 border-transparent p-6 md:p-8 rounded-[2rem] shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ${step.borderCard} relative z-10 group-hover:bg-white`}>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
                          <div className={`w-14 h-14 rounded-2xl ${step.bgIcon} bg-opacity-10 flex items-center justify-center shrink-0`}>
                            <step.Icon className={`${step.textIcon} w-8 h-8`} />
                          </div>
                          <h3 className={`font-black text-2xl ${step.textTitle} uppercase tracking-tight leading-tight`}>{step.title}</h3>
                        </div>
                        <p className="text-gray-600 leading-relaxed font-medium text-lg">{step.desc}</p>
                      </div>
                    </div>

                  </div>
                </ScrollReveal>
              );
            })}
          </div>

          {/* Important Note Box */}
          <ScrollReveal delay={0.7}>
            <div className="bg-gray-50 border border-gray-200 rounded-3xl p-8 md:p-12 shadow-sm mb-12 relative mt-4">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-12 bg-[#1a2b4b] text-white px-8 py-2 rounded-full font-bold text-sm tracking-widest uppercase shadow-md border-2 border-white">
                Important Note
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-6">
                <div>
                  <div className="flex gap-3 items-start mb-5">
                    <CheckCircle2 className="text-green-600 w-6 h-6 shrink-0 mt-0.5" />
                    <h4 className="font-bold text-gray-900 leading-snug">Interns who successfully complete and submit their assigned project will receive:</h4>
                  </div>
                  <ul className="space-y-3 ml-9">
                    <li className="flex items-center gap-3 text-sm md:text-base text-gray-700 font-medium"><Check className="w-4 h-4 text-green-500 shrink-0" /> Internship Completion Certificate</li>
                    <li className="flex items-center gap-3 text-sm md:text-base text-gray-700 font-medium"><Check className="w-4 h-4 text-green-500 shrink-0" /> Internship Offer Letter</li>
                    <li className="flex items-center gap-3 text-sm md:text-base text-gray-700 font-medium"><Check className="w-4 h-4 text-green-500 shrink-0" /> Project Details Mentioned in Certificate</li>
                    <li className="flex items-center gap-3 text-sm md:text-base text-gray-700 font-medium"><Check className="w-4 h-4 text-green-500 shrink-0" /> Letter of Recommendation <span className="text-gray-400 font-normal ml-1">(Based on Performance)</span></li>
                  </ul>
                </div>
                <div>
                  <div className="flex gap-3 items-start mb-5">
                    <AlertTriangle className="text-orange-500 w-6 h-6 shrink-0 mt-0.5" />
                    <h4 className="font-bold text-gray-900 leading-snug">Interns who complete the internship duration but do not submit the assigned project will receive:</h4>
                  </div>
                  <ul className="space-y-3 ml-9">
                    <li className="flex items-center gap-3 text-sm md:text-base text-gray-700 font-medium"><Check className="w-4 h-4 text-gray-400 shrink-0" /> Standard Internship Completion Certificate</li>
                  </ul>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Certificate Verification Section */}
          <ScrollReveal delay={0.75}>
            <div id="verify-certificate-sec" className="bg-white border-2 border-purple-100 rounded-3xl p-8 md:p-12 shadow-xl mb-12 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-yellow-500"></div>
              <div className="absolute top-[-100px] right-[-100px] w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

              <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-100 text-purple-700 rounded-full px-4 py-1.5 font-bold text-xs mb-3 uppercase tracking-wider">
                    <Award className="w-3.5 h-3.5 shrink-0" />
                    <span>Certificates Portal</span>
                  </div>
                  <h3 className="font-extrabold text-3xl text-gray-900 mb-2">Get Your Certificate</h3>
                  <p className="text-gray-500 font-medium text-sm">Verify and download your official DAKH Edu Solutions internship certificate.</p>
                </div>

                {!certificate ? (
                  <form onSubmit={handleCertSearch} className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <div>
                      <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2">Registered Email Address</label>
                      <input
                        type="email"
                        required
                        value={certEmail}
                        onChange={(e) => setCertEmail(e.target.value)}
                        placeholder="intern@example.com"
                        className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-950 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2">Certificate Code / Intern No.</label>
                      <input
                        type="text"
                        required
                        value={certCode}
                        onChange={(e) => setCertCode(e.target.value)}
                        placeholder="DES/INT/2026/001"
                        className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-950 font-medium"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      {certError && (
                        <div className="p-3.5 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-semibold flex items-start gap-2 mb-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></span>
                          <div>{certError}</div>
                        </div>
                      )}
                      <button
                        type="submit"
                        disabled={certLoading}
                        className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:opacity-75"
                      >
                        {certLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
                          </>
                        ) : (
                          'VERIFY & DOWNLOAD CERTIFICATE'
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="bg-slate-50 border border-purple-100 p-6 md:p-10 rounded-3xl text-center space-y-6">
                    <div className="flex flex-col items-center justify-center">
                      <div 
                        onClick={() => {
                          const imageUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/badges/${certificate.domain.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-badge.png`;
                          window.open(imageUrl, '_blank');
                        }}
                        className="block cursor-pointer transition-transform hover:scale-105"
                        title="Click to view full badge image"
                      >
                        <CompletionBadge domain={certificate.domain} name={certificate.full_name} />
                      </div>
                      <div className="w-12 h-12 bg-green-50 text-green-600 border border-green-200 rounded-full flex items-center justify-center mx-auto mb-3 mt-4">
                        <Check className="w-6 h-6" />
                      </div>
                      <h4 className="font-extrabold text-gray-900 text-2xl">Verification Successful</h4>
                      <p className="text-gray-500 font-medium">Valid certificate match found</p>
                    </div>

                    <div className="max-w-md mx-auto p-5 bg-white border border-slate-200 rounded-xl text-left space-y-3 text-sm text-gray-700 shadow-sm">
                      <div className="flex justify-between"><span className="text-xs text-gray-400 font-bold uppercase">Intern Name:</span> <span className="font-bold">{certificate.full_name}</span></div>
                      <div className="flex justify-between border-t border-slate-100 pt-2"><span className="text-xs text-gray-400 font-bold uppercase">Domain:</span> <span className="font-bold">{certificate.domain}</span></div>
                      <div className="flex justify-between border-t border-slate-100 pt-2"><span className="text-xs text-gray-400 font-bold uppercase">Code:</span> <span className="font-bold text-purple-600 font-mono">{certificate.certificate_code}</span></div>
                    </div>

                    <div className="flex justify-center gap-3 flex-wrap">
                      <button 
                        onClick={() => {
                          const imageUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/badges/${certificate.domain.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-badge.png`;
                          
                          // Download the image
                          fetch(imageUrl)
                            .then(response => response.blob())
                            .then(blob => {
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.style.display = 'none';
                              a.href = url;
                              a.download = `DAKH-Edu-${certificate.domain.replace(/[^a-z0-9]+/gi, '-')}-Badge.png`;
                              document.body.appendChild(a);
                              a.click();
                              window.URL.revokeObjectURL(url);
                            })
                            .catch(err => {
                              console.error('Download failed', err);
                              window.open(imageUrl, '_blank'); // Fallback if CORS blocks fetch
                            });

                          // Open LinkedIn
                          const text = `I am thrilled to share that I have successfully completed my Internship in ${certificate.domain} at DAKH Edu Solutions! 🎓🚀\n\nYou can verify my certificate here: ${certificate.certificate_link}`;
                          window.open(`https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(text)}`, '_blank');
                        }}
                        className="px-6 py-3 bg-[#0a66c2] hover:bg-[#004182] text-white font-bold rounded-xl transition-all shadow-md hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 cursor-pointer"
                        title="Downloads badge & opens LinkedIn"
                      >
                        <Share2 className="w-4 h-4" /> Share on LinkedIn
                      </button>
                      <a
                        href={certificate.certificate_link}
                        target="_blank"
                        rel="noreferrer"
                        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all shadow-md hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 cursor-pointer"
                      >
                        <Download className="w-4 h-4" /> Download Certificate
                      </a>
                      <button
                        onClick={() => {
                          setCertificate(null);
                          setCertEmail('');
                          setCertCode('');
                        }}
                        className="px-5 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ScrollReveal>

          {/* Quote & Footer Section */}
          <ScrollReveal delay={0.8}>
            <div className="bg-[#0f172a] rounded-3xl overflow-hidden flex flex-col lg:flex-row shadow-2xl">
              <div className="p-10 lg:p-12 lg:w-5/12 flex flex-col justify-center bg-gradient-to-br from-[#1e293b] to-[#0f172a] relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
                <h3 className="text-white text-xl md:text-2xl font-serif italic leading-relaxed relative z-10">
                  "Learning never exhausts the mind. Every project you complete today becomes a milestone in your professional journey tomorrow."
                </h3>
                <p className="text-[#a78bfa] font-bold mt-6 tracking-widest text-sm uppercase relative z-10">— DAKH Edu Solutions</p>
              </div>
              <div className="p-10 lg:p-12 lg:w-7/12 grid grid-cols-1 sm:grid-cols-2 gap-8 items-center bg-[#0b1120]">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <span className="text-gray-200 font-bold tracking-wide">Gain Practical Experience</span>
                </div>
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/20">
                    <Users className="w-6 h-6" />
                  </div>
                  <span className="text-gray-200 font-bold tracking-wide">Learn with Expert Guidance</span>
                </div>
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/20">
                    <Target className="w-6 h-6" />
                  </div>
                  <span className="text-gray-200 font-bold tracking-wide">Build Real-World Skills</span>
                </div>
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0 border border-pink-500/20">
                    <Zap className="w-6 h-6" />
                  </div>
                  <span className="text-gray-200 font-bold tracking-wide">Launch Your Career</span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <InternshipModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        planDetails={selectedPlan}
      />

    </PageTransition>
  );
};

export default Internship;
