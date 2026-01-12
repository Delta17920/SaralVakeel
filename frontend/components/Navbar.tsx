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
    <nav className={`${isDarkMode ? 'bg-[#1A1C20]' : 'bg-white'} border-b ${isDarkMode ? 'border-[#2B2E35]' : 'border-[#E2E2E8]'} sticky top-0 z-20`}>
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Hamburger Menu Button */}
          {setSidebarExpanded && (
            <button
              onClick={handleMenuClick}
              className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-[#2B2E35]' : 'hover:bg-[#E2E2E8]'} transition-colors`}
              aria-label="Toggle sidebar"
            >
              <svg
                className={`w-6 h-6 ${isDarkMode ? 'text-[#ECEDEE]' : 'text-[#1C1F26]'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          )}

          {/* Logo and Brand */}
          <div className="flex items-center gap-2">
            <button onClick={() => setShowLandingPage?.(true)} className={`font-bold text-xl tracking-tight cursor-pointer font-[family-name:var(--font-playfair)] ${isDarkMode ? 'text-[#ECEDEE]' : 'text-[#1C1F26]'}`}>
              Saral Vakeel
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className={`${showMobileSearch ? 'flex absolute top-20 left-4 right-4 z-30' : 'hidden'} md:flex items-center gap-2 px-4 py-2 rounded-lg ${isDarkMode ? 'bg-[#2B2E35]' : 'bg-[#F5F5F7]'} transition-all`}>
            <svg
              className={`w-5 h-5 ${isDarkMode ? 'text-[#8F939A]' : 'text-[#8A909A]'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search documents..."
              className={`bg-transparent outline-none w-full md:w-64 ${isDarkMode ? 'text-[#ECEDEE] placeholder-[#8F939A]' : 'text-[#1C1F26] placeholder-[#8A909A]'}`}
            />
          </div>

          {/* Mobile Search Toggle */}
          <button
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className={`md:hidden p-2 rounded-lg ${isDarkMode ? 'hover:bg-[#2B2E35]' : 'hover:bg-[#E2E2E8]'}`}
          >
            <svg
              className={`w-5 h-5 ${isDarkMode ? 'text-[#ECEDEE]' : 'text-[#1C1F26]'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>


          {/* Auth Button */}
          {user ? (
            <button
              onClick={() => signOut()}
              className={`p-2 rounded-lg text-sm font-medium transition-colors ${isDarkMode
                ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                : "bg-red-50 text-red-600 hover:bg-red-100"
                }`}
            >
              Sign Out
            </button>
          ) : (
            <a
              href="/login"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isDarkMode
                ? "bg-blue-600 text-white hover:bg-blue-500"
                : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
            >
              Sign In
            </a>
          )}

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-lg transition-all duration-200 ${isDarkMode ? 'bg-[#2B2E35] text-yellow-400 hover:bg-[#3B3E45]' : 'bg-[#E2E2E8] text-slate-700 hover:bg-[#D2D2D8]'}`}
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </nav>
  );
}