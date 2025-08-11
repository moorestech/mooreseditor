import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { i18nManager } from '../i18n';

export function useI18n() {
  const { t, i18n } = useTranslation();
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  
  useEffect(() => {
    setAvailableLanguages(i18nManager.getAvailableLanguages());
    setCurrentLanguage(i18nManager.getCurrentLanguage());
  }, []);
  
  const changeLanguage = async (language: string) => {
    await i18nManager.changeLanguage(language);
    setCurrentLanguage(language);
  };
  
  const loadSchemaTranslations = async (schemaPath: string) => {
    await i18nManager.loadSchemaTranslations(schemaPath);
  };
  
  const translateSchemaProperty = (
    schemaPath: string,
    propertyPath: string,
    propertyType: 'title' | 'description' | 'placeholder' | 'enum',
    enumValue?: string
  ): string => {
    return i18nManager.translateSchemaProperty(schemaPath, propertyPath, propertyType, enumValue);
  };
  
  return {
    t,
    i18n,
    currentLanguage,
    availableLanguages,
    changeLanguage,
    loadSchemaTranslations,
    translateSchemaProperty
  };
}