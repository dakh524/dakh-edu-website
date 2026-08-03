import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { LogOut, BookOpen, CheckCircle, FileText, Award, PlayCircle, Download, Link as LinkIcon, CheckCircle2, ChevronRight, UserCircle, Lock, MonitorPlay, Code2, ArrowRight, HelpCircle, MessageSquare, TrendingUp, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GEN_AI_MODULES } from '../data/genAiModules';
import { FULL_STACK_MODULES } from '../data/fullStackModules';
const DOMAIN_PROJECTS = {
  'Full Stack Development': [
    { id: 'fs_1', title: 'Photography Portfolio & Booking Website', description: 'Build a professional website for a photography business where clients can explore portfolios and book photography sessions.' },
    { id: 'fs_2', title: 'E-Commerce Website', description: 'Develop a full-stack online shopping platform for browsing and purchasing products.' },
    { id: 'fs_3', title: 'Barber Shop Management System', description: 'Create an online appointment and management system for a barber shop.' }
  ],
  'Web Development': [
    { id: 'wd_1', title: 'E-Commerce Platform', description: 'Build a full-stack e-commerce app with cart, user authentication, checkout, and payment gateway integration.' },
    { id: 'wd_2', title: 'Social Media Dashboard', description: 'Create a responsive dashboard with real-time analytics, dynamic charts, and user management.' },
    { id: 'wd_3', title: 'Task Management System', description: 'Develop a Kanban-style task tracker with drag-and-drop functionality and team collaboration features.' },
  ],
  'App Development': [
    { id: 'ad_1', title: 'Fitness Tracker App', description: 'Build a mobile app to track workouts, diet plans, and daily steps using local storage.' },
    { id: 'ad_2', title: 'Food Delivery App', description: 'Create a cross-platform app for ordering food with real-time tracking and push notifications.' },
  ],
  'Data Science': [
    { id: 'ds_1', title: 'Sales Prediction Model', description: 'Build an ML model to forecast future sales based on historical retail data.' },
    { id: 'ds_2', title: 'Customer Segmentation', description: 'Use clustering algorithms to group customers based on purchasing behavior.' }
  ],
  'UI/UX Design': [
    { id: 'ui_1', title: 'Fintech App Redesign', description: 'Complete UX research and UI redesign for a modern banking application.' },
    { id: 'ui_2', title: 'Travel Booking Portal', description: 'Design a seamless web and mobile experience for booking flights and hotels.' }
  ],
  'Vibe Coding': [
    { id: 'vc_1', title: 'Quiz & Chatbot Platform', description: 'A combination of a Trivia App and a Chatbot UI clone built entirely using AI code generation.' },
    { id: 'vc_2', title: 'Weather & Expense Dashboard', description: 'A complex dashboard that fetches live weather data and tracks expenses, built iteratively with Cursor.' },
    { id: 'vc_3', title: 'Custom Vibe App', description: 'Intern\'s choice — a combination of any 2 earlier features built and deployed end-to-end.' }
  ],
  'Default': [
    { id: 'def_1', title: 'Capstone Project 1', description: 'A comprehensive project covering all core concepts of your domain.' },
    { id: 'def_2', title: 'Capstone Project 2', description: 'An advanced real-world implementation specific to your field.' },
    { id: 'def_3', title: 'Research & Implementation', description: 'Research a modern problem and build a working solution.' },
  ]
};

