# Tracer Internationalization (i18n) Guide

## Overview

Tracer supports multiple languages through a custom i18n system. Currently, English and Korean are supported.

## Supported Languages

- 🇺🇸 **English (en)** - Default language
- 🇰🇷 **한국어 (ko)** - Korean

## How to Use

### Language Selection

Click the language selector dropdown in the header to switch between languages.

### Adding Translations

All translations are stored in `src/i18n/translations.js`.

To add a new translation key:

1. Open `src/i18n/translations.js`
2. Add the key to both `en` and `ko` objects
3. Use the `t()` function in your component

Example:

```javascript
// translations.js
export const translations = {
  en: {
    myNewKey: "My New Text"
  },
  ko: {
    myNewKey: "새로운 텍스트"
  }
};

// Component
import { useLanguage } from '../contexts/LanguageContext';

const MyComponent = () => {
  const { t } = useLanguage();
  return <h1>{t('myNewKey')}</h1>;
};
```

## Adding a New Language

To add support for a new language:

1. Add the language object to `translations.js`:

```javascript
export const translations = {
  en: { /* ... */ },
  ko: { /* ... */ },
  fr: {  // Add French
    appTitle: "Traçeur",
    // ... other translations
  }
};
```

2. Add the language option to `LanguageSelector`:

```jsx
// src/components/LanguageSelector.jsx
<option value="fr">🇫🇷 Français</option>
```

## Language Persistence

The selected language is saved to `localStorage` and persists across sessions.

## Best Practices

1. **Use descriptive keys**: `userName` is better than `u1`
2. **Keep context**: `logEntryDelete` is better than `delete`
3. **Group related keys**: Use prefixes like `button_`, `label_`, `error_`
4. **Provide fallbacks**: Missing translations fall back to the key name

## Current Implementation

### Core Files

- `src/i18n/translations.js` - Translation data
- `src/contexts/LanguageContext.jsx` - Context provider
- `src/components/LanguageSelector.jsx` - Language switcher
- `src/main.jsx` - Provider setup

### Usage Example

```jsx
import { useLanguage } from '../contexts/LanguageContext';

function MyComponent() {
  const { t, language, changeLanguage } = useLanguage();
  
  return (
    <div>
      <h1>{t('appTitle')}</h1>
      <button onClick={() => changeLanguage('ko')}>한국어</button>
    </div>
  );
}
```

## Translation Coverage

Current coverage includes:
- ✅ Menu items
- ✅ Dashboard labels
- ✅ Command log interface
- ✅ Search and filters
- ✅ File watcher
- ✅ Common actions and buttons
- ⏳ Additional components in progress

## Contributing Translations

To contribute new translations:

1. Fork the repository
2. Add your translations to `translations.js`
3. Test thoroughly
4. Submit a pull request

Thank you for contributing! 🙏

