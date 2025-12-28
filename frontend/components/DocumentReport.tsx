import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import ChatInterface from './ChatInterface';
import PdfViewer from './PdfViewer';
import {
  FileText,
  Shield,
  AlertTriangle,
  Users,
  CheckCircle,
  Eye,
  Download,
  ArrowLeft,
  ChevronRight,
  Target,
  Brain,
  AlertCircle,
  Tag,
  Activity,
  Star,
  Share2,
  MessageSquare
} from 'lucide-react';

interface ReportProps {
  isDarkMode?: boolean;
  filename?: string;
  onBack?: () => void;
}

interface DocumentData {
  documentTitle: string;
  documentType: string;
  summary: string;
  keyTerms: string[];
  obligations: string[];
  parties: Array<{
    name: string;
    type: string;
    role?: string;
  }>;
  risks: string[];
  risk_score: number
}

export const DocumentReport: React.FC<ReportProps> = ({ isDarkMode = false, filename, onBack }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [documentData, setDocumentData] = useState<DocumentData>({
    documentTitle: "Loading...",
    documentType: "Document",
    summary: "Loading document data...",
    keyTerms: [],
    obligations: [],
    parties: [],
    risks: [],
    risk_score: 0,
  });

  const [activePdfPage, setActivePdfPage] = useState(1);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [highlightedText, setHighlightedText] = useState<string | undefined>(undefined);

  // Fetch document data when filename is provided
  useEffect(() => {
    const fetchDocumentData = async () => {
      if (!filename) {
        // Use default data if no filename provided
        setDocumentData({
          documentTitle: "CPU Scheduling Algorithm Simulation Program Assignment",
          documentType: "Programming Assignment",
          summary: "This document outlines a programming assignment focused on simulating CPU scheduling algorithms, specifically First-Come-First-Serve (FCFS) and Shortest Job First (SJF), using Python. The program must calculate process execution metrics and visualize the scheduling process.",
          keyTerms: ["CPU Scheduling", "FCFS Algorithm", "SJF Algorithm", "Python Programming", "Process Simulation", "Execution Metrics", "Gantt Chart", "Turnaround Time", "Waiting Time"],
          obligations: [
            "Write a Python program to simulate the FCFS CPU scheduling algorithm.",
            "Write a Python program to simulate the SJF CPU scheduling algorithm.",
            "Accept the number of processes from the user.",
            "Accept arrival time and burst time for each process.",
            "Calculate and display waiting time for each process.",
            "Calculate and display turnaround time for each process.",
            "Display a Gantt chart showing the scheduling order and timing."
          ],
          parties: [
            { name: "Student", type: "Individual", role: "Assignment Executor" },
            { name: "Instructor", type: "Individual", role: "Assignment Reviewer" }
          ],
          risks: [
            "The document does not explicitly specify error handling or input validation requirements.",
            "The document does not define the format or structure of the input data for the processes (arrival time and burst time).",
            "The document does not specify whether preemptive or non-preemptive SJF is required."
          ],
          risk_score: 5.0,
        });
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('id', filename)
          .single();

        if (error) {
          throw new Error(`Failed to fetch document: ${error.message}`);
        }

        const fileData = data.metadata || {};
        console.log('Fetched document data:', fileData);

        // Map the Supabase response to our component structure
        const mappedData: DocumentData = {
          documentTitle: fileData.documentTitle || filename.replace(/\.[^/.]+$/, ''),
          documentType: fileData.documentType || 'Document',
          summary: fileData.summary || 'No summary available.',
          keyTerms: fileData.keyTerms?.map((item: string | { term: string }) => typeof item === 'string' ? item : item.term) || [],
          obligations: fileData.obligations || [],
          parties: fileData.parties || [],
          risks: fileData.risks || [],
          risk_score: fileData.riskScore ?? fileData['risk score'] ?? fileData.risk_score ?? 0,
        };

        setDocumentData(mappedData);
      } catch (error) {
        console.error('Error fetching document data:', error);
        // Set error state data
        setDocumentData({
          documentTitle: filename ? filename.replace(/\.[^/.]+$/, '') : "Error Loading Document",
          documentType: "Document",
          summary: "Failed to load document data. Please try again.",
          keyTerms: [],
          obligations: [],
          parties: [],
          risks: ["Failed to load document analysis data"],
          risk_score: 0,
        });
      } finally {
        setIsLoading(false);
      }
    };

    const fetchPdfUrl = async () => {
      if (!filename) return;
      try {
        const { data } = await supabase.storage
          .from('pdfs')
          .createSignedUrl(filename, 3600);

        if (data?.signedUrl) {
          setPdfUrl(data.signedUrl);
        }
      } catch (e) {
        console.error("Error fetching PDF URL:", e);
      }
    };

    fetchDocumentData();
    fetchPdfUrl();
  }, [filename]);

  // Calculate metrics

  const riskScore = documentData.risk_score
  const completionScore = 100;
  const obligationsCount = documentData.obligations.length;
  const partiesCount = documentData.parties.length;

  const getRiskLevel = (score: number) => {
    if (score >= 8) return { level: 'High', color: isDarkMode ? 'text-[#C0392B]' : 'text-[#E74C3C]', bg: isDarkMode ? 'bg-[#C0392B]/10' : 'bg-[#E74C3C]/10' };
    if (score >= 6) return { level: 'Medium', color: isDarkMode ? 'text-[#D4AC0D]' : 'text-[#F1C40F]', bg: isDarkMode ? 'bg-[#D4AC0D]/10' : 'bg-[#F1C40F]/10' };
    if (score >= 4) return { level: 'Low-Medium', color: isDarkMode ? 'text-[#D4AC0D]' : 'text-[#F1C40F]', bg: isDarkMode ? 'bg-[#D4AC0D]/10' : 'bg-[#F1C40F]/10' };
    return { level: 'Low', color: isDarkMode ? 'text-[#27AE60]' : 'text-[#2ECC71]', bg: isDarkMode ? 'bg-[#27AE60]/10' : 'bg-[#2ECC71]/10' };
  };

  const riskLevel = getRiskLevel(riskScore);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'chat', label: 'Ask AI', icon: MessageSquare },
    { id: 'obligations', label: 'Obligations', icon: CheckCircle },
    { id: 'risks', label: 'Risk Analysis', icon: AlertTriangle },
    { id: 'parties', label: 'Parties', icon: Users },
    { id: 'terms', label: 'Key Terms', icon: Tag }
  ];

  const metrics = [
    {
      title: 'Risk Score',
      value: riskScore,
      subtitle: riskLevel.level + ' Risk',
      icon: Shield,
      color: riskLevel.color,
      bgColor: riskLevel.bg
    },
    {
      title: 'Completion Score',
      value: `${completionScore}%`,
      subtitle: 'Analysis Complete',
      icon: Target,
      color: 'text-[#1ABC9C]',
      bgColor: 'bg-[#1ABC9C]/10'
    },
    {
      title: 'Obligations Found',
      value: obligationsCount,
      subtitle: 'Action Items',
      icon: CheckCircle,
      color: isDarkMode ? 'text-[#27AE60]' : 'text-[#2ECC71]',
      bgColor: isDarkMode ? 'bg-[#27AE60]/10' : 'bg-[#2ECC71]/10'
    },
    {
      title: 'Parties Involved',
      value: partiesCount,
      subtitle: 'Stakeholders',
      icon: Users,
      color: 'text-[#1ABC9C]',
      bgColor: 'bg-[#1ABC9C]/10'
    }
  ];

  // In DocumentReport component, update the JSX to show skeleton while isLoading is true
  if (isLoading) {
    return (
      <div className="min-h-screen p-8 max-w-7xl mx-auto space-y-8">
        <div className="animate-pulse space-y-8">
          {/* Header Skeleton */}
          <div className="flex items-start space-x-4">
            <div className={`w-12 h-12 rounded-xl ${isDarkMode ? 'bg-[#161B22]' : 'bg-[#E3E7EE]'}`}></div>
            <div className="flex-1">
              <div className={`h-8 rounded-lg w-1/2 mb-2 ${isDarkMode ? 'bg-[#161B22]' : 'bg-[#E3E7EE]'}`}></div>
              <div className={`h-4 rounded-lg w-1/4 ${isDarkMode ? 'bg-[#161B22]' : 'bg-[#E3E7EE]'}`}></div>
            </div>
          </div>

          {/* Metrics Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#161B22] border-[#262C35]' : 'bg-[#FFFFFF] border-[#E3E7EE]'
                }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${isDarkMode ? 'bg-[#0D1117]' : 'bg-[#F7F9FC]'}`}></div>
                  <div className={`w-4 h-4 rounded ${isDarkMode ? 'bg-[#0D1117]' : 'bg-[#F7F9FC]'}`}></div>
                </div>
                <div className={`h-8 rounded mb-2 ${isDarkMode ? 'bg-[#0D1117]' : 'bg-[#F7F9FC]'}`}></div>
                <div className={`h-4 rounded w-2/3 mb-1 ${isDarkMode ? 'bg-[#0D1117]' : 'bg-[#F7F9FC]'}`}></div>
                <div className={`h-3 rounded w-1/2 ${isDarkMode ? 'bg-[#0D1117]' : 'bg-[#F7F9FC]'}`}></div>
              </div>
            ))}
          </div>

          {/* Tab Navigation Skeleton */}
          <div className="flex space-x-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`h-10 rounded-xl w-24 ${isDarkMode ? 'bg-[#161B22]' : 'bg-[#E3E7EE]'}`}></div>
            ))}
          </div>

          {/* Content Area Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#161B22] border-[#262C35]' : 'bg-[#FFFFFF] border-[#E3E7EE]'
                }`}>
                <div className={`h-6 rounded w-1/3 mb-6 ${isDarkMode ? 'bg-[#0D1117]' : 'bg-[#F7F9FC]'}`}></div>
                <div className="space-y-3">
                  <div className={`h-4 rounded ${isDarkMode ? 'bg-[#0D1117]' : 'bg-[#F7F9FC]'}`}></div>
                  <div className={`h-4 rounded w-5/6 ${isDarkMode ? 'bg-[#0D1117]' : 'bg-[#F7F9FC]'}`}></div>
                  <div className={`h-4 rounded w-4/5 ${isDarkMode ? 'bg-[#0D1117]' : 'bg-[#F7F9FC]'}`}></div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#161B22] border-[#262C35]' : 'bg-[#FFFFFF] border-[#E3E7EE]'
                }`}>
                <div className={`h-5 rounded w-1/2 mb-4 ${isDarkMode ? 'bg-[#0D1117]' : 'bg-[#F7F9FC]'}`}></div>
                <div className="space-y-3">
                  <div className={`h-4 rounded ${isDarkMode ? 'bg-[#0D1117]' : 'bg-[#F7F9FC]'}`}></div>
                  <div className={`h-4 rounded w-3/4 ${isDarkMode ? 'bg-[#0D1117]' : 'bg-[#F7F9FC]'}`}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
        <div className="flex items-start space-x-4">
          <button
            onClick={onBack}
            className={`p-3 rounded-xl transition-all duration-200 hover:scale-105 ${isDarkMode ? 'bg-[#161B22] hover:bg-[#0F1A2E]' : 'bg-[#F7F9FC] hover:bg-[#E3E7EE]'
              }`}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-[#1ABC9C]/10' : 'bg-[#1ABC9C]/10'}`}>
                <FileText className="w-5 h-5 text-[#1ABC9C]" />
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-[#161B22] text-[#AEB6C3]' : 'bg-[#F7F9FC] text-[#4A5568]'
                }`}>
                {documentData.documentType}
              </span>
            </div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-[#E8EDF5]' : 'text-[#1C2733]'}`}>
              {isLoading ? 'Loading...' : documentData.documentTitle}
            </h1>
            <p className={`mt-2 text-lg ${isDarkMode ? 'text-[#AEB6C3]' : 'text-[#4A5568]'}`}>
              {isLoading ? 'Fetching analysis report...' : 'Detailed Analysis Report'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${isDarkMode ? 'bg-[#161B22] hover:bg-[#0F1A2E] text-[#E8EDF5]' : 'bg-[#FFFFFF] hover:bg-[#F7F9FC] border border-[#E3E7EE]'
            }`}>
            <Share2 className="w-4 h-4" />
            <span className="font-medium">Share</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-[#1ABC9C] text-white rounded-xl hover:bg-[#17A085] transition-all duration-200">
            <Download className="w-4 h-4" />
            <span className="font-medium">Export PDF</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className={`p-6 rounded-2xl border transition-all duration-300 hover:scale-105 group ${isDarkMode ? 'bg-[#161B22] border-[#262C35]' : 'bg-[#FFFFFF] border-[#E3E7EE] shadow-lg'
              }`}
            style={{
              animationDelay: `${index * 100}ms`,
              animation: 'fadeInUp 0.6s ease-out forwards'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${metric.bgColor} group-hover:scale-110 transition-transform duration-200`}>
                <metric.icon className={`w-6 h-6 ${metric.color}`} />
              </div>
              <Star className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${isDarkMode ? 'text-[#7A8291]' : 'text-[#7D8693]'}`} />
            </div>

            <div className="space-y-2">
              <p className="text-2xl font-bold">{metric.value}</p>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-[#AEB6C3]' : 'text-[#4A5568]'}`}>
                {metric.title}
              </p>
              <p className={`text-xs ${metric.color}`}>
                {metric.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center space-x-1 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${activeTab === tab.id
              ? 'bg-[#1ABC9C] text-white shadow-lg'
              : isDarkMode
                ? 'text-[#AEB6C3] hover:bg-[#161B22]'
                : 'text-[#4A5568] hover:bg-[#F7F9FC]'
              }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'overview' && (
            <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#161B22] border-[#262C35]' : 'bg-[#FFFFFF] border-[#E3E7EE] shadow-lg'
              }`}>
              <div className="flex items-center space-x-3 mb-6">
                <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-[#1ABC9C]/10' : 'bg-[#1ABC9C]/10'}`}>
                  <FileText className="w-5 h-5 text-[#1ABC9C]" />
                </div>
                <h3 className="text-xl font-semibold">Executive Summary</h3>
              </div>

              <div className={`prose max-w-none ${isDarkMode ? 'prose-invert' : ''}`}>
                <p className={`leading-relaxed ${isDarkMode ? 'text-[#AEB6C3]' : 'text-[#4A5568]'}`}>
                  {documentData.summary}
                </p>
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-[#0D1117] border-[#262C35]' : 'bg-[#F7F9FC] border-[#E3E7EE]'}`}>
                  <h4 className="font-semibold mb-2 flex items-center">
                    <CheckCircle className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-[#27AE60]' : 'text-[#2ECC71]'}`} />
                    Key Strengths
                  </h4>
                  <ul className={`space-y-2 text-sm ${isDarkMode ? 'text-[#AEB6C3]' : 'text-[#4A5568]'}`}>
                    <li>• Clear definition of parties</li>
                    <li>• Standard termination clauses</li>
                  </ul>
                </div>
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-[#0D1117] border-[#262C35]' : 'bg-[#F7F9FC] border-[#E3E7EE]'}`}>
                  <h4 className="font-semibold mb-2 flex items-center">
                    <AlertTriangle className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-[#D4AC0D]' : 'text-[#F1C40F]'}`} />
                    Attention Needed
                  </h4>
                  <ul className={`space-y-2 text-sm ${isDarkMode ? 'text-[#AEB6C3]' : 'text-[#4A5568]'}`}>
                    <li>• Review liability caps</li>
                    <li>• Check compliance requirements</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
            // Full screen split view
            <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col">
              {/* Toolbar */}
              <div className="h-16 border-b flex items-center justify-between px-6 bg-white dark:bg-gray-900">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h2 className="font-semibold text-lg">{documentData.documentTitle}</h2>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Ask AI Mode</span>
                </div>
              </div>

              {/* Split Content */}
              <div className="flex-1 flex overflow-hidden">
                {/* Left: Chat */}
                <div className="w-1/2 border-r p-0">
                  <ChatInterface
                    documentId={filename || ''}
                    isDarkMode={isDarkMode}
                    onCitationClick={(page, text) => {
                      setActivePdfPage(page);
                      setHighlightedText(text);
                    }}
                  />
                </div>
                {/* Right: PDF */}
                <div className="w-1/2 bg-gray-100 p-4">
                  <div className="h-full rounded-xl overflow-hidden shadow-sm bg-white">
                    {pdfUrl ? (
                      <PdfViewer
                        url={pdfUrl}
                        pageNumber={activePdfPage}
                        highlightText={highlightedText}
                        onPageChange={(page) => setActivePdfPage(page)}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        Loading PDF...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'obligations' && (
            <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#161B22] border-[#262C35]' : 'bg-[#FFFFFF] border-[#E3E7EE] shadow-lg'
              }`}>
              <div className="flex items-center space-x-3 mb-6">
                <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-[#27AE60]/10' : 'bg-[#2ECC71]/10'}`}>
                  <CheckCircle className={`w-5 h-5 ${isDarkMode ? 'text-[#27AE60]' : 'text-[#2ECC71]'}`} />
                </div>
                <h3 className="text-xl font-semibold">Obligations & Requirements</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-[#161B22] text-[#AEB6C3]' : 'bg-[#F7F9FC] text-[#4A5568]'
                  }`}>
                  {documentData.obligations.length} items
                </span>
              </div>

              <div className="space-y-4">
                {documentData.obligations.map((obligation, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${isDarkMode ? 'bg-[#0D1117] border-[#262C35] hover:border-[#27AE60]/50' : 'bg-[#2ECC71]/5 border-[#2ECC71]/20 hover:border-[#2ECC71]/30'
                      }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${isDarkMode ? 'bg-[#27AE60]' : 'bg-[#2ECC71]'}`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className={`${isDarkMode ? 'text-[#AEB6C3]' : 'text-[#4A5568]'}`}>
                          {obligation}
                        </p>
                      </div>
                      <button className={`p-1 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-[#0D1117]' : 'hover:bg-[#2ECC71]/10'
                        }`}>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'risks' && (
            <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#161B22] border-[#262C35]' : 'bg-[#FFFFFF] border-[#E3E7EE] shadow-lg'
              }`}>
              <div className="flex items-center space-x-3 mb-6">
                <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-[#C0392B]/10' : 'bg-[#E74C3C]/10'}`}>
                  <AlertTriangle className={`w-5 h-5 ${isDarkMode ? 'text-[#C0392B]' : 'text-[#E74C3C]'}`} />
                </div>
                <h3 className="text-xl font-semibold">Risk Analysis</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${riskLevel.bg} ${riskLevel.color}`}>
                  {riskLevel.level} Risk Level
                </span>
              </div>

              <div className="space-y-4">
                {documentData.risks.map((risk, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${isDarkMode ? 'bg-[#0D1117] border-[#262C35] hover:border-[#C0392B]/50' : 'bg-[#E74C3C]/5 border-[#E74C3C]/20 hover:border-[#E74C3C]/30'
                      }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-[#C0392B]' : 'bg-[#E74C3C]'}`}>
                        <AlertCircle className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`font-medium ${isDarkMode ? 'text-[#C0392B]' : 'text-[#E74C3C]'}`}>
                            Risk #{index + 1}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${index === 0 ? (isDarkMode ? 'bg-[#C0392B]/10 text-[#C0392B]' : 'bg-[#E74C3C]/10 text-[#E74C3C]') :
                            index === 1 ? (isDarkMode ? 'bg-[#D4AC0D]/10 text-[#D4AC0D]' : 'bg-[#F1C40F]/10 text-[#F1C40F]') :
                              (isDarkMode ? 'bg-[#D4AC0D]/10 text-[#D4AC0D]' : 'bg-[#F1C40F]/10 text-[#F1C40F]')
                            }`}>
                            {index === 0 ? 'High' : index === 1 ? 'Medium' : 'Low'}
                          </span>
                        </div>
                        <p className={`${isDarkMode ? 'text-[#AEB6C3]' : 'text-[#4A5568]'}`}>
                          {risk}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'parties' && (
            <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#161B22] border-[#262C35]' : 'bg-[#FFFFFF] border-[#E3E7EE] shadow-lg'
              }`}>
              <div className="flex items-center space-x-3 mb-6">
                <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-[#1ABC9C]/10' : 'bg-[#1ABC9C]/10'}`}>
                  <Users className="w-5 h-5 text-[#1ABC9C]" />
                </div>
                <h3 className="text-xl font-semibold">Involved Parties</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-[#161B22] text-[#AEB6C3]' : 'bg-[#F7F9FC] text-[#4A5568]'
                  }`}>
                  {documentData.parties.length} parties
                </span>
              </div>

              <div className="space-y-4">
                {documentData.parties.map((party, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${isDarkMode ? 'bg-[#0D1117] border-[#262C35] hover:border-[#1ABC9C]/50' : 'bg-[#1ABC9C]/5 border-[#1ABC9C]/20 hover:border-[#1ABC9C]/30'
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#1ABC9C] flex items-center justify-center">
                        <span className="text-white font-semibold">{party.name.charAt(0)}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{party.name}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-[#0D1117] text-[#AEB6C3]' : 'bg-[#F7F9FC] text-[#4A5568]'
                            }`}>
                            {party.type}
                          </span>
                          {party.role && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-[#1ABC9C]/10 text-[#1ABC9C]' : 'bg-[#1ABC9C]/10 text-[#1ABC9C]'
                              }`}>
                              {party.role}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#161B22] border-[#262C35]' : 'bg-[#FFFFFF] border-[#E3E7EE] shadow-lg'
              }`}>
              <div className="flex items-center space-x-3 mb-6">
                <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-[#1ABC9C]/10' : 'bg-[#1ABC9C]/10'}`}>
                  <Tag className="w-5 h-5 text-[#1ABC9C]" />
                </div>
                <h3 className="text-xl font-semibold">Key Terms & Concepts</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-[#161B22] text-[#AEB6C3]' : 'bg-[#F7F9FC] text-[#4A5568]'
                  }`}>
                  {documentData.keyTerms.length} terms
                </span>
              </div>

              <div className="flex flex-wrap gap-3">
                {documentData.keyTerms.map((term, index) => (
                  <div
                    key={index}
                    className={`px-4 py-2 rounded-xl border transition-all duration-200 hover:scale-105 cursor-pointer ${isDarkMode
                      ? 'bg-[#0D1117] border-[#262C35] hover:border-[#1ABC9C]/50 text-[#AEB6C3]'
                      : 'bg-[#1ABC9C]/5 border-[#1ABC9C]/20 hover:border-[#1ABC9C]/30 text-[#1ABC9C]'
                      }`}
                  >
                    <span className="font-medium">{term}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Analysis Summary */}
          <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#161B22] border-[#262C35]' : 'bg-[#FFFFFF] border-[#E3E7EE] shadow-lg'
            }`}>
            <div className="flex items-center space-x-3 mb-4">
              <Activity className="w-5 h-5 text-[#1ABC9C]" />
              <h3 className="font-semibold">Analysis Summary</h3>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Completion</span>
                <span className={`text-sm font-bold ${isDarkMode ? 'text-[#27AE60]' : 'text-[#2ECC71]'}`}>{completionScore}%</span>
              </div>
              <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-[#0D1117]' : 'bg-[#E3E7EE]'}`}>
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${isDarkMode ? 'bg-[#27AE60]' : 'bg-[#2ECC71]'}`}
                  style={{ width: `${completionScore}%` }}
                />
              </div>
            </div>

            <div className={`mt-6 pt-4 border-t ${isDarkMode ? 'border-[#262C35]' : 'border-[#E3E7EE]'}`}>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className={`${isDarkMode ? 'text-[#7A8291]' : 'text-[#7D8693]'}`}>Document Type:</span>
                  <span className="font-medium">{documentData.documentType}</span>
                </div>
                <div className="flex justify-between">
                  <span className={`${isDarkMode ? 'text-[#7A8291]' : 'text-[#7D8693]'}`}>Analysis Date:</span>
                  <span className="font-medium">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className={`${isDarkMode ? 'text-[#7A8291]' : 'text-[#7D8693]'}`}>Processing Time:</span>
                  <span className="font-medium">2.3 seconds</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#161B22] border-[#262C35]' : 'bg-[#FFFFFF] border-[#E3E7EE] shadow-lg'
            }`}>
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center space-x-3 p-3 rounded-xl bg-[#1ABC9C] text-white hover:bg-[#17A085] transition-all duration-200">
                <Download className="w-4 h-4" />
                <span className="font-medium">Export Report</span>
              </button>
              <button className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${isDarkMode ? 'bg-[#0D1117] hover:bg-[#0F1A2E] text-[#E8EDF5]' : 'bg-[#F7F9FC] hover:bg-[#E3E7EE]'
                }`}>
                <Brain className="w-4 h-4" />
                <span className="font-medium">Re-analyze</span>
              </button>
              <button className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${isDarkMode ? 'bg-[#0D1117] hover:bg-[#0F1A2E] text-[#E8EDF5]' : 'bg-[#F7F9FC] hover:bg-[#E3E7EE]'
                }`}>
                <Share2 className="w-4 h-4" />
                <span className="font-medium">Share Results</span>
              </button>
            </div>
          </div>

          {/* Related Documents */}
          <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#161B22] border-[#262C35]' : 'bg-[#FFFFFF] border-[#E3E7EE] shadow-lg'
            }`}>
            <h3 className="font-semibold mb-4">Related Documents</h3>
            <div className="space-y-3">
              {[
                { name: "OS Concepts Study Guide", type: "Study Material", similarity: 85 },
                { name: "Data Structures Assignment", type: "Programming", similarity: 72 },
                { name: "Algorithm Analysis Paper", type: "Research", similarity: 68 }
              ].map((doc, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-xl border transition-all duration-200 hover:scale-[1.02] cursor-pointer ${isDarkMode ? 'bg-[#0D1117] border-[#262C35] hover:border-[#1ABC9C]/50' : 'bg-[#F7F9FC] border-[#E3E7EE] hover:border-[#1ABC9C]/30'
                    }`}
                >
                  <div className="flex items-start space-x-3">
                    <FileText className="w-4 h-4 text-[#1ABC9C] mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{doc.name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className={`text-xs ${isDarkMode ? 'text-[#7A8291]' : 'text-[#7D8693]'}`}>{doc.type}</span>
                        <span className="text-xs font-medium text-[#1ABC9C]">{doc.similarity}% similar</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}