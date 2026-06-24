import { useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ChevronDown, Code, Smartphone, Bot, PenTool, TrendingUp, Briefcase, Database, ArrowRight } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import CtaButton from '../components/CtaButton';

const SERVICES_DATA = [
  {
    id: '01',
    title: 'Web Development',
    headline: 'Modern Websites That Convert',
    desc: 'Business websites, landing pages, educational portals, dashboards, e-commerce solutions.',
    icon: Code,
    preview: ['Company Website', 'Landing Page', 'College Portal', 'Admin Dashboard'],
  },
  {
    id: '02',
    title: 'Mobile App Development',
    headline: 'Mobile Experiences That Users Love',
    desc: 'Android and iOS apps built using modern technologies.',
    icon: Smartphone,
    preview: ['Sairam Sync', 'Student App', 'Business App'],
  },
  {
    id: '03',
    title: 'AI & Automation',
    headline: 'Automate Your Business',
    desc: 'AI assistants, workflow automation, chatbots, lead generation systems, business process automation.',
    icon: Bot,
    preview: ['AI Assistant', 'Telegram Bot', 'Automation Dashboard'],
  },
  {
    id: '04',
    title: 'UI / UX Design',
    headline: 'Designs That Create Impact',
    desc: 'Beautiful and conversion-focused user experiences.',
    icon: PenTool,
    preview: ['App Design', 'Dashboard Design', 'Website Design'],
  },
  {
    id: '05',
    title: 'Digital Marketing',
    headline: 'Reach More Customers',
    desc: 'SEO, Meta Ads, Google Ads, social media growth and branding.',
    icon: TrendingUp,
    preview: ['Campaign Reports', 'Social Media Designs', 'Ad Creatives'],
  },
  {
    id: '06',
    title: 'GST Registration & Business Services',
    headline: 'Start Your Business Professionally',
    desc: 'GST Registration, MSME Registration, Business Documentation, Startup Support, Basic Compliance Services.',
    icon: Briefcase,
    preview: ['Idea → Registration', 'Compliance → Growth'],
  },
  {
    id: '07',
    title: 'Custom Software Development',
    headline: 'Software Built Around Your Workflow',
    desc: 'ERP systems, CRM solutions, Management portals, Custom business software.',
    icon: Database,
    preview: ['ERP System', 'CRM Platform', 'Management Dashboard'],
  }
];

const PORTFOLIO_PROJECTS = [
  { 
    name: 'AI CV Shell', 
    category: 'AI & Automation', 
    tech: 'Python / OpenAI', 
    status: 'Live',
    desc: 'An intelligent AI-powered CV generator and analyzer that helps candidates build ATS-friendly resumes instantly.',
    image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=800&auto=format&fit=crop'
  },
  { 
    name: 'DAKH Intern Bot', 
    category: 'AI Chatbot', 
    tech: 'Python / NLP', 
    status: 'Live',
    desc: 'An automated Telegram bot that streamlines internship onboarding, answers queries, and manages student tasks.',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800&auto=format&fit=crop'
  },
  { 
    name: 'TeddiKidz', 
    category: 'E-Commerce Web', 
    tech: 'Next.js / Tailwind', 
    status: 'Live',
    link: 'https://www.teddikidz.in/',
    desc: 'A vibrant, high-performance e-commerce platform designed for premium kids clothing and accessories.',
    image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=800&auto=format&fit=crop'
  },
  { 
    name: 'Sairam Hub', 
    category: 'Mobile Community', 
    tech: 'React Native', 
    status: 'Live',
    desc: 'An exclusive community application built for Sairam College students to connect, collaborate, and share resources.',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop'
  },
  { 
    name: 'Zovio', 
    category: 'Mobile App', 
    tech: 'Flutter / Firebase', 
    status: 'Live',
    desc: 'A sleek, modern mobile application designed to deliver seamless user experiences and powerful integrations.',
    image: 'https://images.unsplash.com/photo-1616469829581-73993eb86b02?q=80&w=800&auto=format&fit=crop'
  },
  { 
    name: 'Therapy Joy', 
    category: 'Healthcare App', 
    tech: 'React Native', 
    status: 'Live',
    desc: 'A beautifully crafted application dedicated to assisting children with autism through interactive therapeutic exercises.',
    image: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?q=80&w=800&auto=format&fit=crop'
  },
];

