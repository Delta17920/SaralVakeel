import React from 'react';
import { 
  BarChart3,
  FileText,
  Brain,
  Shield,
  PieChart,
  Users,
  Menu
} from 'lucide-react';

interface SidebarProps {
  isDarkMode: boolean;
  sidebarExpanded: boolean;
  setSidebarExpanded: (expanded: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  uploadedFilesCount: number;
}

const Sidebar: React.FC<SidebarProps> = ({
  isDarkMode,
  sidebarExpanded,
  setSidebarExpanded,
  activeTab,
  setActiveTab,
  uploadedFilesCount
}) => {
  const navigationItems = [
    { id: 'overview', icon: BarChart3, label: 'Overview', count: null },
    { id: 'documents', icon: FileText, label: 'Documents', count: uploadedFilesCount },
    { id: 'analysis', icon: Brain, label: 'AI Analysis', count: 3 },
    { id: 'compliance', icon: Shield, label: 'Compliance', count: null },
    { id: 'reports', icon: PieChart, label: 'Reports', count: null },
    { id: 'team', icon: Users, label: 'Team', count: null },
  ];

  return (
    <aside className={`${
      sidebarExpanded ? 'w-72' : 'w-16'
    } ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-r transition-all duration-300 h-screen sticky top-16 overflow-y-auto`}>
      <div className="p-6">
        <button
          onClick={() => setSidebarExpanded(!sidebarExpanded)}
          className={`mb-6 p-2 rounded-lg transition-colors ${
            isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
          }`}
        >
          <Menu className="w-5 h-5" />
        </button>
        
        {sidebarExpanded && (
          <nav className="space-y-2">
            {navigationItems.map((item) => (
              <button
  key={item.id}
  onClick={() => setActiveTab(item.id)}
  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group gradient-sweep ${
    activeTab === item.id
      ? 'active text-white shadow-lg'
      : isDarkMode
      ? 'hover:bg-gray-800 text-gray-300'
      : 'hover:bg-gray-50 text-gray-600'
  }`}
>
  <div className="flex items-center space-x-3">
    <item.icon className="w-5 h-5" />
    <span className="font-medium">{item.label}</span>
  </div>
  {item.count !== null && (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
      activeTab === item.id
        ? 'bg-white/20 text-white'
        : isDarkMode
        ? 'bg-gray-700 text-gray-300'
        : 'bg-gray-200 text-gray-600'
    }`}>
      {item.count}
    </span>
  )}
</button>

            ))}
          </nav>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;