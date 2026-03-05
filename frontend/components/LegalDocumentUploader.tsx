'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Upload, FileText, File, CheckCircle, AlertCircle, BarChart3,
  Eye, Download, RefreshCw, Loader2, List, Grid3X3, Search,
  Calendar, HardDrive
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthProvider';

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

const STYLES = `
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
.doc-item {
  animation: fadeSlideUp 0.44s cubic-bezier(0.22,1,0.36,1) both;
}
.doc-fade {
  animation: fadeIn 0.3s ease both;
}
`;

const LegalDocumentUploader: React.FC<LegalDocumentUploaderProps> = ({
  isDarkMode = false,
  onViewReport
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [clickingFileId, setClickingFileId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const { session } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchUploadedFiles = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      if (!session?.user) return;
      const { data, error } = await supabase
        .from('documents').select('*')
        .eq('user_id', session.user.id)
        .order('id', { ascending: false });
      if (error) throw error;

      interface DocRecord {
        id: string; content?: string; created_at: string;
        metadata: {
          pages?: number; words?: number; readingTime?: number;
          riskScore?: number; 'risk score'?: number; risk_score?: number;
          documentType?: string; fileSize?: number;
          status?: 'processing' | 'complete' | 'error';
        } | null;
      }

      const filesData: UploadedFile[] = (data as DocRecord[]).map(doc => {
        const m = doc.metadata || {};
        return {
          id: doc.id, name: doc.id,
          size: m.fileSize || (doc.content ? doc.content.length : 0),
          type: doc.id.split('.').pop()?.toLowerCase() || 'unknown',
          uploadDate: doc.created_at ? new Date(doc.created_at) : new Date(),
          pages: m.pages || 0, words: m.words || 0, readingTime: m.readingTime || 0,
          status: (m.status as 'processing' | 'complete' | 'error') || 'complete',
          riskScore: m.riskScore ?? m['risk score'] ?? m.risk_score ?? 0,
          category: m.documentType || 'Legal Document'
        };
      });
      setUploadedFiles(filesData);
    } catch (err) {
      console.error('Failed to fetch uploaded files:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetchUploadedFiles();
      const channel = supabase.channel('documents_changes')
        .on('postgres_changes', {
          event: '*', schema: 'public', table: 'documents',
          filter: `user_id=eq.${session.user.id}`
        }, () => fetchUploadedFiles(true))
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [fetchUploadedFiles, session]);

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';
    fetch(`${API_URL}/`).catch(() => { });
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string, cls = 'w-5 h-5') => {
    switch (type.toLowerCase()) {
      case 'pdf': return <FileText className={`${cls} text-rose-500`} />;
      case 'docx': case 'doc': return <File className={`${cls} text-[#8C6A4A]`} />;
      case 'json': return <BarChart3 className={`${cls} text-amber-500`} />;
      default: return <File className={`${cls} text-slate-400`} />;
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 8) return 'text-rose-500';
    if (score >= 6) return 'text-amber-500';
    if (score >= 4) return 'text-yellow-500';
    return 'text-emerald-500';
  };

  const handleDrag = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); }, []);
  const handleDragIn = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); }, []);
  const handleDragOut = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); }, []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    handleFiles(Array.from(e.dataTransfer.files));
  }, []);

  const handleFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) return;
    setIsUploading(true); setUploadProgress(0);
    const newFiles: UploadedFile[] = files.map(f => ({
      id: f.name, name: f.name, size: f.size,
      type: f.name.split('.').pop() || 'unknown',
      uploadDate: new Date(), status: 'processing', category: 'Processing...'
    }));
    setUploadedFiles(prev => [...newFiles, ...prev]);
    const interval = setInterval(() => setUploadProgress(p => p >= 90 ? 90 : p + Math.random() * 10), 500);

    for (const file of files) {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${session?.user?.id}/${Date.now()}_${sanitizedName}`;
      try {
        if (!session?.access_token) throw new Error('Not authenticated');
        const { error: uploadError } = await supabase.storage.from('pdfs').upload(filePath, file);
        if (uploadError) throw uploadError;
        await supabase.from('documents').upsert({
          id: file.name, user_id: session.user.id, content: '',
          metadata: { documentType: 'Processing...', fileSize: file.size, status: 'processing', filePath }
        });
        const res = await fetch('/api/trigger-analysis', {
          method: 'POST',
          body: JSON.stringify({ filePath, fileName: file.name, fileSize: file.size, fileType: file.type })
        });
        if (!res.ok) throw new Error('Failed to trigger analysis');
        setUploadedFiles(prev => prev.map(f =>
          f.name === file.name ? { ...f, status: 'processing', category: 'Pending Analysis...' } : f
        ));
      } catch (err) {
        console.error('Upload failed for', file.name, err);
        setUploadedFiles(prev => prev.map(f => f.name === file.name ? { ...f, status: 'error' } : f));
      }
    }
    clearInterval(interval);
    setUploadProgress(100);
    setTimeout(() => setIsUploading(false), 1000);
  }, [session]);

  const filteredFiles = uploadedFiles.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (f.category || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const processingCount = uploadedFiles.filter(f => f.status === 'processing').length;

  // ── Skeleton ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
        <div className={`border-2 border-dashed rounded-2xl p-12 animate-pulse ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-gray-200 dark:bg-gray-800 rounded-full" />
            <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mx-auto" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mx-auto" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`p-6 rounded-2xl border animate-pulse ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />
                <div className="flex-1 space-y-2">
                  <div className={`h-4 rounded w-3/4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />
                  <div className={`h-3 rounded w-1/2 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />
                </div>
              </div>
              <div className={`h-3 rounded w-1/3 mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />
              <div className="flex justify-between">
                <div className={`h-3 rounded w-1/3 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />
                <div className={`h-3 rounded w-1/4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{STYLES}</style>
      <div className="p-4 md:p-8 max-w-6xl mx-auto">

        {/* ── Upload Zone ───────────────────────────────────────────── */}
        <div className="mb-8">
          <div
            className={`border-2 border-dashed rounded-2xl p-6 md:p-12 text-center transition-all duration-300 cursor-pointer
              ${dragActive
                ? 'border-[#8C6A4A] bg-[#8C6A4A]/5 scale-[1.02]'
                : isDarkMode
                  ? 'border-gray-700 hover:border-[#8C6A4A]/50 bg-gray-900/50'
                  : 'border-gray-300 hover:border-[#8C6A4A]/50 bg-white shadow-xl'}
              ${isUploading ? 'pointer-events-none' : ''}`}
            onDragEnter={handleDragIn} onDragLeave={handleDragOut}
            onDragOver={handleDrag} onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input ref={fileInputRef} type="file" multiple accept=".pdf,.doc,.docx,.txt"
              onChange={e => handleFiles(Array.from(e.target.files || []))} className="hidden" />

            {isUploading ? (
              <div className="space-y-6 doc-fade">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#8C6A4A] to-[#6B5744] rounded-full flex items-center justify-center shadow-lg shadow-[#8C6A4A]/30">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Uploading &amp; Queuing Analysis</h3>
                  <div className="max-w-md mx-auto">
                    <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div className="h-full bg-gradient-to-r from-[#8C6A4A] to-[#6B5744] rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }} />
                    </div>
                    <p className="text-sm mt-2 font-medium text-[#8C6A4A]">{Math.round(uploadProgress)}% Complete</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-all duration-300
                  ${dragActive
                    ? 'bg-gradient-to-br from-[#8C6A4A] to-[#6B5744] text-white shadow-lg shadow-[#8C6A4A]/30'
                    : isDarkMode ? 'bg-gray-800 text-[#8C6A4A]' : 'bg-[#8C6A4A]/10 text-[#8C6A4A]'}`}>
                  <Upload className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Upload Legal Documents</h3>
                  <p className={isDarkMode ? 'text-gray-400' : 'text-[#8C7B6B]'}>
                    Drag files here or <span className="text-[#8C6A4A] font-semibold">click to browse</span>
                  </p>
                  <div className="flex items-center justify-center space-x-6 text-sm mt-3">
                    <div className="flex items-center space-x-2"><FileText className="w-4 h-4 text-rose-500" /><span>PDF</span></div>
                    <div className="flex items-center space-x-2"><File className="w-4 h-4 text-[#8C6A4A]" /><span>DOCX</span></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Documents section ─────────────────────────────────────── */}
        <div className="space-y-6">
          {/* Processing Banner */}
          {processingCount > 0 && (
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border doc-fade
              ${isDarkMode ? 'bg-[#8C6A4A]/10 border-[#8C6A4A]/30 text-[#8C6A4A]' : 'bg-[#8C6A4A]/10 border-[#8C6A4A]/30 text-[#6B5744]'}`}>
              <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
              <p className="text-sm font-medium">
                <strong>{processingCount} document{processingCount > 1 ? 's' : ''}</strong> being analyzed —{' '}
                <span className="opacity-70">AI is extracting insights, this may take a couple of minutes.</span>
              </p>
            </div>
          )}

          {/* Header row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold">Recent Documents</h2>
              <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-gray-500' : 'text-[#8C7B6B]'}`}>
                {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} uploaded
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${isDarkMode ? 'text-gray-600' : 'text-[#8C7B6B]'}`} />
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search…"
                  className={`pl-9 pr-3 py-2 text-sm rounded-xl border outline-none transition focus:ring-2 focus:ring-[#8C6A4A]/20 focus:border-[#8C6A4A] w-44
                    ${isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-200 placeholder-gray-600' : 'bg-gray-50 border-gray-200 text-[#4B463F] placeholder-gray-400'}`} />
              </div>

              {/* View toggle — list view only on desktop */}
              <div className={`hidden md:flex items-center rounded-xl border p-1 ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
                <button onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#8C6A4A] text-white shadow-sm' : isDarkMode ? 'text-gray-500 hover:text-gray-300' : 'text-[#8C7B6B] hover:text-[#4B463F]'}`}>
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#8C6A4A] text-white shadow-sm' : isDarkMode ? 'text-gray-500 hover:text-gray-300' : 'text-[#8C7B6B] hover:text-[#4B463F]'}`}>
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Refresh */}
              <button
                onClick={async () => { setIsRefreshing(true); await fetchUploadedFiles(); setIsRefreshing(false); }}
                disabled={isRefreshing}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-60
                  bg-[#8C6A4A] hover:bg-[#6B5744] text-white`}>
                {isRefreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
          </div>

          {/* Empty state */}
          {filteredFiles.length === 0 ? (
            <div className={`text-center py-16 rounded-2xl border-2 border-dashed
              ${isDarkMode ? 'border-gray-800 text-gray-600' : 'border-gray-200 text-gray-400'}`}>
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-40" />
              <h3 className="text-lg font-semibold mb-1">{searchQuery ? 'No matches found' : 'No documents yet'}</h3>
              <p className="text-sm opacity-60">{searchQuery ? 'Try a different keyword' : 'Upload your first file above to get started'}</p>
            </div>

          ) : viewMode === 'grid' ? (

            /* ── GRID VIEW ──────────────────────────────────────────── */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFiles.slice(0, 9).map((file, i) => (
                <div
                  key={file.id}
                  onClick={() => {
                    if (file.status === 'processing') return;
                    setClickingFileId(file.id);
                    setTimeout(() => { setClickingFileId(null); onViewReport?.(file.name); }, 280);
                  }}
                  className={`doc-item group relative p-6 rounded-2xl border transition-all duration-300
                    ${file.status !== 'processing' ? 'cursor-pointer hover:scale-[1.03] hover:shadow-xl' : 'cursor-not-allowed'}
                    ${isDarkMode ? 'bg-gray-900 border-gray-800 hover:border-gray-700' : 'bg-white border-[#C8BEB4] hover:border-gray-300 shadow-lg'}`}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  {/* Click overlay */}
                  {clickingFileId === file.id && (
                    <div className="absolute inset-0 rounded-2xl flex items-center justify-center bg-white/70 dark:bg-gray-900/70 z-10 backdrop-blur-[1px]">
                      <Loader2 className="w-6 h-6 animate-spin text-[#8C6A4A]" />
                    </div>
                  )}

                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className={`p-2.5 rounded-xl flex-shrink-0 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                        {getFileIcon(file.type)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm truncate" title={file.name}>
                          {file.name.replace(/\.[^/.]+$/, '')}
                        </h3>
                        <p className={`text-xs mt-0.5 truncate ${isDarkMode ? 'text-gray-500' : 'text-[#8C7B6B]'}`}>
                          {file.category}
                        </p>
                      </div>
                    </div>

                    {/* Status badge */}
                    <div className="ml-2 flex-shrink-0">
                      {file.status === 'processing' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#8C6A4A]/10 text-[#8C6A4A]">
                          <Loader2 className="w-2.5 h-2.5 animate-spin" />Analyzing
                        </span>
                      ) : file.status === 'complete' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-500">
                          <CheckCircle className="w-2.5 h-2.5" />Done
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-500">
                          <AlertCircle className="w-2.5 h-2.5" />Error
                        </span>
                      )}
                    </div>
                  </div>


                  {/* Footer */}
                  <div className={`flex items-center justify-between pt-3 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                    <div className={`flex items-center gap-3 text-xs ${isDarkMode ? 'text-gray-600' : 'text-[#8C7B6B]'}`}>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{file.uploadDate.toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><HardDrive className="w-3 h-3" />{formatFileSize(file.size)}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button onClick={e => e.stopPropagation()}
                        className={`p-1.5 rounded-lg ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={e => e.stopPropagation()}
                        className={`p-1.5 rounded-lg ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          ) : (

            /* ── LIST VIEW ──────────────────────────────────────────── */
            <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'border-gray-800' : 'border-[#C8BEB4]'}`}>
              {/* Header row */}
              <div className={`grid items-center gap-4 px-6 py-3 text-xs font-semibold uppercase tracking-wider
                ${isDarkMode ? 'bg-gray-900 border-b border-gray-800 text-gray-600' : 'bg-white border-b border-[#C8BEB4] text-[#8C7B6B]'}`}
                style={{ gridTemplateColumns: '2.5rem 1fr 6rem 7rem 6rem 4rem' }}>
                <span />
                <span>Document</span>
                <span className="text-center">Risk</span>
                <span className="text-center">Status</span>
                <span className="text-center">Size</span>
                <span />
              </div>

              {filteredFiles.map((file, i) => (
                <div
                  key={file.id}
                  onClick={() => {
                    if (file.status === 'processing') return;
                    setClickingFileId(file.id);
                    setTimeout(() => { setClickingFileId(null); onViewReport?.(file.name); }, 280);
                  }}
                  className={`doc-item grid items-center gap-4 px-6 py-4 transition-all duration-200
                    ${file.status !== 'processing' ? 'cursor-pointer' : 'cursor-default'}
                    ${isDarkMode
                      ? 'border-b border-gray-800/60 last:border-0 hover:bg-gray-900/70'
                      : 'bg-white border-b border-[#C8BEB4] last:border-0 hover:bg-[#F6F1E8]/60'}`}
                  style={{ gridTemplateColumns: '2.5rem 1fr 6rem 7rem 6rem 4rem', animationDelay: `${i * 40}ms` }}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    {clickingFileId === file.id
                      ? <Loader2 className="w-4 h-4 animate-spin text-[#8C6A4A]" />
                      : getFileIcon(file.type, 'w-4 h-4')}
                  </div>

                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{file.name.replace(/\.[^/.]+$/, '')}</p>
                    <div className={`flex items-center gap-2 mt-0.5 text-xs ${isDarkMode ? 'text-gray-600' : 'text-[#8C7B6B]'}`}>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{file.uploadDate.toLocaleDateString()}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${isDarkMode ? 'bg-gray-800 text-gray-600' : 'bg-gray-100 text-gray-400'}`}>{file.category}</span>
                    </div>
                  </div>

                  <div className="text-center">
                    {file.status === 'complete' && file.riskScore != null && file.riskScore > 0
                      ? <span className={`text-base font-bold ${getRiskColor(file.riskScore)}`}>{file.riskScore}</span>
                      : <span className={isDarkMode ? 'text-[#4B463F]' : 'text-gray-300'}>—</span>}
                  </div>

                  <div className="flex justify-center">
                    {file.status === 'processing' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#8C6A4A]/10 text-[#8C6A4A]">
                        <Loader2 className="w-2.5 h-2.5 animate-spin" />Analyzing
                      </span>
                    ) : file.status === 'complete' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-500">
                        <CheckCircle className="w-2.5 h-2.5" />Complete
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-500">
                        <AlertCircle className="w-2.5 h-2.5" />Error
                      </span>
                    )}
                  </div>

                  <div className={`text-center text-xs ${isDarkMode ? 'text-gray-600' : 'text-[#8C7B6B]'}`}>
                    {formatFileSize(file.size)}
                  </div>

                  <div className="flex justify-end gap-1">
                    <button onClick={e => e.stopPropagation()}
                      className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${isDarkMode ? 'hover:bg-gray-800 text-gray-600' : 'hover:bg-gray-100 text-gray-400'}`}>
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LegalDocumentUploader;