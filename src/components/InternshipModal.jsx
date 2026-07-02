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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.paymentCompleted) {
      alert("Please confirm that you have completed the payment.");
      return;
    }

    try {
      // Save to Supabase
      const { error } = await supabase.from('registrations').insert([{
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
      }]);

      if (error) {
        console.error("Error saving to database:", error);
        alert("There was an issue saving your application. We will still redirect you to WhatsApp.");
      }
    } catch (err) {
      console.error(err);
    }

    // Keep WhatsApp Redirect
    const text = `*New Internship Registration*%0A%0A*Name:* ${formData.fullName}%0A*Email:* ${formData.email}%0A*Phone:* ${formData.phone}%0A*College:* ${formData.college}%0A*Department:* ${formData.department}%0A*Year:* ${formData.year}%0A*Domain:* ${formData.domain}%0A*Plan:* ${planDetails?.name || 'Internship'} (₹${planDetails?.price || '449'})%0A*Referral:* ${formData.referral || 'None'}%0A*UTR/Txn ID:* ${formData.utr}`;
    
    window.open(`https://wa.me/918778317180?text=${text}`, '_blank');
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
                <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
                  After completing the payment, our team will save your data in our database. You can access our DAKH Intern Bot in Telegram right now. Visit it below, and once our team verifies your payment, we will notify you!
                </p>
                <a 
                  href="https://t.me/DakhTutorbot" 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-8 py-4 bg-blue-500 text-white font-bold rounded-xl shadow-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.21-1.12-.33-1.08-.7.02-.19.27-.39.75-.59 2.95-1.28 4.92-2.13 5.92-2.54 2.81-1.18 3.4-1.38 3.78-1.38.08 0 .27.02.39.1.1.06.13.15.15.24.01.07.01.16 0 .24z"/></svg>
                  Open Telegram Bot
                </a>
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
