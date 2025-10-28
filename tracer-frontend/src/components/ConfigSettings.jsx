import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAlert } from './AlertContext';

const ConfigSettings = () => {
  const { t } = useLanguage();
  const { success: showSuccess, error: showError } = useAlert();
  const [config, setConfig] = useState(null);
  const [newPath, setNewPath] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/config');
      const data = await response.json();
      setConfig(data);
      setNewPath(data.command_history_path || '');
    } catch (error) {
      console.error('Error loading config:', error);
    }
  };

  const handleSaveConfig = async () => {
    if (!newPath.trim()) {
      setMessage('Please enter a valid path');
      setMessageType('error');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command_history_path: newPath
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage(data.message);
        setMessageType('success');
        await loadConfig();
      } else {
        setMessage(data.detail || 'Failed to update configuration');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Failed to save configuration');
      setMessageType('error');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleReloadLogs = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      // First, refresh config to get latest path
      await loadConfig();
      
      // Then reload logs
      const response = await fetch('/api/reload-logs', {
        method: 'POST',
      });

      const data = await response.json();
      
      if (response.ok) {
        showSuccess('Logs reloaded successfully');
        
        // Reload config again to get updated status
        await loadConfig();
        
        // Notify parent to reload logs
        window.dispatchEvent(new CustomEvent('logsReloaded'));
      } else {
        showError(data.detail || 'Failed to reload logs');
      }
    } catch (error) {
      showError('Failed to reload logs: ' + error.message);
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleTestPath = async () => {
    if (!newPath.trim()) return;

    try {
      // Test if path exists
      const response = await fetch('/api/config');
      const data = await response.json();
      
      // Update config temporarily to test
      await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command_history_path: newPath
        }),
      });

      await loadConfig();
      
      if (config?.command_history_exists) {
        setMessage('Path is valid and file exists');
        setMessageType('success');
      } else {
        setMessage('Path configured but file does not exist');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Failed to test path');
      setMessageType('error');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  if (!config) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
          ⚙️ Configuration Settings
        </h2>

        {/* Message Display */}
        {message && (
          <div className={`mb-4 p-4 rounded-lg ${
            messageType === 'success' 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
          }`}>
            {message}
          </div>
        )}

        {/* Current Configuration */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Current Configuration
          </h3>
          
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Log File Path:
              </span>
              <span className="text-sm font-mono text-gray-900 dark:text-gray-100 bg-gray-200 dark:bg-gray-800 px-3 py-1 rounded">
                {config.command_history_path}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  File Status:
              </span>
              <span className={`text-sm font-medium px-3 py-1 rounded ${
                config.command_history_exists
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
              }`}>
                {config.command_history_exists ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>

        {/* Update Configuration */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Update Configuration
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Command Log File Path
              </label>
              <input
                type="text"
                value={newPath}
                onChange={(e) => setNewPath(e.target.value)}
                placeholder="/path/to/.command_log.jsonl"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Full path to the command log file (e.g., ~/.command_log.jsonl)
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Supported formats: .command_log.jsonl (JSON Lines) or .command_history (plain text)
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleTestPath}
                disabled={loading || !newPath.trim()}
                className="px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg disabled:opacity-50 transition-colors font-medium"
              >
                Test Path
              </button>
              
              <button
                onClick={handleSaveConfig}
                disabled={loading || !newPath.trim()}
                className="flex-1 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:bg-blue-400 transition-colors font-medium"
              >
                {loading ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/30 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
            ⚠️ After changing the configuration:
          </h4>
          <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1 list-disc list-inside">
            <li>Click "Reload Logs" to load data from the new path</li>
            <li>Or restart the backend server completely</li>
          </ul>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={handleReloadLogs}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:bg-green-400 transition-colors font-medium text-center"
          >
            {loading ? 'Reloading...' : '🔄 Reload Logs from File'}
          </button>
        </div>

        {/* Restart Notice */}
        <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/30 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
            ℹ️ Note:
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-400">
            To apply configuration changes permanently, you may need to restart the backend server.
            Reload Logs will immediately load data from the configured path.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConfigSettings;

