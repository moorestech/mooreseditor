import React, { useState } from "react";

import { describe, it, expect } from "vitest";

import blocksData from "../../../test/fixtures/blocks.json";
import { render, screen, fireEvent } from "../../../test/utils/test-utils";
import FormView from "../../FormView";
import { TableView } from "../index";

import type { Column } from "../../../schema";
import type { ArraySchema, Schema } from "../../../schema";

type BlockFixture = {
  blockGuid: string;
  name: string;
  overrideVerticalBlock?: {
    horizontalBlockGuid?: string;
    upBlockGuid?: string;
  };
};

const EDITED_BLOCK_NAME = "直線歯車ベルトコンベア";
const sourceBlocks = blocksData.data as BlockFixture[];
const editedBlock = sourceBlocks.find(
  (block) => block.name === EDITED_BLOCK_NAME,
);
if (!editedBlock?.overrideVerticalBlock?.upBlockGuid) {
  throw new Error("Expected edited block fixture with an upBlockGuid");
}

const referencedBlock = sourceBlocks.find(
  (block) => block.blockGuid === editedBlock.overrideVerticalBlock?.upBlockGuid,
);
if (!referencedBlock) {
  throw new Error("Expected referenced block fixture");
}

const testBlocksData = {
  ...blocksData,
  data: [referencedBlock, editedBlock],
};
const editedRowIndex = testBlocksData.data.findIndex(
  (block) => block.blockGuid === editedBlock.blockGuid,
);

const getNestedValue = (root: unknown, path: string[]) =>
  path.reduce<unknown>((acc, key) => {
    if (
      acc &&
      typeof acc === "object" &&
      key in (acc as Record<string, unknown>)
    ) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, root);

const blockItemSchema: Schema = {
  type: "object",
  properties: [
    { key: "blockGuid", type: "uuid" },
    { key: "name", type: "string" },
    {
      key: "overrideVerticalBlock",
      type: "object",
      properties: [
        {
          key: "upBlockGuid",
          type: "uuid",
          foreignKey: {
            schemaId: "blocks",
            foreignKeyIdPath: "/data/[*]/blockGuid",
            displayElementPath: "/data/[*]/name",
          },
        },
        {
          key: "horizontalBlockGuid",
          type: "uuid",
          foreignKey: {
            schemaId: "blocks",
            foreignKeyIdPath: "/data/[*]/blockGuid",
            displayElementPath: "/data/[*]/name",
          },
        },
      ],
    },
  ],
};

const blockArraySchema: ArraySchema = {
  type: "array",
  items: blockItemSchema,
};

type View =
  | { type: "form"; schema: Schema; path: string[] }
  | { type: "table"; schema: ArraySchema; path: string[] };

const Harness: React.FC = () => {
  const [jsonData, setJsonData] = useState<Column[]>([
    {
      title: "blocks",
      data: testBlocksData,
    },
  ]);

  const [views, setViews] = useState<View[]>([
    { type: "table", schema: blockArraySchema, path: ["data"] },
  ]);

  const currentData = jsonData[0];

  return (
    <div>
      {views.map((view, index) => {
        if (view.type === "table") {
          const nestedData = getNestedValue(currentData.data, view.path);
          const tableData = Array.isArray(nestedData) ? nestedData : [];
          return (
            <TableView
              key={`table-${index}`}
              schema={view.schema}
              data={tableData}
              jsonData={jsonData}
              onDataChange={(newData) => {
                setJsonData((prev) => {
                  const next = [...prev];
                  const updated = { ...next[0] };
                  const root = { ...updated.data };
                  root[view.path[0]] = newData;
                  updated.data = root;
                  next[0] = updated;
                  return next;
                });
              }}
              onRowSelect={(rowIndex) => {
                setViews((prev) => [
                  ...prev.slice(0, index + 1),
                  {
                    type: "form",
                    schema: view.schema.items!,
                    path: [...view.path, rowIndex.toString()],
                  },
                ]);
              }}
            />
          );
        }

        const data = getNestedValue(currentData.data, view.path);
        return (
          <FormView
            key={`form-${view.path.join(".")}`}
            schema={view.schema}
            data={data}
            jsonData={jsonData}
            rootData={currentData.data}
            onDataChange={() => {}}
            path={view.path}
          />
        );
      })}
    </div>
  );
};

describe("Table edit foreign key sync", () => {
  it("shows overrideVerticalBlock values after pressing Edit", async () => {
    render(<Harness />);

    const rowButtons = await screen.findAllByRole("button", { name: "Edit" });
    fireEvent.click(rowButtons[editedRowIndex]);

    await expect(
      screen.findByDisplayValue(referencedBlock.name),
    ).resolves.toBeInTheDocument();
    await expect(
      screen.findAllByDisplayValue(EDITED_BLOCK_NAME),
    ).resolves.toHaveLength(2);
  });
});