const VIBE_CODING_MODULES = [
  {
    id: 'vc_mod_1',
    week_number: 1,
    title: 'Foundations of Vibe Coding',
    task_details: 'Goal: Understand what vibe coding is, the main tools, and build your first tiny project.\n\nProject 1: Personal Portfolio Website — a one-page site with bio, skills, and links.\nProject 2: To-Do List App — add/delete/mark-complete tasks, saved with local storage.',
    videos: [
      { title: "The Ultimate Beginner's Guide to Vibe Coding", url: 'https://www.youtube.com/watch?v=-VuZmoc-Sq8', duration: '12:00' },
      { title: 'Learn to Vibe Code in 10 Minutes', url: 'https://www.youtube.com/watch?v=-LFB8D9WV-g', duration: '10:00' },
      { title: 'Vibe Coding Full Course for Beginners', url: 'https://www.youtube.com/watch?v=RKOXmCK4Khw', duration: '45:00' },
      { title: 'Build Your First App with Cursor AI', url: 'https://www.youtube.com/watch?v=RKOXmCK4Khw', duration: '20:00' }
    ],
    quiz_data: [
      {
        question: 'What is "vibe coding"?',
        options: ['Writing code manually without any tools', 'Describing what you want in natural language and letting an AI generate the code', 'Coding only late at night for better focus', 'A design pattern for CSS animations'],
        correct_option: 1,
        answer: 'Describing what you want in natural language and letting an AI generate the code'
      },
      {
        question: 'In the beginner tutorials, what is the typical first step in vibe coding a project?',
        options: ['Writing unit tests', 'Describing the app idea in plain language to the AI tool', 'Buying a domain name', 'Setting up a Kubernetes cluster'],
        correct_option: 1,
        answer: 'Describing the app idea in plain language to the AI tool'
      },
      {
        question: 'Which of these is a good first project for a beginner vibe coder?',
        options: ['A distributed database engine', 'A personal portfolio website or a simple to-do list app', 'An operating system kernel', 'A compiler for a new programming language'],
        correct_option: 1,
        answer: 'A personal portfolio website or a simple to-do list app'
      },
      {
        question: 'What is a practical benefit of vibe coding for non-programmers?',
        options: ['It replaces the need to ever test an app', 'It lets people build apps by describing ideas without learning syntax first', 'It guarantees zero bugs', 'It removes the need for any design decisions'],
        correct_option: 1,
        answer: 'It lets people build apps by describing ideas without learning syntax first'
      },
      {
        question: 'What does "local storage" let a simple to-do app do?',
        options: ['Send emails automatically', 'Save tasks in the browser so they persist between visits', 'Connect to a bank account', 'Compile the app into an .exe file'],
        correct_option: 1,
        answer: 'Save tasks in the browser so they persist between visits'
      }
    ]
  },
  {
    id: 'vc_mod_2',
    week_number: 2,
    title: 'Core Tool Mastery (Cursor + Prompting)',
    task_details: 'Goal: Get hands-on with an AI code editor (Cursor), learn to write good prompts, and build small utility apps.\n\nProject 3: Quote Generator\nProject 4: BMI or Unit Converter\nProject 5: Weather Dashboard',
    videos: [
      { title: 'Cursor Vibe Coding Tutorial — For COMPLETE Beginners', url: 'https://www.youtube.com/watch?v=8AWEPx5cHWQ', duration: '15:30' },
      { title: 'Complete Guide to Cursor For Non-Coders (Vibe Coding 101)', url: 'https://www.youtube.com/watch?v=faezjTHA5SU', duration: '22:15' },
      { title: 'Vibe Coding Complete Tutorial and Tips — Cursor / Windsurf', url: 'https://www.youtube.com/watch?v=v7UcVPO4y3c', duration: '18:40' }
    ],
    quiz_data: [
      {
        question: 'Which of these is an AI-powered code editor commonly used for vibe coding?',
        options: ['Notepad', 'Cursor', 'Microsoft Paint', 'Excel'],
        correct_option: 1,
        answer: 'Cursor'
      },
      {
        question: 'What is "agent mode" in a tool like Cursor generally used for?',
        options: ['Formatting fonts in a Word document', 'Letting the AI make multi-step changes across a project on its own', 'Sending automatic emails to clients', 'Compressing image files'],
        correct_option: 1,
        answer: 'Letting the AI make multi-step changes across a project on its own'
      },
      {
        question: 'Why is it still useful to review AI-generated code, even in vibe coding?',
        options: ['It\'s not useful; AI code is always perfect', 'To catch errors, security issues, or unwanted behavior', 'Only for legal reasons', 'To slow down development on purpose'],
        correct_option: 1,
        answer: 'To catch errors, security issues, or unwanted behavior'
      },
      {
        question: 'What does "iterating" mean in the vibe coding workflow?',
        options: ['Deleting the whole project and starting over each time', 'Giving the AI feedback and refining the app step by step until it works', 'Copy-pasting the same prompt repeatedly without changes', 'Switching programming languages every hour'],
        correct_option: 1,
        answer: 'Giving the AI feedback and refining the app step by step until it works'
      },
      {
        question: 'When building a weather dashboard, what does the app typically need to fetch live data?',
        options: ['A printed weather almanac', 'A free weather API', 'A local thermometer plugged into the computer', 'A fax machine'],
        correct_option: 1,
        answer: 'A free weather API'
      }
    ]
  },
  {
    id: 'vc_mod_3',
    week_number: 3,
    title: 'Building Full Apps with Data & APIs',
    task_details: 'Goal: Combine multiple features (forms, APIs, data persistence) into a more complete app, and learn to deploy it.\n\nProject 6: Recipe Finder\nProject 7: Expense Tracker\nProject 8: Landing Page',
    videos: [
      { title: 'Vibe Coding Crash Course: Build Real Apps', url: 'https://www.youtube.com/watch?v=HQaVFUV2AgY', duration: '25:00' },
      { title: 'Vibe Coding for Beginners (Full Course 2026)', url: 'https://www.youtube.com/watch?v=BpOsHF5Oj_I', duration: '35:20' },
      { title: 'The Ultimate Vibe Coding Guide (2026 Full Course Tutorial)', url: 'https://www.youtube.com/watch?v=KO_vCL1ZhpI', duration: '28:10' }
    ],
    quiz_data: [
      {
        question: 'What is a common free hosting option mentioned for deploying vibe-coded web apps?',
        options: ['Vercel or Netlify', 'A physical server in your home only', 'A fax machine', 'A printed manual'],
        correct_option: 0,
        answer: 'Vercel or Netlify'
      },
      {
        question: 'In the "habit tracker in 2 hours" style build, what made the project non-trivial compared to a toy demo?',
        options: ['It had zero features', 'It included user authentication and data that persists across sessions', 'It was written entirely without any AI help', 'It ran only offline with no interface'],
        correct_option: 1,
        answer: 'It included user authentication and data that persists across sessions'
      },
      {
        question: 'What is one common limitation of vibe coding mentioned across these tutorials?',
        options: ['It only works for mobile apps', 'AI tools can make mistakes so basic review is still needed', 'It cannot build any web pages', 'It requires no internet connection ever'],
        correct_option: 1,
        answer: 'AI tools can make mistakes so basic review is still needed'
      },
      {
        question: 'Why might a developer combine tools, e.g., prototype UI in one tool and refine it in another?',
        options: ['To make the workflow slower on purpose', 'Different tools have different strengths (prototyping vs precise control)', 'Because a single tool can never run any code', 'It is required by law'],
        correct_option: 1,
        answer: 'Different tools have different strengths (prototyping vs precise control)'
      },
      {
        question: 'What does an expense tracker app typically need to calculate a running total by category?',
        options: ['A way to group and sum entries by their assigned category', 'A weather API', 'A video streaming service', 'A random quote generator'],
        correct_option: 0,
        answer: 'A way to group and sum entries by their assigned category'
      }
    ]
  },
  {
    id: 'vc_mod_4',
    week_number: 4,
    title: 'Advanced Projects & Capstone',
    task_details: 'Goal: Build more complex, multi-feature apps, and finish with a capstone project demoed to the team.\n\nProject 9: Quiz/Trivia App\nProject 10: Chatbot UI Clone\nCapstone: Intern\'s choice — a combination of any 2 earlier features.',
    videos: [
      { title: 'Vibe Coding Tutorial with Firebase, Flutter, Cursor, Android/iOS', url: 'https://www.youtube.com/watch?v=_3ENhfe_gLk', duration: '40:15' },
      { title: 'Vibe Coding Course (for Beginners) — Full Playlist', url: 'https://www.youtube.com/watch?v=_3ENhfe_gLk', duration: '55:00' }
    ],
    quiz_data: [
      {
        question: 'What does "deploying professionally using GitHub and Vercel" allow you to do?',
        options: ['Store code privately and never share it', 'Version-control your code and publish the live app for others to use', 'Only run the app on your own laptop forever', 'Print the code on paper'],
        correct_option: 1,
        answer: 'Version-control your code and publish the live app for others to use'
      },
      {
        question: 'Building an app for both web and mobile (e.g., using Flutter) mainly helps because:',
        options: ['It lets one codebase reach multiple platforms', 'It removes the need for any testing', 'It only works for websites, never apps', 'It disables AI assistance'],
        correct_option: 0,
        answer: 'It lets one codebase reach multiple platforms'
      },
      {
        question: 'In a capstone project combining two earlier features, what is the main skill being tested?',
        options: ['Memorizing syntax', 'Integrating multiple features into one cohesive, working app', 'Only copying one single tutorial exactly', 'Avoiding the use of any AI tools'],
        correct_option: 1,
        answer: 'Integrating multiple features into one cohesive, working app'
      },
      {
        question: 'What is a good practice when demoing a capstone project to the team?',
        options: ['Show only the final result with no explanation', 'Explain what prompts were used and what changed after each iteration', 'Hide any bugs that were found during testing', 'Avoid mentioning which tools were used'],
        correct_option: 1,
        answer: 'Explain what prompts were used and what changed after each iteration'
      },
      {
        question: 'Why is a quiz/trivia app a good project to practice logic (not just UI)?',
        options: ['It requires tracking correct answers and a running score (state logic)', 'It has no logic at all, only styling', 'It can only be built without any AI tools', 'It requires a physical server room'],
        correct_option: 0,
        answer: 'It requires tracking correct answers and a running score (state logic)'
      }
    ]
  }
];

