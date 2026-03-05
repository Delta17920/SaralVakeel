import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthProvider';
import { useDialog } from './ConfirmDialog';
import ChatInterface from './ChatInterface';
import PdfViewer from './PdfViewer';
import {
  FileText,
  Shield,
  AlertTriangle,
  Users,
  CheckCircle,
  Eye,
  Trash2,
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
  MessageSquare,
  Menu,
  X
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
  filePath?: string;
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileChatView, setMobileChatView] = useState<'chat' | 'pdf'>('chat');
  const { session } = useAuth();
  const dialog = useDialog();

  // Fetch document data when filename is provided
  useEffect(() => {
    const fetchDocumentData = async () => {
      if (!filename) {
        // Use default data if no filename provided
        setDocumentData({
          documentTitle: "Document Analysis",
          documentType: "General",
          summary: "Select a document to view its analysis.",
          keyTerms: [],
          obligations: [],
          parties: [],
          risks: [],
          risk_score: 0,
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
          filePath: fileData.filePath || fileData.fileName
        };

        setDocumentData(mappedData);
      } catch (error) {
        console.error('Error fetching document data:', error);
        // Set error state data
        setDocumentData({
          documentTitle: filename ? filename.replace(/\.[^/.]+$/, '') : "Error Loading Document",
          documentType: "Document",
          summary: `Failed to load document data: ${error instanceof Error ? error.message : String(error)}`,
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

    const fetchPdfUrl = async (path: string) => {
      if (!path) return;
      try {
        console.log(`Attempting to fetch signed URL for PDF: ${path} from bucket 'pdfs'`);
        const { data, error } = await supabase.storage
          .from('pdfs')
          .createSignedUrl(path, 3600);

        if (error) {
          console.error("Error creating signed URL:", error);
          setPdfUrl(null);
          return;
        }

        if (data?.signedUrl) {
          console.log("Successfully generated signed URL:", data.signedUrl);
          setPdfUrl(data.signedUrl);
        } else {
          console.warn("No signed URL returned from Supabase despite no error.");
        }
      } catch (e) {
        console.error("Exception fetching PDF URL:", e);
      }
    };

    if (filename) {
      fetchDocumentData();
    }
  }, [filename]);

  // Effect to fetch PDF URL once we have the document data (and potentionally the correct filePath)
  useEffect(() => {
    if (!filename) return;

    // If we have document data with a filePath, use it. 
    // Otherwise, fallback to filename (legacy behavior or if metadata missing)
    // We check if documentData is loaded by checking if title is not "Loading..."
    // OR we just check if documentData.filePath exists. 
    // Since documentData is initialized with default values, we need to be careful.
    // However, we can just try to fetch using the best available path.

    const filePath = (documentData as any).filePath || filename;

    // Define the fetch function inside or outside? 
    // We can reuse the logic if we move active fetching here.

    const getUrl = async () => {
      try {
        console.log(`Attempting to fetch signed URL for path: ${filePath}`);
        const { data, error } = await supabase.storage
          .from('pdfs')
          .createSignedUrl(filePath, 3600);

        if (data?.signedUrl) {
          setPdfUrl(data.signedUrl);
        } else if (error) {
          console.error("Error creating signed URL:", error);
          // If failed with filePath, and filePath != filename, maybe try filename as backup?
          if (filePath !== filename) {
            console.log("Retrying with filename only...");
            const { data: retryData } = await supabase.storage
              .from('pdfs')
              .createSignedUrl(filename, 3600);
            if (retryData?.signedUrl) setPdfUrl(retryData.signedUrl);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };

    if (documentData.documentTitle !== "Loading...") {
      getUrl();
    }
  }, [documentData, filename]);

  const handleDelete = async () => {
    if (!filename) return;
    const ok = await dialog.confirm({
      title: 'Delete Document',
      message: 'Are you sure you want to delete this document? This action cannot be undone.',
      type: 'confirm-delete',
      confirmLabel: 'Delete',
    });
    if (!ok) return;

    try {
      if (!session?.access_token) {
        await dialog.alert({ title: 'Auth Error', message: 'No session found. Please wait for session to load.', type: 'alert-error' });
        return;
      }

      const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${API_URL}/documents/${filename}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });

      if (response.ok) {
        onBack?.();
      } else {
        const err = await response.json();
        await dialog.alert({ title: 'Delete Failed', message: err.detail || 'Unknown error', type: 'alert-error' });
      }
    } catch (error) {
      console.error('Delete error:', error);
      await dialog.alert({ title: 'Error', message: 'Error deleting document. Please try again.', type: 'alert-error' });
    }
  };

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
      color: 'text-[#8C6A4A]',
      bgColor: 'bg-[#8C6A4A]/10'
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
      color: 'text-[#8C6A4A]',
      bgColor: 'bg-[#8C6A4A]/10'
    }
  ];

  // In DocumentReport component, update the JSX to show skeleton while isLoading is true
  if (isLoading) {
    return (
      <div className="min-h-screen p-8 max-w-7xl mx-auto space-y-8">
        <div className="animate-pulse space-y-8">
          {/* Header Skeleton */}
          <div className="flex items-start space-x-4">
            <div className={`w-12 h-12 rounded-xl ${isDarkMode ? 'bg-gray-900' : 'bg-[#EDE7DB]'}`}></div>
            <div className="flex-1">
              <div className={`h-8 rounded-lg w-1/2 mb-2 ${isDarkMode ? 'bg-gray-900' : 'bg-[#EDE7DB]'}`}></div>
              <div className={`h-4 rounded-lg w-1/4 ${isDarkMode ? 'bg-gray-900' : 'bg-[#EDE7DB]'}`}></div>
            </div>
          </div>

          {/* Metrics Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-[#C8BEB4]'
                }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-[#F6F1E8]'}`}></div>
                  <div className={`w-4 h-4 rounded ${isDarkMode ? 'bg-gray-800' : 'bg-[#F6F1E8]'}`}></div>
                </div>
                <div className={`h-8 rounded mb-2 ${isDarkMode ? 'bg-gray-800' : 'bg-[#F6F1E8]'}`}></div>
                <div className={`h-4 rounded w-2/3 mb-1 ${isDarkMode ? 'bg-gray-800' : 'bg-[#F6F1E8]'}`}></div>
                <div className={`h-3 rounded w-1/2 ${isDarkMode ? 'bg-gray-800' : 'bg-[#F6F1E8]'}`}></div>
              </div>
            ))}
          </div>

          {/* Tab Navigation Skeleton */}
          <div className="flex space-x-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`h-10 rounded-xl w-24 ${isDarkMode ? 'bg-gray-900' : 'bg-[#EDE7DB]'}`}></div>
            ))}
          </div>

          {/* Content Area Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-[#C8BEB4]'
                }`}>
                <div className={`h-6 rounded w-1/3 mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-[#F6F1E8]'}`}></div>
                <div className="space-y-3">
                  <div className={`h-4 rounded ${isDarkMode ? 'bg-gray-800' : 'bg-[#F6F1E8]'}`}></div>
                  <div className={`h-4 rounded w-5/6 ${isDarkMode ? 'bg-gray-800' : 'bg-[#F6F1E8]'}`}></div>
                  <div className={`h-4 rounded w-4/5 ${isDarkMode ? 'bg-gray-800' : 'bg-[#F6F1E8]'}`}></div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-[#C8BEB4]'
                }`}>
                <div className={`h-5 rounded w-1/2 mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-[#F6F1E8]'}`}></div>
                <div className="space-y-3">
                  <div className={`h-4 rounded ${isDarkMode ? 'bg-gray-800' : 'bg-[#F6F1E8]'}`}></div>
                  <div className={`h-4 rounded w-3/4 ${isDarkMode ? 'bg-gray-800' : 'bg-[#F6F1E8]'}`}></div>
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
      <div className="flex flex-col space-y-6 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div className="flex items-start space-x-4">
          <button
            onClick={onBack}
            className={`flex-shrink-0 p-3 rounded-xl transition-all duration-200 hover:scale-105 ${isDarkMode ? 'bg-gray-900 hover:bg-gray-800' : 'bg-[#F6F1E8] hover:bg-[#EDE7DB]'
              }`}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-[#8C6A4A]/10' : 'bg-[#8C6A4A]/10'}`}>
                <FileText className="w-5 h-5 text-[#8C6A4A]" />
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-gray-900 text-gray-400' : 'bg-[#F6F1E8] text-[#4B463F]'
                }`}>
                {documentData.documentType}
              </span>
            </div>
            <h1 className={`text-2xl md:text-3xl font-bold break-words ${isDarkMode ? 'text-gray-100' : 'text-[#2E2A26]'}`}>
              {isLoading ? 'Loading...' : documentData.documentTitle}
            </h1>
            <p className={`mt-2 text-base md:text-lg ${isDarkMode ? 'text-gray-400' : 'text-[#4B463F]'}`}>
              {isLoading ? 'Fetching analysis report...' : 'Detailed Analysis Report'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button onClick={handleDelete} className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 flex-grow sm:flex-grow-0 justify-center hover:bg-red-500/10 text-red-500 border border-red-500/20 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
            <Trash2 className="w-4 h-4" />
            <span className="font-medium">Delete</span>
          </button>
          <button className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 flex-grow sm:flex-grow-0 justify-center ${isDarkMode ? 'bg-gray-900 hover:bg-gray-800 text-gray-100' : 'bg-white hover:bg-[#F6F1E8] border border-[#C8BEB4]'
            }`}>
            <Share2 className="w-4 h-4" />
            <span className="font-medium">Share</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-[#8C6A4A] text-white rounded-xl hover:bg-[#17A085] transition-all duration-200 flex-grow sm:flex-grow-0 justify-center">
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
            className={`p-6 rounded-2xl border transition-all duration-300 hover:scale-105 group ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-[#C8BEB4] shadow-lg'
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
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-[#4B463F]'}`}>
                {metric.title}
              </p>
              <p className={`text-xs ${metric.color}`}>
                {metric.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="relative z-20">
        {/* Mobile Filter / Navigation Button */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-100' : 'bg-white border-[#C8BEB4] text-[#2E2A26] shadow-sm'}`}
          >
            <div className="flex items-center space-x-3">
              {(() => {
                const CurrentIcon = tabs.find(t => t.id === activeTab)?.icon || FileText;
                return <CurrentIcon className="w-5 h-5 text-[#8C6A4A]" />;
              })()}
              <span className="font-medium">{tabs.find(t => t.id === activeTab)?.label}</span>
            </div>
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className={`absolute top-full left-0 right-0 mt-2 p-2 rounded-xl border shadow-xl ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-[#C8BEB4]'}`}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${activeTab === tab.id
                    ? (isDarkMode ? 'bg-[#8C6A4A]/10 text-[#8C6A4A]' : 'bg-[#8C6A4A]/10 text-[#8C6A4A]')
                    : (isDarkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-[#4B463F] hover:bg-[#F6F1E8]')
                    }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Tabs */}
        <div className="hidden md:flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${activeTab === tab.id
                ? 'bg-[#8C6A4A] text-white shadow-lg'
                : isDarkMode
                  ? 'text-gray-400 hover:bg-gray-900'
                  : 'text-[#4B463F] hover:bg-[#F6F1E8]'
                }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'overview' && (
            <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-[#C8BEB4] shadow-lg'
              }`}>
              <div className="flex items-center space-x-3 mb-6">
                <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-[#8C6A4A]/10' : 'bg-[#8C6A4A]/10'}`}>
                  <FileText className="w-5 h-5 text-[#8C6A4A]" />
                </div>
                <h3 className="text-xl font-semibold">Executive Summary</h3>
              </div>

              <div className={`prose max-w-none ${isDarkMode ? 'prose-invert' : ''}`}>
                <p className={`leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-[#4B463F]'}`}>
                  {documentData.summary}
                </p>
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-800' : 'bg-[#F6F1E8] border-[#C8BEB4]'}`}>
                  <h4 className="font-semibold mb-2 flex items-center">
                    <CheckCircle className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-[#27AE60]' : 'text-[#2ECC71]'}`} />
                    Key Strengths
                  </h4>
                  <ul className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-[#4B463F]'}`}>
                    <li>• Clear definition of parties</li>
                    <li>• Standard termination clauses</li>
                  </ul>
                </div>
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-800' : 'bg-[#F6F1E8] border-[#C8BEB4]'}`}>
                  <h4 className="font-semibold mb-2 flex items-center">
                    <AlertTriangle className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-[#D4AC0D]' : 'text-[#F1C40F]'}`} />
                    Attention Needed
                  </h4>
                  <ul className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-[#4B463F]'}`}>
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
              <div className="h-16 border-b flex items-center justify-between px-4 lg:px-6 bg-white dark:bg-gray-900">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 dark:text-gray-200" />
                  </button>
                  <h2 className="font-semibold text-lg truncate max-w-[150px] md:max-w-md dark:text-gray-200">{documentData.documentTitle}</h2>
                </div>

                {/* Mobile View Toggle */}
                <div className="flex items-center space-x-2">
                  <div className="lg:hidden flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                    <button
                      onClick={() => setMobileChatView('chat')}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${mobileChatView === 'chat'
                        ? 'bg-white dark:bg-gray-700 shadow text-[#8C6A4A]'
                        : 'text-gray-500 dark:text-gray-400'
                        }`}
                    >
                      Chat
                    </button>
                    <button
                      onClick={() => setMobileChatView('pdf')}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${mobileChatView === 'pdf'
                        ? 'bg-white dark:bg-gray-700 shadow text-[#8C6A4A]'
                        : 'text-gray-500 dark:text-gray-400'
                        }`}
                    >
                      Document
                    </button>
                  </div>
                  <span className="hidden lg:block text-sm text-gray-500">Ask AI Mode</span>
                </div>
              </div>

              {/* Split Content */}
              <div className="flex-1 flex overflow-hidden relative">
                {/* Chat Section */}
                <div className={`
                  absolute inset-0 lg:static lg:w-1/2 lg:block border-r p-0 bg-white dark:bg-gray-900 transition-transform duration-300
                  ${mobileChatView === 'chat' ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}>
                  <ChatInterface
                    documentId={filename || ''}
                    isDarkMode={isDarkMode}
                    onCitationClick={(page, text) => {
                      setActivePdfPage(page);
                      setHighlightedText(text);
                      setMobileChatView('pdf'); // Switch to PDF view on mobile when citation clicked
                    }}
                  />
                </div>

                {/* PDF Section */}
                <div className={`
                  absolute inset-0 lg:static lg:w-1/2 lg:block bg-gray-100 dark:bg-gray-800 p-2 lg:p-4 transition-transform duration-300
                  ${mobileChatView === 'pdf' ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
                `}>
                  <div className="h-full rounded-xl overflow-hidden shadow-sm bg-white dark:bg-gray-700">
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
            <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-[#C8BEB4] shadow-lg'
              }`}>
              <div className="flex items-center space-x-3 mb-6">
                <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-[#27AE60]/10' : 'bg-[#2ECC71]/10'}`}>
                  <CheckCircle className={`w-5 h-5 ${isDarkMode ? 'text-[#27AE60]' : 'text-[#2ECC71]'}`} />
                </div>
                <h3 className="text-xl font-semibold">Obligations & Requirements</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-gray-900 text-gray-400' : 'bg-[#F6F1E8] text-[#4B463F]'
                  }`}>
                  {documentData.obligations.length} items
                </span>
              </div>

              <div className="space-y-4">
                {documentData.obligations.map((obligation, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${isDarkMode ? 'bg-gray-800 border-gray-800 hover:border-[#27AE60]/50' : 'bg-[#2ECC71]/5 border-[#2ECC71]/20 hover:border-[#2ECC71]/30'
                      }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${isDarkMode ? 'bg-[#27AE60]' : 'bg-[#2ECC71]'}`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className={`${isDarkMode ? 'text-gray-400' : 'text-[#4B463F]'}`}>
                          {obligation}
                        </p>
                      </div>
                      <button className={`p-1 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-[#2ECC71]/10'
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
            <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-[#C8BEB4] shadow-lg'
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
                    className={`p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${isDarkMode ? 'bg-gray-800 border-gray-800 hover:border-[#C0392B]/50' : 'bg-[#E74C3C]/5 border-[#E74C3C]/20 hover:border-[#E74C3C]/30'
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
                        <p className={`${isDarkMode ? 'text-gray-400' : 'text-[#4B463F]'}`}>
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
            <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-[#C8BEB4] shadow-lg'
              }`}>
              <div className="flex items-center space-x-3 mb-6">
                <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-[#8C6A4A]/10' : 'bg-[#8C6A4A]/10'}`}>
                  <Users className="w-5 h-5 text-[#8C6A4A]" />
                </div>
                <h3 className="text-xl font-semibold">Involved Parties</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-gray-900 text-gray-400' : 'bg-[#F6F1E8] text-[#4B463F]'
                  }`}>
                  {documentData.parties.length} parties
                </span>
              </div>

              <div className="space-y-4">
                {documentData.parties.map((party, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${isDarkMode ? 'bg-gray-800 border-gray-800 hover:border-[#8C6A4A]/50' : 'bg-[#8C6A4A]/5 border-[#8C6A4A]/20 hover:border-[#8C6A4A]/30'
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#8C6A4A] flex items-center justify-center">
                        <span className="text-white font-semibold">{party.name.charAt(0)}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{party.name}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-[#F6F1E8] text-[#4B463F]'
                            }`}>
                            {party.type}
                          </span>
                          {party.role && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-[#8C6A4A]/10 text-[#8C6A4A]' : 'bg-[#8C6A4A]/10 text-[#8C6A4A]'
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
            <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-[#C8BEB4] shadow-lg'
              }`}>
              <div className="flex items-center space-x-3 mb-6">
                <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-[#8C6A4A]/10' : 'bg-[#8C6A4A]/10'}`}>
                  <Tag className="w-5 h-5 text-[#8C6A4A]" />
                </div>
                <h3 className="text-xl font-semibold">Key Terms & Concepts</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-gray-900 text-gray-400' : 'bg-[#F6F1E8] text-[#4B463F]'
                  }`}>
                  {documentData.keyTerms.length} terms
                </span>
              </div>

              <div className="flex flex-wrap gap-3">
                {documentData.keyTerms.map((term, index) => (
                  <div
                    key={index}
                    className={`px-4 py-2 rounded-xl border transition-all duration-200 hover:scale-105 cursor-pointer ${isDarkMode
                      ? 'bg-gray-800 border-gray-800 hover:border-[#8C6A4A]/50 text-gray-400'
                      : 'bg-[#8C6A4A]/5 border-[#8C6A4A]/20 hover:border-[#8C6A4A]/30 text-[#8C6A4A]'
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
          <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-[#C8BEB4] shadow-lg'
            }`}>
            <div className="flex items-center space-x-3 mb-4">
              <Activity className="w-5 h-5 text-[#8C6A4A]" />
              <h3 className="font-semibold">Analysis Summary</h3>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Completion</span>
                <span className={`text-sm font-bold ${isDarkMode ? 'text-[#27AE60]' : 'text-[#2ECC71]'}`}>{completionScore}%</span>
              </div>
              <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-[#EDE7DB]'}`}>
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${isDarkMode ? 'bg-[#27AE60]' : 'bg-[#2ECC71]'}`}
                  style={{ width: `${completionScore}%` }}
                />
              </div>
            </div>

            <div className={`mt-6 pt-4 border-t ${isDarkMode ? 'border-gray-800' : 'border-[#C8BEB4]'}`}>
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
          <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-[#C8BEB4] shadow-lg'
            }`}>
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center space-x-3 p-3 rounded-xl bg-[#8C6A4A] text-white hover:bg-[#17A085] transition-all duration-200">
                <Download className="w-4 h-4" />
                <span className="font-medium">Export Report</span>
              </button>
              <button className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${isDarkMode ? 'bg-gray-800 hover:bg-gray-800 text-gray-100' : 'bg-[#F6F1E8] hover:bg-[#EDE7DB]'
                }`}>
                <Brain className="w-4 h-4" />
                <span className="font-medium">Re-analyze</span>
              </button>
              <button className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${isDarkMode ? 'bg-gray-800 hover:bg-gray-800 text-gray-100' : 'bg-[#F6F1E8] hover:bg-[#EDE7DB]'
                }`}>
                <Share2 className="w-4 h-4" />
                <span className="font-medium">Share Results</span>
              </button>
            </div>
          </div>

          {/* Related Documents */}
          <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-[#C8BEB4] shadow-lg'
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
                  className={`p-3 rounded-xl border transition-all duration-200 hover:scale-[1.02] cursor-pointer ${isDarkMode ? 'bg-gray-800 border-gray-800 hover:border-[#8C6A4A]/50' : 'bg-[#F6F1E8] border-[#C8BEB4] hover:border-[#8C6A4A]/30'
                    }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium truncate mr-2">{doc.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-[#8C6A4A]/10 text-[#8C6A4A]' : 'bg-[#8C6A4A]/10 text-[#8C6A4A]'}`}>
                      {doc.similarity}%
                    </span>
                  </div>
                  <span className={`text-xs ${isDarkMode ? 'text-[#7A8291]' : 'text-[#7D8693]'}`}>{doc.type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};