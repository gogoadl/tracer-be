import { useLanguage } from '../contexts/LanguageContext';
import CustomSelect from './CustomSelect';

const LanguageSelector = () => {
  const { language, changeLanguage } = useLanguage();

  const languageOptions = [
    { value: 'en', label: '🇺🇸 English' },
    { value: 'ko', label: '🇰🇷 한국어' }
  ];

  return (
    <CustomSelect
      options={languageOptions}
      value={language}
      onChange={changeLanguage}
      className="w-40"
    />
  );
};

export default LanguageSelector;

