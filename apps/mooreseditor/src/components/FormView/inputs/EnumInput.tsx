import React, { useMemo } from 'react';
import { Select } from '@mantine/core';
import { FormInputProps } from './types';
import type { EnumSchema } from '../../../libs/schema/types';
import { useI18n } from '../../../i18n/I18nContext';

export const EnumInput: React.FC<FormInputProps<string>> = ({ value, onChange, schema, schemaId = '', baseTPath = '' }) => {
  const enumSchema = schema as EnumSchema;
  const { tSchema } = useI18n();
  const data = useMemo(() => {
    const opts = enumSchema.options || [];
    if (!schemaId || !baseTPath) return opts;
    return opts.map((v: string) => ({ value: v, label: tSchema(schemaId, `${baseTPath}.enum.${v}`, v) }));
  }, [enumSchema.options, schemaId, baseTPath, tSchema]);
  return (
    <Select
      data={data as any}
      value={value || enumSchema.default || ''}
      onChange={(val) => onChange(val || '')}
      placeholder="Select an option"
      searchable
    />
  );
};
