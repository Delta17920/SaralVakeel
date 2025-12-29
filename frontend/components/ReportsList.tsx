import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  FileText,
  Eye,
  Download,
  Search,
  Calendar,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  RefreshCw,
  Grid,
  List,
  MoreHorizontal,
  TrendingUp
} from 'lucide-react';

interface ReportsListProps {
  isDarkMode?: boolean;
  onViewReport?: (filename: string) => void;
}

interface ReportItem {
  filename: string;
  title: string;
  documentType: string;
  createdAt: Date;
  riskScore: number;
  findings: number;
  status: 'complete' | 'processing' | 'warning' | 'error';
  summary: string;
  obligations: number;
  parties: number;
}

export const ReportsList: React.FC<ReportsListProps> = ({ isDarkMode = false, onViewReport }) => {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'risk' | 'title'>('date');
  const [filterBy, setFilterBy] = useState<'all' | 'high-risk' | 'recent'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
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
          documentTitle?: string;
          documentType?: string;
          // ...
          riskScore?: number;
          'risk score'?: number;
          risk_score?: number;
          findings?: number;
          summary?: string;
          obligations?: string[];
          parties?: { name: string; type: string; role?: string }[];
        } | null;
      }

      const reportsData: ReportItem[] = (data as DocumentRecord[]).map((doc) => {
        const metadata = doc.metadata || {};
        return {
          filename: doc.id,
          title: metadata.documentTitle || doc.id.replace(/\.[^/.]+$/, ''),
          documentType: metadata.documentType || 'Document',
          createdAt: doc.created_at ? new Date(doc.created_at) : new Date(),
          riskScore: metadata.riskScore || metadata['risk score'] || metadata.risk_score || 0,
          findings: metadata.findings || 0,
          status: 'complete',
          summary: metadata.summary || 'Analysis completed successfully.',
          obligations: metadata.obligations?.length || 0,
          parties: metadata.parties?.length || 0
        };
      });

      setReports(reportsData);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchReports();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getRiskLevel = (score: number) => {
    if (score >= 8) return {
      level: 'High',
      color: isDarkMode ? 'text-[#C0392B]' : 'text-[#E74C3C]',
      bg: isDarkMode ? 'bg-[#C0392B]/10' : 'bg-[#E74C3C]/10'
    };
    if (score >= 6) return {
      level: 'Medium',
      color: isDarkMode ? 'text-[#D4AC0D]' : 'text-[#F1C40F]',
      bg: isDarkMode ? 'bg-[#D4AC0D]/10' : 'bg-[#F1C40F]/10'
    };
    if (score >= 4) return {
      level: 'Low-Med',
      color: isDarkMode ? 'text-[#D4AC0D]' : 'text-[#F1C40F]',
      bg: isDarkMode ? 'bg-[#D4AC0D]/10' : 'bg-[#F1C40F]/10'
    };
    return {
      level: 'Low',
      color: isDarkMode ? 'text-[#27AE60]' : 'text-[#2ECC71]',
      bg: isDarkMode ? 'bg-[#27AE60]/10' : 'bg-[#2ECC71]/10'
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return isDarkMode
          ? 'text-[#27AE60] bg-[#27AE60]/10 border-[#27AE60]/30'
          : 'text-[#2ECC71] bg-[#2ECC71]/10 border-[#2ECC71]/30';
      case 'processing':
        return 'text-[#1ABC9C] bg-[#1ABC9C]/10 border-[#1ABC9C]/30';
      case 'warning':
        return isDarkMode
          ? 'text-[#D4AC0D] bg-[#D4AC0D]/10 border-[#D4AC0D]/30'
          : 'text-[#F1C40F] bg-[#F1C40F]/10 border-[#F1C40F]/30';
      case 'error':
        return isDarkMode
          ? 'text-[#C0392B] bg-[#C0392B]/10 border-[#C0392B]/30'
          : 'text-[#E74C3C] bg-[#E74C3C]/10 border-[#E74C3C]/30';
      default:
        return isDarkMode
          ? 'text-[#7A8291] bg-[#7A8291]/10 border-[#7A8291]/30'
          : 'text-[#7D8693] bg-[#7D8693]/10 border-[#7D8693]/30';
    }
  };

  const filteredReports = reports
    .filter(report => {
      const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.documentType.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesFilter = true;
      if (filterBy === 'high-risk') {
        matchesFilter = parseFloat(report.riskScore.toString()) >= 6;
      } else if (filterBy === 'recent') {
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        matchesFilter = report.createdAt >= oneDayAgo;
      }

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'risk':
          return parseFloat(b.riskScore.toString()) - parseFloat(a.riskScore.toString());
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const ReportCard = ({ report, onViewReport }: { report: ReportItem, onViewReport?: (filename: string) => void }) => {
    const riskLevel = getRiskLevel(parseFloat(report.riskScore.toString()));

    return (
      <div className={`p-6 rounded-2xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group ${isDarkMode ? 'bg-[#161B22] border-[#262C35]' : 'bg-[#FFFFFF] border-[#E3E7EE] shadow-lg'}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-[#1ABC9C]/10' : 'bg-[#1ABC9C]/10'}`}>
              <FileText className="w-5 h-5 text-[#1ABC9C]" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className={`font-semibold text-lg mb-1 break-words ${isDarkMode ? 'text-[#E8EDF5]' : 'text-[#1C2733]'}`}>
                {report.title}
              </h3>
              <div className="flex items-center space-x-2 mb-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-[#0D1117] text-[#AEB6C3]' : 'bg-[#F7F9FC] text-[#4A5568]'}`}>
                  {report.documentType}
                </span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}>
                  {report.status === 'complete' && <CheckCircle className="w-3 h-3 mr-1" />}
                  {report.status === 'warning' && <AlertTriangle className="w-3 h-3 mr-1" />}
                  {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
          <button className={`p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 ${isDarkMode ? 'hover:bg-[#0D1117]' : 'hover:bg-[#F7F9FC]'}`}>
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className={`text-center p-3 rounded-xl ${isDarkMode ? 'bg-[#0D1117]' : 'bg-[#F7F9FC]'}`}>
            <p className={`text-lg font-bold ${riskLevel.color}`}>{report.riskScore}</p>
            <p className={`text-xs ${isDarkMode ? 'text-[#AEB6C3]' : 'text-[#4A5568]'}`}>Risk Score</p>
          </div>
          <div className={`text-center p-3 rounded-xl ${isDarkMode ? 'bg-[#0D1117]' : 'bg-[#F7F9FC]'}`}>
            <p className={`text-lg font-bold ${isDarkMode ? 'text-[#E8EDF5]' : 'text-[#1C2733]'}`}>{report.obligations}</p>
            <p className={`text-xs ${isDarkMode ? 'text-[#AEB6C3]' : 'text-[#4A5568]'}`}>Tasks</p>
          </div>
        </div>
        <p className={`text-sm mb-4 line-clamp-2 ${isDarkMode ? 'text-[#AEB6C3]' : 'text-[#4A5568]'}`}>
          {report.summary}
        </p>
        <div className={`flex items-center justify-between pt-4 border-t ${isDarkMode ? 'border-[#262C35]' : 'border-[#E3E7EE]'}`}>
          <div className={`flex items-center space-x-2 text-sm ${isDarkMode ? 'text-[#AEB6C3]' : 'text-[#4A5568]'}`}>
            <Calendar className="w-4 h-4" />
            <span>{report.createdAt.toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-[#0D1117]' : 'hover:bg-[#F7F9FC]'}`}>
              <Download className="w-4 h-4" />
            </button>
            <button onClick={() => onViewReport?.(report.filename)} className="flex items-center space-x-2 px-4 py-2 bg-[#1ABC9C] text-white rounded-lg hover:bg-[#17A085] transition-all duration-200">
              <Eye className="w-4 h-4" />
              <span className="font-medium">View Report</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ReportRow = ({ report }: { report: ReportItem }) => {
    const riskLevel = getRiskLevel(parseFloat(report.riskScore.toString()));

    return (
      <div className={`p-4 rounded-xl border transition-all duration-200 hover:scale-[1.01] hover:shadow-lg ${isDarkMode ? 'bg-[#161B22] border-[#262C35]' : 'bg-[#FFFFFF] border-[#E3E7EE]'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-[#1ABC9C]/10' : 'bg-[#1ABC9C]/10'}`}>
              <FileText className="w-4 h-4 text-[#1ABC9C]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3">
                <h3 className={`font-semibold truncate ${isDarkMode ? 'text-[#E8EDF5]' : 'text-[#1C2733]'}`}>{report.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-[#0D1117] text-[#AEB6C3]' : 'bg-[#F7F9FC] text-[#4A5568]'}`}>
                  {report.documentType}
                </span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}>
                  {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                </span>
              </div>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-[#AEB6C3]' : 'text-[#4A5568]'}`}>
                {report.createdAt.toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className={`font-semibold ${riskLevel.color}`}>{report.riskScore}</p>
              <p className={`text-xs ${isDarkMode ? 'text-[#AEB6C3]' : 'text-[#4A5568]'}`}>Risk Score</p>
            </div>
            <button onClick={() => onViewReport?.(report.filename)} className="flex items-center space-x-2 px-4 py-2 bg-[#1ABC9C] text-white rounded-lg hover:bg-[#17A085] transition-all duration-200">
              <Eye className="w-4 h-4" />
              <span className="font-medium">View</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className={`h-8 rounded-lg w-1/3 ${isDarkMode ? 'bg-[#161B22]' : 'bg-[#E3E7EE]'}`}></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#161B22] border-[#262C35]' : 'bg-[#FFFFFF] border-[#E3E7EE]'}`}>
                <div className={`h-4 rounded w-3/4 mb-4 ${isDarkMode ? 'bg-[#0D1117]' : 'bg-[#E3E7EE]'}`}></div>
                <div className={`h-3 rounded w-1/2 mb-6 ${isDarkMode ? 'bg-[#0D1117]' : 'bg-[#E3E7EE]'}`}></div>
                <div className="space-y-2">
                  <div className={`h-3 rounded ${isDarkMode ? 'bg-[#0D1117]' : 'bg-[#E3E7EE]'}`}></div>
                  <div className={`h-3 rounded w-5/6 ${isDarkMode ? 'bg-[#0D1117]' : 'bg-[#E3E7EE]'}`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 md:space-y-8">
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-[#E8EDF5]' : 'text-[#1C2733]'}`}>Analysis Reports</h1>
          <p className={`mt-1 md:mt-2 text-sm md:text-base ${isDarkMode ? 'text-[#AEB6C3]' : 'text-[#4A5568]'}`}>View and manage all document analysis reports</p>
        </div>
        <div className="flex items-center gap-3 self-start md:self-auto">
          <button onClick={handleRefresh} disabled={isRefreshing} className={`p-2 rounded-lg transition-all duration-200 ${isDarkMode ? 'hover:bg-[#161B22]' : 'hover:bg-[#F7F9FC]'} ${isRefreshing ? 'animate-spin' : ''}`}>
            <RefreshCw className="w-5 h-5" />
          </button>
          {/* View Mode Toggle - Hidden on mobile, Grid is default */}
          <div className={`hidden md:flex items-center rounded-lg p-1 ${isDarkMode ? 'bg-[#0D1117]' : 'bg-[#E3E7EE]'}`}>
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md transition-all duration-200 ${viewMode === 'grid' ? (isDarkMode ? 'bg-[#161B22] text-[#E8EDF5] shadow-sm' : 'bg-[#FFFFFF] text-[#1C2733] shadow-sm') : (isDarkMode ? 'text-[#AEB6C3] hover:bg-[#161B22]' : 'text-[#4A5568] hover:bg-[#F7F9FC]')}`}>
              <Grid className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition-all duration-200 ${viewMode === 'list' ? (isDarkMode ? 'bg-[#161B22] text-[#E8EDF5] shadow-sm' : 'bg-[#FFFFFF] text-[#1C2733] shadow-sm') : (isDarkMode ? 'text-[#AEB6C3] hover:bg-[#161B22]' : 'text-[#4A5568] hover:bg-[#F7F9FC]')}`}>
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#161B22] border-[#262C35]' : 'bg-[#FFFFFF] border-[#E3E7EE] shadow-lg'}`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-[#1ABC9C]/10' : 'bg-[#1ABC9C]/10'}`}>
              <BarChart3 className="w-5 h-5 text-[#1ABC9C]" />
            </div>
            <span className={`font-semibold ${isDarkMode ? 'text-[#E8EDF5]' : 'text-[#1C2733]'}`}>Total Reports</span>
          </div>
          <p className={`text-2xl font-bold ${isDarkMode ? 'text-[#E8EDF5]' : 'text-[#1C2733]'}`}>{reports.length}</p>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-[#AEB6C3]' : 'text-[#4A5568]'}`}>All time</p>
        </div>

        <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#161B22] border-[#262C35]' : 'bg-[#FFFFFF] border-[#E3E7EE] shadow-lg'}`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-[#C0392B]/10' : 'bg-[#E74C3C]/10'}`}>
              <AlertTriangle className={`w-5 h-5 ${isDarkMode ? 'text-[#C0392B]' : 'text-[#E74C3C]'}`} />
            </div>
            <span className={`font-semibold ${isDarkMode ? 'text-[#E8EDF5]' : 'text-[#1C2733]'}`}>High Risk</span>
          </div>
          <p className={`text-2xl font-bold ${isDarkMode ? 'text-[#C0392B]' : 'text-[#E74C3C]'}`}>
            {reports.filter(r => parseFloat(r.riskScore.toString()) >= 8).length}
          </p>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-[#AEB6C3]' : 'text-[#4A5568]'}`}>Requires attention</p>
        </div>

        <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#161B22] border-[#262C35]' : 'bg-[#FFFFFF] border-[#E3E7EE] shadow-lg'}`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-[#27AE60]/10' : 'bg-[#2ECC71]/10'}`}>
              <CheckCircle className={`w-5 h-5 ${isDarkMode ? 'text-[#27AE60]' : 'text-[#2ECC71]'}`} />
            </div>
            <span className={`font-semibold ${isDarkMode ? 'text-[#E8EDF5]' : 'text-[#1C2733]'}`}>Completed</span>
          </div>
          <p className={`text-2xl font-bold ${isDarkMode ? 'text-[#27AE60]' : 'text-[#2ECC71]'}`}>
            {reports.filter(r => r.status === 'complete').length}
          </p>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-[#AEB6C3]' : 'text-[#4A5568]'}`}>Analysis complete</p>
        </div>

        <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#161B22] border-[#262C35]' : 'bg-[#FFFFFF] border-[#E3E7EE] shadow-lg'}`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-[#9B59B6]/10' : 'bg-[#9B59B6]/10'}`}>
              <TrendingUp className="w-5 h-5 text-[#9B59B6]" />
            </div>
            <span className={`font-semibold ${isDarkMode ? 'text-[#E8EDF5]' : 'text-[#1C2733]'}`}>Avg Risk Score</span>
          </div>
          <p className="text-2xl font-bold text-[#9B59B6]">
            {reports.length > 0 ? (reports.reduce((acc, r) => acc + parseFloat(r.riskScore.toString()), 0) / reports.length).toFixed(1) : '0.0'}
          </p>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-[#AEB6C3]' : 'text-[#4A5568]'}`}>Overall average</p>
        </div>
      </div>

      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div className="relative w-full lg:w-auto">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-[#7A8291]' : 'text-[#7D8693]'}`} />
          <input type="text" placeholder="Search reports..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className={`pl-10 pr-4 py-2 w-full lg:w-72 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-[#1ABC9C]/20 focus:border-[#1ABC9C] ${isDarkMode ? 'bg-[#161B22] border-[#262C35] text-[#E8EDF5] placeholder-[#7A8291]' : 'bg-[#F7F9FC] border-[#E3E7EE] text-[#1C2733] placeholder-[#7D8693]'}`} />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'date' | 'risk' | 'title')}
            className={`w-full sm:w-auto px-3 py-2 rounded-lg border transition-colors ${isDarkMode ? 'bg-[#161B22] border-[#262C35] text-[#E8EDF5]' : 'bg-[#FFFFFF] border-[#E3E7EE] text-[#1C2733]'}`}>
            <option value="date">Sort by Date</option>
            <option value="risk">Sort by Risk</option>
            <option value="title">Sort by Title</option>
          </select>

          <select value={filterBy} onChange={(e) => setFilterBy(e.target.value as 'all' | 'high-risk' | 'recent')}
            className={`w-full sm:w-auto px-3 py-2 rounded-lg border transition-colors ${isDarkMode ? 'bg-[#161B22] border-[#262C35] text-[#E8EDF5]' : 'bg-[#FFFFFF] border-[#E3E7EE] text-[#1C2733]'}`}>
            <option value="all">All Reports</option>
            <option value="high-risk">High Risk Only</option>
            <option value="recent">Recent Reports</option>
          </select>
        </div>
      </div>

      {filteredReports.length === 0 ? (
        <div className="text-center py-12">
          <FileText className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-[#7A8291]' : 'text-[#7D8693]'}`} />
          <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-[#E8EDF5]' : 'text-[#1C2733]'}`}>No reports found</h3>
          <p className={`${isDarkMode ? 'text-[#AEB6C3]' : 'text-[#4A5568]'}`}>
            {searchQuery ? 'Try adjusting your search or filters.' : 'Upload documents to generate reports.'}
          </p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredReports.map((report) => (
            <React.Fragment key={report.filename}>
              {viewMode === 'grid' ? (
                <ReportCard report={report} onViewReport={onViewReport} />
              ) : (
                <>
                  <div className="md:hidden">
                    <ReportCard report={report} onViewReport={onViewReport} />
                  </div>
                  <div className="hidden md:block">
                    <ReportRow report={report} />
                  </div>
                </>
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};