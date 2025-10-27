import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import CustomSelect from './CustomSelect';

const LogFilters = ({ onFilterChange, users, directories }) => {
  const { t } = useLanguage();
  const [filters, setFilters] = useState({
    user: '',
    search: '',
    directory: ''
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    const emptyFilters = { user: '', search: '', directory: '' };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          🔍 {t('searchAndFilters')}
        </h3>
        {(filters.user || filters.search || filters.directory) && (
          <button
            onClick={handleClearFilters}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            {t('clearFilters')}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* User Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            👤 {t('user')}
          </label>
          {users && users.length > 0 ? (
            <CustomSelect
              options={[{ value: '', label: t('allUsers') }, ...users.map(user => ({ value: user, label: user }))]}
              value={filters.user}
              onChange={(value) => handleFilterChange('user', value)}
              placeholder={t('allUsers')}
              searchable={true}
              className="w-full"
            />
          ) : (
            <input
              type="text"
              value={filters.user}
              onChange={(e) => handleFilterChange('user', e.target.value)}
              placeholder={t('searchCommands')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          )}
        </div>

        {/* Search Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            🔎 {t('search')}
          </label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder={t('searchCommands')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Directory Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            📁 {t('directory')}
          </label>
          {directories && directories.length > 0 ? (
            <CustomSelect
              options={[
                { value: '', label: t('allDirectories') },
                ...directories.map(dir => ({ value: dir, label: dir.length > 40 ? '...' + dir.slice(-37) : dir }))
              ]}
              value={filters.directory}
              onChange={(value) => handleFilterChange('directory', value)}
              placeholder={t('allDirectories')}
              searchable={true}
              className="w-full"
            />
          ) : (
            <input
              type="text"
              value={filters.directory}
              onChange={(e) => handleFilterChange('directory', e.target.value)}
              placeholder={t('searchCommands')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {(filters.user || filters.search || filters.directory) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.user && (
            <span               className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                {t('user')}: {filters.user}
              <button
                onClick={() => handleFilterChange('user', '')}
                className="ml-2 hover:text-blue-900 dark:hover:text-blue-100"
              >
                ✕
              </button>
            </span>
          )}
          {filters.search && (
            <span               className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                {t('search')}: {filters.search}
              <button
                onClick={() => handleFilterChange('search', '')}
                className="ml-2 hover:text-green-900 dark:hover:text-green-100"
              >
                ✕
              </button>
            </span>
          )}
          {filters.directory && (
            <span               className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                {t('directory')}: {filters.directory.length > 30 ? '...' + filters.directory.slice(-27) : filters.directory}
              <button
                onClick={() => handleFilterChange('directory', '')}
                className="ml-2 hover:text-purple-900 dark:hover:text-purple-100"
              >
                ✕
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default LogFilters;

