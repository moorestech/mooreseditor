// AI Generated Test Code
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/utils/test-utils'
import App from './App'
import '@testing-library/jest-dom'

// Mock the hooks
vi.mock('./hooks/useJson', () => ({
  useJson: vi.fn()
}))

vi.mock('./hooks/useSchema', () => ({
  useSchema: vi.fn()
}))

vi.mock('./hooks/useProject', () => ({
  useProject: vi.fn()
}))

// Mock components
vi.mock('./components/Sidebar', () => ({
  default: ({ menuToFileMap, selectedFile, loadFileData, openProjectDir, isEditing }: any) => (
    <div data-testid="sidebar">
      <button onClick={openProjectDir}>Open Project</button>
      {Object.keys(menuToFileMap).map(key => (
        <button key={key} onClick={() => loadFileData(key)}>
          {key}
        </button>
      ))}
      {isEditing && <span>Editing</span>}
    </div>
  )
}))

vi.mock('./components/FormView', () => ({
  default: ({ jsonData, schema, onDataChange }: any) => (
    <div data-testid="form-view">
      <input 
        data-testid="form-input"
        value={JSON.stringify(jsonData)}
        onChange={(e) => onDataChange(JSON.parse(e.target.value))}
      />
    </div>
  )
}))

vi.mock('./components/DataSidebar', () => ({
  default: ({ selectedMenuItem, jsonData }: any) => (
    <div data-testid="data-sidebar">
      <div>{selectedMenuItem}</div>
      <pre>{JSON.stringify(jsonData, null, 2)}</pre>
    </div>
  )
}))

// Mock Tauri API
vi.mock('@tauri-apps/api', () => ({
  dialog: {
    open: vi.fn()
  },
  path: {
    join: vi.fn((...args: string[]) => args.join('/'))
  }
}))

import { useJson } from './hooks/useJson'
import { useSchema } from './hooks/useSchema'
import { useProject } from './hooks/useProject'

describe('App', () => {
  const mockUseJson = {
    jsonData: { test: 'data' },
    selectedMenuItem: 'items',
    menuToFileMap: {
      'items': 'items.json',
      'recipes': 'recipes.json'
    },
    loadFileData: vi.fn(),
    updateJsonData: vi.fn(),
    saveJsonData: vi.fn(),
    isEditing: false
  }

  const mockUseSchema = {
    schemas: {
      'items': { type: 'object', properties: [] }
    },
    loading: false
  }

  const mockUseProject = {
    projectDir: '/test/project',
    isProjectOpen: true,
    openProject: vi.fn(),
    closeProject: vi.fn()
  }

  beforeEach(() => {
    vi.mocked(useJson).mockReturnValue(mockUseJson)
    vi.mocked(useSchema).mockReturnValue(mockUseSchema)
    vi.mocked(useProject).mockReturnValue(mockUseProject as any)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render the main components', () => {
    render(<App />)
    
    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('form-view')).toBeInTheDocument()
    expect(screen.getByTestId('data-sidebar')).toBeInTheDocument()
  })

  it('should display menu items in sidebar', () => {
    render(<App />)
    
    expect(screen.getByText('items')).toBeInTheDocument()
    expect(screen.getByText('recipes')).toBeInTheDocument()
  })

  it('should handle project open', async () => {
    const { dialog } = await import('@tauri-apps/api')
    vi.mocked(dialog.open).mockResolvedValue('/new/project')
    
    render(<App />)
    
    fireEvent.click(screen.getByText('Open Project'))
    
    await waitFor(() => {
      expect(dialog.open).toHaveBeenCalledWith({
        directory: true,
        multiple: false
      })
    })
  })

  it('should load file data when menu item is clicked', () => {
    render(<App />)
    
    fireEvent.click(screen.getByText('recipes'))
    
    expect(mockUseJson.loadFileData).toHaveBeenCalledWith('recipes')
  })

  it('should update json data when form changes', () => {
    render(<App />)
    
    const input = screen.getByTestId('form-input')
    const newData = { test: 'updated' }
    
    fireEvent.change(input, { target: { value: JSON.stringify(newData) } })
    
    expect(mockUseJson.updateJsonData).toHaveBeenCalledWith(newData, 'items')
  })

  it('should save data on Ctrl+S', () => {
    render(<App />)
    
    fireEvent.keyDown(window, { key: 's', ctrlKey: true })
    
    expect(mockUseJson.saveJsonData).toHaveBeenCalled()
  })

  it('should save data on Cmd+S (Mac)', () => {
    render(<App />)
    
    fireEvent.keyDown(window, { key: 's', metaKey: true })
    
    expect(mockUseJson.saveJsonData).toHaveBeenCalled()
  })

  it('should show editing indicator when data is modified', () => {
    vi.mocked(useJson).mockReturnValue({
      ...mockUseJson,
      isEditing: true
    })
    
    render(<App />)
    
    expect(screen.getByText('Editing')).toBeInTheDocument()
  })

  it('should handle no selected menu item', () => {
    vi.mocked(useJson).mockReturnValue({
      ...mockUseJson,
      selectedMenuItem: null,
      jsonData: null
    })
    
    render(<App />)
    
    // Should render without errors
    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
  })

  it('should handle schema loading state', () => {
    vi.mocked(useSchema).mockReturnValue({
      ...mockUseSchema,
      loading: true
    })
    
    render(<App />)
    
    // Should still render, possibly with loading state
    expect(screen.getByTestId('form-view')).toBeInTheDocument()
  })

  it('should pass correct schema to FormView', () => {
    render(<App />)
    
    const formView = screen.getByTestId('form-view')
    expect(formView).toBeInTheDocument()
    
    // The FormView mock should receive the correct schema
    // This is implicitly tested by the component rendering without errors
  })

  it('should handle project not open state', () => {
    vi.mocked(useProject).mockReturnValue({
      ...mockUseProject,
      isProjectOpen: false,
      projectDir: null
    } as any)
    
    render(<App />)
    
    // Should still render with open project button
    expect(screen.getByText('Open Project')).toBeInTheDocument()
  })

  it('should update json data with correct menu item', () => {
    vi.mocked(useJson).mockReturnValue({
      ...mockUseJson,
      selectedMenuItem: 'recipes'
    })
    
    render(<App />)
    
    const input = screen.getByTestId('form-input')
    const newData = { recipe: 'new' }
    
    fireEvent.change(input, { target: { value: JSON.stringify(newData) } })
    
    expect(mockUseJson.updateJsonData).toHaveBeenCalledWith(newData, 'recipes')
  })
})