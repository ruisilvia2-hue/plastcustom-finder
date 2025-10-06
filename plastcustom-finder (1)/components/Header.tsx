import React from 'react';
import { PLASTCUSTOM_LOGO_B64 } from '../assets';
import { Icons } from './Icons';

const Header: React.FC<{ onLogoClick: () => void; onNewSearchClick: () => void; }> = ({ onLogoClick, onNewSearchClick }) => {
  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm p-4 sticky top-0 z-50 border-b border-gray-200">
      <div className="container mx-auto flex justify-between items-center">
        <img 
            src={PLASTCUSTOM_LOGO_B64} 
            alt="Plastcustom Logo" 
            className="h-10 w-auto cursor-pointer" 
            onClick={onLogoClick} 
        />
        <button 
            onClick={onNewSearchClick}
            className="bg-[#70BF44] text-white font-bold py-2 px-6 rounded-lg hover:bg-[#5a9a36] transition-colors duration-300 flex items-center gap-2 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
        >
          <Icons.Search className="w-4 h-4" />
          <span>Nova Busca</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
