import { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe, Building, Calendar, Clock, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
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
  "AWS Cloud Foundations",
  "PCB Design",
  "Web Development",
  "Full Stack Development",
  "Generative AI",
  "Vibe Coding"
];

const DOMAINS_LIST = ACTIVE_INTERNSHIPS;

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
  // Helper: Format Date object to local YYYY-MM-DD (avoids UTC toISOString timezone shifting)
  const formatLocalDate = (d) => {
    if (!d || !(d instanceof Date) || isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const todayStr = useMemo(() => {
    return formatLocalDate(new Date());
  }, []);

  const defaultStartStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7); // Default 7 days from today
    return formatLocalDate(d);
  }, []);

  const [scheduleMode, setScheduleMode] = useState('duration'); // 'duration' | 'dates'
  const [selectedDurationPreset, setSelectedDurationPreset] = useState('30'); // '15' | '30' | '45' | 'custom'
  const [customDays, setCustomDays] = useState('32');
  const [startDateInput, setStartDateInput] = useState(defaultStartStr);
  const [endDateInput, setEndDateInput] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7 + 29); // +29 days because inclusive: 1 + 29 = 30 days
    return formatLocalDate(d);
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
  // End Date = Start Date + (days - 1) days (Local calendar arithmetic, no UTC skew)
  const computeEndDateFromDays = (startStr, daysCount) => {
    if (!startStr || isNaN(daysCount) || daysCount <= 0) return '';
    const [y, m, d] = startStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + (daysCount - 1));
    return formatLocalDate(date);
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
  const [ackEmailQueued, setAckEmailQueued] = useState(false);
  const [laterUtrInput, setLaterUtrInput] = useState('');
  const [isSubmittingLaterUtr, setIsSubmittingLaterUtr] = useState(false);
  const [laterUtrSuccess, setLaterUtrSuccess] = useState(false);
  const [isOtherDept, setIsOtherDept] = useState(false);
  const [customDepartment, setCustomDepartment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedWhatsappUrl, setSubmittedWhatsappUrl] = useState('');

  const handleSubmitLaterUtr = async (e) => {
    e.preventDefault();
    if (!laterUtrInput.trim() || !credentials?.registration_id) return;
    setIsSubmittingLaterUtr(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      const res = await fetch('/api/submit-payment-utr', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          registrationId: credentials.registration_id,
          utrNumber: laterUtrInput.trim()
        })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setLaterUtrSuccess(true);
        setCredentials(prev => ({
          ...prev,
          payment_completed: true,
          utr_number: laterUtrInput.trim()
        }));
      } else {
        alert(data.error || 'Failed to submit UTR. Please try again or message us on WhatsApp.');
      }
    } catch (err) {
      alert('Error submitting UTR: ' + err.message);
    } finally {
      setIsSubmittingLaterUtr(false);
    }
  };

  // Referral discount logic: "extrabonus" applies flat ₹100 discount (₹399 -> ₹299)
  const isExtraBonusApplied = useMemo(() => {
    return (formData.referral || '').trim().toLowerCase() === 'extrabonus';
  }, [formData.referral]);

  const finalPrice = isExtraBonusApplied ? 299 : basePrice;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (computedSchedule.error) {
      alert(`Invalid schedule: ${computedSchedule.error}`);
      return;
    }

    if (isOtherDept && (!customDepartment || !customDepartment.trim())) {
      alert("Please type your department name.");
      return;
    }

    const finalDepartment = (isOtherDept ? customDepartment.trim() : formData.department) || 'Other';

    if (!formData.utr || !formData.utr.trim()) {
      alert("Transaction ID / UTR number is mandatory. Please enter your UPI / Bank reference ID to proceed.");
      return;
    }

    if (!formData.paymentCompleted) {
      alert(`Please confirm that you have completed the payment of ₹${finalPrice} via QR code / UPI.`);
      return;
    }

    setIsSubmitting(true);
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
      // Use pre-generated UUID so we never fail on RLS .select() restrictions
      const registrationId = crypto.randomUUID ? crypto.randomUUID() : (Math.random().toString(36).substring(2) + Date.now().toString(36));

      const insertPayload = {
        id: registrationId,
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        college: formData.college,
        department: finalDepartment,
        year_of_study: formData.year,
        domain: formData.domain,
        plan_name: finalPlanName,
        plan_price: finalPrice.toString(),
        referral_code: formData.referral || null,
        utr_number: formData.utr.trim(),
        payment_completed: true
      };

      // Include scheduling columns if present
      if (computedSchedule.durationLabel) insertPayload.internship_duration = computedSchedule.durationLabel;
      if (computedSchedule.startDateFormatted) insertPayload.start_date = computedSchedule.startDateFormatted;
      if (computedSchedule.endDateFormatted) insertPayload.end_date = computedSchedule.endDateFormatted;

      const { error: regError } = await supabase
        .from('registrations')
        .insert([insertPayload]);

      if (regError) {
        console.error("Error saving registration:", regError);
        alert("There was an issue saving your application. We will still redirect you to WhatsApp.");
      }

      // 3. Save Student Record (if auth succeeded)
      if (authData?.user && !regError) {
        const internNumber = `DES/INT/2026/${Math.floor(1000 + Math.random() * 9000)}`;
        await supabase.from('students').insert([{
          auth_id: authData.user.id,
          registration_id: registrationId,
          full_name: formData.fullName,
          email: formData.email,
          intern_number: internNumber,
          domain: formData.domain
        }]);
        
        setCredentials({
          email: formData.email,
          intern_number: internNumber,
          registration_id: registrationId,
          payment_completed: !!formData.paymentCompleted,
          utr_number: formData.utr || null
        });
      }

      // 4. Enqueue registration acknowledgement email via secure backend API.
      //    Passes registrationId with student's session token if present.
      //    The backend validates authorization and reads recipient email directly from the DB record.
      let ackQueued = false;
      if (!regError) {
        try {
          const headers = { 'Content-Type': 'application/json' };
          if (authData?.session?.access_token) {
            headers['Authorization'] = `Bearer ${authData.session.access_token}`;
          }
          const ackRes = await fetch('/api/registration-ack', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              registrationId: registrationId
            })
          });
          const ackJson = await ackRes.json().catch(() => ({}));
          if (ackRes.ok && ackJson.queued) {
            ackQueued = true;
          } else {
            console.warn('[registration-ack] Not queued:', ackJson.reason || ackJson.error);
          }
        } catch (ackErr) {
          // Non-critical — registration is already saved; email will be retried
          console.warn('[registration-ack] Could not queue ack email:', ackErr.message);
        }
      }
      // Store email status in component state for the success screen
      setAckEmailQueued(ackQueued);

      // Prepare WhatsApp link for manual acknowledgement when touched on thank-you screen
      const whatsappMessage = `Hi DAKH Team, I have registered for the Internship.\n\nName: ${formData.fullName}\nCollege: ${formData.college}\nDepartment: ${finalDepartment}\nYear: ${formData.year}\nDomain: ${formData.domain}\nPlan: ${finalPlanName}\nMode: ${mode}\nDuration: ${computedSchedule.durationLabel}\nSchedule: ${computedSchedule.startDateFormatted} to ${computedSchedule.endDateFormatted}\nAmount Paid: ₹${finalPrice}\nPhone: ${formData.phone}\nEmail: ${formData.email}\nTransaction ID: ${formData.utr}`;
      const whatsappUrl = `https://wa.me/918778317180?text=${encodeURIComponent(whatsappMessage)}`;
      setSubmittedWhatsappUrl(whatsappUrl);

      // Show Thank You for Registration screen first (DO NOT auto open WhatsApp)
      setIsSubmitted(true);
    } catch (err) {
      console.error(err);
      alert('Error submitting registration: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
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
            <div className="w-full p-8 sm:p-12 text-center flex flex-col items-center justify-center min-h-[500px]">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-5">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-2">Thank You for Registering!</h3>
              <p className="text-lg text-emerald-700 font-extrabold max-w-2xl mx-auto mb-5 leading-relaxed">
                Your registration is being verified by our team soon.
              </p>

              {/* Motivational Quote by CEO Dhivakar */}
              <div className="bg-gradient-to-r from-purple-50 via-purple-100/50 to-indigo-50 border-l-4 border-purple-600 rounded-xl p-5 mb-6 max-w-xl w-full mx-auto text-left shadow-xs">
                <p className="text-sm italic font-medium text-purple-950 leading-relaxed mb-2">
                  "The future belongs to those who learn more skills and combine them in creative ways. Every line of code, circuit, and cloud architecture you build shapes tomorrow."
                </p>
                <p className="text-xs font-black text-purple-700 tracking-wider text-right uppercase">
                  — CEO Dhivakar
                </p>
              </div>

              {/* Please Also Acknowledge to Team Card */}
              <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-5 sm:p-6 mb-8 max-w-xl w-full mx-auto text-left shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">📲</span>
                  <h4 className="text-sm font-extrabold text-emerald-950 uppercase tracking-wide">
                    Please Also Acknowledge to Our Team
                  </h4>
                </div>
                <p className="text-xs font-semibold text-emerald-900 mb-4 leading-relaxed">
                  Please inform our verification team about your registration so your application and payment can be verified immediately! Send your registration confirmation via WhatsApp to our team number:
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-emerald-200">
                  <div className="font-mono text-sm font-black text-emerald-800">
                    +91 8778317180
                  </div>
                  <a
                    href={submittedWhatsappUrl || `https://wa.me/918778317180?text=${encodeURIComponent(`Hi DAKH Team, I have registered for the Internship.\n\nName: ${formData.fullName}\nDomain: ${formData.domain}\nReference: ${credentials?.intern_number || 'New Registration'}\nUTR: ${formData.utr}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:scale-102 cursor-pointer"
                  >
                    <span>Acknowledge with Team on WhatsApp (+91 8778317180)</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
              
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
                    <div>
                      <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Payment Status</span>
                      <div className="font-mono text-xs font-bold bg-white p-2 rounded border flex items-center justify-between">
                        <span className={credentials.payment_completed ? "text-emerald-700 font-bold" : "text-amber-700 font-bold"}>
                          {credentials.payment_completed ? "Payment Verification Pending" : "Payment Pending (Pay Later)"}
                        </span>
                        {credentials.utr_number && (
                          <span className="text-[11px] text-gray-500">UTR: {credentials.utr_number}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* If unpaid or no UTR yet, provide in-place submission option */}
                  {!credentials.payment_completed && (
                    <div className="mt-4 pt-4 border-t border-yellow-200">
                      {laterUtrSuccess ? (
                        <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-lg text-xs text-emerald-800 font-bold flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Transaction reference submitted! Your record is now Payment Verification Pending.</span>
                        </div>
                      ) : (
                        <form onSubmit={handleSubmitLaterUtr} className="space-y-2">
                          <label className="text-xs font-bold text-gray-800 block">
                            Paid via UPI / QR now? Submit your UTR below:
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Enter UTR / Transaction ID"
                              value={laterUtrInput}
                              onChange={(e) => setLaterUtrInput(e.target.value)}
                              className="flex-1 p-2 text-xs border border-gray-300 rounded-lg font-mono focus:border-purple-500 focus:outline-none"
                              required
                            />
                            <button
                              type="submit"
                              disabled={isSubmittingLaterUtr}
                              className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                            >
                              {isSubmittingLaterUtr ? "Saving..." : "Submit UTR"}
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}

                  <p className="text-xs text-amber-700 mt-4 leading-normal">
                    {ackEmailQueued
                      ? "📌 Your registration acknowledgement email has been queued to your registered email. Once your payment is verified and approved by an admin, your official Offer Letter and portal credentials will be shared."
                      : "📌 Registration details submitted. Once your payment is verified and approved by an admin, your official Offer Letter and portal credentials will be issued."}
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
                    <div className="space-y-2">
                      <select 
                        required 
                        name="department" 
                        value={formData.department} 
                        onChange={(e) => {
                          handleChange(e);
                          if (e.target.value === 'Other') {
                            setIsOtherDept(true);
                          } else {
                            setIsOtherDept(false);
                            setCustomDepartment('');
                          }
                        }} 
                        className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-900 font-medium focus:border-purple-500 focus:outline-none bg-white"
                      >
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

                      {isOtherDept && (
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <input
                            type="text"
                            required
                            placeholder="Type Your Department (e.g. Biomedical, Robotics, MCA) *"
                            value={customDepartment}
                            onChange={(e) => setCustomDepartment(e.target.value)}
                            className="w-full border-2 border-purple-400 rounded-xl p-3 text-gray-900 font-medium focus:border-purple-600 focus:outline-none bg-purple-50/40 text-sm shadow-xs"
                            autoFocus
                          />
                        </motion.div>
                      )}
                    </div>
                    
                    <div>
                      <select required name="year" value={formData.year} onChange={handleChange} className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-900 font-medium focus:border-purple-500 focus:outline-none bg-white">
                        <option value="" disabled>Select Year of Study</option>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select required name="domain" value={formData.domain} onChange={handleChange} className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-900 font-medium focus:border-purple-500 focus:outline-none bg-white">
                      <option value="" disabled>Select Domain</option>
                      {ACTIVE_INTERNSHIPS.map((dom) => (
                        <option key={dom} value={dom}>{dom}</option>
                      ))}
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
                    <div className="font-black text-lg tracking-wider mb-2">PAY INTERNSHIP FEE (OPTIONAL NOW)</div>
                    <p className="text-xs text-gray-800 font-semibold mb-3 max-w-md">
                      You can pay now via UPI or QR code, or submit your registration first and complete payment details later.
                    </p>
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

                  <div className="mt-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Transaction ID / UTR No. <span className="text-rose-500 font-extrabold">* (Required)</span>
                    </label>
                    <input 
                      type="text" 
                      name="utr" 
                      required 
                      placeholder="Enter 12-digit UPI / UTR Transaction ID *" 
                      value={formData.utr} 
                      onChange={(e) => {
                        handleChange(e);
                        if (e.target.value.trim().length > 3) {
                          setFormData(prev => ({ ...prev, utr: e.target.value, paymentCompleted: true }));
                        }
                      }} 
                      className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-900 font-medium focus:border-purple-500 focus:outline-none" 
                    />
                  </div>
                  
                  <div className="p-4 border-2 border-gray-300 rounded-xl bg-gray-50 flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      id="paymentCompleted" 
                      name="paymentCompleted"
                      required
                      checked={formData.paymentCompleted} 
                      onChange={handleChange} 
                      className="w-5 h-5 accent-purple-600"
                    />
                    <label htmlFor="paymentCompleted" className="font-bold text-gray-800 cursor-pointer text-sm">
                      I have completed the payment of ₹{finalPrice} via QR code / UPI. *
                    </label>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className={`w-full py-4 text-gray-900 font-black rounded-xl border-b-4 transition-all mt-2 uppercase tracking-wider text-lg shadow-lg flex items-center justify-center gap-2 ${
                      isSubmitting 
                        ? 'bg-yellow-300 border-yellow-400 opacity-70 cursor-not-allowed pointer-events-none' 
                        : 'bg-[#ffce00] hover:bg-[#e6b800] border-yellow-600 hover:translate-y-[2px] hover:border-b-2 cursor-pointer'
                    }`}
                  >
                    {isSubmitting ? 'PROCESSING REGISTRATION...' : 'SUBMIT REGISTRATION →'}
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
