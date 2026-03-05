import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthProvider';
import { useDialog } from './ConfirmDialog';
import {
  FileText, Eye, Download, Search, Calendar,
  AlertTriangle, CheckCircle, BarChart3, RefreshCw,
  Grid, List, MoreHorizontal, TrendingUp, Trash2, Loader2
} from 'lucide-react';

interface ReportsListProps {
  isDarkMode?: boolean;
  onViewReport?: (filename: string) => void;
}

interface ReportItem {
  filename: string; title: string; documentType: string;
  createdAt: Date; riskScore: number; findings: number;
  status: 'complete' | 'processing' | 'warning' | 'error';
  summary: string; obligations: number; parties: number;
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
.rpt-item {
  animation: fadeSlideUp 0.45s cubic-bezier(0.22,1,0.36,1) both;
}
.rpt-fade {
  animation: fadeIn 0.3s ease both;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
`;

export const ReportsList: React.FC<ReportsListProps> = ({ isDarkMode = false, onViewReport }) => {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'risk' | 'title'>('date');
  const [filterBy, setFilterBy] = useState<'all' | 'high-risk' | 'recent'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [clickingFilename, setClickingFilename] = useState<string | null>(null);
  const { session } = useAuth();
  const dialog = useDialog();

  useEffect(() => { if (session?.user) fetchReports(); }, [session]);

  const fetchReports = async () => {
    if (!session?.user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('documents').select('*').eq('user_id', session.user.id);
      if (error) throw error;

      interface DocRecord {
        id: string; created_at: string;
        metadata: {
          documentTitle?: string; documentType?: string;
          riskScore?: number; 'risk score'?: number; risk_score?: number;
          findings?: number; summary?: string;
          obligations?: string[]; parties?: { name: string }[];
        } | null;
      }

      const reportsData: ReportItem[] = (data as DocRecord[]).map(doc => {
        const m = doc.metadata || {};
        return {
          filename: doc.id,
          title: m.documentTitle || doc.id.replace(/\.[^/.]+$/, ''),
          documentType: m.documentType || 'Document',
          createdAt: doc.created_at ? new Date(doc.created_at) : new Date(),
          riskScore: m.riskScore || m['risk score'] || m.risk_score || 0,
          findings: m.findings || 0,
          status: ((m as Record<string, unknown>).status as ReportItem['status']) || 'complete',
          summary: m.summary || 'Analysis completed successfully.',
          obligations: m.obligations?.length || 0,
          parties: m.parties?.length || 0,
        };
      });
      setReports(reportsData);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchReports();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleDelete = async (filename: string) => {
    const ok = await dialog.confirm({
      title: 'Delete Document',
      message: 'This will permanently remove the document and its analysis. This cannot be undone.',
      type: 'confirm-delete',
      confirmLabel: 'Delete',
    });
    if (!ok) return;
    try {
      if (!session?.access_token) return;
      const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';
      const res = await fetch(`${API_URL}/documents/${filename}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${session.access_token}` }
      });
      if (res.ok) setReports(prev => prev.filter(r => r.filename !== filename));
      else await dialog.alert({ title: 'Delete Failed', message: 'Failed to delete document. Please try again.', type: 'alert-error' });
    } catch { await dialog.alert({ title: 'Error', message: 'An error occurred while deleting. Please try again.', type: 'alert-error' }); }
  };

  const getRiskLevel = (score: number) => {
    if (score >= 8) return { level: 'High', color: isDarkMode ? 'text-[#C0392B]' : 'text-[#E74C3C]', bg: isDarkMode ? 'bg-[#C0392B]/10' : 'bg-[#E74C3C]/10' };
    if (score >= 6) return { level: 'Medium', color: isDarkMode ? 'text-[#D4AC0D]' : 'text-[#F1C40F]', bg: isDarkMode ? 'bg-[#D4AC0D]/10' : 'bg-[#F1C40F]/10' };
    if (score >= 4) return { level: 'Low-Med', color: isDarkMode ? 'text-[#D4AC0D]' : 'text-[#F1C40F]', bg: isDarkMode ? 'bg-[#D4AC0D]/10' : 'bg-[#F1C40F]/10' };
    return { level: 'Low', color: isDarkMode ? 'text-[#27AE60]' : 'text-[#2ECC71]', bg: isDarkMode ? 'bg-[#27AE60]/10' : 'bg-[#2ECC71]/10' };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return isDarkMode ? 'text-[#27AE60] bg-[#27AE60]/10 border-[#27AE60]/30' : 'text-[#2ECC71] bg-[#2ECC71]/10 border-[#2ECC71]/30';
      case 'processing': return 'text-[#8C6A4A] bg-[#8C6A4A]/10 border-[#8C6A4A]/30';
      case 'warning': return isDarkMode ? 'text-[#D4AC0D] bg-[#D4AC0D]/10 border-[#D4AC0D]/30' : 'text-[#F1C40F] bg-[#F1C40F]/10 border-[#F1C40F]/30';
      case 'error': return isDarkMode ? 'text-[#C0392B] bg-[#C0392B]/10 border-[#C0392B]/30' : 'text-[#E74C3C] bg-[#E74C3C]/10 border-[#E74C3C]/30';
      default: return isDarkMode ? 'text-[#8C7B6B] bg-[#8C7B6B]/10 border-[#8C7B6B]/30' : 'text-[#8C7B6B] bg-[#8C7B6B]/10 border-[#8C7B6B]/30';
    }
  };

  const filteredReports = reports
    .filter(r => {
      const q = searchQuery.toLowerCase();
      const matchQ = r.title.toLowerCase().includes(q) || r.documentType.toLowerCase().includes(q);
      let matchF = true;
      if (filterBy === 'high-risk') matchF = parseFloat(r.riskScore.toString()) >= 6;
      else if (filterBy === 'recent') {
        const ago = new Date(); ago.setDate(ago.getDate() - 1);
        matchF = r.createdAt >= ago;
      }
      return matchQ && matchF;
    })
    .sort((a, b) => {
      if (sortBy === 'date') return b.createdAt.getTime() - a.createdAt.getTime();
      if (sortBy === 'risk') return parseFloat(b.riskScore.toString()) - parseFloat(a.riskScore.toString());
      return a.title.localeCompare(b.title);
    });

  const processingCount = reports.filter(r => r.status === 'processing').length;

  // ── Skeleton ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className={`h-8 rounded-lg w-1/3 ${isDarkMode ? 'bg-gray-800' : 'bg-[#DDD6CC]'}`} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-[#C8BEB4]'}`}>
                <div className={`h-4 rounded w-3/4 mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-[#DDD6CC]'}`} />
                <div className={`h-3 rounded w-1/2 mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-[#DDD6CC]'}`} />
                <div className="space-y-2">
                  <div className={`h-3 rounded ${isDarkMode ? 'bg-gray-800' : 'bg-[#DDD6CC]'}`} />
                  <div className={`h-3 rounded w-5/6 ${isDarkMode ? 'bg-gray-800' : 'bg-[#DDD6CC]'}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{STYLES}</style>
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 md:space-y-8">

        {/* ── Processing Banner ────────────────────────────────────── */}
        {processingCount > 0 && (
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border rpt-fade
            ${isDarkMode ? 'bg-[#8C6A4A]/10 border-[#8C6A4A]/30 text-[#8C6A4A]' : 'bg-[#8C6A4A]/10 border-[#8C6A4A]/30 text-[#6B5744]'}`}>
            <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
            <div>
              <span className="font-semibold text-sm">{processingCount} document{processingCount > 1 ? 's' : ''} being analyzed</span>
              <span className={`text-xs ml-2 ${isDarkMode ? 'text-[#8C6A4A]/70' : 'text-[#6B5744]/70'}`}>
                AI is working on the reports — they'll appear here when ready.
              </span>
            </div>
          </div>
        )}

        {/* ── Header ───────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-[#2E2A26]'}`}>Analysis Reports</h1>
            <p className={`mt-1 md:mt-2 text-sm md:text-base ${isDarkMode ? 'text-gray-500' : 'text-[#4B463F]'}`}>
              View and manage all document analysis reports
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleRefresh} disabled={isRefreshing}
              className={`p-2 rounded-lg transition-all disabled:opacity-50 ${isDarkMode ? 'hover:bg-[#FBF8F3]' : 'hover:bg-[#EDE7DB]'}`}>
              {isRefreshing ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
            </button>
            <div className={`hidden md:flex items-center rounded-lg p-1 ${isDarkMode ? 'bg-[#EDE7DB]' : 'bg-[#DDD6CC]'}`}>
              <button onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all duration-200 ${viewMode === 'grid' ? (isDarkMode ? 'bg-[#FBF8F3] text-[#2E2A26] shadow-sm' : 'bg-[#FBF8F3] text-[#2E2A26] shadow-sm') : (isDarkMode ? 'text-[#8C7B6B] hover:bg-[#FBF8F3]' : 'text-[#4B463F] hover:bg-[#EDE7DB]')}`}>
                <Grid className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all duration-200 ${viewMode === 'list' ? (isDarkMode ? 'bg-[#FBF8F3] text-[#2E2A26] shadow-sm' : 'bg-[#FBF8F3] text-[#2E2A26] shadow-sm') : (isDarkMode ? 'text-[#8C7B6B] hover:bg-[#FBF8F3]' : 'text-[#4B463F] hover:bg-[#EDE7DB]')}`}>
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Stat Cards (original ReportsList style) ───────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Reports', sub: 'All time', value: reports.length, icon: BarChart3, color: 'text-[#8C6A4A]', bg: 'bg-[#8C6A4A]/10', border: isDarkMode ? 'bg-[#1E1C1A] border-[#2B2E35]' : 'bg-white border-[#C8BEB4] shadow-md' },
            { label: 'High Risk', sub: 'Action needed', value: reports.filter(r => parseFloat(r.riskScore.toString()) >= 8).length, icon: AlertTriangle, color: 'text-[#8C6A4A]', bg: 'bg-[#8C6A4A]/10', border: isDarkMode ? 'bg-[#1E1C1A] border-[#2B2E35]' : 'bg-white border-[#C8BEB4] shadow-md' },
            { label: 'Completed', sub: 'Ready', value: reports.filter(r => r.status === 'complete').length, icon: CheckCircle, color: 'text-[#8C6A4A]', bg: 'bg-[#8C6A4A]/10', border: isDarkMode ? 'bg-[#1E1C1A] border-[#2B2E35]' : 'bg-white border-[#C8BEB4] shadow-md' },
            { label: 'Avg Risk', sub: 'Overall', value: reports.length > 0 ? (reports.reduce((a, r) => a + parseFloat(r.riskScore.toString()), 0) / reports.length).toFixed(1) : '0.0', icon: TrendingUp, color: 'text-[#8C6A4A]', bg: 'bg-[#8C6A4A]/10', border: isDarkMode ? 'bg-[#1E1C1A] border-[#2B2E35]' : 'bg-white border-[#C8BEB4] shadow-md' },
          ].map((s, i) => (
            <div key={i} className={`rpt-item flex items-center justify-between p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group ${s.border}`}
              style={{ animationDelay: `${i * 65}ms` }}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${s.bg} group-hover:scale-110 transition-transform duration-200`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <div>
                  <p className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-[#2E2A26]'}`}>{s.label}</p>
                  <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-gray-500' : 'text-[#4B463F]'}`}>{s.sub}</p>
                </div>
              </div>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-[#2E2A26]'}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── Search + Filters ─────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="relative w-full lg:w-auto">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-gray-500' : 'text-[#8C7B6B]'}`} />
            <input type="text" placeholder="Search reports..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className={`pl-10 pr-4 py-2 w-full lg:w-72 rounded-xl border transition-all focus:ring-2 focus:ring-[#8C6A4A]/20 focus:border-[#8C6A4A]
                ${isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-200 placeholder-gray-500' : 'bg-white border-[#C8BEB4] text-[#2E2A26] placeholder-[#8C7B6B]'}`} />
          </div>
          <div className="flex flex-wrap gap-3">
            <select value={sortBy} onChange={e => setSortBy(e.target.value as 'date' | 'risk' | 'title')}
              className={`px-3 py-2 rounded-lg border transition-colors ${isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-200' : 'bg-white border-[#C8BEB4] text-[#2E2A26]'}`}>
              <option value="date">Sort by Date</option>
              <option value="risk">Sort by Risk</option>
              <option value="title">Sort by Title</option>
            </select>
            <select value={filterBy} onChange={e => setFilterBy(e.target.value as 'all' | 'high-risk' | 'recent')}
              className={`px-3 py-2 rounded-lg border transition-colors ${isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-200' : 'bg-white border-[#C8BEB4] text-[#2E2A26]'}`}>
              <option value="all">All Reports</option>
              <option value="high-risk">High Risk Only</option>
              <option value="recent">Recent Reports</option>
            </select>
          </div>
        </div>

        {/* ── Empty state ───────────────────────────────────────────── */}
        {filteredReports.length === 0 ? (
          <div className="text-center py-12">
            <FileText className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-[#8C7B6B]'}`} />
            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-[#2E2A26]'}`}>No reports found</h3>
            <p className={isDarkMode ? 'text-gray-500' : 'text-[#4B463F]'}>
              {searchQuery ? 'Try adjusting your search or filters.' : 'Upload documents to generate reports.'}
            </p>
          </div>

        ) : viewMode === 'grid' ? (

          /* ── GRID (original big cards) ───────────────────────────── */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report, i) => {
              const risk = getRiskLevel(parseFloat(report.riskScore.toString()));
              return (
                <div key={report.filename} className={`rpt-item p-6 rounded-2xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group
                  ${isDarkMode ? 'bg-[#1E1C1A] border-[#2B2E35]' : `${report.status === 'processing' ? 'bg-amber-50 border-amber-200' : 'bg-white border-[#C8BEB4]'} shadow-lg`}`}
                  style={{ animationDelay: `${i * 55}ms` }}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-[#8C6A4A]/10' : 'bg-[#8C6A4A]/10'}`}>
                        <FileText className="w-5 h-5 text-[#8C6A4A]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className={`font-semibold text-lg mb-1 break-words ${isDarkMode ? 'text-gray-100' : 'text-[#2E2A26]'}`}>
                          {report.title}
                        </h3>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-[#EDE7DB] text-[#8C7B6B]' : 'bg-[#EDE7DB] text-[#4B463F]'}`}>
                            {report.documentType}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}>
                            {report.status === 'complete' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {report.status === 'warning' && <AlertTriangle className="w-3 h-3 mr-1" />}
                            {report.status === 'processing' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                            {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(report.filename)}
                      className={`p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:text-red-500 ${isDarkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-[#4B463F] hover:bg-[#EDE7DB]'
                        }`}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className={`text-center p-3 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-[#F6F1E8]'}`}>
                      <p className={`text-lg font-bold ${risk.color}`}>{report.riskScore}</p>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-[#4B463F]'}`}>Risk Score</p>
                    </div>
                    <div className={`text-center p-3 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-[#F6F1E8]'}`}>
                      <p className={`text-lg font-bold ${isDarkMode ? 'text-gray-100' : 'text-[#2E2A26]'}`}>{report.obligations}</p>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-[#4B463F]'}`}>Tasks</p>
                    </div>
                  </div>

                  <p className={`text-sm mb-4 line-clamp-2 ${isDarkMode ? 'text-gray-500' : 'text-[#4B463F]'}`}>{report.summary}</p>

                  <div className={`flex items-center justify-between pt-4 border-t ${isDarkMode ? 'border-gray-800' : 'border-[#EDE7DB]'}`}>
                    <div className={`flex items-center space-x-2 text-sm ${isDarkMode ? 'text-gray-500' : 'text-[#4B463F]'}`}>
                      <Calendar className="w-4 h-4" />
                      <span>{report.createdAt.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-[#4B463F] hover:bg-[#EDE7DB]'}`}>
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setClickingFilename(report.filename);
                          setTimeout(() => { setClickingFilename(null); onViewReport?.(report.filename); }, 280);
                        }}
                        disabled={!!clickingFilename}
                        className="flex items-center space-x-2 px-4 py-2 bg-[#8C6A4A] text-white rounded-lg hover:bg-[#6B5744] transition-all disabled:opacity-70">
                        {clickingFilename === report.filename
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <><Eye className="w-4 h-4" /><span className="font-medium">View Report</span></>}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        ) : (

          /* ── LIST (original row style) ───────────────────────────── */
          <div className="space-y-4">
            {filteredReports.map((report, i) => {
              const risk = getRiskLevel(parseFloat(report.riskScore.toString()));
              return (
                <React.Fragment key={report.filename}>
                  {/* Mobile: show card */}
                  <div className={`rpt-item md:hidden p-6 rounded-2xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group
                    ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-[#C8BEB4] shadow-lg'}`}
                    style={{ animationDelay: `${i * 45}ms` }}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-[#8C6A4A]/10' : 'bg-[#8C6A4A]/10'}`}>
                          <FileText className="w-4 h-4 text-[#8C6A4A]" />
                        </div>
                        <div>
                          <h3 className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-[#2E2A26]'}`}>{report.title}</h3>
                          <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-gray-500' : 'text-[#4B463F]'}`}>{report.createdAt.toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => { setClickingFilename(report.filename); setTimeout(() => { setClickingFilename(null); onViewReport?.(report.filename); }, 280); }}
                      disabled={!!clickingFilename}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#8C6A4A] text-white rounded-lg hover:bg-[#6B5744] transition-all disabled:opacity-70 mt-3">
                      {clickingFilename === report.filename ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Eye className="w-4 h-4" /><span className="font-medium">View Report</span></>}
                    </button>
                  </div>

                  {/* Desktop: show row */}
                  <div className={`rpt-item hidden md:block p-4 rounded-xl border transition-all duration-300 hover:scale-[1.005] hover:shadow-lg
                    ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-[#C8BEB4]'}`}
                    style={{ animationDelay: `${i * 45}ms` }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1 min-w-0">
                        <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-[#8C6A4A]/10' : 'bg-[#8C6A4A]/10'}`}>
                          <FileText className="w-4 h-4 text-[#8C6A4A]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3">
                            <h3 className={`font-semibold truncate ${isDarkMode ? 'text-gray-100' : 'text-[#2E2A26]'}`}>{report.title}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-[#EDE7DB] text-[#4B463F]'}`}>
                              {report.documentType}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${getStatusColor(report.status)}`}>
                              {report.status === 'processing' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                              {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                            </span>
                          </div>
                          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-500' : 'text-[#4B463F]'}`}>{report.createdAt.toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 flex-shrink-0">
                        <div className="text-right">
                          <p className={`font-semibold ${risk.color}`}>{report.riskScore}</p>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-[#4B463F]'}`}>Risk Score</p>
                        </div>
                        <button onClick={() => handleDelete(report.filename)}
                          className={`p-2 rounded-lg transition-colors hover:text-red-500 ${isDarkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-[#4B463F] hover:bg-[#EDE7DB]'
                            }`}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setClickingFilename(report.filename); setTimeout(() => { setClickingFilename(null); onViewReport?.(report.filename); }, 280); }}
                          disabled={!!clickingFilename}
                          className="flex items-center space-x-2 px-4 py-2 bg-[#8C6A4A] text-white rounded-lg hover:bg-[#6B5744] transition-all disabled:opacity-70">
                          {clickingFilename === report.filename ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Eye className="w-4 h-4" /><span className="font-medium">View</span></>}
                        </button>
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};