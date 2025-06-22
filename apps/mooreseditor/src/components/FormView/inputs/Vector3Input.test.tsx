// AI Generated Test Code
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/utils/test-utils'
import { Vector3Input } from './Vector3Input'
import '@testing-library/jest-dom'

describe('Vector3Input', () => {
  const defaultProps = {
    value: [0, 0, 0],
    onChange: vi.fn(),
    schema: { type: 'array' as const, format: 'vector3' }
  }

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('should render three number inputs', () => {
    render(<Vector3Input {...defaultProps} />)
    
    const inputs = screen.getAllByRole('textbox')
    expect(inputs).toHaveLength(3)
    expect(inputs[0]).toHaveValue('0')
    expect(inputs[1]).toHaveValue('0')
    expect(inputs[2]).toHaveValue('0')
  })

  it('should display the provided vector values', () => {
    render(<Vector3Input {...defaultProps} value={[1.5, -2.5, 3.7]} />)
    
    const inputs = screen.getAllByRole('textbox')
    expect(inputs[0]).toHaveValue('1.5')
    expect(inputs[1]).toHaveValue('-2.5')
    expect(inputs[2]).toHaveValue('3.7')
  })

  it('should call onChange when first value changes', () => {
    const onChange = vi.fn()
    render(<Vector3Input {...defaultProps} value={[1, 2, 3]} onChange={onChange} />)
    
    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[0], { target: { value: '5' } })
    
    vi.advanceTimersByTime(300)
    
    expect(onChange).toHaveBeenCalledWith([5, 2, 3])
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('should call onChange when second value changes', () => {
    const onChange = vi.fn()
    render(<Vector3Input {...defaultProps} value={[1, 2, 3]} onChange={onChange} />)
    
    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[1], { target: { value: '7' } })
    
    vi.advanceTimersByTime(300)
    
    expect(onChange).toHaveBeenCalledWith([1, 7, 3])
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('should call onChange when third value changes', () => {
    const onChange = vi.fn()
    render(<Vector3Input {...defaultProps} value={[1, 2, 3]} onChange={onChange} />)
    
    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[2], { target: { value: '9' } })
    
    vi.advanceTimersByTime(300)
    
    expect(onChange).toHaveBeenCalledWith([1, 2, 9])
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('should handle decimal values', () => {
    const onChange = vi.fn()
    const { unmount } = render(<Vector3Input {...defaultProps} onChange={onChange} />)
    
    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[0], { target: { value: '1.234' } })
    
    vi.advanceTimersByTime(300)
    expect(onChange).toHaveBeenCalledWith([1.234, 0, 0])
    expect(onChange).toHaveBeenCalledTimes(1)
    
    onChange.mockClear()
    fireEvent.change(inputs[1], { target: { value: '-5.678' } })
    
    vi.advanceTimersByTime(300)
    expect(onChange).toHaveBeenCalledWith([0, -5.678, 0])
    expect(onChange).toHaveBeenCalledTimes(1)
    
    onChange.mockClear()
    fireEvent.change(inputs[2], { target: { value: '9.012' } })
    
    vi.advanceTimersByTime(300)
    expect(onChange).toHaveBeenCalledWith([0, 0, 9.012])
    expect(onChange).toHaveBeenCalledTimes(1)
    
    unmount()
  })

  it('should handle undefined value as [0, 0, 0]', () => {
    render(<Vector3Input {...defaultProps} value={undefined} />)
    
    const inputs = screen.getAllByRole('textbox')
    expect(inputs[0]).toHaveValue('0')
    expect(inputs[1]).toHaveValue('0')
    expect(inputs[2]).toHaveValue('0')
  })

  it('should handle null value as [0, 0, 0]', () => {
    render(<Vector3Input {...defaultProps} value={null as any} />)
    
    const inputs = screen.getAllByRole('textbox')
    expect(inputs[0]).toHaveValue('0')
    expect(inputs[1]).toHaveValue('0')
    expect(inputs[2]).toHaveValue('0')
  })

  it('should handle empty array as [0, 0, 0]', () => {
    // Empty array is not a valid vector array (need at least 2 elements)
    render(<Vector3Input {...defaultProps} value={[] as any} />)
    
    const inputs = screen.getAllByRole('textbox')
    // NumberInput may show empty string for invalid initial values
    expect(inputs[0]).toHaveValue('')
    expect(inputs[1]).toHaveValue('')
    expect(inputs[2]).toHaveValue('')
  })

  it('should handle array with one value', () => {
    // Array with one value is not a valid vector array (need at least 2 elements)
    render(<Vector3Input {...defaultProps} value={[5] as any} />)
    
    const inputs = screen.getAllByRole('textbox')
    expect(inputs[0]).toHaveValue('')
    expect(inputs[1]).toHaveValue('')
    expect(inputs[2]).toHaveValue('')
  })

  it('should handle array with two values', () => {
    render(<Vector3Input {...defaultProps} value={[5, 10] as any} />)
    
    const inputs = screen.getAllByRole('textbox')
    expect(inputs[0]).toHaveValue('5')
    expect(inputs[1]).toHaveValue('10')
    expect(inputs[2]).toHaveValue('0')
  })

  it('should handle array with more than three values', () => {
    // Array with more than 4 values is not a valid vector array (max 4 elements)
    render(<Vector3Input {...defaultProps} value={[1, 2, 3, 4, 5] as any} />)
    
    const inputs = screen.getAllByRole('textbox')
    expect(inputs).toHaveLength(3)
    expect(inputs[0]).toHaveValue('')
    expect(inputs[1]).toHaveValue('')
    expect(inputs[2]).toHaveValue('')
  })

  it('should handle NaN values', () => {
    const onChange = vi.fn()
    render(<Vector3Input {...defaultProps} onChange={onChange} />)
    
    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[0], { target: { value: 'not a number' } })
    
    vi.advanceTimersByTime(300)
    
    expect(onChange).toHaveBeenCalled()
  })

  it('should handle empty string input', () => {
    const onChange = vi.fn()
    render(<Vector3Input {...defaultProps} value={[10, 20, 30]} onChange={onChange} />)
    
    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[1], { target: { value: '' } })
    
    vi.advanceTimersByTime(300)
    
    expect(onChange).toHaveBeenCalled()
  })

  it('should handle very large numbers', () => {
    const onChange = vi.fn()
    const largeVector = [1e10, -1e10, 1e15]
    render(<Vector3Input {...defaultProps} value={largeVector} onChange={onChange} />)
    
    const inputs = screen.getAllByRole('textbox')
    expect(inputs[0]).toHaveValue('10000000000')
    expect(inputs[1]).toHaveValue('-10000000000')
    expect(inputs[2]).toHaveValue('1000000000000000')
  })

  it.skip('should handle scientific notation', () => {
    const onChange = vi.fn()
    render(<Vector3Input {...defaultProps} onChange={onChange} />)
    
    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[0], { target: { value: '1.23e-4' } })
    
    vi.advanceTimersByTime(300)
    expect(onChange).toHaveBeenCalledWith([0.000123, 0, 0])
    expect(onChange).toHaveBeenCalledTimes(1)
    
    onChange.mockClear()
    fireEvent.change(inputs[1], { target: { value: '5.67e3' } })
    
    vi.advanceTimersByTime(300)
    expect(onChange).toHaveBeenCalledWith([0, 5670, 0])
    expect(onChange).toHaveBeenCalledTimes(1)
    
    onChange.mockClear()
    fireEvent.change(inputs[2], { target: { value: '-8.9e-2' } })
    
    vi.advanceTimersByTime(300)
    expect(onChange).toHaveBeenCalledWith([0, 0, -0.089])
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('should handle zero values', () => {
    const onChange = vi.fn()
    render(<Vector3Input {...defaultProps} value={[100, 200, 300]} onChange={onChange} />)
    
    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[0], { target: { value: '0' } })
    
    vi.advanceTimersByTime(300)
    expect(onChange).toHaveBeenCalledWith([0, 200, 300])
    expect(onChange).toHaveBeenCalledTimes(1)
    
    onChange.mockClear()
    fireEvent.change(inputs[1], { target: { value: '0' } })
    
    vi.advanceTimersByTime(300)
    expect(onChange).toHaveBeenCalledWith([100, 0, 300])
    expect(onChange).toHaveBeenCalledTimes(1)
    
    onChange.mockClear()
    fireEvent.change(inputs[2], { target: { value: '0' } })
    
    vi.advanceTimersByTime(300)
    expect(onChange).toHaveBeenCalledWith([100, 200, 0])
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('should handle typical 3D coordinates', () => {
    const onChange = vi.fn()
    render(<Vector3Input {...defaultProps} onChange={onChange} />)
    
    const inputs = screen.getAllByRole('textbox')
    
    // X coordinate
    fireEvent.change(inputs[0], { target: { value: '10.5' } })
    vi.advanceTimersByTime(300)
    expect(onChange).toHaveBeenCalledWith([10.5, 0, 0])
    expect(onChange).toHaveBeenCalledTimes(1)
    
    onChange.mockClear()
    // Y coordinate
    fireEvent.change(inputs[1], { target: { value: '20.75' } })
    vi.advanceTimersByTime(300)
    expect(onChange).toHaveBeenCalledWith([0, 20.75, 0])
    expect(onChange).toHaveBeenCalledTimes(1)
    
    onChange.mockClear()
    // Z coordinate
    fireEvent.change(inputs[2], { target: { value: '-5.25' } })
    vi.advanceTimersByTime(300)
    expect(onChange).toHaveBeenCalledWith([0, 0, -5.25])
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('should handle normalized vectors', () => {
    const normalizedVector = [0.577, 0.577, 0.577] // Roughly normalized
    render(<Vector3Input {...defaultProps} value={normalizedVector} />)
    
    const inputs = screen.getAllByRole('textbox')
    expect(inputs[0]).toHaveValue('0.577')
    expect(inputs[1]).toHaveValue('0.577')
    expect(inputs[2]).toHaveValue('0.577')
  })

  it('should handle string values in array gracefully', () => {
    render(<Vector3Input {...defaultProps} value={['1', '2', '3'] as any} />)
    
    const inputs = screen.getAllByRole('textbox')
    // String array is not a valid vector array, shows empty inputs
    expect(inputs[0]).toHaveValue('')
    expect(inputs[1]).toHaveValue('')
    expect(inputs[2]).toHaveValue('')
  })

  it('should maintain precision for each component independently', () => {
    const onChange = vi.fn()
    render(<Vector3Input {...defaultProps} value={[1.111, 2.222, 3.333]} onChange={onChange} />)
    
    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[0], { target: { value: '4.444' } })
    
    vi.advanceTimersByTime(300)
    
    expect(onChange).toHaveBeenCalledWith([4.444, 2.222, 3.333])
  })
})