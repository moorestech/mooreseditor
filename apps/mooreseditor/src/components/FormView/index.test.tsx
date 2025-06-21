// AI Generated Test Code
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@/test/utils/test-utils'
import FormView from './index'
import '@testing-library/jest-dom'
import type { Schema } from '@/libs/schema/types'

// Mock child components
vi.mock('./Field', () => ({
  default: ({ path, data, onDataChange }: any) => (
    <div data-testid={`field-${path.join('-')}`}>
      <input
        data-testid={`input-${path.join('-')}`}
        value={JSON.stringify(data)}
        onChange={(e) => onDataChange(JSON.parse(e.target.value))}
      />
    </div>
  )
}))

vi.mock('./CollapsibleObject', () => ({
  default: ({ title, children }: any) => (
    <div data-testid="collapsible-object">
      <h3>{title}</h3>
      {children}
    </div>
  )
}))

describe('FormView', () => {
  const defaultProps = {
    jsonData: { name: 'test', value: 42 },
    schema: {
      type: 'object' as const,
      properties: [
        { key: 'name', type: 'string' as const },
        { key: 'value', type: 'integer' as const }
      ]
    },
    onDataChange: vi.fn()
  }

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render form fields', () => {
    render(<FormView {...defaultProps} />)
    
    expect(screen.getByTestId('field-name')).toBeInTheDocument()
    expect(screen.getByTestId('field-value')).toBeInTheDocument()
  })

  it('should render with title when schema has title', () => {
    const schemaWithTitle = {
      ...defaultProps.schema,
      title: 'Test Form'
    }
    
    render(<FormView {...defaultProps} schema={schemaWithTitle} />)
    
    // FormView doesn't display title, just verify it renders
    expect(screen.getByTestId('field-name')).toBeInTheDocument()
  })

  it('should handle null jsonData', () => {
    render(<FormView {...defaultProps} jsonData={null} />)
    
    // Should render without errors
    expect(screen.getByTestId('field-name')).toBeInTheDocument()
  })

  it('should handle undefined jsonData', () => {
    render(<FormView {...defaultProps} jsonData={undefined} />)
    
    // Should render without errors
    expect(screen.getByTestId('field-name')).toBeInTheDocument()
  })

  it('should handle empty object jsonData', () => {
    render(<FormView {...defaultProps} jsonData={{}} />)
    
    expect(screen.getByTestId('field-name')).toBeInTheDocument()
    expect(screen.getByTestId('field-value')).toBeInTheDocument()
  })

  it('should handle schema without properties', () => {
    const schemaWithoutProps = {
      type: 'object' as const
    }
    
    const { container } = render(<FormView {...defaultProps} schema={schemaWithoutProps} />)
    
    // Should render without errors (empty Stack)
    expect(container).toBeInTheDocument()
  })

  it('should handle array schema', () => {
    const arraySchema = {
      type: 'array' as const,
      items: { type: 'string' as const }
    }
    
    render(<FormView {...defaultProps} schema={arraySchema} jsonData={['item1', 'item2']} />)
    
    // Should render Field component for array
    expect(screen.getByTestId('field-')).toBeInTheDocument()
  })

  it('should handle nested object schema', () => {
    const nestedSchema = {
      type: 'object' as const,
      properties: [
        { 
          key: 'user',
          type: 'object' as const,
          properties: [
            { key: 'name', type: 'string' as const },
            { key: 'age', type: 'integer' as const }
          ]
        }
      ]
    }
    
    const nestedData = {
      user: { name: 'John', age: 30 }
    }
    
    render(<FormView {...defaultProps} schema={nestedSchema} data={nestedData} />)
    
    expect(screen.getByTestId('field-user')).toBeInTheDocument()
  })

  it('should call onDataChange when field changes', () => {
    const onDataChange = vi.fn()
    render(<FormView {...defaultProps} onDataChange={onDataChange} />)
    
    const input = screen.getByTestId('input-name')
    fireEvent.change(input, { target: { value: '"updated"' } })
    
    expect(onDataChange).toHaveBeenCalled()
  })

  it('should handle string schema (non-object)', () => {
    const stringSchema = {
      type: 'string' as const
    }
    
    render(<FormView {...defaultProps} schema={stringSchema} jsonData="test string" />)
    
    // Should render Field for simple type
    expect(screen.getByTestId('field-')).toBeInTheDocument()
  })

  it('should render with custom styles', () => {
    const { container } = render(<FormView {...defaultProps} />)
    
    const stackElement = container.querySelector('.mantine-Stack-root')
    expect(stackElement).toBeInTheDocument()
    // Mantine Stack uses CSS variables for gap
    expect(stackElement).toHaveStyle('--stack-gap: var(--mantine-spacing-sm)')
  })

  it('should handle schema with ui hints', () => {
    const schemaWithUi = {
      type: 'object' as const,
      properties: [
        { 
          key: 'name', 
          type: 'string' as const,
          uiOptions: { hidden: true }
        }
      ]
    }
    
    render(<FormView {...defaultProps} schema={schemaWithUi} />)
    
    // UI options would be handled by Field component
    expect(screen.getByTestId('field-name')).toBeInTheDocument()
  })

  it('should maintain data consistency on updates', () => {
    const onDataChange = vi.fn()
    const { rerender } = render(<FormView {...defaultProps} onDataChange={onDataChange} />)
    
    // Update props
    const newData = { name: 'updated', value: 100 }
    rerender(<FormView {...defaultProps} data={newData} onDataChange={onDataChange} />)
    
    // Check that new data is reflected
    const nameInput = screen.getByTestId('input-name')
    expect(nameInput).toHaveValue(JSON.stringify(newData.name))
  })
})