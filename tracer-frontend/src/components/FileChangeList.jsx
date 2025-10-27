import { useState, useEffect } from 'react';
import FileDiffView from './FileDiffView';
import { fetchFileChanges } from '../api';

const FileChangeList = () => {
  const [changes, setChanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadChanges();
  }, []);

  const loadChanges = async () => {
    try {
      setLoading(true);
      const data = await fetchFileChanges({ limit: 50 });
      setChanges(data.changes || []);
    } catch (err) {
      console.error('Failed to load file changes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-800 dark:text-red-200">Error: {error}</p>
      </div>
    );
  }

  if (changes.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          No file changes detected yet. Modify files in watched folders to see changes here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
          Recent File Changes
        </h2>
        <button
          onClick={loadChanges}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {changes.map((change) => (
          <div
            key={change.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
          >
            <div className="mb-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                    {change.file_name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {change.directory}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {formatDate(change.timestamp)}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded text-xs font-medium ${
                  change.event_type === 'modified' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  change.event_type === 'created' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  change.event_type === 'deleted' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                }`}>
                  {change.event_type.toUpperCase()}
                </span>
              </div>
            </div>

            <FileDiffView change={change} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileChangeList;

