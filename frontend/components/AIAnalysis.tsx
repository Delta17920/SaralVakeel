import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthProvider';
import { useDialog } from './ConfirmDialog';
import { SVGProps } from 'react';
import {
  Brain, AlertTriangle, CheckCircle, Activity, Eye, Download, RefreshCw,
  ChevronRight, ArrowUp, ArrowDown, Minus, Search, FileText, AlertCircle, Trash2,
  Loader2, Clock
} from 'lucide-react';

interface AIAnalysisProps {
  isDarkMode: boolean;
  onViewReport?: (filename: string) => void;
}

interface AnalysisCard {
  id: string; title: string; filename: string;
  status: 'processing' | 'complete' | 'warning' | 'error';
  progress: number; findings: number; riskScore: number;
  completedAt?: Date; category: string; keyInsights: string[];
  obligationsCount: number; risksCount: number;
}

interface MetricCard {
  title: string; subtitle: string; value: string | number; change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ComponentType<SVGProps<SVGSVGElement>>;
  color: string; bgColor: string;
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
@keyframes growBar {
  from { width: 0%; }
  to   { width: var(--bar-w); }
}
.ai-item {
  animation: fadeSlideUp 0.45s cubic-bezier(0.22,1,0.36,1) both;
}
.ai-fade {
  animation: fadeIn 0.3s ease both;
}
.ai-bar {
  animation: growBar 1s cubic-bezier(0.22,1,0.36,1) 0.2s both;
}
`;

const AIAnalysis: React.FC<AIAnalysisProps> = ({ isDarkMode, onViewReport }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [clickingCardId, setClickingCardId] = useState<string | null>(null);
  const [analysisCards, setAnalysisCards] = useState<AnalysisCard[]>([]);
  const [fileCount, setFileCount] = useState(0);
  const [totalRiskScore, setTotalRiskScore] = useState(0);
  const [totalObligationsCount, setTotalObligationsCount] = useState(0);
  const [totalRisksCount, setTotalRisksCount] = useState(0);
  const processingCount = analysisCards.filter(c => c.status === 'processing').length;
  const { session } = useAuth();
  const dialog = useDialog();

  async function fetchData() {
    if (!session?.user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('documents').select('*').eq('user_id', session.user.id);
      if (error) throw error;

      interface DocRecord {
        id: string; created_at: string;
        metadata: {
          documentTitle?: string; riskScore?: number; 'risk score'?: number;
          risk_score?: number; obligations?: string[]; risks?: string[];
          findings?: number; category?: string; keyInsights?: string[];
          status?: string;
        } | null;
      }

      setFileCount((data as DocRecord[]).length);
      const cards: AnalysisCard[] = (data as DocRecord[]).map((doc, idx) => {
        const m = doc.metadata || {};
        const riskScore = m.riskScore ?? m['risk score'] ?? m.risk_score ?? 0;
        return {
          id: (idx + 1).toString(),
          title: m.documentTitle || doc.id.replace(/\.[^/.]+$/, ''),
          filename: doc.id,
          status: (m.status as AnalysisCard['status']) || 'complete',
          progress: 100, findings: m.findings ?? 0,
          riskScore, obligationsCount: m.obligations?.length ?? 0,
          risksCount: m.risks?.length ?? 0,
          completedAt: doc.created_at ? new Date(doc.created_at) : new Date(),
          category: m.category ?? 'Auto Analysis',
          keyInsights: m.keyInsights ?? []
        };
      });

      setAnalysisCards(cards);
      setTotalRiskScore(cards.reduce((s, c) => s + c.riskScore, 0));
      setTotalObligationsCount(cards.reduce((s, c) => s + c.obligationsCount, 0));
      setTotalRisksCount(cards.reduce((s, c) => s + c.risksCount, 0));
    } catch (err) {
      console.error('Failed to fetch analysis data', err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { if (session?.user) fetchData(); }, [session]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
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
      if (res.ok) { await fetchData(); }
      else { const e = await res.json(); await dialog.alert({ title: 'Delete Failed', message: e.detail || 'Unknown error', type: 'alert-error' }); }
    } catch { await dialog.alert({ title: 'Error', message: 'An error occurred while deleting.', type: 'alert-error' }); }
  };

  const metrics: MetricCard[] = [
    { title: 'Total Analyses', subtitle: 'Processed docs', value: fileCount, change: 12.5, trend: 'up', icon: Brain, color: 'text-[#8C6A4A]', bgColor: 'bg-[#8C6A4A]/10' },
    { title: 'Average Risk Score', subtitle: 'Overall health', value: fileCount > 0 ? (totalRiskScore / fileCount).toFixed(2) : '0', change: -8.2, trend: 'down', icon: AlertTriangle, color: 'text-[#8C6A4A]', bgColor: 'bg-[#8C6A4A]/10' },
    { title: 'Total Obligations', subtitle: 'Action items', value: totalObligationsCount, change: -15.3, trend: 'down', icon: FileText, color: 'text-[#8C6A4A]', bgColor: 'bg-[#8C6A4A]/10' },
    { title: 'Total Risks', subtitle: 'Identified issues', value: totalRisksCount, change: 2.1, trend: 'up', icon: AlertCircle, color: 'text-[#8C6A4A]', bgColor: 'bg-[#8C6A4A]/10' },
  ];

  const riskDistribution = (() => {
    const total = analysisCards.length || 1;
    const counts = { critical: 0, high: 0, medium: 0, low: 0 };
    analysisCards.forEach(c => {
      if (c.riskScore >= 8) counts.critical++;
      else if (c.riskScore >= 6) counts.high++;
      else if (c.riskScore >= 4) counts.medium++;
      else counts.low++;
    });
    return [
      { level: 'Critical', count: counts.critical, percentage: Math.round((counts.critical / total) * 100), color: 'bg-rose-500' },
      { level: 'High', count: counts.high, percentage: Math.round((counts.high / total) * 100), color: 'bg-amber-500' },
      { level: 'Medium', count: counts.medium, percentage: Math.round((counts.medium / total) * 100), color: 'bg-yellow-400' },
      { level: 'Low', count: counts.low, percentage: Math.round((counts.low / total) * 100), color: 'bg-emerald-500' },
    ];
  })();

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      complete: isDarkMode ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-emerald-600 bg-emerald-500/10 border-emerald-500/30',
      processing: 'text-[#8C6A4A] bg-[#8C6A4A]/10 border-[#8C6A4A]/30',
      warning: isDarkMode ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' : 'text-amber-600 bg-amber-500/10 border-amber-500/30',
      error: isDarkMode ? 'text-rose-400 bg-rose-500/10 border-rose-500/30' : 'text-rose-600 bg-rose-500/10 border-rose-500/30',
    };
    return colors[status] || (isDarkMode ? 'text-gray-400 bg-gray-500/10 border-gray-500/30' : 'text-gray-500 bg-gray-500/10 border-gray-500/30');
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 8) return 'text-rose-500';
    if (score >= 6) return 'text-amber-500';
    if (score >= 4) return 'text-yellow-500';
    return 'text-emerald-500';
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <ArrowUp className={`w-4 h-4 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-500'}`} />;
    if (trend === 'down') return <ArrowDown className={`w-4 h-4 text-rose-500`} />;
    return <Minus className={`w-4 h-4 ${isDarkMode ? 'text-gray-500' : 'text-[#8C7B6B]'}`} />;
  };

  const filteredAnalyses = analysisCards.filter(card => {
    const matchQ = card.title.toLowerCase().includes(searchQuery.toLowerCase()) || card.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchF = activeFilter === 'all' || card.status === activeFilter;
    return matchQ && matchF;
  });

  // ── Skeleton ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`p-6 rounded-2xl border animate-pulse ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-10 h-10 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />
                <div className="flex-1 space-y-2">
                  <div className={`h-3 rounded w-3/4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />
                  <div className={`h-3 rounded w-1/2 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />
                </div>
              </div>
              <div className={`h-8 rounded w-1/3 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`p-6 rounded-2xl border animate-pulse ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                <div className={`h-5 rounded w-1/2 mb-3 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />
                <div className="grid grid-cols-3 gap-3">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className={`h-16 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className={`h-64 rounded-2xl animate-pulse ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`} />
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{STYLES}</style>
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">

        {/* ── Processing Banner ────────────────────────────────────── */}
        {processingCount > 0 && (
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ai-fade
            ${isDarkMode ? 'bg-[#8C6A4A]/10 border-[#8C6A4A]/30 text-[#8C6A4A]' : 'bg-[#8C6A4A]/10 border-[#8C6A4A]/30 text-[#6B5744]'}`}>
            <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
            <p className="text-sm font-medium">
              <strong>{processingCount} document{processingCount > 1 ? 's' : ''}</strong> being analyzed —{' '}
              <span className="opacity-70">AI is extracting insights, this may take a couple of minutes.</span>
            </p>
          </div>
        )}

        {/* ── Header ───────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">AI Analysis Dashboard</h1>
            <p className={`mt-1.5 text-sm md:text-base ${isDarkMode ? 'text-gray-500' : 'text-[#8C7B6B]'}`}>
              Advanced legal document analysis powered by artificial intelligence
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select value={selectedTimeframe} onChange={e => setSelectedTimeframe(e.target.value)}
              className={`px-3 py-2 rounded-xl border text-sm transition-colors
                ${isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-200' : 'bg-white border-gray-200 text-[#4B463F]'}`}>
              <option value="1d">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <button onClick={handleRefresh} disabled={isRefreshing}
              className={`p-2.5 rounded-xl border transition-all disabled:opacity-50
                ${isDarkMode ? 'border-gray-700 bg-gray-900 text-gray-400 hover:text-gray-200' : 'border-gray-200 bg-white text-gray-500 hover:text-[#4B463F]'}`}>
              {isRefreshing ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ── Metrics Grid ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, i) => (
            <div key={i} className={`ai-item flex items-center justify-between p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group
              ${isDarkMode ? 'bg-[#1E1C1A] border-[#2B2E35]' : 'bg-white border-[#C8BEB4] shadow-md'}`}
              style={{ animationDelay: `${i * 70}ms` }}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${metric.bgColor} group-hover:scale-110 transition-transform duration-200`}>
                  <metric.icon className={`w-5 h-5 ${metric.color}`} />
                </div>
                <div>
                  <p className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-[#2E2A26]'}`}>{metric.title}</p>
                  <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-gray-500' : 'text-[#4B463F]'}`}>{metric.subtitle}</p>
                </div>
              </div>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-[#2E2A26]'}`}>{metric.value}</p>
            </div>
          ))}
        </div>

        {/* ── Search + Filters ─────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="relative w-full lg:w-72">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-gray-600' : 'text-[#8C7B6B]'}`} />
            <input type="text" placeholder="Search analyses..." value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={`pl-10 pr-4 py-2.5 w-full rounded-xl border text-sm outline-none transition focus:ring-2 focus:ring-[#8C6A4A]/20 focus:border-[#8C6A4A]
                ${isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-200 placeholder-gray-600' : 'bg-gray-50 border-gray-200 text-[#4B463F] placeholder-gray-400'}`} />
          </div>
          <div className="flex flex-wrap gap-2">
            {['all', 'complete', 'processing', 'warning'].map(filter => (
              <button key={filter} onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all
                  ${activeFilter === filter ? 'bg-[#8C6A4A] text-white shadow-md' : isDarkMode ? 'bg-gray-900 text-gray-400 hover:bg-gray-800 border border-gray-700' : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200'}`}>
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* ── Main content grid ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left: Analysis cards */}
          <div className="lg:col-span-2 space-y-5">
            <h2 className="text-xl font-semibold">Recent Analysis Results</h2>

            {filteredAnalyses.length === 0 ? (
              <div className={`text-center py-16 rounded-2xl border-2 border-dashed
                ${isDarkMode ? 'border-gray-800 text-gray-600' : 'border-gray-200 text-gray-400'}`}>
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-40" />
                <h3 className="text-lg font-semibold mb-2">{searchQuery ? 'No results found' : 'No analyses yet'}</h3>
                <p className="opacity-60">{searchQuery ? 'Try adjusting your search.' : 'Upload documents to begin analysis.'}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAnalyses.map((analysis, i) => (
                  <div key={analysis.id} className={`ai-item group relative rounded-2xl border transition-all duration-300 hover:scale-[1.01] hover:shadow-xl overflow-hidden
                    ${isDarkMode ? 'bg-gray-900 border-gray-800 hover:border-[#3B3E45]' : `${analysis.status === 'processing' ? 'bg-amber-50 border-amber-200 hover:border-amber-300' : 'bg-white border-[#C8BEB4] hover:border-[#B0A598]'} shadow-sm`}`}
                    style={{ animationDelay: `${i * 60}ms` }}>

                    {/* Left risk accent bar */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${analysis.riskScore >= 8 ? 'bg-rose-500' :
                      analysis.riskScore >= 6 ? 'bg-amber-500' :
                        analysis.riskScore >= 4 ? 'bg-yellow-400' : 'bg-emerald-500'}`}
                    />

                    <div className="pl-6 pr-5 py-5">
                      {/* Top row: title + status + actions */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base mb-2">{analysis.title}</h3>
                          <div className="flex items-center flex-wrap gap-2">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(analysis.status)}`}>
                              {analysis.status === 'processing' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                              {analysis.status === 'complete' && <CheckCircle className="w-3 h-3 mr-1" />}
                              {analysis.status === 'warning' && <AlertTriangle className="w-3 h-3 mr-1" />}
                              {analysis.status.charAt(0).toUpperCase() + analysis.status.slice(1)}
                            </span>
                            <span className={`text-xs px-2.5 py-1 rounded-full ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                              {analysis.category}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
                          <button className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}><Eye className="w-4 h-4" /></button>
                          <button className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}><Download className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(analysis.filename)}
                            className={`p-2 rounded-xl transition-colors hover:text-rose-500 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Progress bar for processing */}
                      {analysis.status === 'processing' && (
                        <div className="mb-4">
                          <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                            <div className="h-full bg-[#8C6A4A] rounded-full w-3/5 animate-pulse" />
                          </div>
                        </div>
                      )}

                      {/* Stats row */}
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className={`text-center p-3 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-[#F6F1E8]'}`}>
                          <p className={`text-xl font-bold ${getRiskScoreColor(analysis.riskScore)}`}>{analysis.riskScore}</p>
                          <p className={`text-[10px] uppercase tracking-wider font-semibold mt-0.5 ${isDarkMode ? 'text-gray-500' : 'text-[#8C7B6B]'}`}>Risk Score</p>
                        </div>
                        <div className={`text-center p-3 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-[#F6F1E8]'}`}>
                          <p className="text-xl font-bold">{analysis.obligationsCount}</p>
                          <p className={`text-[10px] uppercase tracking-wider font-semibold mt-0.5 ${isDarkMode ? 'text-gray-500' : 'text-[#8C7B6B]'}`}>Obligations</p>
                        </div>
                        <div className={`text-center p-3 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-[#F6F1E8]'}`}>
                          <p className="text-xl font-bold">{analysis.risksCount}</p>
                          <p className={`text-[10px] uppercase tracking-wider font-semibold mt-0.5 ${isDarkMode ? 'text-gray-500' : 'text-[#8C7B6B]'}`}>Risks</p>
                        </div>
                      </div>

                      {/* CTA */}
                      <div className={`pt-3 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                        <button
                          onClick={() => {
                            setClickingCardId(analysis.id);
                            setTimeout(() => { setClickingCardId(null); onViewReport?.(analysis.filename); }, 280);
                          }}
                          disabled={!!clickingCardId}
                          className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-[#8C6A4A] text-white text-sm font-semibold rounded-xl hover:bg-[#6B5744] transition-all duration-200 disabled:opacity-60">
                          {clickingCardId === analysis.id
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <><span>View Detailed Report</span><ChevronRight className="w-4 h-4" /></>}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            {/* Risk Distribution */}
            <div className={`ai-item p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-[#C8BEB4] shadow-lg'}`}
              style={{ animationDelay: '200ms' }}>
              <h3 className="font-semibold text-lg mb-6">Risk Distribution</h3>
              <div className="space-y-5">
                {riskDistribution.map((risk, i) => (
                  <div key={risk.level} className={`ai-item`} style={{ animationDelay: `${280 + i * 80}ms` }}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">{risk.level} Risk</span>
                      <span className="text-sm font-bold">{risk.count}</span>
                    </div>
                    <div className={`w-full h-2.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                      <div
                        className={`h-full ${risk.color} rounded-full ai-bar`}
                        style={{ '--bar-w': `${risk.percentage}%`, width: `${risk.percentage}%` } as React.CSSProperties}
                      />
                    </div>
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-600' : 'text-[#8C7B6B]'}`}>
                      {risk.percentage}% of total · {risk.count} document{risk.count !== 1 ? 's' : ''}
                    </p>
                  </div>
                ))}
              </div>

              <div className={`mt-6 pt-4 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                <button className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-all
                  ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-[#4B463F]'}`}>
                  Generate Risk Report
                </button>
              </div>
            </div>

            {/* Processing Queue */}
            <div className={`ai-item p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-[#C8BEB4] shadow-lg'}`}
              style={{ animationDelay: '300ms' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Queue</h3>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#8C6A4A] animate-pulse" />
                  <span className="text-sm text-[#8C6A4A] font-semibold">{processingCount} Active</span>
                </div>
              </div>
              <div>
                {processingCount > 0 ? (
                  <div className="space-y-3">
                    {analysisCards.filter(c => c.status === 'processing').map(c => (
                      <div key={c.id} className={`flex items-center gap-3 p-3 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                        <Loader2 className="w-4 h-4 text-[#8C6A4A] animate-spin flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{c.title}</p>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-600' : 'text-[#8C7B6B]'}`}>Analyzing…</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`text-center py-6 ${isDarkMode ? 'text-gray-600' : 'text-[#8C7B6B]'}`}>
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">All documents processed</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIAnalysis;