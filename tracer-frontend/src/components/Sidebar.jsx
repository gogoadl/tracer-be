const Sidebar = ({ onMenuSelect, activeMenu }) => {
  const menuItems = [
    { id: 'dashboard', icon: '📊', label: '대시보드', name: 'Dashboard' },
    { id: 'logs', icon: '📝', label: '커맨드 로그', name: 'Command Logs' },
    { id: 'watcher', icon: '📁', label: '파일 워처', name: 'File Watcher' },
    { id: 'changes', icon: '🔄', label: '파일 변경사항', name: 'File Changes' },
  ];

  return (
    <div className="w-64 min-h-screen bg-gray-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-4">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
        Tracer
      </h1>
      
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onMenuSelect(item.id)}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
              activeMenu === item.id
                ? 'bg-blue-600 text-white dark:bg-blue-600'
                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-750'
            }`}
          >
            <span className="text-2xl">{item.icon}</span>
            <div>
              <div className="font-medium text-sm">{item.label}</div>
              <div className="text-xs opacity-75">{item.name}</div>
            </div>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;

