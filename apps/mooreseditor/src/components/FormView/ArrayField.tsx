import React, { memo, useCallback, useMemo } from 'react';

import { Stack, Group, Box, Button, ActionIcon } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';

import Field from './Field';

import type { ArraySchema, ValueSchema, Schema } from '../../libs/schema/types';

interface ArrayFieldProps {
    schema: ArraySchema;
    data: any[];
    onDataChange: (value: any[]) => void;
    path: string[];
    rootData?: any;
    arrayIndices?: Map<string, number>;
}

const ArrayField = memo(function ArrayField({ schema, data, onDataChange, path, rootData, arrayIndices }: ArrayFieldProps) {
    const arrayData = data || [];

    const handleItemChange = useCallback((index: number, value: any) => {
        const newArray = [...arrayData];
        newArray[index] = value;
        onDataChange(newArray);
    }, [arrayData, onDataChange]);

    const getDefaultValue = useCallback((itemSchema: ValueSchema): any => {
        if ('type' in itemSchema) {
            switch (itemSchema.type) {
                case 'string':
                    return itemSchema.default || '';
                case 'uuid':
                    return '';
                case 'enum':
                    return itemSchema.default || '';
                case 'integer':
                    return itemSchema.default || 0;
                case 'number':
                    return itemSchema.default || 0;
                case 'boolean':
                    return itemSchema.default || false;
                case 'vector2':
                case 'vector2Int':
                    return { x: 0, y: 0 };
                case 'vector3':
                case 'vector3Int':
                    return { x: 0, y: 0, z: 0 };
                case 'vector4':
                case 'vector4Int':
                    return { x: 0, y: 0, z: 0, w: 0 };
                case 'object': {
                    const obj: any = {};
                    if (itemSchema.properties) {
                        itemSchema.properties.forEach(prop => {
                            const { key, ...propSchema } = prop;
                            if ('type' in propSchema) {
                                obj[key] = getDefaultValue(propSchema as ValueSchema);
                            }
                        });
                    }
                    return obj;
                }
                case 'array':
                    return [];
                default:
                    return null;
            }
        }
        return null;
    }, []);

    const addItem = useCallback(() => {
        const newArray = [...arrayData];
        const defaultValue = getDefaultValue(schema.items);
        newArray.push(defaultValue);
        onDataChange(newArray);
    }, [arrayData, schema.items, getDefaultValue, onDataChange]);

    const removeItem = useCallback((index: number) => {
        const newArray = [...arrayData];
        newArray.splice(index, 1);
        onDataChange(newArray);
    }, [arrayData, onDataChange]);


    return (
        <Stack gap="xs">
            {arrayData.map((item, index) => {
                // Create a new Map with the current array index
                const updatedArrayIndices = new Map(arrayIndices || []);
                updatedArrayIndices.set(path.join('/'), index);
                
                return (
                    <Group key={index} gap="xs">
                        <Box style={{ flex: 1 }}>
                            <Field
                                label=""
                                schema={schema.items as Schema}
                                data={item}
                                onDataChange={(value) => handleItemChange(index, value)}
                                path={[...path, index.toString()]}
                                parentData={arrayData}
                                rootData={rootData}
                                arrayIndices={updatedArrayIndices}
                            />
                        </Box>
                    <ActionIcon
                        color="red"
                        variant="subtle"
                        onClick={() => removeItem(index)}
                    >
                        <IconTrash size={16} />
                    </ActionIcon>
                </Group>
                );
            })}
            <Button
                variant="light"
                size="sm"
                leftSection={<IconPlus size={16} />}
                onClick={addItem}
            >
                Add Item
            </Button>
        </Stack>
    );
});

export default ArrayField;