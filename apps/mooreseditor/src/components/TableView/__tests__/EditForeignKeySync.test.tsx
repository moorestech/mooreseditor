import { render, screen, fireEvent } from '@/test/utils/test-utils'
import { describe, it, expect } from 'vitest'
import React, { useState } from 'react'

import { TableView } from '../index'
import FormView from '../../FormView'

import type { ArraySchema, Schema } from '@/libs/schema/types'
import type { Column } from '@/hooks/useJson'

const blocksData = require('../../../../public/src/sample/master/blocks.json')

const blockItemSchema: Schema = {
  type: 'object',
  properties: [
    { key: 'blockGuid', type: 'uuid' },
    { key: 'name', type: 'string' },
    {
      key: 'overrideVerticalBlock',
      type: 'object',
      properties: [
        {
          key: 'upBlockGuid',
          type: 'uuid',
          foreignKey: {
            schemaId: 'blocks',
            foreignKeyIdPath: '/data/[*]/blockGuid',
            displayElementPath: '/data/[*]/name'
          }
        },
        {
          key: 'horizontalBlockGuid',
          type: 'uuid',
          foreignKey: {
            schemaId: 'blocks',
            foreignKeyIdPath: '/data/[*]/blockGuid',
            displayElementPath: '/data/[*]/name'
          }
        }
      ]
    }
  ]
}

const blockArraySchema: ArraySchema = {
  type: 'array',
  items: blockItemSchema
}

type View =
  | { type: 'form'; schema: Schema; path: string[] }
  | { type: 'table'; schema: ArraySchema; path: string[] }

const Harness: React.FC = () => {
  const [jsonData, setJsonData] = useState<Column[]>([
    {
      title: 'blocks',
      data: blocksData
    }
  ])

  const [views, setViews] = useState<View[]>([
    { type: 'table', schema: blockArraySchema, path: ['data'] }
  ])

  const currentData = jsonData[0]

  return (
    <div>
      {views.map((view, index) => {
        if (view.type === 'table') {
          const data = view.path.reduce((acc: any, key) => acc?.[key], currentData.data)
          return (
            <TableView
              key={`table-${index}`}
              schema={view.schema}
              data={data}
              jsonData={jsonData}
              onDataChange={(newData) => {
                setJsonData(prev => {
                  const next = [...prev]
                  const updated = { ...next[0] }
                  const root = { ...updated.data }
                  root[view.path[0]] = newData
                  updated.data = root
                  next[0] = updated
                  return next
                })
              }}
              onRowSelect={(rowIndex) => {
                setViews(prev => [
                  ...prev.slice(0, index + 1),
                  { type: 'form', schema: view.schema.items!, path: [...view.path, rowIndex.toString()] }
                ])
              }}
            />
          )
        }

        const data = view.path.reduce((acc: any, key) => acc?.[key], currentData.data)
        return (
          <FormView
            key={`form-${view.path.join('.')}`}
            schema={view.schema}
            data={data}
            jsonData={jsonData}
            rootData={currentData.data}
            onDataChange={() => {}}
            path={view.path}
          />
        )
      })}
    </div>
  )
}

describe('Table edit foreign key sync', () => {
  it('shows overrideVerticalBlock values after pressing Edit', async () => {
    render(<Harness />)

    const rowButtons = await screen.findAllByRole('button', { name: 'Edit' })
    fireEvent.click(rowButtons[10])

    await expect(screen.findByDisplayValue('上り歯車ベルトコンベア')).resolves.toBeInTheDocument()
    await expect(screen.findAllByDisplayValue('直線歯車ベルトコンベア')).resolves.toHaveLength(2)
  })
})
