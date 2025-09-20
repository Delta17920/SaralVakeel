import React, { useState, useEffect } from 'react';
import {
  FileText,
  Shield,
  AlertTriangle,
  Users,
  CheckCircle,
  Clock,
  TrendingUp,
  BarChart3,
  Eye,
  Download,
  ArrowLeft,
  ChevronRight,
  Target,
  Brain,
  BookOpen,
  AlertCircle,
  Calendar,
  Tag,
  Zap,
  Activity,
  Search,
  Filter,
  Star,
  Share2
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
    risks: []
  });

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
          ]
        });
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/fetch-json?filename=${encodeURIComponent(filename)}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch document: ${response.statusText}`);
        }
        
        const fileData = await response.json();
        console.log('Fetched document data:', fileData);
        
        // Map the API response to our component structure
        const mappedData: DocumentData = {
          documentTitle: fileData.data?.documentTitle || filename.replace(/\.[^/.]+$/, ''),
          documentType: fileData.data?.documentType || 'Document',
          summary: fileData.data?.summary || 'No summary available.',
          keyTerms: fileData.data?.keyTerms || [],
          obligations: fileData.data?.obligations || [],
          parties: fileData.data?.parties || [],
          risks: fileData.data?.risks || []
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
          risks: ["Failed to load document analysis data"]
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocumentData();
  }, [filename]);

  const [documentDataState] = useState<DocumentData>(documentData);

  // Calculate metrics
  const riskScore = (documentData.risks.length * 2.5).toFixed(1);
  const completionScore = Math.max(0, 100 - (documentData.risks.length * 15));
  const obligationsCount = documentData.obligations.length;
  const partiesCount = documentData.parties.length;

  const getRiskLevel = (score: number) => {
    if (score >= 8) return { level: 'High', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' };
    if (score >= 6) return { level: 'Medium', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' };
    if (score >= 4) return { level: 'Low-Medium', color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' };
    return { level: 'Low', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' };
  };

  const riskLevel = getRiskLevel(parseFloat(riskScore));

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
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
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      title: 'Obligations Found',
      value: obligationsCount,
      subtitle: 'Action Items',
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      title: 'Parties Involved',
      value: partiesCount,
      subtitle: 'Stakeholders',
      icon: Users,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20'
    }
  ];

  // In DocumentReport component, update the JSX to show skeleton while isLoading is true
if (isLoading) {
  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto space-y-8">
      <div className="animate-pulse space-y-8">
        {/* Header Skeleton */}
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
          <div className="flex-1">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-lg w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-lg w-1/4"></div>
          </div>
        </div>

        {/* Metrics Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`p-6 rounded-2xl border ${
              isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
                <div className="w-4 h-4 bg-gray-200 dark:bg-gray-800 rounded"></div>
              </div>
              <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3 mb-1"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
            </div>
          ))}
        </div>

        {/* Tab Navigation Skeleton */}
        <div className="flex space-x-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 dark:bg-gray-800 rounded-xl w-24"></div>
          ))}
        </div>

        {/* Content Area Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className={`p-6 rounded-2xl border ${
              isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
            }`}>
              <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-6"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-4/5"></div>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className={`p-6 rounded-2xl border ${
              isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
            }`}>
              <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
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
            className={`p-3 rounded-xl transition-all duration-200 hover:scale-105 ${
              isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'
              }`}>
                {documentData.documentType}
              </span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              {isLoading ? 'Loading...' : documentData.documentTitle}
            </h1>
            <p className={`mt-2 text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {isLoading ? 'Fetching analysis report...' : 'Detailed Analysis Report'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
            isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-white hover:bg-gray-50 border border-gray-200'
          }`}>
            <Share2 className="w-4 h-4" />
            <span className="font-medium">Share</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl hover:from-blue-700 hover:to-violet-700 transition-all duration-200">
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
            className={`p-6 rounded-2xl border transition-all duration-300 hover:scale-105 group ${
              isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-lg'
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
              <Star className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
            
            <div className="space-y-2">
              <p className="text-2xl font-bold">{metric.value}</p>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
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
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg'
                : isDarkMode
                ? 'text-gray-300 hover:bg-gray-800'
                : 'text-gray-600 hover:bg-gray-100'
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
            <div className="space-y-6">
              {/* Document Summary */}
              <div className={`p-6 rounded-2xl border ${
                isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-lg'
              }`}>
                <div className="flex items-center space-x-3 mb-6">
                  <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold">Document Summary</h3>
                </div>
                <div className={`p-4 rounded-xl border-l-4 border-blue-500 ${
                  isDarkMode ? 'bg-gray-800' : 'bg-blue-50/50'
                }`}>
                  <p className={`leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {documentData.summary}
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className={`p-6 rounded-2xl border ${
                isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-lg'
              }`}>
                <h3 className="text-xl font-semibold mb-6">Analysis Overview</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span className="font-medium">Risk Assessment</span>
                    </div>
                    <p className="text-2xl font-bold text-amber-600">{documentData.risks.length} Issues</p>
                    <p className="text-sm text-gray-500">Identified risks</p>
                  </div>
                  <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="font-medium">Action Items</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">{documentData.obligations.length} Tasks</p>
                    <p className="text-sm text-gray-500">Required obligations</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'obligations' && (
            <div className={`p-6 rounded-2xl border ${
              isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-lg'
            }`}>
              <div className="flex items-center space-x-3 mb-6">
                <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-green-900/30' : 'bg-green-50'}`}>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold">Obligations & Requirements</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'
                }`}>
                  {documentData.obligations.length} items
                </span>
              </div>
              
              <div className="space-y-4">
                {documentData.obligations.map((obligation, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${
                      isDarkMode ? 'bg-gray-800 border-gray-700 hover:border-green-600/50' : 'bg-green-50/50 border-green-200 hover:border-green-300'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white bg-gradient-to-r from-green-500 to-emerald-500`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {obligation}
                        </p>
                      </div>
                      <button className={`p-1 rounded-lg transition-colors ${
                        isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-green-100'
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
            <div className={`p-6 rounded-2xl border ${
              isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-lg'
            }`}>
              <div className="flex items-center space-x-3 mb-6">
                <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-red-900/30' : 'bg-red-50'}`}>
                  <AlertTriangle className="w-5 h-5 text-red-600" />
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
                    className={`p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${
                      isDarkMode ? 'bg-gray-800 border-gray-700 hover:border-red-600/50' : 'bg-red-50/50 border-red-200 hover:border-red-300'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
                        <AlertCircle className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`font-medium ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>
                            Risk #{index + 1}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            index === 0 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                            index === 1 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}>
                            {index === 0 ? 'High' : index === 1 ? 'Medium' : 'Low'}
                          </span>
                        </div>
                        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
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
            <div className={`p-6 rounded-2xl border ${
              isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-lg'
            }`}>
              <div className="flex items-center space-x-3 mb-6">
                <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold">Involved Parties</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'
                }`}>
                  {documentData.parties.length} parties
                </span>
              </div>
              
              <div className="space-y-4">
                {documentData.parties.map((party, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${
                      isDarkMode ? 'bg-gray-800 border-gray-700 hover:border-purple-600/50' : 'bg-purple-50/50 border-purple-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        <span className="text-white font-semibold">{party.name.charAt(0)}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{party.name}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {party.type}
                          </span>
                          {party.role && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700'
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
            <div className={`p-6 rounded-2xl border ${
              isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-lg'
            }`}>
              <div className="flex items-center space-x-3 mb-6">
                <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                  <Tag className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold">Key Terms & Concepts</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'
                }`}>
                  {documentData.keyTerms.length} terms
                </span>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {documentData.keyTerms.map((term, index) => (
                  <div
                    key={index}
                    className={`px-4 py-2 rounded-xl border transition-all duration-200 hover:scale-105 cursor-pointer ${
                      isDarkMode 
                        ? 'bg-gray-800 border-gray-700 hover:border-blue-600/50 text-gray-300' 
                        : 'bg-blue-50 border-blue-200 hover:border-blue-300 text-blue-800'
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
          <div className={`p-6 rounded-2xl border ${
            isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-lg'
          }`}>
            <div className="flex items-center space-x-3 mb-4">
              <Activity className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold">Analysis Summary</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Completion</span>
                <span className="text-sm font-bold text-green-600">{completionScore}%</span>
              </div>
              <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000"
                  style={{ width: `${completionScore}%` }}
                />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Document Type:</span>
                  <span className="font-medium">{documentData.documentType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Analysis Date:</span>
                  <span className="font-medium">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Processing Time:</span>
                  <span className="font-medium">2.3 seconds</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className={`p-6 rounded-2xl border ${
            isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-lg'
          }`}>
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:from-blue-700 hover:to-violet-700 transition-all duration-200">
                <Download className="w-4 h-4" />
                <span className="font-medium">Export Report</span>
              </button>
              <button className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}>
                <Brain className="w-4 h-4" />
                <span className="font-medium">Re-analyze</span>
              </button>
              <button className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}>
                <Share2 className="w-4 h-4" />
                <span className="font-medium">Share Results</span>
              </button>
            </div>
          </div>

          {/* Related Documents */}
          <div className={`p-6 rounded-2xl border ${
            isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-lg'
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
                  className={`p-3 rounded-xl border transition-all duration-200 hover:scale-[1.02] cursor-pointer ${
                    isDarkMode ? 'bg-gray-800 border-gray-700 hover:border-blue-600/50' : 'bg-gray-50 border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <FileText className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{doc.name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500">{doc.type}</span>
                        <span className="text-xs font-medium text-blue-600">{doc.similarity}% similar</span>
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
  )}