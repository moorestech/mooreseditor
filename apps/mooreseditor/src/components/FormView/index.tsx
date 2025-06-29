import React, { memo, useCallback, useEffect, useRef, useMemo } from 'react';

import { Stack, Grid, Box } from '@mantine/core';

import Field from './Field';

import type { Schema, ObjectSchema, ArraySchema } from '../../libs/schema/types';

interface FormViewProps {
    schema: Schema;
    data: any;
    onDataChange: (newData: any) => void;
    onObjectArrayClick?: (path: string[], schema: Schema) => void;
    path?: string[];
    parentData?: any;
    rootData?: any;
    arrayIndices?: Map<string, number>;
}

const FormView = memo(function FormView({ schema, data, onDataChange, onObjectArrayClick, path = [], parentData, rootData, arrayIndices }: FormViewProps) {
    const hasAutoOpenedRef = useRef(false);
    
    // Calculate form complexity for dynamic sizing
    const { fieldCount, hasNestedObjects, layout } = useMemo(() => {
        if (!('type' in schema) || schema.type !== 'object') {
            return { fieldCount: 1, hasNestedObjects: false, layout: 'single' };
        }
        
        const objSchema = schema as ObjectSchema;
        const count = objSchema.properties?.length || 0;
        const nested = objSchema.properties?.some(prop => {
            const { key, ...propertySchema } = prop;
            return 'type' in propertySchema && 
                   (propertySchema.type === 'object' || propertySchema.type === 'array');
        }) || false;
        
        // Determine layout based on field count and complexity
        let layoutType = 'single';
        if (count > 8 && !nested) {
            layoutType = 'grid'; // Use grid for many simple fields
        } else if (count > 4 && count <= 8) {
            layoutType = 'two-column'; // Use two columns for medium forms
        }
        
        return { fieldCount: count, hasNestedObjects: nested, layout: layoutType };
    }, [schema]);
    
    // Always treat the top-level as an object
    const handlePropertyChange = useCallback((key: string, value: any) => {
        onDataChange({
            ...data,
            [key]: value
        });
    }, [data, onDataChange]);

    // Auto-open object arrays with openedByDefault - only on first mount
    useEffect(() => {
        if (!hasAutoOpenedRef.current && 'type' in schema && schema.type === 'object' && onObjectArrayClick) {
            hasAutoOpenedRef.current = true;
            const objSchema = schema as ObjectSchema;
            objSchema.properties?.forEach((property) => {
                const propertyKey = property.key;
                const { key, ...propertySchema } = property;
                
                // Check if this is an array of objects with openedByDefault
                if ('type' in propertySchema && propertySchema.type === 'array') {
                    const arraySchema = propertySchema as ArraySchema;
                    if (arraySchema.openedByDefault && 
                        arraySchema.items && 
                        'type' in arraySchema.items && 
                        arraySchema.items.type === 'object') {
                        // Trigger the onObjectArrayClick for this path
                        onObjectArrayClick([...path, propertyKey], propertySchema as Schema);
                    }
                }
            });
        }
    }, [schema, path, onObjectArrayClick]);

    // Handle the case where schema is an object
    if ('type' in schema && schema.type === 'object') {
        const objSchema = schema as ObjectSchema;
        const fields = objSchema.properties?.map((property) => {
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
                    rootData={rootData || data}
                    arrayIndices={arrayIndices}
                />
            );
        });
        
        // Apply different layouts based on form complexity
        if (layout === 'grid') {
            return (
                <Grid gutter="md">
                    {fields?.map((field, index) => (
                        <Grid.Col key={index} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                            {field}
                        </Grid.Col>
                    ))}
                </Grid>
            );
        } else if (layout === 'two-column') {
            return (
                <Grid gutter="md">
                    {fields?.map((field, index) => (
                        <Grid.Col key={index} span={{ base: 12, md: 6 }}>
                            {field}
                        </Grid.Col>
                    ))}
                </Grid>
            );
        } else {
            // Default single column layout
            return (
                <Stack gap="sm">
                    {fields}
                </Stack>
            );
        }
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
            rootData={rootData || data}
            arrayIndices={arrayIndices}
        />
    );
});

export default FormView;