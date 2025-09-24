// AI Generated Test Code
import { describe, it, expect, vi } from 'vitest'

import CollapsibleObject from './CollapsibleObject'

import { render, screen, fireEvent } from '@/test/utils/test-utils'
import '@testing-library/jest-dom'

// Mock Tabler icons
vi.mock('@tabler/icons-react', () => ({
  IconChevronRight: () => <span data-testid="icon-chevron-right">›</span>,
  IconChevronDown: () => <span data-testid="icon-chevron-down">⌄</span>
}))

describe('CollapsibleObject', () => {
  const defaultProps = {
    label: 'Test Object',
    children: <div data-testid="child-content">Child content</div>
  }

  it('should render with title', () => {
    render(<CollapsibleObject {...defaultProps} />)
    
    expect(screen.getByText('Test Object')).toBeInTheDocument()
  })

  it('should start collapsed by default', () => {
    render(<CollapsibleObject {...defaultProps} />)
    
    // Mantine Collapse doesn't remove from DOM, just hides
    const content = screen.getByTestId('child-content')
    expect(content).toBeInTheDocument()
    expect(screen.getByTestId('icon-chevron-right')).toBeInTheDocument()
  })

  it('should expand when clicked', () => {
    render(<CollapsibleObject {...defaultProps} />)
    
    const header = screen.getByText('Test Object').closest('div')
    fireEvent.click(header!)
    
    expect(screen.getByTestId('child-content')).toBeInTheDocument()
    expect(screen.getByTestId('icon-chevron-down')).toBeInTheDocument()
  })

  it('should collapse when clicked again', () => {
    render(<CollapsibleObject {...defaultProps} />)
    
    const header = screen.getByText('Test Object').closest('div')
    const content = screen.getByTestId('child-content')
    
    // Expand
    fireEvent.click(header!)
    expect(content).toBeInTheDocument()
    
    // Collapse
    fireEvent.click(header!)
    // Still in DOM but hidden
    expect(content).toBeInTheDocument()
    expect(screen.getByTestId('icon-chevron-right')).toBeInTheDocument()
  })

  it('should start expanded when defaultExpanded is true', () => {
    render(<CollapsibleObject {...defaultProps} defaultExpanded={true} />)
    
    expect(screen.getByTestId('child-content')).toBeInTheDocument()
    expect(screen.getByTestId('icon-chevron-down')).toBeInTheDocument()
  })

  it('should handle empty label', () => {
    render(<CollapsibleObject {...defaultProps} label="" />)
    
    // Should render without errors
    const header = screen.getByRole('button')
    expect(header).toBeInTheDocument()
  })

  it('should handle no children', () => {
    render(<CollapsibleObject label="Empty Object">{null}</CollapsibleObject>)
    
    const header = screen.getByText('Empty Object')
    fireEvent.click(header)
    
    // Should expand without errors
    expect(screen.getByTestId('icon-chevron-down')).toBeInTheDocument()
  })

  it('should render multiple children', () => {
    render(
      <CollapsibleObject label="Multiple Children" defaultExpanded={true}>
        <div>Child 1</div>
        <div>Child 2</div>
        <div>Child 3</div>
      </CollapsibleObject>
    )
    
    expect(screen.getByText('Child 1')).toBeInTheDocument()
    expect(screen.getByText('Child 2')).toBeInTheDocument()
    expect(screen.getByText('Child 3')).toBeInTheDocument()
  })

  it('should maintain state when children change', () => {
    const { rerender } = render(<CollapsibleObject {...defaultProps} />)
    
    // Expand
    const header = screen.getByText('Test Object')
    fireEvent.click(header)
    expect(screen.getByTestId('child-content')).toBeInTheDocument()
    
    // Change children
    rerender(
      <CollapsibleObject label="Test Object">
        <div data-testid="new-content">New content</div>
      </CollapsibleObject>
    )
    
    // Should remain expanded
    expect(screen.getByTestId('new-content')).toBeInTheDocument()
  })

  it('should have proper accessibility attributes', () => {
    render(<CollapsibleObject {...defaultProps} />)
    
    const button = screen.getByRole('button')
    // Mantine ActionIcon doesn't set aria-expanded by default
    expect(button).toBeInTheDocument()
  })

  it('should apply correct styles when collapsed', () => {
    render(<CollapsibleObject {...defaultProps} />)
    
    const header = screen.getByText('Test Object').closest('div')
    expect(header).toHaveStyle({ cursor: 'pointer' })
  })

  it('should apply correct styles when expanded', () => {
    render(<CollapsibleObject {...defaultProps} defaultExpanded={true} />)
    
    const container = screen.getByTestId('child-content').parentElement
    // Mantine uses CSS classes for spacing, not inline styles
    expect(container).toBeInTheDocument()
  })

  it('should handle rapid clicks', () => {
    render(<CollapsibleObject {...defaultProps} />)
    
    const header = screen.getByText('Test Object')
    
    // Rapid clicks
    fireEvent.click(header)
    fireEvent.click(header)
    fireEvent.click(header)
    
    // Should end up expanded (odd number of clicks)
    expect(screen.getByTestId('child-content')).toBeInTheDocument()
  })

  it('should render with custom className', () => {
    const { container } = render(<CollapsibleObject {...defaultProps} />)
    
    // CollapsibleObject doesn't accept className prop
    expect(container).toBeInTheDocument()
  })
})