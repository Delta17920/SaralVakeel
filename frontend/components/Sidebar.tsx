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
  isDesktopCollapsed: boolean;
  setIsDesktopCollapsed: (value: boolean) => void;
}

export default function Sidebar({
  isDarkMode,
  sidebarExpanded,
  setSidebarExpanded,
  activeTab,
  setActiveTab,
  uploadedFilesCount,
  showReport,
  onBackFromReport,
  isDesktopCollapsed,
}: SidebarProps) {
  const menuItems = [
    { id: 'documents', label: 'Documents', badge: uploadedFilesCount, description: 'Upload & manage files' },
    { id: 'analysis', label: 'AI Analysis', description: 'Smart insights & review' },
    { id: 'reports', label: 'Reports', description: 'Generated summaries' },
  ];

  const handleTabClick = (tabId: string) => {
    if (showReport) onBackFromReport();
    setActiveTab(tabId);
    if (window.innerWidth < 1024) setSidebarExpanded(false);
  };

  return (
    <aside className={`
      ${isDarkMode ? 'bg-[#1A1C20] border-[#2B2E35]' : 'bg-[#FBF8F3] border-[#DDD6CC]'}
      border-r fixed lg:sticky top-0 lg:top-[73px] left-0
      h-screen lg:h-[calc(100vh-73px)]
      transition-all duration-300 ease-in-out
      ${sidebarExpanded ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      ${isDesktopCollapsed ? 'lg:w-20' : 'lg:w-64'}
      w-64 z-40 flex flex-col
    `}>
      <div className={`flex-1 flex flex-col ${isDesktopCollapsed ? 'p-3' : 'p-6'}`}>

        {/* Mobile close header */}
        <div className="flex justify-between items-center mb-8 lg:hidden">
          <div>
            <span className={`font-bold text-lg block font-[family-name:var(--font-heading)] ${isDarkMode ? 'text-[#ECEDEE]' : 'text-[#2E2A26]'}`}>
              Saral Vakeel
            </span>
            <span className={`text-xs ${isDarkMode ? 'text-[#B4B7BD]' : 'text-[#8C7B6B]'}`}>
              Legal Document Assistant
            </span>
          </div>
          <button onClick={() => setSidebarExpanded(false)}
            className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-[#2B2E35]' : 'hover:bg-[#EDE7DB]'}`}>
            <svg className={`w-6 h-6 ${isDarkMode ? 'text-[#ECEDEE]' : 'text-[#2E2A26]'}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Back button */}
        {showReport && (
          <button
            onClick={onBackFromReport}
            className={`w-full mb-4 px-2 py-2 rounded-lg flex items-center gap-2 transition-colors overflow-hidden
              ${isDarkMode ? 'bg-[#2B2E35] hover:bg-[#3B3E45] text-[#ECEDEE]' : 'bg-[#EDE7DB] hover:bg-[#DDD6CC] text-[#2E2A26]'}`}
            title="Back to Reports"
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {!isDesktopCollapsed && <span className="whitespace-nowrap">Back to Reports</span>}
          </button>
        )}

        {/* Nav items */}
        <nav className="space-y-1.5 flex-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`
                w-full px-4 py-3 rounded-xl flex items-center ${isDesktopCollapsed ? 'justify-center' : 'justify-between'}
                transition-all duration-200 group
                ${activeTab === item.id
                  ? isDarkMode
                    ? 'bg-[#2B2420] text-[#C49A6C] shadow-sm'
                    : 'bg-[#4A3F35] text-[#FBF8F3] shadow-md'
                  : isDarkMode
                    ? 'text-[#B4B7BD] hover:bg-[#2B2E35] hover:text-[#ECEDEE]'
                    : 'text-[#4B463F] hover:bg-[#EDE7DB] hover:text-[#2E2A26]'
                }
              `}
              title={isDesktopCollapsed ? item.label : undefined}
            >
              <div className={`flex items-center gap-3 text-left ${isDesktopCollapsed ? 'justify-center w-full' : 'flex-1'}`}>
                <div className="flex-shrink-0">
                  {item.id === 'documents' && (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )}
                  {item.id === 'analysis' && (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )}
                  {item.id === 'reports' && (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )}
                </div>

                {!isDesktopCollapsed && (
                  <div className="flex flex-col ml-1">
                    <span className="font-semibold text-sm">{item.label}</span>
                    <span className={`text-xs ${activeTab === item.id
                        ? isDarkMode ? 'text-[#C49A6C]/70' : 'text-[#FBF8F3]/70'
                        : isDarkMode ? 'text-[#6B6E75]' : 'text-[#8C7B6B]'
                      }`}>{item.description}</span>
                  </div>
                )}
              </div>

              {!isDesktopCollapsed && item.badge !== undefined && item.badge > 0 && (
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold
                  ${activeTab === item.id
                    ? isDarkMode ? 'bg-[#C49A6C] text-[#1A1C20]' : 'bg-[#FBF8F3] text-[#4A3F35]'
                    : isDarkMode ? 'bg-[#2B2E35] text-[#B4B7BD]' : 'bg-[#DDD6CC] text-[#4A3F35]'
                  }`}>
                  {item.badge}
                </span>
              )}
              {isDesktopCollapsed && item.badge !== undefined && item.badge > 0 && (
                <span className={`absolute top-2 right-2 w-2 h-2 rounded-full ${isDarkMode ? 'bg-[#C49A6C]' : 'bg-[#8C6A4A]'}`} />
              )}
            </button>
          ))}
        </nav>

        {/* Quick tip footer */}
        {!isDesktopCollapsed && (
          <div className={`mt-6 pt-6 border-t ${isDarkMode ? 'border-[#2B2E35]' : 'border-[#DDD6CC]'}`}>
            <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-[#22201E]' : 'bg-[#EDE7DB]'}`}>
              <div className="flex items-start gap-3">
                <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDarkMode ? 'text-[#C49A6C]' : 'text-[#8C6A4A]'}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className={`font-semibold text-sm mb-1 ${isDarkMode ? 'text-[#ECEDEE]' : 'text-[#2E2A26]'}`}>Quick Tip</h4>
                  <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-[#B4B7BD]' : 'text-[#4B463F]'}`}>
                    Upload multiple documents to get comprehensive analysis and insights.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}