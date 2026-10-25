import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe, Building } from 'lucide-react';
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
  const rawPriceParam = searchParams.get('price') || '499';
  const rawModeParam = searchParams.get('mode');

  // Clean plan name from any "(Online)" or "(Offline)" suffix if passed in URL
  const cleanPlanName = rawPlanParam.replace(/\s*\((Online|Offline)\)/i, '').trim();
  const initialMode = (rawModeParam && rawModeParam.toLowerCase() === 'offline') ? 'Offline' : 'Online';

  const [mode, setMode] = useState(initialMode);
  const [selectedPlanName, setSelectedPlanName] = useState(cleanPlanName);

  const BASE_PLANS = [
    { name: 'Project Based Intern', basePrice: 149 },
    { name: '15 Days Sprint', basePrice: 399 },
    { name: '30 Days Mastery', basePrice: 499 },
    { name: 'Internship Program', basePrice: 499 },
    { name: 'Team Sprint', basePrice: 2001 }
  ];

  const allBasePlans = [...BASE_PLANS];
  if (!allBasePlans.find(p => p.name.toLowerCase() === cleanPlanName.toLowerCase())) {
    allBasePlans.push({
      name: cleanPlanName,
      basePrice: parseInt(rawPriceParam, 10) || 499
    });
  }

  const currentPlan = allBasePlans.find(p => p.name.toLowerCase() === selectedPlanName.toLowerCase()) || allBasePlans[3];
  const isOffline = mode === 'Offline';
  const finalPrice = isOffline ? currentPlan.basePrice * 2 : currentPlan.basePrice;
  const finalPlanName = `${currentPlan.name} (${mode})`;

  const handlePlanSelectChange = (e) => {
    const [pName, pMode] = e.target.value.split('__');
    setSelectedPlanName(pName);
    if (pMode) {
      setMode(pMode);
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
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

      // 2. Save Registration
      const { data: regData, error: regError } = await supabase.from('registrations').insert([{
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
      }]).select();

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
          domain: formData.domain,
          password: randomPassword
        }]);
        
        setCredentials({
          email: formData.email,
          password: randomPassword,
          intern_number: internNumber
        });
      }

      // NEW: Open WhatsApp link
      const whatsappMessage = `Hi, I have applied for the Internship.\n\nName: ${formData.fullName}\nCollege: ${formData.college}\nDepartment: ${formData.department}\nYear: ${formData.year}\nDomain: ${formData.domain}\nPlan: ${finalPlanName}\nMode: ${mode}\nAmount Paid: ₹${finalPrice}\nPhone: ${formData.phone}\nEmail: ${formData.email}\nTransaction ID: ${formData.utr}`;
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
                Your internship portal credentials have been generated successfully. 
                <strong>Please save these details.</strong>
              </p>
              
              {credentials && (
                <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200 mb-8 max-w-md w-full mx-auto text-left">
                  <p className="text-sm font-bold text-yellow-800 uppercase mb-4 text-center tracking-widest">Your Portal Credentials</p>
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Email (Username)</span>
                      <div className="font-mono text-gray-900 font-bold bg-white p-2 rounded border text-sm">{credentials.email}</div>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Password</span>
                      <div className="font-mono text-gray-900 font-bold bg-white p-2 rounded border text-sm">{credentials.password}</div>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Intern Number</span>
                      <div className="font-mono text-gray-900 font-bold bg-white p-2 rounded border text-sm">{credentials.intern_number}</div>
                    </div>
                  </div>
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
                <div className="mb-6 bg-purple-50 p-5 rounded-2xl border border-purple-100 flex flex-col gap-4">
                  {/* Mode Selector and Price Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-purple-100/80 pb-4">
                    <div>
                      <span className="text-xs font-bold text-purple-700 uppercase tracking-wider block mb-1.5">Internship Mode</span>
                      <div className="inline-flex p-1 bg-white border-2 border-purple-200 rounded-xl shadow-xs gap-1">
                        <button
                          type="button"
                          onClick={() => setMode('Online')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                            mode === 'Online'
                              ? 'bg-purple-600 text-white shadow-sm'
                              : 'text-gray-600 hover:text-purple-600'
                          }`}
                        >
                          <Globe className="w-3.5 h-3.5" />
                          Online
                        </button>
                        <button
                          type="button"
                          onClick={() => setMode('Offline')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                            mode === 'Offline'
                              ? 'bg-amber-500 text-gray-950 shadow-sm'
                              : 'text-gray-600 hover:text-amber-600'
                          }`}
                        >
                          <Building className="w-3.5 h-3.5" />
                          Offline (2x Fee)
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col items-start sm:items-end">
                      <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
                        {isOffline ? 'Offline Fee (2x Rate)' : 'Online Fee (Standard)'}
                      </span>
                      <div className="text-3xl sm:text-4xl font-black text-gray-900 flex items-center gap-1">
                        <span>₹</span>{finalPrice}
                      </div>
                      {isOffline && (
                        <span className="text-[11px] font-bold text-amber-900 bg-amber-200 px-2 py-0.5 rounded-full mt-1">
                          Offline 2x Double Fee Applied
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Select Plan Dropdown */}
                  <div>
                    <label htmlFor="planSelect" className="text-xs font-bold text-purple-600 uppercase tracking-wider block mb-1.5">
                      Select Plan & Mode
                    </label>
                    <select 
                      id="planSelect"
                      value={`${currentPlan.name}__${mode}`}
                      onChange={handlePlanSelectChange}
                      className="w-full border-2 border-purple-200 rounded-xl p-3 text-gray-900 font-bold focus:border-purple-500 focus:outline-none bg-white shadow-xs"
                    >
                      <optgroup label="🌐 Online Internship (Standard Fee)">
                        {allBasePlans.map((plan) => (
                          <option key={`online-${plan.name}`} value={`${plan.name}__Online`}>
                            {plan.name} (Online - ₹{plan.basePrice})
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="🏢 Offline Internship (Double Amount / 2x Fee)">
                        {allBasePlans.map((plan) => (
                          <option key={`offline-${plan.name}`} value={`${plan.name}__Offline`}>
                            {plan.name} (Offline - ₹{plan.basePrice * 2})
                          </option>
                        ))}
                      </optgroup>
                    </select>
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
                    <input type="text" name="referral" placeholder="Referral Code (Optional)" value={formData.referral} onChange={handleChange} className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-900 font-medium focus:border-purple-500 focus:outline-none" />
                  </div>

                  <div className="bg-[#ffce00] p-6 rounded-2xl flex flex-col items-center justify-center text-center mt-4 shadow-sm">
                    <div className="font-black text-lg tracking-wider mb-2">PAY INTERNSHIP FEE</div>
                    {isOffline ? (
                      <div className="mb-3 px-3 py-1 bg-black text-amber-300 font-black text-xs rounded-full uppercase tracking-wider">
                        🏢 Offline Mode (Double Payment Applied)
                      </div>
                    ) : (
                      <div className="mb-3 px-3 py-1 bg-white/70 text-gray-900 font-bold text-xs rounded-full uppercase tracking-wider">
                        🌐 Online Mode
                      </div>
                    )}
                    <div className="bg-white p-3 rounded-xl shadow-md mb-4">
                      <img src={qrCodeUrl} alt="UPI QR Code" className="w-40 h-40 object-contain" />
                    </div>
                    <div className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-1">Payee Name</div>
                    <div className="text-xl font-black text-gray-900 mb-4">Mr DHIVAKAR B</div>
                    
                    <div className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-1">UPI ID</div>
                    <div className="text-lg font-bold text-gray-900 mb-6 bg-white/50 px-4 py-1 rounded-full">dhivakar.9640@waaxis</div>
                    
                    <div className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-1">Selected Fee ({mode})</div>
                    <div className="text-5xl font-black text-gray-900 flex items-center gap-1">
                      <span>₹</span>{finalPrice}
                    </div>
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
