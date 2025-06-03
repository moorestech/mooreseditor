import React from 'react';

import { TextInput, NumberInput, Select, Button, Stack, Group, Text, Paper } from '@mantine/core';

import type { Schema, ObjectSchema, ArraySchema, StringSchema, EnumSchema, IntegerSchema, NumberSchema, SwitchSchema, ValueSchema } from '../libs/schema/types';

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
            return <Text>Unsupported schema type</Text>;
        }

        switch (schema.type) {
            case 'string':
            case 'uuid':
                return (
                    <TextInput
                        value={value || ''}
                        onChange={(e) => onChange(e.currentTarget.value)}
                        placeholder={(schema as StringSchema).default}
                    />
                );
            
            case 'enum':
                const enumSchema = schema as EnumSchema;
                return (
                    <Select
                        data={enumSchema.options || []}
                        value={value || enumSchema.default || ''}
                        onChange={(val) => onChange(val as string | null)}
                    />
                );
            
            case 'integer':
                const intSchema = schema as IntegerSchema;
                return (
                    <NumberInput
                        value={value || 0}
                        onChange={(val) => onChange(val as string | number)}
                        min={intSchema.min}
                        max={intSchema.max}
                        allowDecimal={false}
                    />
                );
            
            case 'number':
                const numSchema = schema as NumberSchema;
                return (
                    <NumberInput
                        value={value || 0}
                        onChange={(val) => onChange(val as string | number)}
                        min={numSchema.min}
                        max={numSchema.max}
                    />
                );
            
            case 'vector2':
            case 'vector2Int':
                return (
                    <Group gap="xs">
                        <NumberInput
                            label="X"
                            value={value?.x || 0}
                            onChange={(val) => onChange({ ...value, x: val })}
                            allowDecimal={!schema.type.includes('Int')}
                            style={{ flex: 1 }}
                        />
                        <NumberInput
                            label="Y"
                            value={value?.y || 0}
                            onChange={(val) => onChange({ ...value, y: val })}
                            allowDecimal={!schema.type.includes('Int')}
                            style={{ flex: 1 }}
                        />
                    </Group>
                );
            
            case 'vector3':
            case 'vector3Int':
                return (
                    <Group gap="xs">
                        <NumberInput
                            label="X"
                            value={value?.x || 0}
                            onChange={(val) => onChange({ ...value, x: val })}
                            allowDecimal={!schema.type.includes('Int')}
                            style={{ flex: 1 }}
                        />
                        <NumberInput
                            label="Y"
                            value={value?.y || 0}
                            onChange={(val) => onChange({ ...value, y: val })}
                            allowDecimal={!schema.type.includes('Int')}
                            style={{ flex: 1 }}
                        />
                        <NumberInput
                            label="Z"
                            value={value?.z || 0}
                            onChange={(val) => onChange({ ...value, z: val })}
                            allowDecimal={!schema.type.includes('Int')}
                            style={{ flex: 1 }}
                        />
                    </Group>
                );
            
            case 'vector4':
            case 'vector4Int':
                return (
                    <Group gap="xs">
                        <NumberInput
                            label="X"
                            value={value?.x || 0}
                            onChange={(val) => onChange({ ...value, x: val })}
                            allowDecimal={!schema.type.includes('Int')}
                            style={{ flex: 1 }}
                        />
                        <NumberInput
                            label="Y"
                            value={value?.y || 0}
                            onChange={(val) => onChange({ ...value, y: val })}
                            allowDecimal={!schema.type.includes('Int')}
                            style={{ flex: 1 }}
                        />
                        <NumberInput
                            label="Z"
                            value={value?.z || 0}
                            onChange={(val) => onChange({ ...value, z: val })}
                            allowDecimal={!schema.type.includes('Int')}
                            style={{ flex: 1 }}
                        />
                        <NumberInput
                            label="W"
                            value={value?.w || 0}
                            onChange={(val) => onChange({ ...value, w: val })}
                            allowDecimal={!schema.type.includes('Int')}
                            style={{ flex: 1 }}
                        />
                    </Group>
                );
            
            default:
                return <Text>Unsupported type: {schema.type}</Text>;
        }
    };

    const isPrimitiveType = (type: string) => {
        return ['string', 'uuid', 'enum', 'integer', 'number', 'vector2', 'vector2Int', 
                'vector3', 'vector3Int', 'vector4', 'vector4Int'].includes(type);
    };

    const isValueSchema = (schema: Schema): schema is ValueSchema => {
        return 'type' in schema;
    };

    const isSwitchSchema = (schema: Schema): schema is SwitchSchema => {
        return 'switch' in schema;
    };

    if (isSwitchSchema(schema)) {
        return <Text>Switch schemas are not yet supported</Text>;
    }

    if (!isValueSchema(schema)) {
        return <Text>Invalid schema</Text>;
    }

    if (schema.type === 'object') {
        const objSchema = schema as ObjectSchema;
        return (
            <Stack gap="md">
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
                        <Paper key={propertyKey} p="sm" withBorder>
                            <Text fw={500} mb="xs">{propertyKey}</Text>
                            {propertySchema.type === 'object' ? (
                                <FormView
                                    schema={propertySchema}
                                    data={data?.[propertyKey]}
                                    onDataChange={(newValue) => handleObjectPropertyChange(propertyKey, newValue)}
                                    onObjectArrayClick={onObjectArrayClick}
                                    path={[...path, propertyKey]}
                                />
                            ) : propertySchema.type === 'array' && propertySchema.items && 'type' in propertySchema.items && propertySchema.items.type === 'object' ? (
                                <Button
                                    onClick={() => onObjectArrayClick?.([...path, propertyKey], propertySchema)}
                                    variant="outline"
                                >
                                    Edit {propertyKey} (Object Array)
                                </Button>
                            ) : propertySchema.type === 'array' && propertySchema.items && 'type' in propertySchema.items && isPrimitiveType(propertySchema.items.type) ? (
                                <Stack gap="xs">
                                    {(data?.[propertyKey] || []).map((item: any, index: number) => (
                                        <Group key={index} gap="xs">
                                            {renderPrimitiveInput(
                                                propertySchema.items as ValueSchema,
                                                item,
                                                (value) => {
                                                    const newArray = [...(data?.[propertyKey] || [])];
                                                    newArray[index] = value;
                                                    handleObjectPropertyChange(propertyKey, newArray);
                                                }
                                            )}
                                            <Button
                                                variant="subtle"
                                                color="red"
                                                size="sm"
                                                onClick={() => {
                                                    const newArray = [...(data?.[propertyKey] || [])];
                                                    newArray.splice(index, 1);
                                                    handleObjectPropertyChange(propertyKey, newArray);
                                                }}
                                            >
                                                Remove
                                            </Button>
                                        </Group>
                                    ))}
                                    <Button
                                        variant="light"
                                        size="sm"
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
                        </Paper>
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
                        {renderPrimitiveInput(schema.items as ValueSchema, item, (value) => handleArrayItemChange(index, value))}
                        <Button
                            variant="subtle"
                            color="red"
                            size="sm"
                            onClick={() => removeArrayItem(index)}
                        >
                            Remove
                        </Button>
                    </Group>
                ))}
                <Button variant="light" onClick={addArrayItem}>
                    Add Item
                </Button>
            </Stack>
        );
    }

    if (isPrimitiveType(schema.type)) {
        return renderPrimitiveInput(schema, data, handlePrimitiveChange);
    }

    return <Text>Unsupported schema type: {schema.type}</Text>;
}

export default FormView;