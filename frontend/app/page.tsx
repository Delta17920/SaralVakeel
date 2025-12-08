'use client';
import React, { useState } from 'react';
import LegalDocumentUploader from "../components/LegalDocumentUploader";
import AIAnalysis from "../components/AIAnalysis";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { DocumentReport } from '../components/DocumentReport';
import ReportsList from '../components/ReportsList';
import { UseCases } from '../components/UseCases';
import { HowItWorks } from '../components/HowItWorks';
import {motion} from "framer-motion";

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('documents');
  const [uploadedFilesCount] = useState(5);
  const [showLandingPage, setShowLandingPage] = useState(true);

  const [selectedReportFilename, setSelectedReportFilename] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);

  // NEW light mode background (warm beige)
  const themeClasses = isDarkMode
    ? 'bg-[#101114] text-[#ECEDEE]'
    : 'bg-stone-100 text-[#1C1F26]';

  const handleViewReport = (filename: string) => {
    setSelectedReportFilename(filename);
    setShowReport(true);
  };

  const handleBackFromReport = () => {
    setShowReport(false);
    setSelectedReportFilename(null);
  };

  const renderActiveComponent = () => {
    if (showReport) {
      return (
        <DocumentReport
          isDarkMode={isDarkMode}
          filename={selectedReportFilename || undefined}
          onBack={handleBackFromReport}
        />
      );
    }

    switch (activeTab) {
      case 'documents':
        return (
          <div className={`${isDarkMode ? "" : "bg-white border border-[#D8D2C7] shadow-sm "}`}>
            <LegalDocumentUploader
              isDarkMode={isDarkMode}
              onViewReport={handleViewReport}
            />
          </div>
        );

      case 'analysis':
        return (
          <div className={`${isDarkMode ? "" : "bg-white border border-[#D8D2C7] shadow-sm  "}`}>
            <AIAnalysis
              isDarkMode={isDarkMode}
              onViewReport={handleViewReport}
            />
          </div>
        );

      case 'compliance':
        return (
          <div className={`${isDarkMode ? "" : "bg-white border border-[#D8D2C7] shadow-sm  "}`}>
            <h1 className="text-3xl font-bold mb-4">Compliance Dashboard</h1>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              Compliance monitoring features coming soon...
            </p>
          </div>
        );

      case 'reports':
        return (
          <div className={`${isDarkMode ? "" : "bg-white border border-[#D8D2C7] shadow-sm  "}`}>
            <ReportsList
              isDarkMode={isDarkMode}
              onViewReport={handleViewReport}
            />
          </div>
        );

      case 'team':
        return (
          <div className={`${isDarkMode ? "" : "bg-white border border-[#D8D2C7] shadow-sm  "}`}>
            <h1 className="text-3xl font-bold mb-4">Team Management</h1>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              Team management features coming soon...
            </p>
          </div>
        );

      default:
        return (
          <div className={`${isDarkMode ? "" : "bg-white border border-[#D8D2C7] shadow-sm "}`}>
            <LegalDocumentUploader />
          </div>
        );
    }
  };

  // Landing page styling updates (light mode)
  if (showLandingPage) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${themeClasses} relative overflow-hidden`}>

        {/* Updated Navbar for light mode */}
        <nav
          className={`
            ${isDarkMode
              ? 'bg-[#1A1C20]/80 backdrop-blur-sm'
              : 'bg-[#EDE7DB] backdrop-blur-sm'
            }
            border-b
            ${isDarkMode ? 'border-[#2B2E35]' : 'border-[#D8D2C7]'}
            shadow-[0_2px_4px_rgba(0,0,0,0.08)]
            relative z-10
          `}
        >
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl">Saral Vakeel</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`
                  p-2 rounded-lg transition-colors
                  ${isDarkMode
                    ? 'border border-white bg-[#2B2E35] hover:bg-[#3B3E45]'
                    : 'border border-black/30 bg-[#F5F0E6] hover:bg-[#E9E2D7]'
                  }
                `}
              >
                {isDarkMode ? 'Light' : 'Dark'}
              </button>
            </div>
          </div>
        </nav>

       {/* HERO Section */}
<section className="h-[92vh] flex items-center relative overflow-hidden pt-8 pb-10">

  {/* Animated background elements */}
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.5, 0.3],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={`absolute -top-20 -right-20 w-96 h-96 rounded-full blur-3xl ${
        isDarkMode ? 'bg-[#4FC4C4]/20' : 'bg-[#2F3C7E]/10'
      }`}
    />
    <motion.div
      animate={{
        scale: [1.2, 1, 1.2],
        opacity: [0.2, 0.4, 0.2],
      }}
      transition={{
        duration: 10,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={`absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full blur-3xl ${
        isDarkMode ? 'bg-[#2F3C7E]/20' : 'bg-[#4FC4C4]/10'
      }`}
    />
  </div>

  <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className={`
        grid lg:grid-cols-2 gap-12 items-center
        rounded-3xl p-8 md:p-12
        backdrop-blur-sm
        ${isDarkMode 
          ? 'bg-gradient-to-br from-[#1A1C20]/80 to-[#222B53]/80 border border-[#4FC4C4]/30 shadow-2xl shadow-[#4FC4C4]/10' 
          : 'bg-gradient-to-br from-white/90 to-[#F7F3EB]/90 border border-[#D8D2C7]/50 shadow-2xl'}
      `}
    >
      
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <motion.span
            className={`inline-block px-4 py-2 rounded-full text-sm font-semibold mb-4 ${
              isDarkMode 
                ? 'bg-[#4FC4C4]/20 text-[#4FC4C4] border border-[#4FC4C4]/30' 
                : 'bg-[#2F3C7E]/10 text-[#2F3C7E] border border-[#2F3C7E]/30'
            }`}
            whileHover={{ scale: 1.05 }}
          >
            AI-Powered Legal Intelligence
          </motion.span>
          
          <h1 className={`text-4xl lg:text-6xl font-bold mb-4 leading-tight ${isDarkMode ? 'text-[#ECEDEE]' : 'text-[#1C1F26]'}`}>
            Intelligent legal analysis{' '}
            <span className={isDarkMode ? 'text-[#4FC4C4]' : 'text-[#2F3C7E]'}>
              on demand
            </span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className={`text-lg lg:text-xl leading-relaxed ${isDarkMode ? 'text-[#B4B7BD]' : 'text-[#4E535E]'}`}
        >
          AI-powered document review with trusted accuracy for your legal team, on-demand.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex flex-wrap gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowLandingPage(false)}
            className={`
              px-6 py-3 rounded-xl font-semibold transition-all shadow-lg
              ${isDarkMode
                ? 'bg-[#4FC4C4] hover:bg-[#3FB3B3] text-[#1C1F26] shadow-[#4FC4C4]/20'
                : 'bg-[#2F3C7E] hover:bg-[#222B53] text-white shadow-[#2F3C7E]/20'}
            `}
          >
            Main Menu
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
              px-6 py-3 rounded-xl font-semibold transition-all border-2
              ${isDarkMode
                ? 'border-[#4FC4C4] text-[#4FC4C4] hover:bg-[#4FC4C4]/10'
                : 'border-[#2F3C7E] text-[#2F3C7E] hover:bg-[#2F3C7E]/10'}
            `}
          >
            Watch Demo
          </motion.button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="grid grid-cols-3 gap-6 pt-6 border-t border-opacity-20"
          style={{ borderColor: isDarkMode ? '#4FC4C4' : '#2F3C7E' }}
        >
          <div>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-[#4FC4C4]' : 'text-[#2F3C7E]'}`}>
              99.9%
            </div>
            <div className={`text-sm ${isDarkMode ? 'text-[#B4B7BD]' : 'text-[#4E535E]'}`}>
              Accuracy
            </div>
          </div>
          <div>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-[#4FC4C4]' : 'text-[#2F3C7E]'}`}>
              10x
            </div>
            <div className={`text-sm ${isDarkMode ? 'text-[#B4B7BD]' : 'text-[#4E535E]'}`}>
              Faster
            </div>
          </div>
          <div>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-[#4FC4C4]' : 'text-[#2F3C7E]'}`}>
              24/7
            </div>
            <div className={`text-sm ${isDarkMode ? 'text-[#B4B7BD]' : 'text-[#4E535E]'}`}>
              Available
            </div>
          </div>
        </motion.div>
      </div>

      {/* Enhanced Illustration */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="relative h-[450px]"
      >
        <div
          className={`
            absolute inset-0 rounded-3xl flex items-center justify-center overflow-hidden
            ${isDarkMode
              ? 'bg-gradient-to-br from-[#222B53] to-[#2F3C7E]'
              : 'bg-gradient-to-br from-[#F7F3EB] to-[#EDE7DB]'}
          `}
        >
          {/* Animated floating circles */}
          <motion.div
            animate={{
              y: [0, -20, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className={`
              w-48 h-48 rounded-full absolute top-10 right-10
              ${isDarkMode ? 'bg-[#4FC4C4]/20' : 'bg-[#A89F8F]/15'}
            `}
          />

          <motion.div
            animate={{
              y: [0, 20, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className={`
              w-32 h-32 rounded-full absolute bottom-10 left-10
              ${isDarkMode ? 'bg-[#4FC4C4]/30' : 'bg-[#A89F8F]/25'}
            `}
          />

          {/* Document with animation */}
          <motion.svg
            className="w-52 h-52 z-10"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            {/* Document outline */}
            <motion.rect
              x="50"
              y="30"
              width="100"
              height="140"
              rx="10"
              className={isDarkMode ? 'stroke-[#4FC4C4]' : 'stroke-[#6B6A64]'}
              strokeWidth="3"
              fill={isDarkMode ? '#1A1C20' : '#FFFFFF'}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />

            {/* Folded corner */}
            <motion.path
              d="M150 55 L125 30 L150 30 Z"
              className={isDarkMode ? 'fill-[#4FC4C4]/20' : 'fill-[#D8D2C7]'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            />

            {/* Text lines with stagger */}
            {[70, 90, 110].map((y, i) => (
              <motion.line
                key={i}
                x1="65"
                y1={y}
                x2={i === 1 ? 125 : i === 0 ? 135 : 140}
                y2={y}
                className={isDarkMode ? 'stroke-[#4FC4C4]' : 'stroke-[#6B6A64]'}
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ delay: 1 + i * 0.2, duration: 0.5 }}
              />
            ))}

            {/* Checkmark circle */}
            <motion.circle
              cx="100"
              cy="145"
              r="16"
              className={isDarkMode ? 'fill-[#4FC4C4]' : 'fill-[#6B6A64]'}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.8, type: "spring", stiffness: 200 }}
            />

            {/* Checkmark */}
            <motion.path
              d="M92 145 L97 150 L108 138"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 2, duration: 0.5 }}
            />
          </motion.svg>

          {/* Floating particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-2 h-2 rounded-full ${
                isDarkMode ? 'bg-[#4FC4C4]' : 'bg-[#2F3C7E]'
              }`}
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 2) * 40}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.3,
              }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  </div>
</section>

        {/* How It Works - Slide from Left */}
        <motion.div 
          className={`${isDarkMode ? "" : "border-t border-[#D8D2C7]"}`}
          initial={{ opacity: 0, x: -80 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ 
            duration: 0.7, 
            ease: [0.22, 1, 0.36, 1]
          }}
        >
          <HowItWorks isDarkMode={isDarkMode} />
        </motion.div>
        {/* Use Cases - Scale Effect */}
        <motion.div 
          className={`${isDarkMode ? "" : "border-t border-[#D8D2C7]"}`}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ 
            duration: 0.7, 
            ease: [0.16, 1, 0.3, 1]
          }}
        >
          <UseCases isDarkMode={isDarkMode} />
        </motion.div>

        {/* FAQ */}
        {/* <section className="max-w-4xl mx-auto px-6 py-16 relative z-10">
          <div className="text-center mb-12">
            <h2 className={`text-4xl font-bold ${isDarkMode ? 'text-[#ECEDEE]' : 'text-[#1C1F26]'}`}>
              Common questions
            </h2>
          </div>

          <div className="space-y-4">
            {[
              { q: "What is LegalAI?", a: "LegalAI is an AI-powered platform..." },
              { q: "How accurate is the AI analysis?", a: "Our AI is trained..." },
              { q: "Is my data secure?", a: "Yes, we use enterprise-grade encryption..." },
              { q: "What types of documents can I analyze?", a: "We support contracts..." },
            ].map((faq, idx) => (
              <details
                key={idx}
                className={`
                  rounded-xl p-6 border transition-all
                  ${isDarkMode
                    ? 'bg-[#1A1C20] border-[#2B2E35]'
                    : 'bg-white border-[#D8D2C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                  }
                `}
              >
                <summary className={`font-semibold cursor-pointer ${isDarkMode ? 'text-[#ECEDEE]' : 'text-[#1C1F26]'}`}>
                  {faq.q}
                </summary>
                <p className={`mt-4 ${isDarkMode ? 'text-[#B4B7BD]' : 'text-[#4E535E]'}`}>
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </section> */}

        {/* Footer — NEW Light Mode color */}
        <footer
          className={`
            ${isDarkMode
              ? 'bg-[#1A1C20]/80 backdrop-blur-sm'
              : 'bg-[#F1ECE2]/90 backdrop-blur-sm'
            }
            
            border-t
            ${isDarkMode ? 'border-[#2B2E35]' : 'border-[#D8D2C7]'}
            relative z-10
          `}
        >
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <span className="font-bold text-xl">Saral Vakeel</span>
                <p className={`text-sm mt-2 ${isDarkMode ? 'text-[#8F939A]' : 'text-[#7A7F89]'}`}>
                  AI-powered legal document analysis for modern teams.
                </p>
              </div>
            </div>

            <div className={`mt-12 pt-8 border-t ${isDarkMode ? 'border-[#2B2E35]' : 'border-[#D8D2C7]'} text-center`}>
              <p className={`text-sm ${isDarkMode ? 'text-[#8F939A]' : 'text-[#7A7F89]'}`}>
                © 2025 Saral Vakeel Inc. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // MAIN APPLICATION VIEW (after closing landing page)
  return (
    <div className={`min-h-screen transition-colors duration-300 ${themeClasses}`}>

      {/* Fade overlay when sidebar opens */}
      {sidebarExpanded && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarExpanded(false)}
        />
      )}

      <Navbar
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        sidebarExpanded={sidebarExpanded}
        setSidebarExpanded={setSidebarExpanded}
        showLandingPage={showLandingPage}
        setShowLandingPage={setShowLandingPage}
      />

      <div className="flex">
        <Sidebar
          isDarkMode={isDarkMode}
          sidebarExpanded={sidebarExpanded}
          setSidebarExpanded={setSidebarExpanded}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          uploadedFilesCount={uploadedFilesCount}
          showReport={showReport}
          onBackFromReport={handleBackFromReport}
        />

        {/* MAIN CONTENT */}
        <main className="flex-1">
          {renderActiveComponent()}
          <Footer isDarkMode={isDarkMode} />
        </main>
      </div>
    </div>
  );
}
