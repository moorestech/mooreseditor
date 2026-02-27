import { z } from "zod";

import type {
  SchemaContainer,
  Schema,
  ObjectSchema,
  ArraySchema,
  StringSchema,
  EnumSchema,
  UuidSchema,
  IntegerSchema,
  NumberSchema,
  BooleanSchema,
  Vector2,
  Vector3,
  Vector4,
  Vector2Int,
  Vector3Int,
  Vector4Int,
  SwitchSchema,
} from "./types";

/**
 * Preprocesses schema containers to build a reference map for efficient lookups
 * @param schemaContainers Array of schema containers to preprocess
 * @returns A map of schema IDs to their containers
 */
function preprocessSchemaContainers(
  schemaContainers: SchemaContainer[],
): Map<string, SchemaContainer> {
  const schemaMap = new Map<string, SchemaContainer>();

  // First pass: build the map of schema IDs to containers
  for (const container of schemaContainers) {
    schemaMap.set(container.id, container);
  }

  return schemaMap;
}

/**
 * Creates a Zod schema validator for a SchemaContainer object
 * @param schemaContainer The schema container object to validate
 * @param allSchemaContainers All potentially related schema containers that might be referenced
 * @returns A Zod schema that validates according to the schema definition
 */
export function createSchemaValidator(
  schemaContainer: SchemaContainer,
  allSchemaContainers: SchemaContainer[] = [],
): z.ZodType<any> {
  // Preprocess schema containers to build a reference map
  const schemaMap = preprocessSchemaContainers([
    schemaContainer,
    ...allSchemaContainers,
  ]);

  // Create validator based on the schema container
  return createSchemaTypeValidator(schemaContainer, schemaMap);
}

/**
 * Recursively creates a Zod schema validator for a Schema object
 * @param schema The schema object to validate
 * @param schemaMap Map of schema IDs to their containers for efficient lookups
 * @returns A Zod schema that validates according to the schema definition
 */
function createSchemaTypeValidator(
  schema: Schema,
  schemaMap: Map<string, SchemaContainer>,
): z.ZodType<any> {
  if ("switch" in schema) {
    return createSwitchValidator(schema, schemaMap);
  }

  switch (schema.type) {
    case "object":
      return createObjectValidator(schema, schemaMap);
    case "array":
      return createArrayValidator(schema, schemaMap);
    case "string":
      return createStringValidator(schema);
    case "enum":
      return createEnumValidator(schema);
    case "uuid":
      return createUuidValidator(schema);
    case "integer":
      return createIntegerValidator(schema);
    case "number":
      return createNumberValidator(schema);
    case "boolean":
      return createBooleanValidator(schema);
    case "vector2":
      return createVector2Validator(schema);
    case "vector3":
      return createVector3Validator(schema);
    case "vector4":
      return createVector4Validator(schema);
    case "vector2Int":
      return createVector2IntValidator(schema);
    case "vector3Int":
      return createVector3IntValidator(schema);
    case "vector4Int":
      return createVector4IntValidator(schema);
    default:
      // This should never happen if the schema is correctly typed
      throw new Error(`Unknown schema type: ${(schema as any).type}`);
  }
}

function createObjectValidator(
  schema: ObjectSchema,
  schemaMap: Map<string, SchemaContainer>,
): z.ZodType<any> {
  // If the schema has a ref property, find the referenced schema container
  if (schema.ref) {
    const referencedSchema = schemaMap.get(schema.ref);

    if (!referencedSchema) {
      throw new Error(`Referenced schema with id "${schema.ref}" not found`);
    }

    // Use the referenced schema for validation
    // If the referenced schema is an array type, use its items for the object validation
    if (referencedSchema.type === "array" && referencedSchema.items) {
      return createSchemaTypeValidator(referencedSchema.items, schemaMap);
    }
    // Otherwise, validate as the referenced schema type
    return createSchemaTypeValidator(referencedSchema, schemaMap);
  }

  if (!schema.properties || schema.properties.length === 0) {
    return z.object({}).passthrough();
  }

  const shape: Record<string, z.ZodType<any>> = {};

  for (const property of schema.properties) {
    const propertyValidator = createSchemaTypeValidator(property, schemaMap);

    // Handle optional properties
    const isOptional = "optional" in property && property.optional === true;

    shape[property.key] = isOptional
      ? propertyValidator.optional()
      : propertyValidator;
  }

  return z.object(shape).passthrough();
}

