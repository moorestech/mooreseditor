// AI Generated Test Code
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { 
  getSampleJson, 
  getSampleSchema, 
  getSampleSchemaList,
  getSampleRefSchemaList,
  getAllSampleSchemaMap
} from './devFileSystem'

// Mock fetch
global.fetch = vi.fn()

// Mock console.error to prevent noise in test output
const originalConsoleError = console.error
beforeEach(() => {
  console.error = vi.fn()
})

afterEach(() => {
  console.error = originalConsoleError
})

describe('devFileSystem', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('getSampleJson', () => {
    it('should fetch and parse JSON data for valid file name', async () => {
      const mockData = {
        items: [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' }
        ]
      }

      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify(mockData)
      })

      const result = await getSampleJson('items')

      expect(fetch).toHaveBeenCalledWith('/src/sample/master/items.json')
      expect(result).toEqual(mockData)
    })

    it('should handle fetch errors', async () => {
      ;(fetch as any).mockRejectedValueOnce(new Error('Network error'))

      await expect(getSampleJson('items')).rejects.toThrow('Network error')
    })

    it('should handle non-ok responses', async () => {
      ;(fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404
      })

      await expect(getSampleJson('items')).rejects.toThrow('Failed to fetch /src/sample/master/items.json: 404')
    })

    it('should handle invalid JSON', async () => {
      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => 'invalid json'
      })

      await expect(getSampleJson('items')).rejects.toThrow()
    })

    it('should work with different file names', async () => {
      const mockData = { type: 'mapObjects' }

      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify(mockData)
      })

      const result = await getSampleJson('mapObjects')

      expect(fetch).toHaveBeenCalledWith('/src/sample/master/mapObjects.json')
      expect(result).toEqual(mockData)
    })
  })

  describe('getSampleSchema', () => {
    it('should fetch schema data for valid file name', async () => {
      const mockYaml = `
type: object
properties:
  id:
    type: integer
  name:
    type: string
`

      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => mockYaml
      })

      const result = await getSampleSchema('items')

      expect(fetch).toHaveBeenCalledWith('/src/sample/schema/items.yml')
      expect(result).toBe(mockYaml)
    })

    it('should return schema as text, not parsed', async () => {
      const mockYaml = 'type: object\nproperties:\n  test: true'

      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => mockYaml
      })

      const result = await getSampleSchema('test')

      expect(result).toBe(mockYaml)
      expect(typeof result).toBe('string')
    })

    it('should handle fetch errors', async () => {
      ;(fetch as any).mockRejectedValueOnce(new Error('Network error'))

      await expect(getSampleSchema('items')).rejects.toThrow('Network error')
    })

    it('should handle non-ok responses', async () => {
      ;(fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404
      })

      await expect(getSampleSchema('items')).rejects.toThrow('Failed to fetch /src/sample/schema/items.yml: 404')
    })
  })

  describe('getSampleSchemaList', () => {
    it('should return list of sample schema names', () => {
      const schemaList = getSampleSchemaList()

      expect(schemaList).toEqual(['mapObjects', 'blocks', 'items', 'objectSample'])
      expect(schemaList).toHaveLength(4)
    })

    it('should return an array', () => {
      const schemaList = getSampleSchemaList()
      expect(Array.isArray(schemaList)).toBe(true)
    })
  })

  describe('getSampleRefSchemaList', () => {
    it('should return list of ref schema names', () => {
      const refSchemaList = getSampleRefSchemaList()

      expect(refSchemaList).toEqual([
        'blockConnectInfo',
        'inventoryConnects',
        'gear',
        'mineSettings',
        'mapObjectMineSettings',
        'fluidInventoryConnects'
      ])
      expect(refSchemaList).toHaveLength(6)
    })

    it('should return an array', () => {
      const refSchemaList = getSampleRefSchemaList()
      expect(Array.isArray(refSchemaList)).toBe(true)
    })
  })

  describe('getAllSampleSchemaMap', () => {
    it('should return a map with all schemas', () => {
      const schemaMap = getAllSampleSchemaMap()

      expect(schemaMap).toBeInstanceOf(Map)
      expect(schemaMap.size).toBe(10) // 4 main + 6 ref schemas
    })

    it('should contain all main schemas', () => {
      const schemaMap = getAllSampleSchemaMap()

      expect(schemaMap.get('mapObjects')).toBe('mapObjects')
      expect(schemaMap.get('blocks')).toBe('blocks')
      expect(schemaMap.get('items')).toBe('items')
      expect(schemaMap.get('objectSample')).toBe('objectSample')
    })

    it('should contain all ref schemas with correct paths', () => {
      const schemaMap = getAllSampleSchemaMap()

      expect(schemaMap.get('ref/blockConnectInfo')).toBe('blockConnectInfo')
      expect(schemaMap.get('ref/inventoryConnects')).toBe('inventoryConnects')
      expect(schemaMap.get('ref/gear')).toBe('gear')
      expect(schemaMap.get('ref/mineSettings')).toBe('mineSettings')
      expect(schemaMap.get('ref/mapObjectMineSettings')).toBe('mapObjectMineSettings')
      expect(schemaMap.get('ref/fluidInventoryConnects')).toBe('fluidInventoryConnects')
    })

    it('should not contain invalid keys', () => {
      const schemaMap = getAllSampleSchemaMap()

      expect(schemaMap.has('nonexistent')).toBe(false)
      expect(schemaMap.has('ref/')).toBe(false)
      expect(schemaMap.has('')).toBe(false)
    })
  })

  describe('integration tests', () => {
    it('should handle concurrent requests', async () => {
      const mockData1 = { id: 1 }
      const mockSchema = 'type: object'

      ;(fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          text: async () => JSON.stringify(mockData1)
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => mockSchema
        })

      const [result1, result2] = await Promise.all([
        getSampleJson('file1'),
        getSampleSchema('schema1')
      ])

      expect(result1).toEqual(mockData1)
      expect(result2).toBe(mockSchema)
      expect(fetch).toHaveBeenCalledTimes(2)
    })

    it('should handle mixed success and failure', async () => {
      ;(fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          text: async () => JSON.stringify({ success: true })
        })
        .mockRejectedValueOnce(new Error('Network error'))

      const results = await Promise.allSettled([
        getSampleJson('success'),
        getSampleSchema('error')
      ])

      expect(results[0].status).toBe('fulfilled')
      expect((results[0] as any).value).toEqual({ success: true })
      expect(results[1].status).toBe('rejected')
      expect((results[1] as any).reason.message).toBe('Network error')
    })
  })
})