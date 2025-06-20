import { useState, useEffect, useCallback, useMemo } from 'react';
import * as path from "@tauri-apps/api/path";
import { readTextFile } from "@tauri-apps/plugin-fs";

import { ForeignKeyResolver, ForeignKeyOption } from '../utils/foreignKeyResolver';
import type { ForeignKeyConfig } from '../libs/schema/types';
import { getSampleJson } from "../utils/devFileSystem";

const isDev = import.meta.env.DEV;

interface ForeignKeyDataState {
  options: ForeignKeyOption[];
  loading: boolean;
  error: string | null;
}

// Cache for foreign data to avoid redundant fetches
const foreignDataCache = new Map<string, any>();

/**
 * Hook to fetch and manage foreign key data
 * @param config Foreign key configuration from schema
 * @param projectDir Current project directory
 * @param currentValue Current value of the foreign key field
 */
export function useForeignKeyData(
  config: ForeignKeyConfig | undefined,
  projectDir: string | null,
  currentValue: any
) {
  const [state, setState] = useState<ForeignKeyDataState>({
    options: [],
    loading: false,
    error: null
  });

  // Load foreign data
  const loadForeignData = useCallback(async () => {
    console.log('loadForeignData called:', { config, projectDir });
    
    if (!config) {
      console.log('loadForeignData: Missing config');
      return;
    }
    
    // In dev mode, use "SampleProject" if projectDir is not set
    const effectiveProjectDir = projectDir || (isDev ? "SampleProject" : null);
    
    if (!effectiveProjectDir) {
      console.log('loadForeignData: Missing projectDir');
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const cacheKey = `${effectiveProjectDir}/${config.schemaId}`;
      
      // Check cache first
      let foreignData = foreignDataCache.get(cacheKey);
      
      if (!foreignData) {
        console.log('Loading foreign data for:', config.schemaId);
        // Load from file system
        if (isDev && effectiveProjectDir === "SampleProject") {
          const jsonData = await getSampleJson(config.schemaId);
          console.log('Got sample json:', jsonData);
          if (!jsonData) {
            throw new Error(`Sample data not found for schema: ${config.schemaId}`);
          }
          foreignData = jsonData;
        } else {
          const jsonFilePath = await path.join(
            effectiveProjectDir,
            "master",
            `${config.schemaId}.json`
          );
          const fileContents = await readTextFile(jsonFilePath);
          foreignData = JSON.parse(fileContents);
        }
        
        // Cache the data
        foreignDataCache.set(cacheKey, foreignData);
      }

      // Create resolver and get options
      console.log('Creating ForeignKeyResolver with:', { foreignData, config });
      const resolver = new ForeignKeyResolver(foreignData, config);
      const options = resolver.getAllOptions();
      console.log('Resolver options:', options);
      
      setState({
        options,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error loading foreign key data:', error);
      setState({
        options: [],
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load foreign key data'
      });
    }
  }, [config, projectDir]);

  // Load data when config or projectDir changes
  useEffect(() => {
    loadForeignData();
  }, [loadForeignData]);

  // Get display value for current selection
  const displayValue = useMemo(() => {
    if (!currentValue || state.options.length === 0) {
      return null;
    }
    
    const option = state.options.find(opt => opt.id === currentValue);
    return option?.display || null;
  }, [currentValue, state.options]);

  // Refresh function to force reload data
  const refresh = useCallback(() => {
    if (config && projectDir) {
      const cacheKey = `${projectDir}/${config.schemaId}`;
      foreignDataCache.delete(cacheKey);
      loadForeignData();
    }
  }, [config, projectDir, loadForeignData]);

  return {
    options: state.options,
    loading: state.loading,
    error: state.error,
    displayValue,
    refresh
  };
}

/**
 * Clear all cached foreign data
 */
export function clearForeignDataCache() {
  foreignDataCache.clear();
}

/**
 * Clear specific cached foreign data
 */
export function clearForeignDataCacheForSchema(projectDir: string, schemaId: string) {
  const cacheKey = `${projectDir}/${schemaId}`;
  foreignDataCache.delete(cacheKey);
}