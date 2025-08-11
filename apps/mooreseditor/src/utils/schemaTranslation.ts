import i18n from '../i18n';

export interface TranslationContext {
  schemaPath?: string;
  propertyPath: string[];
}

export function getSchemaTranslation(
  context: TranslationContext,
  type: 'title' | 'description' | 'placeholder',
  fallback?: string
): string {
  if (!context.schemaPath) {
    return fallback || '';
  }

  const pathKey = context.propertyPath.join('.');
  const translationKey = `schema.${context.schemaPath}:${pathKey ? `properties.${pathKey}.${type}` : type}`;
  
  const translated = i18n.t(translationKey);
  
  // If translation not found, return fallback
  if (translated === translationKey) {
    if (fallback) return fallback;
    // Return the last part of the property path as fallback
    return context.propertyPath[context.propertyPath.length - 1] || '';
  }
  
  return translated;
}

export function getEnumTranslation(
  context: TranslationContext,
  enumValue: string,
  fallback?: string
): string {
  if (!context.schemaPath) {
    return fallback || enumValue;
  }

  const pathKey = context.propertyPath.join('.');
  const translationKey = `schema.${context.schemaPath}:properties.${pathKey}.enum.${enumValue}`;
  
  const translated = i18n.t(translationKey);
  
  // If translation not found, return fallback or original value
  if (translated === translationKey) {
    return fallback || enumValue;
  }
  
  return translated;
}

export function getPropertyLabel(
  context: TranslationContext,
  propertyKey: string,
  schema?: any
): string {
  // Create a new context with the property added to the path
  const newContext: TranslationContext = {
    ...context,
    propertyPath: [...context.propertyPath, propertyKey]
  };
  
  // Try to get translation
  const translated = getSchemaTranslation(newContext, 'title', schema?.title);
  
  // If we have a translation or a title from schema, use it
  if (translated && translated !== propertyKey) {
    return translated;
  }
  
  // Otherwise return the property key itself
  return propertyKey;
}