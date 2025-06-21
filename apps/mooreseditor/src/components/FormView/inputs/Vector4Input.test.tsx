// AI Generated Test Code
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@/test/utils/test-utils'
import { Vector4Input } from './Vector4Input'
import '@testing-library/jest-dom'

describe('Vector4Input', () => {
  const defaultProps = {
    value: [0, 0, 0, 0],
    onChange: vi.fn(),
    schema: { type: 'array' as const, format: 'vector4' }
  }

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render four number inputs', () => {
    render(<Vector4Input {...defaultProps} />)
    
    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs).toHaveLength(4)
    expect(inputs[0]).toHaveValue(0)
    expect(inputs[1]).toHaveValue(0)
    expect(inputs[2]).toHaveValue(0)
    expect(inputs[3]).toHaveValue(0)
  })

  it('should display the provided vector values', () => {
    render(<Vector4Input {...defaultProps} value={[1.5, -2.5, 3.7, 0.5]} />)
    
    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs[0]).toHaveValue(1.5)
    expect(inputs[1]).toHaveValue(-2.5)
    expect(inputs[2]).toHaveValue(3.7)
    expect(inputs[3]).toHaveValue(0.5)
  })

  it('should call onChange when first value changes', () => {
    const onChange = vi.fn()
    render(<Vector4Input {...defaultProps} value={[1, 2, 3, 4]} onChange={onChange} />)
    
    const inputs = screen.getAllByRole('spinbutton')
    fireEvent.change(inputs[0], { target: { value: '5' } })
    
    expect(onChange).toHaveBeenCalledWith([5, 2, 3, 4])
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('should call onChange when second value changes', () => {
    const onChange = vi.fn()
    render(<Vector4Input {...defaultProps} value={[1, 2, 3, 4]} onChange={onChange} />)
    
    const inputs = screen.getAllByRole('spinbutton')
    fireEvent.change(inputs[1], { target: { value: '7' } })
    
    expect(onChange).toHaveBeenCalledWith([1, 7, 3, 4])
  })

  it('should call onChange when third value changes', () => {
    const onChange = vi.fn()
    render(<Vector4Input {...defaultProps} value={[1, 2, 3, 4]} onChange={onChange} />)
    
    const inputs = screen.getAllByRole('spinbutton')
    fireEvent.change(inputs[2], { target: { value: '9' } })
    
    expect(onChange).toHaveBeenCalledWith([1, 2, 9, 4])
  })

  it('should call onChange when fourth value changes', () => {
    const onChange = vi.fn()
    render(<Vector4Input {...defaultProps} value={[1, 2, 3, 4]} onChange={onChange} />)
    
    const inputs = screen.getAllByRole('spinbutton')
    fireEvent.change(inputs[3], { target: { value: '11' } })
    
    expect(onChange).toHaveBeenCalledWith([1, 2, 3, 11])
  })

  it('should handle decimal values', () => {
    const onChange = vi.fn()
    render(<Vector4Input {...defaultProps} onChange={onChange} />)
    
    const inputs = screen.getAllByRole('spinbutton')
    fireEvent.change(inputs[0], { target: { value: '1.234' } })
    fireEvent.change(inputs[1], { target: { value: '-5.678' } })
    fireEvent.change(inputs[2], { target: { value: '9.012' } })
    fireEvent.change(inputs[3], { target: { value: '0.456' } })
    
    expect(onChange).toHaveBeenCalledWith([1.234, 0, 0, 0])
    expect(onChange).toHaveBeenCalledWith([0, -5.678, 0, 0])
    expect(onChange).toHaveBeenCalledWith([0, 0, 9.012, 0])
    expect(onChange).toHaveBeenCalledWith([0, 0, 0, 0.456])
  })

  it('should handle undefined value as [0, 0, 0, 0]', () => {
    render(<Vector4Input {...defaultProps} value={undefined} />)
    
    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs[0]).toHaveValue(0)
    expect(inputs[1]).toHaveValue(0)
    expect(inputs[2]).toHaveValue(0)
    expect(inputs[3]).toHaveValue(0)
  })

  it('should handle null value as [0, 0, 0, 0]', () => {
    render(<Vector4Input {...defaultProps} value={null as any} />)
    
    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs[0]).toHaveValue(0)
    expect(inputs[1]).toHaveValue(0)
    expect(inputs[2]).toHaveValue(0)
    expect(inputs[3]).toHaveValue(0)
  })

  it('should handle empty array as [0, 0, 0, 0]', () => {
    render(<Vector4Input {...defaultProps} value={[]} />)
    
    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs[0]).toHaveValue(0)
    expect(inputs[1]).toHaveValue(0)
    expect(inputs[2]).toHaveValue(0)
    expect(inputs[3]).toHaveValue(0)
  })

  it('should handle array with less than four values', () => {
    render(<Vector4Input {...defaultProps} value={[5, 10]} />)
    
    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs[0]).toHaveValue(5)
    expect(inputs[1]).toHaveValue(10)
    expect(inputs[2]).toHaveValue(0)
    expect(inputs[3]).toHaveValue(0)
  })

  it('should handle array with more than four values', () => {
    render(<Vector4Input {...defaultProps} value={[1, 2, 3, 4, 5, 6] as any} />)
    
    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs).toHaveLength(4)
    expect(inputs[0]).toHaveValue(1)
    expect(inputs[1]).toHaveValue(2)
    expect(inputs[2]).toHaveValue(3)
    expect(inputs[3]).toHaveValue(4)
  })

  it('should handle color values (RGBA)', () => {
    const rgbaColor = [0.5, 0.75, 1.0, 0.8] // RGBA color
    render(<Vector4Input {...defaultProps} value={rgbaColor} />)
    
    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs[0]).toHaveValue(0.5)  // R
    expect(inputs[1]).toHaveValue(0.75) // G
    expect(inputs[2]).toHaveValue(1.0)  // B
    expect(inputs[3]).toHaveValue(0.8)  // A
  })

  it('should handle quaternion values', () => {
    const quaternion = [0.707, 0, 0.707, 0] // Rotation quaternion
    render(<Vector4Input {...defaultProps} value={quaternion} />)
    
    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs[0]).toHaveValue(0.707) // x
    expect(inputs[1]).toHaveValue(0)     // y
    expect(inputs[2]).toHaveValue(0.707) // z
    expect(inputs[3]).toHaveValue(0)     // w
  })

  it('should handle very large numbers', () => {
    const onChange = vi.fn()
    const largeVector = [1e10, -1e10, 1e15, -1e15]
    render(<Vector4Input {...defaultProps} value={largeVector} onChange={onChange} />)
    
    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs[0]).toHaveValue(1e10)
    expect(inputs[1]).toHaveValue(-1e10)
    expect(inputs[2]).toHaveValue(1e15)
    expect(inputs[3]).toHaveValue(-1e15)
  })

  it('should handle scientific notation', () => {
    const onChange = vi.fn()
    render(<Vector4Input {...defaultProps} onChange={onChange} />)
    
    const inputs = screen.getAllByRole('spinbutton')
    fireEvent.change(inputs[0], { target: { value: '1.23e-4' } })
    fireEvent.change(inputs[1], { target: { value: '5.67e3' } })
    fireEvent.change(inputs[2], { target: { value: '-8.9e-2' } })
    fireEvent.change(inputs[3], { target: { value: '4.56e1' } })
    
    expect(onChange).toHaveBeenCalledWith([0.000123, 0, 0, 0])
    expect(onChange).toHaveBeenCalledWith([0, 5670, 0, 0])
    expect(onChange).toHaveBeenCalledWith([0, 0, -0.089, 0])
    expect(onChange).toHaveBeenCalledWith([0, 0, 0, 45.6])
  })

  it('should handle NaN values', () => {
    const onChange = vi.fn()
    render(<Vector4Input {...defaultProps} onChange={onChange} />)
    
    const inputs = screen.getAllByRole('spinbutton')
    fireEvent.change(inputs[0], { target: { value: 'not a number' } })
    
    expect(onChange).toHaveBeenCalled()
  })

  it('should handle empty string input', () => {
    const onChange = vi.fn()
    render(<Vector4Input {...defaultProps} value={[10, 20, 30, 40]} onChange={onChange} />)
    
    const inputs = screen.getAllByRole('spinbutton')
    fireEvent.change(inputs[2], { target: { value: '' } })
    
    expect(onChange).toHaveBeenCalled()
  })

  it('should handle normalized vectors', () => {
    const normalizedVector = [0.5, 0.5, 0.5, 0.5] // Normalized 4D vector
    render(<Vector4Input {...defaultProps} value={normalizedVector} />)
    
    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs[0]).toHaveValue(0.5)
    expect(inputs[1]).toHaveValue(0.5)
    expect(inputs[2]).toHaveValue(0.5)
    expect(inputs[3]).toHaveValue(0.5)
  })

  it('should handle string values in array gracefully', () => {
    render(<Vector4Input {...defaultProps} value={['1', '2', '3', '4'] as any} />)
    
    const inputs = screen.getAllByRole('spinbutton')
    // Should convert strings to numbers
    expect(inputs[0]).toHaveValue(1)
    expect(inputs[1]).toHaveValue(2)
    expect(inputs[2]).toHaveValue(3)
    expect(inputs[3]).toHaveValue(4)
  })

  it('should maintain precision for each component independently', () => {
    const onChange = vi.fn()
    render(<Vector4Input {...defaultProps} value={[1.111, 2.222, 3.333, 4.444]} onChange={onChange} />)
    
    const inputs = screen.getAllByRole('spinbutton')
    fireEvent.change(inputs[0], { target: { value: '5.555' } })
    
    expect(onChange).toHaveBeenCalledWith([5.555, 2.222, 3.333, 4.444])
  })

  it('should handle typical use cases for Vector4', () => {
    const onChange = vi.fn()
    
    // RGBA color (0-1 range)
    const { rerender } = render(<Vector4Input {...defaultProps} value={[1, 0, 0, 1]} onChange={onChange} />)
    let inputs = screen.getAllByRole('spinbutton')
    expect(inputs[0]).toHaveValue(1) // Red
    expect(inputs[3]).toHaveValue(1) // Alpha
    
    // Homogeneous coordinates
    rerender(<Vector4Input {...defaultProps} value={[10, 20, 30, 1]} onChange={onChange} />)
    inputs = screen.getAllByRole('spinbutton')
    expect(inputs[0]).toHaveValue(10)
    expect(inputs[1]).toHaveValue(20)
    expect(inputs[2]).toHaveValue(30)
    expect(inputs[3]).toHaveValue(1) // w component
  })
})