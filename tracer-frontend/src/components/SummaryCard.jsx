import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const SummaryCard = ({ summary, onReanalyze, isAnalyzing, date }) => {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          {t('aiSummary')}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReanalyze(date);
            }}
            disabled={isAnalyzing}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:bg-blue-400 transition-colors text-sm font-medium"
          >
            {isAnalyzing ? t('analyzing') : t('reanalyze')}
          </button>
          <svg 
            className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700">
          <p className="mt-4 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {summary || 'No summary available. Click "Reanalyze" to generate one.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default SummaryCard;

