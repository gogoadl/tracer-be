const LogEntry = ({ entry, index }) => {
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="border-l-4 border-blue-500 dark:border-blue-400 mb-4 pl-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-r-lg">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
            Entry #{index + 1}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatDate(entry.timestamp)}
          </span>
        </div>
      </div>
      
      <div className="mb-2">
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 mr-2">
          Directory:
        </span>
        <span className="text-sm text-gray-900 dark:text-gray-100 font-mono bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">
          {entry.working_directory || 'N/A'}
        </span>
      </div>
      
      <div className="mt-3">
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-1">
          Command:
        </span>
        <code className="text-sm text-gray-900 dark:text-gray-100 bg-gray-200 dark:bg-gray-800 px-3 py-2 rounded block whitespace-pre-wrap break-all">
          {entry.command}
        </code>
      </div>
    </div>
  );
};

export default LogEntry;

