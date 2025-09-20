'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Upload, 
  FileText, 
  File, 
  CheckCircle, 
  AlertCircle, 
  Moon, 
  Sun, 
  User, 
  Clock, 
  BarChart3,
  Eye,
  Download,
  Scale,
  Shield,
  Search,
  Bell,
  Plus,
  Brain,
  Menu,
  X,
  Users,
  PieChart,
  Settings,
  TrendingUp,
  Activity,
  Award,
  ChevronRight,
} from 'lucide-react';

// Simple Magic UI Components (recreated to avoid import issues)
import { AnimatedList } from './magicui/animated-list';
import { VideoText } from './magicui/video-text';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: Date;
  pages?: number;
  words?: number;
  readingTime?: number;
  status: 'processing' | 'complete' | 'error';
  riskScore?: number;
  category?: string;
}

const LegalDocumentUploader = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([
    {
      id: '1',
      name: 'M&A_Agreement_Confidential.pdf',
      size: 4567890,
      type: 'pdf',
      uploadDate: new Date('2024-01-15'),
      pages: 67,
      words: 25800,
      readingTime: 103,
      status: 'complete',
      riskScore: 8.5,
      category: 'Mergers & Acquisitions'
    },
    {
      id: '2',
      name: 'Executive_Employment_Contract.docx',
      size: 2345678,
      type: 'docx',
      uploadDate: new Date('2024-01-14'),
      pages: 28,
      words: 12400,
      readingTime: 50,
      status: 'complete',
      riskScore: 6.2,
      category: 'Employment Law'
    },
    {
      id: '3',
      name: 'IP_Licensing_Framework.pdf',
      size: 3456789,
      type: 'pdf',
      uploadDate: new Date('2024-01-13'),
      pages: 45,
      words: 18900,
      readingTime: 76,
      status: 'processing',
      riskScore: 7.8,
      category: 'Intellectual Property'
    },
    {
      id: '4',
      name: 'Corporate_Governance_Policy.pdf',
      size: 5678901,
      type: 'pdf',
      uploadDate: new Date('2024-01-12'),
      pages: 89,
      words: 35600,
      readingTime: 142,
      status: 'complete',
      riskScore: 4.3,
      category: 'Corporate Law'
    },
    {
      id: '5',
      name: 'Data_Protection_Compliance.docx',
      size: 1987654,
      type: 'docx',
      uploadDate: new Date('2024-01-11'),
      pages: 34,
      words: 14200,
      readingTime: 57,
      status: 'complete',
      riskScore: 9.1,
      category: 'Privacy & Data'
    }
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate statistics
  const stats = {
    totalFiles: uploadedFiles.length,
    totalPages: uploadedFiles.reduce((sum, file) => sum + (file.pages || 0), 0),
    totalWords: uploadedFiles.reduce((sum, file) => sum + (file.words || 0), 0),
    totalHours: Math.round(uploadedFiles.reduce((sum, file) => sum + (file.readingTime || 0), 0) / 60)
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'docx':
      case 'doc':
        return <File className="w-5 h-5 text-blue-500" />;
      default:
        return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 8) return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
    if (score >= 6) return 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800';
    return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFiles = (files: File[]) => {
  if (files.length === 0) return;

  setIsUploading(true);
  setUploadProgress(0);

  // 1️⃣ Generate file metadata as before
  const newFiles: UploadedFile[] = files.map(file => ({
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    name: file.name,
    size: file.size,
    type: file.name.split('.').pop() || 'unknown',
    uploadDate: new Date(),
    pages: Math.floor(Math.random() * 50) + 10,
    words: Math.floor(Math.random() * 15000) + 5000,
    readingTime: Math.floor(Math.random() * 80) + 20,
    status: 'processing',
    riskScore: Math.round((Math.random() * 5 + 3) * 10) / 10,
    category: ['Corporate Law', 'Employment Law', 'Intellectual Property', 'Privacy & Data', 'Mergers & Acquisitions'][Math.floor(Math.random() * 5)]
  }));

  setUploadedFiles(prev => [...prev, ...newFiles]);

  // 2️⃣ Start progress simulation (keeps your current UI behavior)
  const progressInterval = setInterval(() => {
    setUploadProgress(prev => {
      if (prev >= 100) {
        clearInterval(progressInterval);
        setIsUploading(false);
        return 100;
      }
      return prev + Math.random() * 12;
    });
  }, 120);

  // 3️⃣ Upload each file to GCP (async, separate from progress simulation)
  files.forEach(async (file, idx) => {
    try {
      // 3a: Request signed URL from backend
      const res = await fetch(`/api/upload-url?filename=${encodeURIComponent(file.name)}&contentType=${encodeURIComponent(file.type)}`);
      const { url } = await res.json();
      // 3b: Upload file directly to GCP
      await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      // 3c: Update file status when done
      setUploadedFiles(prev =>
        prev.map(f => f.id === newFiles[idx].id ? { ...f, status: 'complete' } : f)
      );

    } catch (err) {
      console.error('Upload failed for', file.name, err);
      setUploadedFiles(prev =>
        prev.map(f => f.id === newFiles[idx].id ? { ...f, status: 'error' } : f)
      );
    }
  });
};


  const filteredFiles = uploadedFiles.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  

  const themeClasses = isDarkMode 
    ? 'bg-gray-950 text-white' 
    : 'bg-slate-50 text-gray-900';

  return (
    <div className={`min-h-screen transition-colors duration-300 ${themeClasses}`}>
      {/* Header */}
      <Navbar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} searchQuery={searchQuery} setSearchQuery={setSearchQuery}/>

      <div className="flex">
        {/* Sidebar */}
        <Sidebar isDarkMode={isDarkMode}
  sidebarExpanded={sidebarExpanded}
  setSidebarExpanded={setSidebarExpanded}
  activeTab={activeTab}
  setActiveTab={setActiveTab}
  uploadedFilesCount={uploadedFiles.length}/>

        {/* Main Content */}
        <main className="flex-1 p-8 max-w-6xl">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { 
                icon: FileText, 
                value: stats.totalFiles, 
                label: 'Legal Documents', 
                color: 'text-blue-600',
                bg: 'bg-blue-50 dark:bg-blue-900/20'
              },
              { 
                icon: File, 
                value: stats.totalPages, 
                label: 'Total Pages', 
                color: 'text-violet-600',
                bg: 'bg-violet-50 dark:bg-violet-900/20'
              },
              { 
                icon: BarChart3, 
                value: `${(stats.totalWords / 1000).toFixed(0)}k`, 
                label: 'Words Analyzed', 
                color: 'text-emerald-600',
                bg: 'bg-emerald-50 dark:bg-emerald-900/20'
              },
              { 
                icon: Clock, 
                value: stats.totalHours, 
                label: 'Processing Hours', 
                color: 'text-amber-600',
                bg: 'bg-amber-50 dark:bg-amber-900/20'
              }
            ].map((stat, index) => (
              <div key={index} className={`p-6 rounded-2xl border transition-all duration-300 hover:scale-105 ${
                isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100 shadow-lg'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg ${stat.bg}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Upload Zone */}
          <div className="mb-8">
            <div
              className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer ${
                dragActive
                  ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-900/20 scale-105'
                  : isDarkMode
                  ? 'border-gray-700 hover:border-gray-600 bg-gray-900/50'
                  : 'border-gray-300 hover:border-gray-400 bg-white shadow-xl'
              } ${isUploading ? 'pointer-events-none' : ''}`}
              onDragEnter={handleDragIn}
              onDragLeave={handleDragOut}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt"
                onChange={(e) => handleFiles(Array.from(e.target.files || []))}
                className="hidden"
              />

              {isUploading ? (
                <div className="space-y-6">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-600 to-violet-600 rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-white animate-bounce" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Processing Documents</h3>
                    <div className="max-w-md mx-auto">
                      <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm mt-2 font-medium">{Math.round(uploadProgress)}% Complete</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-all duration-300 ${
                    dragActive 
                      ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white' 
                      : isDarkMode 
                      ? 'bg-gray-800 text-gray-300' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Upload className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">Upload Legal Documents</h3>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Drag files here or <span className="text-blue-600 font-semibold">click to browse</span>
                    </p>
                    <div className="flex items-center justify-center space-x-6 text-sm mt-3">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-red-500" />
                        <span>PDF</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <File className="w-4 h-4 text-blue-500" />
                        <span>DOCX</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Documents Grid with AnimatedList */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Recent Documents</h2>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4" />
                <span>Add Document</span>
              </button>
            </div>

            <AnimatedList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFiles.slice(-3).map((file) => (
                <div
                  key={file.id}
                  className={`group p-6 rounded-2xl border transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                    isDarkMode ? 'bg-gray-900 border-gray-800 hover:border-gray-700' : 'bg-white border-gray-200 hover:border-gray-300 shadow-lg'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {getFileIcon(file.type)}
                      <div className="min-w-0">
                        <h3 className="font-semibold truncate text-sm" title={file.name}>
                          {file.name}
                        </h3>
                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {file.category}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Risk Score Badge */}
                  {file.riskScore && (
                    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium border mb-4 ${getRiskColor(file.riskScore)}`}>
                      <div className="w-2 h-2 rounded-full bg-current"></div>
                      <span>Risk Score: {file.riskScore}/10</span>
                    </div>
                  )}

                  {/* Document Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className={`text-center p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                      <p className="text-lg font-bold">{file.pages}</p>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Pages</p>
                    </div>
                    <div className={`text-center p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                      <p className="text-lg font-bold">{(file.words! / 1000).toFixed(1)}k</p>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Words</p>
                    </div>
                    <div className={`text-center p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                      <p className="text-lg font-bold">{file.readingTime}m</p>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Read</p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {file.uploadDate.toLocaleDateString()} • {formatFileSize(file.size)}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {file.status === 'processing' ? (
                        <div className="flex items-center space-x-2 text-yellow-500">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                          <span className="text-xs font-medium">Processing</span>
                        </div>
                      ) : file.status === 'complete' ? (
                        <div className="flex items-center space-x-2 text-green-500">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-xs font-medium">Complete</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 text-red-500">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-xs font-medium">Error</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </AnimatedList>

            {/* AI Analysis Section */}
            <div className="mt-12 space-y-6">
              <h2 className="text-2xl font-semibold">AI-Powered Insights</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`p-6 rounded-2xl border transition-all duration-300 hover:scale-105 ${
                  isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-lg'
                }`}>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="p-3 bg-gradient-to-r from-blue-600 to-violet-600 rounded-xl">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Contract Analysis</h3>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        AI-powered review
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Key Clauses</span>
                      <span className="font-semibold">47</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Risk Factors</span>
                      <span className="font-semibold text-amber-600">12</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Compliance Score</span>
                      <span className="font-semibold text-green-600">94%</span>
                    </div>
                  </div>
                  
                  <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    View Analysis
                  </button>
                </div>

                <div className={`p-6 rounded-2xl border transition-all duration-300 hover:scale-105 ${
                  isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-lg'
                }`}>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="p-3 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Compliance Monitor</h3>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Regulatory compliance
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">GDPR Compliance</span>
                      <span className="font-semibold text-green-600">98%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">SOX Requirements</span>
                      <span className="font-semibold text-green-600">95%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Risk Assessment</span>
                      <span className="font-semibold text-amber-600">Medium</span>
                    </div>
                  </div>
                  
                  <button className="w-full py-2 px-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                    View Compliance
                  </button>
                </div>

                <div className={`p-6 rounded-2xl border transition-all duration-300 hover:scale-105 ${
                  isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-lg'
                }`}>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Risk Analytics</h3>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Smart risk detection
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">High Risk Items</span>
                      <span className="font-semibold text-red-600">3</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Medium Risk</span>
                      <span className="font-semibold text-amber-600">8</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Low Risk</span>
                      <span className="font-semibold text-green-600">24</span>
                    </div>
                  </div>
                  
                  <button className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    View Analytics
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Activity Timeline */}
            <div className="mt-12 space-y-6">
              <h2 className="text-2xl font-semibold">Recent Activity</h2>
              
              <div className={`p-6 rounded-2xl border ${
                isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-lg'
              }`}>
                <div className="space-y-4">
                  {[
                    {
                      icon: CheckCircle,
                      color: 'text-green-600',
                      bg: 'bg-green-50 dark:bg-green-900/20',
                      title: 'M&A Agreement analysis completed',
                      description: 'Risk score: 8.5/10 - Review recommended',
                      time: '2 hours ago',
                      user: 'AI Assistant'
                    },
                    {
                      icon: Upload,
                      color: 'text-blue-600',
                      bg: 'bg-blue-50 dark:bg-blue-900/20',
                      title: 'New documents uploaded',
                      description: '3 employment contracts added to review queue',
                      time: '4 hours ago',
                      user: 'Sarah Chen'
                    },
                    {
                      icon: AlertCircle,
                      color: 'text-amber-600',
                      bg: 'bg-amber-50 dark:bg-amber-900/20',
                      title: 'Compliance alert triggered',
                      description: 'GDPR clause missing in data processing agreement',
                      time: '6 hours ago',
                      user: 'Compliance Monitor'
                    },
                    {
                      icon: Award,
                      color: 'text-purple-600',
                      bg: 'bg-purple-50 dark:bg-purple-900/20',
                      title: 'Contract review milestone reached',
                      description: '100 documents successfully analyzed this month',
                      time: '1 day ago',
                      user: 'System'
                    }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-start space-x-4 group">
                      <div className={`p-2 rounded-lg ${activity.bg} group-hover:scale-110 transition-transform duration-200`}>
                        <activity.icon className={`w-5 h-5 ${activity.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">{activity.title}</h4>
                          <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            {activity.time}
                          </span>
                        </div>
                        <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {activity.description}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                            isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {activity.user.charAt(0)}
                          </div>
                          <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            {activity.user}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button className={`w-full text-center py-2 text-sm font-medium transition-colors ${
                    isDarkMode 
                      ? 'text-gray-400 hover:text-gray-300' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}>
                    View All Activity
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-12 space-y-6">
              <h2 className="text-2xl font-semibold">Quick Actions</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    icon: Plus,
                    title: 'New Contract',
                    description: 'Create new contract',
                    color: 'from-blue-600 to-cyan-600',
                    action: () => console.log('New contract')
                  },
                  {
                    icon: Brain,
                    title: 'AI Review',
                    description: 'Start AI analysis',
                    color: 'from-purple-600 to-pink-600',
                    action: () => console.log('AI review')
                  },
                  {
                    icon: PieChart,
                    title: 'Generate Report',
                    description: 'Create compliance report',
                    color: 'from-emerald-600 to-teal-600',
                    action: () => console.log('Generate report')
                  },
                  {
                    icon: Settings,
                    title: 'Settings',
                    description: 'Configure preferences',
                    color: 'from-gray-600 to-gray-700',
                    action: () => console.log('Settings')
                  }
                ].map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className={`p-6 rounded-2xl border text-left transition-all duration-300 hover:scale-105 hover:shadow-xl group ${
                      isDarkMode ? 'bg-gray-900 border-gray-800 hover:border-gray-700' : 'bg-white border-gray-200 hover:border-gray-300 shadow-lg'
                    }`}
                  >
                    <div className="flex items-center space-x-4 mb-3">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${action.color} group-hover:scale-110 transition-transform duration-200`}>
                        <action.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <h3 className="font-semibold mb-1">{action.title}</h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {action.description}
                    </p>
                    <ChevronRight className={`w-4 h-4 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <Footer isDarkMode={isDarkMode}/>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LegalDocumentUploader;