import { useMemo } from 'react';

import { ForeignKeyResolver } from '../utils/foreignKeyResolver';

import type { Column } from './useJson';
import type { ForeignKeyConfig } from '../libs/schema/types';
import type { ForeignKeyOption } from '../utils/foreignKeyResolver';

// Overloaded function signatures
export function useForeignKeyData(
  config: ForeignKeyConfig | undefined,
  projectDirOrJsonData: string | null | Column[],
  currentValue: any
): {
  options: ForeignKeyOption[];
  loading: boolean;
  error: string | null;
  displayValue: string | null;
} {
  // Check if the second parameter is jsonData (Column[])
  const isJsonData = Array.isArray(projectDirOrJsonData);
  
  if (isJsonData) {
    const jsonData = projectDirOrJsonData as Column[];
    
    // Get options from jsonData
    const options = useMemo(() => {
      if (!config || !jsonData) {
        return [];
      }

      // Find the column with matching schemaId
      const column = jsonData.find(col => col.title === config.schemaId);
      if (!column) {
        console.warn(`Foreign key data not found for schema: ${config.schemaId}`);
        return [];
      }

      // Create resolver and get options
      // The column.data is already the actual data array
      const foreignData = column.data;
      
      console.log('Creating ForeignKeyResolver with:', { foreignData, config });
      const resolver = new ForeignKeyResolver(foreignData, config);
      const resolvedOptions = resolver.getAllOptions();
      console.log('Resolver options:', resolvedOptions);
      
      return resolvedOptions;
    }, [config, jsonData]);

    // Get display value for current selection
    const displayValue = useMemo(() => {
      if (!currentValue || options.length === 0) {
        return null;
      }
      
      const option = options.find(opt => opt.id === currentValue);
      return option?.display || null;
    }, [currentValue, options]);

    return {
      options,
      loading: false,
      error: null,
      displayValue
    };
  } else {
    // Legacy implementation for TableView (temporarily kept for backward compatibility)
    // This will be removed once TableView is updated
    return {
      options: [],
      loading: false,
      error: 'Legacy mode not implemented',
      displayValue: null
    };
  }
}

