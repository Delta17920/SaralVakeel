import React from 'react';
import {
  Sun,
  Moon,
  User,
  Scale
} from 'lucide-react';

interface NavbarProps {
  isDarkMode: boolean;
  setIsDarkMode: (darkMode: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({
  isDarkMode,
  setIsDarkMode
}) => {
  return (
    <nav className={`border-b backdrop-blur-xl bg-white/10 border-white/20 transition-all duration-300 sticky top-0 z-50 ${
      isDarkMode
        ? 'bg-black/10 border-white/10'
        : 'bg-white/10 border-black/10'
    }`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-sm bg-white/20 border border-white/30">
                <Scale className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className={`font-semibold font-sans ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Saral Vakeel
                </p>
                <p className={`text-xs font-sans ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Enterprise Legal Platform
                </p>
              </div>
            </div>
          </div>
         
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-3 rounded-xl transition-all duration-300 backdrop-blur-sm bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/30 ${
                isDarkMode
                  ? 'text-yellow-400 shadow-lg'
                  : 'text-gray-600 shadow-md'
              }`}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
           
            <div className={`p-3 rounded-xl backdrop-blur-sm bg-white/10 border border-white/20 shadow-lg ${
              isDarkMode ? 'text-white' : 'text-gray-700'
            }`}>
              <User className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;