function createArrayValidator(
  schema: ArraySchema,
  schemaMap: Map<string, SchemaContainer>,
): z.ZodType<any> {
  let arrayValidator = z.array(
    createSchemaTypeValidator(schema.items, schemaMap),
  );

  if (schema.minLength !== undefined) {
    arrayValidator = arrayValidator.min(schema.minLength);
  }

  if (schema.maxLength !== undefined) {
    arrayValidator = arrayValidator.max(schema.maxLength);
  }

  return arrayValidator;
}

function createStringValidator(schema: StringSchema): z.ZodType<any> {
  let stringValidator = z.string();

  if (schema.default !== undefined) {
    stringValidator = stringValidator.default(
      schema.default,
    ) as unknown as z.ZodString;
  }

  return schema.optional ? stringValidator.optional() : stringValidator;
}

function createEnumValidator(schema: EnumSchema): z.ZodType<any> {
  let enumValidator = z.enum(schema.options as [string, ...string[]]);

  if (schema.default !== undefined) {
    enumValidator = enumValidator.default(
      schema.default,
    ) as unknown as z.ZodEnum<[string, ...string[]]>;
  }

  return schema.optional ? enumValidator.optional() : enumValidator;
}

function createUuidValidator(schema: UuidSchema): z.ZodType<any> {
  const uuidValidator = z.string().uuid();

  return schema.optional ? uuidValidator.optional() : uuidValidator;
}

function createIntegerValidator(schema: IntegerSchema): z.ZodType<any> {
  let intValidator = z.number().int();

  if (schema.min !== undefined) {
    intValidator = intValidator.min(schema.min);
  }

  if (schema.max !== undefined) {
    intValidator = intValidator.max(schema.max);
  }

  if (schema.default !== undefined) {
    intValidator = intValidator.default(
      schema.default,
    ) as unknown as z.ZodNumber;
  }

  return schema.optional ? intValidator.optional() : intValidator;
}

function createNumberValidator(schema: NumberSchema): z.ZodType<any> {
  let numberValidator = z.number();

  if (schema.min !== undefined) {
    numberValidator = numberValidator.min(schema.min);
  }

  if (schema.max !== undefined) {
    numberValidator = numberValidator.max(schema.max);
  }

  if (schema.default !== undefined) {
    numberValidator = numberValidator.default(
      schema.default,
    ) as unknown as z.ZodNumber;
  }

  return schema.optional ? numberValidator.optional() : numberValidator;
}

function createBooleanValidator(schema: BooleanSchema): z.ZodType<any> {
  let booleanValidator = z.boolean();

  if (schema.default !== undefined) {
    booleanValidator = booleanValidator.default(
      schema.default,
    ) as unknown as z.ZodBoolean;
  }

  return schema.optional ? booleanValidator.optional() : booleanValidator;
}

function createVector2Validator(schema: Vector2): z.ZodType<any> {
  let vectorValidator = z.tuple([z.number(), z.number()]);

  if (schema.default !== undefined) {
    vectorValidator = vectorValidator.default(
      schema.default,
    ) as unknown as z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>;
  }

  return schema.optional ? vectorValidator.optional() : vectorValidator;
}

function createVector3Validator(schema: Vector3): z.ZodType<any> {
  let vectorValidator = z.tuple([z.number(), z.number(), z.number()]);

  if (schema.default !== undefined) {
    vectorValidator = vectorValidator.default(
      schema.default,
    ) as unknown as z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
  }

  return schema.optional ? vectorValidator.optional() : vectorValidator;
}

function createVector4Validator(schema: Vector4): z.ZodType<any> {
  let vectorValidator = z.tuple([
    z.number(),
    z.number(),
    z.number(),
    z.number(),
  ]);

  if (schema.default !== undefined) {
    vectorValidator = vectorValidator.default(
      schema.default,
    ) as unknown as z.ZodTuple<
      [z.ZodNumber, z.ZodNumber, z.ZodNumber, z.ZodNumber],
      null
    >;
  }

  return schema.optional ? vectorValidator.optional() : vectorValidator;
}

function createVector2IntValidator(schema: Vector2Int): z.ZodType<any> {
  let vectorValidator = z.tuple([z.number().int(), z.number().int()]);

  if (schema.default !== undefined) {
    vectorValidator = vectorValidator.default(
      schema.default,
    ) as unknown as z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>;
  }

  return schema.optional ? vectorValidator.optional() : vectorValidator;
}

