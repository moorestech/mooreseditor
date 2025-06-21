// AI Generated Test Code
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebouncedValue, useDebouncedCallback } from './useDebounce'

describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('initial', 500))
    
    expect(result.current).toBe('initial')
  })

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 }
      }
    )

    expect(result.current).toBe('initial')

    // Change value
    rerender({ value: 'updated', delay: 500 })
    
    // Value should not change immediately
    expect(result.current).toBe('initial')
    
    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(500)
    })
    
    // Now value should be updated
    expect(result.current).toBe('updated')
  })

  it('should cancel previous timeout on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 }
      }
    )

    // Rapid changes
    rerender({ value: 'change1', delay: 500 })
    act(() => vi.advanceTimersByTime(200))
    
    rerender({ value: 'change2', delay: 500 })
    act(() => vi.advanceTimersByTime(200))
    
    rerender({ value: 'final', delay: 500 })
    
    // Still should be initial value
    expect(result.current).toBe('initial')
    
    // Complete the delay
    act(() => vi.advanceTimersByTime(500))
    
    // Should have the final value, not intermediate ones
    expect(result.current).toBe('final')
  })

  it('should handle numeric values', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: 0 } }
    )
    
    expect(result.current).toBe(0)
    
    rerender({ value: 42 })
    expect(result.current).toBe(0)
    
    act(() => vi.advanceTimersByTime(300))
    expect(result.current).toBe(42)
  })

  it('should handle object values', () => {
    const obj1 = { name: 'John' }
    const obj2 = { name: 'Jane' }
    
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 200),
      { initialProps: { value: obj1 } }
    )
    
    expect(result.current).toBe(obj1)
    
    rerender({ value: obj2 })
    expect(result.current).toBe(obj1)
    
    act(() => vi.advanceTimersByTime(200))
    expect(result.current).toBe(obj2)
  })

  it('should handle delay changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      {
        initialProps: { value: 'initial', delay: 1000 }
      }
    )

    rerender({ value: 'updated', delay: 100 })
    
    // Should use new delay
    act(() => vi.advanceTimersByTime(100))
    expect(result.current).toBe('updated')
  })

  it('should handle zero delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 0),
      { initialProps: { value: 'initial' } }
    )
    
    rerender({ value: 'updated' })
    
    // Should update almost immediately
    act(() => vi.advanceTimersByTime(0))
    expect(result.current).toBe('updated')
  })
})

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should debounce callback execution', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useDebouncedCallback(callback, 500))

    // Call the debounced function multiple times
    act(() => {
      result.current('first')
      result.current('second')
      result.current('third')
    })

    // Callback should not be called yet
    expect(callback).not.toHaveBeenCalled()

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(500)
    })

    // Callback should be called once with the last arguments
    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith('third')
  })

  it('should cancel on unmount', () => {
    const callback = vi.fn()
    const { result, unmount } = renderHook(() => 
      useDebouncedCallback(callback, 500)
    )

    act(() => {
      result.current('test')
    })

    // Unmount before delay completes
    unmount()

    act(() => {
      vi.advanceTimersByTime(500)
    })

    // Callback should not be called
    expect(callback).not.toHaveBeenCalled()
  })

  it('should handle different argument types', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useDebouncedCallback(callback, 300))

    act(() => {
      result.current(1, 'string', { key: 'value' }, [1, 2, 3])
    })

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(callback).toHaveBeenCalledWith(1, 'string', { key: 'value' }, [1, 2, 3])
  })

  it('should handle callback that returns a value', () => {
    const callback = vi.fn().mockReturnValue('result')
    const { result } = renderHook(() => useDebouncedCallback(callback, 200))

    act(() => {
      result.current('arg')
    })

    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(callback).toHaveBeenCalledWith('arg')
    expect(callback).toHaveReturnedWith('result')
  })

  it('should handle callback changes', () => {
    const callback1 = vi.fn()
    const callback2 = vi.fn()
    
    const { result, rerender } = renderHook(
      ({ cb, delay }) => useDebouncedCallback(cb, delay),
      {
        initialProps: { cb: callback1, delay: 300 }
      }
    )

    act(() => {
      result.current('for callback1')
    })

    // Change callback
    rerender({ cb: callback2, delay: 300 })

    act(() => {
      result.current('for callback2')
    })

    act(() => {
      vi.advanceTimersByTime(300)
    })

    // Only the new callback should be called
    expect(callback1).not.toHaveBeenCalled()
    expect(callback2).toHaveBeenCalledWith('for callback2')
  })

  it('should handle delay changes', () => {
    const callback = vi.fn()
    
    const { result, rerender } = renderHook(
      ({ cb, delay }) => useDebouncedCallback(cb, delay),
      {
        initialProps: { cb: callback, delay: 1000 }
      }
    )

    act(() => {
      result.current('test')
    })

    // Change delay to shorter
    rerender({ cb: callback, delay: 100 })
    
    // Call again with new delay
    act(() => {
      result.current('test')
    })

    act(() => {
      vi.advanceTimersByTime(100)
    })

    // Should be called with the new delay
    expect(callback).toHaveBeenCalledWith('test')
  })

  it('should handle zero delay', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useDebouncedCallback(callback, 0))

    act(() => {
      result.current('immediate')
    })

    act(() => {
      vi.advanceTimersByTime(0)
    })

    expect(callback).toHaveBeenCalledWith('immediate')
  })

  it('should handle async callbacks', () => {
    const asyncCallback = vi.fn().mockResolvedValue('async result')
    const { result } = renderHook(() => useDebouncedCallback(asyncCallback, 300))

    act(() => {
      result.current('async arg')
    })

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(asyncCallback).toHaveBeenCalledWith('async arg')
  })
})