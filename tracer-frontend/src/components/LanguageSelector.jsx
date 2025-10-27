import { useLanguage } from '../contexts/LanguageContext';

const LanguageSelector = () => {
  const { language, changeLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <select
        value={language}
        onChange={(e) => changeLanguage(e.target.value)}
        className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="en">🇺🇸 English</option>
        <option value="ko">🇰🇷 한국어</option>
      </select>
    </div>
  );
};

export default LanguageSelector;

