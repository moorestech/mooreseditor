import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { locale } from '@tauri-apps/plugin-os';

export class I18nManager {
  private static instance: I18nManager;
  private currentLanguage: string = 'en';
  private loadedResources: Map<string, Map<string, any>> = new Map();
  private projectI18nPath: string | null = null;
  
  private constructor() {}
  
  static getInstance(): I18nManager {
    if (!I18nManager.instance) {
      I18nManager.instance = new I18nManager();
    }
    return I18nManager.instance;
  }
  
  async initialize(projectI18nPath?: string): Promise<void> {
    this.projectI18nPath = projectI18nPath || null;
    
    // Get system language
    let systemLang = 'en';
    try {
      const systemLocale = await locale();
      if (systemLocale) {
        systemLang = systemLocale.split('-')[0].toLowerCase();
      }
    } catch (error) {
      console.warn('Failed to get system locale:', error);
    }
    
    // Check if user has a saved language preference
    const savedLang = localStorage.getItem('userLanguage');
    this.currentLanguage = savedLang || systemLang;
    
    // Initialize i18next
    await i18n
      .use(initReactI18next)
      .init({
        lng: this.currentLanguage,
        fallbackLng: 'en',
        debug: false,
        interpolation: {
          escapeValue: false
        },
        resources: {}
      });
    
    // Load UI translations for current language
    await this.loadUITranslations(this.currentLanguage);
    
    // Load UI translations for fallback language if different
    if (this.currentLanguage !== 'en') {
      await this.loadUITranslations('en');
    }
  }
  
  async loadUITranslations(language: string): Promise<void> {
    try {
      let translations: any;
      
      if (this.projectI18nPath) {
        // Try to load from project i18n path
        const { readTextFile } = await import('@tauri-apps/plugin-fs');
        const { join } = await import('@tauri-apps/api/path');
        
        try {
          const filePath = await join(this.projectI18nPath, language, 'ui.json');
          const content = await readTextFile(filePath);
          translations = JSON.parse(content);
        } catch (error) {
          console.warn(`Failed to load project UI translations for ${language}:`, error);
          // Fall back to embedded translations
          translations = await this.loadEmbeddedUITranslations(language);
        }
      } else {
        // Load embedded translations for development
        translations = await this.loadEmbeddedUITranslations(language);
      }
      
      if (translations) {
        i18n.addResourceBundle(language, 'ui', translations, true, true);
        
        // Store in cache
        if (!this.loadedResources.has(language)) {
          this.loadedResources.set(language, new Map());
        }
        this.loadedResources.get(language)!.set('ui', translations);
      }
    } catch (error) {
      console.error(`Failed to load UI translations for ${language}:`, error);
    }
  }
  
  private async loadEmbeddedUITranslations(language: string): Promise<any> {
    // Embedded default translations
    const translations: Record<string, any> = {
      en: {
        'menu.file': 'File',
        'menu.open': 'Open',
        'menu.save': 'Save',
        'menu.exit': 'Exit',
        'button.save': 'Save',
        'button.cancel': 'Cancel',
        'button.add': 'Add',
        'button.delete': 'Delete',
        'button.fileOpen': 'File Open',
        'message.saved': 'Data saved successfully',
        'message.saving': 'Saving...',
        'message.loading': 'Loading data...',
        'message.saveFailed': 'Failed to save data',
        'message.saveSkipped': 'Sample project - save skipped',
        'message.missingInfo': 'Required information is missing',
        'error.loadFailed': 'Failed to load file',
        'label.language': 'Language',
        'label.true': 'True',
        'label.false': 'False',
        'placeholder.selectValue': 'Select a value',
        'placeholder.enterValue': 'Enter value'
      },
      ja: {
        'menu.file': 'ファイル',
        'menu.open': '開く',
        'menu.save': '保存',
        'menu.exit': '終了',
        'button.save': '保存',
        'button.cancel': 'キャンセル',
        'button.add': '追加',
        'button.delete': '削除',
        'button.fileOpen': 'ファイルを開く',
        'message.saved': 'データを保存しました',
        'message.saving': '保存中...',
        'message.loading': 'データを読み込み中...',
        'message.saveFailed': 'データの保存に失敗しました',
        'message.saveSkipped': 'サンプルプロジェクトのため、保存はスキップされました',
        'message.missingInfo': '保存に必要な情報が不足しています',
        'error.loadFailed': 'ファイルの読み込みに失敗しました',
        'label.language': '言語',
        'label.true': '真',
        'label.false': '偽',
        'placeholder.selectValue': '値を選択',
        'placeholder.enterValue': '値を入力'
      }
    };
    
    return translations[language] || translations.en;
  }
  
