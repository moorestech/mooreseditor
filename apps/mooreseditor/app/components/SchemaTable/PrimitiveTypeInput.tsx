import { NumberInput } from "@mantine/core"
import { IntInput } from "./IntInput"
import { BooleanInput } from "./BooleanInput"
import { StringInput } from "./StringInput"
import { EnumInput } from "./EnumInput"
import { VectorInput } from "./VectorInput"
import { ArrayInput } from "./ArrayInput"
import { DataSchema } from "~/types/schema"

interface Props {
  showLabel?: boolean;
  property: string;
  propertySchema: DataSchema;
  value: unknown;
  onChange(value: unknown): void;
}

export function PrimitiveTypeInput({ showLabel = false, property, propertySchema, value, onChange }: Props) {
  const label = showLabel ? property : undefined
  const props = {
    label,
    value: value ?? (propertySchema && propertySchema['default']) ?? '',
    onChange,
  }
  if('enum' in propertySchema){
    return <EnumInput {...props} data={propertySchema.enum.map(value => String(value))} />
  }else{
    switch (propertySchema.type) {
      case 'integer':
        return <IntInput {...props}  />
      case 'number':
        return <NumberInput {...props} />
      case 'boolean':
        return <BooleanInput {...props} />
      case 'string':
        return <StringInput {...props} />
      case 'array':
        switch (propertySchema.pattern) {
          case '@vector2':
            return <VectorInput dimensions={2} step={1} {...props} />
          case '@vector3':
            return <VectorInput dimensions={3} step={1} {...props} />
          case '@vector4':
            return <VectorInput dimensions={4} step={1} {...props} />
          case '@vector2Int':
            return <VectorInput dimensions={2} step={1} {...props} />
          case '@vector3Int':
            return <VectorInput dimensions={3} step={1} {...props} />
          case '@vector4Int':
            return <VectorInput dimensions={4} step={1} {...props} />
          default:
            return <ArrayInput value={value ?? []} label={label} onChange={(values) => onChange(values)} />
        }
      default:
        null
    }

  }
}
