import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { fetchFileChangeStats, fetchChangesByDate } from '../api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const FileChangeChart = () => {
  const [stats, setStats] = useState(null);
  const [changesByDate, setChangesByDate] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7'); // days

  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, dateData] = await Promise.all([
        fetchFileChangeStats(),
        fetchChangesByDate()
      ]);
      
      setStats(statsData);
      
      // Get last N days based on selected period
      const days = parseInt(selectedPeriod);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const filteredDates = dateData
        .filter(item => new Date(item.date) >= cutoffDate)
        .slice(-days)
        .reverse(); // Reverse to show newest first
      
      setChangesByDate(filteredDates);
    } catch (error) {
      console.error('Failed to load chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Safe defaults - handle both old and new response formats
  const totalChanges = stats?.totalChanges || stats?.total_changes || 0;
  const changesByEventType = stats?.changesByEventType || stats?.event_types || {};
  const changesByExtension = stats?.changesByExtension || stats?.changes_by_extension || {};
  const statsChangesByDate = stats?.changesByDate || {};

  if (!stats || totalChanges === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          📊 File Change Analytics
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No file changes recorded yet. Start watching folders to see analytics here.
        </p>
      </div>
    );
  }

  // Prepare data for charts with safe handling
  const eventTypeData = changesByEventType && typeof changesByEventType === 'object' && !Array.isArray(changesByEventType)
    ? Object.entries(changesByEventType)
        .filter(([_, value]) => value != null)
        .map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value: typeof value === 'number' ? value : 0
        }))
    : [];

  const topExtensionsData = changesByExtension && typeof changesByExtension === 'object' && !Array.isArray(changesByExtension)
    ? Object.entries(changesByExtension)
        .filter(([_, count]) => count != null)
        .sort(([_, a], [__, b]) => (b || 0) - (a || 0))
        .slice(0, 5)
        .map(([name, count]) => ({
          name: name || 'No extension',
          count: typeof count === 'number' ? count : 0
        }))
    : [];

  return (
    <div className="space-y-6">
      {/* Header with period selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
            📊 File Change Analytics
          </h2>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          >
            <option value="7">Last 7 days</option>
            <option value="14">Last 14 days</option>
            <option value="30">Last 30 days</option>
            <option value="365">Last year</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Total Changes</p>
            <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">
              {totalChanges}
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <p className="text-sm text-green-600 dark:text-green-400 mb-1">File Extensions</p>
            <p className="text-2xl font-bold text-green-800 dark:text-green-300">
              {changesByExtension && typeof changesByExtension === 'object' 
                ? Object.keys(changesByExtension).length 
                : 0}
            </p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">Event Types</p>
            <p className="text-2xl font-bold text-purple-800 dark:text-purple-300">
              {changesByEventType && typeof changesByEventType === 'object' 
                ? Object.keys(changesByEventType).length 
                : 0}
            </p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Event Types Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Changes by Event Type
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={eventTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {eventTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Changes Over Time */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Changes Over Time
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={changesByDate}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="date" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }} />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top File Extensions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Top File Extensions
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topExtensionsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }} />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Changes by Date (Bar Chart) */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Changes by Date
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={Object.entries(statsChangesByDate)
              .filter(([_, count]) => count != null)
              .sort(([a], [b]) => a.localeCompare(b))
              .slice(-10)
              .map(([date, count]) => ({
                date: date,
                count: typeof count === 'number' ? count : 0
              }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="date" stroke="#666" angle={-45} textAnchor="end" height={100} />
              <YAxis stroke="#666" />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }} />
              <Bar dataKey="count" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default FileChangeChart;

