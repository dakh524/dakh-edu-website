import { Link } from 'react-router-dom';
import { Send, MessageCircle } from 'lucide-react';

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const LinkedinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect width="4" height="12" x="2" y="9"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

const Footer = () => {
  return (
    <footer className="bg-[var(--color-brand-bg)] text-[var(--color-brand-text-primary)] pt-24 pb-8 relative overflow-hidden border-t border-[rgba(0,0,0,0.05)]">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-64 bg-[var(--color-brand-primary)] rounded-full blur-[120px] opacity-10 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Col */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform -rotate-6">
                <span className="font-black text-2xl text-white">D</span>
              </div>
              <h3 className="font-black text-3xl tracking-tight text-gray-900">DAKH</h3>
            </div>
            <p className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">Learn. Build. Earn.</p>
            <p className="text-gray-500 text-sm leading-relaxed font-medium">
              Redefining education through dimensional intelligence and hands-on tech opportunities. Built by students, for students.
            </p>
          </div>

          {/* Pages */}
          <div>
            <h4 className="font-black text-gray-900 mb-6 text-lg uppercase tracking-wider">Pages</h4>
            <ul className="flex flex-col gap-4 text-sm text-gray-500 font-medium">
              <li><Link to="/" className="hover:text-purple-600 hover:translate-x-1 transition-all inline-block">Home</Link></li>
              <li><Link to="/internship" className="hover:text-purple-600 hover:translate-x-1 transition-all inline-block">Internships</Link></li>
              <li><Link to="/services" className="hover:text-purple-600 hover:translate-x-1 transition-all inline-block">Services</Link></li>
              <li><Link to="/collaborations" className="hover:text-purple-600 hover:translate-x-1 transition-all inline-block">Collaborations</Link></li>
              <li><Link to="/about" className="hover:text-purple-600 hover:translate-x-1 transition-all inline-block">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-purple-600 hover:translate-x-1 transition-all inline-block">Contact Us</Link></li>
              <li><Link to="/admin/login" className="hover:text-purple-600 hover:translate-x-1 transition-all inline-block flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-500 inline-block"></span> Admin Login</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-black text-gray-900 mb-6 text-lg uppercase tracking-wider">Services</h4>
            <ul className="flex flex-col gap-4 text-sm text-gray-500 font-medium">
              <li><Link to="/internship" className="hover:text-purple-600 hover:translate-x-1 transition-all inline-block">Internship Programs</Link></li>
              <li><Link to="/services" className="hover:text-purple-600 hover:translate-x-1 transition-all inline-block">Web Development</Link></li>
              <li><Link to="/services" className="hover:text-purple-600 hover:translate-x-1 transition-all inline-block">App Development</Link></li>
              <li><Link to="/services" className="hover:text-purple-600 hover:translate-x-1 transition-all inline-block">UI/UX Design</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-black text-gray-900 mb-6 text-lg uppercase tracking-wider">Contact</h4>
            <ul className="flex flex-col gap-4 text-sm text-gray-500 font-medium">
              <li><a href="mailto:dakhedusolution@gmail.com" className="hover:text-purple-600 transition-colors flex items-center gap-2">dakhedusolution@gmail.com</a></li>
              <li><a href="tel:+918778317180" className="hover:text-purple-600 transition-colors flex items-center gap-2">+91 877 831 7180</a></li>
              <li>Chennai, Tamil Nadu</li>
              <li>India</li>
            </ul>
            
            {/* Social Icons */}
            <div className="flex gap-4 mt-8">
              <a href="https://www.instagram.com/dakh_edu/" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gradient-to-r hover:from-pink-500 hover:to-orange-400 text-gray-400 hover:text-white border border-gray-200 hover:border-transparent flex items-center justify-center transition-all duration-300 hover:scale-110 hover:-translate-y-1 shadow-sm">
                <InstagramIcon />
              </a>
              <a href="https://www.linkedin.com/company/dakh-edu-solutions/" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-700 text-gray-400 hover:text-white border border-gray-200 hover:border-transparent flex items-center justify-center transition-all duration-300 hover:scale-110 hover:-translate-y-1 shadow-sm">
                <LinkedinIcon />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gradient-to-r hover:from-blue-400 hover:to-blue-500 text-gray-400 hover:text-white border border-gray-200 hover:border-transparent flex items-center justify-center transition-all duration-300 hover:scale-110 hover:-translate-y-1 shadow-sm">
                <Send className="w-5 h-5" /> {/* Telegram */}
              </a>
              <a href="https://wa.me/918778317180" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gradient-to-r hover:from-green-400 hover:to-green-500 text-gray-400 hover:text-white border border-gray-200 hover:border-transparent flex items-center justify-center transition-all duration-300 hover:scale-110 hover:-translate-y-1 shadow-sm">
                <MessageCircle className="w-5 h-5" /> {/* WhatsApp */}
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[rgba(0,0,0,0.1)] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500 font-medium">
            © 2026 DAKH Edu Solutions. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-gray-500 font-bold">
            <Link to="/admin/login" className="hover:text-purple-600 transition-colors flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-purple-500 inline-block"></span> Admin Dashboard</Link>
            <a href="#" className="hover:text-purple-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-purple-600 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
