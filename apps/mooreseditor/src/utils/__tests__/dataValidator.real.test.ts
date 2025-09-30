import * as fs from "fs";
import * as path from "path";

import { describe, it, expect } from "vitest";
import * as yaml from "yaml";

import { validateAndFillMissingFields } from "../dataValidator";

describe("dataValidator with real schema", () => {
  it("should validate blocks.json data[60] with real blocks.yml schema", async () => {
    // Load real blocks.yml schema
    const schemaPath = path.join(
      process.cwd(),
      "public/src/sample/schema/blocks.yml",
    );
    const schemaContent = fs.readFileSync(schemaPath, "utf-8");
    const schema = yaml.parse(schemaContent);

    console.log("Schema type:", schema.type);
    console.log("Schema has properties:", !!schema.properties);
    console.log("Properties count:", schema.properties?.length);

    // Find data property
    const dataProperty = schema.properties?.find((p: any) => p.key === "data");
    console.log("Data property found:", !!dataProperty);
    console.log("Data property type:", dataProperty?.type);
    console.log("Data property has items:", !!dataProperty?.items);

    // Check items schema
    const itemsSchema = dataProperty?.items;
    console.log("Items schema type:", itemsSchema?.type);
    console.log("Items schema has properties:", !!itemsSchema?.properties);

    // Find blockParam in items schema
    const blockParamProperty = itemsSchema?.properties?.find(
      (p: any) => p.key === "blockParam",
    );
    console.log("BlockParam property found:", !!blockParamProperty);
    console.log("BlockParam has switch:", !!blockParamProperty?.switch);
    console.log("BlockParam switch path:", blockParamProperty?.switch);
    console.log("BlockParam cases count:", blockParamProperty?.cases?.length);

    // Find ElectricMachine case
    const electricMachineCase = blockParamProperty?.cases?.find(
      (c: any) => c.when === "ElectricMachine",
    );
    console.log("ElectricMachine case found:", !!electricMachineCase);
    console.log("ElectricMachine case type:", electricMachineCase?.type);
    console.log(
      "ElectricMachine case properties count:",
      electricMachineCase?.properties?.length,
    );

    // Find requiredPower in ElectricMachine case
    const requiredPowerProperty = electricMachineCase?.properties?.find(
      (p: any) => p.key === "requiredPower",
    );
    console.log("RequiredPower property found:", !!requiredPowerProperty);
    console.log("RequiredPower type:", requiredPowerProperty?.type);
    console.log("RequiredPower default:", requiredPowerProperty?.default);

    // Load real blocks.json
    const jsonPath = path.join(
      process.cwd(),
      "public/src/sample/master/blocks.json",
    );
    const jsonContent = fs.readFileSync(jsonPath, "utf-8");
    const jsonData = JSON.parse(jsonContent);

    console.log("JSON data length:", jsonData.data.length);
    console.log("data[60] blockType:", jsonData.data[60]?.blockType);
    console.log(
      "data[60] has requiredPower:",
      "requiredPower" in (jsonData.data[60]?.blockParam || {}),
    );

    // Test with data[60] (remove requiredPower)
    const testData = {
      data: [
        {
          ...jsonData.data[60],
          blockParam: {
            ...jsonData.data[60].blockParam,
          },
        },
      ],
    };

    // Remove requiredPower
    delete testData.data[0].blockParam.requiredPower;

    console.log(
      "Test data[0] has requiredPower before validation:",
      "requiredPower" in testData.data[0].blockParam,
    );

    const { data, addedFields } = validateAndFillMissingFields(
      testData,
      schema,
    );

    console.log("Validation result added fields:", addedFields);
    console.log(
      "data[0].blockParam.requiredPower after validation:",
      data.data[0].blockParam.requiredPower,
    );

    expect(addedFields.length).toBeGreaterThan(0);
    expect(addedFields).toContain("data[0].blockParam.requiredPower");
    expect(data.data[0].blockParam.requiredPower).toBe(5);
  });
});