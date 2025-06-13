import React from 'react';

import { Box, Text, Flex, Button } from '@mantine/core';

import type { Schema, ValueSchema, SwitchSchema } from '../../libs/schema/types';
import ArrayField from './ArrayField';
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

interface FieldProps {
    label: string;
    schema: Schema;
    data: any;
    onDataChange: (value: any) => void;
    onObjectArrayClick?: (path: string[], schema: Schema) => void;
    path: string[];
}

function Field({ label, schema, data, onDataChange, onObjectArrayClick, path }: FieldProps) {
    const isSwitchSchema = (s: Schema): s is SwitchSchema => 'switch' in s;
    const isValueSchema = (s: Schema): s is ValueSchema => 'type' in s;

    if (isSwitchSchema(schema)) {
        return (
            <Flex align="center" gap="md">
                {label && <Text style={{ minWidth: 120 }}>{label}</Text>}
                <Text c="dimmed">Switch schemas are not yet supported</Text>
            </Flex>
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
        // To avoid circular dependency, we'll import FormView dynamically
        const FormView = require('./index').default;
        return (
            <Flex align="flex-start" gap="md">
                {label && <Text style={{ minWidth: 120 }}>{label}</Text>}
                <Box style={{ flex: 1 }} pl={label ? "md" : 0}>
                    <FormView
                        schema={schema}
                        data={data}
                        onDataChange={onDataChange}
                        onObjectArrayClick={onObjectArrayClick}
                        path={path}
                    />
                </Box>
            </Flex>
        );
    }

    // Handle array type
    if (schema.type === 'array') {
        // Object arrays get a button to open in table view
        if (schema.items && 'type' in schema.items && schema.items.type === 'object') {
            return (
                <Flex align="center" gap="md">
                    {label && <Text style={{ minWidth: 120 }}>{label}</Text>}
                    <Button
                        onClick={() => onObjectArrayClick?.(path, schema)}
                        variant="light"
                    >
                        Edit {label}
                    </Button>
                </Flex>
            );
        }

        // Primitive arrays use ArrayField
        return (
            <Flex align="flex-start" gap="md">
                {label && <Text style={{ minWidth: 120 }}>{label}</Text>}
                <Box style={{ flex: 1 }}>
                    <ArrayField
                        schema={schema}
                        data={data}
                        onDataChange={onDataChange}
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
                return <Text c="dimmed" size="sm">Unsupported type: {schema.type}</Text>;
        }
    };

    return (
        <Flex align="center" gap="md">
            {label && <Text style={{ minWidth: 120 }}>{label}</Text>}
            <Box style={{ flex: 1 }}>
                {renderPrimitiveInput()}
            </Box>
        </Flex>
    );
}

export default Field;