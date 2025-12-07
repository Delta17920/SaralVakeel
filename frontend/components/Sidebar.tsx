import React from 'react';

interface SidebarProps {
  isDarkMode: boolean;
  sidebarExpanded: boolean;
  setSidebarExpanded: (value: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  uploadedFilesCount: number;
  showReport: boolean;
  onBackFromReport: () => void;
}

export default function Sidebar({
  isDarkMode,
  sidebarExpanded,
  setSidebarExpanded,
  activeTab,
  setActiveTab,
  uploadedFilesCount,
  showReport,
  onBackFromReport
}: SidebarProps) {
  const menuItems = [
    { id: 'documents', icon: '📄', label: 'Documents', badge: uploadedFilesCount },
    { id: 'analysis', icon: '🔍', label: 'AI Analysis' },
    { id: 'reports', icon: '📈', label: 'Reports' },
    { id: 'compliance', icon: '✓', label: 'Compliance' },
    { id: 'team', icon: '👥', label: 'Team' },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    // Close sidebar on mobile after selection
    if (window.innerWidth < 1024) {
      setSidebarExpanded(false);
    }
  };

  return (
    <aside
      className={`
        ${isDarkMode ? 'bg-[#1A1C20]' : 'bg-white'} 
        border-r ${isDarkMode ? 'border-[#2B2E35]' : 'border-[#E2E2E8]'}
        fixed lg:static
        top-0 left-0 h-screen
        transition-transform duration-300 ease-in-out
        ${sidebarExpanded ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        w-64
        z-40
        overflow-y-auto
      `}
    >
      <div className="p-6">
        {/* Close button for mobile */}
        <div className="flex justify-between items-center mb-6 lg:hidden">
          <div className="flex items-center gap-2">
            <span className={`font-bold text-xl ${isDarkMode ? 'text-[#ECEDEE]' : 'text-[#1C1F26]'}`}>
                Saral Vakeel
            </span>
          </div>
          <button
            onClick={() => setSidebarExpanded(false)}
            className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-[#2B2E35]' : 'hover:bg-[#E2E2E8]'}`}
          >
            <svg 
              className={`w-6 h-6 ${isDarkMode ? 'text-[#ECEDEE]' : 'text-[#1C1F26]'}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        </div>

        {/* Back button when viewing report */}
        {showReport && (
          <button
            onClick={onBackFromReport}
            className={`
              w-full mb-4 px-4 py-2 rounded-lg flex items-center gap-2
              ${isDarkMode ? 'bg-[#2B2E35] hover:bg-[#3B3E45] text-[#ECEDEE]' : 'bg-[#E2E2E8] hover:bg-[#D2D2D8] text-[#1C1F26]'}
              transition-colors
            `}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Reports
          </button>
        )}

        {/* Menu Items */}
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`
                w-full px-4 py-3 rounded-lg flex items-center justify-between
                transition-colors
                ${activeTab === item.id
                  ? isDarkMode
                    ? 'bg-[#222B53] text-[#4FC4C4]'
                    : 'bg-[#E8F4F8] text-[#2F3C7E]'
                  : isDarkMode
                    ? 'text-[#B4B7BD] hover:bg-[#2B2E35]'
                    : 'text-[#4E535E] hover:bg-[#F5F5F7]'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <span className="font-medium">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`
                  px-2 py-1 rounded-full text-xs font-semibold
                  ${isDarkMode ? 'bg-[#4FC4C4] text-[#1C1F26]' : 'bg-[#2F3C7E] text-white'}
                `}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Settings at bottom */}
        <div className="mt-8 pt-8 border-t border-[#2B2E35]">
          <button
            className={`
              w-full px-4 py-3 rounded-lg flex items-center gap-3
              ${isDarkMode ? 'text-[#B4B7BD] hover:bg-[#2B2E35]' : 'text-[#4E535E] hover:bg-[#F5F5F7]'}
              transition-colors
            `}
          >
            <span className="font-medium">Settings</span>
          </button>
        </div>
      </div>
    </aside>
  );
}