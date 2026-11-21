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
  AlertCircle 
} from 'lucide-react';
import { GEN_AI_MODULES } from '../data/genAiModules';
import { FULL_STACK_MODULES } from '../data/fullStackModules';

// Fallback modules for Vibe Coding
const VIBE_CODING_MODULES = [
  {
    week_number: 1,
    title: 'Foundations of Vibe Coding & AI Pair Programming',
    task_details: 'Build a Personal Portfolio Website and a To-Do List App using natural language prompts with Cursor / Copilot.',
    videos: [
      { title: "The Ultimate Beginner's Guide to Vibe Coding", duration: '12:00' },
      { title: 'Learn to Vibe Code in 10 Minutes', duration: '10:00' }
    ],
    quiz_sample: 'What is Vibe Coding? Describing what you want in natural language and letting AI generate the code.'
  },
  {
    week_number: 2,
    title: 'Core Tool Mastery (Cursor + Prompt Engineering)',
    task_details: 'Build interactive tools: Live Weather Dashboard & Expense Tracker using modern component libraries.',
    videos: [
      { title: 'Cursor Vibe Coding Tutorial for Beginners', duration: '15:30' }
    ],
    quiz_sample: 'What is the role of local storage in client-side applications?'
  },
  {
    week_number: 3,
    title: 'Full Stack Integration & API Pipelines',
    task_details: 'Connect AI APIs (OpenAI / Gemini) to your front-end web application.',
    videos: [
      { title: 'Connecting AI APIs to Web Apps', duration: '18:40' }
    ],
    quiz_sample: 'How do you securely handle API keys in frontend builds?'
  },
  {
    week_number: 4,
    title: 'Capstone Deployment & Production Polish',
    task_details: 'Deploy your complete AI-assisted project on Vercel or Netlify with custom domain routing.',
    videos: [
      { title: 'Deploying Production Apps with Git and Vercel', duration: '20:00' }
    ],
    quiz_sample: 'What is the final step before submitting an internship project?'
  }
];

const DOMAIN_PROJECTS = {
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
  const [activeSection, setActiveSection] = useState('domains'); // 'domains', 'timeline', 'mailer', 'preview'
  const [selectedDomain, setSelectedDomain] = useState('Generative AI');
  const [hoveredSlice, setHoveredSlice] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [mailSearchTerm, setMailSearchTerm] = useState('');
  const [mailFilterStatus, setMailFilterStatus] = useState('all'); // 'all', 'offer_sent', 'offer_pending'

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

    // Sort ascending by date for chronological timeline
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

    return {
      ackSent,
      ackTotal: total,
      offerSent,
      offerTotal: approvedTotal,
      reminderSent,
      certSent,
      certTotal: certificates.length
    };
  }, [registrations, certificates]);

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

  // 4. Domain Preview Data
  const previewData = useMemo(() => {
    const domainKey = selectedDomain;
    let modules = [];
    if (domainKey.includes('Gen') || domainKey.includes('AI')) {
      modules = GEN_AI_MODULES;
    } else if (domainKey.includes('Full') || domainKey.includes('Web') || domainKey.includes('Python')) {
      modules = FULL_STACK_MODULES;
    } else if (domainKey.includes('Vibe')) {
      modules = VIBE_CODING_MODULES;
    } else {
      modules = GEN_AI_MODULES; // Default fallback with real rich content
    }

    const projects = DOMAIN_PROJECTS[domainKey] || DOMAIN_PROJECTS['Web Development'];

    return {
      domainName: domainKey,
      modules,
      projects
    };
  }, [selectedDomain]);

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
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-extrabold text-[11px] uppercase tracking-wider">Total Interns</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">{totalRegistrations}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Across all registered domains</div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-extrabold text-[11px] uppercase tracking-wider">Approved & Verified</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-600 mt-2">
            {registrations.filter(r => r.status === 'Approved').length}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Active offer letters dispatched</div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-extrabold text-[11px] uppercase tracking-wider">Offer Mails Sent</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-indigo-600 mt-2">
            {emailStats.offerSent}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            {emailStats.offerTotal > 0 ? `${Math.round((emailStats.offerSent / emailStats.offerTotal) * 100)}% delivery to approved` : 'All caught up'}
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-xs">
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
              ? 'bg-white text-purple-700 shadow-sm border border-slate-200/60'
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
              ? 'bg-white text-purple-700 shadow-sm border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Mail className="w-3.5 h-3.5 text-emerald-600" />
          <span>Mail Delivery Status</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('preview')}
          className={`py-2 px-4 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
            activeSection === 'preview'
              ? 'bg-white text-purple-700 shadow-sm border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
          <span>Student Portal Preview</span>
        </button>
      </div>

      {/* SECTION 1: Domain Pie Chart & Breakdown */}
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

      {/* SECTION 2: Date-wise Registration Bar Chart ("date wise intern yaru register panathu") */}
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

          {/* Interactive Bar Chart */}
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
                      {/* Count label above bar */}
                      <span className={`text-[10px] font-bold mb-1 transition-all ${
                        isSelected ? 'text-blue-700 font-extrabold scale-110' : 'text-slate-500 group-hover:text-blue-600'
                      }`}>
                        {count}
                      </span>

                      {/* Bar Pillar */}
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

                      {/* Date label under bar */}
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

          {/* Student List for Selected Date or Recent Activity */}
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

      {/* SECTION 3: Mail Delivery Status Graph ("yarukula mail poiruku") */}
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

          {/* 4-Stage Email Progress Delivery Bars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Stage 1 */}
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

            {/* Stage 2 */}
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

            {/* Stage 3 */}
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

            {/* Stage 4 */}
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

          {/* Student Email Audit Table */}
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
                        {/* 1. Ack Mail */}
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
                        {/* 2. Offer Mail */}
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
                        {/* 3. Reminder */}
                        <td className="py-2.5 px-3 text-center">
                          {student.reminder_email_status === 'sent' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <Check className="w-3 h-3" /> Sent
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">—</span>
                          )}
                        </td>
                        {/* 4. Certificate */}
                        <td className="py-2.5 px-3 text-center">
                          {student.cert_email_status === 'sent' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <Check className="w-3 h-3" /> Delivered
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">—</span>
                          )}
                        </td>
                        {/* Action */}
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

      {/* SECTION 4: Student Dashboard Domain Preview ("intha domain login pana ena varum") */}
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

          {/* Domain Selection Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
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

          {/* Student Portal Simulated Canvas */}
          <div className="border-2 border-indigo-100 rounded-2xl p-6 bg-slate-50/50 space-y-6">
            {/* Mock Header seen by Student */}
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

            {/* Part A: Real Capstone Projects available for this domain */}
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

            {/* Part B: Weekly Modules, Tasks, Videos & Quizzes */}
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

                    {/* Task goal */}
                    <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 whitespace-pre-line">
                      {mod.task_details || 'Weekly project tasks, assignments, and practical coding exercises.'}
                    </div>

                    {/* Video lessons preview */}
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
