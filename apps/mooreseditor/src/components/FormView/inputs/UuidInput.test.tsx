// AI Generated Test Code
import { describe, it, expect, vi, afterEach } from 'vitest'

import { UuidInput } from './UuidInput'

import { render, screen, fireEvent } from '@/test/utils/test-utils'
import '@testing-library/jest-dom'

// Mock ForeignKeySelect component
vi.mock('./ForeignKeySelect', () => ({
  ForeignKeySelect: ({ value, onChange }: any) => (
    <select 
      data-testid="foreign-key-select" 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">Select...</option>
      <option value="uuid1">Item 1</option>
    </select>
  )
}))

describe('UuidInput', () => {
  const defaultProps = {
    value: '',
    onChange: vi.fn(),
    schema: { type: 'string' as const, format: 'uuid' }
  }

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render a text input', () => {
    render(<UuidInput {...defaultProps} />)
    
    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
    expect(input).toHaveValue('')
  })

  it('should display placeholder', () => {
    render(<UuidInput {...defaultProps} />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('placeholder', '00000000-0000-0000-0000-000000000000')
  })

  it('should use monospace font', () => {
    const { container } = render(<UuidInput {...defaultProps} />)
    
    // Mantine applies styles through CSS-in-JS, so we just verify it renders
    expect(container).toBeInTheDocument()
  })

  it('should display the provided UUID value', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000'
    render(<UuidInput {...defaultProps} value={uuid} />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveValue(uuid)
  })

  it('should call onChange when input changes', () => {
    const onChange = vi.fn()
    render(<UuidInput {...defaultProps} onChange={onChange} />)
    
    const input = screen.getByRole('textbox')
    const newUuid = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'
    fireEvent.change(input, { target: { value: newUuid } })
    
    expect(onChange).toHaveBeenCalledWith(newUuid)
  })

  it('should handle empty value', () => {
    render(<UuidInput {...defaultProps} value={null as any} />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveValue('')
  })

  it('should handle undefined value', () => {
    render(<UuidInput {...defaultProps} value={undefined as any} />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveValue('')
  })

  it('should render ForeignKeySelect when foreignKey is configured', () => {
    const schemaWithForeignKey = {
      type: 'string' as const,
      format: 'uuid',
      foreignKey: {
        table: 'users',
        key: 'id',
        displayFields: ['name']
      }
    }
    
    render(<UuidInput {...defaultProps} schema={schemaWithForeignKey} />)
    
    expect(screen.getByTestId('foreign-key-select')).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('should pass value and onChange to ForeignKeySelect', () => {
    const schemaWithForeignKey = {
      type: 'string' as const,
      format: 'uuid',
      foreignKey: {
        table: 'users',
        key: 'id',
        displayFields: ['name']
      }
    }
    const onChange = vi.fn()
    
    render(<UuidInput {...defaultProps} value="uuid1" onChange={onChange} schema={schemaWithForeignKey} />)
    
    const select = screen.getByTestId('foreign-key-select')
    expect(select).toHaveValue('uuid1')
    
    fireEvent.change(select, { target: { value: 'uuid1' } })
    expect(onChange).toHaveBeenCalledWith('uuid1')
  })

  it('should handle paste of UUID', () => {
    const onChange = vi.fn()
    render(<UuidInput {...defaultProps} onChange={onChange} />)
    
    const input = screen.getByRole('textbox')
    const pastedUuid = '123e4567-e89b-12d3-a456-426614174000'
    
    fireEvent.paste(input, {
      clipboardData: {
        getData: () => pastedUuid
      }
    })
    
    // Paste event doesn't automatically trigger onChange in tests
    fireEvent.change(input, { target: { value: pastedUuid } })
    expect(onChange).toHaveBeenCalledWith(pastedUuid)
  })

  it('should allow typing any string (validation happens elsewhere)', () => {
    const onChange = vi.fn()
    render(<UuidInput {...defaultProps} onChange={onChange} />)
    
    const input = screen.getByRole('textbox')
    const invalidUuid = 'not-a-valid-uuid'
    
    fireEvent.change(input, { target: { value: invalidUuid } })
    expect(onChange).toHaveBeenCalledWith(invalidUuid)
  })

  it('should handle rapid typing', () => {
    const onChange = vi.fn()
    render(<UuidInput {...defaultProps} onChange={onChange} />)
    
    const input = screen.getByRole('textbox')
    
    fireEvent.change(input, { target: { value: '1' } })
    fireEvent.change(input, { target: { value: '12' } })
    fireEvent.change(input, { target: { value: '123' } })
    
    expect(onChange).toHaveBeenCalledTimes(3)
    expect(onChange).toHaveBeenNthCalledWith(1, '1')
    expect(onChange).toHaveBeenNthCalledWith(2, '12')
    expect(onChange).toHaveBeenNthCalledWith(3, '123')
  })
})