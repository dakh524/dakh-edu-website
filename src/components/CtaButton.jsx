import { Link } from 'react-router-dom';

const CtaButton = ({ to, children, className = "", ghost = false }) => {
  if (ghost) {
    return (
      <Link
        to={to}
        className={`group inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 bg-transparent text-gray-900 rounded-full font-bold hover:bg-gray-100 hover:text-[var(--color-brand-primary)] hover:border-gray-100 transition-all duration-300 active:scale-95 ${className}`}
      >
        {children}
      </Link>
    );
  }

  return (
    <Link
      to={to}
      className={`group inline-flex items-center justify-center px-8 py-4 bg-gradient-primary text-white rounded-full font-bold border border-[var(--color-brand-primary)] hover:shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all duration-300 active:scale-95 hover:scale-105 ${className}`}
    >
      {children}
    </Link>
  );
};

export default CtaButton;
