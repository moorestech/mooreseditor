import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { readTextFile } from '@tauri-apps/plugin-fs';
import * as path from '@tauri-apps/api/path';
import { useProject } from '../contexts/ProjectContext';

type JsonMap = Record<string, any>;

interface I18nContextType {
  language: string;
  availableLanguages: string[];
  setLanguage: (lang: string) => void;
  t: (key: string, fallback?: string) => string;
  tSchema: (schemaId: string, jsonPath: string, fallback?: string) => string;
  preloadSchema: (schemaId: string) => Promise<void>;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

function isDevEnv() {
  // Vite injects import.meta.env.DEV
  // eslint-disable-next-line no-undef
  return !!import.meta.env?.DEV;
}

async function safeReadJson(filePath: string): Promise<JsonMap> {
  try {
    const txt = await readTextFile(filePath);
    try {
      return JSON.parse(txt);
    } catch (e) {
      console.warn(`Invalid JSON in ${filePath}`);
      return {};
    }
  } catch (e) {
    return {};
  }
}

async function devFetchJson(devPath: string): Promise<JsonMap> {
  try {
    const res = await fetch(devPath);
    if (!res.ok) return {};
    return JSON.parse(await res.text());
  } catch (_) {
    return {};
  }
}

function getNested(json: JsonMap, jsonPath: string): any {
  if (!jsonPath) return undefined;
  const parts = jsonPath.split('.').filter(Boolean);
  let cur: any = json;
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in cur) {
      cur = cur[p];
    } else {
      return undefined;
    }
  }
  return cur;
}

function systemLangFallback(): string {
  const nav = typeof navigator !== 'undefined' ? navigator : undefined;
  const raw = (nav?.language || 'en').toLowerCase();
  if (raw.startsWith('ja')) return 'ja';
  if (raw.startsWith('en')) return 'en';
  return 'en';
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { i18nDir, availableLanguages } = useProject();
  const [language, setLanguage] = useState<string>(systemLangFallback());
  const [ui, setUi] = useState<{ current: JsonMap; en: JsonMap }>({ current: {}, en: {} });
  const [schemaCache, setSchemaCache] = useState<Record<string, { current: JsonMap; en: JsonMap }>>({});

  // Load UI translations for current language and fallback EN
  useEffect(() => {
    let mounted = true;
    async function loadUi() {
      const lang = language || 'en';
      if (!i18nDir) {
        setUi({ current: {}, en: {} });
        return;
      }
      if (isDevEnv()) {
        const current = await devFetchJson(`/src/sample/i18n/${lang}/ui.json`);
        const en = lang === 'en' ? current : await devFetchJson(`/src/sample/i18n/en/ui.json`);
        if (mounted) setUi({ current, en });
        return;
      }
      const uiPath = await path.join(i18nDir, lang, 'ui.json');
      const enPath = await path.join(i18nDir, 'en', 'ui.json');
      const [current, en] = await Promise.all([safeReadJson(uiPath), lang === 'en' ? safeReadJson(uiPath) : safeReadJson(enPath)]);
      if (mounted) setUi({ current, en });
    }
    loadUi();
    return () => { mounted = false; };
  }, [i18nDir, language]);

  const t = useMemo(() => {
    return (key: string, fallback?: string) => {
      const cur = key ? ui.current[key] : undefined;
      if (typeof cur === 'string') return cur;
      const def = key ? ui.en[key] : undefined;
      if (typeof def === 'string') return def;
      return fallback ?? key;
    };
  }, [ui]);

  async function preloadSchema(schemaId: string) {
    if (!schemaId) return;
    if (schemaCache[schemaId]) return;
    const lang = language || 'en';
    let current: JsonMap = {};
    let enMap: JsonMap = {};
    if (isDevEnv()) {
      current = await devFetchJson(`/src/sample/i18n/${lang}/schema/${schemaId}.json`);
      enMap = lang === 'en' ? current : await devFetchJson(`/src/sample/i18n/en/schema/${schemaId}.json`);
    } else if (i18nDir) {
      const curPath = await path.join(i18nDir, lang, 'schema', `${schemaId}.json`);
      const enPath = await path.join(i18nDir, 'en', 'schema', `${schemaId}.json`);
      current = await safeReadJson(curPath);
      enMap = lang === 'en' ? current : await safeReadJson(enPath);
    }
    setSchemaCache(prev => ({ ...prev, [schemaId]: { current: current || {}, en: enMap || {} } }));
  }

  const tSchema = useMemo(() => {
    return (schemaId: string, jsonPath: string, fallback?: string) => {
      if (!schemaId || !jsonPath) return fallback ?? '';
      const entry = schemaCache[schemaId];
      const cur = entry ? getNested(entry.current, jsonPath) : undefined;
      if (typeof cur === 'string') return cur;
      const def = entry ? getNested(entry.en, jsonPath) : undefined;
      if (typeof def === 'string') return def;
      return fallback ?? '';
    };
  }, [schemaCache]);

  const value: I18nContextType = {
    language,
    availableLanguages,
    setLanguage,
    t,
    tSchema,
    preloadSchema,
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