  async loadSchemaTranslations(schemaPath: string, language?: string): Promise<void> {
    const lang = language || this.currentLanguage;
    
    try {
      if (!this.projectI18nPath) {
        // In development, return without loading schema translations
        return;
      }
      
      const { readTextFile } = await import('@tauri-apps/plugin-fs');
      const { join } = await import('@tauri-apps/api/path');
      
      // Convert schema path to translation path
      // e.g., "blocks" -> "schema/blocks.json"
      const translationPath = await join(
        this.projectI18nPath,
        lang,
        'schema',
        `${schemaPath}.json`
      );
      
      try {
        const content = await readTextFile(translationPath);
        const translations = JSON.parse(content);
        
        // Add to i18next resources
        const resourceKey = `schema.${schemaPath}`;
        i18n.addResourceBundle(lang, resourceKey, translations, true, true);
        
        // Store in cache
        if (!this.loadedResources.has(lang)) {
          this.loadedResources.set(lang, new Map());
        }
        this.loadedResources.get(lang)!.set(resourceKey, translations);
      } catch (error) {
        // Schema translations are optional, so we just log a warning
        console.warn(`Schema translations not found for ${schemaPath} in ${lang}`);
      }
      
      // Also load fallback language if different
      if (lang !== 'en' && this.projectI18nPath) {
        const fallbackPath = await join(
          this.projectI18nPath,
          'en',
          'schema',
          `${schemaPath}.json`
        );
        
        try {
          const content = await readTextFile(fallbackPath);
          const translations = JSON.parse(content);
          i18n.addResourceBundle('en', `schema.${schemaPath}`, translations, true, true);
        } catch (error) {
          // Fallback is also optional
          console.warn(`Schema translations not found for ${schemaPath} in en`);
        }
      }
    } catch (error) {
      console.error(`Failed to load schema translations for ${schemaPath}:`, error);
    }
  }
  
  async changeLanguage(language: string): Promise<void> {
    this.currentLanguage = language;
    localStorage.setItem('userLanguage', language);
    
    // Load UI translations if not already loaded
    if (!this.loadedResources.has(language)) {
      await this.loadUITranslations(language);
    }
    
    // Change i18next language
    await i18n.changeLanguage(language);
    
    // Reload schema translations for the new language
    for (const [lang, resources] of this.loadedResources.entries()) {
      for (const [key, _] of resources.entries()) {
        if (key.startsWith('schema.')) {
          const schemaPath = key.replace('schema.', '');
          await this.loadSchemaTranslations(schemaPath, language);
        }
      }
    }
  }
  
  getCurrentLanguage(): string {
    return this.currentLanguage;
  }
  
  getAvailableLanguages(): string[] {
    // For now, return hardcoded list
    // In production, this should scan the i18n directory
    return ['en', 'ja'];
  }
  
  // Helper function to translate schema properties
  translateSchemaProperty(
    schemaPath: string,
    propertyPath: string,
    propertyType: 'title' | 'description' | 'placeholder' | 'enum',
    enumValue?: string
  ): string {
    const key = propertyType === 'enum' && enumValue
      ? `schema.${schemaPath}:${propertyPath}.enum.${enumValue}`
      : `schema.${schemaPath}:${propertyPath}.${propertyType}`;
    
    const translated = i18n.t(key);
    
    // If translation not found, return the original value or property name
    if (translated === key) {
      if (propertyType === 'enum' && enumValue) {
        return enumValue;
      }
      // Extract last part of property path as fallback
      const parts = propertyPath.split('.');
      return parts[parts.length - 1];
    }
    
    return translated;
  }
}

// Export singleton instance
export const i18nManager = I18nManager.getInstance();

// Export i18n instance for use with react-i18next hooks
export default i18n;