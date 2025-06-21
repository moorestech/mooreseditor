// AI Generated Test Code
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useProject } from './useProject'

// Mock Tauri API
vi.mock('@tauri-apps/api', () => ({
  fs: {
    readDir: vi.fn()
  },
  path: {
    join: vi.fn((...args: string[]) => args.join('/'))
  }
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('useProject', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  it('should initialize with no project', () => {
    const { result } = renderHook(() => useProject())
    
    expect(result.current.projectDir).toBeNull()
    expect(result.current.isProjectOpen).toBe(false)
  })

  it('should load project from localStorage', () => {
    localStorageMock.getItem.mockReturnValue('/saved/project/path')
    
    const { result } = renderHook(() => useProject())
    
    expect(result.current.projectDir).toBe('/saved/project/path')
    expect(result.current.isProjectOpen).toBe(true)
    expect(localStorageMock.getItem).toHaveBeenCalledWith('projectDir')
  })

  it('should open a project', () => {
    const { result } = renderHook(() => useProject())
    
    act(() => {
      result.current.openProject('/new/project/path')
    })
    
    expect(result.current.projectDir).toBe('/new/project/path')
    expect(result.current.isProjectOpen).toBe(true)
    expect(localStorageMock.setItem).toHaveBeenCalledWith('projectDir', '/new/project/path')
  })

  it('should close a project', () => {
    const { result } = renderHook(() => useProject())
    
    // First open a project
    act(() => {
      result.current.openProject('/test/project')
    })
    
    expect(result.current.isProjectOpen).toBe(true)
    
    // Then close it
    act(() => {
      result.current.closeProject()
    })
    
    expect(result.current.projectDir).toBeNull()
    expect(result.current.isProjectOpen).toBe(false)
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('projectDir')
  })

  it('should handle opening null project', () => {
    const { result } = renderHook(() => useProject())
    
    act(() => {
      result.current.openProject(null as any)
    })
    
    expect(result.current.projectDir).toBeNull()
    expect(result.current.isProjectOpen).toBe(false)
    expect(localStorageMock.setItem).not.toHaveBeenCalled()
  })

  it('should handle opening empty string project', () => {
    const { result } = renderHook(() => useProject())
    
    act(() => {
      result.current.openProject('')
    })
    
    expect(result.current.projectDir).toBeNull()
    expect(result.current.isProjectOpen).toBe(false)
  })

  it('should update when project changes', () => {
    const { result } = renderHook(() => useProject())
    
    act(() => {
      result.current.openProject('/first/project')
    })
    
    expect(result.current.projectDir).toBe('/first/project')
    
    act(() => {
      result.current.openProject('/second/project')
    })
    
    expect(result.current.projectDir).toBe('/second/project')
    expect(localStorageMock.setItem).toHaveBeenLastCalledWith('projectDir', '/second/project')
  })

  it('should handle localStorage errors gracefully', () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('localStorage not available')
    })
    
    const { result } = renderHook(() => useProject())
    
    // Should not throw and initialize with defaults
    expect(result.current.projectDir).toBeNull()
    expect(result.current.isProjectOpen).toBe(false)
  })

  it('should persist project across hook remounts', () => {
    const { result, unmount } = renderHook(() => useProject())
    
    act(() => {
      result.current.openProject('/persistent/project')
    })
    
    unmount()
    
    // Remount the hook
    localStorageMock.getItem.mockReturnValue('/persistent/project')
    const { result: newResult } = renderHook(() => useProject())
    
    expect(newResult.current.projectDir).toBe('/persistent/project')
    expect(newResult.current.isProjectOpen).toBe(true)
  })

  it('should trim whitespace from project paths', () => {
    const { result } = renderHook(() => useProject())
    
    act(() => {
      result.current.openProject('  /project/with/spaces  ')
    })
    
    expect(result.current.projectDir).toBe('/project/with/spaces')
  })

  it('should not re-save if opening same project', () => {
    const { result } = renderHook(() => useProject())
    
    act(() => {
      result.current.openProject('/same/project')
    })
    
    expect(localStorageMock.setItem).toHaveBeenCalledTimes(1)
    
    act(() => {
      result.current.openProject('/same/project')
    })
    
    // Should not call setItem again
    expect(localStorageMock.setItem).toHaveBeenCalledTimes(1)
  })

  it('should handle special characters in project path', () => {
    const { result } = renderHook(() => useProject())
    
    const specialPath = '/path/with spaces/and-special_chars/[brackets]'
    
    act(() => {
      result.current.openProject(specialPath)
    })
    
    expect(result.current.projectDir).toBe(specialPath)
    expect(localStorageMock.setItem).toHaveBeenCalledWith('projectDir', specialPath)
  })
})