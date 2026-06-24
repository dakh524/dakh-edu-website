import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(max-width: 768px)").matches) {
      setIsMobile(true);
      return;
    }

    // Hide the default system cursor so it doesn't mix with the custom cursor
    const style = document.createElement('style');
    style.innerHTML = `* { cursor: none !important; }`;
    document.head.appendChild(style);

    const updatePosition = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      if (
        target.tagName.toLowerCase() === 'a' ||
        target.tagName.toLowerCase() === 'button' ||
        target.closest('a') ||
        target.closest('button') ||
        target.classList.contains('nav-link') ||
        target.classList.contains('card')
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', updatePosition);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', updatePosition);
      window.removeEventListener('mouseover', handleMouseOver);
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  if (isMobile) return null;

  return (
    <motion.div 
      className="fixed pointer-events-none z-[9999]" 
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 500, damping: 28, mass: 0.5 }}
      style={{ left: 0, top: 0, x: "-50%", y: "-50%" }}
    >
      <motion.div 
        className="relative flex items-center justify-center"
        animate={{ scale: isHovering ? 1.5 : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {/* Outer Glow Ring */}
        <motion.div 
          className="absolute rounded-full" 
          animate={{ 
            width: isHovering ? '48px' : '32px', 
            height: isHovering ? '48px' : '32px',
            backgroundColor: isHovering ? 'rgba(147, 51, 234, 0.1)' : 'transparent'
          }}
          transition={{ duration: 0.2 }}
          style={{ boxShadow: isHovering ? '0 0 16px rgba(147, 51, 234, 0.4)' : '0 0 8px rgba(147, 51, 234, 0.2)' }}
        >
          <svg width="100%" height="100%" className="absolute inset-0">
            <defs>
              <linearGradient id="cursorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9333ea" />
                <stop offset="100%" stopColor="#facc15" />
              </linearGradient>
            </defs>
            <circle cx="50%" cy="50%" r="44%" stroke="url(#cursorGrad)" strokeWidth="2" fill="none" />
          </svg>
        </motion.div>
        
        {/* Middle Faint Ring */}
        <motion.div 
          className="absolute rounded-full opacity-30" 
          animate={{ 
            width: isHovering ? '24px' : '12px', 
            height: isHovering ? '24px' : '12px',
            opacity: isHovering ? 0 : 0.3
          }}
        >
          <svg width="100%" height="100%" className="absolute inset-0">
            <circle cx="50%" cy="50%" r="44%" stroke="url(#cursorGrad)" strokeWidth="1" strokeOpacity="0.4" fill="none" />
          </svg>
        </motion.div>
        
        {/* Center Dot */}
        <motion.div 
          className="absolute rounded-full bg-gradient-to-tr from-[#9333ea] to-[#facc15]" 
          animate={{ 
            width: isHovering ? '5px' : '7px', 
            height: isHovering ? '5px' : '7px',
          }}
          style={{ boxShadow: '0 0 6px rgba(147, 51, 234, 0.4)' }}
        ></motion.div>
      </motion.div>
    </motion.div>
  );
};

export default CustomCursor;
