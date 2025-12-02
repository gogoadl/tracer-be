import { useLanguage } from '../contexts/LanguageContext';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ onMenuSelect, activeMenu }) => {
  const { t } = useLanguage();
  const location = useLocation();
  
  const menuItems = [
    { id: 'dashboard', icon: '📊', labelKey: 'dashboard', path: '/dashboard' },
    { id: 'logs', icon: '📝', labelKey: 'logs', path: '/logs' },
    { id: 'watcher', icon: '📁', labelKey: 'watcher', path: '/watcher' },
    { id: 'changes', icon: '🔄', labelKey: 'changes', path: '/changes' },
    { id: 'config', icon: '⚙️', labelKey: 'config', path: '/config' },
  ];

  const isActive = (itemPath) => {
    if (itemPath === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname === itemPath;
  };

  return (
    <div className="w-64 min-h-screen bg-gray-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-4">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
        {t('appTitle')}
      </h1>
      
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => onMenuSelect(item.id)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 block ${
                active
                  ? 'bg-blue-600 text-white dark:bg-blue-600'
                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-750'
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              <div>
                <div className="font-medium text-sm">{t(item.labelKey).label}</div>
                <div className="text-xs opacity-75">{t(item.labelKey).name}</div>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;

