'use client';
import React, { useState } from 'react';
import LegalDocumentUploader from "../components/LegalDocumentUploader";
import AIAnalysis from "../components/AIAnalysis";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { DocumentReport } from '../components/DocumentReport';
import ReportsList from '../components/ReportsList';
import AppOverview from '../components/AppOverview';

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [uploadedFilesCount] = useState(5);
  
  // Add state for report view
  const [selectedReportFilename, setSelectedReportFilename] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);

  const themeClasses = isDarkMode
    ? 'bg-gray-950 text-white'
    : 'bg-slate-50 text-gray-900';

  // Handle viewing detailed report
  const handleViewReport = (filename: string) => {
    setSelectedReportFilename(filename);
    setShowReport(true);
  };

  // Handle going back from report
  const handleBackFromReport = () => {
    setShowReport(false);
    setSelectedReportFilename(null);
  };

  // Function to render the active component based on selected tab
  const renderActiveComponent = () => {
    // If showing report, render DocumentReport
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
      case 'overview':
        return (
          <AppOverview isDarkMode={isDarkMode}/>
        );
case 'documents':
  return (
    <LegalDocumentUploader 
      isDarkMode={isDarkMode}
      onViewReport={handleViewReport}
    />
  );
      case 'analysis':
        return (
          <AIAnalysis 
            isDarkMode={isDarkMode} 
            onViewReport={handleViewReport}
          />
        );
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
          <ReportsList 
          isDarkMode={isDarkMode}
          onViewReport={handleViewReport}
          />
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
       
        <main className="flex-1">
          {renderActiveComponent()}
          <Footer isDarkMode={isDarkMode} />
        </main>
      </div>
    </div>
  );
}