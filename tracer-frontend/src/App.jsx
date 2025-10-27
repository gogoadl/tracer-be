import { useState, useEffect } from 'react';
import { useLanguage } from './contexts/LanguageContext';
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
import { fetchDates, fetchLogsByDate, fetchLogsWithFilters, analyzeLogs, fetchLogFilterOptions } from './api';

function App() {
  const { t, language } = useLanguage();
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard'); // 'dashboard', 'logs', 'watcher', 'changes'
  const [filterOptions, setFilterOptions] = useState({ users: [], directories: [] });
  const [activeFilters, setActiveFilters] = useState({ user: '', search: '', directory: '' });
  const [searchFilters, setSearchFilters] = useState(null);
  const [searchResultTotal, setSearchResultTotal] = useState(0);

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
          onMenuSelect={setActiveMenu}
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
                  <select
                    value={selectedDate || ''}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 w-full md:w-64"
                  >
                    <option value="">{language === 'en' ? 'Select a date...' : '날짜를 선택하세요...'}</option>
                    {dates.map(date => (
                      <option key={date} value={date}>{date}</option>
                    ))}
                  </select>
                </div>

                {selectedDate ? (
                  <>
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
            ) : null}
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;