const DUMMY_MODULES = [
  {
    id: 'dummy_1',
    week_number: 1,
    title: 'Introduction to Core Concepts',
    task_details: 'Watch all 4 video lessons carefully and answer the module assessment below.',
    videos: [
      { title: 'Welcome and Setup', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '10:05' },
      { title: 'Fundamental Principles', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '15:20' },
      { title: 'Best Practices', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '08:45' },
      { title: 'Summary & Next Steps', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '05:30' }
    ],
    quiz_data: [
      { 
        question: 'What is the most important principle discussed in part 2?', 
        options: ['Always maintain clean and readable code structure.', 'Write code as fast as possible.', 'Use the maximum number of libraries.', 'Ignore error handling for prototypes.'],
        correct_option: 0,
        answer: 'Always maintain clean and readable code structure.'
      },
      { 
        question: 'Which tool was recommended for setting up the environment?', 
        options: ['A custom python script.', 'The official CLI tool with default parameters.', 'Third-party boilerplate from GitHub.', 'Manual installation of all packages.'],
        correct_option: 1,
        answer: 'The official CLI tool with default parameters.' 
      },
      { 
        question: 'Explain the difference between approach A and B.', 
        options: ['Approach A is faster to write, B is faster to run.', 'Approach A is synchronous while B is asynchronous and non-blocking.', 'Approach A requires more memory, B requires more CPU.', 'There is no difference in modern environments.'],
        correct_option: 1,
        answer: 'Approach A is synchronous while B is asynchronous and non-blocking.' 
      }
    ]
  },
  {
    id: 'dummy_2',
    week_number: 2,
    title: 'Advanced Implementation Techniques',
    task_details: 'Build a small prototype using the techniques discussed in these videos.',
    videos: [
      { title: 'Deep Dive into Architecture', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '20:15' },
      { title: 'Optimizing Performance', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '12:10' }
    ],
    quiz_data: [
      { 
        question: 'What is the first step in optimizing performance?', 
        options: ['Rewriting the backend in Rust.', 'Increasing server capacity.', 'Identifying bottlenecks using profiling tools.', 'Minifying all JavaScript.'],
        correct_option: 2,
        answer: 'Identifying bottlenecks using profiling tools.' 
      }
    ]
  }
];

