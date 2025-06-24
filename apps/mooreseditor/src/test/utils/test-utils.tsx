// AI Generated Test Code
import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'

interface AllTheProvidersProps {
  children: React.ReactNode
}

const AllTheProviders: React.FC<AllTheProvidersProps> = ({ children }) => {
  return (
    <MantineProvider>
      {children}
    </MantineProvider>
  )
}

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): ReturnType<typeof render> => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }