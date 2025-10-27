import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { fetchDates, fetchLogsByDate } from '../api';

const CommandLogChart = () => {
  const [logData, setLogData] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7'); // days

  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch dates
      const dates = await fetchDates();
      
      // Get last N days based on selected period
      const days = parseInt(selectedPeriod);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const filteredDates = dates
        .filter(date => new Date(date) >= cutoffDate)
        .slice(-days);

      // Fetch logs for each date
      const logsByDate = [];
      for (const date of filteredDates) {
        try {
          const data = await fetchLogsByDate(date);
          logsByDate.push({
            date,
            count: data.entries.length
          });

          // Calculate hourly distribution (use first date's data as sample)
          if (logsByDate.length === 1 && data.entries.length > 0) {
            const hourlyCount = {};
            data.entries.forEach(entry => {
              const hour = new Date(entry.timestamp).getHours();
              hourlyCount[hour] = (hourlyCount[hour] || 0) + 1;
            });
            
            const hourlyArray = Array.from({ length: 24 }, (_, i) => ({
              hour: `${i}:00`,
              count: hourlyCount[i] || 0
            }));
            
            setHourlyData(hourlyArray);
          }
        } catch (error) {
          console.error(`Error fetching logs for ${date}:`, error);
        }
      }

      setLogData(logsByDate);
    } catch (error) {
      console.error('Failed to load log data:', error);
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

  if (!logData || logData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          📊 Command Log Analytics
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No command logs recorded yet.
        </p>
      </div>
    );
  }

  const totalCommands = logData.reduce((sum, item) => sum + item.count, 0);
  const avgPerDay = totalCommands / logData.length || 0;

  return (
    <div className="space-y-6">
      {/* Header with period selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
            📊 Command Log Analytics
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Total Commands</p>
            <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">
              {totalCommands}
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <p className="text-sm text-green-600 dark:text-green-400 mb-1">Avg per Day</p>
            <p className="text-2xl font-bold text-green-800 dark:text-green-300">
              {avgPerDay.toFixed(1)}
            </p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Commands Over Time */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Commands Over Time
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={logData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="date" 
                stroke="#666"
                tick={{ fontSize: 12 }}
              />
              <YAxis stroke="#666" />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }} />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#0088FE" strokeWidth={2} name="Commands" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Commands by Hour */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Commands by Hour of Day
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="hour" 
                stroke="#666" 
                angle={-45} 
                textAnchor="end" 
                height={80}
                tick={{ fontSize: 10 }}
              />
              <YAxis stroke="#666" />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }} />
              <Bar dataKey="count" fill="#00C49F" name="Commands" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default CommandLogChart;

