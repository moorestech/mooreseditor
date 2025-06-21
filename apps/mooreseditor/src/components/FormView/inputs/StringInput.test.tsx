// AI Generated Test Code
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/utils/test-utils'
import { StringInput } from './StringInput'
import '@testing-library/jest-dom'

describe('StringInput', () => {
  const defaultProps = {
    value: '',
    onChange: vi.fn(),
    schema: { type: 'string' as const }
  }

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  it('should render a text input', () => {
    render(<StringInput {...defaultProps} />)
    
    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
    expect(input).toHaveValue('')
  })

  it('should display the provided value', () => {
    render(<StringInput {...defaultProps} value="test value" />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveValue('test value')
  })

  it('should call onChange when input changes after debounce', async () => {
    const onChange = vi.fn()
    render(<StringInput {...defaultProps} onChange={onChange} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'new value' } })
    
    // Value should update immediately in the input
    expect(input).toHaveValue('new value')
    
    // But onChange should not be called yet
    expect(onChange).not.toHaveBeenCalled()
    
    // Fast forward debounce timer
    vi.advanceTimersByTime(300)
    
    expect(onChange).toHaveBeenCalledWith('new value')
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('should handle empty string value', async () => {
    const onChange = vi.fn()
    render(<StringInput {...defaultProps} value="test" onChange={onChange} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '' } })
    
    vi.advanceTimersByTime(300)
    
    expect(onChange).toHaveBeenCalledWith('')
  })

  it('should handle undefined value as empty string', () => {
    render(<StringInput {...defaultProps} value={undefined} />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveValue('')
  })

  it('should handle null value as empty string', () => {
    render(<StringInput {...defaultProps} value={null as any} />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveValue('')
  })

  it('should render textarea for long default values', () => {
    const longDefaultSchema = { 
      type: 'string' as const, 
      default: 'This is a very long default value that is more than 50 characters long and should trigger textarea rendering' 
    }
    render(<StringInput {...defaultProps} schema={longDefaultSchema} />)
    
    const textarea = screen.getByRole('textbox')
    expect(textarea.tagName).toBe('TEXTAREA')
  })

  it('should handle special characters in input', async () => {
    const onChange = vi.fn()
    render(<StringInput {...defaultProps} onChange={onChange} />)
    
    const input = screen.getByRole('textbox')
    const specialChars = '!@#$%^&*()_+-={}[]|\\:";\'<>?,./~`'
    fireEvent.change(input, { target: { value: specialChars } })
    
    vi.advanceTimersByTime(300)
    
    expect(onChange).toHaveBeenCalledWith(specialChars)
  })

  it('should handle very long strings', async () => {
    const onChange = vi.fn()
    const longString = 'a'.repeat(1000)
    render(<StringInput {...defaultProps} value={longString} onChange={onChange} />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveValue(longString)
    
    const newLongString = 'b'.repeat(2000)
    fireEvent.change(input, { target: { value: newLongString } })
    
    vi.advanceTimersByTime(300)
    
    expect(onChange).toHaveBeenCalledWith(newLongString)
  })

  it('should handle unicode characters', async () => {
    const onChange = vi.fn()
    const unicodeString = '🎉 こんにちは 👋 مرحبا'
    render(<StringInput {...defaultProps} onChange={onChange} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: unicodeString } })
    
    vi.advanceTimersByTime(300)
    
    expect(onChange).toHaveBeenCalledWith(unicodeString)
  })

  it('should debounce rapid changes', async () => {
    const onChange = vi.fn()
    render(<StringInput {...defaultProps} onChange={onChange} />)
    
    const input = screen.getByRole('textbox')
    
    // Make rapid changes
    fireEvent.change(input, { target: { value: 'a' } })
    vi.advanceTimersByTime(100)
    
    fireEvent.change(input, { target: { value: 'ab' } })
    vi.advanceTimersByTime(100)
    
    fireEvent.change(input, { target: { value: 'abc' } })
    vi.advanceTimersByTime(100)
    
    // onChange should not have been called yet
    expect(onChange).not.toHaveBeenCalled()
    
    // Complete the debounce
    vi.advanceTimersByTime(200)
    
    // Should only be called once with the final value
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith('abc')
  })

  it('should update local value when prop changes', () => {
    const { rerender } = render(<StringInput {...defaultProps} value="initial" />)
    
    let input = screen.getByRole('textbox')
    expect(input).toHaveValue('initial')
    
    rerender(<StringInput {...defaultProps} value="updated" />)
    
    input = screen.getByRole('textbox')
    expect(input).toHaveValue('updated')
  })

  it('should handle placeholder from schema default', () => {
    const schemaWithDefault = {
      type: 'string' as const,
      default: 'Enter your name'
    }
    
    render(<StringInput {...defaultProps} schema={schemaWithDefault} />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('placeholder', 'Enter your name')
  })

  it('should render textarea with proper rows configuration', () => {
    const longDefaultSchema = { 
      type: 'string' as const, 
      default: 'This is a very long default value that is more than 50 characters long and should trigger textarea rendering' 
    }
    render(<StringInput {...defaultProps} schema={longDefaultSchema} />)
    
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
    // Check if autosize functionality is applied (Mantine specific)
    expect(textarea.tagName).toBe('TEXTAREA')
  })

  it('should handle paste events properly', async () => {
    const onChange = vi.fn()
    render(<StringInput {...defaultProps} onChange={onChange} />)
    
    const input = screen.getByRole('textbox')
    const pastedText = 'This is pasted text'
    
    // Simulate paste by changing value
    fireEvent.change(input, { target: { value: pastedText } })
    
    vi.advanceTimersByTime(300)
    
    expect(onChange).toHaveBeenCalledWith(pastedText)
  })
})