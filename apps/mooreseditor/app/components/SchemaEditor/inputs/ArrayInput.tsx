import { Button, Group, NumberInput, Stack, ActionIcon, Text } from "@mantine/core"
import { ComponentProps, useState, useRef } from "react"
import { BsPlusLg } from "react-icons/bs"
import { BsTrash } from "react-icons/bs"
import { BsGripVertical } from "react-icons/bs"
import { BsArrowUp, BsArrowDown } from "react-icons/bs"
import { ArraySchema, DataSchema } from "~/schema";
import { PrimitiveTypeInput } from "./PrimitiveTypeInput";

type Props = ComponentProps<typeof NumberInput> & {
  propertySchema: ArraySchema,
  value: any,
  defaultValue?: any,
  onChange(value: any): void;
}

export const ArrayInput = ({
  propertySchema,
  value,
  onChange,
}: Props) => {
  const add = () => {
    onChange([
      ...value,
      ''
    ])
  }

  const remove = (index: number) => {
    onChange([
      ...value.slice(0, index),
      ...value.slice(index + 1)
    ])
  }

  const moveUp = (index: number) => {
    if (index <= 0) return;
    
    const newValue = [...value];
    const temp = newValue[index];
    newValue[index] = newValue[index - 1];
    newValue[index - 1] = temp;
    
    onChange(newValue);
  }

  const moveDown = (index: number) => {
    if (index >= value.length - 1) return;
    
    const newValue = [...value];
    const temp = newValue[index];
    newValue[index] = newValue[index + 1];
    newValue[index + 1] = temp;
    
    onChange(newValue);
  }

  if (!value && propertySchema.default) {
    onChange(propertySchema.default as any);
  }
  value = value ? value : []
  
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };
  
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDropIndex(index);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    if (draggedIndex !== null && dropIndex !== null && draggedIndex !== dropIndex) {
      const newItems = [...value];
      const [draggedItem] = newItems.splice(draggedIndex, 1);
      newItems.splice(dropIndex, 0, draggedItem);
      
      onChange(newItems);
    }
    
    setDraggedIndex(null);
    setDropIndex(null);
  };

  return (
    <Stack gap='xs'>
      {value.map((eachValue: any, i: number) => (
        <Group
          key={i}
          gap="xs"
          align="flex-start"
          className={`sortable-item ${dropIndex === i ? 'drop-target' : ''}`}
          draggable
          onDragStart={() => handleDragStart(i)}
          onDragOver={(e) => handleDragOver(e, i)}
          onDrop={handleDrop}
          style={{
            padding: '4px',
            border: dropIndex === i ? '1px dashed #228be6' : '1px solid transparent',
            backgroundColor: draggedIndex === i ? '#f1f3f5' : 'transparent',
          }}
        >
          {/* 要素番号を表示 */}
          <Text size="sm" c="dimmed" w={20} ta="right" style={{ marginRight: '4px', alignSelf: 'center' }}>
            {i + 1}.
          </Text>
          <ActionIcon
            variant="subtle"
            color="gray"
            style={{ cursor: 'grab', padding: '8px' }}
            title="ドラッグして並べ替え"
            className="drag-handle"
          >
            <BsGripVertical />
          </ActionIcon>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '4px' }}>
            <ActionIcon
              size="xs"
              color="blue"
              variant="subtle"
              onClick={() => moveUp(i)}
              disabled={i === 0}
              title="上に移動"
              style={{ marginBottom: '2px' }}
            >
              <BsArrowUp size={14} />
            </ActionIcon>
            <ActionIcon
              size="xs"
              color="blue"
              variant="subtle"
              onClick={() => moveDown(i)}
              disabled={i === value.length - 1}
              title="下に移動"
            >
              <BsArrowDown size={14} />
            </ActionIcon>
          </div>
          <ActionIcon
            color="red"
            variant="subtle"
            onClick={() => remove(i)}
            style={{ padding: '8px' }}
            title="削除"
          >
            <BsTrash />
          </ActionIcon>
          <div style={{ flex: 1 }}>
            <PrimitiveTypeInput
              propertySchema={propertySchema.items as DataSchema}
              value={eachValue}
              onChange={(newValue) => {
                onChange([
                  ...value.map((v: any, j: number) => i === j ? newValue : v)
                ])
              }}
            />
          </div>
        </Group>
      ))}
      <Button leftSection={<BsPlusLg />} onClick={add} w={160}>追加</Button>
    </Stack>
  )
}
