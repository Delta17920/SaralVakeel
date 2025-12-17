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

const ReportsList: React.FC<ReportsListProps> = ({ isDarkMode = false, onViewReport }) => {
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
        metadata: {
          documentTitle?: string;
          documentType?: string;
          completedAt?: string;
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
          createdAt: metadata.completedAt ? new Date(metadata.completedAt) : new Date(),
          riskScore: metadata['risk score'] || metadata.risk_score || 0,
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
    if (score >= 8) return { level: 'High', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' };
    if (score >= 6) return { level: 'Medium', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' };
    if (score >= 4) return { level: 'Low-Med', color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' };
    return { level: 'Low', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      case 'processing':
        return 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
      case 'warning':
        return 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800';
    }
  };

  // Filter and sort reports
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
      <div
        className={`p-6 rounded-2xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group ${isDarkMode
          ? 'bg-gray-900 border-gray-800'
          : 'bg-white border-gray-200 shadow-lg'
          }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            <div
              className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'
                }`}
            >
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-lg mb-1 break-words">
                {report.title}
              </h3>
              <div className="flex items-center space-x-2 mb-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${isDarkMode
                    ? 'bg-gray-800 text-gray-300'
                    : 'bg-gray-100 text-gray-600'
                    }`}
                >
                  {report.documentType}
                </span>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                    report.status
                  )}`}
                >
                  {report.status === 'complete' && (
                    <CheckCircle className="w-3 h-3 mr-1" />
                  )}
                  {report.status === 'warning' && (
                    <AlertTriangle className="w-3 h-3 mr-1" />
                  )}
                  {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                </span>
              </div>
            </div>
          </div>

          <button
            className={`p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              }`}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div
            className={`text-center p-3 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
              }`}
          >
            <p className={`text-lg font-bold ${riskLevel.color}`}>
              {report.riskScore}
            </p>
            <p className="text-xs text-gray-500">Risk Score</p>
          </div>
          <div
            className={`text-center p-3 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
              }`}
          >
            <p className="text-lg font-bold">{report.obligations}</p>
            <p className="text-xs text-gray-500">Tasks</p>
          </div>
        </div>

        {/* Summary */}
        <p
          className={`text-sm mb-4 line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
        >
          {report.summary}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>{report.createdAt.toLocaleDateString()}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                }`}
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewReport?.(report.filename)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-lg hover:from-blue-700 hover:to-violet-700 transition-all duration-200"
            >
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
      <div className={`p-4 rounded-xl border transition-all duration-200 hover:scale-[1.01] hover:shadow-lg ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
        }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
              <FileText className="w-4 h-4 text-blue-600" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3">
                <h3 className="font-semibold truncate">{report.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'
                  }`}>
                  {report.documentType}
                </span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}>
                  {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                </span>
              </div>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {report.createdAt.toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className={`font-semibold ${riskLevel.color}`}>{report.riskScore}</p>
              <p className="text-xs text-gray-500">Risk Score</p>
            </div>

            <button
              onClick={() => onViewReport?.(report.filename)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-lg hover:from-blue-700 hover:to-violet-700 transition-all duration-200"
            >
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
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-lg w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
                }`}>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mb-6"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text ${isDarkMode ? 'text-black' : 'text-white'}">
            Analysis Reports
          </h1>
          <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            View and manage all document analysis reports
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`p-2 rounded-lg transition-all duration-200 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              } ${isRefreshing ? 'animate-spin' : ''}`}
          >
            <RefreshCw className="w-5 h-5" />
          </button>

          <div className="flex items-center bg-gray-200 dark:bg-gray-900 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`
      p-2 rounded-md transition-all duration-200
      ${viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
                }
    `}
            >
              <Grid className="w-4 h-4" />
            </button>

            <button
              onClick={() => setViewMode('list')}
              className={`
      p-2 rounded-md transition-all duration-200
      ${viewMode === 'list'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
                }
    `}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-lg'
          }`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <span className="font-semibold">Total Reports</span>
          </div>
          <p className="text-2xl font-bold">{reports.length}</p>
          <p className="text-sm text-gray-500 mt-1">All time</p>
        </div>

        <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-lg'
          }`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/30">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <span className="font-semibold">High Risk</span>
          </div>
          <p className="text-2xl font-bold text-red-600">
            {reports.filter(r => parseFloat(r.riskScore.toString()) >= 8).length}
          </p>
          <p className="text-sm text-gray-500 mt-1">Requires attention</p>
        </div>

        <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-lg'
          }`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/30">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <span className="font-semibold">Completed</span>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {reports.filter(r => r.status === 'complete').length}
          </p>
          <p className="text-sm text-gray-500 mt-1">Analysis complete</p>
        </div>

        <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-lg'
          }`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/30">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <span className="font-semibold">Avg Risk Score</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            {reports.length > 0 ?
              (reports.reduce((acc, r) => acc + parseFloat(r.riskScore.toString()), 0) / reports.length).toFixed(1)
              : '0.0'
            }
          </p>
          <p className="text-sm text-gray-500 mt-1">Overall average</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`pl-10 pr-4 py-2 w-72 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${isDarkMode
              ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
              : 'bg-gray-50 border-gray-200 placeholder-gray-500'
              }`}
          />
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'risk' | 'title')}
            className={`px-3 py-2 rounded-lg border transition-colors ${isDarkMode
              ? 'bg-gray-800 border-gray-700 text-white'
              : 'bg-white border-gray-200'
              }`}
          >
            <option value="date">Sort by Date</option>
            <option value="risk">Sort by Risk</option>
            <option value="title">Sort by Title</option>
          </select>

          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as 'all' | 'high-risk' | 'recent')}
            className={`px-3 py-2 rounded-lg border transition-colors ${isDarkMode
              ? 'bg-gray-800 border-gray-700 text-white'
              : 'bg-white border-gray-200'
              }`}
          >
            <option value="all">All Reports</option>
            <option value="high-risk">High Risk Only</option>
            <option value="recent">Recent Reports</option>
          </select>
        </div>
      </div>

      {/* Reports Grid/List */}
      {filteredReports.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No reports found</h3>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {searchQuery ? 'Try adjusting your search or filters.' : 'Upload documents to generate reports.'}
          </p>
        </div>
      ) : (
        <div className={viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'space-y-4'
        }>
          {filteredReports.map((report) => (
            viewMode === 'grid' ? (
              <ReportCard key={report.filename} report={report} />
            ) : (
              <ReportRow key={report.filename} report={report} />
            )
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

export default ReportsList;