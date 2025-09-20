'use client';

import React, { useState } from 'react';
import LegalDocumentUploader from "../components/LegalDocumentUploader";
import AIAnalysis from "../components/AIAnalysis";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [uploadedFilesCount] = useState(5); // You can manage this state as needed

  const themeClasses = isDarkMode 
    ? 'bg-gray-950 text-white' 
    : 'bg-slate-50 text-gray-900';

  // Function to render the active component based on selected tab
  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'overview':
      case 'documents':
        return <LegalDocumentUploader />;
      case 'analysis':
        return <AIAnalysis isDarkMode={isDarkMode} />;
      case 'compliance':
        return (
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">Compliance Dashboard</h1>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              Compliance monitoring features coming soon...
            </p>
          </div>
        );
      case 'reports':
        return (
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">Reports</h1>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              Reporting features coming soon...
            </p>
          </div>
        );
      case 'team':
        return (
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">Team Management</h1>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              Team management features coming soon...
            </p>
          </div>
        );
      default:
        return <LegalDocumentUploader />;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${themeClasses}`}>
      <Navbar
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      
      <div className="flex">
        <Sidebar
          isDarkMode={isDarkMode}
          sidebarExpanded={sidebarExpanded}
          setSidebarExpanded={setSidebarExpanded}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          uploadedFilesCount={uploadedFilesCount}
        />
        
        <main className="flex-1">
          {renderActiveComponent()}
          <Footer isDarkMode={isDarkMode} />
        </main>
      </div>
    </div>
  );
}