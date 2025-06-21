// AI Generated Test Code
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@/test/utils/test-utils'
import { EnumInput } from './EnumInput'
import '@testing-library/jest-dom'

describe('EnumInput', () => {
  const defaultProps = {
    value: 'option1',
    onChange: vi.fn(),
    schema: { 
      type: 'string' as const,
      enum: ['option1', 'option2', 'option3']
    }
  }

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render a select element', () => {
    render(<EnumInput {...defaultProps} />)
    
    const select = screen.getByRole('combobox')
    expect(select).toBeInTheDocument()
    expect(select).toHaveValue('option1')
  })

  it('should render all enum options', () => {
    render(<EnumInput {...defaultProps} />)
    
    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(3)
    expect(options[0]).toHaveTextContent('option1')
    expect(options[1]).toHaveTextContent('option2')
    expect(options[2]).toHaveTextContent('option3')
  })

  it('should display the selected value', () => {
    render(<EnumInput {...defaultProps} value="option2" />)
    
    const select = screen.getByRole('combobox')
    expect(select).toHaveValue('option2')
  })

  it('should call onChange when selection changes', () => {
    const onChange = vi.fn()
    render(<EnumInput {...defaultProps} onChange={onChange} />)
    
    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: 'option3' } })
    
    expect(onChange).toHaveBeenCalledWith('option3')
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('should handle undefined value', () => {
    render(<EnumInput {...defaultProps} value={undefined} />)
    
    const select = screen.getByRole('combobox')
    // Should default to first option or empty
    expect(select).toBeInTheDocument()
  })

  it('should handle null value', () => {
    render(<EnumInput {...defaultProps} value={null as any} />)
    
    const select = screen.getByRole('combobox')
    expect(select).toBeInTheDocument()
  })

  it('should handle numeric enum values', () => {
    const numericProps = {
      value: 1,
      onChange: vi.fn(),
      schema: { 
        type: 'integer' as const,
        enum: [1, 2, 3]
      }
    }
    
    render(<EnumInput {...numericProps} />)
    
    const select = screen.getByRole('combobox')
    expect(select).toHaveValue('1')
    
    const options = screen.getAllByRole('option')
    expect(options[0]).toHaveTextContent('1')
    expect(options[1]).toHaveTextContent('2')
    expect(options[2]).toHaveTextContent('3')
  })

  it('should handle boolean enum values', () => {
    const booleanProps = {
      value: true,
      onChange: vi.fn(),
      schema: { 
        type: 'boolean' as const,
        enum: [true, false]
      }
    }
    
    render(<EnumInput {...booleanProps} />)
    
    const select = screen.getByRole('combobox')
    expect(select).toHaveValue('true')
    
    const options = screen.getAllByRole('option')
    expect(options[0]).toHaveTextContent('true')
    expect(options[1]).toHaveTextContent('false')
  })

  it('should handle mixed type enum values', () => {
    const mixedProps = {
      value: 'string',
      onChange: vi.fn(),
      schema: { 
        type: 'string' as const,
        enum: ['string', 123, true, null] as any[]
      }
    }
    
    render(<EnumInput {...mixedProps} />)
    
    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(4)
  })

  it('should handle empty enum array', () => {
    const emptyEnumProps = {
      value: '',
      onChange: vi.fn(),
      schema: { 
        type: 'string' as const,
        enum: []
      }
    }
    
    render(<EnumInput {...emptyEnumProps} />)
    
    const select = screen.getByRole('combobox')
    expect(select).toBeInTheDocument()
    expect(screen.queryAllByRole('option')).toHaveLength(0)
  })

  it('should handle single enum value', () => {
    const singleEnumProps = {
      value: 'only',
      onChange: vi.fn(),
      schema: { 
        type: 'string' as const,
        enum: ['only']
      }
    }
    
    render(<EnumInput {...singleEnumProps} />)
    
    const select = screen.getByRole('combobox')
    expect(select).toHaveValue('only')
    expect(screen.getAllByRole('option')).toHaveLength(1)
  })

  it('should handle value not in enum list', () => {
    render(<EnumInput {...defaultProps} value="invalid" />)
    
    const select = screen.getByRole('combobox')
    expect(select).toHaveValue('invalid')
  })

  it('should preserve selection when rerendering', () => {
    const { rerender } = render(<EnumInput {...defaultProps} value="option1" />)
    
    const select = screen.getByRole('combobox')
    expect(select).toHaveValue('option1')
    
    rerender(<EnumInput {...defaultProps} value="option2" />)
    expect(select).toHaveValue('option2')
  })

  it('should handle special characters in enum values', () => {
    const specialProps = {
      value: 'special-chars!@#',
      onChange: vi.fn(),
      schema: { 
        type: 'string' as const,
        enum: ['special-chars!@#', 'normal', 'with spaces']
      }
    }
    
    render(<EnumInput {...specialProps} />)
    
    const select = screen.getByRole('combobox')
    expect(select).toHaveValue('special-chars!@#')
    
    fireEvent.change(select, { target: { value: 'with spaces' } })
    expect(specialProps.onChange).toHaveBeenCalledWith('with spaces')
  })

  it('should handle very long enum values', () => {
    const longValue = 'a'.repeat(100)
    const longEnumProps = {
      value: longValue,
      onChange: vi.fn(),
      schema: { 
        type: 'string' as const,
        enum: [longValue, 'short']
      }
    }
    
    render(<EnumInput {...longEnumProps} />)
    
    const select = screen.getByRole('combobox')
    expect(select).toHaveValue(longValue)
  })
})