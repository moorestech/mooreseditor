import React, { memo, useCallback } from 'react';

import { Stack } from '@mantine/core';

import Field from './Field';

import type { Schema, ObjectSchema } from '../../libs/schema/types';

interface FormViewProps {
    schema: Schema;
    data: any;
    onDataChange: (newData: any) => void;
    onObjectArrayClick?: (path: string[], schema: Schema) => void;
    path?: string[];
    parentData?: any;
}

const FormView = memo(function FormView({ schema, data, onDataChange, onObjectArrayClick, path = [], parentData }: FormViewProps) {
    // Always treat the top-level as an object
    const handlePropertyChange = useCallback((key: string, value: any) => {
        onDataChange({
            ...data,
            [key]: value
        });
    }, [data, onDataChange]);

    // Handle the case where schema is an object
    if ('type' in schema && schema.type === 'object') {
        const objSchema = schema as ObjectSchema;
        return (
            <Stack gap="sm">
                {objSchema.properties?.map((property) => {
                    const propertyKey = property.key;
                    const { key, ...propertySchema } = property;
                    
                    return (
                        <Field
                            key={propertyKey}
                            label={propertyKey}
                            schema={propertySchema as Schema}
                            data={data?.[propertyKey]}
                            onDataChange={(value) => handlePropertyChange(propertyKey, value)}
                            onObjectArrayClick={onObjectArrayClick}
                            path={[...path, propertyKey]}
                            parentData={data}
                        />
                    );
                })}
            </Stack>
        );
    }

    // For non-object schemas at the root level, wrap in a simple object structure
    return (
        <Field
            label=""
            schema={schema}
            data={data}
            onDataChange={onDataChange}
            onObjectArrayClick={onObjectArrayClick}
            path={path}
            parentData={parentData}
        />
    );
});

export default FormView;