const StudentDashboard = () => {
  const [student, setStudent] = useState(null);
  const [modules, setModules] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  
  const [studentAnswers, setStudentAnswers] = useState({});
  const [showAnswers, setShowAnswers] = useState({});
  const [activeTabs, setActiveTabs] = useState({});
  const [activeVideo, setActiveVideo] = useState({});
  
  const [selectedProjectTemp, setSelectedProjectTemp] = useState(null);
  const [savingProject, setSavingProject] = useState(false);
  const [showBenefitsModal, setShowBenefitsModal] = useState(false);
  const [showResourcesModal, setShowResourcesModal] = useState(false);
  const [showDesktopWarning, setShowDesktopWarning] = useState(false);
  
  const [projectLink, setProjectLink] = useState('');
  const [githubRepo, setGithubRepo] = useState('');
  const [feedback, setFeedback] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/student/login');
          return;
        }

        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('*, registrations(plan_name)')
          .eq('auth_id', session.user.id)
          .single();

        if (studentError || !studentData) {
          await supabase.auth.signOut();
          navigate('/student/login');
          return;
        } 
        
        if (studentData.end_date && new Date() > new Date(studentData.end_date)) {
          await supabase.auth.signOut();
          alert("Your internship access has automatically expired. Please contact DAKH Edu Solutions.");
          navigate('/student/login');
          return;
        }
        
        if (!sessionStorage.getItem('desktopWarningShown')) {
          setShowDesktopWarning(true);
          sessionStorage.setItem('desktopWarningShown', 'true');
        }
        
        setStudent(studentData);

        let currentDomain = studentData.domain;
        let currentStudentId = studentData.id;

        if (currentStudentId) {
          const { data: dbModules } = await supabase
            .from('lms_modules')
            .select('*')
            .eq('domain', currentDomain)
            .order('week_number', { ascending: true });

          const savedProgress = localStorage.getItem(`progress_${currentStudentId}`);
          setProgress(savedProgress ? JSON.parse(savedProgress) : []);
          
          if (!dbModules || dbModules.length === 0) {
            if (currentDomain && currentDomain.toLowerCase().includes('vibe coding')) {
              setModules(VIBE_CODING_MODULES);
            } else if (currentDomain && currentDomain.toLowerCase().includes('gen')) {
              setModules(GEN_AI_MODULES);
            } else if (currentDomain && (currentDomain.toLowerCase().includes('full stack') || currentDomain.toLowerCase().includes('web development'))) {
              setModules(FULL_STACK_MODULES);
            } else {
              setModules(DUMMY_MODULES);
            }
          } else {
            setModules(dbModules);
          }
        } else {
           setModules([]);
           setProgress([]);
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/student/login');
  };

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    if (!projectLink || !githubRepo) {
      alert("Please provide both Project Link and GitHub Repo before submitting.");
      return;
    }
    const subject = `Final Project Submission - ${student?.full_name} (${student?.intern_number})`;
    const body = `Intern Name: ${student?.full_name}\nIntern Number: ${student?.intern_number}\nDomain: ${student?.domain}\n\nProject Link: ${projectLink}\nGitHub Repository: ${githubRepo}\n\nFeedback/Experience:\n${feedback}`;
    window.location.href = `mailto:dakhedusolution@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleMarkCompleted = async (module) => {
    if (module.quiz_data && module.quiz_data.length > 0) {
      let correct = 0;
      module.quiz_data.forEach((q, idx) => {
        if (studentAnswers[module.id]?.[idx] === q.correct_option) {
          correct++;
        }
      });
      const score = (correct / module.quiz_data.length) * 100;
      if (score < 50) {
        alert("You scored " + Math.round(score) + "%. You must score at least 50% to complete this module. Please review the material and try again!");
        return;
      }
    }

    if (!student || !student.id) return;
    setCompleting(true);
    
    setTimeout(() => {
      const newProgress = [...progress, { module_id: module.id, is_completed: true }];
      setProgress(newProgress);
      localStorage.setItem(`progress_${student.id}`, JSON.stringify(newProgress));
      setCompleting(false);
    }, 500);
  };

  const handleSaveProject = async () => {
    if (!selectedProjectTemp) return;
    setSavingProject(true);
    try {
      const { error } = await supabase
        .from('students')
        .update({ selected_project: selectedProjectTemp.title })
        .eq('id', student.id);
      
      if (error) throw error;
      
      setStudent(prev => ({ ...prev, selected_project: selectedProjectTemp.title }));
    } catch (err) {
      alert("Error saving project: " + err.message);
    } finally {
      setSavingProject(false);
    }
  };

  const needsProjectSelection = student && !student.selected_project;
  
  // Find projects based on domain (handle case insensitivity)
  let domainKey = 'Default';
  if (student && student.domain) {
    const matchedDomain = Object.keys(DOMAIN_PROJECTS).find(k => k.toLowerCase() === student.domain.toLowerCase());
    if (matchedDomain) domainKey = matchedDomain;
  }
  const availableProjects = DOMAIN_PROJECTS[domainKey];

  const totalModules = modules.length;
  const completedCount = progress.filter(p => p.is_completed).length;
  const progressPercentage = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;

  let activeWeek = 1;
  for (let m of modules) {
    if (!progress.find(p => p.module_id === m.id && p.is_completed)) {
      activeWeek = m.week_number;
      break;
    }
  }

  const isFullyCompleted = totalModules > 0 && completedCount === totalModules;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-200 rounded-full border-t-slate-800 animate-spin"></div>
      </div>
    );
  }

  // --- PROJECT SELECTION SCREEN (Ultra-Premium SaaS) ---
  if (needsProjectSelection) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] pt-24 pb-20 px-4 md:px-8 flex flex-col justify-center items-center selection:bg-indigo-100 selection:text-indigo-900">
        <div className="max-w-5xl w-full">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-[2.75rem] font-extrabold text-[#111827] mb-4 tracking-tight leading-tight">
              Select Your Capstone Project
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
              Choose the real-world project you will build during this internship. This will be the foundation of your final certification.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableProjects.map((proj, idx) => (
              <div 
                key={proj.id}
                onClick={() => setSelectedProjectTemp(proj)}
                className={`cursor-pointer bg-white rounded-[1.25rem] p-8 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] border flex flex-col h-full group ${
                  selectedProjectTemp?.id === proj.id 
                    ? 'border-indigo-600 shadow-[0_8px_30px_rgba(79,70,229,0.12)] -translate-y-1 ring-1 ring-indigo-600' 
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:-translate-y-0.5'
                }`}
              >
                <div className="flex justify-between items-start mb-8">
                  <div className={`w-12 h-12 rounded-[0.85rem] flex items-center justify-center transition-all duration-300 ${
                    selectedProjectTemp?.id === proj.id 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'
                  }`}>
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-[1.15rem] font-bold mb-3 text-[#111827] tracking-tight">
                  {proj.title}
                </h3>
                <p className="text-slate-500 leading-relaxed text-sm flex-grow">
                  {proj.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center border-t border-slate-100 pt-10">
            <button 
              onClick={handleSaveProject}
              disabled={!selectedProjectTemp || savingProject}
              className="bg-[#111827] hover:bg-black disabled:bg-slate-100 disabled:text-slate-400 text-white px-8 py-3.5 rounded-xl text-sm font-semibold transition-all inline-flex items-center gap-2 active:scale-[0.98] shadow-sm hover:shadow-md disabled:shadow-none"
            >
              {savingProject ? 'Saving Project...' : 'Confirm Project Selection'}
              {!savingProject && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Helper to extract YouTube video ID
  const getYouTubeId = (url) => {
    if (!url) return null;
    let vid = url.split('v=')[1];
    if (vid) return vid.split('&')[0];
    vid = url.split('youtu.be/')[1];
    if (vid) return vid.split('?')[0];
    return null;
  };

  // --- MAIN DASHBOARD SCREEN (Ultra-Premium SaaS) ---
  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Ultra-Clean Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#111827] rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm">
             {student?.full_name?.charAt(0) || 'S'}
          </div>
          <div>
            <h2 className="font-semibold text-[#111827] text-sm leading-tight">Welcome, {student?.full_name?.split(' ')[0] || 'Student'}</h2>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5 tracking-wider uppercase">{student?.intern_number || 'DES/INT/2026/XXXX'}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 px-4 py-2 rounded-lg transition-colors text-sm font-medium hover:bg-slate-50 active:bg-slate-100"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </nav>

      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 mt-10 grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-8 relative z-10">
        
        {/* Left Column: Modules & Progress */}
        <div className="space-y-8">
          
          {/* Project Banner (Premium Dark Vercel Style) */}
          <div className="bg-[#0A0A0A] rounded-[1.5rem] p-8 md:p-10 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-10 border border-white/10 relative overflow-hidden">
            {/* Subtle Texture/Gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent opacity-60"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')]"></div>
            
            <div className="flex-1 relative z-10">
              <span className="inline-flex items-center gap-2 px-2.5 py-1 bg-white/5 text-white/70 rounded-md text-[10px] font-bold uppercase tracking-widest mb-5 border border-white/10 backdrop-blur-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                Active Capstone
              </span>
              <h2 className="text-3xl md:text-[2.5rem] font-extrabold text-white tracking-tight leading-tight mb-4">
                {student?.selected_project || 'Not Selected'}
              </h2>
              <p className="text-slate-400 font-medium text-[15px] max-w-xl leading-relaxed">
                Complete the learning modules below to master the skills required for this project and earn your certification.
              </p>
            </div>
            
            {/* Minimalist Progress Ring */}
            <div className="relative z-10 bg-white/5 border border-white/10 p-6 rounded-2xl min-w-[200px] flex flex-col items-center backdrop-blur-sm">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-5">Course Progress</p>
              <div className="relative w-28 h-28 flex items-center justify-center mb-1">
                 <svg className="w-full h-full transform -rotate-90 absolute inset-0 drop-shadow-md">
                   <circle cx="56" cy="56" r="48" className="stroke-white/10" strokeWidth="6" fill="none" />
                   <circle 
                     cx="56" cy="56" r="48" 
                     className="stroke-indigo-500 transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]" 
                     strokeWidth="6" fill="none" 
                     strokeDasharray="301.59" 
                     strokeDashoffset={301.59 - (301.59 * progressPercentage) / 100}
                     strokeLinecap="round"
                   />
                 </svg>
                 <span className="text-3xl font-extrabold text-white tracking-tighter">{progressPercentage}%</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 pb-2">
            <h3 className="text-xl font-bold text-[#111827] tracking-tight">Learning Path</h3>
          </div>
          
          {modules.length === 0 ? (
            <div className="p-16 text-center bg-white rounded-[1.5rem] border border-slate-200 shadow-sm">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-5" />
              <p className="text-lg font-bold text-slate-800 mb-2">No modules yet</p>
              <p className="text-slate-500 text-sm">Your personalized learning path is currently empty.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {modules.map((module) => {
                const isCompleted = progress.some(p => p.module_id === module.id && p.is_completed);
                // Time-based (Drip-feed) logic based on plan duration
                const planName = student?.registrations?.plan_name || '1 Month Masterclass';
                const is15Days = planName.includes('15 Days');
                const studentStartDate = new Date(student?.created_at || Date.now());
                const daysElapsed = Math.floor((new Date() - studentStartDate) / (1000 * 60 * 60 * 24));
                
                let requiredDays = 0;
                if (module.week_number === 2) requiredDays = is15Days ? 4 : 7;
                if (module.week_number === 3) requiredDays = is15Days ? 8 : 14;
                if (module.week_number >= 4) requiredDays = is15Days ? 12 : 21;

                const isTimeLocked = (module.unlock_date && new Date(module.unlock_date) > new Date()) || (daysElapsed < requiredDays);
                const isLocked = (!isCompleted && module.week_number > activeWeek) || isTimeLocked;
                const isCurrent = !isCompleted && module.week_number === activeWeek && !isTimeLocked;
                
                let moduleVideos = module.videos || [];
                if (moduleVideos.length === 0 && module.video_url) {
                  moduleVideos = [{ title: "Main Topic Lesson", url: module.video_url, duration: "15:00" }];
                }
                let mcqs = module.quiz_data || [];
                
                const currentTab = activeTabs[module.id] || 'videos';
                const currentVideoIdx = activeVideo[module.id] || 0;
                const currentVideo = moduleVideos[currentVideoIdx] || moduleVideos[0];
                const currentVideoYId = getYouTubeId(currentVideo?.url);

                return (
                  <div 
                    key={module.id} 
                    className={`bg-white rounded-[1.25rem] overflow-hidden border transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                      isCurrent 
                        ? 'border-indigo-200 shadow-[0_8px_30px_rgba(79,70,229,0.08)] ring-1 ring-indigo-50' 
                        : isCompleted
                        ? 'border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300'
                        : 'border-slate-200 bg-slate-50/50 opacity-80'
                    }`}
                  >
                    {/* Header Area */}
                    <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-6">
                        {/* Minimalist Icon */}
                        <div className={`w-12 h-12 rounded-[0.85rem] flex items-center justify-center flex-shrink-0 transition-colors ${
                          isCompleted 
                            ? 'bg-[#E0F2FE] text-[#0369A1]' 
                            : isCurrent 
                            ? 'bg-indigo-600 text-white shadow-md' 
                            : 'bg-slate-100 text-slate-400'
                        }`}>
                          {isCompleted ? <CheckCircle className="w-5 h-5" /> : isCurrent ? <PlayCircle className="w-5 h-5 ml-0.5" /> : <Lock className="w-5 h-5" />}
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-3 mb-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                              Week {module.week_number}
                            </span>
                            {isTimeLocked && (
                               <span className="text-[9px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200 uppercase flex items-center gap-1">
                                 <Lock className="w-3 h-3"/> {new Date(module.unlock_date).toLocaleDateString()}
                               </span>
                            )}
                          </div>
                          <h4 className={`text-[1.35rem] font-bold tracking-tight ${isLocked ? 'text-slate-600' : 'text-[#111827]'}`}>{module.title}</h4>
                        </div>
                      </div>
                      
                      {!isCurrent && (
                        <div className="hidden md:block">
                          {isTimeLocked ? (
                            <span className="px-3 py-1 rounded text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-200">
                              Unlocks in {requiredDays - daysElapsed} day(s)
                            </span>
                          ) : isCompleted ? (
                            <span className="px-3 py-1 rounded text-[11px] font-bold uppercase tracking-wider bg-[#F0F9FF] text-[#0369A1] border border-[#BAE6FD]">Completed</span>
                          ) : (
                            <span className="px-3 py-1 rounded text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200">Locked</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Active Content Area (Clean Tabs) */}
                    {isCurrent && (
                      <div className="border-t border-slate-100 bg-white">
                        
                        {/* Ultra-Clean Tab Navigation */}
                        <div className="flex items-center gap-8 px-8 pt-5 border-b border-slate-100 overflow-x-auto">
                          <button 
                            onClick={() => setActiveTabs(prev => ({...prev, [module.id]: 'videos'}))}
                            className={`pb-4 text-[13px] font-semibold tracking-wide whitespace-nowrap transition-colors relative ${currentTab === 'videos' ? 'text-[#111827]' : 'text-slate-500 hover:text-[#111827]'}`}
                          >
                            <span className="flex items-center gap-2"><MonitorPlay className="w-4 h-4"/> Video Lessons</span>
                            {currentTab === 'videos' && <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-[#111827]"></div>}
                          </button>
                          
                          {mcqs && mcqs.length > 0 && (
                            <button 
                              onClick={() => setActiveTabs(prev => ({...prev, [module.id]: 'quiz'}))}
                              className={`pb-4 text-[13px] font-semibold tracking-wide whitespace-nowrap transition-colors relative ${currentTab === 'quiz' ? 'text-[#111827]' : 'text-slate-500 hover:text-[#111827]'}`}
                            >
                              <span className="flex items-center gap-2"><Code2 className="w-4 h-4"/> Assessment</span>
                              {currentTab === 'quiz' && <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-[#111827]"></div>}
                            </button>
                          )}
                        </div>

                        {/* Objectives Banner */}
                        {module.task_details && (
                          <div className="px-8 py-5 bg-slate-50/80 border-b border-slate-100 flex items-start gap-3">
                            <FileText className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" /> 
                            <p className="text-slate-600 text-[13px] font-medium leading-relaxed whitespace-pre-wrap">{module.task_details}</p>
                          </div>
                        )}

                        <div className="p-6 md:p-8">
                          
                          {/* VIDEO TAB CONTENT (Ultra-Premium Layout) */}
                          {currentTab === 'videos' && (
                            <div className="flex flex-col gap-8">
                              {/* Main Player */}
                              <div className="w-full">
                                <div className="bg-black rounded-xl overflow-hidden aspect-video relative shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-200">
                                  {currentVideoYId ? (
                                    <iframe 
                                      width="100%" height="100%" 
                                      src={`https://www.youtube.com/embed/${currentVideoYId}?autoplay=0`} 
                                      title={currentVideo.title} frameBorder="0" 
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen
                                      className="absolute inset-0 z-10"
                                    ></iframe>
                                  ) : (
                                    <div className="flex items-center justify-center h-full text-slate-500 font-medium z-10 relative text-sm">No valid video URL provided.</div>
                                  )}
                                </div>
                                
                                <div className="mt-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
                                  <div>
                                    <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-bold uppercase tracking-widest mb-2 border border-slate-200">
                                      Lesson {currentVideoIdx + 1}
                                    </span>
                                    <h3 className="text-2xl font-bold text-[#111827] tracking-tight">{currentVideo.title}</h3>
                                  </div>
                                  {currentVideo.duration && (
                                    <span className="px-2.5 py-1 bg-white text-slate-500 rounded text-[11px] font-mono font-bold flex-shrink-0 border border-slate-200 shadow-sm">
                                      {currentVideo.duration}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Clean Playlist Grid */}
                              <div className="border-t border-slate-100 pt-8">
                                <h4 className="font-bold text-[#111827] mb-5 text-[15px] tracking-tight">Course Playlist</h4>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3">
                                  {moduleVideos.map((vid, vIndex) => {
                                    const isSelected = currentVideoIdx === vIndex;
                                    const yId = getYouTubeId(vid.url);
                                    return (
                                      <div 
                                        key={vIndex}
                                        onClick={() => setActiveVideo(prev => ({...prev, [module.id]: vIndex}))}
                                        className={`p-2.5 rounded-xl cursor-pointer transition-all duration-200 flex items-center gap-4 border ${isSelected ? 'bg-indigo-50/30 border-indigo-200 shadow-[0_2px_10px_rgba(79,70,229,0.06)]' : 'bg-white border-transparent hover:border-slate-200 hover:bg-slate-50'}`}
                                      >
                                        <div className={`w-24 h-14 rounded-lg relative overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-200/50`}>
                                          {yId && <img src={`https://img.youtube.com/vi/${yId}/mqdefault.jpg`} className="absolute inset-0 w-full h-full object-cover" alt={vid.title} />}
                                          <div className={`absolute inset-0 flex items-center justify-center transition-colors ${isSelected ? 'bg-indigo-900/40' : 'bg-slate-900/10 group-hover:bg-slate-900/20'}`}>
                                            {isSelected ? (
                                              <PlayCircle className="w-6 h-6 text-white drop-shadow-md"/>
                                            ) : (
                                              <PlayCircle className="w-5 h-5 text-white/80"/>
                                            )}
                                          </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className={`text-[9px] font-bold uppercase tracking-widest mb-0.5 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`}>Lesson {vIndex + 1}</p>
                                          <p className={`font-semibold text-[13px] truncate ${isSelected ? 'text-[#111827]' : 'text-slate-600'}`}>{vid.title}</p>
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* QUIZ TAB CONTENT (Ultra-Premium Layout) */}
                          {currentTab === 'quiz' && (
                            <div className="bg-white border border-slate-200 rounded-[1.25rem] shadow-sm">
                              <div className="p-8">
                                <div className="space-y-12">
                                  {mcqs.map((q, index) => (
                                    <div key={index} className="space-y-5">
                                      <div className="flex gap-3 items-start">
                                        <span className="text-slate-400 font-bold text-sm mt-1">{index + 1}.</span>
                                        <p className="font-semibold text-[#111827] text-[15px] leading-relaxed">{q.question}</p>
                                      </div>
                                      
                                      {q.options && q.options.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-6">
                                          {q.options.map((opt, optIdx) => {
                                            const isSelected = studentAnswers[module.id]?.[index] === optIdx;
                                            const isChecked = showAnswers[module.id];
                                            const isCorrect = optIdx === q.correct_option;
                                            
                                            let optionClass = "bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600";
                                            if (isSelected && !isChecked) optionClass = "bg-indigo-50/50 border-indigo-600 text-[#111827] shadow-[0_2px_10px_rgba(79,70,229,0.06)]";
                                            if (isChecked) {
                                              if (isCorrect) optionClass = "bg-[#F0FDF4] border-[#22C55E] text-[#14532D]";
                                              else if (isSelected && !isCorrect) optionClass = "bg-[#FEF2F2] border-[#EF4444] text-[#7F1D1D]";
                                              else optionClass = "bg-white border-slate-200 text-slate-400 opacity-50";
                                            }
                                            
                                            return (
                                              <div 
                                                key={optIdx}
                                                onClick={() => {
                                                  if(isChecked) return;
                                                  setStudentAnswers(prev => ({
                                                    ...prev,
                                                    [module.id]: {
                                                      ...(prev[module.id] || {}),
                                                      [index]: optIdx
                                                    }
                                                  }));
                                                }}
                                                className={`px-4 py-3.5 rounded-xl cursor-pointer transition-all duration-200 flex items-start gap-3 ${optionClass} ${!isChecked && 'active:scale-[0.99]'}`}
                                              >
                                                <div className={`w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center mt-0.5 transition-colors ${isSelected ? (isChecked ? (isCorrect ? 'border-[#22C55E] bg-[#22C55E]' : 'border-[#EF4444] bg-[#EF4444]') : 'border-indigo-600 bg-indigo-600') : (isChecked && isCorrect ? 'border-[#22C55E] bg-[#22C55E]' : 'border-slate-300 bg-white')}`}>
                                                  {(isSelected || (isChecked && isCorrect)) && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                                                </div>
                                                <span className="font-medium text-[13px] leading-snug">{opt}</span>
                                              </div>
                                            )
                                          })}
                                        </div>
                                      ) : (
                                        <div className="pl-6">
                                          <textarea
                                            rows={3}
                                            placeholder="Type your response here..."
                                            value={studentAnswers[module.id]?.[index] || ''}
                                            onChange={(e) => {
                                              setStudentAnswers(prev => ({
                                                ...prev,
                                                [module.id]: {
                                                  ...(prev[module.id] || {}),
                                                  [index]: e.target.value
                                                }
                                              }));
                                            }}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50 hover:bg-white text-[13px] transition-all"
                                          ></textarea>
                                        </div>
                                      )}

                                      {showAnswers[module.id] && (!q.options || q.options.length === 0) && (
                                        <div className="ml-6 bg-slate-50 p-4 rounded-xl border border-slate-200 mt-2">
                                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Reference Answer</p>
                                          <p className="text-[13px] text-slate-700 font-medium leading-relaxed">{q.answer}</p>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                  
                                  <div className="flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-slate-100 gap-4">
                                    <button
                                      onClick={() => setShowAnswers(prev => ({ ...prev, [module.id]: !prev[module.id] }))}
                                      className="w-full sm:w-auto px-5 py-2.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-[13px] font-semibold transition-all shadow-sm"
                                    >
                                      {showAnswers[module.id] ? 'Hide Results' : 'Check Answers'}
                                    </button>

                                    <button 
                                      onClick={() => handleMarkCompleted(module)}
                                      disabled={completing}
                                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-[#111827] hover:bg-black text-white rounded-lg text-[13px] font-semibold transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:shadow-none active:scale-[0.98]"
                                    >
                                      <CheckCircle className="w-4 h-4" /> 
                                      {completing ? 'Updating...' : 'Mark Module Complete'}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Widgets */}
        <div className="space-y-6">
          
          {/* Certificate Widget (Ultra-Premium) */}
          <div className={`rounded-[1.25rem] p-6 border transition-all duration-300 ${isFullyCompleted ? 'bg-[#F0FDF4] border-[#BBF7D0] shadow-[0_8px_30px_rgba(34,197,94,0.12)]' : 'bg-white border-slate-200 shadow-sm'}`}>
            <h3 className="text-[15px] font-bold mb-5 flex items-center gap-2 text-[#111827] tracking-tight">
              <Award className={`w-4 h-4 ${isFullyCompleted ? 'text-[#16A34A]' : 'text-slate-400'}`} />
              Certification
            </h3>
            
            <div className="flex flex-col items-center text-center">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-colors ${isFullyCompleted ? 'bg-[#DCFCE7] text-[#16A34A] shadow-sm' : 'bg-slate-50 border border-slate-100 text-slate-300'}`}>
                <Award className="w-7 h-7" />
              </div>
              
              {isFullyCompleted ? (
                <>
                  <p className="text-lg font-bold text-[#111827] mb-1.5">Congratulations!</p>
                  <p className="text-[13px] text-slate-600 mb-6 leading-relaxed">
                    Your certificate for <strong>{student.selected_project}</strong> is ready.
                  </p>
                  <button className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold py-2.5 rounded-lg text-[13px] transition-all shadow-sm hover:shadow-md active:scale-[0.98] flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" /> Download Certificate
                  </button>
                </>
              ) : (
                <>
                  <p className="text-[15px] font-bold text-[#111827] mb-1">In Progress</p>
                  <p className="text-[13px] text-slate-500 leading-relaxed">
                    Complete all weekly modules to unlock your official certification.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Profile Summary Widget (Ultra-Premium) */}
          <div className="bg-white rounded-[1.25rem] p-6 border border-slate-200 shadow-sm">
            <h3 className="text-[15px] font-bold text-[#111827] mb-5 flex items-center gap-2 tracking-tight">
              <UserCircle className="w-4 h-4 text-slate-400" />
              Profile Details
            </h3>
            <div className="space-y-2.5">
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Domain</p>
                <p className="font-semibold text-[#111827] text-[13px]">{student?.domain || 'Not Assigned'}</p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Duration</p>
                <p className="font-semibold text-[#111827] text-[13px]">{student?.duration || '1'} Month(s)</p>
              </div>
            </div>
          </div>
          
          {/* Quick Resources Widget (Ultra-Premium) */}
          <div className="bg-white rounded-[1.25rem] p-6 border border-slate-200 shadow-sm">
            <h3 className="text-[15px] font-bold text-[#111827] mb-5 flex items-center gap-2 tracking-tight">
              <LinkIcon className="w-4 h-4 text-slate-400" />
              Quick Resources
            </h3>
            <div className="space-y-2">
              {student?.domain === 'Vibe Coding' && (
                <button onClick={() => setShowResourcesModal(true)} className="w-full text-left flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-100 group-hover:scale-105 transition-all shadow-sm">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold text-[#111827]">Reference Materials</p>
                    <p className="text-[11px] text-slate-500">Free Guides, Docs & Courses</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                </button>
              )}
              
              <button onClick={() => setShowBenefitsModal(true)} className="w-full text-left flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group">
                <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 group-hover:bg-orange-100 group-hover:scale-105 transition-all shadow-sm">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-semibold text-[#111827]">Career Impact</p>
                  <p className="text-[11px] text-slate-500">How this helps your future</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
              </button>

              <a href="tel:+918667399640" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-100 group-hover:scale-105 transition-all shadow-sm">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-semibold text-[#111827]">Contact Support</p>
                  <p className="text-[11px] text-slate-500">+91 8667399640</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
              </a>
            </div>
          </div>
          
          {/* Internship Roadmap Widget (Ultra-Premium) */}
          <div className="bg-white rounded-[1.25rem] p-6 border border-slate-200 shadow-sm relative overflow-hidden">
            <h3 className="text-[15px] font-bold text-[#111827] mb-5 flex items-center gap-2 tracking-tight">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              About & Roadmap
            </h3>
            
            <p className="text-[13px] text-slate-500 mb-6 leading-relaxed">
              Complete the required modules, build your capstone project, and submit it for review to receive your verified certification.
            </p>

            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-indigo-100">
                  <PlayCircle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#111827] text-[13px]">1. Watch Modules</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">Learn from curated video content.</p>
                </div>
              </div>
              
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-orange-100">
                  <Code2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#111827] text-[13px]">2. Complete Assessment</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">Pass the MCQ quizzes.</p>
                </div>
              </div>
              
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-emerald-100">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#111827] text-[13px]">3. Build Capstone</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">Develop your selected project.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-purple-100">
                  <LinkIcon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#111827] text-[13px]">4. Submit Links</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">Provide live and GitHub URLs.</p>
                </div>
              </div>
              
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-blue-100">
                  <Award className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#111827] text-[13px]">5. Get Certified</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">Earn your verified certificate!</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Project Submission Widget */}
          <div className="bg-white rounded-[1.5rem] p-6 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full blur-3xl -mr-10 -mt-10 opacity-60"></div>
            <h3 className="text-[15px] font-black text-[#111827] mb-5 flex items-center gap-2 relative z-10">
              <Code2 className="w-4 h-4 text-purple-500" />
              Final Submission
            </h3>
            <form onSubmit={handleFinalSubmit} className="space-y-4 relative z-10">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Project Link (Live)</label>
                <input 
                  type="url" 
                  required
                  value={projectLink}
                  onChange={(e) => setProjectLink(e.target.value)}
                  placeholder="https://your-project.vercel.app"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 bg-slate-50 text-xs focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">GitHub Repository</label>
                <input 
                  type="url" 
                  required
                  value={githubRepo}
                  onChange={(e) => setGithubRepo(e.target.value)}
                  placeholder="https://github.com/username/repo"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 bg-slate-50 text-xs focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Feedback / Experience</label>
                <textarea 
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="How was your internship experience?"
                  rows="3"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 bg-slate-50 text-xs focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all resize-none"
                ></textarea>
              </div>
              <button type="submit" className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Submit Project
              </button>
            </form>
          </div>
          
        </div>
      </div>
      
      {/* Benefits Modal */}
      <AnimatePresence>
        {showBenefitsModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setShowBenefitsModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[1.5rem] shadow-2xl overflow-hidden border border-slate-200"
            >
              <div className="p-6 md:p-8">
                <button 
                  onClick={() => setShowBenefitsModal(false)}
                  className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6">
                  <TrendingUp className="w-6 h-6" />
                </div>
                
                <h3 className="text-2xl font-extrabold text-[#111827] tracking-tight mb-2">How This Helps Your Future</h3>
                <p className="text-slate-500 text-[15px] leading-relaxed mb-8">
                  This internship is designed to give you a massive competitive advantage in the tech industry. Here is what you get out of it:
                </p>
                
                <div className="space-y-6">
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                    <div>
                      <h4 className="font-bold text-[#111827] text-sm mb-1">Production-Level Experience</h4>
                      <p className="text-slate-500 text-[13px] leading-relaxed">You won't just write toy code. You'll build and deploy real-world applications using modern, high-demand tech stacks.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                    <div>
                      <h4 className="font-bold text-[#111827] text-sm mb-1">Verified Certification & LoR</h4>
                      <p className="text-slate-500 text-[13px] leading-relaxed">Receive an official, verifiable certificate and a Letter of Recommendation highlighting your specific technical achievements.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                    <div>
                      <h4 className="font-bold text-[#111827] text-sm mb-1">Live Project Portfolio</h4>
                      <p className="text-slate-500 text-[13px] leading-relaxed">Your capstone project will be live on the internet, giving you an impressive portfolio link to send directly to recruiters.</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-10">
                  <button onClick={() => setShowBenefitsModal(false)} className="w-full py-3.5 bg-[#111827] hover:bg-black text-white font-bold rounded-xl transition-all shadow-sm hover:shadow-md active:scale-[0.98]">
                    Got it, let's build!
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Resources Modal */}
      <AnimatePresence>
        {showResourcesModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setShowResourcesModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[1.5rem] shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]"
            >
              <div className="p-6 md:p-8 flex-1 overflow-y-auto">
                <button 
                  onClick={() => setShowResourcesModal(false)}
                  className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
                  <BookOpen className="w-6 h-6" />
                </div>
                
                <h3 className="text-2xl font-extrabold text-[#111827] tracking-tight mb-2">Free Reference Materials</h3>
                <p className="text-slate-500 text-[15px] leading-relaxed mb-8">
                  A curated list of genuinely free, official, and open-access material on AI and Vibe Coding.
                </p>
                
                <div className="space-y-8">
                  {/* Section 1 */}
                  <div>
                    <h4 className="font-bold text-[#111827] text-[15px] mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-500" /> Free Official Guides & Docs
                    </h4>
                    <ul className="space-y-3">
                      <li>
                        <a href="https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/overview" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 font-semibold text-[13px] flex items-center gap-1">Anthropic Prompt Engineering Guide <ChevronRight className="w-3 h-3" /></a>
                        <p className="text-slate-500 text-xs mt-0.5">Official free guide from the creators of Claude.</p>
                      </li>
                      <li>
                        <a href="https://platform.openai.com/docs/guides/prompt-engineering" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 font-semibold text-[13px] flex items-center gap-1">OpenAI Prompt Engineering Guide <ChevronRight className="w-3 h-3" /></a>
                        <p className="text-slate-500 text-xs mt-0.5">Best practices from OpenAI.</p>
                      </li>
                      <li>
                        <a href="https://www.kaggle.com/learn-guide/5-day-genai" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 font-semibold text-[13px] flex items-center gap-1">Google's "Prompt Engineering" Whitepaper <ChevronRight className="w-3 h-3" /></a>
                        <p className="text-slate-500 text-xs mt-0.5">Distributed via Kaggle's Gen AI course by Google's Gemini team.</p>
                      </li>
                      <li>
                        <a href="https://docs.cursor.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 font-semibold text-[13px] flex items-center gap-1">Cursor Documentation <ChevronRight className="w-3 h-3" /></a>
                        <p className="text-slate-500 text-xs mt-0.5">The official documentation for the Cursor AI editor.</p>
                      </li>
                    </ul>
                  </div>

                  {/* Section 2 */}
                  <div>
                    <h4 className="font-bold text-[#111827] text-[15px] mb-3 flex items-center gap-2">
                      <PlayCircle className="w-4 h-4 text-emerald-500" /> Free Full Courses
                    </h4>
                    <ul className="space-y-3">
                      <li>
                        <a href="https://www.codecademy.com/learn/intro-to-vibe-coding" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 font-semibold text-[13px] flex items-center gap-1">Codecademy — Intro to Vibe Coding <ChevronRight className="w-3 h-3" /></a>
                        <p className="text-slate-500 text-xs mt-0.5">A great introductory course with a free tier.</p>
                      </li>
                      <li>
                        <a href="https://www.kaggle.com/learn-guide/5-day-genai" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 font-semibold text-[13px] flex items-center gap-1">Google's 5-Day Gen AI Intensive <ChevronRight className="w-3 h-3" /></a>
                        <p className="text-slate-500 text-xs mt-0.5">Includes whitepapers and PDFs via Kaggle.</p>
                      </li>
                      <li>
                        <a href="https://github.com/microsoft/generative-ai-for-beginners" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 font-semibold text-[13px] flex items-center gap-1">Microsoft's "Generative AI for Beginners" <ChevronRight className="w-3 h-3" /></a>
                        <p className="text-slate-500 text-xs mt-0.5">Open-source GitHub course with downloadable lessons.</p>
                      </li>
                      <li>
                        <a href="https://www.deeplearning.ai/short-courses/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 font-semibold text-[13px] flex items-center gap-1">DeepLearning.AI Short Courses <ChevronRight className="w-3 h-3" /></a>
                        <p className="text-slate-500 text-xs mt-0.5">Prompt-engineering and AI-app-building focused courses.</p>
                      </li>
                    </ul>
                  </div>

                  {/* Section 3 */}
                  <div>
                    <h4 className="font-bold text-[#111827] text-[15px] mb-3 flex items-center gap-2">
                      <Award className="w-4 h-4 text-orange-500" /> Free Research Papers
                    </h4>
                    <ul className="space-y-3">
                      <li>
                        <a href="https://arxiv.org" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 font-semibold text-[13px] flex items-center gap-1">arXiv.org <ChevronRight className="w-3 h-3" /></a>
                        <p className="text-slate-500 text-xs mt-0.5">Free PDFs of AI/ML papers directly from authors, fully legal.</p>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Desktop Warning Modal */}
      <AnimatePresence>
        {showDesktopWarning && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setShowDesktopWarning(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
              className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200 text-center"
            >
              <div className="p-8">
                <div className="w-20 h-20 mx-auto bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-6 shadow-inner relative">
                  <div className="absolute inset-0 bg-indigo-400 opacity-20 rounded-full animate-ping"></div>
                  <MonitorPlay className="w-10 h-10 relative z-10" />
                </div>
                
                <h3 className="text-2xl font-black text-[#111827] tracking-tight mb-3">Best Viewed on Desktop</h3>
                <p className="text-slate-500 text-[15px] leading-relaxed mb-8">
                  This dashboard is packed with powerful tools and is perfectly built for a desktop view. For the best learning experience, kindly use a desktop or laptop device.
                </p>
                
                <button 
                  onClick={() => setShowDesktopWarning(false)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  I Understand, Let's Go!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentDashboard;
