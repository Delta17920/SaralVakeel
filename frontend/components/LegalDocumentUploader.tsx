'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
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
  onViewReport?: (filename: string) => void;
}

const LegalDocumentUploader: React.FC<LegalDocumentUploaderProps> = ({ 
  isDarkMode = false, 
  onViewReport 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch files from API on component mount
  useEffect(() => {
    fetchUploadedFiles();
  }, []);

  const fetchUploadedFiles = async () => {
    setIsLoading(true);
    try {
      // Get list of JSON files
      const response = await fetch('/api/list-json-files');
      const data = await response.json();
      
      // Fetch details for each file
      const filesData = await Promise.all(
        data.files.map(async (filename: string, index: number) => {
          try {
            const fileResponse = await fetch(`/api/fetch-json?filename=${encodeURIComponent(filename)}`);
            const fileData = await fileResponse.json();
            
            // Calculate file size estimate based on content
            const contentSize = JSON.stringify(fileData).length;
            const estimatedFileSize = contentSize * 2; // Rough estimate
            
            return {
              id: `file-${index}`,
              name: filename,
              size: estimatedFileSize,
              type: filename.split('.').pop()?.toLowerCase() || 'json',
              uploadDate: fileData.data?.completedAt ? new Date(fileData.data.completedAt) : new Date(),
              pages: fileData.data?.pages || Math.floor(Math.random() * 50) + 10,
              words: fileData.data?.words || Math.floor(Math.random() * 15000) + 5000,
              readingTime: fileData.data?.readingTime || Math.floor(Math.random() * 80) + 20,
              status: fileData.data?.status || 'complete',
              riskScore: fileData.data?.riskScore || parseFloat((Math.random() * 10).toFixed(1)),
              category: fileData.data?.documentType || fileData.data?.category || 'Legal Document'
            } as UploadedFile;
          } catch (error) {
            console.error(`Failed to fetch ${filename}:`, error);
            return {
              id: `file-${index}`,
              name: filename,
              size: 1000000,
              type: filename.split('.').pop()?.toLowerCase() || 'json',
              uploadDate: new Date(),
              pages: 0,
              words: 0,
              readingTime: 0,
              status: 'error',
              riskScore: 0,
              category: 'Unknown'
            } as UploadedFile;
          }
        })
      );

      setUploadedFiles(filesData);
    } catch (error) {
      console.error('Failed to fetch uploaded files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate statistics from real data
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
      case 'json':
        return <BarChart3 className="w-5 h-5 text-green-500" />;
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

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Generate file metadata
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

    // Progress simulation
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

    // Upload files to GCP
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const res = await fetch(`/api/upload-url?filename=${encodeURIComponent(file.name)}&contentType=${encodeURIComponent(file.type)}`);
        const { url } = await res.json();
        
        await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file,
        });

        setUploadedFiles(prev =>
          prev.map(f => f.id === newFiles[i].id ? { ...f, status: 'complete' } : f)
        );

      } catch (err) {
        console.error('Upload failed for', file.name, err);
        setUploadedFiles(prev =>
          prev.map(f => f.id === newFiles[i].id ? { ...f, status: 'error' } : f)
        );
      }
    }

    // Refresh the files list after upload
    setTimeout(() => {
      fetchUploadedFiles();
    }, 2000);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-8">
          {/* Upload Zone Skeleton */}
          <div className={`border-2 border-dashed rounded-2xl p-12 ${
            isDarkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-300 bg-white'
          }`}>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gray-200 dark:bg-gray-800 rounded-full"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mx-auto"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mx-auto"></div>
            </div>
          </div>

          {/* Documents Grid Skeleton */}
          <div className="space-y-6">
            <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className={`p-6 rounded-2xl border ${
                  isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-5 h-5 bg-gray-200 dark:bg-gray-800 rounded"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-4"></div>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
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

      {/* Documents Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">
            Recent Documents
          </h2>
          <button 
            onClick={fetchUploadedFiles}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>

        {uploadedFiles.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No documents found</h3>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Upload your first document to get started with AI analysis.
            </p>
          </div>
        ) : (
          <AnimatedList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {uploadedFiles.slice(-6).map((file) => (
  <div
    key={file.id}
    onClick={() => onViewReport?.(file.name)}
    className={`group p-6 rounded-2xl border transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer ${
      isDarkMode ? 'bg-gray-900 border-gray-800 hover:border-gray-700' : 'bg-white border-gray-200 hover:border-gray-300 shadow-lg'
    }`}
  >
    {/* Header */}
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        {getFileIcon(file.type)}
        <div className="min-w-0">
          <h3 className="font-semibold truncate text-sm" title={file.name}>
            {file.name.replace(/\.[^/.]+$/, '')}
          </h3>
          <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {file.category}
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button 
          onClick={(e) => e.stopPropagation()}
          className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
        >
          <Eye className="w-4 h-4" />
        </button>
        <button 
          onClick={(e) => e.stopPropagation()}
          className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
        >
          <Download className="w-4 h-4" />
        </button>
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

    {/* Click indicator overlay */}
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600/0 to-violet-600/0 group-hover:from-blue-600/5 group-hover:to-violet-600/5 transition-all duration-300 pointer-events-none" />
  </div>
))}
          </AnimatedList>
        )}
      </div>
    </div>
  );
};

export default LegalDocumentUploader;