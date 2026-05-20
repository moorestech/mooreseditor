import {
  ActionIcon,
  Button,
  Divider,
  Group,
  MultiSelect,
  Select,
  Stack,
  Text,
} from "@mantine/core";
import { FormView, TableView } from "@mooreseditor/plugin-sdk";
import { IconArrowLeft } from "@tabler/icons-react";


import { getValueAtPath, setValueAtPath } from "./pathValue";

import type {
  EditableRecipe,
  ObjectArrayEditorState,
  RecipeOptionsByType,
} from "./types";
import type { RecipeEdgeType } from "../../../types/nodeGraph";
import type { Column, Schema } from "@mooreseditor/plugin-sdk";

interface EdgeRecipeSectionProps {
  jsonData: Column[];
  recipeOptions: RecipeOptionsByType;
  craftRecipeGuids: string[];
  setCraftRecipeGuids: (value: string[]) => void;
  machineRecipeGuids: string[];
  setMachineRecipeGuids: (value: string[]) => void;
  editableRecipes: EditableRecipe[];
  editingRecipeKey: string | null;
  setEditingRecipeKey: (value: string | null) => void;
  editingRecipe: EditableRecipe | null;
  objectArrayEditor: ObjectArrayEditorState | null;
  setObjectArrayEditor: (value: ObjectArrayEditorState | null) => void;
  onCreateRecipe: (recipeType: RecipeEdgeType) => void;
  onEditRecipe: (
    recipeKey: string,
    nextRecord: Record<string, unknown>,
  ) => void;
}

export default function EdgeRecipeSection({
  jsonData,
  recipeOptions,
  craftRecipeGuids,
  setCraftRecipeGuids,
  machineRecipeGuids,
  setMachineRecipeGuids,
  editableRecipes,
  editingRecipeKey,
  setEditingRecipeKey,
  editingRecipe,
  objectArrayEditor,
  setObjectArrayEditor,
  onCreateRecipe,
  onEditRecipe,
}: EdgeRecipeSectionProps) {
  return (
    <Stack gap="sm">
      <Text size="sm" fw={600}>
        Craft Recipes
      </Text>
      <MultiSelect
        placeholder="Select craft recipes"
        data={recipeOptions.craftRecipe}
        value={craftRecipeGuids}
        onChange={setCraftRecipeGuids}
        searchable
        clearable
        nothingFoundMessage="No craft recipes"
      />
      <Button variant="light" onClick={() => onCreateRecipe("craftRecipe")}>
        Create Craft Recipe and Add
      </Button>

      <Text size="sm" fw={600} mt="xs">
        Machine Recipes
      </Text>
      <MultiSelect
        placeholder="Select machine recipes"
        data={recipeOptions.machineRecipe}
        value={machineRecipeGuids}
        onChange={setMachineRecipeGuids}
        searchable
        clearable
        nothingFoundMessage="No machine recipes"
      />
      <Button variant="light" onClick={() => onCreateRecipe("machineRecipe")}>
        Create Machine Recipe and Add
      </Button>

      {editableRecipes.length > 0 && (
        <>
          <Divider my="xs" />
          <Text size="sm" fw={600}>
            Edit Selected Recipe
          </Text>
          <Select
            data={editableRecipes.map((recipe) => ({
              value: recipe.key,
              label: recipe.label,
            }))}
            value={editingRecipeKey}
            onChange={setEditingRecipeKey}
            searchable
            nothingFoundMessage="No selected recipes"
          />
          {editingRecipe?.schemaMeta.elementSchema ? (
            objectArrayEditor ? (
              <Stack gap="xs">
                <Group justify="space-between">
                  <Group gap="xs">
                    <ActionIcon
                      variant="subtle"
                      onClick={() => setObjectArrayEditor(null)}
                    >
                      <IconArrowLeft size={16} />
                    </ActionIcon>
                    <Text size="sm" fw={500}>
                      {objectArrayEditor.path.join(".")}
                    </Text>
                  </Group>
                  <Button
                    size="xs"
                    variant="default"
                    onClick={() => setObjectArrayEditor(null)}
                  >
                    Back to Form
                  </Button>
                </Group>
                <TableView
                  schema={objectArrayEditor.schema}
                  data={
                    (getValueAtPath(
                      editingRecipe.record,
                      objectArrayEditor.path,
                    ) as unknown[]) || []
                  }
                  jsonData={jsonData}
                  onDataChange={(nextArray) =>
                    onEditRecipe(
                      editingRecipe.key,
                      setValueAtPath(
                        editingRecipe.record,
                        objectArrayEditor.path,
                        nextArray,
                      ),
                    )
                  }
                />
              </Stack>
            ) : (
              <FormView
                schema={editingRecipe.schemaMeta.elementSchema as Schema}
                data={editingRecipe.record}
                jsonData={jsonData}
                autoOpenObjectArrays={false}
                onDataChange={(nextData) =>
                  onEditRecipe(
                    editingRecipe.key,
                    nextData as Record<string, unknown>,
                  )
                }
                onObjectArrayClick={(path, schema) => {
                  if ("type" in schema && schema.type === "array") {
                    setObjectArrayEditor({ path, schema });
                  }
                }}
              />
            )
          ) : (
            <Text size="sm" c="dimmed">
              No schema for selected recipe
            </Text>
          )}
        </>
      )}
    </Stack>
  );
}
