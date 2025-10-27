const Sidebar = ({ dates, selectedDate, onSelectDate, isDark }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="w-64 min-h-screen bg-gray-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
        📋 Log Dates
      </h1>
      
      {dates.length === 0 ? (
        <div className="text-gray-500 dark:text-gray-400 text-center py-8">
          No log dates available
        </div>
      ) : (
        <div className="space-y-2">
          {dates.map((date) => (
            <button
              key={date}
              onClick={() => onSelectDate(date)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                selectedDate === date
                  ? 'bg-blue-600 text-white dark:bg-blue-600'
                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-750'
              }`}
            >
              <div className="font-medium">{formatDate(date)}</div>
              <div className="text-xs mt-1 opacity-75">{date}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sidebar;

