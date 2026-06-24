import { useRef, useState, useEffect } from 'react';
import { ArrowRight, Building2, GraduationCap, Zap, Users, ArrowUpRight, Megaphone, CalendarCheck, Lightbulb, TrendingUp } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { supabase } from '../lib/supabase';

gsap.registerPlugin(ScrollTrigger);

const Collaborations = () => {
  const containerRef = useRef(null);
  const [partners, setPartners] = useState([]);

  useEffect(() => {
    const fetchPartners = async () => {
      const { data, error } = await supabase
        .from('partnered_companies')
        .select('*')
        .order('created_at', { ascending: true });
      if (!error && data) {
        setPartners(data);
      }
    };
    fetchPartners();
  }, []);
  
  useGSAP(() => {
    const tl = gsap.timeline();
    tl.from('.hero-badge', { y: 20, opacity: 0, duration: 0.6, ease: 'power3.out' })
      .from('.hero-title', { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.4')
      .from('.hero-desc', { y: 20, opacity: 0, duration: 0.6, ease: 'power3.out' }, '-=0.6')
      .from('.hero-stat', { y: 20, opacity: 0, duration: 0.6, stagger: 0.15, ease: 'back.out(1.5)' }, '-=0.4');

    const mapTl = gsap.timeline({
      scrollTrigger: { trigger: '.node-map-section', start: 'top 60%' }
    });

    mapTl.from('.center-node', { scale: 0, opacity: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)' })
         .from('.orbit-svg-path', { opacity: 0, duration: 1, ease: 'power2.out', stagger: 0.1 }, '-=0.4')
         .from('.wyntrix-node', { scale: 0, opacity: 0, duration: 0.6, ease: 'back.out(1.5)', stagger: 0.1 }, '-=0.6');

    gsap.from('.why-card', {
      scrollTrigger: { trigger: '.why-section', start: 'top 75%' },
      y: 50, opacity: 0, duration: 0.8, stagger: 0.2, ease: 'power3.out'
    });
  }, { scope: containerRef });

  return (
    <PageTransition>
      <div ref={containerRef} className="min-h-screen bg-[#F9F9F7] selection:bg-purple-500/30 font-sans">
        
        {/* Section 1: Hero (Wyntrix Style) */}
        <section className="relative overflow-hidden border-b-2 border-gray-900 bg-white pt-24">
          <div className="absolute top-0 left-0 right-0 h-2 bg-amber-500 w-full z-10 mt-16 lg:mt-20"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-28 mt-4">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10 lg:gap-16">
              <div className="flex-1">
                <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-amber-400 border-2 border-gray-900 rounded-full mb-6 shadow-[3px_3px_0px_#1f1f1f]">
                  <Zap className="text-gray-900 w-4 h-4" />
                  <span className="text-gray-900 font-bold text-xs sm:text-sm tracking-wide uppercase">Partnerships & Collaborations</span>
                </div>
                <h1 className="hero-title text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-gray-900 leading-[1.0] mb-4">
                  Collab with <span className="relative inline-block"><span className="relative z-10 italic font-serif text-white px-4 py-1 bg-purple-600 rounded-sm">DAKH</span></span>
                </h1>
                <p className="hero-desc text-gray-600 text-base sm:text-lg lg:text-xl max-w-xl mt-6 leading-relaxed font-medium">
                  We partner with brands, institutions, and organizations that share our vision of empowering the student community.
                </p>
              </div>
              <div className="flex flex-row lg:flex-col gap-4">
                <div className="hero-stat flex-1 lg:flex-none bg-white border-2 border-gray-900 rounded-2xl px-5 py-4 shadow-[4px_4px_0px_#1f1f1f] text-center lg:text-left min-w-[110px]">
                  <div className="text-2xl sm:text-3xl font-black text-purple-600">50+</div>
                  <div className="text-gray-500 text-xs sm:text-sm font-bold mt-0.5 uppercase tracking-tight">Partners</div>
                </div>
                <div className="hero-stat flex-1 lg:flex-none bg-white border-2 border-gray-900 rounded-2xl px-5 py-4 shadow-[4px_4px_0px_#1f1f1f] text-center lg:text-left min-w-[110px]">
                  <div className="text-2xl sm:text-3xl font-black text-amber-500">15K+</div>
                  <div className="text-gray-500 text-xs sm:text-sm font-bold mt-0.5 uppercase tracking-tight">Reach</div>
                </div>
                <div className="hero-stat flex-1 lg:flex-none bg-white border-2 border-gray-900 rounded-2xl px-5 py-4 shadow-[4px_4px_0px_#1f1f1f] text-center lg:text-left min-w-[110px]">
                  <div className="text-2xl sm:text-3xl font-black text-purple-600">All Over</div>
                  <div className="text-gray-500 text-xs sm:text-sm font-bold mt-0.5 uppercase tracking-tight">India</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Glassmorphic Partner Categories */}
        <section className="relative py-24 bg-[#F9F9F7] border-b-2 border-gray-900 overflow-hidden">
          {/* Decorative glowing gradient orbs for glassmorphism refraction */}
          <div className="absolute top-1/4 left-[10%] w-96 h-96 bg-purple-400 rounded-full blur-[120px] opacity-25 pointer-events-none"></div>
          <div className="absolute bottom-1/4 right-[10%] w-96 h-96 bg-amber-300 rounded-full blur-[120px] opacity-25 pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <p className="text-xs font-bold uppercase tracking-widest text-purple-600 mb-2">Our network</p>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-[1.05]">
                Our <span className="italic font-serif text-purple-600">Partners</span>
              </h2>
              <p className="text-gray-500 text-base mt-4 max-w-xl mx-auto font-medium">
                Collaborating with leading institutions and companies to empower future builders.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "Educational Institution",
                  desc: "Partnering with top universities to build campus developer nodes and integrate industry workshops.",
                  icon: <GraduationCap className="w-8 h-8 text-purple-600" />,
                  tag: "Academic"
                },
                {
                  title: "Technology Partner",
                  desc: "Collaborating on developer tools, cloud infrastructure, and co-hosting hackathons.",
                  icon: <Building2 className="w-8 h-8 text-blue-500" />,
                  tag: "Infrastructure"
                },
                {
                  title: "Tech Company",
                  desc: "Providing students with real internship projects and direct mentoring from industry engineering teams.",
                  icon: <Zap className="w-8 h-8 text-amber-500" />,
                  tag: "Industry"
                },
                {
                  title: "Media Partner",
                  desc: "Amplifying ecosystem events, tech newsletters, and storytelling for student achievements.",
                  icon: <Megaphone className="w-8 h-8 text-pink-500" />,
                  tag: "Outreach"
                },
                {
                  title: "Startup Incubator",
                  desc: "Helping student founders turn capstone projects into funded startups with incubation programs.",
                  icon: <Lightbulb className="w-8 h-8 text-emerald-500" />,
                  tag: "Incubation"
                },
                {
                  title: "Event Organizer",
                  desc: "Co-organizing tech symposiums, developer meetups, and offline design bootcamps.",
                  icon: <CalendarCheck className="w-8 h-8 text-indigo-500" />,
                  tag: "Events"
                }
              ].map((partner, index) => (
                <div key={index} className="group relative bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] hover:shadow-[0_20px_40px_0_rgba(147,51,234,0.15)] hover:border-purple-300 rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2 flex flex-col justify-between overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/60 to-transparent pointer-events-none rounded-t-3xl"></div>
                  
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      {partner.icon}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100/50">
                      {partner.tag}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900 mt-4 mb-3">{partner.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{partner.desc}</p>
                  </div>
                </div>
              ))}

              {/* Special CTA Card */}
              <a 
                href="https://wa.me/918667399460" 
                target="_blank" 
                rel="noreferrer"
                className="group relative bg-gradient-to-br from-purple-600 to-indigo-650 backdrop-blur-xl border border-purple-500/30 shadow-[0_8px_32px_0_rgba(147,51,234,0.15)] hover:shadow-[0_20px_40px_0_rgba(147,51,234,0.25)] rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2 flex flex-col justify-between text-white"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/25 flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <ArrowUpRight className="w-8 h-8 text-amber-300" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
                    Join Us
                  </span>
                  <h3 className="text-2xl font-black mt-4 mb-3">Your Brand</h3>
                  <p className="text-purple-100 text-sm leading-relaxed">
                    Partner with DAKH to launch co-branded events, source elite student talent, or power your next developer campaign.
                  </p>
                </div>
                <div className="mt-8 flex items-center gap-2 font-bold text-amber-300 text-sm group-hover:translate-x-1 transition-transform">
                  Partner with us <ArrowRight className="w-4 h-4" />
                </div>
              </a>
            </div>
          </div>
        </section>

        {/* Section 2.5: Actual Partnered Companies */}
        <section className="py-20 bg-white border-b-2 border-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-2">Trusted by</p>
              <h2 className="text-4xl sm:text-5xl font-black text-gray-900 leading-[1.05]">
                Our <span className="italic font-serif text-purple-600">Partnered Companies</span>
              </h2>
              <p className="text-gray-500 text-base mt-4 max-w-xl mx-auto font-medium">
                Organizations we actively collaborate with to build opportunities for students.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {partners.length === 0 ? (
                <div className="col-span-1 sm:col-span-2 lg:col-span-4 p-8 text-center bg-gray-50 rounded-xl text-gray-500 font-medium border border-gray-100">
                  Loading partners...
                </div>
              ) : (
                partners.map((p) => {
                  const getCategoryStyles = (category) => {
                    switch (category) {
                      case 'Community': return { color: "from-teal-50 to-emerald-50", border: "hover:border-teal-300", tagColor: "text-teal-700 bg-teal-50 border-teal-200" };
                      case 'Placement': return { color: "from-red-50 to-orange-50", border: "hover:border-red-300", tagColor: "text-red-700 bg-red-50 border-red-200" };
                      case 'EdTech': return { color: "from-purple-50 to-violet-50", border: "hover:border-purple-300", tagColor: "text-purple-700 bg-purple-50 border-purple-200" };
                      case 'Internship Partner': return { color: "from-blue-50 to-cyan-50", border: "hover:border-blue-300", tagColor: "text-blue-700 bg-blue-50 border-blue-200" };
                      case 'Tech Partner':
                      default: return { color: "from-gray-50 to-slate-50", border: "hover:border-gray-400", tagColor: "text-gray-700 bg-gray-100 border-gray-200" };
                    }
                  };
                  const styles = getCategoryStyles(p.category);

                  return (
                    <div
                      key={p.id}
                      className={`group relative bg-gradient-to-br ${styles.color} border-2 border-gray-100 ${styles.border} rounded-3xl p-7 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl flex flex-col gap-4 overflow-hidden`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-transparent pointer-events-none rounded-3xl"></div>
                      <div className="relative w-full h-24 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center overflow-hidden group-hover:shadow-md transition-shadow">
                        <img
                          src={p.logo_url}
                          alt={`${p.name} logo`}
                          className="max-h-16 max-w-[80%] object-contain"
                        />
                      </div>
                      <div className="relative">
                        <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border mb-2 ${styles.tagColor}`}>
                          {p.category}
                        </span>
                        <h3 className="font-black text-gray-900 text-lg leading-tight mb-2">{p.name}</h3>
                        <p className="text-gray-500 text-sm leading-relaxed">{p.description}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>

        {/* Section 3: Why Collaborate (Wyntrix Style Dark Grid) */}
        <section className="why-section py-14 sm:py-20 bg-gray-900 border-b-2 border-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10 sm:mb-14">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">Why partner with us</p>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.05]">
                Why <span className="italic font-serif text-amber-400">Collaborate?</span>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div className="why-card flex gap-4 sm:gap-5 bg-white/5 border-2 border-white/10 rounded-2xl p-6 sm:p-7 hover:bg-white/10 transition-colors">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-600 border-2 border-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="text-white w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-white mb-1">Community Reach</h3>
                  <p className="text-white/65 text-sm sm:text-base leading-relaxed">Access to 15,000+ active student community members across 50+ campuses.</p>
                </div>
              </div>

              <div className="why-card flex gap-4 sm:gap-5 bg-white/5 border-2 border-white/10 rounded-2xl p-6 sm:p-7 hover:bg-white/10 transition-colors">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-amber-400 border-2 border-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CalendarCheck className="text-gray-900 w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-white mb-1">Event Exposure</h3>
                  <p className="text-white/65 text-sm sm:text-base leading-relaxed">Your brand featured across our events, workshops, and community gatherings.</p>
                </div>
              </div>

              <div className="why-card flex gap-4 sm:gap-5 bg-white/5 border-2 border-white/10 rounded-2xl p-6 sm:p-7 hover:bg-white/10 transition-colors">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-900 border-2 border-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="text-amber-400 w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-white mb-1">Co-Creation</h3>
                  <p className="text-white/65 text-sm sm:text-base leading-relaxed">Build products, campaigns, and experiences together with our creative team.</p>
                </div>
              </div>

              <div className="why-card flex gap-4 sm:gap-5 bg-white/5 border-2 border-white/10 rounded-2xl p-6 sm:p-7 hover:bg-white/10 transition-colors">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-600 border-2 border-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Megaphone className="text-white w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-white mb-1">Brand Building</h3>
                  <p className="text-white/65 text-sm sm:text-base leading-relaxed">Strengthen your brand presence among the next generation of innovators.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Bottom CTA (Wyntrix Style Solid Yellow/Amber Block) */}
        <section className="py-12 sm:py-16 bg-amber-400 border-b-2 border-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <p className="text-gray-800 text-xs font-bold uppercase tracking-widest mb-2">Let's build together</p>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 leading-tight">
                  Ready to <span className="italic font-serif text-purple-700">Collaborate?</span>
                </h3>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                <a href="https://wa.me/918667399460" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-3 px-8 sm:px-10 py-4 sm:py-5 bg-gray-900 border-2 border-gray-900 text-white rounded-xl font-black text-base sm:text-lg shadow-[5px_5px_0px_rgba(0,0,0,0.3)] hover:shadow-[2px_2px_0px_rgba(0,0,0,0.3)] hover:translate-x-0.5 hover:translate-y-0.5 active:shadow-none active:translate-x-1 active:translate-y-1 transition-all group">
                  Get in Touch <ArrowRight className="group-hover:translate-x-1 transition-transform w-5 h-5" />
                </a>
                <a href="/services" className="inline-flex items-center justify-center gap-3 px-8 sm:px-10 py-4 sm:py-5 bg-white border-2 border-gray-900 text-gray-900 rounded-xl font-black text-base sm:text-lg shadow-[5px_5px_0px_rgba(0,0,0,0.3)] hover:shadow-[2px_2px_0px_rgba(0,0,0,0.3)] hover:translate-x-0.5 hover:translate-y-0.5 active:shadow-none active:translate-x-1 active:translate-y-1 transition-all">
                  View Services
                </a>
              </div>
            </div>
          </div>
        </section>

      </div>
    </PageTransition>
  );
};

export default Collaborations;
