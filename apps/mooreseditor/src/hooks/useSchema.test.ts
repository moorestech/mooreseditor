import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSchema } from './useSchema'
import YAML from 'yaml'

// Mock dependencies
vi.mock('@tauri-apps/api/path', () => ({
  join: vi.fn((...paths: string[]) => Promise.resolve(paths.join('/')))
}))

vi.mock('@tauri-apps/plugin-fs', () => ({
  readTextFile: vi.fn(),
  readDir: vi.fn(),
  BaseDirectory: {}
}))

vi.mock('yaml', () => ({
  default: {
    parse: vi.fn()
  }
}))

vi.mock('../utils/devFileSystem', () => ({
  getSampleSchema: vi.fn(),
  getAllSampleSchemaMap: vi.fn(() => new Map())
}))

vi.mock('./useSchema/resolvers/RefResolver')

vi.mock('./useSchema/utils/schemaScanner', () => ({
  scanSchemaDirectory: vi.fn()
}))

vi.mock('./useProject', () => ({
  useProject: vi.fn(() => ({
    projectDir: '/test/project',
    masterDir: '/test/project/master',
    schemaDir: '/test/schema',
    menuToFileMap: {},
    loading: false,
    openProjectDir: vi.fn()
  }))
}))

describe('useSchema', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should initialize with empty schemas', () => {
    const { result } = renderHook(() => useSchema())
    
    expect(result.current.schemas).toEqual({})
    expect(result.current.loading).toBe(false)
  })

  it('should load schema successfully', async () => {
    const { readTextFile } = await import('@tauri-apps/plugin-fs')
    const { scanSchemaDirectory } = await import('./useSchema/utils/schemaScanner')
    const { RefResolver } = await import('./useSchema/resolvers/RefResolver')
    const mockReadTextFile = vi.mocked(readTextFile)
    const mockScanSchemaDirectory = vi.mocked(scanSchemaDirectory)
    
    const mockSchema = {
      type: 'object',
      properties: [
        { key: 'name', type: 'string' }
      ]
    }
    
    const mockResolver = {
      resolve: vi.fn().mockReturnValue(mockSchema),
      debugBlocksSchema: vi.fn(),
      definitions: {},
      resolveRefs: vi.fn().mockReturnValue(mockSchema)
    }
    vi.mocked(RefResolver).mockImplementation(() => mockResolver as any)
    
    mockScanSchemaDirectory.mockResolvedValueOnce({})
    mockReadTextFile.mockResolvedValueOnce('type: object\nproperties:\n  - key: name\n    type: string')
    vi.mocked(YAML.parse).mockReturnValueOnce(mockSchema)
    
    const { result } = renderHook(() => useSchema())
    
    let resolvedSchema
    await act(async () => {
      resolvedSchema = await result.current.loadSchema('items')
    })
    
    expect(resolvedSchema).toEqual(mockSchema)
    expect(result.current.schemas.items).toEqual(mockSchema)
    expect(mockReadTextFile).toHaveBeenCalledWith('/test/schema/items.yml')
  })

  it('should handle schema directory not set', async () => {
    const { useProject } = await import('./useProject')
    const mockUseProject = vi.mocked(useProject)
    mockUseProject.mockReturnValueOnce({
      projectDir: '/test/project',
      masterDir: '/test/project/master',
      schemaDir: null,
      menuToFileMap: {},
      loading: false,
      openProjectDir: vi.fn()
    })
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    const { result } = renderHook(() => useSchema())
    
    let resolvedSchema
    await act(async () => {
      resolvedSchema = await result.current.loadSchema('items')
    })
    
    expect(resolvedSchema).toBeNull()
    expect(consoleSpy).toHaveBeenCalledWith('Schema directory is not set.')
  })

  it('should handle schema load error', async () => {
    const { readTextFile } = await import('@tauri-apps/plugin-fs')
    const { scanSchemaDirectory } = await import('./useSchema/utils/schemaScanner')
    const { getSampleSchema } = await import('../utils/devFileSystem')
    const mockReadTextFile = vi.mocked(readTextFile)
    const mockScanSchemaDirectory = vi.mocked(scanSchemaDirectory)
    const mockGetSampleSchema = vi.mocked(getSampleSchema)
    
    mockScanSchemaDirectory.mockResolvedValueOnce({})
    mockReadTextFile.mockRejectedValueOnce(new Error('File not found'))
    mockGetSampleSchema.mockRejectedValueOnce(new Error('Sample not found'))
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {})
    
    const { result } = renderHook(() => useSchema())
    
    let resolvedSchema
    await act(async () => {
      resolvedSchema = await result.current.loadSchema('items')
    })
    
    expect(resolvedSchema).toBeNull()
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error loading schema for items:',
      expect.any(Error)
    )
  })

  it('should set loading state correctly', async () => {
    const { readTextFile } = await import('@tauri-apps/plugin-fs')
    const { scanSchemaDirectory } = await import('./useSchema/utils/schemaScanner')
    const { RefResolver } = await import('./useSchema/resolvers/RefResolver')
    const mockReadTextFile = vi.mocked(readTextFile)
    const mockScanSchemaDirectory = vi.mocked(scanSchemaDirectory)
    
    const mockResolver = {
      resolve: vi.fn().mockImplementation((schema) => schema),
      debugBlocksSchema: vi.fn(),
      definitions: {},
      resolveRefs: vi.fn().mockImplementation((schema) => schema)
    }
    vi.mocked(RefResolver).mockImplementation(() => mockResolver as any)
    
    mockScanSchemaDirectory.mockResolvedValueOnce({})
    mockReadTextFile.mockResolvedValueOnce('type: object')
    vi.mocked(YAML.parse).mockReturnValue({ type: 'object' })
    
    const { result } = renderHook(() => useSchema())
    
    expect(result.current.loading).toBe(false)
    
    // Start loading - note that we can't check loading state immediately
    // because React batches state updates in act()
    const loadPromise = result.current.loadSchema('items')
    
    await act(async () => {
      await loadPromise
    })
    
    expect(result.current.loading).toBe(false)
    expect(result.current.schemas.items).toEqual({ type: 'object' })
  })

  it('should load definitions from schema directory', async () => {
    const { readTextFile } = await import('@tauri-apps/plugin-fs')
    const { scanSchemaDirectory } = await import('./useSchema/utils/schemaScanner')
    const mockReadTextFile = vi.mocked(readTextFile)
    const mockScanSchemaDirectory = vi.mocked(scanSchemaDirectory)
    
    const definitions = {
      'blocks/ItemBlock': { id: 'blocks/ItemBlock', type: 'object' }
    }
    
    mockScanSchemaDirectory.mockResolvedValueOnce(definitions)
    mockReadTextFile.mockResolvedValueOnce('type: object')
    vi.mocked(YAML.parse).mockReturnValueOnce({ type: 'object' })
    
    const { result } = renderHook(() => useSchema())
    
    await act(async () => {
      await result.current.loadSchema('items')
    })
    
    expect(mockScanSchemaDirectory).toHaveBeenCalledWith('/test/schema')
  })

  it('should fallback to sample schemas in dev mode', async () => {
    const { getSampleSchema } = await import('../utils/devFileSystem')
    const { scanSchemaDirectory } = await import('./useSchema/utils/schemaScanner')
    const { readTextFile } = await import('@tauri-apps/plugin-fs')
    const { RefResolver } = await import('./useSchema/resolvers/RefResolver')
    const mockGetSampleSchema = vi.mocked(getSampleSchema)
    const mockScanSchemaDirectory = vi.mocked(scanSchemaDirectory)
    const mockReadTextFile = vi.mocked(readTextFile)
    
    const mockResolver = {
      resolve: vi.fn().mockImplementation((schema) => schema),
      debugBlocksSchema: vi.fn(),
      definitions: {},
      resolveRefs: vi.fn().mockImplementation((schema) => schema)
    }
    vi.mocked(RefResolver).mockImplementation(() => mockResolver as any)
    
    // Empty definitions to trigger sample schema loading
    mockScanSchemaDirectory.mockResolvedValueOnce({})
    // Fail file system read to trigger fallback
    mockReadTextFile.mockRejectedValueOnce(new Error('File not found'))
    // Provide sample schema
    mockGetSampleSchema.mockResolvedValueOnce('type: object')
    vi.mocked(YAML.parse).mockReturnValueOnce({ type: 'object' })
    
    const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {})
    
    const { result } = renderHook(() => useSchema())
    
    await act(async () => {
      await result.current.loadSchema('items')
    })
    
    // Check that the debug messages were called
    expect(consoleSpy).toHaveBeenCalledWith('Loading sample schema for items in dev mode')
    expect(mockGetSampleSchema).toHaveBeenCalledWith('items')
  })

  it('should handle sample schema with definitions', async () => {
    const { getSampleSchema, getAllSampleSchemaMap } = await import('../utils/devFileSystem')
    const { scanSchemaDirectory } = await import('./useSchema/utils/schemaScanner')
    const { RefResolver } = await import('./useSchema/resolvers/RefResolver')
    const mockGetSampleSchema = vi.mocked(getSampleSchema)
    const mockGetAllSampleSchemaMap = vi.mocked(getAllSampleSchemaMap)
    const mockScanSchemaDirectory = vi.mocked(scanSchemaDirectory)
    
    const mockResolver = {
      resolve: vi.fn().mockImplementation((schema) => schema),
      debugBlocksSchema: vi.fn(),
      definitions: {},
      resolveRefs: vi.fn().mockImplementation((schema) => schema)
    }
    vi.mocked(RefResolver).mockImplementation(() => mockResolver as any)
    
    mockScanSchemaDirectory.mockRejectedValueOnce(new Error('No access'))
    
    const sampleSchemaMap = new Map([
      ['blocks/ItemBlock', 'blocks/ItemBlock']
    ])
    mockGetAllSampleSchemaMap.mockReturnValueOnce(sampleSchemaMap)
    
    mockGetSampleSchema
      .mockResolvedValueOnce('id: blocks/ItemBlock\ntype: object') // For definition
      .mockResolvedValueOnce('type: object') // For main schema
    
    vi.mocked(YAML.parse)
      .mockReturnValueOnce({ id: 'blocks/ItemBlock', type: 'object' })
      .mockReturnValueOnce({ type: 'object' })
    
    const { result } = renderHook(() => useSchema())
    
    await act(async () => {
      await result.current.loadSchema('items')
    })
    
    expect(result.current.schemas.items).toEqual({ type: 'object' })
  })

  it('should handle RefResolver properly', async () => {
    const { readTextFile } = await import('@tauri-apps/plugin-fs')
    const { scanSchemaDirectory } = await import('./useSchema/utils/schemaScanner')
    const { RefResolver } = await import('./useSchema/resolvers/RefResolver')
    const mockReadTextFile = vi.mocked(readTextFile)
    const mockScanSchemaDirectory = vi.mocked(scanSchemaDirectory)
    
    const mockSchema = { type: 'object', ref: 'blocks/ItemBlock' }
    const resolvedSchema = { type: 'object', properties: [] as any[] }
    
    mockScanSchemaDirectory.mockResolvedValueOnce({})
    mockReadTextFile.mockResolvedValueOnce('type: object\nref: blocks/ItemBlock')
    vi.mocked(YAML.parse).mockReturnValueOnce(mockSchema)
    
    const mockResolver = {
      resolve: vi.fn().mockReturnValueOnce(resolvedSchema),
      debugBlocksSchema: vi.fn(),
      definitions: {},
      resolveRefs: vi.fn().mockReturnValueOnce(resolvedSchema)
    }
    vi.mocked(RefResolver).mockImplementation(() => mockResolver as any)
    
    const { result } = renderHook(() => useSchema())
    
    await act(async () => {
      await result.current.loadSchema('items')
    })
    
    expect(mockResolver.resolve).toHaveBeenCalledWith(mockSchema)
    expect(mockResolver.debugBlocksSchema).toHaveBeenCalledWith(resolvedSchema, 'items')
    expect(result.current.schemas.items).toEqual(resolvedSchema)
  })

  it('should handle YAML parse error', async () => {
    const { readTextFile } = await import('@tauri-apps/plugin-fs')
    const { scanSchemaDirectory } = await import('./useSchema/utils/schemaScanner')
    const mockReadTextFile = vi.mocked(readTextFile)
    const mockScanSchemaDirectory = vi.mocked(scanSchemaDirectory)
    
    mockScanSchemaDirectory.mockResolvedValueOnce({})
    mockReadTextFile.mockResolvedValueOnce('invalid: yaml: content')
    vi.mocked(YAML.parse).mockImplementationOnce(() => {
      throw new Error('Invalid YAML')
    })
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    const { result } = renderHook(() => useSchema())
    
    let resolvedSchema
    await act(async () => {
      resolvedSchema = await result.current.loadSchema('items')
    })
    
    expect(resolvedSchema).toBeNull()
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error loading schema for items:',
      expect.any(Error)
    )
  })

  it('should handle missing sample schema in definitions', async () => {
    const { getSampleSchema, getAllSampleSchemaMap } = await import('../utils/devFileSystem')
    const { scanSchemaDirectory } = await import('./useSchema/utils/schemaScanner')
    const { RefResolver } = await import('./useSchema/resolvers/RefResolver')
    const mockGetSampleSchema = vi.mocked(getSampleSchema)
    const mockGetAllSampleSchemaMap = vi.mocked(getAllSampleSchemaMap)
    const mockScanSchemaDirectory = vi.mocked(scanSchemaDirectory)
    
    const mockResolver = {
      resolve: vi.fn().mockImplementation((schema) => schema),
      debugBlocksSchema: vi.fn(),
      definitions: {},
      resolveRefs: vi.fn().mockImplementation((schema) => schema)
    }
    vi.mocked(RefResolver).mockImplementation(() => mockResolver as any)
    
    mockScanSchemaDirectory.mockRejectedValueOnce(new Error('No access'))
    
    const sampleSchemaMap = new Map([
      ['blocks/MissingBlock', 'blocks/MissingBlock']
    ])
    mockGetAllSampleSchemaMap.mockReturnValueOnce(sampleSchemaMap)
    
    mockGetSampleSchema
      .mockRejectedValueOnce(new Error('Not found')) // For definition
      .mockResolvedValueOnce('type: object') // For main schema
    
    vi.mocked(YAML.parse).mockReturnValueOnce({ type: 'object' })
    
    const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {})
    
    const { result } = renderHook(() => useSchema())
    
    await act(async () => {
      await result.current.loadSchema('items')
    })
    
    expect(consoleSpy).toHaveBeenCalledWith('Sample schema blocks/MissingBlock not found')
    expect(result.current.schemas.items).toEqual({ type: 'object' })
  })
})