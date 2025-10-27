import { useState, useEffect } from 'react';
import { fetchWatchFolders, addWatchFolder, removeWatchFolder, toggleWatchFolder } from '../api';

const FolderWatcher = () => {
  const [folders, setFolders] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    path: '',
    filePatterns: '',
    recursive: true
  });

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    try {
      const data = await fetchWatchFolders();
      setFolders(data);
    } catch (error) {
      console.error('Failed to load folders:', error);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await addWatchFolder(
        formData.path,
        formData.filePatterns || undefined,
        formData.recursive
      );
      await loadFolders();
      setFormData({ path: '', filePatterns: '', recursive: true });
      setIsAdding(false);
    } catch (error) {
      alert('Failed to add folder: ' + error.message);
    }
  };

  const handleRemove = async (folderId) => {
    if (!confirm('Remove this folder from watch list?')) return;
    
    try {
      await removeWatchFolder(folderId);
      await loadFolders();
    } catch (error) {
      alert('Failed to remove folder: ' + error.message);
    }
  };

  const handleToggle = async (folderId) => {
    try {
      await toggleWatchFolder(folderId);
      await loadFolders();
    } catch (error) {
      alert('Failed to toggle folder: ' + error.message);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
          📁 Watched Folders
        </h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {isAdding ? 'Cancel' : '+ Add Folder'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Folder Path
            </label>
            <input
              type="text"
              value={formData.path}
              onChange={(e) => setFormData({ ...formData, path: e.target.value })}
              placeholder="C:\path\to\folder or /home/user/folder"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              required
            />
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              File Patterns (optional)
            </label>
            <input
              type="text"
              value={formData.filePatterns}
              onChange={(e) => setFormData({ ...formData, filePatterns: e.target.value })}
              placeholder="*.yml,*.conf,*.json"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Comma-separated patterns (e.g., docker-compose.yml, nginx.conf)
            </p>
          </div>

          <div className="mb-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.recursive}
                onChange={(e) => setFormData({ ...formData, recursive: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Watch subdirectories</span>
            </label>
          </div>

          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Add Folder
          </button>
        </form>
      )}

      <div className="space-y-2">
        {folders.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            No folders being watched. Add a folder to start monitoring file changes.
          </p>
        ) : (
          folders.map((folder) => (
            <div
              key={folder.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                      {folder.path}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        folder.is_active === 'True'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                      }`}
                    >
                      {folder.is_active === 'True' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  {folder.file_patterns && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Patterns: {folder.file_patterns}
                    </p>
                  )}
                  
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Recursive: {folder.recursive === 'True' ? 'Yes' : 'No'}
                  </p>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleToggle(folder.id)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      folder.is_active === 'True'
                        ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:hover:bg-yellow-800 dark:text-yellow-200'
                        : 'bg-green-100 hover:bg-green-200 text-green-800 dark:bg-green-900 dark:hover:bg-green-800 dark:text-green-200'
                    }`}
                  >
                    {folder.is_active === 'True' ? 'Pause' : 'Resume'}
                  </button>
                  
                  <button
                    onClick={() => handleRemove(folder.id)}
                    className="px-3 py-1 rounded text-sm bg-red-100 hover:bg-red-200 text-red-800 dark:bg-red-900 dark:hover:bg-red-800 dark:text-red-200 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FolderWatcher;

