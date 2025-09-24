import React, { memo, useCallback } from 'react';

import { Box, Text, Flex, Button } from '@mantine/core';

import ArrayField from './ArrayField';
import { FieldWithCopyPaste } from './FieldWithCopyPaste';
import { isSwitchSchema, isValueSchema, isObjectArraySchema } from './fieldHelpers';
import { renderPrimitiveInput } from './renderPrimitiveInput';


import type { Column } from '@/hooks/useJson';
import type { Schema } from '@/libs/schema/types';

import { useSwitchFieldAutoGeneration } from '@/hooks/useSwitchFieldAutoGeneration';
import { resolvePath } from '@/utils/pathResolver';

// Move React.lazy outside to prevent re-creating on every render
const FormViewLazy = React.lazy(() => import('./index'));

interface FieldProps {
    label: string;
    schema: Schema;
    data: any;
    jsonData?: Column[];
    onDataChange: (value: any) => void;
    onObjectArrayClick?: (path: string[], schema: Schema) => void;
    path: string[];
    parentData?: any;
    rootData?: any;
    arrayIndices?: Map<string, number>;
}

const Field = memo(function Field({ label, schema, data, jsonData, onDataChange, onObjectArrayClick, path, parentData, rootData, arrayIndices }: FieldProps) {
    

    if (isSwitchSchema(schema)) {
        // Use resolvePath for all path types
        const switchValue = resolvePath(
            schema.switch,
            path,
            rootData || data,
            arrayIndices
        );
        
        // カスタムフックを使用してswitch値変更を検出し、必須フィールドを自動生成
        useSwitchFieldAutoGeneration(switchValue, schema, data, onDataChange);
        
        // Find the matching case
        const matchingCase = schema.cases?.find(c => c.when === switchValue);
        
        if (!matchingCase) {
            // If no matching case, return empty
            return null;
        }
        
        // Render the schema for the matching case
        return (
            <Field
                label={label}
                schema={matchingCase}
                data={data}
                jsonData={jsonData}
                onDataChange={onDataChange}
                onObjectArrayClick={onObjectArrayClick}
                path={path}
                parentData={parentData}
                rootData={rootData}
                arrayIndices={arrayIndices}
            />
        );
    }

    if (!isValueSchema(schema)) {
        return (
            <Flex align="center" gap="md">
                {label && <Text style={{ minWidth: 120 }}>{label}</Text>}
                <Text c="red">Invalid schema</Text>
            </Flex>
        );
    }

    // Handle object type recursively
    if (schema.type === 'object') {
        // If there's a label, use collapsible display with copy/paste
        if (label) {
            return (
                <FieldWithCopyPaste
                    value={data}
                    onChange={onDataChange}
                    schema={schema}
                    collapsible={true}
                    label={label}
                    defaultExpanded={true}
                >
                    <React.Suspense fallback={<Text c="dimmed">Loading...</Text>}>
                        <FormViewLazy
                            schema={schema}
                            data={data}
                            jsonData={jsonData}
                            onDataChange={onDataChange}
                            onObjectArrayClick={onObjectArrayClick}
                            path={path}
                            parentData={parentData}
                            rootData={rootData}
                            arrayIndices={arrayIndices}
                        />
                    </React.Suspense>
                </FieldWithCopyPaste>
            );
        }
        
        // No label means it's the root object, display directly
        return (
            <React.Suspense fallback={<Text c="dimmed">Loading...</Text>}>
                <FormViewLazy
                    schema={schema}
                    data={data}
                    jsonData={jsonData}
                    onDataChange={onDataChange}
                    onObjectArrayClick={onObjectArrayClick}
                    path={path}
                    parentData={parentData}
                    rootData={rootData}
                    arrayIndices={arrayIndices}
                />
            </React.Suspense>
        );
    }

    // Handle array type
    if (schema.type === 'array') {
        // Object arrays get a button to open in table view with copy/paste
        if (isObjectArraySchema(schema)) {
            const handleObjectArrayClick = useCallback(() => {
                onObjectArrayClick?.(path, schema);
            }, [onObjectArrayClick, path, schema]);

            return (
                <Flex align="center" gap="md">
                    {label && <Text style={{ minWidth: 120 }}>{label}</Text>}
                    <FieldWithCopyPaste value={data} onChange={onDataChange} schema={schema}>
                        <Button
                            onClick={handleObjectArrayClick}
                            variant="light"
                        >
                            Edit {label}
                        </Button>
                    </FieldWithCopyPaste>
                </Flex>
            );
        }

        // Primitive arrays use ArrayField with copy/paste
        return (
            <Flex align="flex-start" gap="md">
                {label && <Text style={{ minWidth: 120 }}>{label}</Text>}
                <Box style={{ flex: 1 }}>
                    <FieldWithCopyPaste value={data} onChange={onDataChange} schema={schema}>
                        <ArrayField
                            schema={schema}
                            data={data}
                            jsonData={jsonData}
                            onDataChange={onDataChange}
                            onObjectArrayClick={onObjectArrayClick}
                            path={path}
                            rootData={rootData}
                            arrayIndices={arrayIndices}
                        />
                    </FieldWithCopyPaste>
                </Box>
            </Flex>
        );
    }

    // Handle primitive types
    const primitiveInput = renderPrimitiveInput({
        schema,
        data,
        jsonData,
        onDataChange
    });

    return (
        <Flex align="center" gap="md">
            {label && <Text style={{ minWidth: 120 }}>{label}</Text>}
            <Box style={{ flex: 1 }}>
                {primitiveInput}
            </Box>
        </Flex>
    );
});

export default Field;