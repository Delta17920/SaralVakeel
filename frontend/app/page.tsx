'use client';
import React, { useState, useEffect } from 'react';
import LegalDocumentUploader from "../components/LegalDocumentUploader";
import AIAnalysis from "../components/AIAnalysis";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { DocumentReport } from '../components/DocumentReport';
import { ReportsList } from '@/components/ReportsList';
import { UseCases } from '../components/UseCases';
import { HowItWorks } from '../components/HowItWorks';
import { motion } from "framer-motion";
import HeroSection from '@/components/HeroSection';
import { Sun, Moon } from 'lucide-react';
import { useRouter } from "next/navigation";
import { useAuth } from "../components/AuthProvider";

export default function Home() {
  const router = useRouter();
  const { session } = useAuth();
  const [isDarkMode, setIsDarkModeState] = useState(false);

  useEffect(() => {
    if (session) {
      setShowLandingPage(false);
    } else {
      setShowLandingPage(true);
    }
  }, [session]);

  useEffect(() => {
    const storedTheme = localStorage.getItem('saral-theme-preference');
    if (storedTheme === 'dark') {
      setIsDarkModeState(true);
    } else if (storedTheme === 'light') {
      setIsDarkModeState(false);
    }
  }, []);

  const setIsDarkMode = (value: boolean) => {
    setIsDarkModeState(value);
    localStorage.setItem('saral-theme-preference', value ? 'dark' : 'light');
  };
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('documents');
  const [uploadedFilesCount] = useState(0);
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

      case 'reports':
        return (
          <div className={`${isDarkMode ? "" : "bg-white border border-[#D8D2C7] shadow-sm  "}`}>
            <ReportsList
              isDarkMode={isDarkMode}
              onViewReport={handleViewReport}
            />
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
      <div className={`min-h-screen transition-colors duration-300 ${themeClasses} relative overflow-x-hidden`}>

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
          <div className="max-w-7xl mx-auto px-6 py-2 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="font-bold text-2xl font-[family-name:var(--font-playfair)]">Saral Vakeel</span>
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
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </nav>

        {/* HERO Section */}
        <div className="-mt-8">
          <HeroSection
            isDarkMode={isDarkMode}
            setShowLandingPage={(value) => {
              if (value === false) {
                if (session) {
                  setShowLandingPage(false);
                } else {
                  router.push('/login');
                }
              } else {
                setShowLandingPage(true);
              }
            }}
          />
        </div>
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
        isDesktopCollapsed={isDesktopCollapsed}
        setIsDesktopCollapsed={setIsDesktopCollapsed}
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
          isDesktopCollapsed={isDesktopCollapsed}
          setIsDesktopCollapsed={setIsDesktopCollapsed}
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
