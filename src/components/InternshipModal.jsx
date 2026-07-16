import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

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

const DOMAINS_LIST = [
  // IT / CSE
  "Web Development", "App Development", "AI & Machine Learning", "UI/UX Design", 
  "Python Full Stack", "MERN Stack", "Cyber Security", "Data Science", "DevOps", 
  "Blockchain Development", "Game Development", "AR/VR Development", "Cloud Computing", 
  "Edge Computing", "Bioinformatics", "Computer Vision", "Natural Language Processing (NLP)", 
  "Software Testing (QA)", "3D Animation & Modeling", "MEAN Stack", 
  "React Native", "Flutter", "iOS Development", "Android Development", 
  "Networking", "Ethical Hacking", "Digital Marketing", 
  "Product Management", "Graphic Design", "Video Editing", "System Administration", 
  "IT Support", "Information Security", "Quantum Computing", "5G Technologies", 
  "Cloud Security", "Front-End Development", "Back-End Development", 
  "Database Administration", "Machine Learning Engineering", "Data Analytics", 
  "Business Intelligence", "API Development", "Microservices Architecture", 
  "C/C++ Programming", "Java Full Stack", "Generative AI",
  // Mechanical
  "AutoCAD & 3D Modeling", "HVAC Design", "Manufacturing & Production",
  "Automotive Design", "Computational Fluid Dynamics (CFD)", "Finite Element Analysis (FEA)",
  "Robotics & Automation", "Mechatronics",
  // Civil
  "Structural Engineering", "Construction Management", "AutoCAD Civil 3D",
  "Urban Planning", "Geotechnical Engineering", "Transportation Engineering",
  "Surveying & Mapping", "Environmental Engineering",
  // ECE / EEE
  "VLSI Design", "Embedded Systems", "Power Systems", "Control Systems",
  "Digital Signal Processing (DSP)", "Antenna Design", "Electric Vehicles (EV) Technology",
  "Renewable Energy Systems", "Microcontrollers & PLCs", "PCB Design", "IoT",
  "Other"
].sort();

const InternshipModal = ({ isOpen, onClose, planDetails }) => {
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
        plan_name: planDetails?.name || 'Internship',
        plan_price: planDetails?.price || '449',
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
          domain: formData.domain
        }]);
        
        setCredentials({
          email: formData.email,
          password: randomPassword,
          intern_number: internNumber
        });
      }

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
  const upiUrl = `upi://pay?pa=dhivakar.9640@waaxis&pn=Mr%20DHIVAKAR%20B&am=${planDetails?.price || '449'}&cu=INR`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto"
          onClick={onClose}
        >
          <motion.div 
            initial={{ y: 50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-50 rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row my-auto border border-gray-200"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 bg-black/10 hover:bg-black/20 text-black rounded-full flex items-center justify-center z-20 transition-colors"
            >
              ✕
            </button>

            {isSubmitted ? (
              <div className="w-full p-12 text-center flex flex-col items-center justify-center min-h-[500px]">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-4">Registration Sent!</h3>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6 leading-relaxed">
                  Your internship portal credentials have been generated successfully. 
                  <strong>Please save these details before closing this window.</strong>
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
                  <a 
                    href="/student/login" 
                    className="px-8 py-4 bg-purple-600 text-white font-bold rounded-xl shadow-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                  >
                    Go to Portal Login
                  </a>
                  <button 
                    onClick={onClose}
                    className="px-8 py-4 bg-gray-200 text-gray-800 font-bold rounded-xl shadow hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Left Side: Payment Info */}
                <div className="w-full md:w-2/5 bg-[#ffce00] flex flex-col relative border-r border-gray-200">
                  <div className="bg-white p-4 font-black text-center text-lg tracking-wider border-b border-gray-200">
                    PAY INTERNSHIP FEE
                  </div>
                  <div className="p-8 flex-grow flex flex-col items-center justify-center text-center">
                    <div className="bg-white p-3 rounded-xl shadow-md mb-6">
                      <img src={qrCodeUrl} alt="UPI QR Code" className="w-48 h-48 object-contain" />
                    </div>
                    
                    <div className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-1">Payee Name</div>
                    <div className="text-xl font-black text-gray-900 mb-4">Mr DHIVAKAR B</div>
                    
                    <div className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-1">UPI ID</div>
                    <div className="text-lg font-bold text-gray-900 mb-6 bg-white/50 px-4 py-1 rounded-full">dhivakar.9640@waaxis</div>
                    
                    <div className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-1">Selected Fee</div>
                    <div className="text-5xl font-black text-gray-900 flex items-center gap-1">
                      <span>₹</span>{planDetails?.price || '449'}
                    </div>
                  </div>
                </div>

                {/* Right Side: Form */}
                <div className="w-full md:w-3/5 bg-white flex flex-col">
                  <div className="bg-white p-4 font-black text-lg tracking-wider border-b border-gray-200">
                    INTERNSHIP REGISTRATION
                  </div>
                  
                  <div className="p-6 md:p-8">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input required type="text" name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleChange} className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-900 font-medium focus:border-purple-500 focus:outline-none" />
                        <input required type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-900 font-medium focus:border-purple-500 focus:outline-none" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input required type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-900 font-medium focus:border-purple-500 focus:outline-none" />
                        
                        {/* Custom Search College Input */}
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
                            <div className="absolute z-[250] w-full bg-white border border-gray-200 shadow-xl rounded-xl mt-1 max-h-48 overflow-y-auto">
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
                          {DOMAINS_LIST.map((dom, i) => (
                            <option key={i} value={dom}>{dom}</option>
                          ))}
                        </select>
                        <input type="text" name="referral" placeholder="Referral Code (Optional)" value={formData.referral} onChange={handleChange} className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-900 font-medium focus:border-purple-500 focus:outline-none" />
                      </div>

                      <input required type="text" name="utr" placeholder="Transaction ID / UTR No." value={formData.utr} onChange={handleChange} className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-900 font-medium focus:border-purple-500 focus:outline-none" />
                      
                      <div className="mt-2 p-4 border-2 border-gray-300 rounded-xl bg-gray-50 flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          id="paymentCompleted" 
                          name="paymentCompleted"
                          checked={formData.paymentCompleted} 
                          onChange={handleChange} 
                          className="w-5 h-5 accent-purple-600"
                        />
                        <label htmlFor="paymentCompleted" className="font-bold text-gray-800 cursor-pointer">
                          I confirm that I have completed the payment of ₹{planDetails?.price || '449'} via the QR code or UPI ID.
                        </label>
                      </div>

                      <button type="submit" className="w-full py-4 bg-[#ffce00] hover:bg-[#e6b800] text-gray-900 font-black rounded-xl border-b-4 border-yellow-600 hover:translate-y-[2px] hover:border-b-2 transition-all mt-2 uppercase tracking-wider text-lg">
                        SUBMIT APPLICATION →
                      </button>

                    </form>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InternshipModal;
