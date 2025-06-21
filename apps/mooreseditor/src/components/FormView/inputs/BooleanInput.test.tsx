// AI Generated Test Code
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@/test/utils/test-utils'
import { BooleanInput } from './BooleanInput'
import '@testing-library/jest-dom'

describe('BooleanInput', () => {
  const defaultProps = {
    value: false,
    onChange: vi.fn(),
    schema: { type: 'boolean' as const }
  }

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render a checkbox', () => {
    render(<BooleanInput {...defaultProps} />)
    
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeInTheDocument()
    expect(checkbox).not.toBeChecked()
  })

  it('should show checked state when value is true', () => {
    render(<BooleanInput {...defaultProps} value={true} />)
    
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeChecked()
  })

  it('should call onChange when clicked', () => {
    const onChange = vi.fn()
    render(<BooleanInput {...defaultProps} onChange={onChange} />)
    
    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)
    
    expect(onChange).toHaveBeenCalledWith(true)
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('should toggle value on each click', () => {
    const onChange = vi.fn()
    const { rerender } = render(
      <BooleanInput {...defaultProps} value={false} onChange={onChange} />
    )
    
    const checkbox = screen.getByRole('checkbox')
    
    // First click: false -> true
    fireEvent.click(checkbox)
    expect(onChange).toHaveBeenCalledWith(true)
    
    // Update component with new value
    rerender(<BooleanInput {...defaultProps} value={true} onChange={onChange} />)
    
    // Second click: true -> false
    fireEvent.click(checkbox)
    expect(onChange).toHaveBeenCalledWith(false)
  })

  it('should handle undefined value as false', () => {
    render(<BooleanInput {...defaultProps} value={undefined} />)
    
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeChecked()
  })

  it('should handle null value as false', () => {
    render(<BooleanInput {...defaultProps} value={null as any} />)
    
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeChecked()
  })

  it('should work without onChange handler', () => {
    render(<BooleanInput value={false} schema={{ type: 'boolean' }} onChange={undefined as any} />)
    
    const checkbox = screen.getByRole('checkbox')
    expect(() => fireEvent.click(checkbox)).not.toThrow()
  })

  it('should preserve other checkbox attributes', () => {
    render(<BooleanInput {...defaultProps} />)
    
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement
    expect(checkbox.type).toBe('checkbox')
  })
})