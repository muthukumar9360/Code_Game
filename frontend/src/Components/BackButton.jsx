import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const BackButton = ({ to, label = "Back", className = "", fallback = "/" }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (to) {
      navigate(to);
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`group inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 hover:border-orange-500/40 backdrop-blur-md transition-all duration-200 shadow-sm active:scale-95 text-xs md:text-sm font-semibold tracking-wide ${className}`}
      title="Go back"
    >
      <FaArrowLeft className="text-orange-400 group-hover:-translate-x-1 transition-transform duration-200" />
      <span>{label}</span>
    </button>
  );
};

export default BackButton;
