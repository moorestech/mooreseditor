import React from 'react';

import { 
  Button, 
  Stack, 
  Group, 
  Text, 
  Box,
  ActionIcon,
  Flex
} from '@mantine/core';
import { 
  IconPlus, 
  IconTrash
} from '@tabler/icons-react';

import type { Schema, ObjectSchema, ArraySchema, StringSchema, EnumSchema, IntegerSchema, NumberSchema, BooleanSchema, SwitchSchema, ValueSchema } from '../../libs/schema/types';
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

interface FormViewProps {
    schema: Schema;
    data: any;
    onDataChange: (newData: any) => void;
    onObjectArrayClick?: (path: string[], schema: Schema) => void;
    path?: string[];
}

function FormView({ schema, data, onDataChange, onObjectArrayClick, path = [] }: FormViewProps) {
    const handlePrimitiveChange = (value: any) => {
        onDataChange(value);
    };

    const handleObjectPropertyChange = (key: string, value: any) => {
        onDataChange({
            ...data,
            [key]: value
        });
    };

    const handleArrayItemChange = (index: number, value: any) => {
        const newArray = [...(data || [])];
        newArray[index] = value;
        onDataChange(newArray);
    };

    const addArrayItem = () => {
        const newArray = [...(data || [])];
        const arraySchema = schema as ArraySchema;
        const defaultValue = getDefaultValue(arraySchema.items);
        newArray.push(defaultValue);
        onDataChange(newArray);
    };

    const removeArrayItem = (index: number) => {
        const newArray = [...(data || [])];
        newArray.splice(index, 1);
        onDataChange(newArray);
    };

    const getDefaultValue = (itemSchema: ValueSchema): any => {
        if ('type' in itemSchema) {
            switch (itemSchema.type) {
                case 'string':
                    return (itemSchema as StringSchema).default || '';
                case 'uuid':
                    return '';
                case 'enum':
                    return (itemSchema as EnumSchema).default || '';
                case 'integer':
                    return (itemSchema as IntegerSchema).default || 0;
                case 'number':
                    return (itemSchema as NumberSchema).default || 0;
                case 'boolean':
                    return false;
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
                    const objSchema = itemSchema as ObjectSchema;
                    if (objSchema.properties) {
                        objSchema.properties.forEach(prop => {
                            if ('type' in prop || 'switch' in prop) {
                                obj[prop.key] = getDefaultValue(prop as ValueSchema);
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
    };


    const renderPrimitiveInput = (schema: ValueSchema, value: any, onChange: (value: any) => void): React.ReactElement => {
        if (!('type' in schema)) {
            return <Text c="dimmed" size="sm">Unsupported schema type</Text>;
        }

        switch (schema.type) {
            case 'string':
                return <StringInput value={value} onChange={onChange} schema={schema} />;

            case 'uuid':
                return <UuidInput value={value} onChange={onChange} schema={schema} />;
            
            case 'enum':
                return <EnumInput value={value} onChange={onChange} schema={schema} />;
            
            case 'integer':
                return <IntegerInput value={value} onChange={onChange} schema={schema} />;
            
            case 'number':
                return <NumberInput value={value} onChange={onChange} schema={schema} />;

            case 'boolean':
                return <BooleanInput value={value} onChange={onChange} schema={schema} />;
            
            case 'vector2':
            case 'vector2Int':
                return <Vector2Input value={value} onChange={onChange} schema={schema} />;
            
            case 'vector3':
            case 'vector3Int':
                return <Vector3Input value={value} onChange={onChange} schema={schema} />;
            
            case 'vector4':
            case 'vector4Int':
                return <Vector4Input value={value} onChange={onChange} schema={schema} />;
            
            default:
                return <Text c="dimmed" size="sm">Unsupported type: {schema.type}</Text>;
        }
    };

    const isPrimitiveType = (type: string) => {
        return ['string', 'uuid', 'enum', 'integer', 'number', 'boolean', 'vector2', 'vector2Int', 
                'vector3', 'vector3Int', 'vector4', 'vector4Int'].includes(type);
    };

    const isValueSchema = (schema: Schema): schema is ValueSchema => {
        return 'type' in schema;
    };

    const isSwitchSchema = (schema: Schema): schema is SwitchSchema => {
        return 'switch' in schema;
    };

    if (isSwitchSchema(schema)) {
        return (
            <Text c="dimmed">Switch schemas are not yet supported</Text>
        );
    }

    if (!isValueSchema(schema)) {
        return (
            <Text c="red">Invalid schema</Text>
        );
    }

    if (schema.type === 'object') {
        const objSchema = schema as ObjectSchema;
        return (
            <Stack gap="sm">
                {objSchema.properties?.map((property) => {
                    const propSchema = property as any;
                    const propertyKey = property.key;
                    
                    // Remove key from the schema for processing
                    const { key, ...schemaWithoutKey } = propSchema;
                    const propertySchema = schemaWithoutKey as Schema;
                    
                    if (!isValueSchema(propertySchema)) {
                        return null;
                    }
                    
                    return (
                        <Flex key={propertyKey} align="center" gap="md">
                            <Text style={{ minWidth: 120 }}>{propertyKey}</Text>
                            <Box style={{ flex: 1 }}>
                                {propertySchema.type === 'object' ? (
                                    <Box pl="md">
                                        <FormView
                                            schema={propertySchema}
                                            data={data?.[propertyKey]}
                                            onDataChange={(newValue) => handleObjectPropertyChange(propertyKey, newValue)}
                                            onObjectArrayClick={onObjectArrayClick}
                                            path={[...path, propertyKey]}
                                        />
                                    </Box>
                                ) : propertySchema.type === 'array' && propertySchema.items && 'type' in propertySchema.items && propertySchema.items.type === 'object' ? (
                                    <Button
                                        onClick={() => onObjectArrayClick?.([...path, propertyKey], propertySchema)}
                                        variant="light"
                                    >
                                        Edit {propertyKey}
                                    </Button>
                                ) : propertySchema.type === 'array' && propertySchema.items && 'type' in propertySchema.items && isPrimitiveType(propertySchema.items.type) ? (
                                    <Stack gap="xs">
                                        {(data?.[propertyKey] || []).map((item: any, index: number) => (
                                            <Group key={index} gap="xs">
                                                <Box style={{ flex: 1 }}>
                                                    {renderPrimitiveInput(
                                                        propertySchema.items as ValueSchema,
                                                        item,
                                                        (value) => {
                                                            const newArray = [...(data?.[propertyKey] || [])];
                                                            newArray[index] = value;
                                                            handleObjectPropertyChange(propertyKey, newArray);
                                                        }
                                                    )}
                                                </Box>
                                                <ActionIcon
                                                    color="red"
                                                    variant="subtle"
                                                    onClick={() => {
                                                        const newArray = [...(data?.[propertyKey] || [])];
                                                        newArray.splice(index, 1);
                                                        handleObjectPropertyChange(propertyKey, newArray);
                                                    }}
                                                >
                                                    <IconTrash size={16} />
                                                </ActionIcon>
                                            </Group>
                                        ))}
                                        <Button
                                            variant="light"
                                            size="sm"
                                            leftSection={<IconPlus size={16} />}
                                            onClick={() => {
                                                const newArray = [...(data?.[propertyKey] || [])];
                                                const defaultValue = getDefaultValue(propertySchema.items as ValueSchema);
                                                newArray.push(defaultValue);
                                                handleObjectPropertyChange(propertyKey, newArray);
                                            }}
                                        >
                                            Add Item
                                        </Button>
                                    </Stack>
                                ) : (
                                    renderPrimitiveInput(propertySchema, data?.[propertyKey], (value) => 
                                        handleObjectPropertyChange(propertyKey, value)
                                    )
                                )}
                            </Box>
                        </Flex>
                    );
                })}
            </Stack>
        );
    }

    if (schema.type === 'array' && schema.items && 'type' in schema.items && isPrimitiveType(schema.items.type)) {
        return (
            <Stack gap="xs">
                {(data || []).map((item: any, index: number) => (
                    <Group key={index} gap="xs">
                        <Box style={{ flex: 1 }}>
                            {renderPrimitiveInput(schema.items as ValueSchema, item, (value) => handleArrayItemChange(index, value))}
                        </Box>
                        <ActionIcon
                            color="red"
                            variant="subtle"
                            onClick={() => removeArrayItem(index)}
                        >
                            <IconTrash size={16} />
                        </ActionIcon>
                    </Group>
                ))}
                <Button
                    variant="light"
                    size="sm"
                    leftSection={<IconPlus size={16} />}
                    onClick={addArrayItem}
                >
                    Add Item
                </Button>
            </Stack>
        );
    }

    if (isPrimitiveType(schema.type)) {
        return renderPrimitiveInput(schema, data, handlePrimitiveChange);
    }

    return (
        <Text c="dimmed">Unsupported schema type: {schema.type}</Text>
    );
}

export default FormView;