import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import SummaryCard from './components/SummaryCard';
import LogEntry from './components/LogEntry';
import ThemeToggle from './components/ThemeToggle';
import FolderWatcher from './components/FolderWatcher';
import FileChangeChart from './components/FileChangeChart';
import FileChangeList from './components/FileChangeList';
import { fetchDates, fetchLogsByDate, analyzeLogs } from './api';

function App() {
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [activeTab, setActiveTab] = useState('logs'); // 'logs' or 'watcher'

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
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          dates={dates}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          isDark={isDark}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                AI Log Tracker
              </h1>
              <ThemeToggle onThemeChange={setIsDark} />
            </div>
            
            {/* Tabs */}
            <div className="flex space-x-1 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab('logs')}
                className={`px-4 py-2 font-medium text-sm transition-colors ${
                  activeTab === 'logs'
                    ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                📝 Command Logs
              </button>
              <button
                onClick={() => setActiveTab('watcher')}
                className={`px-4 py-2 font-medium text-sm transition-colors ${
                  activeTab === 'watcher'
                    ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                📁 File Watcher
              </button>
              <button
                onClick={() => setActiveTab('changes')}
                className={`px-4 py-2 font-medium text-sm transition-colors ${
                  activeTab === 'changes'
                    ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                🔄 File Changes
              </button>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'watcher' ? (
              <>
                <FolderWatcher />
                <div className="mt-8">
                  <FileChangeChart />
                </div>
              </>
            ) : activeTab === 'changes' ? (
              <FileChangeList />
            ) : selectedDate ? (
              <>
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
                    Command Logs
                    <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                      ({logs.length} {logs.length === 1 ? 'entry' : 'entries'})
                    </span>
                  </h2>

                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                  ) : logs.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      No log entries found for this date.
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
                Select a date from the sidebar to view logs
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;

