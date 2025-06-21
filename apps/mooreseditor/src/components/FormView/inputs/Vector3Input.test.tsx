// AI Generated Test Code
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@/test/utils/test-utils'
import { Vector3Input } from './Vector3Input'
import '@testing-library/jest-dom'

describe('Vector3Input', () => {
  const defaultProps = {
    value: [0, 0, 0],
    onChange: vi.fn(),
    schema: { type: 'array' as const, format: 'vector3' }
  }

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render three number inputs', () => {
    render(<Vector3Input {...defaultProps} />)
    
    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs).toHaveLength(3)
    expect(inputs[0]).toHaveValue(0)
    expect(inputs[1]).toHaveValue(0)
    expect(inputs[2]).toHaveValue(0)
  })

  it('should display the provided vector values', () => {
    render(<Vector3Input {...defaultProps} value={[1.5, -2.5, 3.7]} />)
    
    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs[0]).toHaveValue(1.5)
    expect(inputs[1]).toHaveValue(-2.5)
    expect(inputs[2]).toHaveValue(3.7)
  })

  it('should call onChange when first value changes', () => {
    const onChange = vi.fn()
    render(<Vector3Input {...defaultProps} value={[1, 2, 3]} onChange={onChange} />)
    
    const inputs = screen.getAllByRole('spinbutton')
    fireEvent.change(inputs[0], { target: { value: '5' } })
    
    expect(onChange).toHaveBeenCalledWith([5, 2, 3])
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('should call onChange when second value changes', () => {
    const onChange = vi.fn()
    render(<Vector3Input {...defaultProps} value={[1, 2, 3]} onChange={onChange} />)
    
    const inputs = screen.getAllByRole('spinbutton')
    fireEvent.change(inputs[1], { target: { value: '7' } })
    
    expect(onChange).toHaveBeenCalledWith([1, 7, 3])
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('should call onChange when third value changes', () => {
    const onChange = vi.fn()
    render(<Vector3Input {...defaultProps} value={[1, 2, 3]} onChange={onChange} />)
    
    const inputs = screen.getAllByRole('spinbutton')
    fireEvent.change(inputs[2], { target: { value: '9' } })
    
    expect(onChange).toHaveBeenCalledWith([1, 2, 9])
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('should handle decimal values', () => {
    const onChange = vi.fn()
    render(<Vector3Input {...defaultProps} onChange={onChange} />)
    
    const inputs = screen.getAllByRole('spinbutton')
    fireEvent.change(inputs[0], { target: { value: '1.234' } })
    fireEvent.change(inputs[1], { target: { value: '-5.678' } })
    fireEvent.change(inputs[2], { target: { value: '9.012' } })
    
    expect(onChange).toHaveBeenCalledWith([1.234, 0, 0])
    expect(onChange).toHaveBeenCalledWith([0, -5.678, 0])
    expect(onChange).toHaveBeenCalledWith([0, 0, 9.012])
  })

  it('should handle undefined value as [0, 0, 0]', () => {
    render(<Vector3Input {...defaultProps} value={undefined} />)
    
    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs[0]).toHaveValue(0)
    expect(inputs[1]).toHaveValue(0)
    expect(inputs[2]).toHaveValue(0)
  })

  it('should handle null value as [0, 0, 0]', () => {
    render(<Vector3Input {...defaultProps} value={null as any} />)
    
    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs[0]).toHaveValue(0)
    expect(inputs[1]).toHaveValue(0)
    expect(inputs[2]).toHaveValue(0)
  })

  it('should handle empty array as [0, 0, 0]', () => {
    render(<Vector3Input {...defaultProps} value={[]} />)
    
    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs[0]).toHaveValue(0)
    expect(inputs[1]).toHaveValue(0)
    expect(inputs[2]).toHaveValue(0)
  })

  it('should handle array with one value', () => {
    render(<Vector3Input {...defaultProps} value={[5]} />)
    
    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs[0]).toHaveValue(5)
    expect(inputs[1]).toHaveValue(0)
    expect(inputs[2]).toHaveValue(0)
  })

  it('should handle array with two values', () => {
    render(<Vector3Input {...defaultProps} value={[5, 10]} />)
    
    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs[0]).toHaveValue(5)
    expect(inputs[1]).toHaveValue(10)
    expect(inputs[2]).toHaveValue(0)
  })

  it('should handle array with more than three values', () => {
    render(<Vector3Input {...defaultProps} value={[1, 2, 3, 4, 5] as any} />)
    
    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs).toHaveLength(3)
    expect(inputs[0]).toHaveValue(1)
    expect(inputs[1]).toHaveValue(2)
    expect(inputs[2]).toHaveValue(3)
  })

  it('should handle NaN values', () => {
    const onChange = vi.fn()
    render(<Vector3Input {...defaultProps} onChange={onChange} />)
    
    const inputs = screen.getAllByRole('spinbutton')
    fireEvent.change(inputs[0], { target: { value: 'not a number' } })
    
    expect(onChange).toHaveBeenCalled()
  })

  it('should handle empty string input', () => {
    const onChange = vi.fn()
    render(<Vector3Input {...defaultProps} value={[10, 20, 30]} onChange={onChange} />)
    
    const inputs = screen.getAllByRole('spinbutton')
    fireEvent.change(inputs[1], { target: { value: '' } })
    
    expect(onChange).toHaveBeenCalled()
  })

  it('should handle very large numbers', () => {
    const onChange = vi.fn()
    const largeVector = [1e10, -1e10, 1e15]
    render(<Vector3Input {...defaultProps} value={largeVector} onChange={onChange} />)
    
    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs[0]).toHaveValue(1e10)
    expect(inputs[1]).toHaveValue(-1e10)
    expect(inputs[2]).toHaveValue(1e15)
  })

  it('should handle scientific notation', () => {
    const onChange = vi.fn()
    render(<Vector3Input {...defaultProps} onChange={onChange} />)
    
    const inputs = screen.getAllByRole('spinbutton')
    fireEvent.change(inputs[0], { target: { value: '1.23e-4' } })
    fireEvent.change(inputs[1], { target: { value: '5.67e3' } })
    fireEvent.change(inputs[2], { target: { value: '-8.9e-2' } })
    
    expect(onChange).toHaveBeenCalledWith([0.000123, 0, 0])
    expect(onChange).toHaveBeenCalledWith([0, 5670, 0])
    expect(onChange).toHaveBeenCalledWith([0, 0, -0.089])
  })

  it('should handle zero values', () => {
    const onChange = vi.fn()
    render(<Vector3Input {...defaultProps} value={[100, 200, 300]} onChange={onChange} />)
    
    const inputs = screen.getAllByRole('spinbutton')
    fireEvent.change(inputs[0], { target: { value: '0' } })
    fireEvent.change(inputs[1], { target: { value: '0' } })
    fireEvent.change(inputs[2], { target: { value: '0' } })
    
    expect(onChange).toHaveBeenCalledWith([0, 200, 300])
    expect(onChange).toHaveBeenCalledWith([100, 0, 300])
    expect(onChange).toHaveBeenCalledWith([100, 200, 0])
  })

  it('should handle typical 3D coordinates', () => {
    const onChange = vi.fn()
    render(<Vector3Input {...defaultProps} onChange={onChange} />)
    
    const inputs = screen.getAllByRole('spinbutton')
    
    // X coordinate
    fireEvent.change(inputs[0], { target: { value: '10.5' } })
    expect(onChange).toHaveBeenCalledWith([10.5, 0, 0])
    
    // Y coordinate
    fireEvent.change(inputs[1], { target: { value: '20.75' } })
    expect(onChange).toHaveBeenCalledWith([0, 20.75, 0])
    
    // Z coordinate
    fireEvent.change(inputs[2], { target: { value: '-5.25' } })
    expect(onChange).toHaveBeenCalledWith([0, 0, -5.25])
  })

  it('should handle normalized vectors', () => {
    const normalizedVector = [0.577, 0.577, 0.577] // Roughly normalized
    render(<Vector3Input {...defaultProps} value={normalizedVector} />)
    
    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs[0]).toHaveValue(0.577)
    expect(inputs[1]).toHaveValue(0.577)
    expect(inputs[2]).toHaveValue(0.577)
  })

  it('should handle string values in array gracefully', () => {
    render(<Vector3Input {...defaultProps} value={['1', '2', '3'] as any} />)
    
    const inputs = screen.getAllByRole('spinbutton')
    // Should convert strings to numbers
    expect(inputs[0]).toHaveValue(1)
    expect(inputs[1]).toHaveValue(2)
    expect(inputs[2]).toHaveValue(3)
  })

  it('should maintain precision for each component independently', () => {
    const onChange = vi.fn()
    render(<Vector3Input {...defaultProps} value={[1.111, 2.222, 3.333]} onChange={onChange} />)
    
    const inputs = screen.getAllByRole('spinbutton')
    fireEvent.change(inputs[0], { target: { value: '4.444' } })
    
    expect(onChange).toHaveBeenCalledWith([4.444, 2.222, 3.333])
  })
})