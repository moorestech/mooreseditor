import { NumberInput } from "@mantine/core"
import { IntInput } from "./IntInput"
import { BooleanInput } from "./BooleanInput"
import { StringInput } from "./StringInput"
import { EnumInput } from "./EnumInput"
import { VectorInput } from "./VectorInput"
import { ArrayInput } from "./ArrayInput"
import { DataSchema } from "~/schema"

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
  }
  if('enum' in propertySchema){
    return <EnumInput {...props} data={propertySchema.enum.map(value => String(value))} onChange={onChange} />
  }else{
    switch (propertySchema.type) {
      case 'integer':
        return <IntInput {...props} w={160} />
      case 'number':
        return <NumberInput {...props} w={160} onChange={onChange} />
      case 'boolean':
        return <BooleanInput {...props} onChange={onChange} />
      case 'string':
        return <StringInput {...props} w={160} onChange={e => onChange(e.currentTarget.value)} />
      case 'array':
        switch (propertySchema.pattern) {
          case '@vector2':
            return <VectorInput dimensions={2} step={1} {...props} onChange={onChange} />
          case '@vector3':
            return <VectorInput dimensions={3} step={1} {...props} onChange={onChange} />
          case '@vector4':
            return <VectorInput dimensions={4} step={1} {...props} onChange={onChange} />
          case '@vector2Int':
            return <VectorInput dimensions={2} step={1} {...props} onChange={onChange} />
          case '@vector3Int':
            return <VectorInput dimensions={3} step={1} {...props} onChange={onChange} />
          case '@vector4Int':
            return <VectorInput dimensions={4} step={1} {...props} onChange={onChange} />
          default:
            return <ArrayInput value={value ?? []} label={label} onChange={(values: any[]) => onChange(values)} />
        }
      default:
        null
    }

  }
}
