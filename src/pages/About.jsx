import { useState } from 'react';
import { motion } from 'framer-motion';
import { Rocket, Target, Heart, ChevronDown, Briefcase, Zap, Globe, DollarSign } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import ScrollReveal from '../components/ScrollReveal';
import FreelancerModal from '../components/FreelancerModal';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 py-4">
      <button 
        className="w-full flex justify-between items-center text-left font-bold text-gray-900 text-lg hover:text-[var(--color-brand-primary)] transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {question}
        <ChevronDown className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        style={{ overflow: "hidden" }}
      >
        <p className="pt-4 text-[var(--color-brand-text-secondary)]">{answer}</p>
      </motion.div>
    </div>
  );
};

const FAQS = [
  { question: "Who can join DAKH?", answer: "Any college student with a passion for building can join. Whether you're into code, design, or marketing, there's a place for you." },
  { question: "Is the internship paid?", answer: "Our internships are project-based. Top performers on client projects receive stipends and profit-sharing." },
  { question: "How do I start a node at my campus?", answer: "Reach out via our contact page. We'll provide you with the roadmap, resources, and support to build a community." },
];

const About = () => {
  const [showModal, setShowModal] = useState(false);
  return (
    <PageTransition>
      <section className="pt-32 pb-20 px-6 lg:px-8 max-w-7xl mx-auto">
        <ScrollReveal className="text-center max-w-3xl mx-auto mb-20 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[var(--color-brand-primary)] rounded-full blur-[120px] opacity-10 pointer-events-none -z-10"></div>
          <h1 className="font-extrabold text-5xl md:text-7xl mb-6 text-gray-900">
            About <span className="text-gradient">DAKH</span>
          </h1>
          <p className="text-lg md:text-xl text-[var(--color-brand-text-secondary)] font-medium">
            We are a student-led initiative aiming to bridge the gap between academic learning and industry requirements through dimensional intelligence.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
          <ScrollReveal delay={0.1}>
            <div className="bg-white border border-gray-200 p-8 rounded-3xl h-full flex flex-col items-center text-center hover:border-[var(--color-brand-primary)] hover:shadow-md transition-all shadow-sm">
              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-6">
                <Target size={32} />
              </div>
              <h3 className="font-bold text-2xl mb-4 text-gray-900">Our Mission</h3>
              <p className="text-[var(--color-brand-text-secondary)]">
                To equip college students with production-level skills by having them build real-world products in a structured agency environment.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="bg-white border border-gray-200 p-8 rounded-3xl h-full flex flex-col items-center text-center hover:border-[var(--color-brand-primary)] hover:shadow-md transition-all shadow-sm">
              <div className="w-16 h-16 bg-yellow-50 text-[var(--color-brand-secondary)] rounded-2xl flex items-center justify-center mb-6">
                <Rocket size={32} />
              </div>
              <h3 className="font-bold text-2xl mb-4 text-gray-900">Our Vision</h3>
              <p className="text-[var(--color-brand-text-secondary)]">
                To become the largest student-driven tech ecosystem in India, where every campus has a node of DAKH builders.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <div className="bg-white border border-gray-200 p-8 rounded-3xl h-full flex flex-col items-center text-center hover:border-[var(--color-brand-primary)] hover:shadow-md transition-all shadow-sm">
              <div className="w-16 h-16 bg-pink-50 text-pink-500 rounded-2xl flex items-center justify-center mb-6">
                <Heart size={32} />
              </div>
              <h3 className="font-bold text-2xl mb-4 text-gray-900">Our Values</h3>
              <p className="text-[var(--color-brand-text-secondary)]">
                Learn aggressively, build fearlessly, and share openly. We believe in open-source collaboration and community-first growth.
              </p>
            </div>
          </ScrollReveal>
        </div>

        {/* Animation 14: FAQ Accordion */}
        <div className="max-w-3xl mx-auto mb-20">
          <ScrollReveal>
            <h2 className="font-extrabold text-4xl mb-8 text-center text-gray-900">Frequently Asked Questions</h2>
          </ScrollReveal>
          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
            {FAQS.map((faq, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <FAQItem question={faq.question} answer={faq.answer} />
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* Join as a Freelancer */}
        <ScrollReveal>
          <div className="relative overflow-hidden rounded-3xl mb-20">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-violet-700 to-indigo-800"></div>
            {/* Decorative blobs */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-yellow-400/20 rounded-full blur-[80px]"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-pink-400/20 rounded-full blur-[80px]"></div>
            {/* Glass overlay */}
            <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]"></div>

            <div className="relative z-10 px-8 py-16 md:px-16 md:py-20 flex flex-col md:flex-row items-center gap-12">
              {/* Left: Text */}
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-yellow-300 text-sm font-semibold mb-6">
                  <Zap size={14} />
                  Now Open
                </div>
                <h2 className="font-extrabold text-4xl md:text-5xl text-white mb-4 leading-tight">
                  Join as a <span className="text-yellow-300">Freelancer</span>
                </h2>
                <p className="text-white/75 text-lg mb-8 max-w-lg">
                  Work on real client projects, earn while you learn, and build a portfolio that speaks for itself — all as a student.
                </p>

                {/* Perks */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                  {[
                    { icon: DollarSign, label: 'Earn per Project', desc: 'Get paid for every completed milestone' },
                    { icon: Globe, label: 'Remote First', desc: 'Work from anywhere, anytime' },
                    { icon: Briefcase, label: 'Build Portfolio', desc: 'Real projects, real clients, real impact' },
                  ].map(({ icon: Icon, label, desc }) => (
                    <div key={label} className="bg-white/10 border border-white/15 rounded-2xl p-4 backdrop-blur-sm hover:bg-white/15 transition-colors">
                      <div className="w-9 h-9 bg-yellow-300/20 rounded-xl flex items-center justify-center mb-3">
                        <Icon size={18} className="text-yellow-300" />
                      </div>
                      <p className="text-white font-bold text-sm">{label}</p>
                      <p className="text-white/60 text-xs mt-1">{desc}</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setShowModal(true)}
                  className="inline-flex items-center gap-2 bg-yellow-300 hover:bg-yellow-200 text-gray-900 font-black px-8 py-3.5 rounded-full text-base transition-all duration-200 hover:shadow-[0_0_30px_rgba(250,204,21,0.4)] active:scale-95"
                >
                  Apply Now
                  <Zap size={16} />
                </button>
              </div>

              {/* Right: Floating badge */}
              <div className="flex-shrink-0 flex flex-col items-center gap-4">
                <div className="w-40 h-40 rounded-full bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm">
                  <div className="text-center">
                    <p className="text-yellow-300 font-black text-4xl">∞</p>
                    <p className="text-white/80 text-xs font-semibold mt-1">Opportunities</p>
                  </div>
                </div>
                <div className="bg-white/10 border border-white/20 rounded-2xl px-6 py-3 text-center">
                  <p className="text-white font-bold text-sm">Students from</p>
                  <p className="text-yellow-300 font-black text-xl">50+ Colleges</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>
      <FreelancerModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </PageTransition>
  );
};

export default About;
