import React, { useState } from 'react';
import {
  Upload,
  Brain,
  FileText,
  Shield,
  CheckCircle,
  AlertTriangle,
  Users,
  BarChart3,
  Clock,
  ArrowRight,
  Play,
  Pause,
  ChevronRight,
  Star,
  Zap,
  Target,
  Award,
  TrendingUp,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react';
import { Spotlight } from './ui/spotlight';

interface OverviewProps {
  isDarkMode?: boolean;
}

const AppOverview: React.FC<OverviewProps> = ({ isDarkMode = false }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const steps = [
    {
      id: 'upload',
      title: 'Upload Documents',
      description: 'Simply drag and drop your legal documents or click to browse. We support PDF, Word, and text files.',
      icon: Upload,
      color: 'from-blue-500 to-cyan-500',
      details: ['PDF, DOCX, TXT supported', 'Secure cloud storage', 'Batch upload capability']
    },
    {
      id: 'analyze',
      title: 'AI Analysis',
      description: 'Our advanced AI processes your documents, extracting key information and identifying potential risks.',
      icon: Brain,
      color: 'from-purple-500 to-pink-500',
      details: ['Natural language processing', 'Risk assessment', 'Key term extraction']
    },
    {
      id: 'insights',
      title: 'Get Insights',
      description: 'Receive detailed reports with obligations, risks, parties involved, and actionable recommendations.',
      icon: BarChart3,
      color: 'from-green-500 to-emerald-500',
      details: ['Risk scoring', 'Compliance insights', 'Action items']
    },
    {
      id: 'manage',
      title: 'Manage & Track',
      description: 'Monitor your documents, track compliance status, and collaborate with your team effectively.',
      icon: Shield,
      color: 'from-orange-500 to-red-500',
      details: ['Real-time monitoring', 'Team collaboration', 'Audit trails']
    }
  ];

  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Process documents in seconds, not hours',
      metric: '< 30s',
      color: 'text-yellow-600'
    },
    {
      icon: Target,
      title: 'Highly Accurate',
      description: 'AI-powered analysis with 98.7% accuracy',
      metric: '98.7%',
      color: 'text-blue-600'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Enterprise-grade security for your data',
      metric: 'SOC 2',
      color: 'text-green-600'
    },
    {
      icon: Award,
      title: 'Trusted by Legal Teams',
      description: 'Used by 500+ legal professionals',
      metric: '500+',
      color: 'text-purple-600'
    }
  ];

  const useCases = [
    {
      title: 'Contract Review',
      description: 'Identify risks, obligations, and key terms in contracts',
      icon: FileText,
      scenarios: ['M&A agreements', 'Employment contracts', 'Vendor agreements']
    },
    {
      title: 'Compliance Monitoring',
      description: 'Ensure your documents meet regulatory requirements',
      icon: CheckCircle,
      scenarios: ['GDPR compliance', 'Industry regulations', 'Internal policies']
    },
    {
      title: 'Risk Assessment',
      description: 'Spot potential legal risks before they become problems',
      icon: AlertTriangle,
      scenarios: ['Liability clauses', 'Termination risks', 'Financial exposure']
    }
  ];

  React.useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, steps.length]);

  const currentStepData = steps[currentStep];

  return (
    <div className={`min-h-screen w-full overflow-x-hidden relative ${isDarkMode ? 'bg-black' : 'bg-slate-50'}`}>
      {/* Spotlight Background */}
      <Spotlight
        className="-top-40 left-0 md:-top-20 md:left-60"
        fill={isDarkMode ? "white" : "blue"}
      />
      <Spotlight
        className="top-10 left-full h-[80vh] w-[50vw]"
        fill={isDarkMode ? "purple" : "indigo"}
      />
      <Spotlight
        className="top-28 left-80 h-[80vh] w-[50vw]"
        fill={isDarkMode ? "blue" : "purple"}
      />
      
      {/* Content with proper constraints */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-violet-600 bg-clip-text text-transparent leading-[1.1] font-sans">
  AI-POWERED LEGAL DOCUMENT ANALYSIS
</h1>

            <p className={`text-lg sm:text-xl lg:text-2xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto break-words`}>
              Transform complex legal documents into clear, actionable insights in seconds
            </p>
          </div>
        </div>

        {/* How It Works - Interactive Flow */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold">How It Works</h2>
          </div>

          {/* Step Navigation */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              }`}
            >
              {isAutoPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            
            <div className="flex items-center space-x-2">
              {steps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentStep
                      ? 'bg-blue-600 w-8'
                      : isDarkMode
                      ? 'bg-gray-600 hover:bg-gray-500'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Current Step Display */}
          <div className={`p-4 sm:p-6 lg:p-8 rounded-2xl border transition-all duration-500 ${
            isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-xl'
          }`}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className={`p-3 sm:p-4 rounded-xl bg-gradient-to-r ${currentStepData.color} shrink-0`}>
                    <currentStepData.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Step {currentStep + 1} of {steps.length}
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold break-words">{currentStepData.title}</h3>
                  </div>
                </div>
                
                <p className={`text-base sm:text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} break-words`}>
                  {currentStepData.description}
                </p>
                
                <div className="space-y-3">
                  {currentStepData.details.map((detail, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${currentStepData.color} shrink-0`} />
                      <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm sm:text-base break-words`}>
                        {detail}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visual representation */}
              <div className={`p-6 sm:p-8 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} relative overflow-hidden`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${currentStepData.color} opacity-10`} />
                <div className="relative z-10 text-center space-y-4">
                  <currentStepData.icon className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-gradient-to-r ${currentStepData.color} bg-clip-text text-transparent`} />
                  <div className="space-y-2">
                    <div className={`h-2 rounded-full bg-gradient-to-r ${currentStepData.color} opacity-60`} />
                    <div className={`h-2 rounded-full bg-gradient-to-r ${currentStepData.color} opacity-40 w-4/5 mx-auto`} />
                    <div className={`h-2 rounded-full bg-gradient-to-r ${currentStepData.color} opacity-20 w-3/5 mx-auto`} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="space-y-6 sm:space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold">Why Choose Our Platform</h2>
            <p className={`text-base sm:text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} break-words`}>
              Built for legal professionals who value speed, accuracy, and security
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`p-4 sm:p-6 rounded-2xl border transition-all duration-300 hover:scale-105 group ${
                  isDarkMode ? 'bg-gray-900 border-gray-800 hover:border-gray-700' : 'bg-white border-gray-200 hover:border-gray-300 shadow-lg'
                }`}
              >
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <feature.icon className={`w-6 h-6 sm:w-8 sm:h-8 ${feature.color} shrink-0`} />
                    <span className={`text-lg sm:text-2xl font-bold ${feature.color} break-words`}>
                      {feature.metric}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-base sm:text-lg break-words">{feature.title}</h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} break-words`}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Use Cases */}
        <div className="space-y-6 sm:space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold">Perfect For</h2>
            <p className={`text-base sm:text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} break-words`}>
              Multiple legal document scenarios, one powerful solution
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {useCases.map((useCase, index) => (
              <div
                key={index}
                className={`p-4 sm:p-6 rounded-2xl border transition-all duration-300 hover:scale-105 ${
                  isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-lg'
                }`}
              >
                <div className="space-y-4">
                  <div className={`p-3 rounded-lg w-fit ${
                    isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'
                  }`}>
                    <useCase.icon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg sm:text-xl break-words">{useCase.title}</h3>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm sm:text-base break-words`}>
                      {useCase.description}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Common scenarios:
                    </p>
                    <div className="space-y-1">
                      {useCase.scenarios.map((scenario, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <ChevronRight className="w-3 h-3 text-blue-600 shrink-0" />
                          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} break-words`}>
                            {scenario}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sample Analysis Preview */}
        <div className="space-y-6 sm:space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold">See It In Action</h2>
            <p className={`text-base sm:text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} break-words`}>
              Here's what you get from our AI analysis
            </p>
          </div>

          <div className={`p-4 sm:p-6 lg:p-8 rounded-2xl border ${
            isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-xl'
          }`}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Sample Document */}
              <div className="space-y-4">
                <h3 className="text-lg sm:text-xl font-semibold">Sample Document</h3>
                <div className={`p-4 rounded-lg border ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center space-x-3 mb-4">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 shrink-0" />
                    <span className="font-medium text-sm sm:text-base break-words min-w-0">Employment_Agreement.pdf</span>
                    <span className={`px-2 py-1 rounded-full text-xs shrink-0 ${
                      isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
                    }`}>
                      Complete
                    </span>
                  </div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} space-y-2`}>
                    <p>42 pages • 18,500 words • 74 min read</p>
                    <p>Uploaded: 2 hours ago</p>
                  </div>
                </div>
              </div>

              {/* Analysis Results */}
              <div className="space-y-4">
                <h3 className="text-lg sm:text-xl font-semibold">Analysis Results</h3>
                <div className="space-y-3">
                  <div className={`p-4 rounded-lg border ${
                    isDarkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-red-600 text-sm sm:text-base">Risk Score</span>
                      <span className="text-xl sm:text-2xl font-bold text-red-600">7.8/10</span>
                    </div>
                    <p className="text-sm text-red-600">Medium-High Risk</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className={`p-3 rounded-lg text-center ${
                      isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                    }`}>
                      <p className="text-xl sm:text-2xl font-bold text-blue-600">12</p>
                      <p className="text-xs sm:text-sm text-gray-500">Obligations</p>
                    </div>
                    <div className={`p-3 rounded-lg text-center ${
                      isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                    }`}>
                      <p className="text-xl sm:text-2xl font-bold text-purple-600">3</p>
                      <p className="text-xs sm:text-sm text-gray-500">Risk Issues</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="font-medium text-sm">Key Findings:</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                        <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} break-words`}>
                          Non-compete clause duration exceeds industry standard
                        </span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} break-words`}>
                          Termination procedures clearly defined
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className={`p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 text-white text-center space-y-6`}>
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold break-words">Ready to Transform Your Legal Workflow?</h2>
            <p className="text-lg sm:text-xl opacity-90 max-w-2xl mx-auto break-words">
              Join hundreds of legal professionals who trust our AI to analyze their most important documents
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 shadow-lg">
              Start Free Trial
            </button>
            <button className="w-full sm:w-auto px-6 py-3 border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-white/10 transition-all duration-200">
              Schedule Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppOverview;