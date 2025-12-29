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
    if (showReport) {
      onBackFromReport();
    }
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
        fixed lg:sticky
        top-0 lg:top-[73px] left-0 h-screen lg:h-[calc(100vh-73px)]
        transition-all duration-300 ease-in-out
        ${sidebarExpanded ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isDesktopCollapsed ? 'lg:w-20' : 'lg:w-64'}
        w-64
        z-40
        flex flex-col
      `}
    >
      <div className={`flex-1 flex flex-col ${isDesktopCollapsed ? 'p-3' : 'p-6'}`}>

        {/* Close button for mobile */}
        <div className="flex justify-between items-center mb-8 lg:hidden">
          <div className="flex items-center gap-3">
            <div>
              <span className={`font-bold text-lg block font-[family-name:var(--font-playfair)] ${isDarkMode ? 'text-[#ECEDEE]' : 'text-[#1C1F26]'}`}>
                Saral Vakeel
              </span>
              <span className={`text-xs ${isDarkMode ? 'text-[#B4B7BD]' : 'text-[#4E535E]'}`}>
                Legal Document Assistant
              </span>
            </div>
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
              w-full mb-4 px-2 py-2 rounded-lg flex items-center gap-2
              ${isDarkMode ? 'bg-[#2B2E35] hover:bg-[#3B3E45] text-[#ECEDEE]' : 'bg-[#E2E2E8] hover:bg-[#D2D2D8] text-[#1C1F26]'}
              transition-colors overflow-hidden
            `}
            title="Back to Reports"
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {!isDesktopCollapsed && <span className="whitespace-nowrap">Back to Reports</span>}
          </button>
        )}

        {/* Menu Items */}
        <nav className="space-y-2 flex-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`
                w-full px-4 py-3 rounded-lg flex items-center ${isDesktopCollapsed ? 'justify-center' : 'justify-between'}
                transition-all duration-200
                ${activeTab === item.id
                  ? isDarkMode
                    ? 'bg-[#222B53] text-[#4FC4C4] shadow-lg'
                    : 'bg-[#E8F4F8] text-[#2F3C7E] shadow-md'
                  : isDarkMode
                    ? 'text-[#B4B7BD] hover:bg-[#2B2E35] hover:text-[#ECEDEE]'
                    : 'text-[#4E535E] hover:bg-[#F5F5F7] hover:text-[#1C1F26]'
                }
              `}
              title={isDesktopCollapsed ? item.label : undefined}
            >
              <div className={`flex items-center gap-3 text-left ${isDesktopCollapsed ? 'justify-center w-full' : 'flex-1'}`}>
                {/* Icons placeholder - since original didn't have icons in menuItems, adding them or using first letter if not available. 
                    Actually, checking previous code, menuItems didn't have specific icons mapped. 
                    I'll add simple icons for better visual when collapsed. */}
                {/* 
                 NOTE: The original code didn't clear have icons for menu items in the array. 
                 It just had text labels. I need to make sure icons exist. 
                 I'll add some default SVGs inline for now if they aren't provided.
                 Wait, the original code indeed didn't have icons in the loop, just text.
                 I will add generic icons.
                 */}
                <div className="flex-shrink-0">
                  {item.id === 'documents' && (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  )}
                  {item.id === 'analysis' && (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  )}
                  {item.id === 'reports' && (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  )}
                </div>

                {!isDesktopCollapsed && (
                  <div className="flex flex-col ml-1">
                    <span className="font-semibold text-sm">{item.label}</span>
                    <span className={`text-xs ${activeTab === item.id ? (isDarkMode ? 'text-[#8FCDCD]' : 'text-[#5F6C9E]') : (isDarkMode ? 'text-[#6B6E75]' : 'text-[#8B8F99]')}`}>
                      {item.description}
                    </span>
                  </div>
                )}
              </div>

              {!isDesktopCollapsed && item.badge !== undefined && item.badge > 0 && (
                <span className={`
                  px-2.5 py-1 rounded-full text-xs font-bold
                  ${activeTab === item.id
                    ? isDarkMode ? 'bg-[#4FC4C4] text-[#1C1F26]' : 'bg-[#2F3C7E] text-white'
                    : isDarkMode ? 'bg-[#2B2E35] text-[#B4B7BD]' : 'bg-[#E2E2E8] text-[#4E535E]'
                  }
                `}>
                  {item.badge}
                </span>
              )}
              {/* Show badge as dot when collapsed */}
              {isDesktopCollapsed && item.badge !== undefined && item.badge > 0 && (
                <span className={`
                   absolute top-2 right-2 w-2 h-2 rounded-full
                   ${isDarkMode ? 'bg-[#4FC4C4]' : 'bg-[#2F3C7E]'}
                 `} />
              )}
            </button>
          ))}
        </nav>

        {/* Footer Info */}
        {!isDesktopCollapsed && (
          <div className={`mt-6 pt-6 border-t ${isDarkMode ? 'border-[#2B2E35]' : 'border-[#E2E2E8]'}`}>
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-[#222B53]' : 'bg-[#F5F5F7]'}`}>
              <div className="flex items-start gap-3">
                <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDarkMode ? 'text-[#4FC4C4]' : 'text-[#2F3C7E]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className={`font-semibold text-sm mb-1 ${isDarkMode ? 'text-[#ECEDEE]' : 'text-[#1C1F26]'}`}>
                    Quick Tip
                  </h4>
                  <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-[#B4B7BD]' : 'text-[#4E535E]'}`}>
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