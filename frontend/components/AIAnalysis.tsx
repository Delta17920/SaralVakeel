import React, { useState, useEffect } from 'react';
import {
  Clock,
  Brain,
  Shield,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Zap,
  Target,
  Activity,
  Eye,
  Download,
  RefreshCw,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Minus,
  Filter,
  Calendar,
  Search,
  FileText,
  AlertCircle
} from 'lucide-react';

interface AIAnalysisProps {
  isDarkMode: boolean;
  onViewReport?: (filename: string) => void;
}

interface AnalysisCard {
  id: string;
  title: string;
  status: 'processing' | 'complete' | 'warning' | 'error';
  progress: number;
  findings: number;
  riskScore: number;
  completedAt?: Date;
  category: string;
  keyInsights: string[];
  obligationsCount: number;
  risksCount: number;
}

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
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
      const res = await fetch('/api/list-json-files');
      const data = await res.json();
      const filenames: string[] = data.files;
      setFileCount(filenames.length);

      const cards: AnalysisCard[] = await Promise.all(
        filenames.map(async (file, index) => {
          const fileRes = await fetch(`/api/fetch-json?filename=${encodeURIComponent(file)}`);
          const fileData = await fileRes.json();
          const riskScore = fileData.data?.['risk score'] ?? fileData.data?.risk_score ?? 0;
          const obligationsCount = fileData.data?.obligations?.length ?? 0;
          const risksCount = fileData.data?.risks?.length ?? 0;
          
          return {
            id: (index + 1).toString(),
            title: file.replace(/\.[^/.]+$/, ''),
            status: 'complete',
            progress: 100,
            findings: fileData.data.findings ?? Math.floor(Math.random() * 25),
            riskScore,
            obligationsCount,
            risksCount,
            completedAt: fileData.data.completedAt ? new Date(fileData.data.completedAt) : new Date(),
            category: fileData.data.category ?? 'Auto Analysis',
            keyInsights: fileData.data.keyInsights ?? ['Insight 1', 'Insight 2']
          } as AnalysisCard;
        })
      );

      const filteredCards = cards.filter(Boolean) as AnalysisCard[];
      setAnalysisCards(filteredCards);

      // calculate totals
      const totalRisk = filteredCards.reduce((sum, card) => sum + (card?.riskScore ?? 0), 0);
      const totalObligations = filteredCards.reduce((sum, card) => sum + (card?.obligationsCount ?? 0), 0);
      const totalRisks = filteredCards.reduce((sum, card) => sum + (card?.risksCount ?? 0), 0);

      // set with 2 decimal points for riskScore, counts usually integers so no need
      setTotalRiskScore(Number(totalRisk.toFixed(2)));
      setTotalObligationsCount(totalObligations);
      setTotalRisksCount(totalRisks);

    } catch (err) {
      console.error('Failed to fetch JSON files', err);
    } finally {
      setIsLoading(false);
    }
  }

  fetchJsonFiles();
}, []);



  const metrics: MetricCard[] = [
    {
      title: 'Total Analyses',
      value: fileCount,
      change: 12.5,
      trend: 'up',
      icon: Brain,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      title: 'Average Risk Score',
      value: (totalRiskScore/fileCount).toFixed(2),
      change: -8.2,
      trend: 'down',
      icon: AlertTriangle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20'
    },
    {
      title: 'Total Obligations',
      value: totalObligationsCount,
      change: -15.3,
      trend: 'down',
      icon: FileText, // Changed from Clock to FileText for obligations
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20'
    },
    {
      title: 'Total Risks',
      value: totalRisksCount,
      change: 2.1,
      trend: 'up',
      icon: AlertCircle, // Changed from Target to AlertCircle for risks
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    }
  ];

  const riskDistribution = [
    { level: 'Critical', count: 23, percentage: 14, color: 'bg-red-500' },
    { level: 'High', count: 45, percentage: 28, color: 'bg-orange-500' },
    { level: 'Medium', count: 67, percentage: 41, color: 'bg-yellow-500' },
    { level: 'Low', count: 28, percentage: 17, color: 'bg-green-500' }
  ];

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

  const getRiskScoreColor = (score: number) => {
    if (score >= 8) return 'text-red-600';
    if (score >= 6) return 'text-amber-600';
    if (score >= 4) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <ArrowDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  const filteredAnalyses = analysisCards.filter(card => {
    const matchesSearch =
      card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || card.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header Skeleton */}
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-lg w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-lg w-1/2"></div>
      </div>

      {/* Metrics Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className={`p-6 rounded-2xl border animate-pulse ${
            isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
              <div className="w-8 h-4 bg-gray-200 dark:bg-gray-800 rounded"></div>
            </div>
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
          </div>
        ))}
      </div>

      {/* Search and Cards Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`p-6 rounded-2xl border animate-pulse ${
                isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
              }`}>
                <div className="flex justify-between mb-4">
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-2"></div>
                    <div className="flex space-x-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-20"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className={`p-3 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 mb-4">
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-4/5"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                </div>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Sidebar Skeleton */}
        <div className="space-y-6">
          <div className={`p-6 rounded-2xl border animate-pulse ${
            isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
          }`}>
            <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mb-6"></div>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-8"></div>
                  </div>
                  <div className={`h-3 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
            AI Analysis Dashboard
          </h1>
          <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Advanced legal document analysis powered by artificial intelligence
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className={`px-3 py-2 rounded-lg border transition-colors ${
              isDarkMode
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-white border-gray-200'
            }`}
          >
            <option value="1d">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          
          <button
            onClick={handleRefresh}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
            } ${isRefreshing ? 'animate-spin' : ''}`}
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className={`p-6 rounded-2xl border transition-all duration-300 hover:scale-105 group ${
              isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-lg'
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
              <div className="flex items-center space-x-1">
                {getTrendIcon(metric.trend)}
                <span className={`text-sm font-medium ${
                  metric.trend === 'up' ? 'text-green-600' : 
                  metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {Math.abs(metric.change)}%
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-2xl font-bold">{metric.value}</p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {metric.title}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search analyses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`pl-10 pr-4 py-2 w-72 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                : 'bg-gray-50 border-gray-200 placeholder-gray-500'
            }`}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          {['all', 'complete', 'processing', 'warning'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeFilter === filter
                  ? 'bg-blue-600 text-white shadow-lg'
                  : isDarkMode
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Analysis Cards and Risk Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Analysis Cards */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-semibold">Recent Analysis Results</h2>
          
          <div className="space-y-4">
            {filteredAnalyses.map((analysis, index) => (
              <div
                key={analysis.id}
                className={`p-6 rounded-2xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group ${
                  isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-lg'
                }`}
                style={{
                  animationDelay: `${index * 150}ms`,
                  animation: 'slideInLeft 0.6s ease-out forwards'
                }}
              >
                {/* Header */}
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
                      <span className={`text-sm px-2 py-1 rounded-full ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                        {analysis.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                {analysis.status === 'processing' && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Processing Progress</span>
                      <span className="text-sm">{analysis.progress}%</span>
                    </div>
                    <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-300"
                        style={{ width: `${analysis.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                 
                  <div className={`text-center p-3 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <p className={`text-2xl font-bold ${getRiskScoreColor(analysis.riskScore)}`}>
                      {analysis.riskScore}
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Risk Score</p>
                  </div>
                  <div className={`text-center p-3 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <p className={`text-2xl font-bold ${getRiskScoreColor(analysis.obligationsCount)}`}>
                      {analysis.obligationsCount}
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Obligations</p>
                  </div>
                  <div className={`text-center p-3 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <p className={`text-2xl font-bold ${getRiskScoreColor(analysis.risksCount)}`}>
                      {analysis.risksCount}
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Risks</p>
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button 
                  onClick={() => onViewReport?.(analysis.title + '.json')}
                  className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-lg hover:from-blue-700 hover:to-violet-700 transition-all duration-200"
                  >
                    <span className="font-medium">View Detailed Report</span>
                    <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Distribution Panel */}
        <div className="space-y-6">
          <div className={`p-6 rounded-2xl border ${
            isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-lg'
          }`}>
            <h3 className="font-semibold text-lg mb-6">Risk Distribution</h3>
            
            <div className="space-y-4">
              {riskDistribution.map((risk, index) => (
                <div key={risk.level} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{risk.level} Risk</span>
                    <span className="text-sm font-semibold">{risk.count}</span>
                  </div>
                  <div className={`w-full h-3 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                    <div 
                      className={`h-full ${risk.color} rounded-full transition-all duration-1000 ease-out`}
                      style={{ 
                        width: `${risk.percentage}%`,
                        animationDelay: `${index * 200}ms`
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{risk.percentage}% of total</span>
                    <span>{risk.count} issues</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button className="w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200">
                Generate Risk Report
              </button>
            </div>
          </div>

          {/* Processing Queue */}
          <div className={`p-6 rounded-2xl border ${
            isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-lg'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Processing Queue</h3>
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-blue-500 animate-pulse" />
                <span className="text-sm text-blue-500 font-medium">3 Active</span>
              </div>
            </div>
            
            <div className="space-y-3">
              {[
                { name: 'Patent Applications.pdf', progress: 78, eta: '2m' },
                { name: 'Supply Agreement.docx', progress: 45, eta: '5m' },
                { name: 'Licensing Terms.pdf', progress: 23, eta: '8m' }
              ].map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium truncate">{item.name}</span>
                    <span className="text-xs text-gray-500">{item.eta} left</span>
                  </div>
                  <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-300"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default AIAnalysis;