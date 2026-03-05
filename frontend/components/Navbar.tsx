import React, { useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useAuth } from './AuthProvider';

interface NavbarProps {
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
  sidebarExpanded?: boolean;
  setSidebarExpanded?: (value: boolean) => void;
  setShowLandingPage?: (value: boolean) => void;
  showLandingPage?: boolean;
  isDesktopCollapsed?: boolean;
  setIsDesktopCollapsed?: (value: boolean) => void;
}

export default function Navbar({
  isDarkMode,
  setIsDarkMode,
  sidebarExpanded,
  setSidebarExpanded,
  setShowLandingPage,
  isDesktopCollapsed,
  setIsDesktopCollapsed
}: NavbarProps) {
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const { user, signOut } = useAuth();

  const handleMenuClick = () => {
    if (window.innerWidth >= 1024 && setIsDesktopCollapsed && isDesktopCollapsed !== undefined) {
      setIsDesktopCollapsed(!isDesktopCollapsed);
    } else if (setSidebarExpanded && sidebarExpanded !== undefined) {
      setSidebarExpanded(!sidebarExpanded);
    }
  };

  return (
    <nav className={`sticky top-0 z-20 border-b transition-colors duration-200
      ${isDarkMode
        ? 'bg-[#1A1C20] border-[#2B2E35]'
        : 'bg-[#FBF8F3] border-[#DDD6CC]'
      }`}>
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Hamburger */}
          {setSidebarExpanded && (
            <button
              onClick={handleMenuClick}
              className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-[#2B2E35]' : 'hover:bg-[#EDE7DB]'}`}
              aria-label="Toggle sidebar"
            >
              <svg className={`w-6 h-6 ${isDarkMode ? 'text-[#ECEDEE]' : 'text-[#2E2A26]'}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}

          {/* Brand */}
          <button
            onClick={() => setShowLandingPage?.(true)}
            className={`font-bold text-xl tracking-tight cursor-pointer font-[family-name:var(--font-playfair)]
              ${isDarkMode ? 'text-[#ECEDEE]' : 'text-[#2E2A26]'}`}>
            Saral Vakeel
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile search icon */}
          <button
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className={`md:hidden p-2 rounded-lg ${isDarkMode ? 'hover:bg-[#2B2E35]' : 'hover:bg-[#EDE7DB]'}`}
          >
            <svg className={`w-5 h-5 ${isDarkMode ? 'text-[#ECEDEE]' : 'text-[#2E2A26]'}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Auth */}
          {user ? (
            <button
              onClick={() => signOut()}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                ${isDarkMode ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}>
              Sign Out
            </button>
          ) : (
            <a href="/login"
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors bg-[#4A3F35] text-[#FBF8F3] hover:bg-[#2E2A26]">
              Sign In
            </a>
          )}

          {/* Theme toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-lg transition-all duration-200
              ${isDarkMode ? 'bg-[#2B2E35] text-yellow-400 hover:bg-[#3B3E45]' : 'bg-[#EDE7DB] text-[#4A3F35] hover:bg-[#DDD6CC]'}`}
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </nav>
  );
}