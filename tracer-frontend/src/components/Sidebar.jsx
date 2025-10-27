import { useLanguage } from '../contexts/LanguageContext';

const Sidebar = ({ onMenuSelect, activeMenu }) => {
  const { t } = useLanguage();
  
  const menuItems = [
    { id: 'dashboard', icon: '📊', labelKey: 'dashboard' },
    { id: 'logs', icon: '📝', labelKey: 'logs' },
    { id: 'watcher', icon: '📁', labelKey: 'watcher' },
    { id: 'changes', icon: '🔄', labelKey: 'changes' },
    { id: 'config', icon: '⚙️', labelKey: 'config' },
  ];

  return (
    <div className="w-64 min-h-screen bg-gray-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-4">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
        {t('appTitle')}
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
              <div className="font-medium text-sm">{t(item.labelKey).label}</div>
              <div className="text-xs opacity-75">{t(item.labelKey).name}</div>
            </div>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;

