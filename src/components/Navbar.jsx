import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import MagneticButton from './MagneticButton';

const NAV_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'Services', path: '/services' },
  { name: 'Internship', path: '/internship' },
  { name: 'Collaborations', path: '/collaborations' },
  { name: 'About', path: '/about' },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isHome = location.pathname === '/';
  const isDarkBg = false;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-white/85 backdrop-blur-[12px] shadow-[0_1px_20px_rgba(0,0,0,0.1)]' 
            : 'bg-transparent'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group relative z-[60]">
              <span className={`font-bold text-2xl tracking-tight transition-colors duration-200 ${
                isDarkBg 
                  ? 'text-white hover:text-[var(--color-brand-secondary)]' 
                  : 'text-[var(--color-brand-text-primary)] hover:text-[var(--color-brand-primary)]'
              }`}>DAKH</span>
            </Link>

            {/* Desktop Links (Pill Style) */}
            <div className={`hidden lg:flex gap-2 items-center border rounded-full px-5 py-1.5 backdrop-blur-md transition-all duration-300 ${
              isDarkBg 
                ? 'bg-white/10 border-white/20' 
                : 'bg-gray-100/80 border-gray-200/80'
            }`}>
              {NAV_LINKS.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`nav-link px-4 py-2 text-sm font-medium transition-all duration-200 rounded-full ${
                      isActive 
                        ? isDarkBg 
                          ? 'active text-yellow-300 bg-white/15 font-bold' 
                          : 'active text-purple-600 bg-white shadow-sm font-bold' 
                        : isDarkBg 
                          ? 'text-gray-200 hover:text-white' 
                          : 'text-gray-700 hover:text-[var(--color-brand-primary)]'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:flex gap-4 items-center">
              <MagneticButton>
                <Link to="/contact" className="px-6 py-2.5 bg-gradient-primary text-white rounded-full text-sm font-bold hover:shadow-[0_0_15px_rgba(147,51,234,0.3)] transition-all duration-200 active:scale-95 block">
                  Send Message
                </Link>
              </MagneticButton>
            </div>

            {/* Mobile Menu Toggle (Animation 12: Morph) */}
            <button 
              className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 relative z-[60]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <motion.span 
                className={`w-6 h-0.5 block ${isDarkBg ? 'bg-white' : 'bg-gray-900'}`}
                animate={mobileMenuOpen ? { rotate: 45, y: 8, backgroundColor: "#0f172a" } : { rotate: 0 }}
                transition={{ duration: 0.3 }}
              />
              <motion.span 
                className={`w-6 h-0.5 block ${isDarkBg ? 'bg-white' : 'bg-gray-900'}`}
                animate={mobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
              <motion.span 
                className={`w-6 h-0.5 block ${isDarkBg ? 'bg-white' : 'bg-gray-900'}`}
                animate={mobileMenuOpen ? { rotate: -45, y: -8, backgroundColor: "#0f172a" } : { rotate: 0 }}
                transition={{ duration: 0.3 }}
              />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Fullscreen Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "100vh", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed inset-0 z-50 bg-white flex flex-col pt-24 px-8 pb-8 overflow-hidden"
          >
            <nav className="flex flex-col gap-6 h-full overflow-y-auto">
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={link.path}
                    className={`nav-link inline-block w-fit text-3xl font-bold transition-colors ${
                      location.pathname === link.path ? 'active text-gray-900' : 'text-gray-900 hover:text-[var(--color-brand-primary)]'
                    }`}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <div className="mt-12 flex flex-col gap-4">
              <Link to="/contact" className="w-full py-4 bg-[var(--color-brand-primary)] text-white rounded-xl font-bold text-center text-lg active:scale-95 transition-transform">
                Send Message
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
