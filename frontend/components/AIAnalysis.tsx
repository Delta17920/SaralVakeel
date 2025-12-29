import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { SVGProps } from 'react';
import {
  Clock, Brain, AlertTriangle, CheckCircle, Activity, Eye, Download, RefreshCw,
  ChevronRight, ArrowUp, ArrowDown, Minus, Search, FileText, AlertCircle
} from 'lucide-react';

interface AIAnalysisProps {
  isDarkMode: boolean;
  onViewReport?: (filename: string) => void;
}

interface AnalysisCard {
  id: string; title: string; status: 'processing' | 'complete' | 'warning' | 'error';
  progress: number; findings: number; riskScore: number; completedAt?: Date;
  category: string; keyInsights: string[]; obligationsCount: number; risksCount: number;
}

interface MetricCard {
  title: string; value: string | number; change: number; trend: 'up' | 'down' | 'stable';
  icon: React.ComponentType<SVGProps<SVGSVGElement>>; color: string; bgColor: string;
}

const AIAnalysis: React.FC<AIAnalysisProps> = ({ isDarkMode, onViewReport }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [analysisCards, setAnalysisCards] = useState<AnalysisCard[]>([]);
  const [fileCount, setFileCount] = useState<number>(0);
  const [totalRiskScore, setTotalRiskScore] = useState<number>(0);
  const [totalObligationsCount, setTotalObligationsCount] = useState<number>(0);
  const [totalRisksCount, setTotalRisksCount] = useState<number>(0);

  useEffect(() => {
    async function fetchJsonFiles() {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('*');

        if (error) throw error;

        interface DocumentRecord {
          id: string;
          created_at: string;
          metadata: {
            riskScore?: number;
            'risk score'?: number;
            risk_score?: number;
            obligations?: string[];
            risks?: string[];
            findings?: number;
            category?: string;
            keyInsights?: string[];
          } | null;
        }

        const filenames: string[] = (data as DocumentRecord[]).map((d) => d.id);
        setFileCount(filenames.length);

        const cards: AnalysisCard[] = (data as DocumentRecord[]).map((doc, index: number) => {
          const fileData = doc.metadata || {};
          const riskScore = fileData.riskScore ?? fileData['risk score'] ?? fileData.risk_score ?? 0;
          const obligationsCount = fileData.obligations?.length ?? 0;
          const risksCount = fileData.risks?.length ?? 0;

          return {
            id: (index + 1).toString(), title: doc.id.replace(/\.[^/.]+$/, ''), status: 'complete',
            progress: 100, findings: fileData.findings ?? 0,
            riskScore, obligationsCount, risksCount,
            completedAt: doc.created_at ? new Date(doc.created_at) : new Date(),
            category: fileData.category ?? 'Auto Analysis',
            keyInsights: fileData.keyInsights ?? ['Insight 1', 'Insight 2']
          } as AnalysisCard;
        });

        const filteredCards = cards.filter(Boolean) as AnalysisCard[];
        setAnalysisCards(filteredCards);

        const totalRisk = filteredCards.reduce((sum, card) => sum + (card?.riskScore ?? 0), 0);
        const totalObligations = filteredCards.reduce((sum, card) => sum + (card?.obligationsCount ?? 0), 0);
        const totalRisks = filteredCards.reduce((sum, card) => sum + (card?.risksCount ?? 0), 0);

        setTotalRiskScore(Number(totalRisk.toFixed(2)));
        setTotalObligationsCount(totalObligations);
        setTotalRisksCount(totalRisks);
      } catch (err) {
        console.error('Failed to fetch analysis data', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchJsonFiles();
  }, []);

  const metrics: MetricCard[] = [
    {
      title: 'Total Analyses', value: fileCount, change: 12.5, trend: 'up', icon: Brain,
      color: 'text-[#1ABC9C]', bgColor: 'bg-[#1ABC9C]/10'
    },
    {
      title: 'Average Risk Score', value: (totalRiskScore / fileCount).toFixed(2), change: -8.2, trend: 'down', icon: AlertTriangle,
      color: isDarkMode ? 'text-[#D4AC0D]' : 'text-[#F1C40F]', bgColor: isDarkMode ? 'bg-[#D4AC0D]/10' : 'bg-[#F1C40F]/10'
    },
    {
      title: 'Total Obligations', value: totalObligationsCount, change: -15.3, trend: 'down', icon: FileText,
      color: isDarkMode ? 'text-[#27AE60]' : 'text-[#2ECC71]', bgColor: isDarkMode ? 'bg-[#27AE60]/10' : 'bg-[#2ECC71]/10'
    },
    {
      title: 'Total Risks', value: totalRisksCount, change: 2.1, trend: 'up', icon: AlertCircle,
      color: 'text-[#1ABC9C]', bgColor: 'bg-[#1ABC9C]/10'
    }
  ];

  // Dynamic Risk Distribution
  const calculateDistribution = () => {
    const counts = { critical: 0, high: 0, medium: 0, low: 0 };
    analysisCards.forEach(c => {
      if (c.riskScore >= 8) counts.critical++;
      else if (c.riskScore >= 6) counts.high++;
      else if (c.riskScore >= 4) counts.medium++;
      else counts.low++;
    });
    const total = analysisCards.length || 1;

    return [
      { level: 'Critical', count: counts.critical, percentage: Math.round((counts.critical / total) * 100), color: isDarkMode ? 'bg-[#C0392B]' : 'bg-[#E74C3C]' },
      { level: 'High', count: counts.high, percentage: Math.round((counts.high / total) * 100), color: isDarkMode ? 'bg-[#D4AC0D]' : 'bg-[#F1C40F]' },
      { level: 'Medium', count: counts.medium, percentage: Math.round((counts.medium / total) * 100), color: isDarkMode ? 'bg-[#D4AC0D]' : 'bg-[#F1C40F]' },
      { level: 'Low', count: counts.low, percentage: Math.round((counts.low / total) * 100), color: isDarkMode ? 'bg-[#27AE60]' : 'bg-[#2ECC71]' }
    ];
  };

  const riskDistribution = calculateDistribution();

  const getStatusColor = (status: string) => {
    const colors = {
      complete: isDarkMode ? 'text-[#27AE60] bg-[#27AE60]/10 border-[#27AE60]/30' : 'text-[#2ECC71] bg-[#2ECC71]/10 border-[#2ECC71]/30',
      processing: 'text-[#1ABC9C] bg-[#1ABC9C]/10 border-[#1ABC9C]/30',
      warning: isDarkMode ? 'text-[#D4AC0D] bg-[#D4AC0D]/10 border-[#D4AC0D]/30' : 'text-[#F1C40F] bg-[#F1C40F]/10 border-[#F1C40F]/30',
      error: isDarkMode ? 'text-[#C0392B] bg-[#C0392B]/10 border-[#C0392B]/30' : 'text-[#E74C3C] bg-[#E74C3C]/10 border-[#E74C3C]/30'
    };
    return colors[status] || (isDarkMode ? 'text-[#7A8291] bg-[#7A8291]/10 border-[#7A8291]/30' : 'text-[#7D8693] bg-[#7D8693]/10 border-[#7D8693]/30');
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 8) return isDarkMode ? 'text-[#C0392B]' : 'text-[#E74C3C]';
    if (score >= 6) return isDarkMode ? 'text-[#D4AC0D]' : 'text-[#F1C40F]';
    if (score >= 4) return isDarkMode ? 'text-[#D4AC0D]' : 'text-[#F1C40F]';
    return isDarkMode ? 'text-[#27AE60]' : 'text-[#2ECC71]';
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <ArrowUp className={`w-4 h-4 ${isDarkMode ? 'text-[#27AE60]' : 'text-[#2ECC71]'}`} />;
    if (trend === 'down') return <ArrowDown className={`w-4 h-4 ${isDarkMode ? 'text-[#C0392B]' : 'text-[#E74C3C]'}`} />;
    return <Minus className={`w-4 h-4 ${isDarkMode ? 'text-[#7A8291]' : 'text-[#7D8693]'}`} />;
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  const filteredAnalyses = analysisCards.filter(card => {
    const matchesSearch = card.title.toLowerCase().includes(searchQuery.toLowerCase()) || card.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || card.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-8">
        <div className="animate-pulse">
          <div className={`h-8 rounded-lg w-1/3 mb-2 ${isDarkMode ? 'bg-[#161B22]' : 'bg-[#E3E7EE]'}`}></div>
          <div className={`h-4 rounded-lg w-1/2 ${isDarkMode ? 'bg-[#161B22]' : 'bg-[#E3E7EE]'}`}></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`p-6 rounded-2xl border animate-pulse ${isDarkMode ? 'bg-[#161B22] border-[#262C35]' : 'bg-[#FFFFFF] border-[#E3E7EE]'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${isDarkMode ? 'bg-[#0D1117]' : 'bg-[#F7F9FC]'}`}></div>
                <div className={`w-8 h-4 rounded ${isDarkMode ? 'bg-[#0D1117]' : 'bg-[#F7F9FC]'}`}></div>
              </div>
              <div className={`h-8 rounded mb-2 ${isDarkMode ? 'bg-[#0D1117]' : 'bg-[#F7F9FC]'}`}></div>
              <div className={`h-4 rounded w-3/4 ${isDarkMode ? 'bg-[#0D1117]' : 'bg-[#F7F9FC]'}`}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-[#E8EDF5]' : 'text-[#1C2733]'}`}>AI Analysis Dashboard</h1>
          <p className={`mt-2 text-sm md:text-base ${isDarkMode ? 'text-[#AEB6C3]' : 'text-[#4A5568]'}`}>Advanced legal document analysis powered by artificial intelligence</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
          <select value={selectedTimeframe} onChange={(e) => setSelectedTimeframe(e.target.value)}
            className={`px-3 py-2 rounded-lg border transition-colors ${isDarkMode ? 'bg-[#161B22] border-[#262C35] text-[#E8EDF5]' : 'bg-[#FFFFFF] border-[#E3E7EE] text-[#1C2733]'}`}>
            <option value="1d">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button onClick={handleRefresh} className={`p-2 rounded-lg transition-all duration-200 ${isDarkMode ? 'hover:bg-[#161B22]' : 'hover:bg-[#F7F9FC]'} ${isRefreshing ? 'animate-spin' : ''}`}>
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div key={index} className={`p-6 rounded-2xl border transition-all duration-300 hover:scale-105 group ${isDarkMode ? 'bg-[#161B22] border-[#262C35]' : 'bg-[#FFFFFF] border-[#E3E7EE] shadow-lg'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${metric.bgColor} group-hover:scale-110 transition-transform duration-200`}>
                <metric.icon className={`w-6 h-6 ${metric.color}`} />
              </div>
              <div className="flex items-center space-x-1">
                {getTrendIcon(metric.trend)}
                <span className={`text-sm font-medium ${metric.trend === 'up' ? (isDarkMode ? 'text-[#27AE60]' : 'text-[#2ECC71]') : metric.trend === 'down' ? (isDarkMode ? 'text-[#C0392B]' : 'text-[#E74C3C]') : (isDarkMode ? 'text-[#7A8291]' : 'text-[#7D8693]')}`}>
                  {Math.abs(metric.change)}%
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold">{metric.value}</p>
              <p className={`text-sm ${isDarkMode ? 'text-[#AEB6C3]' : 'text-[#4A5568]'}`}>{metric.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="relative w-full lg:w-auto">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-[#7A8291]' : 'text-[#7D8693]'}`} />
          <input type="text" placeholder="Search analyses..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className={`pl-10 pr-4 py-2 w-full lg:w-72 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-[#1ABC9C]/20 focus:border-[#1ABC9C] ${isDarkMode ? 'bg-[#161B22] border-[#262C35] text-[#E8EDF5] placeholder-[#7A8291]' : 'bg-[#F7F9FC] border-[#E3E7EE] text-[#1C2733] placeholder-[#7D8693]'}`} />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {['all', 'complete', 'processing', 'warning'].map((filter) => (
            <button key={filter} onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex-grow sm:flex-grow-0 ${activeFilter === filter ? 'bg-[#1ABC9C] text-white shadow-lg' : isDarkMode ? 'bg-[#161B22] text-[#AEB6C3] hover:bg-[#0F1A2E]' : 'bg-[#F7F9FC] text-[#4A5568] hover:bg-[#E3E7EE]'}`}>
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-semibold">Recent Analysis Results</h2>
          <div className="space-y-4">
            {filteredAnalyses.map((analysis) => (
              <div key={analysis.id} className={`p-6 rounded-2xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group ${isDarkMode ? 'bg-[#161B22] border-[#262C35]' : 'bg-[#FFFFFF] border-[#E3E7EE] shadow-lg'}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-2">{analysis.title.slice(0, -7)}</h3>
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(analysis.status)}`}>
                        {analysis.status === 'processing' && <Clock className="w-3 h-3 mr-1" />}
                        {analysis.status === 'complete' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {analysis.status === 'warning' && <AlertTriangle className="w-3 h-3 mr-1" />}
                        {analysis.status.charAt(0).toUpperCase() + analysis.status.slice(1)}
                      </span>
                      <span className={`text-sm px-2 py-1 rounded-full ${isDarkMode ? 'bg-[#0D1117] text-[#AEB6C3]' : 'bg-[#F7F9FC] text-[#4A5568]'}`}>{analysis.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-[#0D1117]' : 'hover:bg-[#F7F9FC]'}`}><Eye className="w-4 h-4" /></button>
                    <button className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-[#0D1117]' : 'hover:bg-[#F7F9FC]'}`}><Download className="w-4 h-4" /></button>
                  </div>
                </div>
                {analysis.status === 'processing' && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Processing Progress</span>
                      <span className="text-sm">{analysis.progress}%</span>
                    </div>
                    <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-[#0D1117]' : 'bg-[#E3E7EE]'}`}>
                      <div className="h-full bg-[#1ABC9C] rounded-full transition-all duration-300" style={{ width: `${analysis.progress}%` }} />
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className={`text-center p-3 rounded-xl ${isDarkMode ? 'bg-[#0D1117]' : 'bg-[#F7F9FC]'}`}>
                    <p className={`text-2xl font-bold ${getRiskScoreColor(analysis.riskScore)}`}>{analysis.riskScore}</p>
                    <p className={`text-xs ${isDarkMode ? 'text-[#AEB6C3]' : 'text-[#4A5568]'}`}>Risk Score</p>
                  </div>
                  <div className={`text-center p-3 rounded-xl ${isDarkMode ? 'bg-[#0D1117]' : 'bg-[#F7F9FC]'}`}>
                    <p className={`text-2xl font-bold ${getRiskScoreColor(analysis.obligationsCount)}`}>{analysis.obligationsCount}</p>
                    <p className={`text-xs ${isDarkMode ? 'text-[#AEB6C3]' : 'text-[#4A5568]'}`}>Obligations</p>
                  </div>
                  <div className={`text-center p-3 rounded-xl ${isDarkMode ? 'bg-[#0D1117]' : 'bg-[#F7F9FC]'}`}>
                    <p className={`text-2xl font-bold ${getRiskScoreColor(analysis.risksCount)}`}>{analysis.risksCount}</p>
                    <p className={`text-xs ${isDarkMode ? 'text-[#AEB6C3]' : 'text-[#4A5568]'}`}>Risks</p>
                  </div>
                </div>
                <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-[#262C35]' : 'border-[#E3E7EE]'}`}>
                  <button onClick={() => onViewReport?.(analysis.title + '.json')} className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-[#1ABC9C] text-white rounded-lg hover:bg-[#17A085] transition-all duration-200">
                    <span className="font-medium">View Detailed Report</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#161B22] border-[#262C35]' : 'bg-[#FFFFFF] border-[#E3E7EE] shadow-lg'}`}>
            <h3 className="font-semibold text-lg mb-6">Risk Distribution</h3>
            <div className="space-y-4">
              {riskDistribution.map((risk) => (
                <div key={risk.level} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{risk.level} Risk</span>
                    <span className="text-sm font-semibold">{risk.count}</span>
                  </div>
                  <div className={`w-full h-3 rounded-full overflow-hidden ${isDarkMode ? 'bg-[#0D1117]' : 'bg-[#E3E7EE]'}`}>
                    <div className={`h-full ${risk.color} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${risk.percentage}%` }} />
                  </div>
                  <div className={`flex justify-between text-xs ${isDarkMode ? 'text-[#7A8291]' : 'text-[#7D8693]'}`}>
                    <span>{risk.percentage}% of total</span>
                    <span>{risk.count} issues</span>
                  </div>
                </div>
              ))}
            </div>
            <div className={`mt-6 pt-4 border-t ${isDarkMode ? 'border-[#262C35]' : 'border-[#E3E7EE]'}`}>
              <button className="w-full py-2 px-4 bg-[#1A2B4C] text-white rounded-lg hover:bg-[#0F1A2E] transition-all duration-200">Generate Risk Report</button>
            </div>
          </div>

          <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#161B22] border-[#262C35]' : 'bg-[#FFFFFF] border-[#E3E7EE] shadow-lg'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Processing Queue</h3>
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-[#1ABC9C] animate-pulse" />
                <span className="text-sm text-[#1ABC9C] font-medium">3 Active</span>
              </div>
            </div>
            <div className="space-y-3">
              {/* Dynamic Queue Placeholder - Future: Connect to Websocket/Real Status */}
              <div className={`text-center py-6 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">All documents processed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAnalysis;