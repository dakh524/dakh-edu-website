import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, Loader2, User, BookOpen, Briefcase, Zap, ClipboardList, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

const SKILLS = [
  'Web Development', 'App Development', 'UI/UX Design',
  'Graphic Design', 'Content Writing', 'Video Editing',
  'Digital Marketing', 'SEO', 'Data Analysis',
  'Machine Learning / AI', 'Cybersecurity', 'Photography',
  '3D Animation / Modeling', 'Blockchain / Web3', 'Other'
];

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Final Year', 'Graduate'];
const AVAILABILITY = ['Part-time (Weekends)', 'Part-time (Evenings)', 'Full-time', 'Project-based'];
const EXPERIENCE = ['Beginner (0-6 months)', 'Intermediate (6m-2yrs)', 'Advanced (2+ years)'];

const STEPS = [
  { id: 1, label: 'Personal Info', icon: User },
  { id: 2, label: 'Education', icon: BookOpen },
  { id: 3, label: 'Skills & Work', icon: Briefcase },
  { id: 4, label: 'Final Details', icon: Zap },
];

const InputField = ({ label, required, children }) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">
      {label} {required && <span className="text-purple-500">*</span>}
    </label>
    {children}
  </div>
);

const inputClass = "w-full px-5 py-4 rounded-xl border border-gray-200 bg-white shadow-sm text-gray-900 text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-300";

