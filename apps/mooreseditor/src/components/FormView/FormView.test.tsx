import { MantineProvider } from '@mantine/core';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import FormView from './index';

import type { ObjectSchema, ArraySchema } from '../../libs/schema/types';

describe('FormView openedByDefault', () => {
  it('should auto-open object arrays with openedByDefault=true', async () => {
    const onObjectArrayClick = vi.fn();
    
    const schema: ObjectSchema = {
      type: 'object',
      properties: [
        {
          key: 'items',
          type: 'array',
          openedByDefault: true,
          items: {
            type: 'object',
            properties: [
              { key: 'id', type: 'string' },
              { key: 'name', type: 'string' }
            ]
          }
        } as ArraySchema & { key: string }
      ]
    };

    const data = {
      items: [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' }
      ]
    };

    render(
      <MantineProvider>
        <FormView
          schema={schema}
          data={data}
          onDataChange={() => {}}
          onObjectArrayClick={onObjectArrayClick}
        />
      </MantineProvider>
    );

    // Wait for useEffect to run
    await waitFor(() => {
      expect(onObjectArrayClick).toHaveBeenCalledWith(
        ['items'],
        expect.objectContaining({
          type: 'array',
          openedByDefault: true
        })
      );
    });
  });

  it('should not auto-open object arrays without openedByDefault', async () => {
    const onObjectArrayClick = vi.fn();
    
    const schema: ObjectSchema = {
      type: 'object',
      properties: [
        {
          key: 'items',
          type: 'array',
          items: {
            type: 'object',
            properties: [
              { key: 'id', type: 'string' },
              { key: 'name', type: 'string' }
            ]
          }
        } as ArraySchema & { key: string }
      ]
    };

    const data = {
      items: [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' }
      ]
    };

    render(
      <MantineProvider>
        <FormView
          schema={schema}
          data={data}
          onDataChange={() => {}}
          onObjectArrayClick={onObjectArrayClick}
        />
      </MantineProvider>
    );

    // Wait to ensure useEffect has run
    await waitFor(() => {
      expect(screen.getByText('Edit items')).toBeInTheDocument();
    });

    // onObjectArrayClick should not have been called
    expect(onObjectArrayClick).not.toHaveBeenCalled();
  });
});