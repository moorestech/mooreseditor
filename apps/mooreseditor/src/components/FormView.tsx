import React from 'react';

import { 
  TextInput, 
  NumberInput, 
  Select, 
  Button, 
  Stack, 
  Group, 
  Text, 
  Paper,
  Title,
  Divider,
  Badge,
  ActionIcon,
  Box,
  Grid,
  Card,
  Textarea,
  Switch,
  rem,
  Tooltip,
  Container
} from '@mantine/core';
import { 
  IconPlus, 
  IconTrash, 
  IconDatabase,
  IconHash,
  IconLetterT,
  IconList,
  IconCube,
  IconVector,
  IconToggleLeft,
  IconBraces,
  IconId,
  IconCode
} from '@tabler/icons-react';

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

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'string':
                return <IconLetterT size={16} />;
            case 'uuid':
                return <IconId size={16} />;
            case 'enum':
                return <IconList size={16} />;
            case 'integer':
            case 'number':
                return <IconHash size={16} />;
            case 'boolean':
                return <IconToggleLeft size={16} />;
            case 'vector2':
            case 'vector2Int':
            case 'vector3':
            case 'vector3Int':
            case 'vector4':
            case 'vector4Int':
                return <IconVector size={16} />;
            case 'object':
                return <IconCube size={16} />;
            case 'array':
                return <IconDatabase size={16} />;
            default:
                return <IconCode size={16} />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'string':
            case 'uuid':
                return 'blue';
            case 'enum':
                return 'cyan';
            case 'integer':
            case 'number':
                return 'violet';
            case 'boolean':
                return 'green';
            case 'vector2':
            case 'vector2Int':
            case 'vector3':
            case 'vector3Int':
            case 'vector4':
            case 'vector4Int':
                return 'orange';
            case 'object':
                return 'pink';
            case 'array':
                return 'grape';
            default:
                return 'gray';
        }
    };

    const renderPrimitiveInput = (schema: ValueSchema, value: any, onChange: (value: any) => void): React.ReactElement => {
        if (!('type' in schema)) {
            return <Text c="dimmed" size="sm">Unsupported schema type</Text>;
        }

        switch (schema.type) {
            case 'string':
                const stringSchema = schema as StringSchema;
                if (stringSchema.default && stringSchema.default.length > 50) {
                    return (
                        <Textarea
                            value={value || ''}
                            onChange={(e) => onChange(e.currentTarget.value)}
                            placeholder={stringSchema.default}
                            autosize
                            minRows={2}
                            maxRows={4}
                        />
                    );
                }
                return (
                    <TextInput
                        value={value || ''}
                        onChange={(e) => onChange(e.currentTarget.value)}
                        placeholder={stringSchema.default}
                    />
                );

            case 'uuid':
                return (
                    <TextInput
                        value={value || ''}
                        onChange={(e) => onChange(e.currentTarget.value)}
                        placeholder="00000000-0000-0000-0000-000000000000"
                        style={{ fontFamily: 'monospace' }}
                        leftSection={<IconId size={16} />}
                    />
                );
            
            case 'enum':
                const enumSchema = schema as EnumSchema;
                return (
                    <Select
                        data={enumSchema.options || []}
                        value={value || enumSchema.default || ''}
                        onChange={(val) => onChange(val)}
                        placeholder="Select an option"
                        searchable
                    />
                );
            
            case 'integer':
                const intSchema = schema as IntegerSchema;
                return (
                    <NumberInput
                        value={value || 0}
                        onChange={(val) => onChange(val)}
                        min={intSchema.min}
                        max={intSchema.max}
                        allowDecimal={false}
                        thousandSeparator=","
                    />
                );
            
            case 'number':
                const numSchema = schema as NumberSchema;
                return (
                    <NumberInput
                        value={value || 0}
                        onChange={(val) => onChange(val)}
                        min={numSchema.min}
                        max={numSchema.max}
                        decimalScale={2}
                        thousandSeparator=","
                    />
                );

            case 'boolean':
                return (
                    <Switch
                        checked={value || false}
                        onChange={(e) => onChange(e.currentTarget.checked)}
                        label={value ? "True" : "False"}
                        size="md"
                    />
                );
            
            case 'vector2':
            case 'vector2Int':
                return (
                    <Grid gutter="xs">
                        <Grid.Col span={6}>
                            <NumberInput
                                label="X"
                                value={value?.x || 0}
                                onChange={(val) => onChange({ ...value, x: val })}
                                allowDecimal={!schema.type.includes('Int')}
                                size="sm"
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <NumberInput
                                label="Y"
                                value={value?.y || 0}
                                onChange={(val) => onChange({ ...value, y: val })}
                                allowDecimal={!schema.type.includes('Int')}
                                size="sm"
                            />
                        </Grid.Col>
                    </Grid>
                );
            
            case 'vector3':
            case 'vector3Int':
                return (
                    <Grid gutter="xs">
                        <Grid.Col span={4}>
                            <NumberInput
                                label="X"
                                value={value?.x || 0}
                                onChange={(val) => onChange({ ...value, x: val })}
                                allowDecimal={!schema.type.includes('Int')}
                                size="sm"
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <NumberInput
                                label="Y"
                                value={value?.y || 0}
                                onChange={(val) => onChange({ ...value, y: val })}
                                allowDecimal={!schema.type.includes('Int')}
                                size="sm"
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <NumberInput
                                label="Z"
                                value={value?.z || 0}
                                onChange={(val) => onChange({ ...value, z: val })}
                                allowDecimal={!schema.type.includes('Int')}
                                size="sm"
                            />
                        </Grid.Col>
                    </Grid>
                );
            
            case 'vector4':
            case 'vector4Int':
                return (
                    <Grid gutter="xs">
                        <Grid.Col span={3}>
                            <NumberInput
                                label="X"
                                value={value?.x || 0}
                                onChange={(val) => onChange({ ...value, x: val })}
                                allowDecimal={!schema.type.includes('Int')}
                                size="sm"
                            />
                        </Grid.Col>
                        <Grid.Col span={3}>
                            <NumberInput
                                label="Y"
                                value={value?.y || 0}
                                onChange={(val) => onChange({ ...value, y: val })}
                                allowDecimal={!schema.type.includes('Int')}
                                size="sm"
                            />
                        </Grid.Col>
                        <Grid.Col span={3}>
                            <NumberInput
                                label="Z"
                                value={value?.z || 0}
                                onChange={(val) => onChange({ ...value, z: val })}
                                allowDecimal={!schema.type.includes('Int')}
                                size="sm"
                            />
                        </Grid.Col>
                        <Grid.Col span={3}>
                            <NumberInput
                                label="W"
                                value={value?.w || 0}
                                onChange={(val) => onChange({ ...value, w: val })}
                                allowDecimal={!schema.type.includes('Int')}
                                size="sm"
                            />
                        </Grid.Col>
                    </Grid>
                );
            
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
            <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Text c="dimmed" ta="center">Switch schemas are not yet supported</Text>
            </Card>
        );
    }

    if (!isValueSchema(schema)) {
        return (
            <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Text c="red" ta="center">Invalid schema</Text>
            </Card>
        );
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
                        <Card key={propertyKey} shadow="xs" padding="md" radius="md" withBorder>
                            <Stack gap="sm">
                                <Group justify="space-between" align="center">
                                    <Group gap="xs">
                                        {getTypeIcon(propertySchema.type)}
                                        <Title order={5}>{propertyKey}</Title>
                                    </Group>
                                    <Badge color={getTypeColor(propertySchema.type)} variant="light" size="sm">
                                        {propertySchema.type}
                                    </Badge>
                                </Group>
                                
                                <Divider />
                                
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
                                        variant="gradient"
                                        gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
                                        leftSection={<IconDatabase size={20} />}
                                        fullWidth
                                        size="md"
                                    >
                                        Edit {propertyKey} (Object Array)
                                    </Button>
                                ) : propertySchema.type === 'array' && propertySchema.items && 'type' in propertySchema.items && isPrimitiveType(propertySchema.items.type) ? (
                                    <Stack gap="xs">
                                        {(data?.[propertyKey] || []).map((item: any, index: number) => (
                                            <Paper key={index} p="xs" withBorder>
                                                <Group gap="xs">
                                                    <Text fw={500} size="sm" c="dimmed" style={{ minWidth: rem(30) }}>
                                                        {index + 1}.
                                                    </Text>
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
                                                    <Tooltip label="Remove item">
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
                                                    </Tooltip>
                                                </Group>
                                            </Paper>
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
                            </Stack>
                        </Card>
                    );
                })}
            </Stack>
        );
    }

    if (schema.type === 'array' && schema.items && 'type' in schema.items && isPrimitiveType(schema.items.type)) {
        return (
            <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Stack gap="md">
                    <Group justify="space-between">
                        <Title order={4}>Array Items</Title>
                        <Badge color="blue" variant="light">
                            {schema.items.type} array
                        </Badge>
                    </Group>
                    
                    <Divider />
                    
                    <Stack gap="xs">
                        {(data || []).map((item: any, index: number) => (
                            <Paper key={index} p="xs" withBorder>
                                <Group gap="xs">
                                    <Text fw={500} size="sm" c="dimmed" style={{ minWidth: rem(30) }}>
                                        {index + 1}.
                                    </Text>
                                    <Box style={{ flex: 1 }}>
                                        {renderPrimitiveInput(schema.items as ValueSchema, item, (value) => handleArrayItemChange(index, value))}
                                    </Box>
                                    <Tooltip label="Remove item">
                                        <ActionIcon
                                            color="red"
                                            variant="subtle"
                                            onClick={() => removeArrayItem(index)}
                                        >
                                            <IconTrash size={16} />
                                        </ActionIcon>
                                    </Tooltip>
                                </Group>
                            </Paper>
                        ))}
                        <Button
                            variant="light"
                            leftSection={<IconPlus size={16} />}
                            onClick={addArrayItem}
                        >
                            Add Item
                        </Button>
                    </Stack>
                </Stack>
            </Card>
        );
    }

    if (isPrimitiveType(schema.type)) {
        return (
            <Card shadow="sm" padding="lg" radius="md" withBorder>
                {renderPrimitiveInput(schema, data, handlePrimitiveChange)}
            </Card>
        );
    }

    return (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Text c="dimmed" ta="center">Unsupported schema type: {schema.type}</Text>
        </Card>
    );
}

export default FormView;