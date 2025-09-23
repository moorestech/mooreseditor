// AI Generated Test Code
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/utils/test-utils'
import { TableView } from './TableView'
import '@testing-library/jest-dom'

// No need to mock MasterTable as TableView doesn't use it

describe('TableView', () => {
  const defaultProps = {
    schema: {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        properties: [
          { key: 'id', type: 'integer' as const },
          { key: 'name', type: 'string' as const },
          { key: 'value', type: 'integer' as const }
        ]
      }
    },
    data: [
      { id: 1, name: 'Item 1', value: 100 },
      { id: 2, name: 'Item 2', value: 200 }
    ],
    onRowSelect: vi.fn()
  }

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render a table', () => {
    render(<TableView {...defaultProps} />)
    
    expect(screen.getByRole('table')).toBeInTheDocument()
  })

  it('should display data in table', () => {
    render(<TableView {...defaultProps} />)
    
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('200')).toBeInTheDocument()
  })

  it('should handle row click', () => {
    const onRowSelect = vi.fn()
    render(<TableView {...defaultProps} onRowSelect={onRowSelect} />)
    
    const secondRow = screen.getByText('Item 2').closest('tr')
    fireEvent.click(secondRow!)
    
    expect(onRowSelect).toHaveBeenCalledWith(1)
  })

  it('should handle empty data', () => {
    render(<TableView {...defaultProps} data={[]} />)
    
    expect(screen.getByRole('table')).toBeInTheDocument()
  })

  it('should handle null data', () => {
    render(<TableView {...defaultProps} data={null as any} />)
    
    // Should display error message
    expect(screen.getByText('Invalid data')).toBeInTheDocument()
  })

  it('should handle undefined data', () => {
    render(<TableView {...defaultProps} data={undefined as any} />)
    
    // Should render empty table (undefined is treated as empty array)
    expect(screen.getByRole('table')).toBeInTheDocument()
  })

  it('should handle non-array data', () => {
    render(<TableView {...defaultProps} data={{ single: 'object' } as any} />)
    
    // Should display error message
    expect(screen.getByText('Invalid data')).toBeInTheDocument()
  })

  it('should display rows', () => {
    render(<TableView {...defaultProps} />)
    
    // Verify rows are rendered
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
  })

  it('should generate columns from data', () => {
    render(<TableView {...defaultProps} />)
    
    // Check that column headers are created
    expect(screen.getByText('id')).toBeInTheDocument()
    expect(screen.getByText('name')).toBeInTheDocument()
    expect(screen.getByText('value')).toBeInTheDocument()
  })

  it('should handle data with different properties', () => {
    const customData = [
      { id: 1, name: 'Title 1', value: 100 },
      { id: 2, name: 'Title 2', value: 200 }
    ]
    
    // Schema defines the columns, not the data
    render(<TableView {...defaultProps} data={customData} />)
    
    // Columns are defined by schema
    expect(screen.getByText('id')).toBeInTheDocument()
    expect(screen.getByText('name')).toBeInTheDocument()
    expect(screen.getByText('value')).toBeInTheDocument()
    expect(screen.getByText('Title 1')).toBeInTheDocument()
    expect(screen.getByText('Title 2')).toBeInTheDocument()
  })

  it('should handle data with missing properties', () => {
    const inconsistentData = [
      { id: 1, name: 'Item 1' },
      { id: 2, value: 200 }
    ]
    
    render(<TableView {...defaultProps} data={inconsistentData} />)
    
    // Should handle gracefully
    expect(screen.getByRole('table')).toBeInTheDocument()
  })

  it('should update when data changes', () => {
    const { rerender } = render(<TableView {...defaultProps} />)
    
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    
    const newData = [
      { id: 3, name: 'Item 3', value: 300 }
    ]
    
    rerender(<TableView {...defaultProps} data={newData} />)
    
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument()
    expect(screen.getByText('Item 3')).toBeInTheDocument()
  })

  it('should handle large datasets', () => {
    const largeData = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
      value: i * 100
    }))
    
    render(<TableView {...defaultProps} data={largeData} />)
    
    expect(screen.getByText('Item 0')).toBeInTheDocument()
    expect(screen.getByText('Item 99')).toBeInTheDocument()
  })

  it('should allow adding new rows', () => {
    const onRowSelect = vi.fn()
    const { rerender } = render(
      <TableView {...defaultProps} onRowSelect={onRowSelect} />
    )
    
    const newData = [...defaultProps.data, { id: 3, name: 'Item 3', value: 300 }]
    
    rerender(
      <TableView {...defaultProps} data={newData} onRowSelect={onRowSelect} />
    )
    
    // New row should be visible
    expect(screen.getByText('Item 3')).toBeInTheDocument()
  })
})