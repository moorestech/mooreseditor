import React, { memo, useCallback } from 'react';

import { Box, Text, Flex, Button } from '@mantine/core';

import { useSwitchFieldAutoGeneration } from '../../hooks/useSwitchFieldAutoGeneration';
import { resolvePath } from '../../utils/pathResolver';

import ArrayField from './ArrayField';
import { FieldWithCopyPaste } from './FieldWithCopyPaste';
import {
  StringInput,
  UuidInput,
  EnumInput,
  IntegerInput,
  NumberInput,
  BooleanInput,
  Vector2Input,
  Vector3Input,
  Vector4Input
} from './inputs';

import type { Column } from '../../hooks/useJson';
import type { Schema, ValueSchema, SwitchSchema } from '../../libs/schema/types';

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
    const isSwitchSchema = (s: Schema): s is SwitchSchema => 'switch' in s;
    const isValueSchema = (s: Schema): s is ValueSchema => 'type' in s;
    

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
        if (schema.items && 'type' in schema.items && schema.items.type === 'object') {
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
    const renderPrimitiveInput = () => {
        const renderInput = () => {
            switch (schema.type) {
                case 'string':
                    return <StringInput value={data} onChange={onDataChange} schema={schema} jsonData={jsonData} />;
                case 'uuid':
                    return <UuidInput value={data} onChange={onDataChange} schema={schema} jsonData={jsonData} />;
                case 'enum':
                    return <EnumInput value={data} onChange={onDataChange} schema={schema} jsonData={jsonData} />;
                case 'integer':
                    return <IntegerInput value={data} onChange={onDataChange} schema={schema} jsonData={jsonData} />;
                case 'number':
                    return <NumberInput value={data} onChange={onDataChange} schema={schema} jsonData={jsonData} />;
                case 'boolean':
                    return <BooleanInput value={data} onChange={onDataChange} schema={schema} jsonData={jsonData} />;
                case 'vector2':
                case 'vector2Int':
                    return <Vector2Input value={data} onChange={onDataChange} schema={schema} jsonData={jsonData} />;
                case 'vector3':
                case 'vector3Int':
                    return <Vector3Input value={data} onChange={onDataChange} schema={schema} jsonData={jsonData} />;
                case 'vector4':
                case 'vector4Int':
                    return <Vector4Input value={data} onChange={onDataChange} schema={schema} jsonData={jsonData} />;
                default:
                    return <Text c="dimmed" size="sm">Unsupported type: {(schema as any).type}</Text>;
            }
        };

        const input = renderInput();

        // Wrap with copy/paste buttons for all valid types
        if (schema.type) {
            return (
                <FieldWithCopyPaste value={data} onChange={onDataChange} schema={schema}>
                    {input}
                </FieldWithCopyPaste>
            );
        }

        return input;
    };

    return (
        <Flex align="center" gap="md">
            {label && <Text style={{ minWidth: 120 }}>{label}</Text>}
            <Box style={{ flex: 1 }}>
                {renderPrimitiveInput()}
            </Box>
        </Flex>
    );
});

export default Field;