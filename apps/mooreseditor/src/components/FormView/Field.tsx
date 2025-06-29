import React, { memo, useCallback } from 'react';

import { Box, Text, Flex, Button, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

import type { Schema, ValueSchema, SwitchSchema } from '../../libs/schema/types';
import { resolvePath } from '../../utils/pathResolver';

import ArrayField from './ArrayField';
import CollapsibleObject from './CollapsibleObject';
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

// Move React.lazy outside to prevent re-creating on every render
const FormViewLazy = React.lazy(() => import('./index'));

interface FieldProps {
    label: string;
    schema: Schema;
    data: any;
    onDataChange: (value: any) => void;
    onObjectArrayClick?: (path: string[], schema: Schema) => void;
    path: string[];
    parentData?: any;
    rootData?: any;
    arrayIndices?: Map<string, number>;
}

const Field = memo(function Field({ label, schema, data, onDataChange, onObjectArrayClick, path, parentData, rootData, arrayIndices }: FieldProps) {
    const theme = useMantineTheme();
    const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
    const isTablet = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);
    
    const isSwitchSchema = (s: Schema): s is SwitchSchema => 'switch' in s;
    const isValueSchema = (s: Schema): s is ValueSchema => 'type' in s;
    
    // Dynamic label width based on viewport
    const labelWidth = isMobile ? 80 : isTablet ? 100 : 120;
    

    if (isSwitchSchema(schema)) {
        // Use resolvePath for all path types
        const switchValue = resolvePath(
            schema.switch,
            path,
            rootData || data,
            arrayIndices
        );
        
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
            <Flex align="center" gap="md" wrap={isMobile ? "wrap" : "nowrap"}>
                {label && <Text style={{ minWidth: labelWidth, flexShrink: 0 }}>{label}</Text>}
                <Text c="red">Invalid schema</Text>
            </Flex>
        );
    }

    // Handle object type recursively
    if (schema.type === 'object') {
        // If there's a label, use collapsible display
        if (label) {
            return (
                <CollapsibleObject label={label} defaultExpanded={true}>
                    <React.Suspense fallback={<Text c="dimmed">Loading...</Text>}>
                        <FormViewLazy
                            schema={schema}
                            data={data}
                            onDataChange={onDataChange}
                            onObjectArrayClick={onObjectArrayClick}
                            path={path}
                            parentData={parentData}
                            rootData={rootData}
                            arrayIndices={arrayIndices}
                        />
                    </React.Suspense>
                </CollapsibleObject>
            );
        }
        
        // No label means it's the root object, display directly
        return (
            <React.Suspense fallback={<Text c="dimmed">Loading...</Text>}>
                <FormViewLazy
                    schema={schema}
                    data={data}
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
        // Object arrays get a button to open in table view
        if (schema.items && 'type' in schema.items && schema.items.type === 'object') {
            const handleObjectArrayClick = useCallback(() => {
                onObjectArrayClick?.(path, schema);
            }, [onObjectArrayClick, path, schema]);
            
            return (
                <Flex align="center" gap="md" wrap={isMobile ? "wrap" : "nowrap"}>
                    {label && <Text style={{ minWidth: labelWidth, flexShrink: 0 }}>{label}</Text>}
                    <Button
                        onClick={handleObjectArrayClick}
                        variant="light"
                        size={isMobile ? "xs" : "sm"}
                    >
                        Edit {label}
                    </Button>
                </Flex>
            );
        }

        // Primitive arrays use ArrayField
        return (
            <Flex align="flex-start" gap="md" wrap={isMobile ? "wrap" : "nowrap"}>
                {label && <Text style={{ minWidth: labelWidth, flexShrink: 0 }}>{label}</Text>}
                <Box style={{ flex: 1, minWidth: 0 }}>
                    <ArrayField
                        schema={schema}
                        data={data}
                        onDataChange={onDataChange}
                        onObjectArrayClick={onObjectArrayClick}
                        path={path}
                        rootData={rootData}
                        arrayIndices={arrayIndices}
                    />
                </Box>
            </Flex>
        );
    }

    // Handle primitive types
    const renderPrimitiveInput = () => {
        switch (schema.type) {
            case 'string':
                return <StringInput value={data} onChange={onDataChange} schema={schema} />;
            case 'uuid':
                return <UuidInput value={data} onChange={onDataChange} schema={schema} />;
            case 'enum':
                return <EnumInput value={data} onChange={onDataChange} schema={schema} />;
            case 'integer':
                return <IntegerInput value={data} onChange={onDataChange} schema={schema} />;
            case 'number':
                return <NumberInput value={data} onChange={onDataChange} schema={schema} />;
            case 'boolean':
                return <BooleanInput value={data} onChange={onDataChange} schema={schema} />;
            case 'vector2':
            case 'vector2Int':
                return <Vector2Input value={data} onChange={onDataChange} schema={schema} />;
            case 'vector3':
            case 'vector3Int':
                return <Vector3Input value={data} onChange={onDataChange} schema={schema} />;
            case 'vector4':
            case 'vector4Int':
                return <Vector4Input value={data} onChange={onDataChange} schema={schema} />;
            default:
                return <Text c="dimmed" size="sm">Unsupported type: {(schema as any).type}</Text>;
        }
    };

    return (
        <Flex align="center" gap="md" wrap={isMobile ? "wrap" : "nowrap"}>
            {label && <Text style={{ minWidth: labelWidth, flexShrink: 0 }}>{label}</Text>}
            <Box style={{ flex: 1, minWidth: 0 }}>
                {renderPrimitiveInput()}
            </Box>
        </Flex>
    );
});

export default Field;