import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from './contexts/LanguageContext';
import { useAlert } from './components/AlertContext';
import Sidebar from './components/Sidebar';
import SummaryCard from './components/SummaryCard';
import LogEntry from './components/LogEntry';
import ThemeToggle from './components/ThemeToggle';
import LanguageSelector from './components/LanguageSelector';
import FolderWatcher from './components/FolderWatcher';
import FileChangeChart from './components/FileChangeChart';
import FileChangeList from './components/FileChangeList';
import CommandLogChart from './components/CommandLogChart';
import LogFilters from './components/LogFilters';
import ConfigSettings from './components/ConfigSettings';
import CustomSelect from './components/CustomSelect';
import { fetchDates, fetchLogsByDate, fetchLogsWithFilters, analyzeLogs, fetchLogFilterOptions, refreshLogsFromFile } from './api';

function App() {
  const { t, language } = useLanguage();
  const { success: showSuccess, error: showError } = useAlert();
  const location = useLocation();
  const navigate = useNavigate();
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDark, setIsDark] = useState(false);
  
  // Get active menu from URL path
  const getActiveMenuFromPath = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') return 'dashboard';
    if (path === '/logs') return 'logs';
    if (path === '/watcher') return 'watcher';
    if (path === '/changes') return 'changes';
    if (path === '/config') return 'config';
    return 'dashboard'; // default
  };
  
  const [activeMenu, setActiveMenu] = useState(getActiveMenuFromPath());
  const [filterOptions, setFilterOptions] = useState({ users: [], directories: [] });
  const [activeFilters, setActiveFilters] = useState({ user: '', search: '', directory: '' });
  const [searchFilters, setSearchFilters] = useState(null);
  const [searchResultTotal, setSearchResultTotal] = useState(0);
  
  // Update active menu when URL changes
  useEffect(() => {
    const menu = getActiveMenuFromPath();
    setActiveMenu(menu);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Set theme on mount and change
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Fetch available dates on mount
  useEffect(() => {
    loadDates();
    loadFilterOptions();
  }, []);

  // Listen for logs reloaded event
  useEffect(() => {
    const handleLogsReloaded = () => {
      reloadLogsAfterConfig();
    };
    
    window.addEventListener('logsReloaded', handleLogsReloaded);
    return () => window.removeEventListener('logsReloaded', handleLogsReloaded);
  }, [selectedDate]);

  const loadFilterOptions = async () => {
    try {
      const options = await fetchLogFilterOptions();
      setFilterOptions(options);
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  // Fetch logs when date is selected
  useEffect(() => {
    if (selectedDate) {
      loadLogs(selectedDate);
    }
  }, [selectedDate]);

  const loadDates = async () => {
    try {
      setIsLoading(true);
      const datesData = await fetchDates();
      setDates(datesData);
      if (datesData.length > 0 && !selectedDate) {
        setSelectedDate(datesData[0]);
      }
    } catch (error) {
      console.error('Error loading dates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLogs = async (date) => {
    try {
      setIsLoading(true);
      const logsData = await fetchLogsByDate(date);
      setLogs(logsData.entries || []);
      setSummary(logsData.summary || '');
    } catch (error) {
      console.error('Error loading logs:', error);
      setLogs([]);
      setSummary('');
    } finally {
      setIsLoading(false);
    }
  };

  const reloadLogsAfterConfig = async () => {
    try {
      await loadDates();
      if (selectedDate) {
        await loadLogs(selectedDate);
      }
    } catch (error) {
      console.error('Error reloading after config:', error);
    }
  };

  const handleReloadLogs = async () => {
    try {
      setIsLoading(true);
      const result = await refreshLogsFromFile();
      showSuccess(result?.message || 'Logs reloaded successfully');
      
      // Reload dates and current logs
      await loadDates();
      if (selectedDate) {
        await loadLogs(selectedDate);
      }
    } catch (error) {
      console.error('Error reloading logs:', error);
      showError(error.response?.data?.detail || 'Failed to reload logs from file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReanalyze = async (date) => {
    try {
      setIsAnalyzing(true);
      const result = await analyzeLogs(date);
      setSummary(result.summary || '');
      // Reload logs to get updated summary
      await loadLogs(date);
    } catch (error) {
      console.error('Error analyzing logs:', error);
      alert('Failed to reanalyze logs. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFilterChange = async (filters) => {
    setActiveFilters(filters);
    
    // If a date is selected, re-fetch logs with filters
    if (selectedDate) {
      try {
        setIsLoading(true);
        const { fetchLogsWithFilters } = await import('./api');
        const response = await fetchLogsWithFilters({
          ...filters,
          start_date: selectedDate,
          end_date: selectedDate
        });
        setLogs(response.logs || []);
      } catch (error) {
        console.error('Error loading filtered logs:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSearch = async (filters) => {
    setSearchFilters(filters);
    setIsLoading(true);
    try {
      const result = await fetchLogsWithFilters(filters);
      setLogs(result.logs || []);
      setSearchResultTotal(result.total || 0);
    } catch (error) {
      console.error('Error searching logs:', error);
      setLogs([]);
      setSearchResultTotal(0);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          onMenuSelect={(menuId) => {
            setActiveMenu(menuId);
            // Navigate to the corresponding route
            const routes = {
              'dashboard': '/dashboard',
              'logs': '/logs',
              'watcher': '/watcher',
              'changes': '/changes',
              'config': '/config'
            };
            navigate(routes[menuId] || '/dashboard');
          }}
          activeMenu={activeMenu}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {t('appTitle')}
              </h1>
              <div className="flex items-center gap-3">
                <LanguageSelector />
                <ThemeToggle onThemeChange={setIsDark} />
              </div>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 p-6 overflow-y-auto">
            {activeMenu === 'dashboard' ? (
              <div className="space-y-8">
                <CommandLogChart />
                <FileChangeChart />
              </div>
            ) : activeMenu === 'logs' ? (
              <>
                {/* Date Selector */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('selectDate')}
                  </label>
                  <CustomSelect
                    options={dates.map(date => ({ value: date, label: date }))}
                    value={selectedDate || ''}
                    onChange={setSelectedDate}
                    placeholder={language === 'en' ? 'Select a date...' : '날짜를 선택하세요...'}
                    searchable={true}
                    icon="📅"
                    className="w-full md:w-80"
                  />
                </div>

                {selectedDate ? (
                  <>
                    {/* Reload Button */}
                    <div className="mb-4 flex justify-end">
                      <button
                        onClick={handleReloadLogs}
                        disabled={isLoading}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:bg-green-400 transition-colors font-medium text-sm"
                      >
                        {isLoading ? '⏳ Reloading...' : '🔄 Reload from File'}
                      </button>
                    </div>

                    {/* Filters */}
                    <LogFilters
                      onFilterChange={handleFilterChange}
                      users={filterOptions.users}
                      directories={filterOptions.directories}
                    />

                    {/* Summary Card */}
                    <SummaryCard
                      summary={summary}
                      onReanalyze={handleReanalyze}
                      isAnalyzing={isAnalyzing}
                      date={selectedDate}
                    />

                    {/* Log Entries */}
                    <div className="mb-8">
                      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                        {t('commandLogs')}
                        <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                          ({logs.length} {logs.length === 1 ? t('entry') : t('entries')})
                        </span>
                      </h2>

                      {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                      ) : logs.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                          {t('noLogsFound')}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {logs.map((entry, index) => (
                            <LogEntry key={index} entry={entry} index={index} />
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    {t('selectDateToView')}
                  </div>
                )}
              </>
            ) : activeMenu === 'watcher' ? (
              <FolderWatcher />
            ) : activeMenu === 'changes' ? (
              <FileChangeList />
            ) : activeMenu === 'config' ? (
              <ConfigSettings />
            ) : null}
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;

