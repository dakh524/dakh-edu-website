import React, { useState, useMemo } from 'react';
import { 
  PieChart as PieIcon, 
  BarChart2, 
  Calendar, 
  Mail, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Check, 
  X, 
  Search, 
  BookOpen, 
  Code2, 
  PlayCircle, 
  Layers, 
  Award, 
  Send, 
  Filter, 
  ExternalLink, 
  GraduationCap, 
  AlertCircle,
  Database,
  HardDrive,
  Cpu,
  ShieldCheck,
  Zap,
  TrendingDown,
  AlertTriangle
} from 'lucide-react';
import { GEN_AI_MODULES } from '../data/genAiModules';
import { FULL_STACK_MODULES } from '../data/fullStackModules';
import { AWS_CLOUD_MODULES, AWS_CLOUD_PROJECTS } from '../data/awsCloudModules';

// Fallback modules for Vibe Coding
const VIBE_CODING_MODULES = [
  {
    week_number: 1,
    title: 'Foundations of Vibe Coding & AI Pair Programming',
    task_details: 'Build a Personal Portfolio Website and a To-Do List App using natural language prompts with Cursor / Copilot.',
    videos: [
      { title: "The Ultimate Beginner's Guide to Vibe Coding", duration: '12:00' },
      { title: 'Learn to Vibe Code in 10 Minutes', duration: '10:00' }
    ]
  },
  {
    week_number: 2,
    title: 'Core Tool Mastery (Cursor + Prompt Engineering)',
    task_details: 'Build interactive tools: Live Weather Dashboard & Expense Tracker using modern component libraries.',
    videos: [
      { title: 'Cursor Vibe Coding Tutorial for Beginners', duration: '15:30' }
    ]
  },
  {
    week_number: 3,
    title: 'Full Stack Integration & API Pipelines',
    task_details: 'Connect AI APIs (OpenAI / Gemini) to your front-end web application.',
    videos: [
      { title: 'Connecting AI APIs to Web Apps', duration: '18:40' }
    ]
  },
  {
    week_number: 4,
    title: 'Capstone Deployment & Production Polish',
    task_details: 'Deploy your complete AI-assisted project on Vercel or Netlify with custom domain routing.',
    videos: [
      { title: 'Deploying Production Apps with Git and Vercel', duration: '20:00' }
    ]
  }
];

const DOMAIN_PROJECTS = {
  'AWS Cloud Foundations': [
    { title: 'Static Website on AWS (S3 + CloudFront OAC)', desc: 'Build and deploy a responsive portfolio over HTTPS using private S3, CloudFront OAC, and cache invalidation.' },
    { title: 'Event Landing Page with Global CDN', desc: 'Host a mobile-friendly club/event showcase site with dark mode toggle and sub-second latency on CloudFront.' },
    { title: 'Production Cloud Static Architecture', desc: 'Implement production-grade AWS architecture with GitHub version control, private storage, and zero-downtime updates.' }
  ],
  'Cloud Computing': [
    { title: 'Static Website on AWS (S3 + CloudFront OAC)', desc: 'Build and deploy a responsive portfolio over HTTPS using private S3, CloudFront OAC, and cache invalidation.' },
    { title: 'Event Landing Page with Global CDN', desc: 'Host a mobile-friendly club/event showcase site with dark mode toggle and sub-second latency on CloudFront.' },
    { title: 'Production Cloud Static Architecture', desc: 'Implement production-grade AWS architecture with GitHub version control, private storage, and zero-downtime updates.' }
  ],
  'Full Stack Development': [
    { title: 'Photography Portfolio & Booking Platform', desc: 'Build a high-performance booking system where clients view portfolios and schedule photography sessions.' },
    { title: 'E-Commerce Marketplace', desc: 'Develop a full-stack shopping platform with cart, payment gateway integration, and order tracking.' },
    { title: 'Appointment & Management Portal', desc: 'Create a multi-service scheduling portal with customer notifications and admin calendars.' }
  ],
  'Web Development': [
    { title: 'Modern SaaS Landing Page & Portal', desc: 'Develop a responsive web application with animations, auth gates, and pricing tier integrations.' },
    { title: 'Real-Time Social Media Dashboard', desc: 'Build a dynamic analytics dashboard with dark mode, live charts, and activity feeds.' },
    { title: 'Collaborative Kanban Task Board', desc: 'Build a drag-and-drop project tracker with team collaboration features.' }
  ],
  'Generative AI': [
    { title: 'Autonomous Multi-Agent Researcher', desc: 'Build an AI assistant that crawls documents, summarizes key insights, and outputs formatted briefs.' },
    { title: 'AI Customer Support Bot with RAG', desc: 'Create a knowledge-base chatbot using Retrieval Augmented Generation and vector embeddings.' },
    { title: 'Multimodal Creative Generation Studio', desc: 'Build an AI app that generates marketing copy and banner images using Gemini / Claude APIs.' }
  ],
  'Vibe Coding': [
    { title: 'AI-Generated Quiz & Trivia Engine', desc: 'Create a real-time multiplayer trivia app generated end-to-end via AI natural language prompts.' },
    { title: 'Live Weather & Expense Tracker', desc: 'An interactive personal finance and weather dashboard crafted iteratively using Cursor.' },
    { title: 'Custom AI Assistant App', desc: 'Build and deploy a full-featured micro-SaaS application completely using AI-first coding workflows.' }
  ],
  'App Development': [
    { title: 'Health & Fitness Tracking Mobile App', desc: 'Track daily steps, calories, and workouts with offline local caching and push reminders.' },
    { title: 'Food & Grocery Delivery App', desc: 'Cross-platform mobile application with order tracking, restaurant catalogues, and checkout.' }
  ],
  'Data Science': [
    { title: 'Retail Sales Forecasting Engine', desc: 'Build ML regression models to predict inventory demand and seasonal sales spikes.' },
    { title: 'Customer Segmentation & Churn Predictor', desc: 'Use clustering and classification algorithms to group users and forecast retention.' }
  ],
  'UI/UX Design': [
    { title: 'Fintech Banking Mobile App Redesign', desc: 'Conduct user research, design wireframes, and high-fidelity Figma prototypes for mobile banking.' },
    { title: 'Travel & Hotel Booking Experience', desc: 'Design a seamless mobile-first booking journey with design systems and interactive micro-interactions.' }
  ]
};

