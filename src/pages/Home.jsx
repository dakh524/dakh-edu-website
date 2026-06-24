import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import ScrollReveal from '../components/ScrollReveal';
import MagneticButton from '../components/MagneticButton';
import TextReveal from '../components/TextReveal';
import GSAPCounter from '../components/GSAPCounter';

const WORDS = ["The Future", "Innovations", "Careers", "Leaders", "Impact"];

const COLLEGES = [
  // Chennai Region & Tamil Nadu
  { name: "Sri Sairam Engg College", region: "Chennai, TN", logo: "https://sairam.edu.in/wp-content/uploads/2023/10/sairam-sec-logo.png" },
  { name: "Panimalar Engg College", region: "Chennai, TN", logo: "https://panimalar.ac.in/assets/images/pec-logo.png" },
  { name: "Chennai Inst of Tech", region: "Chennai, TN", logo: "https://www.citchennai.edu.in/images/dynamic/logos/01.svg" },
  { name: "Rajalakshmi Engg College", region: "Chennai, TN", logo: "https://logo.clearbit.com/rajalakshmi.org" },
  { name: "Easwari Engg College", region: "Chennai, TN", logo: "https://srmeaswari.ac.in/wp-content/uploads/2022/12/cropped-headerlogo_blafavck-1.png" },
  { name: "Hindustan University", region: "Chennai, TN", logo: "https://hindustanuniv.ac.in/assets/image/new-logo.svg" },
  { name: "VIT Vellore", region: "Tamil Nadu", logo: "https://logo.clearbit.com/vit.ac.in" },
  { name: "SRM University", region: "Tamil Nadu", logo: "https://logo.clearbit.com/srmist.edu.in" },
  { name: "Anna University", region: "Tamil Nadu", logo: "https://logo.clearbit.com/annauniv.edu" },
  
  // Puducherry
  { name: "Pondicherry Univ", region: "Puducherry", logo: "https://logo.clearbit.com/pondiuni.edu.in" },
  
  // Kerala
  { name: "NIT Calicut", region: "Kerala", logo: "https://logo.clearbit.com/nitc.ac.in" },
  
  // Karnataka
  { name: "IISc Bangalore", region: "Karnataka", logo: "https://logo.clearbit.com/iisc.ac.in" },
  
  // North India
  { name: "IIT Delhi", region: "North India", logo: "https://logo.clearbit.com/iitd.ac.in" },
  { name: "BITS Pilani", region: "North India", logo: "https://logo.clearbit.com/bits-pilani.ac.in" }
];

const SPARKLES = [
  { top: '15%', left: '20%', delay: 0 },
  { top: '25%', right: '15%', delay: 0.5 },
  { top: '65%', left: '10%', delay: 1 },
  { top: '75%', right: '25%', delay: 1.5 },
  { top: '45%', left: '80%', delay: 2 },
  { top: '85%', left: '40%', delay: 2.5 },
];

const CollegeLogo = ({ college }) => {
  const [error, setError] = useState(false);
  const initials = college.name
    .split(' ')
    .map(word => word[0])
    .join('')
    .substring(0, 3)
    .toUpperCase();

  return (
    <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center p-1 border border-purple-100/50 overflow-hidden flex-shrink-0">
      {!error ? (
        <img 
          src={college.logo} 
          alt={`${college.name} Logo`} 
          className="max-w-full max-h-full object-contain"
          onError={() => setError(true)}
        />
      ) : (
        <span className="text-xs font-black text-purple-600 tracking-wider">{initials}</span>
      )}
    </div>
  );
};

