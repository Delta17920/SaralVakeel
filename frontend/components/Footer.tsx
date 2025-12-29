import React from 'react';

interface FooterProps {
  isDarkMode: boolean;
}

const Footer: React.FC<FooterProps> = ({ isDarkMode }) => {
  return (
    <div className={`mt-16 pt-8 border-t text-center ${isDarkMode ? 'border-gray-800' : 'border-gray-200'
      }`}>
      <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
        © 2025 <span className="font-[family-name:var(--font-playfair)] font-bold">Saral Vakeel</span>. All rights reserved. | Built with enterprise-grade security and AI.
      </p>
    </div>
  );
};

export default Footer;