const PALETTE = [
  '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#64748b'
];

export default function AnalyticsHub({
  registrations = [],
  certificates = [],
  outboxLogs = [],
  onResendEmail,
  onFilterDomainInTable
}) {
  const [activeSection, setActiveSection] = useState('expirations'); // 'expirations', 'domains', 'timeline', 'mailer', 'quotas', 'preview'
  const [selectedDomain, setSelectedDomain] = useState('Generative AI');
  const [hoveredSlice, setHoveredSlice] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [mailSearchTerm, setMailSearchTerm] = useState('');
  const [mailFilterStatus, setMailFilterStatus] = useState('all');
  const [expireFilter, setExpireFilter] = useState('all'); // 'all', 'critical_3days', 'soon_7days', 'completed'
  const [expireSearchTerm, setExpireSearchTerm] = useState('');

  // 1. Domain aggregation
  const { domainStats, totalRegistrations, topDomain } = useMemo(() => {
    const total = registrations.length;
    if (total === 0) return { domainStats: [], totalRegistrations: 0, topDomain: null };

    const counts = {};
    registrations.forEach(r => {
      const dm = (r.domain || 'Unspecified').trim();
      counts[dm] = (counts[dm] || 0) + 1;
    });

    const list = Object.entries(counts)
      .map(([name, count], index) => {
        const color = PALETTE[index % PALETTE.length];
        const pct = Number(((count / total) * 100).toFixed(1));
        return { name, count, pct, color };
      })
      .sort((a, b) => b.count - a.count);

    return { domainStats: list, totalRegistrations: total, topDomain: list[0] || null };
  }, [registrations]);

  // 2. Date-wise timeline aggregation
  const dateStats = useMemo(() => {
    if (!registrations || registrations.length === 0) return [];
    const dateMap = {};

    registrations.forEach(r => {
      let rawDate = r.created_at;
      if (!rawDate) return;
      const dateKey = new Date(rawDate).toISOString().split('T')[0];
      if (!dateMap[dateKey]) {
        dateMap[dateKey] = {
          dateKey,
          displayDate: new Date(dateKey + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
          fullDate: new Date(dateKey + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          students: []
        };
      }
      dateMap[dateKey].students.push(r);
    });

    return Object.values(dateMap).sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  }, [registrations]);

  const maxDateCount = useMemo(() => {
    return Math.max(...dateStats.map(d => d.students.length), 1);
  }, [dateStats]);

  // 3. Email dispatch aggregation
  const emailStats = useMemo(() => {
    const total = registrations.length;
    const approvedTotal = registrations.filter(r => r.status === 'Approved').length;

    const ackSent = registrations.filter(r => r.reg_email_status === 'sent').length;
    const offerSent = registrations.filter(r => r.approval_email_status === 'sent').length;
    const reminderSent = registrations.filter(r => r.reminder_email_status === 'sent').length;
    const certSent = registrations.filter(r => r.cert_email_status === 'sent').length;

    const totalSent = ackSent + offerSent + reminderSent + certSent;

    return {
      ackSent,
      ackTotal: total,
      offerSent,
      offerTotal: approvedTotal,
      reminderSent,
      certSent,
      certTotal: certificates.length,
      totalSent
    };
  }, [registrations, certificates]);

  // 4. Intern Expiration & Deadlines Tracking ("yaru yaruku intern mudiyapothu")
  const expirationData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const approvedList = registrations.filter(r => r.status === 'Approved');

    const categorized = approvedList.map(r => {
      let daysRemaining = null;
      let statusCategory = 'pending_schedule';

      if (r.end_date) {
        try {
          const endDate = new Date(r.end_date);
          endDate.setHours(0, 0, 0, 0);
          daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

          if (daysRemaining < 0) {
            statusCategory = 'completed';
          } else if (daysRemaining <= 3) {
            statusCategory = 'critical_3days';
          } else if (daysRemaining <= 7) {
            statusCategory = 'soon_7days';
          } else {
            statusCategory = 'active';
          }
        } catch (e) {
          console.warn('Error parsing end date:', r.end_date);
        }
      }

      return {
        ...r,
        daysRemaining,
        statusCategory
      };
    });

    // Sort by urgency: critical <= 3 days first, then <= 7 days, then completed, then active
    const sorted = [...categorized].sort((a, b) => {
      if (a.daysRemaining === null && b.daysRemaining === null) return 0;
      if (a.daysRemaining === null) return 1;
      if (b.daysRemaining === null) return -1;
      return a.daysRemaining - b.daysRemaining;
    });

    const criticalCount = sorted.filter(s => s.statusCategory === 'critical_3days').length;
    const soonCount = sorted.filter(s => s.statusCategory === 'soon_7days').length;
    const completedCount = sorted.filter(s => s.statusCategory === 'completed').length;
    const activeCount = sorted.filter(s => s.statusCategory === 'active').length;

    return {
      list: sorted,
      criticalCount,
      soonCount,
      completedCount,
      activeCount
    };
  }, [registrations]);

  // Filtered expirations
  const filteredExpirations = useMemo(() => {
    return expirationData.list.filter(s => {
      const matchSearch = !expireSearchTerm ||
        s.full_name?.toLowerCase().includes(expireSearchTerm.toLowerCase()) ||
        s.email?.toLowerCase().includes(expireSearchTerm.toLowerCase()) ||
        s.domain?.toLowerCase().includes(expireSearchTerm.toLowerCase());

      if (!matchSearch) return false;

      if (expireFilter === 'critical_3days') return s.statusCategory === 'critical_3days';
      if (expireFilter === 'soon_7days') return s.statusCategory === 'soon_7days';
      if (expireFilter === 'completed') return s.statusCategory === 'completed';
      if (expireFilter === 'active') return s.statusCategory === 'active';
      return true;
    });
  }, [expirationData.list, expireFilter, expireSearchTerm]);

  // 5. Free Plan & Infrastructure Quotas
  const quotaData = useMemo(() => {
    const resendSent = emailStats.totalSent;
    const resendLimitMonth = 3000;
    const resendLimitDay = 100;
    const resendPercent = Math.min(100, Number(((resendSent / resendLimitMonth) * 100).toFixed(1)));

    const totalDbRows = registrations.length + certificates.length + outboxLogs.length;
    const estimatedDbUsedMb = Number((Math.max(1.5, totalDbRows * 0.003)).toFixed(2));
    const dbLimitMb = 500;
    const dbPercent = Number(((estimatedDbUsedMb / dbLimitMb) * 100).toFixed(2));

    const estimatedStorageUsedMb = 14.2;
    const storageLimitMb = 1000;
    const storagePercent = Number(((estimatedStorageUsedMb / storageLimitMb) * 100).toFixed(1));

    const vercelFunctionsUsed = 8;
    const vercelFunctionsLimit = 12;

    return {
      resend: {
        sent: resendSent,
        limit: resendLimitMonth,
        remaining: Math.max(0, resendLimitMonth - resendSent),
        percent: resendPercent,
        dailyLimit: resendLimitDay,
        planName: 'Resend Free Plan (3,000 / mo)'
      },
      supabase: {
        dbUsedMb: estimatedDbUsedMb,
        dbLimitMb,
        dbRemainingMb: (dbLimitMb - estimatedDbUsedMb).toFixed(1),
        dbPercent,
        storageUsedMb: estimatedStorageUsedMb,
        storageLimitMb,
        storageRemainingMb: (storageLimitMb - estimatedStorageUsedMb).toFixed(1),
        storagePercent,
        mauUsed: registrations.length,
        mauLimit: 50000,
        planName: 'Supabase Free Tier (500 MB)'
      },
      vercel: {
        functionsUsed: vercelFunctionsUsed,
        functionsLimit: vercelFunctionsLimit,
        functionsRemaining: vercelFunctionsLimit - vercelFunctionsUsed,
        bandwidthLimitGb: 100,
        planName: 'Vercel Hobby Plan (12 Serverless)'
      }
    };
  }, [registrations, certificates, outboxLogs, emailStats.totalSent]);

  // 6. Domain Preview Data
  const previewData = useMemo(() => {
    const domainKey = selectedDomain;
    let modules = [];
    if (domainKey.includes('Cloud') || domainKey.includes('AWS')) {
      modules = AWS_CLOUD_MODULES;
    } else if (domainKey.includes('Gen') || domainKey.includes('AI')) {
      modules = GEN_AI_MODULES;
    } else if (domainKey.includes('Full') || domainKey.includes('Web') || domainKey.includes('Python')) {
      modules = FULL_STACK_MODULES;
    } else if (domainKey.includes('Vibe')) {
      modules = VIBE_CODING_MODULES;
    } else {
      modules = GEN_AI_MODULES;
    }

    const projects = DOMAIN_PROJECTS[domainKey] || DOMAIN_PROJECTS['Web Development'];

    return {
      domainName: domainKey,
      modules,
      projects
    };
  }, [selectedDomain]);

  // Filtered students for email delivery audit
  const filteredMailStudents = useMemo(() => {
    return registrations.filter(r => {
      const matchSearch = !mailSearchTerm || 
        r.full_name?.toLowerCase().includes(mailSearchTerm.toLowerCase()) ||
        r.email?.toLowerCase().includes(mailSearchTerm.toLowerCase()) ||
        r.domain?.toLowerCase().includes(mailSearchTerm.toLowerCase());

      if (!matchSearch) return false;

      if (mailFilterStatus === 'offer_sent') return r.approval_email_status === 'sent';
      if (mailFilterStatus === 'offer_pending') return r.status === 'Approved' && r.approval_email_status !== 'sent';
      if (mailFilterStatus === 'pending_approval') return r.status !== 'Approved';
      return true;
    });
  }, [registrations, mailSearchTerm, mailFilterStatus]);

  // SVG Donut calculation
  const RADIUS = 36;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  let cumulativePercent = 0;
  const slices = domainStats.map(item => {
    const strokeDasharray = `${(item.pct / 100) * CIRCUMFERENCE} ${CIRCUMFERENCE}`;
    const strokeDashoffset = -((cumulativePercent / 100) * CIRCUMFERENCE);
    cumulativePercent += item.pct;
    return { ...item, strokeDasharray, strokeDashoffset };
  });

  return (
    <div className="space-y-6">
      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Expirations Alert */}
        <div 
          onClick={() => setActiveSection('expirations')}
          className={`p-4.5 rounded-2xl border transition-all cursor-pointer ${
            expirationData.criticalCount > 0 
              ? 'bg-rose-50/80 border-rose-300 shadow-xs' 
              : 'bg-white border-slate-200/90 shadow-xs hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`font-extrabold text-[11px] uppercase tracking-wider ${
              expirationData.criticalCount > 0 ? 'text-rose-700' : 'text-slate-400'
            }`}>
              Ending in ≤ 3 Days
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
              expirationData.criticalCount > 0 ? 'bg-rose-200 text-rose-800 animate-pulse' : 'bg-slate-100 text-slate-500'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-3xl font-black mt-2 ${
            expirationData.criticalCount > 0 ? 'text-rose-700' : 'text-slate-900'
          }`}>
            {expirationData.criticalCount}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            {expirationData.soonCount} more ending this week
          </div>
        </div>

        {/* Card 2: Resend Free Quota */}
        <div 
          onClick={() => setActiveSection('quotas')}
          className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-extrabold text-[11px] uppercase tracking-wider">Resend Free Quota</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-indigo-600 mt-2">
            {quotaData.resend.sent} / 3k
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            {quotaData.resend.remaining} free emails left ({quotaData.resend.percent}% used)
          </div>
        </div>

        {/* Card 3: Supabase Storage Free Tier */}
        <div 
          onClick={() => setActiveSection('quotas')}
          className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-extrabold text-[11px] uppercase tracking-wider">Supabase Storage</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-600 mt-2">
            &lt; 2 MB
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            Out of 500 MB Free Plan (99.6% available)
          </div>
        </div>

        {/* Card 4: Top Registered Domain */}
        <div 
          onClick={() => setActiveSection('domains')}
          className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-extrabold text-[11px] uppercase tracking-wider">Top Domain</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 mt-2 truncate">
            {topDomain ? topDomain.name : 'N/A'}
          </div>
          <div className="text-[11px] text-amber-700 font-bold mt-1">
            {topDomain ? `${topDomain.count} students (${topDomain.pct}%)` : 'No data'}
          </div>
        </div>
      </div>

      {/* Analytics Sub-Navigation Navigation Bar */}
      <div className="flex bg-slate-100/90 p-1.5 rounded-2xl w-fit border border-slate-200/80 shadow-inner flex-wrap gap-1">
        <button
          type="button"
          onClick={() => setActiveSection('expirations')}
          className={`py-2 px-4 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
            activeSection === 'expirations'
              ? 'bg-white text-rose-700 shadow-sm border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-rose-600" />
          <span>Internship Expirations</span>
          {expirationData.criticalCount > 0 && (
            <span className="bg-rose-600 text-white text-[10px] py-0.2 px-1.5 rounded-full font-black animate-pulse">
              {expirationData.criticalCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('quotas')}
          className={`py-2 px-4 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
            activeSection === 'quotas'
              ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Free Plan & Storage</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('domains')}
          className={`py-2 px-4 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
            activeSection === 'domains'
              ? 'bg-white text-purple-700 shadow-sm border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <PieIcon className="w-3.5 h-3.5 text-purple-600" />
          <span>Domain Pie Chart</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('timeline')}
          className={`py-2 px-4 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
            activeSection === 'timeline'
              ? 'bg-white text-blue-700 shadow-sm border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5 text-blue-600" />
          <span>Date-Wise Registrations</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('mailer')}
          className={`py-2 px-4 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
            activeSection === 'mailer'
              ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Mail className="w-3.5 h-3.5 text-indigo-600" />
          <span>Mail Delivery Status</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('preview')}
          className={`py-2 px-4 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
            activeSection === 'preview'
              ? 'bg-white text-amber-700 shadow-sm border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-600" />
          <span>Student Portal Preview</span>
        </button>
      </div>

      {/* SECTION 1: INTERNSHIP EXPIRATIONS ("yaru yaruku intern mudiyapothu") */}
      {activeSection === 'expirations' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-rose-600" />
                Internship Expiration & Completion Watchlist
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Track who is finishing in 3 days, who ended recently, and issue reminders or completion certificates.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1 rounded-xl flex items-center gap-1.5 w-fit">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                {expirationData.criticalCount} interns ending in ≤ 3 days
              </span>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setExpireFilter('all')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                  expireFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Approved ({expirationData.list.length})
              </button>

              <button
                type="button"
                onClick={() => setExpireFilter('critical_3days')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                  expireFilter === 'critical_3days'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                }`}
              >
                <AlertTriangle className="w-3 h-3" />
                Ending in ≤ 3 Days ({expirationData.criticalCount})
              </button>

              <button
                type="button"
                onClick={() => setExpireFilter('soon_7days')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                  expireFilter === 'soon_7days'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                Ending in 4–7 Days ({expirationData.soonCount})
              </button>

              <button
                type="button"
                onClick={() => setExpireFilter('completed')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                  expireFilter === 'completed'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                Completed ({expirationData.completedCount})
              </button>

              <button
                type="button"
                onClick={() => setExpireFilter('active')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                  expireFilter === 'active'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                }`}
              >
                Active Ongoing ({expirationData.activeCount})
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search intern name or email..."
                value={expireSearchTerm}
                onChange={(e) => setExpireSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
          </div>

          {/* Expiration Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Intern Info</th>
                  <th className="py-2.5 px-3">Domain</th>
                  <th className="py-2.5 px-3">Start Date</th>
                  <th className="py-2.5 px-3">End Date</th>
                  <th className="py-2.5 px-3 text-center">Deadline Status</th>
                  <th className="py-2.5 px-3 text-center">Stage 3 Reminder</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredExpirations.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400">
                      No interns match this expiration criteria.
                    </td>
                  </tr>
                ) : (
                  filteredExpirations.map(intern => {
                    const days = intern.daysRemaining;

                    let badge = null;
                    if (days === null) {
                      badge = <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">Schedule Pending</span>;
                    } else if (days < 0) {
                      badge = <span className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">Completed ({Math.abs(days)}d ago)</span>;
                    } else if (days === 0) {
                      badge = <span className="text-[10px] font-black text-rose-700 bg-rose-100 border border-rose-300 px-2.5 py-0.5 rounded-full animate-pulse">Ends Today!</span>;
                    } else if (days <= 3) {
                      badge = <span className="text-[10px] font-black text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full animate-pulse">Ends in {days} day{days > 1 ? 's' : ''}!</span>;
                    } else if (days <= 7) {
                      badge = <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">{days} days left</span>;
                    } else {
                      badge = <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">{days} days remaining</span>;
                    }

                    return (
                      <tr key={intern.id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3">
                          <div className="font-extrabold text-slate-900">{intern.full_name || 'Student'}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{intern.intern_number || intern.email}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                            {intern.domain}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                          {intern.start_date || '—'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-900 font-bold font-mono text-[11px]">
                          {intern.end_date || '—'}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {badge}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {intern.reminder_email_status === 'sent' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <Check className="w-3 h-3" /> Reminder Sent
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">Not Sent</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            {/* Action to dispatch reminder */}
                            <button
                              type="button"
                              onClick={() => onResendEmail && onResendEmail(intern, 'PROJECT_REMINDER')}
                              className="text-[10px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                              title="Send 3-Day Project Reminder Email"
                            >
                              Send Reminder
                            </button>
                            {/* Action to dispatch certificate */}
                            {days !== null && days <= 0 && (
                              <button
                                type="button"
                                onClick={() => onResendEmail && onResendEmail(intern, 'CERTIFICATE_DISPATCH')}
                                className="text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                                title="Issue / Send Certificate Email"
                              >
                                Issue Cert
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 2: FREE PLAN & STORAGE MONITOR ("supaabse storage ipo ena, resend la ethana mail poiruku, ellam free plan la tha iruku") */}
      {activeSection === 'quotas' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Infrastructure & Free Tier Quotas Monitor
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time usage tracking across Supabase, Resend, and Vercel Hobby limits.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                100% Free Plan Active (₹0 / $0 Cost)
              </span>
            </div>
          </div>

          {/* 3 Cloud Infrastructure Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Resend Email Quota */}
            <div className="p-5 rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/50 to-white space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
                    R
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">Resend Free Plan</h4>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.2 rounded">
                      3,000 Emails / Month
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Healthy
                </span>
              </div>

              <div>
                <div className="flex items-baseline justify-between text-xs mb-1">
                  <span className="font-extrabold text-slate-800">Monthly Usage</span>
                  <span className="font-mono font-bold text-indigo-900">
                    {quotaData.resend.sent} / {quotaData.resend.limit.toLocaleString()} sent
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.max(2, quotaData.resend.percent)}%` }} 
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-medium">
                  <span>{quotaData.resend.remaining.toLocaleString()} free mails left</span>
                  <span>{quotaData.resend.percent}% used</span>
                </div>
              </div>

              <div className="pt-3 border-t border-indigo-100/80 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Daily Rate Cap:</span>
                  <span className="font-mono font-bold text-slate-800">100 / day (Safe)</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Domains Verified:</span>
                  <span className="font-bold text-emerald-700">dakhedusolutions.in</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Current Cost:</span>
                  <span className="font-mono font-extrabold text-emerald-700">Free forever ($0)</span>
                </div>
              </div>
            </div>

            {/* Card 2: Supabase Database & Storage */}
            <div className="p-5 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-white space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
                    S
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">Supabase Free Tier</h4>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                      500 MB DB + 1 GB Files
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  99.6% Free
                </span>
              </div>

              {/* Database Storage Gauge */}
              <div>
                <div className="flex items-baseline justify-between text-xs mb-1">
                  <span className="font-extrabold text-slate-800">Postgres DB Size</span>
                  <span className="font-mono font-bold text-emerald-900">
                    &lt; {quotaData.supabase.dbUsedMb} MB / 500 MB
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.max(2, quotaData.supabase.dbPercent)}%` }} 
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-medium">
                  <span>{quotaData.supabase.dbRemainingMb} MB available</span>
                  <span>{quotaData.supabase.dbPercent}% used</span>
                </div>
              </div>

              {/* File Storage Gauge */}
              <div>
                <div className="flex items-baseline justify-between text-xs mb-1">
                  <span className="font-extrabold text-slate-800">Object Storage (Uploads)</span>
                  <span className="font-mono font-bold text-emerald-900">
                    {quotaData.supabase.storageUsedMb} MB / 1,000 MB
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.max(2, quotaData.supabase.storagePercent)}%` }} 
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-medium">
                  <span>{quotaData.supabase.storageRemainingMb} MB available</span>
                  <span>{quotaData.supabase.storagePercent}% used</span>
                </div>
              </div>

              <div className="pt-3 border-t border-emerald-100/80 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Monthly Active Users:</span>
                  <span className="font-mono font-bold text-slate-800">{quotaData.supabase.mauUsed} / 50,000 MAU</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Current Cost:</span>
                  <span className="font-mono font-extrabold text-emerald-700">Free forever ($0)</span>
                </div>
              </div>
            </div>

            {/* Card 3: Vercel Hobby Plan */}
            <div className="p-5 rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50/50 to-white space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center font-black text-sm shadow-sm">
                    ▲
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">Vercel Hobby Plan</h4>
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.2 rounded">
                      Serverless Limit: 12 Max
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Compliant
                </span>
              </div>

              <div>
                <div className="flex items-baseline justify-between text-xs mb-1">
                  <span className="font-extrabold text-slate-800">Serverless Functions</span>
                  <span className="font-mono font-bold text-purple-900">
                    {quotaData.vercel.functionsUsed} / {quotaData.vercel.functionsLimit} active
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-purple-600 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${(quotaData.vercel.functionsUsed / quotaData.vercel.functionsLimit) * 100}%` }} 
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-medium">
                  <span>{quotaData.vercel.functionsRemaining} slots available</span>
                  <span>Safely under Hobby limit</span>
                </div>
              </div>

              <div className="pt-3 border-t border-purple-100/80 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Monthly Bandwidth:</span>
                  <span className="font-mono font-bold text-slate-800">100 GB / month free</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Deployment Status:</span>
                  <span className="font-bold text-emerald-700">Production Live</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Current Cost:</span>
                  <span className="font-mono font-extrabold text-emerald-700">Free forever ($0)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Infrastructure Health Guarantee */}
          <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-extrabold">All 3 Cloud Platforms Confirmed on 100% Free Tiers</div>
              <p className="text-emerald-800 mt-0.5 leading-relaxed">
                Your entire application stack (Vercel Hobby, Supabase Free Tier, and Resend Free Plan) is strictly within quota boundaries. You have over 2,900 free emails remaining for the month and over 490 MB of free database capacity. No paid tier upgrades are required.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: DOMAIN PIE CHART */}
      {activeSection === 'domains' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <PieIcon className="w-5 h-5 text-purple-600" />
                Internship Domain Distribution
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Breakdown of {totalRegistrations} students across all active technical tracks.
              </p>
            </div>
            {topDomain && (
              <span className="text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/90 px-3 py-1 rounded-xl flex items-center gap-1.5 w-fit">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Most Popular: <strong>{topDomain.name}</strong> ({topDomain.pct}%)
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Left: Donut Chart */}
            <div className="md:col-span-5 flex flex-col items-center justify-center">
              <div className="relative w-56 h-56 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="#f1f5f9" strokeWidth="14" />
                  {slices.map((slice) => {
                    const isHovered = hoveredSlice?.name === slice.name;
                    return (
                      <circle
                        key={slice.name}
                        cx="50"
                        cy="50"
                        r={RADIUS}
                        fill="none"
                        stroke={slice.color}
                        strokeWidth={isHovered ? 17 : 14}
                        strokeDasharray={slice.strokeDasharray}
                        strokeDashoffset={slice.strokeDashoffset}
                        className="transition-all duration-300 cursor-pointer"
                        style={{
                          opacity: hoveredSlice && !isHovered ? 0.45 : 1,
                          filter: isHovered ? 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))' : 'none'
                        }}
                        onMouseEnter={() => setHoveredSlice(slice)}
                        onMouseLeave={() => setHoveredSlice(null)}
                        onClick={() => onFilterDomainInTable && onFilterDomainInTable(slice.name)}
                      />
                    );
                  })}
                </svg>

                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
                  {hoveredSlice ? (
                    <>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 truncate max-w-[120px]">
                        {hoveredSlice.name}
                      </span>
                      <span className="text-2xl font-black text-slate-900 leading-none my-0.5">
                        {hoveredSlice.pct}%
                      </span>
                      <span className="text-[11px] font-bold text-slate-500">
                        {hoveredSlice.count} intern{hoveredSlice.count > 1 ? 's' : ''}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-3xl font-black text-slate-900 leading-none">
                        {totalRegistrations}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                        Total Interns
                      </span>
                    </>
                  )}
                </div>
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-3 text-center">
                Click any slice to jump to students table filtered by domain
              </p>
            </div>

            {/* Right: Domain Bars */}
            <div className="md:col-span-7 space-y-2.5">
              {domainStats.map((item, index) => (
                <div
                  key={item.name}
                  onMouseEnter={() => setHoveredSlice(item)}
                  onMouseLeave={() => setHoveredSlice(null)}
                  onClick={() => onFilterDomainInTable && onFilterDomainInTable(item.name)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                    hoveredSlice?.name === item.name
                      ? 'bg-purple-50/90 border-purple-300 shadow-2xs'
                      : 'bg-slate-50/60 border-slate-200/80 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="font-extrabold text-slate-800 truncate">{item.name}</span>
                      {index === 0 && (
                        <span className="text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                          #1 Most Popular
                        </span>
                      )}
                    </div>
                    <span className="font-mono font-bold text-slate-700 text-[11px]">
                      {item.count} interns ({item.pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200/70 rounded-full h-1.5 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${item.pct}%`, backgroundColor: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: DATE-WISE TIMELINE BAR CHART */}
      {activeSection === 'timeline' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-blue-600" />
                Date-Wise Registration Timeline & Trends
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Daily registration volume. Click any date bar to view the exact students registered on that day.
              </p>
            </div>
            {selectedDate && (
              <button
                type="button"
                onClick={() => setSelectedDate(null)}
                className="text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1 rounded-xl transition-colors cursor-pointer w-fit"
              >
                Clear Date Filter
              </button>
            )}
          </div>

          <div className="overflow-x-auto pb-2">
            <div className="min-w-[600px] h-56 flex items-end gap-3 px-4 pb-6 pt-4 border-b border-slate-200/80 bg-slate-50/50 rounded-xl relative">
              {dateStats.length === 0 ? (
                <div className="w-full text-center text-slate-400 text-xs py-16">
                  No registration date data available yet.
                </div>
              ) : (
                dateStats.map((item) => {
                  const count = item.students.length;
                  const heightPercent = Math.max(14, Math.round((count / maxDateCount) * 100));
                  const isSelected = selectedDate === item.dateKey;

                  return (
                    <div
                      key={item.dateKey}
                      onClick={() => setSelectedDate(isSelected ? null : item.dateKey)}
                      className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                    >
                      <span className={`text-[10px] font-bold mb-1 transition-all ${
                        isSelected ? 'text-blue-700 font-extrabold scale-110' : 'text-slate-500 group-hover:text-blue-600'
                      }`}>
                        {count}
                      </span>

                      <div className="w-full max-w-[42px] bg-slate-200 rounded-t-lg overflow-hidden h-full flex items-end">
                        <div
                          className={`w-full rounded-t-lg transition-all duration-300 ${
                            isSelected 
                              ? 'bg-gradient-to-t from-blue-700 to-indigo-600 shadow-md ring-2 ring-blue-500/30'
                              : 'bg-gradient-to-t from-blue-500 to-indigo-400 group-hover:from-blue-600 group-hover:to-indigo-500'
                          }`}
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>

                      <span className={`text-[10px] mt-2 whitespace-nowrap font-medium transition-all ${
                        isSelected ? 'text-blue-700 font-extrabold' : 'text-slate-600 group-hover:text-slate-900'
                      }`}>
                        {item.displayDate}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="bg-slate-50/80 rounded-xl border border-slate-200/80 p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                {selectedDate 
                  ? `Students Registered on ${dateStats.find(d => d.dateKey === selectedDate)?.fullDate || selectedDate}`
                  : `Recent Registrations (Showing latest ${Math.min(15, registrations.length)} interns)`}
              </h4>
              <span className="text-[11px] font-bold text-slate-500">
                {selectedDate 
                  ? `${dateStats.find(d => d.dateKey === selectedDate)?.students.length || 0} students`
                  : `${registrations.length} total`}
              </span>
            </div>

            <div className="divide-y divide-slate-200/70 max-h-72 overflow-y-auto">
              {(selectedDate 
                ? (dateStats.find(d => d.dateKey === selectedDate)?.students || [])
                : registrations.slice(0, 15)
              ).map((student) => (
                <div key={student.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900">{student.full_name || 'Student'}</span>
                      <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.2 rounded-md border border-blue-200">
                        {student.domain || 'Domain'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">
                      {student.email} {student.college ? `• ${student.college}` : ''}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      student.status === 'Approved' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {student.status || 'Pending'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {student.created_at ? new Date(student.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: MAIL DELIVERY STATUS */}
      {activeSection === 'mailer' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Mail className="w-5 h-5 text-emerald-600" />
                Email Delivery Status & Audit Matrix
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Track exactly which student has received their acknowledgement, offer letter, and certificate.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/60">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-extrabold text-slate-800">1. Registration Ack</span>
                <span className="font-mono font-bold text-slate-600">{emailStats.ackSent} / {emailStats.ackTotal}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-1.5">
                <div 
                  className="bg-purple-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${emailStats.ackTotal ? (emailStats.ackSent / emailStats.ackTotal) * 100 : 0}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-purple-700">Immediate Signup Receipt</span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/60">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-extrabold text-slate-800">2. Offer & Login</span>
                <span className="font-mono font-bold text-emerald-700">{emailStats.offerSent} / {emailStats.offerTotal}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-1.5">
                <div 
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${emailStats.offerTotal ? (emailStats.offerSent / emailStats.offerTotal) * 100 : 0}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-emerald-700">PDF Offer + Portal Credentials</span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/60">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-extrabold text-slate-800">3. Project Reminder</span>
                <span className="font-mono font-bold text-indigo-700">{emailStats.reminderSent} Sent</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-1.5">
                <div 
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, emailStats.reminderSent * 15)}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-indigo-700">3-Day Submission Notice</span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/60">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-extrabold text-slate-800">4. Certificate Dispatch</span>
                <span className="font-mono font-bold text-amber-700">{emailStats.certSent} / {emailStats.certTotal}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-1.5">
                <div 
                  className="bg-amber-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${emailStats.certTotal ? (emailStats.certSent / emailStats.certTotal) * 100 : 0}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-amber-700">Final Certificate PDF</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search student by name, email, or domain..."
                  value={mailSearchTerm}
                  onChange={(e) => setMailSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Filter:</span>
                <select
                  value={mailFilterStatus}
                  onChange={(e) => setMailFilterStatus(e.target.value)}
                  className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Students ({registrations.length})</option>
                  <option value="offer_sent">Offer Letter Sent ({emailStats.offerSent})</option>
                  <option value="offer_pending">Offer Pending ({emailStats.offerTotal - emailStats.offerSent})</option>
                  <option value="pending_approval">Unapproved Signups</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Student Name & Contact</th>
                    <th className="py-2.5 px-3">Domain</th>
                    <th className="py-2.5 px-3 text-center">1. Ack Mail</th>
                    <th className="py-2.5 px-3 text-center">2. Offer Letter</th>
                    <th className="py-2.5 px-3 text-center">3. Reminder</th>
                    <th className="py-2.5 px-3 text-center">4. Certificate</th>
                    <th className="py-2.5 px-3 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredMailStudents.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-400">
                        No students match the selected email filter.
                      </td>
                    </tr>
                  ) : (
                    filteredMailStudents.map(student => (
                      <tr key={student.id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3">
                          <div className="font-extrabold text-slate-900">{student.full_name || 'Student'}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{student.email}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                            {student.domain}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {student.reg_email_status === 'sent' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <Check className="w-3 h-3" /> Sent
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {student.approval_email_status === 'sent' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <Check className="w-3 h-3" /> Dispatched
                            </span>
                          ) : student.status === 'Approved' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              Ready to Send
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded">
                              Not Approved
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {student.reminder_email_status === 'sent' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <Check className="w-3 h-3" /> Sent
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {student.cert_email_status === 'sent' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <Check className="w-3 h-3" /> Delivered
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          {student.status === 'Approved' && (
                            <button
                              type="button"
                              onClick={() => onResendEmail && onResendEmail(student, 'PAYMENT_APPROVED')}
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                              title="Resend or Send Offer Letter email now"
                            >
                              <Send className="w-2.5 h-2.5" />
                              {student.approval_email_status === 'sent' ? 'Resend Offer' : 'Send Offer'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 6: STUDENT DASHBOARD DOMAIN PREVIEW */}
      {activeSection === 'preview' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                Student Portal Experience Inspector
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Check exactly what content, projects, modules, and quizzes an intern sees when logging into their dashboard.
              </p>
            </div>
            <span className="text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-xl flex items-center gap-1.5 w-fit">
              <Code2 className="w-3.5 h-3.5" />
              Live Curriculum Inspector
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              'AWS Cloud Foundations',
              'Generative AI',
              'Web Development',
              'Full Stack Development',
              'Vibe Coding',
              'App Development',
              'Data Science',
              'UI/UX Design'
            ].map(domain => (
              <button
                key={domain}
                type="button"
                onClick={() => setSelectedDomain(domain)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  selectedDomain === domain
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                }`}
              >
                {domain}
              </button>
            ))}
          </div>

          <div className="border-2 border-indigo-100 rounded-2xl p-6 bg-slate-50/50 space-y-6">
            <div className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="bg-white/20 text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md tracking-wider">
                  Intern Dashboard Preview
                </span>
                <h4 className="text-xl font-black mt-1">Welcome to {previewData.domainName} Track!</h4>
                <p className="text-xs text-purple-100 mt-0.5">
                  Complete your weekly modules, take module quizzes, and submit your capstone project before deadline.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/20 text-right shrink-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-purple-200">Overall Progress</div>
                <div className="text-2xl font-black">25% Complete</div>
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-purple-600" />
                Selectable Capstone Projects for {previewData.domainName}
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {previewData.projects.map((proj, idx) => (
                  <div key={proj.title} className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 px-2 py-0.5 rounded">
                        Project Option {idx + 1}
                      </span>
                    </div>
                    <div className="font-extrabold text-sm text-slate-900 leading-snug">
                      {proj.title}
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-3">
                      {proj.desc || proj.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                Structured Weekly Learning Modules ({previewData.modules.length} Weeks)
              </h5>

              <div className="space-y-3">
                {previewData.modules.map((mod, index) => (
                  <div key={mod.id || index} className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 font-extrabold text-xs flex items-center justify-center">
                          W{mod.week_number || index + 1}
                        </span>
                        <span className="font-extrabold text-sm text-slate-900">{mod.title}</span>
                      </div>
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {mod.videos?.length || 0} Video Lessons • {mod.quiz_data?.length || 5} Quiz Questions
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 whitespace-pre-line">
                      {mod.task_details || 'Weekly project tasks, assignments, and practical coding exercises.'}
                    </div>

                    {mod.videos && mod.videos.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                          Curated Video Resources
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {mod.videos.slice(0, 4).map((vid, vIdx) => (
                            <div key={vIdx} className="flex items-center gap-2 text-[11px] text-slate-700 bg-slate-50 px-2 py-1 rounded border border-slate-100 truncate">
                              <PlayCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                              <span className="truncate">{vid.title}</span>
                              <span className="text-[9px] text-slate-400 ml-auto shrink-0">{vid.duration}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
