import { Select } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { i18nManager } from '../i18n';

export function LanguageSelector() {
  const { t } = useTranslation('ui');
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [availableLanguages, setAvailableLanguages] = useState<Array<{ value: string; label: string }>>([]);

  useEffect(() => {
    // Get current language and available languages
    setCurrentLanguage(i18nManager.getCurrentLanguage());
    
    // Set available languages with labels
    const languages = i18nManager.getAvailableLanguages();
    setAvailableLanguages(languages.map(lang => ({
      value: lang,
      label: getLanguageLabel(lang)
    })));
  }, []);

  const getLanguageLabel = (lang: string): string => {
    switch (lang) {
      case 'en':
        return 'English';
      case 'ja':
        return '日本語';
      default:
        return lang.toUpperCase();
    }
  };

  const handleLanguageChange = async (value: string | null) => {
    if (value && value !== currentLanguage) {
      await i18nManager.changeLanguage(value);
      setCurrentLanguage(value);
      // Force re-render of the entire app
      window.location.reload();
    }
  };

  return (
    <Select
      label={t('label.language')}
      value={currentLanguage}
      onChange={handleLanguageChange}
      data={availableLanguages}
      size="sm"
      style={{ width: 150 }}
    />
  );
}