const Home = () => {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % WORDS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <PageTransition>



      <section className="relative min-h-[100svh] flex items-center justify-center pt-20 pb-16 px-6 lg:px-8 overflow-hidden bg-white border-b border-gray-200">
        {/* Background Video with Premium Overlay */}
        <div className="absolute inset-0 z-0 bg-white">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-full object-cover opacity-40"
          >
            <source src="/hero-bg.mp4" type="video/mp4" />
          </video>
          {/* Light gradient overlays to blend into the white page beautifully */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/20 to-white"></div>
        </div>

        {/* Background Meshes & Orbs */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-brand-primary)] rounded-full blur-[150px] opacity-40 hero-mesh-1"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--color-brand-secondary)] rounded-full blur-[150px] opacity-40 hero-mesh-2"></div>
          
          {/* Floating Shapes */}
          <div className="absolute top-[20%] right-[15%] w-24 h-24 border-2 border-[var(--color-brand-primary)] rounded-full hero-float-a opacity-20"></div>
          <div className="absolute bottom-[30%] left-[10%] w-16 h-16 border-2 border-[var(--color-brand-secondary)] rounded-full hero-float-b opacity-30"></div>
          <div className="absolute top-[40%] left-[20%] w-3 h-3 bg-[var(--color-brand-primary)] rounded-full hero-float-c opacity-60"></div>
        </div>

        {/* Sparkles (Animation 1) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <span className="absolute top-[20%] left-[25%] text-[var(--color-brand-secondary)] text-xl sparkle-1">✦</span>
          <span className="absolute top-[35%] right-[20%] text-[var(--color-brand-primary)] text-sm sparkle-2">✦</span>
          <span className="absolute bottom-[30%] left-[30%] text-[var(--color-brand-energy)] text-lg sparkle-3">✦</span>
          <span className="absolute top-[15%] right-[35%] text-[var(--color-brand-secondary)] text-2xl sparkle-4">✦</span>
          <span className="absolute bottom-[20%] right-[25%] text-[var(--color-brand-primary)] text-sm sparkle-5">✦</span>
          <span className="absolute top-[50%] left-[10%] text-purple-300 text-[10px] sparkle-6">●</span>
          <span className="absolute bottom-[40%] right-[10%] text-purple-300 text-[10px] sparkle-2">●</span>
        </div>

        <div className="max-w-5xl mx-auto w-full relative z-10 text-center flex flex-col items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center w-full flex flex-col items-center"
          >
            <div className="inline-flex w-fit mx-auto items-center gap-2 bg-black/5 border border-black/10 rounded-full px-4 py-2 shadow-sm mb-6 backdrop-blur-md">
              <span className="w-2 h-2 bg-[var(--color-brand-secondary)] rounded-full animate-pulse"></span>
              <span className="text-sm sm:text-base font-semibold tracking-wide text-gray-700">Building Digital Excellence</span>
            </div>

            <div className="mb-8 w-full">
              <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-gray-900 leading-none tracking-tight mb-6 relative z-10">
                <div className="flex flex-col items-center justify-center gap-y-0 sm:gap-y-1">
                  <span className="block leading-none">We Build</span>
                  <span className="text-[var(--color-brand-primary)] relative inline-flex justify-center items-center h-[1em] w-full leading-none">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={wordIndex}
                        initial={{ y: 15, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -15, opacity: 0 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        className="absolute text-center w-full whitespace-nowrap drop-shadow-[0_0_20px_rgba(147,51,234,0.3)]"
                      >
                        {WORDS[wordIndex]}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                </div>
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-2xl mx-auto font-medium mt-4">
                Internships, Software Agency, and a Community of Elite Future Builders.
              </p>
            </div>
            
            {/* Quick Stats Blocks */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-3xl mx-auto mb-10">
              <div className="flex-1 py-4 bg-white/60 border border-[rgba(147,51,234,0.2)] rounded-2xl shadow-sm hover:border-[var(--color-brand-primary)] hover:bg-white transition-all duration-300 text-center backdrop-blur-sm">
                <div className="text-2xl sm:text-3xl font-black text-[var(--color-brand-primary)]">500+</div>
                <div className="text-xs sm:text-sm text-gray-500 font-semibold uppercase tracking-wider mt-1">Students</div>
              </div>
              <div className="flex-1 py-4 bg-white/60 border border-[rgba(250,204,21,0.3)] rounded-2xl shadow-sm hover:border-[var(--color-brand-secondary)] hover:bg-white transition-all duration-300 text-center backdrop-blur-sm">
                <div className="text-2xl sm:text-3xl font-black text-[var(--color-brand-secondary)]">10+</div>
                <div className="text-xs sm:text-sm text-gray-500 font-semibold uppercase tracking-wider mt-1">Domains</div>
              </div>
              <div className="flex-1 py-4 bg-white/60 border border-[rgba(147,51,234,0.2)] rounded-2xl shadow-sm hover:border-[var(--color-brand-primary)] hover:bg-white transition-all duration-300 text-center backdrop-blur-sm">
                <div className="text-2xl sm:text-3xl font-black text-[var(--color-brand-primary)]">20+</div>
                <div className="text-xs sm:text-sm text-gray-500 font-semibold uppercase tracking-wider mt-1">Projects</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full">
              <MagneticButton>
                <a href="/services" className="group inline-flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 bg-gradient-primary text-white rounded-full font-bold border border-[var(--color-brand-primary)] hover:shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all duration-300 text-lg cursor-pointer active:scale-95 hover:scale-105">
                  Explore Services
                  <span className="w-8 h-8 bg-white rounded-full flex items-center justify-center group-hover:rotate-45 transition-transform duration-500">
                    <ChevronRight className="text-[var(--color-brand-primary)] text-sm" />
                  </span>
                </a>
              </MagneticButton>
              <MagneticButton>
                <a href="/internship" className="group inline-flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 border border-gray-300 bg-white/50 text-gray-700 rounded-full font-bold hover:bg-white hover:text-gray-900 transition-all duration-300 text-lg block shadow-sm">
                  Join Internship
                </a>
              </MagneticButton>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Trusted By Marquee (Wyntrix Style) */}
      <section className="bg-[var(--color-brand-bg)] py-12 overflow-hidden border-y border-[rgba(0,0,0,0.05)]">
        <div className="text-center mb-8">
          <h3 className="text-2xl lg:text-3xl font-bold text-gray-900">Trusted by students from <span className="italic font-serif text-[var(--color-brand-primary)]">top colleges</span></h3>
        </div>
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[var(--color-brand-bg)] to-transparent z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[var(--color-brand-bg)] to-transparent z-10"></div>
          
          <div className="animate-marquee flex w-max gap-6">
            {[...Array(2)].map((_, index) => (
              <div key={index} className="flex gap-6">
                {COLLEGES.map((college, i) => (
                  <div key={`${index}-${i}`} className="w-56 h-24 rounded-2xl border border-gray-200 bg-white flex items-center gap-4 p-4 hover:border-[var(--color-brand-primary)] hover:bg-purple-50/30 transition-all duration-300 hover:-translate-y-1 shadow-sm shrink-0">
                    <CollegeLogo college={college} />
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-gray-900 text-sm tracking-tight truncate">{college.name}</span>
                      <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full w-max mt-1 border border-purple-100/50">
                        {college.region}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Our Ecosystem / Features Section */}
      <section className="bg-gray-950 py-20 lg:py-32 relative overflow-hidden border-b border-gray-900">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <ScrollReveal className="text-center mb-16">
            <h2 className="text-sm font-bold tracking-widest text-[var(--color-brand-primary)] uppercase mb-3 animate-pulse">
              DAKH Ecosystem
            </h2>
            <p className="text-3xl sm:text-5xl font-black text-white leading-tight max-w-3xl mx-auto">
              We Build Solutions, Empower Builders, and Foster Growth
            </p>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Software Agency",
                desc: "We build top-tier, custom web apps, mobile apps, and robust software solutions for businesses worldwide, using cutting-edge stacks.",
                icon: "💻",
                tag: "High-Performance"
              },
              {
                title: "Interactive Internships",
                desc: "Giving students real industry workspace experience. Work on production-level codebases with mentoring from industry experts.",
                icon: "🚀",
                tag: "Career Accelerator"
              },
              {
                title: "Elite Community",
                desc: "Connecting passionate tech creators, programmers, and designers to learn, build, collaborate, and push technology boundaries.",
                icon: "👥",
                tag: "Active Learning"
              }
            ].map((item, idx) => (
              <ScrollReveal key={idx} delay={idx * 0.15}>
                <div className="group relative h-full bg-white/5 border border-white/10 hover:border-[var(--color-brand-primary)]/50 rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(147,51,234,0.15)] flex flex-col justify-between overflow-hidden">
                  <div className="absolute -inset-px bg-gradient-to-tr from-[var(--color-brand-primary)] to-[var(--color-brand-secondary)] rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
                  
                  <div>
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-3xl mb-6 border border-white/10 group-hover:scale-110 group-hover:border-[var(--color-brand-primary)]/50 transition-all duration-300">
                      {item.icon}
                    </div>
                    <span className="text-xs font-semibold tracking-wider text-[var(--color-brand-secondary)] uppercase bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                      {item.tag}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-white mt-4 mb-3">
                      {item.title}
                    </h3>
                    <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4. GSAP Stats Counter Section */}
      <section className="bg-gray-950 py-20 lg:py-28 relative overflow-hidden border-t border-b border-gray-900">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute -top-12 -left-12 w-64 h-64 bg-[var(--color-brand-secondary)] rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-[var(--color-brand-primary)] rounded-full blur-[100px] animate-pulse"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 text-center">
          <ScrollReveal className="mb-12">
            <h2 className="text-sm font-bold tracking-widest text-[var(--color-brand-secondary)] uppercase mb-3">
              Our Track Record
            </h2>
            <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
              Scaling Excellence, Number by Number
            </p>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 max-w-4xl mx-auto">
            {[
              { end: 500, suffix: "+", label: "Active Students" },
              { end: 10, suffix: "+", label: "Domains Covered" },
              { end: 20, suffix: "+", label: "Projects Delivered" }
            ].map((stat, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="p-8 bg-white/5 border border-white/10 hover:border-white/20 rounded-3xl backdrop-blur-md shadow-sm transition-all duration-300">
                  <div className="text-5xl lg:text-6xl font-black text-white mb-2 tracking-tight">
                    <GSAPCounter end={stat.end} suffix={stat.suffix} />
                  </div>
                  <div className="text-sm lg:text-base text-gray-400 font-semibold uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Company Milestone & Achievements Timeline */}
      <section className="bg-[var(--color-brand-bg)] py-20 lg:py-32 relative overflow-hidden border-t border-gray-100">
        <div className="absolute top-6 left-6 w-20 h-20 bg-[var(--color-brand-secondary)] rounded-full blur-3xl opacity-20 hidden lg:block"></div>
        <div className="absolute bottom-16 right-12 w-40 h-40 bg-[var(--color-brand-primary)] rounded-full blur-3xl opacity-20 hidden lg:block"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollReveal className="text-center mb-20">
            <p className="text-[var(--color-brand-primary)] mb-4 text-lg lg:text-2xl font-bold tracking-wide uppercase">Our Journey & Milestones</p>
            <TextReveal 
              text="Scaling digital excellence and empowering the next generation of builders." 
              className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.2] max-w-4xl mx-auto text-gray-900" 
            />
          </ScrollReveal>

          {/* Timeline Component */}
          <div className="relative max-w-4xl mx-auto mt-16">
            {/* Center line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 via-amber-400 to-purple-600 rounded-full opacity-35 hidden md:block"></div>
            
            <div className="space-y-16">
              {[
                {
                  year: "2024",
                  title: "Inception & First Node",
                  desc: "Founded with a mission to bridge the gap between academic learning and industry experience. Launched our very first campus node and laid down the core foundations.",
                  icon: "🌱",
                  align: "left"
                },
                {
                  year: "2025",
                  title: "Ecosystem Expansion",
                  desc: "Scaled our presence to 50+ top tier colleges across India, covering over 10 active domains with 500+ active student builders.",
                  icon: "🚀",
                  align: "right"
                },
                {
                  year: "2026",
                  title: "Digital & 3D Revolution",
                  desc: "Launched our production-grade software agency, delivering high-end custom software and immersive 3D/interactive web experiences for international clients.",
                  icon: "✨",
                  align: "left"
                }
              ].map((item, i) => (
                <ScrollReveal key={i} delay={i * 0.15}>
                  <div className={`flex flex-col md:flex-row items-center justify-between relative ${item.align === 'right' ? 'md:flex-row-reverse' : ''}`}>
                    {/* Circle marker on line */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-white border-4 border-purple-600 shadow-md z-20 hidden md:flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></div>
                    </div>
                    
                    {/* Content Block */}
                    <div className="w-full md:w-[45%] bg-white border border-gray-200 hover:border-purple-500/50 p-8 rounded-3xl shadow-sm hover:shadow-[0_10px_30px_rgba(147,51,234,0.08)] transition-all duration-300 relative group">
                      <div className="absolute -top-6 right-6 w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 text-white flex items-center justify-center text-xl shadow-md border border-white/20 group-hover:scale-110 transition-transform duration-300">
                        {item.icon}
                      </div>
                      
                      <span className="text-xs font-black tracking-widest text-purple-600 uppercase bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
                        {item.year}
                      </span>
                      
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-4 mb-3">
                        {item.title}
                      </h3>
                      
                      <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                    
                    {/* Empty spacer block to maintain symmetry on large screens */}
                    <div className="w-full md:w-[45%] hidden md:block"></div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

    </PageTransition>
  );
};

export default Home;
