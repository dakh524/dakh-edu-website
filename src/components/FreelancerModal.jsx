import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Check, Loader2, User, BookOpen, Briefcase, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';

const SKILLS = [
  'Web Development', 'App Development', 'UI/UX Design',
  'Graphic Design', 'Content Writing', 'Video Editing',
  'Digital Marketing', 'SEO', 'Data Analysis',
  'Machine Learning / AI', 'Cybersecurity', 'Photography',
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
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-semibold text-gray-700">
      {label} {required && <span className="text-purple-500">*</span>}
    </label>
    {children}
  </div>
);

const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200";

const FreelancerModal = ({ isOpen, onClose }) => {
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
      if (!form.experience_level) return 'Experience level is required.';
      if (!form.availability) return 'Availability is required.';
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
    setStep(s => s + 1);
  };

  const back = () => { setError(''); setStep(s => s - 1); };

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
          skills: form.skills,
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
    } catch (e) {
      setError('Submission failed. Please try again or contact us directly.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep(1); setSubmitted(false); setError('');
      setForm({ full_name:'', email:'', phone:'', city:'', college_name:'', year_of_study:'', department:'', skills:[], experience_level:'', portfolio_url:'', linkedin_url:'', github_url:'', availability:'', bio:'', why_dakh:'' });
    }, 400);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              
              {/* Header */}
              <div className="relative bg-gradient-to-br from-purple-600 via-violet-700 to-indigo-800 px-8 py-6 flex-shrink-0">
                <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-400/10 rounded-full blur-[60px]"></div>
                <button onClick={handleClose} className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                  <X size={16} className="text-white" />
                </button>
                <p className="text-yellow-300 text-xs font-bold uppercase tracking-widest mb-1">DAKH Freelancer Program</p>
                <h2 className="text-white font-extrabold text-2xl">Apply as a Freelancer</h2>
                <p className="text-white/60 text-sm mt-1">Step {step} of {STEPS.length}</p>

                {/* Progress bar */}
                <div className="mt-4 flex gap-1.5">
                  {STEPS.map((s) => (
                    <div key={s.id} className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= s.id ? 'bg-yellow-300' : 'bg-white/20'}`} />
                  ))}
                </div>

                {/* Step indicators */}
                <div className="mt-4 flex gap-4">
                  {STEPS.map(({ id, label, icon: Icon }) => (
                    <div key={id} className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${step >= id ? 'text-yellow-300' : 'text-white/30'}`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] border transition-all ${step > id ? 'bg-yellow-300 border-yellow-300 text-gray-900' : step === id ? 'border-yellow-300 text-yellow-300' : 'border-white/20 text-white/30'}`}>
                        {step > id ? <Check size={10} /> : <Icon size={10} />}
                      </div>
                      <span className="hidden sm:inline">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto">
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-16 px-8 text-center"
                  >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                      <Check size={36} className="text-green-600" />
                    </div>
                    <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Application Submitted! 🎉</h3>
                    <p className="text-gray-500 max-w-sm">
                      Thanks, <strong>{form.full_name.split(' ')[0]}</strong>! We've received your application and will reach out to you at <strong>{form.email}</strong> within 3–5 business days.
                    </p>
                    <button
                      onClick={handleClose}
                      className="mt-8 px-8 py-3 bg-gradient-to-r from-purple-600 to-violet-700 text-white font-bold rounded-full hover:shadow-lg transition-all"
                    >
                      Close
                    </button>
                  </motion.div>
                ) : (
                  <div className="p-8">
                    <AnimatePresence mode="wait">
                      {/* STEP 1 — Personal Info */}
                      {step === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div className="sm:col-span-2">
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
                          <div className="sm:col-span-2">
                            <InputField label="City / Location">
                              <input className={inputClass} placeholder="e.g. Chennai, Tamil Nadu" value={form.city} onChange={e => set('city', e.target.value)} />
                            </InputField>
                          </div>
                        </motion.div>
                      )}

                      {/* STEP 2 — Education */}
                      {step === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div className="sm:col-span-2">
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
                        <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="flex flex-col gap-6">
                          <InputField label="Your Skills" required>
                            <p className="text-xs text-gray-400 mb-2">Select all that apply</p>
                            <div className="flex flex-wrap gap-2">
                              {SKILLS.map(skill => (
                                <button
                                  key={skill}
                                  type="button"
                                  onClick={() => toggleSkill(skill)}
                                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${
                                    form.skills.includes(skill)
                                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-purple-300'
                                  }`}
                                >
                                  {skill}
                                </button>
                              ))}
                            </div>
                          </InputField>
                          <div className="grid sm:grid-cols-2 gap-5">
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
                          <div className="grid sm:grid-cols-3 gap-5">
                            <InputField label="Portfolio URL">
                              <input className={inputClass} placeholder="behance.net/..." value={form.portfolio_url} onChange={e => set('portfolio_url', e.target.value)} />
                            </InputField>
                            <InputField label="LinkedIn URL">
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
                        <motion.div key="step4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="flex flex-col gap-5">
                          <InputField label="Brief Introduction" required>
                            <textarea
                              className={`${inputClass} resize-none`}
                              rows={4}
                              placeholder="Tell us who you are, what you do, and what you're passionate about..."
                              value={form.bio}
                              onChange={e => set('bio', e.target.value)}
                            />
                          </InputField>
                          <InputField label="Why do you want to join DAKH?" required>
                            <textarea
                              className={`${inputClass} resize-none`}
                              rows={4}
                              placeholder="What excites you about working with DAKH? What do you hope to gain?"
                              value={form.why_dakh}
                              onChange={e => set('why_dakh', e.target.value)}
                            />
                          </InputField>
                          {/* Summary preview */}
                          <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 text-sm text-purple-700 flex flex-col gap-1">
                            <p className="font-bold text-purple-800 mb-1">📋 Application Summary</p>
                            <p><span className="font-semibold">Name:</span> {form.full_name}</p>
                            <p><span className="font-semibold">College:</span> {form.college_name} · {form.year_of_study}</p>
                            <p><span className="font-semibold">Skills:</span> {form.skills.slice(0,3).join(', ')}{form.skills.length > 3 ? ` +${form.skills.length - 3} more` : ''}</p>
                            <p><span className="font-semibold">Availability:</span> {form.availability}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Error message */}
                    {error && (
                      <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-4 text-sm text-red-500 font-medium bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
                        ⚠️ {error}
                      </motion.p>
                    )}
                  </div>
                )}
              </div>

              {/* Footer navigation */}
              {!submitted && (
                <div className="flex-shrink-0 px-8 py-5 border-t border-gray-100 flex justify-between items-center bg-gray-50/80">
                  <button
                    onClick={back}
                    disabled={step === 1}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft size={16} /> Back
                  </button>
                  <span className="text-xs text-gray-400 font-medium">{step} / {STEPS.length}</span>
                  {step < STEPS.length ? (
                    <button
                      onClick={next}
                      className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-violet-700 text-white text-sm font-bold rounded-xl hover:shadow-md active:scale-95 transition-all"
                    >
                      Next <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-violet-700 text-white text-sm font-bold rounded-xl hover:shadow-md active:scale-95 transition-all disabled:opacity-70"
                    >
                      {loading ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : <><Check size={16} /> Submit Application</>}
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FreelancerModal;
