// AI Generated Test Code
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@/test/utils/test-utils'
import { NumberInput } from './NumberInput'
import '@testing-library/jest-dom'

describe('NumberInput', () => {
  const defaultProps = {
    value: 0,
    onChange: vi.fn(),
    schema: { type: 'number' as const }
  }

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render a number input', () => {
    render(<NumberInput {...defaultProps} />)
    
    const input = screen.getByRole('spinbutton')
    expect(input).toBeInTheDocument()
    expect(input).toHaveValue(0)
  })

  it('should display the provided value', () => {
    render(<NumberInput {...defaultProps} value={3.14} />)
    
    const input = screen.getByRole('spinbutton')
    expect(input).toHaveValue(3.14)
  })

  it('should call onChange with parsed number when input changes', () => {
    const onChange = vi.fn()
    render(<NumberInput {...defaultProps} onChange={onChange} />)
    
    const input = screen.getByRole('spinbutton')
    fireEvent.change(input, { target: { value: '123.45' } })
    
    expect(onChange).toHaveBeenCalledWith(123.45)
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('should handle decimal numbers with precision', () => {
    const onChange = vi.fn()
    render(<NumberInput {...defaultProps} onChange={onChange} />)
    
    const input = screen.getByRole('spinbutton')
    fireEvent.change(input, { target: { value: '0.123456789' } })
    
    expect(onChange).toHaveBeenCalledWith(0.123456789)
  })

  it('should handle negative numbers', () => {
    const onChange = vi.fn()
    render(<NumberInput {...defaultProps} onChange={onChange} />)
    
    const input = screen.getByRole('spinbutton')
    fireEvent.change(input, { target: { value: '-99.99' } })
    
    expect(onChange).toHaveBeenCalledWith(-99.99)
  })

  it('should handle zero value', () => {
    const onChange = vi.fn()
    render(<NumberInput {...defaultProps} value={10.5} onChange={onChange} />)
    
    const input = screen.getByRole('spinbutton')
    fireEvent.change(input, { target: { value: '0' } })
    
    expect(onChange).toHaveBeenCalledWith(0)
  })

  it('should handle undefined value as 0', () => {
    render(<NumberInput {...defaultProps} value={undefined} />)
    
    const input = screen.getByRole('spinbutton')
    expect(input).toHaveValue(0)
  })

  it('should handle null value as 0', () => {
    render(<NumberInput {...defaultProps} value={null as any} />)
    
    const input = screen.getByRole('spinbutton')
    expect(input).toHaveValue(0)
  })

  it('should handle empty string input', () => {
    const onChange = vi.fn()
    render(<NumberInput {...defaultProps} value={10} onChange={onChange} />)
    
    const input = screen.getByRole('spinbutton')
    fireEvent.change(input, { target: { value: '' } })
    
    expect(onChange).toHaveBeenCalled()
  })

  it('should handle invalid input gracefully', () => {
    const onChange = vi.fn()
    render(<NumberInput {...defaultProps} onChange={onChange} />)
    
    const input = screen.getByRole('spinbutton')
    fireEvent.change(input, { target: { value: 'not a number' } })
    
    expect(onChange).toHaveBeenCalled()
  })

  it('should respect minimum value from schema', () => {
    const schemaWithMin = { type: 'number' as const, minimum: -10 }
    render(<NumberInput {...defaultProps} schema={schemaWithMin} />)
    
    const input = screen.getByRole('spinbutton') as HTMLInputElement
    expect(input.min).toBe('-10')
  })

  it('should respect maximum value from schema', () => {
    const schemaWithMax = { type: 'number' as const, maximum: 999.99 }
    render(<NumberInput {...defaultProps} schema={schemaWithMax} />)
    
    const input = screen.getByRole('spinbutton') as HTMLInputElement
    expect(input.max).toBe('999.99')
  })

  it('should handle step attribute for decimals', () => {
    const schemaWithStep = { type: 'number' as const, multipleOf: 0.01 }
    render(<NumberInput {...defaultProps} schema={schemaWithStep} />)
    
    const input = screen.getByRole('spinbutton') as HTMLInputElement
    expect(input.step).toBe('0.01')
  })

  it('should handle scientific notation', () => {
    const onChange = vi.fn()
    render(<NumberInput {...defaultProps} onChange={onChange} />)
    
    const input = screen.getByRole('spinbutton')
    fireEvent.change(input, { target: { value: '1.23e-4' } })
    
    expect(onChange).toHaveBeenCalledWith(0.000123)
  })

  it('should handle very large numbers', () => {
    const onChange = vi.fn()
    const largeNumber = 1.7976931348623157e+308 // Close to Number.MAX_VALUE
    render(<NumberInput {...defaultProps} value={0} onChange={onChange} />)
    
    const input = screen.getByRole('spinbutton')
    fireEvent.change(input, { target: { value: largeNumber.toString() } })
    
    expect(onChange).toHaveBeenCalledWith(largeNumber)
  })

  it('should handle very small numbers', () => {
    const onChange = vi.fn()
    render(<NumberInput {...defaultProps} onChange={onChange} />)
    
    const input = screen.getByRole('spinbutton')
    fireEvent.change(input, { target: { value: '0.000000000001' } })
    
    expect(onChange).toHaveBeenCalledWith(0.000000000001)
  })

  it('should handle Infinity', () => {
    const onChange = vi.fn()
    render(<NumberInput {...defaultProps} onChange={onChange} />)
    
    const input = screen.getByRole('spinbutton')
    fireEvent.change(input, { target: { value: 'Infinity' } })
    
    expect(onChange).toHaveBeenCalledWith(Infinity)
  })

  it('should handle -Infinity', () => {
    const onChange = vi.fn()
    render(<NumberInput {...defaultProps} onChange={onChange} />)
    
    const input = screen.getByRole('spinbutton')
    fireEvent.change(input, { target: { value: '-Infinity' } })
    
    expect(onChange).toHaveBeenCalledWith(-Infinity)
  })
})