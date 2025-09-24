import React from "react";

import { describe, it, expect } from "vitest";

import blocksData from "../../../../public/src/sample/master/blocks.json";
import FormView from "../index";

import type { Column } from "@/hooks/useJson";
import type { Schema } from "@/libs/schema/types";

import { render, screen } from "@/test/utils/test-utils";

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

describe("blocks foreign key rendering", () => {
  it("displays current labels for nested foreign key fields", async () => {
    const jsonData: Column[] = [
      {
        title: "blocks",
        data: blocksData,
      },
    ];

    const targetRow = blocksData.data[10];

    render(
      <FormView
        schema={blockItemSchema}
        data={targetRow}
        jsonData={jsonData}
        onDataChange={() => {}}
        rootData={blocksData}
        path={["data", "10"]}
      />,
    );

    await expect(
      screen.findByDisplayValue("上り歯車ベルトコンベア"),
    ).resolves.toBeInTheDocument();
    await expect(
      screen.findByDisplayValue("直線歯車ベルトコンベア"),
    ).resolves.toBeInTheDocument();
  });

  it("updates labels when referenced block name changes", async () => {
    const baseData = JSON.parse(JSON.stringify(blocksData));
    const updatedData = JSON.parse(JSON.stringify(blocksData));

    const targetIndex = 10;
    const baseRow = baseData.data[targetIndex];
    const referencedGuid = baseRow?.overrideVerticalBlock?.horizontalBlockGuid;

    if (!referencedGuid) {
      throw new Error("Test fixture missing horizontalBlockGuid");
    }

    const newLabel = "直線歯車ベルトコンベア（更新）";
    const referencedBlock = updatedData.data.find(
      (item: any) => item.blockGuid === referencedGuid,
    );
    if (!referencedBlock) {
      throw new Error("Test fixture missing referenced block");
    }
    referencedBlock.name = newLabel;

    const { rerender } = render(
      <FormView
        schema={blockItemSchema}
        data={baseRow}
        jsonData={[{ title: "blocks", data: baseData }]}
        onDataChange={() => {}}
        rootData={baseData}
        path={["data", targetIndex.toString()]}
      />,
    );

    await expect(
      screen.findByDisplayValue("直線歯車ベルトコンベア"),
    ).resolves.toBeInTheDocument();

    rerender(
      <FormView
        schema={blockItemSchema}
        data={updatedData.data[targetIndex]}
        jsonData={[{ title: "blocks", data: updatedData }]}
        onDataChange={() => {}}
        rootData={updatedData}
        path={["data", targetIndex.toString()]}
      />,
    );

    await expect(
      screen.findByDisplayValue(newLabel),
    ).resolves.toBeInTheDocument();
  });
});