const ApplyFreelancer = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    city: '',
    college_name: '',
    year_of_study: '',
    department: '',
    skills: [],
    other_skills: '',
    experience_level: '',
    portfolio_url: '',
    linkedin_url: '',
    github_url: '',
    availability: '',
    bio: '',
    why_dakh: '',
  });

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const toggleSkill = (skill) => {
    setForm(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const validateStep = () => {
    if (step === 1) {
      if (!form.full_name.trim()) return 'Full name is required.';
      if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Valid email is required.';
      if (!form.phone.trim()) return 'Phone number is required.';
    }
    if (step === 2) {
      if (!form.college_name.trim()) return 'College name is required.';
      if (!form.year_of_study) return 'Year of study is required.';
      if (!form.department.trim()) return 'Department is required.';
    }
    if (step === 3) {
      if (form.skills.length === 0) return 'Select at least one skill.';
      if (form.skills.includes('Other') && !form.other_skills.trim()) return 'Please specify your other skills.';
      if (!form.experience_level) return 'Experience level is required.';
      if (!form.availability) return 'Availability is required.';
      if (!form.linkedin_url.trim()) return 'LinkedIn URL is required.';
    }
    if (step === 4) {
      if (!form.bio.trim()) return 'Tell us a bit about yourself.';
      if (!form.why_dakh.trim()) return 'Tell us why you want to join DAKH.';
    }
    return '';
  };

  const next = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(s => s + 1);
  };

  const back = () => { 
    setError(''); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(s => s - 1); 
  };

  const handleSubmit = async () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError('');
    setLoading(true);
    try {
      const { error: supaErr } = await supabase
        .from('freelancer_applications')
        .insert([{
          full_name: form.full_name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
          city: form.city.trim(),
          college_name: form.college_name.trim(),
          year_of_study: form.year_of_study,
          department: form.department.trim(),
          skills: form.skills.includes('Other') && form.other_skills.trim() 
                  ? [...form.skills.filter(s => s !== 'Other'), form.other_skills.trim()] 
                  : form.skills.filter(s => s !== 'Other'),
          experience_level: form.experience_level,
          portfolio_url: form.portfolio_url.trim() || null,
          linkedin_url: form.linkedin_url.trim() || null,
          github_url: form.github_url.trim() || null,
          availability: form.availability,
          bio: form.bio.trim(),
          why_dakh: form.why_dakh.trim(),
          applied_at: new Date().toISOString(),
          status: 'pending',
        }]);
      if (supaErr) throw supaErr;
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      setError('Submission failed. Please try again or contact us directly.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative overflow-x-hidden font-sans">
      
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-400/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none z-0"></div>
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-blue-400/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/3 pointer-events-none z-0"></div>

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-grow flex flex-col w-full relative z-10"
      >
        
        {/* Header */}
        <div className="relative bg-gradient-to-br from-purple-700 via-violet-800 to-indigo-900 px-6 py-12 md:px-12 md:py-16 flex-shrink-0 w-full shadow-2xl">
          <div className="max-w-4xl mx-auto w-full relative z-10">
            <div className="flex justify-between items-center mb-10">
              <Link to="/" className="inline-flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center font-black text-white text-2xl backdrop-blur-md border border-white/20 shadow-xl">D</div>
                <span className="font-black text-3xl tracking-tight text-white">DAKH</span>
              </Link>
            </div>
            
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-yellow-400/10 rounded-full blur-[80px] pointer-events-none"></div>
            
            <p className="text-yellow-400 text-sm font-black uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
              <Zap size={16} /> Freelancer Program
            </p>
            <h2 className="text-white font-black text-4xl md:text-6xl mb-3 tracking-tight">Apply as a Freelancer</h2>
            <p className="text-white/70 text-lg md:text-xl font-medium">Join the largest student-driven tech ecosystem.</p>

            {/* Progress Container */}
            <div className="mt-12 bg-white/5 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-white/10 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <p className="text-white font-bold text-lg">Step {step} of {STEPS.length}</p>
                <p className="text-yellow-400 font-bold">{Math.round((step / STEPS.length) * 100)}% Completed</p>
              </div>
              
              {/* Progress bar */}
              <div className="flex gap-2">
                {STEPS.map((s) => (
                  <div key={s.id} className={`h-2 flex-1 rounded-full transition-all duration-500 ${step >= s.id ? 'bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]' : 'bg-white/10'}`} />
                ))}
              </div>

              {/* Step indicators */}
              <div className="mt-6 flex justify-between">
                {STEPS.map(({ id, label, icon: Icon }) => (
                  <div key={id} className={`flex flex-col items-center sm:flex-row gap-3 text-sm font-bold transition-all ${step >= id ? 'text-yellow-400' : 'text-white/40'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${step > id ? 'bg-yellow-400 border-yellow-400 text-indigo-900 shadow-[0_0_20px_rgba(250,204,21,0.4)]' : step === id ? 'border-yellow-400 text-yellow-400 bg-yellow-400/10' : 'border-white/20 text-white/40 bg-white/5'}`}>
                      {step > id ? <Check size={18} strokeWidth={3} /> : <Icon size={18} />}
                    </div>
                    <span className="hidden md:inline tracking-wide">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col w-full bg-gray-50/50 backdrop-blur-3xl relative z-10">
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-32 px-8 text-center max-w-2xl mx-auto"
            >
              <div className="w-32 h-32 bg-green-500/10 rounded-full flex items-center justify-center mb-8 border-4 border-green-500/20">
                <Check size={64} className="text-green-500" />
              </div>
              <h3 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">Your data has been saved!</h3>
              <p className="text-gray-600 text-xl font-medium leading-relaxed mb-12">
                We will contact you when a client approaches, so be ready and stay connected.
              </p>
              <Link
                to="/"
                className="px-10 py-5 bg-gray-900 text-white font-black text-lg rounded-full hover:bg-purple-600 hover:shadow-[0_0_30px_rgba(147,51,234,0.4)] transition-all duration-300 transform hover:-translate-y-1"
              >
                Return to Homepage
              </Link>
            </motion.div>
          ) : (
            <div className="flex-grow max-w-4xl mx-auto w-full p-6 py-12 md:p-12 md:py-20">
              <AnimatePresence mode="wait">
                {/* STEP 1 — Personal Info */}
                {step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="md:col-span-2">
                      <InputField label="Full Name" required>
                        <input className={inputClass} placeholder="e.g. Arun Kumar" value={form.full_name} onChange={e => set('full_name', e.target.value)} />
                      </InputField>
                    </div>
                    <InputField label="Email Address" required>
                      <input className={inputClass} type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
                    </InputField>
                    <InputField label="Phone Number" required>
                      <input className={inputClass} type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={e => set('phone', e.target.value)} />
                    </InputField>
                    <div className="md:col-span-2">
                      <InputField label="City / Location">
                        <input className={inputClass} placeholder="e.g. Chennai, Tamil Nadu" value={form.city} onChange={e => set('city', e.target.value)} />
                      </InputField>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2 — Education */}
                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="md:col-span-2">
                      <InputField label="College / University" required>
                        <input className={inputClass} placeholder="e.g. Sri Sairam Engineering College" value={form.college_name} onChange={e => set('college_name', e.target.value)} />
                      </InputField>
                    </div>
                    <InputField label="Year of Study" required>
                      <select className={inputClass} value={form.year_of_study} onChange={e => set('year_of_study', e.target.value)}>
                        <option value="">Select year</option>
                        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </InputField>
                    <InputField label="Department / Branch" required>
                      <input className={inputClass} placeholder="e.g. Computer Science" value={form.department} onChange={e => set('department', e.target.value)} />
                    </InputField>
                  </motion.div>
                )}

                {/* STEP 3 — Skills & Work */}
                {step === 3 && (
                  <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="flex flex-col gap-10">
                    <InputField label="Your Skills" required>
                      <p className="text-sm text-gray-500 mb-4 font-medium">Select all that apply</p>
                      <div className="flex flex-wrap gap-3">
                        {SKILLS.map(skill => (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => toggleSkill(skill)}
                            className={`px-5 py-3 rounded-xl text-sm font-bold border-2 transition-all duration-200 ${
                              form.skills.includes(skill)
                                ? 'bg-purple-600 text-white border-purple-600 shadow-[0_5px_15px_rgba(147,51,234,0.3)] scale-105'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-purple-400 hover:bg-purple-50 hover:text-purple-700'
                            }`}
                          >
                            {skill}
                          </button>
                        ))}
                      </div>
                      {form.skills.includes('Other') && (
                        <div className="mt-4">
                          <input 
                            className={inputClass} 
                            placeholder="Please specify your other skills (e.g. Flutter, Blender, Copywriting)" 
                            value={form.other_skills} 
                            onChange={e => set('other_skills', e.target.value)} 
                          />
                        </div>
                      )}
                    </InputField>
                    <div className="grid md:grid-cols-2 gap-8">
                      <InputField label="Experience Level" required>
                        <select className={inputClass} value={form.experience_level} onChange={e => set('experience_level', e.target.value)}>
                          <option value="">Select level</option>
                          {EXPERIENCE.map(e => <option key={e} value={e}>{e}</option>)}
                        </select>
                      </InputField>
                      <InputField label="Availability" required>
                        <select className={inputClass} value={form.availability} onChange={e => set('availability', e.target.value)}>
                          <option value="">Select availability</option>
                          {AVAILABILITY.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                      </InputField>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                      <InputField label="Portfolio URL">
                        <input className={inputClass} placeholder="behance.net/..." value={form.portfolio_url} onChange={e => set('portfolio_url', e.target.value)} />
                      </InputField>
                      <InputField label="LinkedIn URL" required>
                        <input className={inputClass} placeholder="linkedin.com/in/..." value={form.linkedin_url} onChange={e => set('linkedin_url', e.target.value)} />
                      </InputField>
                      <InputField label="GitHub URL">
                        <input className={inputClass} placeholder="github.com/..." value={form.github_url} onChange={e => set('github_url', e.target.value)} />
                      </InputField>
                    </div>
                  </motion.div>
                )}

                {/* STEP 4 — Final Details */}
                {step === 4 && (
                  <motion.div key="step4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="flex flex-col gap-8">
                    <InputField label="Brief Introduction" required>
                      <textarea
                        className={`${inputClass} resize-none h-32`}
                        placeholder="Tell us who you are, what you do, and what you're passionate about..."
                        value={form.bio}
                        onChange={e => set('bio', e.target.value)}
                      />
                    </InputField>
                    <InputField label="Why do you want to join DAKH?" required>
                      <textarea
                        className={`${inputClass} resize-none h-32`}
                        placeholder="What excites you about working with DAKH? What do you hope to gain?"
                        value={form.why_dakh}
                        onChange={e => set('why_dakh', e.target.value)}
                      />
                    </InputField>
                    
                    {/* Summary preview */}
                    <div className="bg-purple-50/50 border-2 border-purple-100 rounded-3xl p-8 mt-4">
                      <p className="font-black text-purple-900 mb-6 flex items-center gap-3 text-xl"><ClipboardList size={24} className="text-purple-600" /> Application Summary</p>
                      <div className="grid md:grid-cols-2 gap-6 text-base">
                        <div>
                          <p className="text-purple-900/60 font-bold text-sm uppercase tracking-wider mb-1">Name</p>
                          <p className="font-bold text-gray-900">{form.full_name || '-'}</p>
                        </div>
                        <div>
                          <p className="text-purple-900/60 font-bold text-sm uppercase tracking-wider mb-1">College</p>
                          <p className="font-bold text-gray-900">{form.college_name || '-'} <span className="text-gray-500 font-medium">({form.year_of_study || '-'})</span></p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-purple-900/60 font-bold text-sm uppercase tracking-wider mb-1">Top Skills</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {form.skills.length > 0 ? form.skills.slice(0, 5).map(s => (
                              <span key={s} className="bg-white border border-purple-200 px-3 py-1 rounded-lg text-sm font-bold text-purple-800">{s}</span>
                            )) : '-'}
                            {form.skills.length > 5 && <span className="bg-purple-100 px-3 py-1 rounded-lg text-sm font-bold text-purple-800">+{form.skills.length - 5} more</span>}
                          </div>
                        </div>
                        <div>
                          <p className="text-purple-900/60 font-bold text-sm uppercase tracking-wider mb-1">Availability</p>
                          <p className="font-bold text-gray-900">{form.availability || '-'}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error message */}
              {error && (
                <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-base text-red-600 font-bold bg-red-50 border-2 border-red-200 rounded-2xl px-6 py-4 flex items-center gap-3">
                  <AlertCircle size={20} className="text-red-500 shrink-0" /> {error}
                </motion.p>
              )}
            </div>
          )}

          {/* Footer navigation */}
          {!submitted && (
            <div className="w-full bg-white border-t border-gray-200 py-6 px-6 md:px-12 mt-auto">
              <div className="max-w-4xl mx-auto flex justify-between items-center w-full">
                <button
                  onClick={back}
                  disabled={step === 1}
                  className="flex items-center gap-2 px-6 py-4 rounded-xl text-base font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={20} /> Back
                </button>
                
                {step < STEPS.length ? (
                  <button
                    onClick={next}
                    className="flex items-center gap-3 px-10 py-4 bg-gray-900 text-white text-base font-black rounded-xl hover:bg-purple-600 hover:shadow-[0_0_30px_rgba(147,51,234,0.3)] active:scale-95 transition-all duration-300"
                  >
                    Next Step <ChevronRight size={20} />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-base font-black rounded-xl hover:shadow-[0_0_40px_rgba(147,51,234,0.4)] active:scale-95 transition-all duration-300 disabled:opacity-70 disabled:grayscale"
                  >
                    {loading ? <><Loader2 size={20} className="animate-spin" /> Submitting...</> : <><Check size={20} strokeWidth={3} /> Submit Application</>}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ApplyFreelancer;
