import React, { memo, useCallback, useMemo } from 'react';

import { Stack, Group, Box, Button, ActionIcon } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';

import Field from './Field';

import type { ArraySchema, ValueSchema, Schema } from '../../libs/schema/types';
import { calculateAutoIncrement } from '../../utils/autoIncrement';
import { getDefaultValue } from '../TableView/utils/defaultValues';

interface ArrayFieldProps {
    schema: ArraySchema;
    data: any[];
    onDataChange: (value: any[]) => void;
    onObjectArrayClick?: (path: string[], schema: Schema) => void;
    path: string[];
    rootData?: any;
    arrayIndices?: Map<string, number>;
}

const ArrayField = memo(function ArrayField({ schema, data, onDataChange, onObjectArrayClick, path, rootData, arrayIndices }: ArrayFieldProps) {
    const arrayData = data || [];

    const handleItemChange = useCallback((index: number, value: any) => {
        const newArray = [...arrayData];
        newArray[index] = value;
        onDataChange(newArray);
    }, [arrayData, onDataChange]);


    const addItem = useCallback(() => {
        const newArray = [...arrayData];
        let defaultValue = getDefaultValue(schema.items);
        
        // オブジェクト型の場合、autoIncrementプロパティをチェック
        if ('type' in schema.items && schema.items.type === 'object' && schema.items.properties) {
            const obj = { ...defaultValue };
            
            schema.items.properties.forEach(prop => {
                const { key, ...propSchema } = prop;
                
                // integer型またはnumber型でautoIncrementが設定されている場合
                if ('type' in propSchema && 
                    (propSchema.type === 'integer' || propSchema.type === 'number') && 
                    propSchema.autoIncrement) {
                    
                    // 既存の配列データから自動インクリメント値を計算
                    obj[key] = calculateAutoIncrement(
                        newArray,
                        key,
                        propSchema.autoIncrement
                    );
                }
            });
            
            defaultValue = obj;
        }
        
        newArray.push(defaultValue);
        onDataChange(newArray);
    }, [arrayData, schema.items, onDataChange]);

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
                                onObjectArrayClick={onObjectArrayClick}
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