import { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe, Building, Calendar, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const CHENNAI_COLLEGES = [
  "Sri Sairam Engineering College",
  "Sri Sairam Institute of Technology",
  "Panimalar Engineering College",
  "Chennai Institute of Technology (CIT)",
  "Rajalakshmi Engineering College (REC)",
  "Easwari Engineering College",
  "Hindustan University",
  "VIT Chennai",
  "SRM University (Kattankulathur)",
  "Anna University (CEG Campus)",
  "Madras Institute of Technology (MIT)",
  "SSN College of Engineering",
  "St. Joseph's College of Engineering",
  "Sathyabama Institute of Science and Technology",
  "RMK Engineering College",
  "Loyola-ICAM College of Engineering and Technology (LICET)",
  "Saveetha Engineering College",
  "Jerusalem College of Engineering",
  "Vels University"
];

const ACTIVE_INTERNSHIPS = [
  "Vibe Coding",
  "Web Development",
  "Generative AI",
  "Full Stack Development"
];

const RELATED_DOMAINS = [
  "AI & Machine Learning",
  "App Development",
  "UI/UX Design",
  "Data Science",
  "Python Full Stack"
];

const DOMAINS_LIST = [
  ...ACTIVE_INTERNSHIPS,
  ...RELATED_DOMAINS,
  "Other"
];

const ApplyInternship = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const rawPlanParam = searchParams.get('plan') || 'Internship Program';
  const rawPriceParam = searchParams.get('price') || '399';
  const rawModeParam = searchParams.get('mode');

  // Clean plan name from any "(Online)" or "(Offline)" suffix if passed in URL
  const cleanPlanName = rawPlanParam.replace(/\s*\((Online|Offline)\)/i, '').trim();
  const initialMode = (rawModeParam && rawModeParam.toLowerCase() === 'offline') ? 'Offline' : 'Online';

  const [mode, setMode] = useState(initialMode);
  const isOffline = mode === 'Offline';
  const basePrice = 399;
  const finalPlanName = `${cleanPlanName || 'Internship Program'} (${mode})`;

  // ==========================================
  // FLEXIBLE SCHEDULING ENGINE (IST Calendar Day Calculations)
  // Inclusive Day Counting: e.g., 01 Dec to 15 Dec = 15 Days
  // ==========================================
  const todayStr = useMemo(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  }, []);

  const defaultStartStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7); // Default 7 days from today
    return d.toISOString().split('T')[0];
  }, []);

  const [scheduleMode, setScheduleMode] = useState('duration'); // 'duration' | 'dates'
  const [selectedDurationPreset, setSelectedDurationPreset] = useState('30'); // '15' | '30' | '45' | 'custom'
  const [customDays, setCustomDays] = useState('32');
  const [startDateInput, setStartDateInput] = useState(defaultStartStr);
  const [endDateInput, setEndDateInput] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7 + 29); // +29 days because inclusive: 1 + 29 = 30 days
    return d.toISOString().split('T')[0];
  });

  // Helper: Format YYYY-MM-DD to DD Mon YYYY
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Helper: Calculate end date from start date and inclusive days
  // End Date = Start Date + (days - 1) days
  const computeEndDateFromDays = (startStr, daysCount) => {
    if (!startStr || isNaN(daysCount) || daysCount <= 0) return '';
    const [y, m, d] = startStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + (daysCount - 1));
    return date.toISOString().split('T')[0];
  };

  // Helper: Calculate inclusive days between two dates
  // Inclusive days = Math.round((End - Start) / 86400000) + 1
  const computeDaysBetween = (startStr, endStr) => {
    if (!startStr || !endStr) return 0;
    const [y1, m1, d1] = startStr.split('-').map(Number);
    const [y2, m2, d2] = endStr.split('-').map(Number);
    const startUtc = Date.UTC(y1, m1 - 1, d1);
    const endUtc = Date.UTC(y2, m2 - 1, d2);
    if (endUtc < startUtc) return 0;
    return Math.round((endUtc - startUtc) / 86400000) + 1;
  };

  // Computed Schedule State
  const computedSchedule = useMemo(() => {
    let days = 30;
    let start = startDateInput;
    let end = endDateInput;
    let isCustom = false;
    let error = null;

    if (scheduleMode === 'duration') {
      if (selectedDurationPreset === 'custom') {
        const parsed = parseInt(customDays, 10);
        if (isNaN(parsed) || parsed < 7 || parsed > 180) {
          error = 'Please enter a valid duration between 7 and 180 days.';
          days = isNaN(parsed) ? 0 : parsed;
        } else {
          days = parsed;
          isCustom = ![15, 30, 45].includes(days);
        }
      } else {
        days = parseInt(selectedDurationPreset, 10);
      }

      if (start) {
        end = computeEndDateFromDays(start, days);
      }
    } else {
      // 'dates' mode: user picks exact start and end date
      if (!start || !end) {
        error = 'Please select both start date and end date.';
        days = 0;
      } else {
        const counted = computeDaysBetween(start, end);
        if (counted <= 0) {
          error = 'End date must be on or after start date.';
          days = 0;
        } else if (counted < 7) {
          error = 'Minimum internship duration is 7 days.';
          days = counted;
        } else {
          days = counted;
          isCustom = ![15, 30, 45].includes(days);
        }
      }
    }

    if (start && start < todayStr) {
      error = 'Start date cannot be in the past.';
    }

    return {
      durationDays: days,
      durationLabel: `${days} Days`,
      startDate: start,
      endDate: end,
      startDateFormatted: formatDateDisplay(start),
      endDateFormatted: formatDateDisplay(end),
      isCustom,
      error
    };
  }, [scheduleMode, selectedDurationPreset, customDays, startDateInput, endDateInput, todayStr]);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    college: '',
    department: '',
    year: '',
    domain: '',
    referral: '',
    utr: '',
    paymentCompleted: false
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [credentials, setCredentials] = useState(null);

  // Referral discount logic: "extrabonus" applies flat ₹100 discount (₹399 -> ₹299)
  const isExtraBonusApplied = useMemo(() => {
    return (formData.referral || '').trim().toLowerCase() === 'extrabonus';
  }, [formData.referral]);

  const finalPrice = isExtraBonusApplied ? 299 : basePrice;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (computedSchedule.error) {
      alert(`Invalid schedule: ${computedSchedule.error}`);
      return;
    }
    if (!formData.paymentCompleted) {
      alert("Please confirm that you have completed the payment.");
      return;
    }

    try {
      // Generate a temporary password (e.g. random 6 chars)
      const randomPassword = Math.random().toString(36).slice(-6) + 'Dakh@';
      
      // 1. Sign up to Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: randomPassword,
      });

      if (authError) {
        console.error("Auth creation failed:", authError);
      }

      // 2. Save Registration with Exact Student Chosen Schedule
      const insertPayload = {
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        college: formData.college,
        department: formData.department,
        year_of_study: formData.year,
        domain: formData.domain,
        plan_name: finalPlanName,
        plan_price: finalPrice.toString(),
        referral_code: formData.referral,
        utr_number: formData.utr,
        payment_completed: formData.paymentCompleted
      };

      // Include scheduling columns if present
      if (computedSchedule.durationLabel) insertPayload.internship_duration = computedSchedule.durationLabel;
      if (computedSchedule.startDateFormatted) insertPayload.start_date = computedSchedule.startDateFormatted;
      if (computedSchedule.endDateFormatted) insertPayload.end_date = computedSchedule.endDateFormatted;

      const { data: regData, error: regError } = await supabase
        .from('registrations')
        .insert([insertPayload])
        .select();

      if (regError) {
        console.error("Error saving registration:", regError);
        alert("There was an issue saving your application. We will still redirect you to WhatsApp.");
      }

      // 3. Save Student Record (if auth succeeded)
      if (authData?.user && !regError) {
        const internNumber = `DES/INT/2026/${Math.floor(1000 + Math.random() * 9000)}`;
        await supabase.from('students').insert([{
          auth_id: authData.user.id,
          registration_id: regData[0].id,
          full_name: formData.fullName,
          email: formData.email,
          intern_number: internNumber,
          domain: formData.domain
        }]);
        
        setCredentials({
          email: formData.email,
          intern_number: internNumber
        });
      }

      // NEW: Open WhatsApp link
      const whatsappMessage = `Hi, I have applied for the Internship.\n\nName: ${formData.fullName}\nCollege: ${formData.college}\nDepartment: ${formData.department}\nYear: ${formData.year}\nDomain: ${formData.domain}\nPlan: ${finalPlanName}\nMode: ${mode}\nDuration: ${computedSchedule.durationLabel}\nSchedule: ${computedSchedule.startDateFormatted} to ${computedSchedule.endDateFormatted}\nAmount Paid: ₹${finalPrice}\nPhone: ${formData.phone}\nEmail: ${formData.email}\nTransaction ID: ${formData.utr}`;
      const whatsappUrl = `https://wa.me/918667399640?text=${encodeURIComponent(whatsappMessage)}`;
      window.open(whatsappUrl, '_blank');

    } catch (err) {
      console.error(err);
    }

    setIsSubmitted(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const filteredColleges = CHENNAI_COLLEGES.filter(c => 
    c.toLowerCase().includes(formData.college.toLowerCase())
  );

  // Generate UPI QR Code URL
  const upiUrl = `upi://pay?pa=dhivakar.9640@waaxis&pn=Mr%20DHIVAKAR%20B&am=${finalPrice}&cu=INR`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`;

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 font-sans">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-2xl w-full overflow-hidden shadow-2xl border border-gray-200"
        >
          {isSubmitted ? (
            <div className="w-full p-12 text-center flex flex-col items-center justify-center min-h-[500px]">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-4">Registration Sent!</h3>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6 leading-relaxed">
                Your internship registration details have been received successfully. 
                <strong>Payment verification is currently pending review.</strong>
              </p>
              
              {credentials && (
                <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200 mb-8 max-w-md w-full mx-auto text-left">
                  <p className="text-sm font-bold text-yellow-800 uppercase mb-4 text-center tracking-widest">Application Summary</p>
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Registered Email</span>
                      <div className="font-mono text-gray-900 font-bold bg-white p-2 rounded border text-sm">{credentials.email}</div>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Assigned Intern Reference ID</span>
                      <div className="font-mono text-gray-900 font-bold bg-white p-2 rounded border text-sm">{credentials.intern_number}</div>
                    </div>
                  </div>
                  <p className="text-xs text-amber-700 mt-4 leading-normal">
                    📌 An acknowledgement email has been sent. Once your payment UTR is verified by an admin, your official Offer Letter and secure portal activation link will be delivered to your email.
                  </p>
                </div>
              )}

              <div className="flex gap-4">
                <button 
                  onClick={() => navigate('/student/login')}
                  className="px-8 py-4 bg-purple-600 text-white font-bold rounded-xl shadow-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  Go to Portal Login
                </button>
                <button 
                  onClick={() => navigate('/internship')}
                  className="px-8 py-4 bg-gray-200 text-gray-800 font-bold rounded-xl shadow hover:bg-gray-300 transition-colors"
                >
                  Back
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full bg-white flex flex-col">
              <div className="bg-white p-4 font-black text-lg tracking-wider border-b border-gray-200 text-center">
                INTERNSHIP REGISTRATION
              </div>
              
              <div className="p-6 md:p-8">
                <div className="mb-6 bg-purple-50 p-5 md:p-6 rounded-2xl border border-purple-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                  {/* Mode Selector */}
                  <div>
                    <span className="text-xs font-bold text-purple-700 uppercase tracking-wider block mb-2">Select Internship Mode</span>
                    <div className="inline-flex p-1 bg-white border-2 border-purple-200 rounded-xl shadow-xs gap-1.5">
                      <button
                        type="button"
                        onClick={() => setMode('Online')}
                        className={`px-4 py-2 rounded-lg text-sm font-black transition-all flex items-center gap-2 ${
                          mode === 'Online'
                            ? 'bg-purple-600 text-white shadow-sm'
                            : 'text-gray-600 hover:text-purple-600'
                        }`}
                      >
                        <Globe className="w-4 h-4" />
                        Online
                      </button>
                      <button
                        type="button"
                        onClick={() => setMode('Offline')}
                        className={`px-4 py-2 rounded-lg text-sm font-black transition-all flex items-center gap-2 ${
                          mode === 'Offline'
                            ? 'bg-purple-600 text-white shadow-sm'
                            : 'text-gray-600 hover:text-purple-600'
                        }`}
                      >
                        <Building className="w-4 h-4" />
                        Offline
                      </button>
                    </div>
                    <span className="text-xs text-gray-500 font-semibold block mt-2">
                      Selected: <strong className="text-purple-700 font-bold">{cleanPlanName || 'Internship Program'} ({mode})</strong>
                    </span>
                  </div>

                  {/* Special Offer Price Box */}
                  <div className="flex flex-col items-start sm:items-end">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1.5 mb-1">
                      Fee (Special Offer)
                      <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                        Special Offer
                      </span>
                    </span>
                    <div className="text-3xl sm:text-4xl font-black text-gray-900 flex items-center gap-2">
                      <span className="text-lg sm:text-xl text-gray-400 line-through font-semibold">₹499</span>
                      <div className="flex items-center gap-1 text-purple-700">
                        <span>₹</span>399
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full mt-1.5">
                      Flat ₹399 for {mode} Mode (No Extra Fee)
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input required type="text" name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleChange} className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-900 font-medium focus:border-purple-500 focus:outline-none" />
                    <input required type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-900 font-medium focus:border-purple-500 focus:outline-none" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input required type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-900 font-medium focus:border-purple-500 focus:outline-none" />
                    
                    <div className="relative">
                      <input 
                        required 
                        type="text" 
                        name="college" 
                        placeholder="Search College" 
                        value={formData.college} 
                        onChange={(e) => {
                          handleChange(e);
                          setShowDropdown(true);
                        }}
                        onFocus={() => setShowDropdown(true)}
                        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                        className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-900 font-medium focus:border-purple-500 focus:outline-none" 
                      />
                      {showDropdown && formData.college && filteredColleges.length > 0 && (
                        <div className="absolute z-50 w-full bg-white border border-gray-200 shadow-xl rounded-xl mt-1 max-h-48 overflow-y-auto">
                          {filteredColleges.map((col, idx) => (
                            <div 
                              key={idx}
                              className="px-4 py-2 hover:bg-purple-50 cursor-pointer text-gray-800 text-sm border-b border-gray-100 last:border-none"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, college: col }));
                                setShowDropdown(false);
                              }}
                            >
                              {col}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select required name="department" value={formData.department} onChange={handleChange} className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-900 font-medium focus:border-purple-500 focus:outline-none bg-white">
                      <option value="" disabled>Select Department</option>
                      <option value="CSE">CSE</option>
                      <option value="IT">IT</option>
                      <option value="ECE">ECE</option>
                      <option value="EEE">EEE</option>
                      <option value="MECH">MECH</option>
                      <option value="CIVIL">CIVIL</option>
                      <option value="AI/DS">AI/DS</option>
                      <option value="Other">Other</option>
                    </select>
                    
                    <select required name="year" value={formData.year} onChange={handleChange} className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-900 font-medium focus:border-purple-500 focus:outline-none bg-white">
                      <option value="" disabled>Select Year of Study</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select required name="domain" value={formData.domain} onChange={handleChange} className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-900 font-medium focus:border-purple-500 focus:outline-none bg-white">
                      <option value="" disabled>Select Domain</option>
                      <optgroup label="🔥 Top Active Internships">
                        {ACTIVE_INTERNSHIPS.map((dom) => (
                          <option key={dom} value={dom}>{dom}</option>
                        ))}
                      </optgroup>
                      <optgroup label="📌 Project Based Internships">
                        {RELATED_DOMAINS.map((dom) => (
                          <option key={dom} value={dom}>{dom}</option>
                        ))}
                        <option value="Other">Other (Project Based)</option>
                      </optgroup>
                    </select>
                    <div className="relative">
                      <input 
                        type="text" 
                        name="referral" 
                        placeholder="Referral Code (Optional)" 
                        value={formData.referral} 
                        onChange={handleChange} 
                        className={`w-full border-2 rounded-xl p-3 text-gray-900 font-medium focus:outline-none transition-colors ${
                          isExtraBonusApplied 
                            ? 'border-emerald-500 bg-emerald-50/40 text-emerald-900' 
                            : 'border-gray-300 focus:border-purple-500'
                        }`} 
                      />
                      {isExtraBonusApplied && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs animate-pulse">
                          <span>🎉 ₹100 OFF</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ========================================================== */}
                  {/* INTERACTIVE FLEXIBLE SCHEDULING SECTION                     */}
                  {/* ========================================================== */}
                  <div className="bg-gradient-to-br from-purple-50/70 to-indigo-50/50 p-5 rounded-2xl border-2 border-purple-200/80 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-100 pb-3">
                      <div>
                        <h4 className="font-black text-gray-900 text-sm flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-purple-600" /> Choose Internship Schedule
                        </h4>
                        <p className="text-xs text-gray-500 font-medium">Select a duration or pick exact custom calendar dates</p>
                      </div>

                      {/* Scheduling Mode Switcher */}
                      <div className="inline-flex p-1 bg-white border border-purple-200 rounded-xl shadow-xs">
                        <button
                          type="button"
                          onClick={() => setScheduleMode('duration')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            scheduleMode === 'duration' ? 'bg-purple-600 text-white shadow-xs' : 'text-gray-600 hover:text-purple-600'
                          }`}
                        >
                          Select Duration
                        </button>
                        <button
                          type="button"
                          onClick={() => setScheduleMode('dates')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            scheduleMode === 'dates' ? 'bg-purple-600 text-white shadow-xs' : 'text-gray-600 hover:text-purple-600'
                          }`}
                        >
                          Choose Exact Dates
                        </button>
                      </div>
                    </div>

                    {/* Mode A: Duration Preset / Custom Days */}
                    {scheduleMode === 'duration' ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {[
                            { id: '15', label: '15 Days', desc: 'Sprint' },
                            { id: '30', label: '30 Days', desc: 'Standard' },
                            { id: '45', label: '45 Days', desc: 'Comprehensive' },
                            { id: 'custom', label: 'Custom', desc: 'Enter Days' },
                          ].map(item => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setSelectedDurationPreset(item.id)}
                              className={`p-3 rounded-xl border-2 text-left transition-all ${
                                selectedDurationPreset === item.id
                                  ? 'border-purple-600 bg-white shadow-sm ring-2 ring-purple-100'
                                  : 'border-purple-100 bg-white/60 hover:bg-white text-gray-700'
                              }`}
                            >
                              <div className={`font-black text-sm ${selectedDurationPreset === item.id ? 'text-purple-700' : 'text-gray-900'}`}>
                                {item.label}
                              </div>
                              <div className="text-[11px] text-gray-500 font-medium">{item.desc}</div>
                            </button>
                          ))}
                        </div>

                        {/* Custom Days Input */}
                        {selectedDurationPreset === 'custom' && (
                          <div className="bg-white p-3.5 rounded-xl border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-purple-600" /> Enter Custom Duration (Days):
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="7"
                                max="180"
                                value={customDays}
                                onChange={(e) => setCustomDays(e.target.value)}
                                className="w-24 p-2 border-2 border-purple-300 rounded-lg text-center font-bold text-gray-900 focus:outline-none focus:border-purple-600 text-sm"
                                placeholder="e.g. 32"
                              />
                              <span className="text-xs font-bold text-gray-500">Days</span>
                            </div>
                          </div>
                        )}

                        {/* Start Date Picker (Autocomputes End Date) */}
                        <div className="bg-white p-3 rounded-xl border border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <label className="text-xs font-bold text-gray-700">Preferred Start Date:</label>
                          <input
                            type="date"
                            min={todayStr}
                            value={startDateInput}
                            onChange={(e) => setStartDateInput(e.target.value)}
                            className="p-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-800 focus:outline-none focus:border-purple-500"
                          />
                        </div>
                      </div>
                    ) : (
                      /* Mode B: Exact Start & End Date Pickers */
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-4 rounded-xl border border-purple-100">
                        <div>
                          <label className="text-xs font-bold text-gray-700 block mb-1">Start Date:</label>
                          <input
                            type="date"
                            min={todayStr}
                            value={startDateInput}
                            onChange={(e) => setStartDateInput(e.target.value)}
                            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-800 focus:outline-none focus:border-purple-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-700 block mb-1">End Date:</label>
                          <input
                            type="date"
                            min={startDateInput || todayStr}
                            value={endDateInput}
                            onChange={(e) => setEndDateInput(e.target.value)}
                            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-800 focus:outline-none focus:border-purple-500"
                          />
                        </div>
                      </div>
                    )}

                    {/* LIVE CALENDAR SUMMARY CARD */}
                    {computedSchedule.error ? (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-bold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                        <span>{computedSchedule.error}</span>
                      </div>
                    ) : (
                      <div className="bg-white/95 p-3.5 rounded-xl border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div className="text-xs font-bold text-gray-800">
                            Schedule: <span className="text-purple-700 font-black">{computedSchedule.startDateFormatted}</span> to <span className="text-purple-700 font-black">{computedSchedule.endDateFormatted}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-purple-100 text-purple-800 font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                            {computedSchedule.durationLabel} (Inclusive)
                          </span>
                          {computedSchedule.isCustom && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full" title="Custom scheduling request will be verified upon admin approval">
                              Custom Schedule
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-[#ffce00] p-6 rounded-2xl flex flex-col items-center justify-center text-center mt-4 shadow-sm">
                    <div className="font-black text-lg tracking-wider mb-2">PAY INTERNSHIP FEE</div>
                    <div className="mb-3 px-3.5 py-1 bg-white/80 text-gray-900 font-bold text-xs rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1.5">
                      <span>{isOffline ? '🏢' : '🌐'}</span>
                      <span>{mode} Mode • {isExtraBonusApplied ? 'EXTRABONUS Applied ₹299' : 'Special Offer ₹399'}</span>
                    </div>
                    <div className="bg-white p-3 rounded-xl shadow-md mb-4">
                      <img src={qrCodeUrl} alt="UPI QR Code" className="w-40 h-40 object-contain" />
                    </div>
                    <div className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-1">Payee Name</div>
                    <div className="text-xl font-black text-gray-900 mb-4">Mr DHIVAKAR B</div>
                    
                    <div className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-1">UPI ID</div>
                    <div className="text-lg font-bold text-gray-900 mb-6 bg-white/50 px-4 py-1 rounded-full">dhivakar.9640@waaxis</div>
                    
                    <div className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-1">Selected Fee ({mode})</div>
                    <div className="text-5xl font-black text-gray-900 flex items-center justify-center gap-2">
                      {isExtraBonusApplied && (
                        <span className="text-2xl text-gray-600 line-through font-bold">₹399</span>
                      )}
                      <div className="flex items-center gap-1 text-gray-900">
                        <span>₹</span>{finalPrice}
                      </div>
                    </div>
                    {isExtraBonusApplied && (
                      <div className="mt-2 text-xs font-black text-emerald-900 bg-emerald-300/80 px-3 py-1 rounded-full uppercase tracking-wider">
                        EXTRABONUS code applied: ₹100 Discount
                      </div>
                    )}
                  </div>

                  <input required type="text" name="utr" placeholder="Transaction ID / UTR No." value={formData.utr} onChange={handleChange} className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-900 font-medium focus:border-purple-500 focus:outline-none mt-2" />
                  
                  <div className="p-4 border-2 border-gray-300 rounded-xl bg-gray-50 flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      id="paymentCompleted" 
                      name="paymentCompleted"
                      checked={formData.paymentCompleted} 
                      onChange={handleChange} 
                      className="w-5 h-5 accent-purple-600"
                    />
                    <label htmlFor="paymentCompleted" className="font-bold text-gray-800 cursor-pointer text-sm">
                      I confirm that I have completed the payment of ₹{finalPrice} via the QR code or UPI ID.
                    </label>
                  </div>

                  <button type="submit" className="w-full py-4 bg-[#ffce00] hover:bg-[#e6b800] text-gray-900 font-black rounded-xl border-b-4 border-yellow-600 hover:translate-y-[2px] hover:border-b-2 transition-all mt-2 uppercase tracking-wider text-lg shadow-lg">
                    SUBMIT & MESSAGE ON WHATSAPP →
                  </button>

                </form>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ApplyInternship;
