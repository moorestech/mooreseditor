import React, { memo, useCallback } from 'react';

import { Stack, Group, Box, Button, ActionIcon } from '@mantine/core';
import { IconPlus, IconTrash, IconCopy } from '@tabler/icons-react';

import Field from './Field';

import type { ArraySchema, Schema } from '../../libs/schema/types';
import { useArrayDataManager } from '../../hooks/useArrayDataManager';
import type { Column } from '../../hooks/useJson';

interface ArrayFieldProps {
    schema: ArraySchema;
    data: any[];
    jsonData?: Column[];
    onDataChange: (value: any[]) => void;
    onObjectArrayClick?: (path: string[], schema: Schema) => void;
    path: string[];
    rootData?: any;
    arrayIndices?: Map<string, number>;
}

const ArrayField = memo(function ArrayField({ schema, data, jsonData, onDataChange, onObjectArrayClick, path, rootData, arrayIndices }: ArrayFieldProps) {
    // useArrayDataManagerフックを使用して共通ロジックを管理
    const { arrayData, addItem, removeItem, duplicateItem } = useArrayDataManager({
        data,
        schema,
        onDataChange,
        useFullInitialization: true // ArrayFieldでは必須フィールドのみ生成
    });

    const handleItemChange = useCallback((index: number, value: any) => {
        const newArray = [...arrayData];
        newArray[index] = value;
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
                                jsonData={jsonData}
                                onDataChange={(value) => handleItemChange(index, value)}
                                onObjectArrayClick={onObjectArrayClick}
                                path={[...path, index.toString()]}
                                parentData={arrayData}
                                rootData={rootData}
                                arrayIndices={updatedArrayIndices}
                            />
                        </Box>
                    <ActionIcon
                        color="gray"
                        variant="subtle"
                        onClick={() => duplicateItem(index)}
                        title="複製"
                    >
                        <IconCopy size={16} />
                    </ActionIcon>
                    <ActionIcon
                        color="red"
                        variant="subtle"
                        onClick={() => removeItem(index)}
                        title="削除"
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