const PROCESS_STEPS = ['Discover', 'Plan', 'Design', 'Develop', 'Launch', 'Support'];

const ServiceSection = ({ service, index }) => {
  return (
    <div className="min-h-[100svh] w-full flex items-center justify-center sticky top-0 bg-black overflow-hidden border-t border-white/5 snap-start">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.03)_0%,transparent_70%)]"></div>
       <div className="max-w-7xl w-full mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 relative z-10 py-24 lg:py-0">
          
          {/* Left: Content that slides up */}
          <div className="flex flex-col justify-center order-2 lg:order-1">
             <div className="text-amber-500 font-mono text-lg tracking-[0.2em] mb-6 flex items-center gap-4">
                <span className="w-12 h-[1px] bg-amber-500/50"></span>
                {service.id} / 07
             </div>
             <div className="mb-4 text-purple-400 font-bold uppercase tracking-wider text-sm">{service.title}</div>
             <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter leading-[1.1] mb-8">{service.headline}</h2>
             <p className="text-xl md:text-2xl text-purple-100/90 mb-12 leading-relaxed max-w-xl">{service.desc}</p>
             <ul className="space-y-6">
               {service.preview.map((item, i) => (
                 <li key={i} className="flex items-center gap-4 text-purple-50 font-medium text-lg">
                   <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-amber-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.8)]"></div>
                   {item}
                 </li>
               ))}
             </ul>
          </div>

          {/* Right: Sticky Mockup / Visual */}
          <div className="relative h-[40vh] lg:h-[70vh] flex items-center justify-center order-1 lg:order-2 perspective-1000">
             {/* Abstract visual representation */}
             <motion.div 
               initial={{ rotateY: 10, rotateX: 10, opacity: 0, scale: 0.8 }}
               whileInView={{ rotateY: -5, rotateX: 5, opacity: 1, scale: 1 }}
               transition={{ duration: 1, ease: "easeOut" }}
               className="w-full max-w-md aspect-square bg-gradient-to-br from-purple-900/40 to-amber-900/20 rounded-3xl border border-white/10 backdrop-blur-3xl flex items-center justify-center shadow-2xl overflow-hidden relative"
             >
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] animate-[gradient_3s_linear_infinite]"></div>
                <service.icon className="w-48 h-48 text-white/5 absolute" />
                <div className="relative z-10 w-[80%] h-[80%] bg-black/60 border border-white/10 rounded-2xl shadow-2xl p-6 flex flex-col gap-4 backdrop-blur-md transform transition-transform hover:scale-105 duration-500">
                   <div className="w-full h-8 bg-white/5 rounded-lg flex items-center px-4 gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                   </div>
                   <div className="flex-1 bg-white/5 rounded-lg p-6 flex flex-col justify-center gap-4">
                      {service.preview.slice(0, 3).map((p, i) => (
                         <div key={i} className="w-full h-12 bg-gradient-to-r from-white/10 to-transparent rounded border border-white/5 flex items-center px-4 text-sm text-white/80 font-medium">
                           {p}
                         </div>
                      ))}
                   </div>
                </div>
             </motion.div>
          </div>

       </div>
    </div>
  )
}

