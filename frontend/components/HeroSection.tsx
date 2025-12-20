import React from 'react';
import { motion } from 'framer-motion';

export default function HeroSection({ isDarkMode, setShowLandingPage }) {
  return (
    <section className="min-h-screen h-screen flex items-center relative overflow-hidden">
      {/* Animated background with more dynamic elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated grid that pulses */}
        <motion.div 
          className="absolute inset-0 opacity-[0.05]"
          animate={{
            opacity: [0.03, 0.07, 0.03],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            backgroundImage: `linear-gradient(${isDarkMode ? '#4FC4C4' : '#2F3C7E'} 1.5px, transparent 1.5px), linear-gradient(90deg, ${isDarkMode ? '#4FC4C4' : '#2F3C7E'} 1.5px, transparent 1.5px)`,
            backgroundSize: '50px 50px',
          }}
        />
        
        {/* Large gradient orbs */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full blur-3xl ${
            isDarkMode ? 'bg-gradient-to-br from-[#4FC4C4]/30 to-[#2F3C7E]/20' : 'bg-gradient-to-br from-[#2F3C7E]/15 to-[#4FC4C4]/10'
          }`}
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.15, 0.35, 0.15],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`absolute -bottom-40 -left-40 w-[700px] h-[700px] rounded-full blur-3xl ${
            isDarkMode ? 'bg-gradient-to-tr from-[#2F3C7E]/30 to-[#4FC4C4]/20' : 'bg-gradient-to-tr from-[#4FC4C4]/15 to-[#2F3C7E]/10'
          }`}
        />
        
        {/* Floating particles with different sizes and speeds */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full ${
              isDarkMode ? 'bg-[#4FC4C4]' : 'bg-[#2F3C7E]'
            }`}
            style={{
              width: `${4 + (i % 4) * 2}px`,
              height: `${4 + (i % 4) * 2}px`,
              left: `${10 + (i * 8)}%`,
              top: `${15 + ((i % 4) * 20)}%`,
            }}
            animate={{
              y: [0, -60 - (i % 3) * 20, 0],
              x: [0, (i % 2 === 0 ? 30 : -30), 0],
              opacity: [0.1, 0.6, 0.1],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 5 + (i * 0.3),
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className={`
            grid lg:grid-cols-2 gap-8 items-center
            rounded-3xl p-6 md:p-10
            backdrop-blur-md
            ${isDarkMode 
              ? 'bg-gradient-to-br from-[#1A1C20]/90 to-[#222B53]/85 border-2 border-[#4FC4C4]/40 shadow-2xl shadow-[#4FC4C4]/20' 
              : 'bg-gradient-to-br from-white/95 to-[#F7F3EB]/95 border-2 border-[#2F3C7E]/20 shadow-2xl shadow-[#2F3C7E]/10'}
          `}
        >
          
          <div className="space-y-5">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <motion.div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-4 ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-[#4FC4C4]/25 to-[#4FC4C4]/15 text-[#4FC4C4] border-2 border-[#4FC4C4]/40' 
                    : 'bg-gradient-to-r from-[#2F3C7E]/15 to-[#2F3C7E]/10 text-[#2F3C7E] border-2 border-[#2F3C7E]/30'
                }`}
                whileHover={{ scale: 1.05, y: -3 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                AI-Powered Legal Intelligence
              </motion.div>
              
              <h1 className={`text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 leading-[1.1] ${isDarkMode ? 'text-[#ECEDEE]' : 'text-[#1C1F26]'}`}>
                Intelligent legal{' '}
                <br className="hidden lg:block" />
                analysis{' '}
                <motion.span 
                  className={`inline-block bg-clip-text text-transparent ${
                    isDarkMode 
                      ? 'bg-gradient-to-r from-[#4FC4C4] to-[#4FC4C4]/70' 
                      : 'bg-gradient-to-r from-[#2F3C7E] to-[#2F3C7E]/70'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                >
                  on demand
                </motion.span>
              </h1>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className={`text-lg lg:text-xl leading-relaxed ${isDarkMode ? 'text-[#B4B7BD]' : 'text-[#4E535E]'}`}
            >
              Transform your legal workflow with AI-powered document review that delivers{' '}
              <span className={`font-semibold ${isDarkMode ? 'text-[#ECEDEE]' : 'text-[#1C1F26]'}`}>
                trusted accuracy
              </span>{' '}
              at unprecedented speed.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-wrap gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.06, y: -3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowLandingPage(false)}
                className={`
                  group px-8 py-3 rounded-2xl font-bold text-base transition-all shadow-xl relative overflow-hidden
                  ${isDarkMode
                    ? 'bg-gradient-to-r from-[#4FC4C4] to-[#3FB3B3] hover:from-[#3FB3B3] hover:to-[#4FC4C4] text-[#1C1F26] shadow-[#4FC4C4]/30'
                    : 'bg-gradient-to-r from-[#2F3C7E] to-[#222B53] hover:from-[#222B53] hover:to-[#2F3C7E] text-white shadow-[#2F3C7E]/30'}
                `}
              >
                <span className="relative z-10 flex items-center gap-2">
                  Main Menu
                  <motion.span
                    className="inline-block"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </span>
                <motion.div
                  className={`absolute inset-0 ${isDarkMode ? 'bg-white/20' : 'bg-white/30'}`}
                  initial={{ x: '-100%', skewX: -20 }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.06, y: -3 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  group px-8 py-3 rounded-2xl font-bold text-base transition-all border-3 relative overflow-hidden backdrop-blur-sm
                  ${isDarkMode
                    ? 'border-[#4FC4C4] text-[#4FC4C4] hover:bg-[#4FC4C4]/15 shadow-lg shadow-[#4FC4C4]/10'
                    : 'border-[#2F3C7E] text-[#2F3C7E] hover:bg-[#2F3C7E]/10 shadow-lg shadow-[#2F3C7E]/10'}
                `}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                  </svg>
                  Watch Demo
                </span>
              </motion.button>
            </motion.div>
            
            {/* Stats with cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="grid grid-cols-3 gap-4 pt-6"
            >
              {[
                { value: '99.9%', label: 'Accuracy', icon: '🎯', delay: 0 },
                { value: '10x', label: 'Faster', icon: '⚡', delay: 0.1 },
                { value: '24/7', label: 'Available', icon: '🌐', delay: 0.2 }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -6, scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ transitionDelay: `${stat.delay}s` }}
                  className={`
                    p-4 rounded-2xl cursor-default backdrop-blur-sm
                    ${isDarkMode 
                      ? 'bg-gradient-to-br from-[#2F3C7E]/30 to-[#4FC4C4]/20 border border-[#4FC4C4]/30' 
                      : 'bg-gradient-to-br from-white/60 to-[#F7F3EB]/60 border border-[#2F3C7E]/20'}
                  `}
                >
                  <div className="text-xl mb-1">{stat.icon}</div>
                  <div className={`text-2xl lg:text-3xl font-black mb-1 ${isDarkMode ? 'text-[#4FC4C4]' : 'text-[#2F3C7E]'}`}>
                    {stat.value}
                  </div>
                  <div className={`text-sm font-medium ${isDarkMode ? 'text-[#B4B7BD]' : 'text-[#4E535E]'}`}>
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
          
          {/* Completely redesigned illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.9 }}
            className="relative h-[400px] lg:h-[450px]"
          >
            <div
              className={`
                absolute inset-0 rounded-3xl flex items-center justify-center overflow-hidden
                ${isDarkMode
                  ? 'bg-gradient-to-br from-[#222B53] via-[#2F3C7E] to-[#222B53]'
                  : 'bg-gradient-to-br from-[#F7F3EB] via-white to-[#EDE7DB]'}
              `}
            >
              {/* Radial spotlight effect */}
              <motion.div 
                className="absolute inset-0"
                animate={{
                  background: [
                    `radial-gradient(circle at 50% 50%, ${isDarkMode ? 'rgba(79, 196, 196, 0.15)' : 'rgba(47, 60, 126, 0.08)'}, transparent 60%)`,
                    `radial-gradient(circle at 60% 40%, ${isDarkMode ? 'rgba(79, 196, 196, 0.15)' : 'rgba(47, 60, 126, 0.08)'}, transparent 60%)`,
                    `radial-gradient(circle at 40% 60%, ${isDarkMode ? 'rgba(79, 196, 196, 0.15)' : 'rgba(47, 60, 126, 0.08)'}, transparent 60%)`,
                    `radial-gradient(circle at 50% 50%, ${isDarkMode ? 'rgba(79, 196, 196, 0.15)' : 'rgba(47, 60, 126, 0.08)'}, transparent 60%)`,
                  ]
                }}
                transition={{ duration: 10, repeat: Infinity }}
              />
              
              {/* Animated circles */}
              <motion.div
                animate={{
                  y: [0, -30, 0],
                  scale: [1, 1.15, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className={`
                  w-64 h-64 rounded-full absolute top-5 right-5 blur-3xl
                  ${isDarkMode ? 'bg-[#4FC4C4]/25' : 'bg-[#2F3C7E]/15'}
                `}
              />
              <motion.div
                animate={{
                  y: [0, 30, 0],
                  scale: [1.1, 1, 1.1],
                  rotate: [360, 180, 0],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className={`
                  w-48 h-48 rounded-full absolute bottom-5 left-5 blur-3xl
                  ${isDarkMode ? 'bg-[#2F3C7E]/30' : 'bg-[#4FC4C4]/12'}
                `}
              />
              
              {/* Main document illustration */}
              <motion.div
                className="relative z-10"
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <motion.svg
                  className="w-64 h-64 drop-shadow-2xl"
                  viewBox="0 0 240 240"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 1 }}
                >
                  {/* Layered document effect */}
                  <motion.rect
                    x="75"
                    y="45"
                    width="110"
                    height="150"
                    rx="12"
                    fill={isDarkMode ? 'rgba(79, 196, 196, 0.1)' : 'rgba(47, 60, 126, 0.08)'}
                    initial={{ x: 70, y: 40 }}
                    animate={{ x: 75, y: 45 }}
                    transition={{ delay: 0.8 }}
                  />
                  
                  <motion.rect
                    x="65"
                    y="35"
                    width="110"
                    height="150"
                    rx="12"
                    fill={isDarkMode ? 'rgba(79, 196, 196, 0.15)' : 'rgba(47, 60, 126, 0.12)'}
                    initial={{ x: 60, y: 30 }}
                    animate={{ x: 65, y: 35 }}
                    transition={{ delay: 0.9 }}
                  />
                  
                  {/* Main document */}
                  <motion.rect
                    x="55"
                    y="25"
                    width="110"
                    height="150"
                    rx="12"
                    className={isDarkMode ? 'stroke-[#4FC4C4]' : 'stroke-[#2F3C7E]'}
                    strokeWidth="4"
                    fill={isDarkMode ? '#1A1C20' : '#FFFFFF'}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                  />
                  
                  {/* Folded corner with better detail */}
                  <motion.path
                    d="M165 50 L135 25 L165 25 Z"
                    className={isDarkMode ? 'fill-[#4FC4C4]/30' : 'fill-[#2F3C7E]/20'}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  />
                  <motion.path
                    d="M165 50 L135 25"
                    className={isDarkMode ? 'stroke-[#4FC4C4]' : 'stroke-[#2F3C7E]'}
                    strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 1.1 }}
                  />
                  
                  {/* Text lines with different animations */}
                  {[
                    { y: 65, width: 70, delay: 1.3 },
                    { y: 85, width: 85, delay: 1.5 },
                    { y: 105, width: 60, delay: 1.7 },
                    { y: 125, width: 80, delay: 1.9 }
                  ].map((line, i) => (
                    <motion.line
                      key={i}
                      x1="70"
                      y1={line.y}
                      x2={70 + line.width}
                      y2={line.y}
                      className={isDarkMode ? 'stroke-[#4FC4C4]' : 'stroke-[#2F3C7E]'}
                      strokeWidth="4"
                      strokeLinecap="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 0.8 }}
                      transition={{ delay: line.delay, duration: 0.6 }}
                    />
                  ))}
                  
                  {/* AI checkmark with glow effect */}
                  <motion.circle
                    cx="110"
                    cy="155"
                    r="22"
                    className={isDarkMode ? 'fill-[#4FC4C4]/20' : 'fill-[#2F3C7E]/10'}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 2.1, type: "spring", stiffness: 200 }}
                  />
                  <motion.circle
                    cx="110"
                    cy="155"
                    r="18"
                    className={isDarkMode ? 'fill-[#4FC4C4]' : 'fill-[#2F3C7E]'}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 2.2, type: "spring", stiffness: 200, damping: 8 }}
                  />
                  <motion.path
                    d="M100 155 L106 161 L120 146"
                    stroke="white"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 2.4, duration: 0.6 }}
                  />
                  
                  {/* Sparkle effects */}
                  {[
                    { x: 45, y: 70, delay: 2.6 },
                    { x: 175, y: 90, delay: 2.8 },
                    { x: 50, y: 140, delay: 3 }
                  ].map((sparkle, i) => (
                    <motion.g
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
                      transition={{ 
                        delay: sparkle.delay, 
                        duration: 1.5, 
                        repeat: Infinity,
                        repeatDelay: 2
                      }}
                    >
                      <path
                        d={`M${sparkle.x} ${sparkle.y - 5} L${sparkle.x} ${sparkle.y + 5} M${sparkle.x - 5} ${sparkle.y} L${sparkle.x + 5} ${sparkle.y}`}
                        className={isDarkMode ? 'stroke-[#4FC4C4]' : 'stroke-[#2F3C7E]'}
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </motion.g>
                  ))}
                </motion.svg>
              </motion.div>
              
              {/* More dynamic floating particles */}
              {[...Array(15)].map((_, i) => (
                <motion.div
                  key={i}
                  className={`absolute rounded-full ${
                    isDarkMode ? 'bg-[#4FC4C4]' : 'bg-[#2F3C7E]'
                  }`}
                  style={{
                    width: `${3 + (i % 5)}px`,
                    height: `${3 + (i % 5)}px`,
                    left: `${8 + (i * 6.5)}%`,
                    top: `${10 + ((i % 5) * 18)}%`,
                  }}
                  animate={{
                    y: [0, -50 - (i % 4) * 15, 0],
                    x: [0, (i % 3 === 0 ? 25 : i % 3 === 1 ? -25 : 0), 0],
                    opacity: [0.1, 0.7, 0.1],
                    scale: [0.8, 1.4, 0.8],
                  }}
                  transition={{
                    duration: 4 + (i * 0.2),
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.15,
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}