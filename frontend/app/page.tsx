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
       <section className="max-w-7xl mx-auto px-6 py-20 relative z-10">
          <div className={`
            grid md:grid-cols-2 gap-12 items-center
            rounded-3xl p-8 md:p-12
            ${isDarkMode 
              ? 'bg-gradient-to-br from-[#1A1C20] to-[#222B53] border border-[#4FC4C4]/20' 
              : 'bg-gradient-to-br from-white to-[#F7F3EB] border border-[#D8D2C7] shadow-xl'}
          `}>
            
            <div>
              <h1 className={`text-5xl lg:text-6xl font-bold mb-6 leading-tight ${isDarkMode ? 'text-[#ECEDEE]' : 'text-[#1C1F26]'}`}>
                Intelligent legal analysis on demand
              </h1>
              <p className={`text-xl mb-8 ${isDarkMode ? 'text-[#B4B7BD]' : 'text-[#4E535E]'}`}>
                AI-powered document review with trusted accuracy for your legal team, on-demand.
              </p>
              <button
                onClick={() => setShowLandingPage(false)}
                className={`
                  px-8 py-4 rounded-lg font-semibold transition-colors w-fit
                  ${isDarkMode
                    ? 'bg-[#4FC4C4] hover:bg-[#3FB3B3] text-[#1C1F26]'
                    : 'bg-[#2F3C7E] hover:bg-[#222B53] text-white'}
                `}
              >
                Main Menu
              </button>
            </div>

            {/* Illustration unchanged */}
            <div className="relative h-[400px]">
  <div
    className={`
      absolute inset-0 rounded-3xl flex items-center justify-center
      ${
        isDarkMode
          ? 'bg-gradient-to-br from-[#222B53] to-[#2F3C7E]'
          : 'bg-gradient-to-br from-[#F7F3EB] to-[#EDE7DB]'
      }
    `}
  >
    {/* Floating circles */}
    <div
      className={`
        w-48 h-48 rounded-full absolute top-10 right-10 animate-pulse
        ${isDarkMode ? 'bg-[#4FC4C4]/20' : 'bg-[#A89F8F]/15'}
      `}
    ></div>

    <div
      className={`
        w-32 h-32 rounded-full absolute bottom-10 left-10 animate-pulse delay-75
        ${isDarkMode ? 'bg-[#4FC4C4]/30' : 'bg-[#A89F8F]/25'}
      `}
    ></div>

    {/* ====================== DOCUMENT SKETCH ====================== */}
    <svg
      className="w-48 h-48 z-10"
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Document outline */}
      <rect
        x="50"
        y="30"
        width="100"
        height="140"
        rx="10"
        className={isDarkMode ? 'stroke-[#4FC4C4]' : 'stroke-[#6B6A64]'}
        strokeWidth="3"
        fill={isDarkMode ? '#1A1C20' : '#FFFFFF'}
      />

      {/* Folded top-right corner */}
      <path
        d="M150 55 L125 30 L150 30 Z"
        className={isDarkMode ? 'fill-[#4FC4C4]/20' : 'fill-[#D8D2C7]'}
      />

      {/* Text lines */}
      <line
        x1="65"
        y1="70"
        x2="135"
        y2="70"
        className={isDarkMode ? 'stroke-[#4FC4C4]' : 'stroke-[#6B6A64]'}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1="65"
        y1="90"
        x2="125"
        y2="90"
        className={isDarkMode ? 'stroke-[#4FC4C4]' : 'stroke-[#6B6A64]'}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1="65"
        y1="110"
        x2="140"
        y2="110"
        className={isDarkMode ? 'stroke-[#4FC4C4]' : 'stroke-[#6B6A64]'}
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Checkmark circle */}
      <circle
        cx="100"
        cy="145"
        r="16"
        className={isDarkMode ? 'fill-[#4FC4C4]' : 'fill-[#6B6A64]'}
      />

      {/* Checkmark */}
      <path
        d="M92 145 L97 150 L108 138"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
    {/* ============================================================= */}
  </div>
</div>


          </div>
        </section>

        {/* How It Works */}
        <div className={`${isDarkMode ? "" : "border-t border-[#D8D2C7]"}`}>
          <HowItWorks isDarkMode={isDarkMode} />
        </div>

        {/* Use Cases */}
        <div className={`${isDarkMode ? "" : "border-t border-[#D8D2C7]"}`}>
          <UseCases isDarkMode={isDarkMode} />
        </div>

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
