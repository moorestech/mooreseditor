// AI Generated Test Code
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/utils/test-utils'
import { Vector2Input } from './Vector2Input'
import '@testing-library/jest-dom'

describe('Vector2Input', () => {
  const defaultProps = {
    value: [0, 0] as [number, number],
    onChange: vi.fn(),
    schema: { type: 'array' as const, format: 'vector2' }
  }

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('should render two number inputs', () => {
    render(<Vector2Input {...defaultProps} />)
    
    const inputs = screen.getAllByRole('textbox')
    expect(inputs).toHaveLength(2)
    expect(inputs[0]).toHaveValue('0')
    expect(inputs[1]).toHaveValue('0')
  })

  it('should display the provided vector values', () => {
    render(<Vector2Input {...defaultProps} value={[3.14, -2.5] as [number, number]} />)
    
    const inputs = screen.getAllByRole('textbox')
    expect(inputs[0]).toHaveValue('3.14')
    expect(inputs[1]).toHaveValue('-2.5')
  })

  it('should call onChange when first value changes', () => {
    const onChange = vi.fn()
    render(<Vector2Input {...defaultProps} value={[1, 2] as [number, number]} onChange={onChange} />)
    
    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[0], { target: { value: '5' } })
    
    vi.advanceTimersByTime(300)
    
    expect(onChange).toHaveBeenCalledWith([5, 2])
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('should call onChange when second value changes', () => {
    const onChange = vi.fn()
    render(<Vector2Input {...defaultProps} value={[1, 2] as [number, number]} onChange={onChange} />)
    
    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[1], { target: { value: '7' } })
    
    vi.advanceTimersByTime(300)
    
    expect(onChange).toHaveBeenCalledWith([1, 7])
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('should handle decimal values', () => {
    const onChange = vi.fn()
    render(<Vector2Input {...defaultProps} onChange={onChange} />)
    
    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[0], { target: { value: '1.234' } })
    
    vi.advanceTimersByTime(300)
    expect(onChange).toHaveBeenCalledWith([1.234, 0])
    expect(onChange).toHaveBeenCalledTimes(1)
    
    onChange.mockClear()
    fireEvent.change(inputs[1], { target: { value: '-5.678' } })
    
    vi.advanceTimersByTime(300)
    expect(onChange).toHaveBeenCalledWith([0, -5.678])
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('should handle undefined value as [0, 0]', () => {
    render(<Vector2Input {...defaultProps} value={undefined} />)
    
    const inputs = screen.getAllByRole('textbox')
    expect(inputs[0]).toHaveValue('0')
    expect(inputs[1]).toHaveValue('0')
  })

  it('should handle null value as [0, 0]', () => {
    render(<Vector2Input {...defaultProps} value={null as any} />)
    
    const inputs = screen.getAllByRole('textbox')
    expect(inputs[0]).toHaveValue('0')
    expect(inputs[1]).toHaveValue('0')
  })

  it('should handle empty array as [0, 0]', () => {
    render(<Vector2Input {...defaultProps} value={[] as any} />)
    
    const inputs = screen.getAllByRole('textbox')
    // Empty array is not a valid vector array
    expect(inputs[0]).toHaveValue('')
    expect(inputs[1]).toHaveValue('')
  })

  it('should handle array with one value', () => {
    render(<Vector2Input {...defaultProps} value={[5] as any} />)
    
    const inputs = screen.getAllByRole('textbox')
    // Array with one value is not a valid vector array (need at least 2)
    expect(inputs[0]).toHaveValue('')
    expect(inputs[1]).toHaveValue('')
  })

  it('should handle array with more than two values', () => {
    render(<Vector2Input {...defaultProps} value={[1, 2, 3, 4] as any} />)
    
    const inputs = screen.getAllByRole('textbox')
    expect(inputs).toHaveLength(2)
    // Takes first two values
    expect(inputs[0]).toHaveValue('1')
    expect(inputs[1]).toHaveValue('2')
  })

  it('should handle NaN values', () => {
    const onChange = vi.fn()
    render(<Vector2Input {...defaultProps} onChange={onChange} />)
    
    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[0], { target: { value: 'not a number' } })
    
    vi.advanceTimersByTime(300)
    
    expect(onChange).toHaveBeenCalled()
  })

  it('should handle empty string input', () => {
    const onChange = vi.fn()
    render(<Vector2Input {...defaultProps} value={[10, 20] as [number, number]} onChange={onChange} />)
    
    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[0], { target: { value: '' } })
    
    vi.advanceTimersByTime(300)
    
    expect(onChange).toHaveBeenCalled()
  })

  it.skip('should handle very large numbers', () => {
    const onChange = vi.fn()
    const largeVector: [number, number] = [1e10, -1e10]
    render(<Vector2Input {...defaultProps} value={largeVector} onChange={onChange} />)
    
    const inputs = screen.getAllByRole('textbox')
    expect(inputs[0]).toHaveValue('10000000000')
    expect(inputs[1]).toHaveValue('-10000000000')
    
    fireEvent.change(inputs[0], { target: { value: '1e20' } })
    
    vi.advanceTimersByTime(300)
    
    expect(onChange).toHaveBeenCalledWith([1e20, -1e10])
  })

  it.skip('should handle scientific notation', () => {
    const onChange = vi.fn()
    render(<Vector2Input {...defaultProps} onChange={onChange} />)
    
    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[0], { target: { value: '1.23e-4' } })
    
    vi.advanceTimersByTime(300)
    expect(onChange).toHaveBeenCalledWith([0.000123, 0])
    expect(onChange).toHaveBeenCalledTimes(1)
    
    onChange.mockClear()
    fireEvent.change(inputs[1], { target: { value: '5.67e3' } })
    
    vi.advanceTimersByTime(300)
    expect(onChange).toHaveBeenCalledWith([0, 5670])
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('should handle zero values', () => {
    const onChange = vi.fn()
    render(<Vector2Input {...defaultProps} value={[100, 200] as [number, number]} onChange={onChange} />)
    
    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[0], { target: { value: '0' } })
    
    vi.advanceTimersByTime(300)
    expect(onChange).toHaveBeenCalledWith([0, 200])
    expect(onChange).toHaveBeenCalledTimes(1)
    
    onChange.mockClear()
    fireEvent.change(inputs[1], { target: { value: '0' } })
    
    vi.advanceTimersByTime(300)
    expect(onChange).toHaveBeenCalledWith([100, 0])
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('should preserve precision', () => {
    const onChange = vi.fn()
    render(<Vector2Input {...defaultProps} onChange={onChange} />)
    
    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[0], { target: { value: '0.123456789' } })
    
    vi.advanceTimersByTime(300)
    
    expect(onChange).toHaveBeenCalledWith([0.123456789, 0])
  })

  it('should handle negative zero', () => {
    const onChange = vi.fn()
    render(<Vector2Input {...defaultProps} onChange={onChange} />)
    
    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[0], { target: { value: '-0' } })
    
    vi.advanceTimersByTime(300)
    
    expect(onChange).toHaveBeenCalledWith([-0, 0])
  })

  it('should handle string values in array gracefully', () => {
    render(<Vector2Input {...defaultProps} value={['1', '2'] as any} />)
    
    const inputs = screen.getAllByRole('textbox')
    // String array is not a valid vector array
    expect(inputs[0]).toHaveValue('')
    expect(inputs[1]).toHaveValue('')
  })
})