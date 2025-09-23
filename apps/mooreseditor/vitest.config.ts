import path from 'path'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
      '**/test-examples/**'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData.ts',
        'src/main.tsx',
        'src/vite-env.d.ts',
        '**/index.ts', // barrel exports
        'test-examples/**',
      ],
      include: [
        'src/**/*.{ts,tsx}'
      ],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 90,
        statements: 90
      },
      all: true
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@tauri-apps/api/path': path.resolve(__dirname, './src/test/mocks/tauri-api-path.ts'),
      '@tauri-apps/plugin-dialog': path.resolve(__dirname, './src/test/mocks/tauri-plugin-dialog.ts'),
      '@tauri-apps/plugin-fs': path.resolve(__dirname, './src/test/mocks/tauri-plugin-fs.ts'),
      '@tauri-apps/api': path.resolve(__dirname, './src/test/mocks/tauri.ts'),
    },
  },
})