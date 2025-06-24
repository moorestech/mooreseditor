import { vi } from 'vitest'

// Mock all Tauri modules before any imports with hoisting
vi.mock('@tauri-apps/api/path', () => ({
  join: vi.fn((...args: string[]) => args.join('/')),
  dirname: vi.fn((path: string) => {
    const parts = path.split('/')
    parts.pop()
    return parts.join('/')
  }),
  basename: vi.fn((path: string) => {
    const parts = path.split('/')
    return parts[parts.length - 1]
  }),
  extname: vi.fn((path: string) => {
    const parts = path.split('.')
    return parts.length > 1 ? `.${parts[parts.length - 1]}` : ''
  }),
  resolve: vi.fn((...paths: string[]) => paths.join('/')),
  normalize: vi.fn((path: string) => path)
}))

vi.mock('@tauri-apps/plugin-dialog', () => ({
  open: vi.fn(),
  save: vi.fn(),
  message: vi.fn(),
  ask: vi.fn(),
  confirm: vi.fn()
}))

vi.mock('@tauri-apps/plugin-fs', () => ({
  readTextFile: vi.fn(),
  writeTextFile: vi.fn(),
  exists: vi.fn(),
  createDir: vi.fn(),
  readDir: vi.fn(),
  removeFile: vi.fn(),
  removeDir: vi.fn(),
  copyFile: vi.fn(),
  renameFile: vi.fn()
}))