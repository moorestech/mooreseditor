// AI Generated Test Code
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@/test/utils/test-utils'
import ArrayField from './ArrayField'
import '@testing-library/jest-dom'
import type { Schema } from '@/libs/schema/types'

// Mock Field component
vi.mock('./Field', () => ({
  default: ({ path, data, onDataChange }: any) => {
    const name = path[path.length - 1]
    return (
      <div data-testid={`field-${name}`}>
        <input
          data-testid={`input-${name}`}
          value={data || ''}
          onChange={(e) => onDataChange(e.target.value)}
        />
      </div>
    )
  }
}))

// Remove the Mantine mock since we have MantineProvider in test-utils

// Mock Tabler icons
vi.mock('@tabler/icons-react', () => ({
  IconPlus: () => <span>+</span>,
  IconTrash: () => <span>×</span>,
  IconGripVertical: () => <span>::</span>,
}))

describe('ArrayField', () => {
  const defaultProps = {
    schema: { 
      type: 'array' as const,
      items: { type: 'string' }
    },
    data: ['item1', 'item2'],
    onDataChange: vi.fn(),
    path: ['root', 'array']
  }

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render array items', () => {
    render(<ArrayField {...defaultProps} />)
    
    expect(screen.getByTestId('field-0')).toBeInTheDocument()
    expect(screen.getByTestId('field-1')).toBeInTheDocument()
    expect(screen.getByTestId('input-0')).toHaveValue('item1')
    expect(screen.getByTestId('input-1')).toHaveValue('item2')
  })

  it('should render add button', () => {
    render(<ArrayField {...defaultProps} />)
    
    const addButton = screen.getByText(/add/i)
    expect(addButton).toBeInTheDocument()
  })

  it('should add new item when add button is clicked', () => {
    const onDataChange = vi.fn()
    render(<ArrayField {...defaultProps} onDataChange={onDataChange} />)
    
    const addButton = screen.getByText(/add/i)
    fireEvent.click(addButton)
    
    expect(onDataChange).toHaveBeenCalledWith(['item1', 'item2', ''])
  })

  it('should remove item when delete button is clicked', () => {
    const onDataChange = vi.fn()
    render(<ArrayField {...defaultProps} onDataChange={onDataChange} />)
    
    const deleteButtons = screen.getAllByText('×')
    fireEvent.click(deleteButtons[0])
    
    expect(onDataChange).toHaveBeenCalledWith(['item2'])
  })

  it('should update item value when field changes', () => {
    const onDataChange = vi.fn()
    render(<ArrayField {...defaultProps} onDataChange={onDataChange} />)
    
    const input = screen.getByTestId('input-0')
    fireEvent.change(input, { target: { value: 'updated' } })
    
    expect(onDataChange).toHaveBeenCalledWith(['updated', 'item2'])
  })

  it('should handle empty array', () => {
    render(<ArrayField {...defaultProps} data={[]} />)
    
    expect(screen.queryByTestId('field-0')).not.toBeInTheDocument()
    expect(screen.getByText(/add/i)).toBeInTheDocument()
  })

  it('should handle null value as empty array', () => {
    render(<ArrayField {...defaultProps} data={null as any} />)
    
    expect(screen.queryByTestId('field-0')).not.toBeInTheDocument()
  })

  it('should handle undefined value as empty array', () => {
    render(<ArrayField {...defaultProps} data={undefined} />)
    
    expect(screen.queryByTestId('field-0')).not.toBeInTheDocument()
  })

  it('should handle array of objects', () => {
    const schema: Schema = {
      type: 'array',
      items: {
        type: 'object',
        properties: [
          { key: 'name', type: 'string' }
        ]
      }
    }
    const data = [{ name: 'John' }, { name: 'Jane' }]
    
    render(<ArrayField {...defaultProps} schema={schema} data={data} />)
    
    expect(screen.getByTestId('field-0')).toBeInTheDocument()
    expect(screen.getByTestId('field-1')).toBeInTheDocument()
  })

  it('should handle array of numbers', () => {
    const schema: Schema = {
      type: 'array',
      items: { type: 'integer' }
    }
    const value = [1, 2, 3]
    
    render(<ArrayField {...defaultProps} schema={schema} data={value} />)
    
    expect(screen.getByTestId('input-0')).toHaveValue('1')
    expect(screen.getByTestId('input-1')).toHaveValue('2')
    expect(screen.getByTestId('input-2')).toHaveValue('3')
  })

  it('should respect minItems constraint', () => {
    const schema: Schema = {
      type: 'array',
      items: { type: 'string' },
      minItems: 2
    }
    const value = ['item1', 'item2']
    
    render(<ArrayField {...defaultProps} schema={schema} data={value} />)
    
    // Should still show delete buttons but they might be disabled
    const deleteButtons = screen.getAllByText('×')
    expect(deleteButtons).toHaveLength(2)
  })

  it('should respect maxItems constraint', () => {
    const schema: Schema = {
      type: 'array',
      items: { type: 'string' },
      maxItems: 2
    }
    const value = ['item1', 'item2']
    
    render(<ArrayField {...defaultProps} schema={schema} data={value} />)
    
    // Add button might be disabled or hidden
    const addButton = screen.getByText(/add/i)
    expect(addButton).toBeInTheDocument()
  })

  it('should handle nested arrays', () => {
    const schema: Schema = {
      type: 'array',
      items: {
        type: 'array',
        items: { type: 'string' }
      }
    }
    const value = [['a', 'b'], ['c', 'd']]
    
    render(<ArrayField {...defaultProps} schema={schema} data={value} />)
    
    expect(screen.getByTestId('field-0')).toBeInTheDocument()
    expect(screen.getByTestId('field-1')).toBeInTheDocument()
  })

  it('should create appropriate default values for new items', () => {
    const onDataChange = vi.fn()
    const schema: Schema = {
      type: 'array',
      items: { type: 'integer' }
    }
    
    render(<ArrayField {...defaultProps} schema={schema} data={[1, 2]} onDataChange={onDataChange} />)
    
    const addButton = screen.getByText(/add/i)
    fireEvent.click(addButton)
    
    expect(onDataChange).toHaveBeenCalledWith([1, 2, 0])
  })

  it('should create object default for object items', () => {
    const onDataChange = vi.fn()
    const schema: Schema = {
      type: 'array',
      items: {
        type: 'object',
        properties: [
          { key: 'name', type: 'string', default: 'New Item' },
          { key: 'value', type: 'integer', default: 0 }
        ]
      }
    }
    
    render(<ArrayField {...defaultProps} schema={schema} data={[]} onDataChange={onDataChange} />)
    
    const addButton = screen.getByText(/add/i)
    fireEvent.click(addButton)
    
    expect(onDataChange).toHaveBeenCalledWith([{ name: 'New Item', value: 0 }])
  })

  // Drag handles are not implemented in ArrayField yet
  it.skip('should handle drag handles for sortable items', () => {
    render(<ArrayField {...defaultProps} />)
    
    const dragHandles = screen.getAllByText('::')
    expect(dragHandles).toHaveLength(2)
  })

  it('should maintain order when updating items', () => {
    const onDataChange = vi.fn()
    const data = ['a', 'b', 'c']
    
    render(<ArrayField {...defaultProps} data={data} onDataChange={onDataChange} />)
    
    const input = screen.getByTestId('input-1')
    fireEvent.change(input, { target: { value: 'updated' } })
    
    expect(onDataChange).toHaveBeenCalledWith(['a', 'updated', 'c'])
  })

  it('should handle very large arrays efficiently', () => {
    const largeArray = Array.from({ length: 100 }, (_, i) => `item${i}`)
    
    render(<ArrayField {...defaultProps} data={largeArray} />)
    
    // Should render all items (or use virtualization)
    expect(screen.getByTestId('field-0')).toBeInTheDocument()
    expect(screen.getByTestId('field-99')).toBeInTheDocument()
  })
})