function createVector3IntValidator(schema: Vector3Int): z.ZodType<any> {
  let vectorValidator = z.tuple([
    z.number().int(),
    z.number().int(),
    z.number().int(),
  ]);

  if (schema.default !== undefined) {
    vectorValidator = vectorValidator.default(
      schema.default,
    ) as unknown as z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
  }

  return schema.optional ? vectorValidator.optional() : vectorValidator;
}

function createVector4IntValidator(schema: Vector4Int): z.ZodType<any> {
  let vectorValidator = z.tuple([
    z.number().int(),
    z.number().int(),
    z.number().int(),
    z.number().int(),
  ]);

  if (schema.default !== undefined) {
    vectorValidator = vectorValidator.default(
      schema.default,
    ) as unknown as z.ZodTuple<
      [z.ZodNumber, z.ZodNumber, z.ZodNumber, z.ZodNumber],
      null
    >;
  }

  return schema.optional ? vectorValidator.optional() : vectorValidator;
}

/**
 * Prepares an object for validation by adding parent references
 * This function recursively adds a special ".." property to each object
 * that points to its parent, allowing for easy traversal up the object hierarchy
 * @param obj The object to prepare
 * @param parent The parent object (optional)
 * @returns The prepared object with parent references
 */
function prepareObjectForValidation(obj: any, parent: any = null): any {
  if (obj === null || obj === undefined || typeof obj !== "object") {
    return obj;
  }

  // Add parent reference
  if (parent !== null) {
    Object.defineProperty(obj, "..", {
      value: parent,
      enumerable: false, // Don't include in JSON.stringify or for...in loops
      configurable: true, // Allow overwriting if needed
    });
  }

  // Recursively process all properties
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      obj[i] = prepareObjectForValidation(obj[i], obj);
    }
  } else {
    for (const key of Object.keys(obj)) {
      obj[key] = prepareObjectForValidation(obj[key], obj);
    }
  }

  return obj;
}

/**
 * Gets a value from an object using a POSIX path
 * @param obj The object to get the value from
 * @param path The POSIX path to the value
 * @returns The value at the specified path, or undefined if the path doesn't exist
 */
function getValueByPath(obj: any, path: string): any {
  // Handle empty path
  if (!path) return obj;

  // Split the path into segments
  const segments = path.split("/").filter((segment) => segment !== "");

  // Traverse the object using the path segments
  let current = obj;

  for (const segment of segments) {
    // Handle special segments
    if (segment === ".") continue;

    if (segment === "..") {
      // Go up one level by accessing the special ".." property
      // that was added by prepareObjectForValidation
      current = current[".."];
      if (current === undefined) {
        return undefined; // No parent reference found
      }
      continue;
    }

    // If current is null or undefined, or not an object, we can't traverse further
    if (
      current === null ||
      current === undefined ||
      typeof current !== "object"
    ) {
      return undefined;
    }

    // Move to the next level
    current = current[segment];
  }

  return current;
}

function createSwitchValidator(
  schema: SwitchSchema,
  schemaMap: Map<string, SchemaContainer>,
): z.ZodType<any> {
  // For a switch schema, we create a discriminated union
  // based on the switch property and cases

  const unionSchemas: z.ZodType<any>[] = [];

  for (const caseItem of schema.cases) {
    const caseSchema = createSchemaTypeValidator(caseItem, schemaMap);

    // Create a refined schema that checks the switch property value
    const refinedSchema = caseSchema.refine(
      (data) => {
        // Prepare the object for validation by adding parent references
        const preparedData = prepareObjectForValidation(data);

        // Get the value at the path specified by the switch property
        const switchValue = getValueByPath(preparedData, schema.switch);

        // Check if the value matches the expected value
        return switchValue === caseItem.when;
      },
      {
        message: `Expected value at path "${schema.switch}" to be ${caseItem.when}`,
        path: [schema.switch],
      },
    );

    unionSchemas.push(refinedSchema);
  }

  // If there are no cases, return a passthrough schema
  if (unionSchemas.length === 0) {
    return z.any();
  }

  // Create a union of all case schemas
  return z.union(
    unionSchemas as [z.ZodType<any>, z.ZodType<any>, ...z.ZodType<any>[]],
  );
}
