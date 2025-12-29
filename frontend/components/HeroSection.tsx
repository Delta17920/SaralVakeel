import React from 'react';
import { motion } from 'framer-motion';

interface HeroSectionProps {
  isDarkMode: boolean;
  setShowLandingPage: (value: boolean) => void;
}

const HeroBackground = ({ isDarkMode }: { isDarkMode: boolean }) => (
  <>
    <div className={`absolute inset-0 ${isDarkMode ? 'bg-[#0B0D10]' : 'bg-[#FAFAF9]'}`} />
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(${isDarkMode ? 'rgba(79, 196, 196, 0.03)' : 'rgba(47, 60, 126, 0.08)'} 1px, transparent 1px), linear-gradient(90deg, ${isDarkMode ? 'rgba(79, 196, 196, 0.03)' : 'rgba(47, 60, 126, 0.08)'} 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.1, 0.2, 0.1],
          rotate: [0, 45, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className={`absolute -top-[20%] -right-[10%] w-[800px] h-[800px] rounded-full blur-[120px] ${isDarkMode ? 'bg-[#2F3C7E]' : 'bg-[#E0E7FF]'}`}
      />
      <motion.div
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.1, 0.2, 0.1],
          rotate: [0, -45, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className={`absolute -bottom-[20%] -left-[10%] w-[800px] h-[800px] rounded-full blur-[120px] ${isDarkMode ? 'bg-[#4FC4C4]' : 'bg-[#D1FAE5]'}`}
      />
    </div>
  </>
);

const HeroIllustration = ({ isDarkMode }: { isDarkMode: boolean }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.8 }}
    className="relative hidden lg:block"
  >
    <div className={`
      relative aspect-square rounded-3xl overflow-hidden
      ${isDarkMode
        ? 'bg-gradient-to-br from-[#1A1C20] to-[#111215] border border-[#2B2E35]'
        : 'bg-white border border-[#E2E2E8] shadow-2xl shadow-[#2F3C7E]/5'
      }
    `}>
      <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] opacity-20 ${isDarkMode ? 'bg-[#4FC4C4]' : 'bg-[#2F3C7E]'}`} />
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="relative"
        >
          <div className={`
              w-64 h-80 rounded-2xl rotate-[-6deg] absolute top-0 left-0
              ${isDarkMode ? 'bg-[#2B2E35]' : 'bg-[#F3F4F6]'}
            `} />
          <div className={`
              w-64 h-80 rounded-2xl rotate-[-3deg] absolute top-0 left-0
              ${isDarkMode ? 'bg-[#1C1F26]' : 'bg-gray-50 border border-gray-100'}
            `} />
          <div className={`
              relative w-64 h-80 rounded-2xl p-6 shadow-2xl backdrop-blur-sm
              ${isDarkMode
              ? 'bg-[#1A1C20]/90 border border-[#2B2E35]'
              : 'bg-white/90 border border-white'
            }
            `}>
            {/* Skeleton Content */}
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-[#2F3C7E]' : 'bg-[#E0E7FF]'}`} />
              <div className="space-y-2">
                <div className={`w-24 h-2 rounded ${isDarkMode ? 'bg-[#2B2E35]' : 'bg-gray-100'}`} />
                <div className={`w-16 h-2 rounded ${isDarkMode ? 'bg-[#2B2E35]' : 'bg-gray-100'}`} />
              </div>
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  initial={{ width: '100%', opacity: 0.5 }}
                  animate={{ width: ['100%', '90%', '100%'], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 3, delay: i * 0.2, repeat: Infinity }}
                  className={`h-2 rounded ${isDarkMode ? 'bg-[#2B2E35]' : 'bg-gray-100'}`}
                />
              ))}
            </div>
            {/* Success Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className={`
                   absolute bottom-6 right-6 w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg
                   bg-gradient-to-r from-[#4FC4C4] to-[#2F3C7E]
                 `}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  </motion.div>
);

export default function HeroSection({ isDarkMode, setShowLandingPage }: HeroSectionProps) {
  return (
    <section className="min-h-screen relative flex items-center justify-center overflow-hidden py-20 lg:py-0">
      <HeroBackground isDarkMode={isDarkMode} />

      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left Column - Content */}
          <div className="space-y-8 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-6 ${isDarkMode
                  ? 'bg-[#4FC4C4]/10 text-[#4FC4C4] border border-[#4FC4C4]/20'
                  : 'bg-[#2F3C7E]/5 text-[#2F3C7E] border border-[#2F3C7E]/10'
                  }`}
                whileHover={{ scale: 1.02 }}
              >
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isDarkMode ? 'bg-[#4FC4C4]' : 'bg-[#2F3C7E]'}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isDarkMode ? 'bg-[#4FC4C4]' : 'bg-[#2F3C7E]'}`}></span>
                </span>
                AI-Powered Legal Intelligence
              </motion.div>

              <h1 className={`text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6 ${isDarkMode ? 'text-white' : 'text-[#1C1F26]'}`}>
                Legal analysis <br />
                <span className={`text-transparent bg-clip-text bg-gradient-to-r ${isDarkMode ? 'from-[#4FC4C4] to-[#2F3C7E]' : 'from-[#2F3C7E] to-[#4FC4C4]'}`}>
                  simplified.
                </span>
              </h1>

              <p className={`text-lg md:text-xl leading-relaxed max-w-2xl mx-auto lg:mx-0 ${isDarkMode ? 'text-[#B4B7BD]' : 'text-[#5F6B7C]'}`}>
                Experience the future of document review. Trusted accuracy at unprecedented speed, accessible 24/7.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowLandingPage(false)}
                className={`
                  group relative px-8 py-4 rounded-xl font-semibold text-white shadow-lg overflow-hidden
                  ${isDarkMode
                    ? 'bg-gradient-to-r from-[#4FC4C4] to-[#2F3C7E]'
                    : 'bg-[#2F3C7E]'
                  }
                `}
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative flex items-center justify-center gap-2">
                  Main Menu
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  px-8 py-4 rounded-xl font-semibold transition-all border
                  ${isDarkMode
                    ? 'border-[#2B2E35] text-white hover:bg-[#2B2E35]'
                    : 'border-[#E2E2E8] text-[#1C1F26] hover:bg-white hover:shadow-md'
                  }
                `}
              >
                Watch Demo
              </motion.button>
            </motion.div>

            {/* Stats - Minimalist */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className={`grid grid-cols-3 gap-8 border-t pt-8 mt-12 ${isDarkMode ? 'border-[#2B2E35]' : 'border-[#E2E2E8]'}`}
            >
              {[
                { label: 'Accuracy', value: '99.9%' },
                { label: 'Time Saved', value: '10x' },
                { label: 'Availability', value: '24/7' },
              ].map((stat, i) => (
                <div key={i} className="text-center lg:text-left">
                  <div className={`text-2xl md:text-3xl font-bold mb-1 ${isDarkMode ? 'text-[#4FC4C4]' : 'text-[#2F3C7E]'}`}>
                    {stat.value}
                  </div>
                  <div className={`text-sm font-medium ${isDarkMode ? 'text-[#8F939A]' : 'text-[#8A909A]'}`}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Column - Illustration */}
          <HeroIllustration isDarkMode={isDarkMode} />
        </div>
      </div>
    </section>
  );
}