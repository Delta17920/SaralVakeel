'use client';

import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, 
  FileText, 
  File, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  BarChart3,
  Eye,
  Download,
  Plus,
  Brain,
  Shield,
  TrendingUp,
  Activity,
  Award,
  ChevronRight
} from 'lucide-react';

// Simple Magic UI Components (recreated to avoid import issues)
import { AnimatedList } from './magicui/animated-list';

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

interface LegalDocumentUploaderProps {
  isDarkMode?: boolean;
}

const LegalDocumentUploader: React.FC<LegalDocumentUploaderProps> = ({ isDarkMode = false }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
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

  return (
    <div className="p-8 max-w-6xl mx-auto">
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
          {uploadedFiles.slice(-3).map((file) => (
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
      </div>
    </div>
  );
};

export default LegalDocumentUploader;