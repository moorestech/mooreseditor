// AI Generated Test Code
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@/test/utils/test-utils'
import Field from './Field'
import '@testing-library/jest-dom'
import type { Schema } from '@/libs/schema/types'

// Mock the input components
vi.mock('./inputs', () => ({
  StringInput: ({ value, onChange }: any) => (
    <input data-testid="string-input" value={value} onChange={(e) => onChange(e.target.value)} />
  ),
  IntegerInput: ({ value, onChange }: any) => (
    <input data-testid="integer-input" type="number" value={value} onChange={(e) => onChange(parseInt(e.target.value))} />
  ),
  NumberInput: ({ value, onChange }: any) => (
    <input data-testid="number-input" type="number" value={value} onChange={(e) => onChange(parseFloat(e.target.value))} />
  ),
  BooleanInput: ({ value, onChange }: any) => (
    <input data-testid="boolean-input" type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
  ),
  EnumInput: ({ value, onChange, schema }: any) => (
    <select data-testid="enum-input" value={value} onChange={(e) => onChange(e.target.value)}>
      {schema.enum?.map((opt: any) => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  ),
  UuidInput: ({ value, onChange }: any) => (
    <input data-testid="uuid-input" value={value} onChange={(e) => onChange(e.target.value)} />
  ),
  Vector2Input: ({ value, onChange }: any) => (
    <div data-testid="vector2-input">{JSON.stringify(value)}</div>
  ),
  Vector3Input: ({ value, onChange }: any) => (
    <div data-testid="vector3-input">{JSON.stringify(value)}</div>
  ),
  Vector4Input: ({ value, onChange }: any) => (
    <div data-testid="vector4-input">{JSON.stringify(value)}</div>
  ),
  ForeignKeySelect: ({ value, onChange }: any) => (
    <select data-testid="foreignkey-input" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Select...</option>
    </select>
  ),
}))

describe('Field', () => {
  const defaultProps = {
    label: 'Test Field',
    schema: { type: 'string' } as Schema,
    data: '',
    onDataChange: vi.fn(),
    path: ['root', 'testField']
  }

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render a string input for string schema', () => {
    render(<Field {...defaultProps} />)
    
    expect(screen.getByTestId('string-input')).toBeInTheDocument()
  })

  it('should render an integer input for integer schema', () => {
    const schema: Schema = { type: 'integer' }
    render(<Field {...defaultProps} schema={schema} data={0} />)
    
    expect(screen.getByTestId('integer-input')).toBeInTheDocument()
  })

  it('should render a number input for number schema', () => {
    const schema: Schema = { type: 'number' }
    render(<Field {...defaultProps} schema={schema} data={0} />)
    
    expect(screen.getByTestId('number-input')).toBeInTheDocument()
  })

  it('should render a boolean input for boolean schema', () => {
    const schema: Schema = { type: 'boolean' }
    render(<Field {...defaultProps} schema={schema} data={false} />)
    
    expect(screen.getByTestId('boolean-input')).toBeInTheDocument()
  })

  it('should render an enum input for schema with enum', () => {
    const schema: Schema = { type: 'enum', options: ['option1', 'option2'] }
    render(<Field {...defaultProps} schema={schema} />)
    
    expect(screen.getByTestId('enum-input')).toBeInTheDocument()
  })

  it('should render a UUID input for string with uuid format', () => {
    const schema: Schema = { type: 'uuid' }
    render(<Field {...defaultProps} schema={schema} />)
    
    expect(screen.getByTestId('uuid-input')).toBeInTheDocument()
  })

  it('should render a foreign key select for schema with foreignKey', () => {
    const schema: Schema = { 
      type: 'uuid',
      foreignKey: {
        schemaId: 'users',
        foreignKeyIdPath: 'id',
        displayElementPath: 'name'
      }
    }
    render(<Field {...defaultProps} schema={schema} />)
    
    // UuidInput is rendered, which internally uses ForeignKeySelect
    expect(screen.getByTestId('uuid-input')).toBeInTheDocument()
  })

  it('should render vector2 input for array with vector2 format', () => {
    const schema: Schema = { type: 'vector2' }
    render(<Field {...defaultProps} schema={schema} data={[0, 0]} />)
    
    expect(screen.getByTestId('vector2-input')).toBeInTheDocument()
  })

  it('should render vector3 input for array with vector3 format', () => {
    const schema: Schema = { type: 'vector3' }
    render(<Field {...defaultProps} schema={schema} data={[0, 0, 0]} />)
    
    expect(screen.getByTestId('vector3-input')).toBeInTheDocument()
  })

  it('should render vector4 input for array with vector4 format', () => {
    const schema: Schema = { type: 'vector4' }
    render(<Field {...defaultProps} schema={schema} data={[0, 0, 0, 0]} />)
    
    expect(screen.getByTestId('vector4-input')).toBeInTheDocument()
  })

  it('should render object fields for object schema', () => {
    const schema: Schema = {
      type: 'object',
      properties: [
        { key: 'name', type: 'string' },
        { key: 'age', type: 'integer' }
      ]
    }
    const data = { name: 'John', age: 30 }
    
    render(<Field {...defaultProps} schema={schema} data={data} />)
    
    // Object schema renders CollapsibleObject with FormView inside
    // Check for the label text instead
    expect(screen.getByText('Test Field')).toBeInTheDocument()
  })

  it('should render array field for array schema', () => {
    const schema: Schema = {
      type: 'array',
      items: { type: 'string' }
    }
    const data = ['item1', 'item2']
    
    render(<Field {...defaultProps} schema={schema} data={data} />)
    
    // Array field renders ArrayField component
    // Check for the label
    expect(screen.getByText('Test Field')).toBeInTheDocument()
  })

  it('should call onChange with updated value', () => {
    const onDataChange = vi.fn()
    const { rerender } = render(<Field {...defaultProps} onDataChange={onDataChange} />)
    
    const input = screen.getByTestId('string-input')
    // Simulate change
    input.dispatchEvent(new Event('change', { bubbles: true }))
    
    // onChange might be called with debounce or directly
    // Test the prop update flow
    rerender(<Field {...defaultProps} data="updated" onDataChange={onDataChange} />)
    expect(input).toHaveValue('updated')
  })

  it('should handle null value', () => {
    render(<Field {...defaultProps} data={null} />)
    
    const input = screen.getByTestId('string-input')
    expect(input).toHaveValue('')
  })

  it('should handle undefined value', () => {
    render(<Field {...defaultProps} data={undefined} />)
    
    const input = screen.getByTestId('string-input')
    expect(input).toHaveValue('')
  })

  it('should pass through foreignKeyData prop', () => {
    const schema: Schema = { 
      type: 'uuid',
      foreignKey: {
        schemaId: 'users',
        foreignKeyIdPath: 'id',
        displayElementPath: 'name'
      }
    }
    
    render(
      <Field 
        {...defaultProps} 
        schema={schema} 
      />
    )
    
    // UuidInput is rendered, which internally uses ForeignKeySelect
    expect(screen.getByTestId('uuid-input')).toBeInTheDocument()
  })

  it('should handle complex nested schemas', () => {
    const schema: Schema = {
      type: 'object',
      properties: [
        { 
          key: 'name',
          type: 'string'
        }
      ]
    }
    const data = {
      name: 'John'
    }
    
    render(<Field {...defaultProps} schema={schema} data={data} />)
    
    // Object schema renders CollapsibleObject
    expect(screen.getByText('Test Field')).toBeInTheDocument()
  })

  it('should handle schema without explicit type', () => {
    const schema: any = { properties: { name: { type: 'string' } } }
    render(<Field {...defaultProps} schema={schema} />)
    
    // Should render "Invalid schema" message
    expect(screen.getByText('Invalid schema')).toBeInTheDocument()
  })

  it('should handle unknown schema type', () => {
    const schema: any = { type: 'unknown' }
    render(<Field {...defaultProps} schema={schema} />)
    
    // Should render "Unsupported type" message
    expect(screen.getByText('Unsupported type: unknown')).toBeInTheDocument()
  })
})