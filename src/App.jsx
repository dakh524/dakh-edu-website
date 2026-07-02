import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Lenis from '@studio-freight/lenis';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CustomCursor from './components/CustomCursor';

// Page Imports (will create these next)
import Home from './pages/Home';
import Internship from './pages/Internship';
import Services from './pages/Services';
import Collaborations from './pages/Collaborations';
import About from './pages/About';
import Contact from './pages/Contact';
import ApplyFreelancer from './pages/ApplyFreelancer';

// Admin Pages
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

// Intern & Team Pages
import TeamLogin from './pages/TeamLogin';
import TeamDashboard from './pages/TeamDashboard';

function App() {
  const location = useLocation();
  const isNoNavRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/team');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.05,
      wheelMultiplier: 1,
      smoothWheel: true,
      smoothTouch: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[var(--color-brand-bg)] text-[var(--color-brand-text-primary)]">
      <CustomCursor />
      {!isNoNavRoute && <Navbar />}
      
      {/* Main Content Area */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/internship" element={<Internship />} />
            <Route path="/services" element={<Services />} />
            <Route path="/collaborations" element={<Collaborations />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/apply" element={<ApplyFreelancer />} />

            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            
            {/* Team Routes */}
            <Route path="/team/login" element={<TeamLogin />} />
            <Route path="/team/dashboard" element={<TeamDashboard />} />
          </Routes>
        </AnimatePresence>
      </main>

      {!isNoNavRoute && <Footer />}
    </div>
  );
}

export default App;