const PortfolioShowcase = () => {
  const targetRef = useRef(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const { scrollYProgress } = useScroll({ target: targetRef });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-70%"]);

  return (
    <section ref={targetRef} className="h-[400vh] bg-black relative">
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden border-t border-white/5">
         <div className="px-6 lg:px-16 mb-16 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
           <div>
             <div className="text-amber-500 font-mono text-sm tracking-[0.2em] mb-4 uppercase">Featured Portfolio</div>
             <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter">Our Work</h2>
           </div>
           <p className="text-xl text-purple-100/90 max-w-md leading-relaxed">
             A showcase of our premium digital products engineered for scale and growth.
           </p>
         </div>
         <motion.div style={{ x }} className="flex gap-8 px-6 lg:px-16 w-[280vw]">
           {PORTFOLIO_PROJECTS.map((project, i) => (
             <div key={i} onClick={() => setSelectedProject(project)} className="w-[85vw] md:w-[40vw] h-[65vh] shrink-0 bg-white rounded-[2rem] p-8 flex flex-col justify-between group hover:scale-[1.02] transition-transform duration-500 relative overflow-hidden cursor-pointer shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                
                {/* Image Background */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                   <img src={project.image} alt={project.name} className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-700" />
                   <div className="absolute inset-0 bg-gradient-to-t from-white via-white/90 to-white/20 group-hover:from-white group-hover:via-white/95 transition-colors duration-500"></div>
                </div>

                {/* Top Section */}
                <div className="relative z-10 flex justify-between items-start">
                  <div className="inline-block px-4 py-2 bg-purple-100/90 backdrop-blur-md text-purple-700 text-xs font-bold tracking-widest uppercase rounded-full shadow-sm border border-purple-200">
                    {project.category}
                  </div>
                  {project.link ? (
                    <a href={project.link} target="_blank" rel="noreferrer" className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:bg-purple-50 transition-colors border border-gray-100">
                      <ArrowRight className="text-purple-600 w-5 h-5 -rotate-45" />
                    </a>
                  ) : (
                    <div className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:bg-purple-50 transition-colors border border-gray-100">
                      <ArrowRight className="text-purple-600 w-5 h-5 -rotate-45" />
                    </div>
                  )}
                </div>

                {/* Bottom Section */}
                <div className="relative z-10 mt-auto pt-8">
                  <h3 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 drop-shadow-sm">{project.name}</h3>
                  <p className="text-lg text-gray-800 font-medium mb-6 line-clamp-2">{project.desc}</p>
                  
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-gray-200">
                    <div className="px-6 py-2 bg-white rounded-full text-gray-800 font-bold text-sm shadow-sm border border-gray-100">{project.tech}</div>
                    <div className="flex items-center gap-2 text-green-700 font-bold text-sm px-4 py-2 bg-green-50 rounded-full border border-green-100">
                       <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                       {project.status}
                    </div>
                  </div>
                </div>
             </div>
           ))}
         </motion.div>
      </div>

      <AnimatePresence>
        {selectedProject && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div 
              initial={{ y: 50, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[2rem] w-full max-w-5xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row"
            >
              <button 
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur-md hover:bg-gray-200 text-gray-800 rounded-full flex items-center justify-center z-20 transition-colors shadow-sm"
              >
                ✕
              </button>

              {/* Left Side: Image */}
              <div className="w-full md:w-2/5 h-64 md:h-auto relative">
                <img src={selectedProject.image} alt={selectedProject.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-8">
                  <div className="inline-block px-4 py-2 bg-purple-500/90 text-white text-xs font-bold tracking-widest uppercase rounded-full shadow-lg border border-purple-400">
                    {selectedProject.category}
                  </div>
                </div>
              </div>

              {/* Right Side: Content */}
              <div className="w-full md:w-3/5 p-8 md:p-12 flex flex-col justify-center bg-gray-50">
                <h3 className="text-3xl md:text-5xl font-black text-gray-900 mb-6">{selectedProject.name}</h3>
                <p className="text-lg text-gray-700 mb-8 leading-relaxed font-medium">{selectedProject.desc}</p>
                
                <div className="flex flex-wrap gap-3 mb-10 pb-8 border-b border-gray-200">
                  {selectedProject.tech.split(' / ').map((t, idx) => (
                    <span key={idx} className="px-4 py-2 bg-white text-gray-800 rounded-full text-sm font-bold border border-gray-200 shadow-sm">
                      {t}
                    </span>
                  ))}
                  <span className="px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-bold border border-green-200 flex items-center gap-2 shadow-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span> {selectedProject.status}
                  </span>
                </div>

                <div className="p-8 bg-purple-50 border border-purple-100 rounded-3xl shadow-sm">
                  <h4 className="text-purple-900 font-bold text-xl mb-3">Want something similar?</h4>
                  <p className="text-purple-800/80 font-medium mb-6">
                    If you need <span className="font-bold text-purple-900">{selectedProject.name}</span> or a custom product built for your business, contact us at <span className="font-bold text-purple-900">+91 8667399460</span>.
                  </p>
                  <a href="https://wa.me/918667399460" target="_blank" rel="noreferrer" className="inline-flex w-full items-center justify-center py-4 bg-purple-600 text-white font-black rounded-xl shadow-[0_10px_20px_rgba(168,85,247,0.3)] hover:bg-purple-700 hover:scale-[1.02] transition-all">
                    Contact Us on WhatsApp
                  </a>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  )
}

const WorkProcess = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  return (
    <section ref={containerRef} className="py-40 bg-black text-white relative border-t border-white/5">
       <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-24">
            <div className="text-amber-500 font-mono text-sm tracking-[0.2em] mb-4 uppercase">How We Work</div>
            <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter">Work Process</h2>
          </div>
          
          <div className="relative pl-4 md:pl-12">
             {/* Background Line */}
             <div className="absolute left-8 md:left-16 top-0 bottom-0 w-1 bg-white/10 rounded-full"></div>
             
             {/* Animated Progress Line */}
             <motion.div 
               style={{ scaleY: scrollYProgress }} 
               className="absolute left-8 md:left-16 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-amber-500 origin-top rounded-full shadow-[0_0_15px_rgba(168,85,247,0.8)]"
             ></motion.div>

             <div className="space-y-32">
               {PROCESS_STEPS.map((step, i) => (
                 <motion.div 
                   key={i} 
                   initial={{ opacity: 0, x: -20 }}
                   whileInView={{ opacity: 1, x: 0 }}
                   transition={{ duration: 0.5, delay: 0.1 }}
                   viewport={{ once: true, margin: "-100px" }}
                   className="flex items-center gap-8 md:gap-16 relative z-10"
                 >
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-black border-2 border-white/20 flex items-center justify-center font-mono text-2xl md:text-3xl font-black shrink-0 shadow-[0_0_30px_rgba(0,0,0,0.8)] transform -translate-x-[2.2rem] md:-translate-x-[2.75rem]">
                       0{i + 1}
                    </div>
                    <div className="bg-white/5 border border-white/10 p-8 rounded-3xl flex-1 backdrop-blur-sm hover:bg-white/10 transition-colors">
                       <h3 className="text-3xl md:text-4xl font-black text-white mb-2">{step}</h3>
                       <p className="text-purple-200/90 text-lg">We systematically execute this phase ensuring pixel-perfect quality and alignment with business goals.</p>
                    </div>
                 </motion.div>
               ))}
             </div>
          </div>
       </div>
    </section>
  )
}

const Services = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', needs: '', budget: '' });

  const handleProjectSubmit = (e) => {
    e.preventDefault();
    const text = `Hi DAKH! I want to start a project.%0A%0A*Name:* ${formData.name}%0A*Project Requirements:* ${formData.needs}%0A*Estimated Budget:* ${formData.budget}`;
    window.open(`https://wa.me/918667399640?text=${text}`, '_blank');
    setIsFormOpen(false);
    setFormData({ name: '', needs: '', budget: '' });
  };

  return (
    <PageTransition>
      {/* We wrap the entire page in a dark theme container so it doesn't break the global light theme */}
      <div className="bg-black text-white min-h-screen selection:bg-purple-500/30 selection:text-white font-sans">
        
        {/* 1. HERO SECTION */}
        <section className="min-h-[100svh] w-full relative flex flex-col items-center justify-center overflow-hidden bg-black text-center pt-32 pb-20">
          {/* Animated Glowing Orb Background */}
          <motion.div 
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-gradient-to-tr from-purple-600/40 to-amber-500/20 rounded-full blur-[120px] pointer-events-none opacity-60"
          />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
          
          <div className="relative z-10 max-w-6xl mx-auto px-6 flex flex-col items-center">
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.7 }}
               className="inline-block px-6 py-2 rounded-full bg-white/10 border border-white/20 text-sm md:text-base text-white mb-10 shadow-sm backdrop-blur-md font-mono uppercase tracking-widest"
             >
               Premium Software Agency
             </motion.div>

             <motion.h1 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.7, delay: 0.1 }}
               className="text-6xl sm:text-7xl md:text-8xl lg:text-[7rem] font-black text-white tracking-tighter leading-[1.05] mb-8 drop-shadow-2xl"
             >
               WE BUILD DIGITAL PRODUCTS <br className="hidden md:block" />
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-purple-500 to-amber-500">THAT DRIVE GROWTH</span>
             </motion.h1>

             <motion.p 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.7, delay: 0.2 }}
               className="text-xl md:text-3xl text-purple-100/90 font-medium max-w-4xl mx-auto mb-16 leading-relaxed"
             >
               Websites, Mobile Apps, AI Solutions, Digital Marketing, GST Registration, and Custom Software.
             </motion.p>

             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.7, delay: 0.3 }}
               className="flex flex-col sm:flex-row justify-center gap-6 w-full sm:w-auto relative z-20 mb-8"
             >
               <button className="px-10 py-5 bg-white text-black font-black rounded-full hover:scale-105 transition-transform text-lg shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                 Get Free Consultation
               </button>
               <button className="px-10 py-5 bg-transparent border border-white/20 text-white font-bold rounded-full hover:bg-white/10 transition-colors text-lg backdrop-blur-sm">
                 View Portfolio
               </button>
             </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 animate-bounce opacity-50 cursor-pointer z-0"
          >
            <span className="text-xs tracking-[0.3em] text-white font-mono uppercase">Scroll to explore</span>
            <ChevronDown className="text-white w-6 h-6" />
          </motion.div>
        </section>

        {/* 2. SERVICES SHOWCASE (Sticky Scroll) */}
        <div className="relative">
          {SERVICES_DATA.map((service, i) => (
            <ServiceSection key={i} service={service} index={i} />
          ))}
        </div>

        {/* 3. FEATURED PORTFOLIO */}
        <PortfolioShowcase />

        {/* 4. WORK PROCESS */}
        <WorkProcess />

        {/* 5. FINAL CTA */}
        <section className="min-h-[80svh] bg-black flex items-center justify-center relative overflow-hidden border-t border-white/10 py-32">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.2)_0%,transparent_60%)]"
          />
          
          <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
            <div className="text-amber-500 font-mono text-sm tracking-[0.2em] mb-8 uppercase">Start Today</div>
            <h2 className="text-6xl md:text-8xl lg:text-[7rem] font-black text-white tracking-tighter mb-16 leading-tight">Ready To Build <br/>Something <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-amber-500">Amazing?</span></h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button onClick={() => setIsFormOpen(true)} className="px-12 py-6 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-black rounded-full text-xl hover:scale-105 transition-transform shadow-[0_0_50px_rgba(168,85,247,0.5)] cursor-pointer">Start Your Project</button>
              <a href="https://wa.me/918667399640" target="_blank" rel="noreferrer" className="px-12 py-6 bg-white/5 backdrop-blur-md text-white border border-white/20 font-bold rounded-full text-xl hover:bg-white/10 transition-colors inline-block text-center cursor-pointer">Contact Us</a>
            </div>
          </div>
        </section>

        {/* Project Form Modal */}
        <AnimatePresence>
          {isFormOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
              onClick={() => setIsFormOpen(false)}
            >
              <motion.div 
                initial={{ y: 50, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 20, opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-900 border border-white/10 rounded-[2rem] w-full max-w-2xl p-8 md:p-12 shadow-2xl relative"
              >
                <button 
                  onClick={() => setIsFormOpen(false)}
                  className="absolute top-6 right-6 w-10 h-10 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-full flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
                <h3 className="text-3xl font-black text-white mb-2">Project Details</h3>
                <p className="text-gray-400 mb-8">Tell us what you need, and we'll build it.</p>
                
                <form onSubmit={handleProjectSubmit} className="flex flex-col gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Your Name / Company</label>
                    <input 
                      required
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Project Requirements</label>
                    <textarea 
                      required
                      rows={4}
                      value={formData.needs}
                      onChange={(e) => setFormData({...formData, needs: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                      placeholder="I need a mobile app for..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Estimated Budget (Optional)</label>
                    <input 
                      type="text" 
                      value={formData.budget}
                      onChange={(e) => setFormData({...formData, budget: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                      placeholder="e.g. $5k - $10k"
                    />
                  </div>
                  <button type="submit" className="mt-4 w-full py-4 bg-purple-600 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:bg-purple-700 transition-colors text-lg">
                    Send via WhatsApp
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </PageTransition>
  );
};

export default Services;
