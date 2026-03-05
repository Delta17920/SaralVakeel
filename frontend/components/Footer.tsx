import React from 'react';

interface FooterProps {
  isDarkMode: boolean;
}

const Footer: React.FC<FooterProps> = ({ isDarkMode }) => {
  return (
    <div className={`mt-16 pt-8 border-t text-center
      ${isDarkMode ? 'border-[#2B2E35]' : 'border-[#DDD6CC]'}`}>
      <p className={`text-sm ${isDarkMode ? 'text-[#8F939A]' : 'text-[#8C7B6B]'}`}>
        © 2026{' '}
        <span className="font-[family-name:var(--font-heading)] font-bold text-[#4A3F35]">
          Saral Vakeel
        </span>
        . All rights reserved. | Built with enterprise-grade security and AI.
      </p>
    </div>
  );
};

export default Footer;