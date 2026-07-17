import {
  Button,
  Group,
  Modal,
  SegmentedControl,
  Stack,
  Text,
} from "@mantine/core";

import EdgeRecipeSection from "./edgeTypeDialog/EdgeRecipeSection";
import { useEdgeTypeDialogState } from "./edgeTypeDialog/useEdgeTypeDialogState";

import type {
  EdgeDialogMode,
  EdgeTypeDialogProps,
} from "./edgeTypeDialog/types";

export default function EdgeTypeDialog(props: EdgeTypeDialogProps) {
  const {
    mode,
    setMode,
    isBuildCostAvailable,
    craftRecipeGuids,
    setCraftRecipeGuids,
    machineRecipeGuids,
    setMachineRecipeGuids,
    recipeOptions,
    selectedRecipeRefs,
    editableRecipes,
    editingRecipeKey,
    setEditingRecipeKey,
    editingRecipe,
    objectArrayEditor,
    setObjectArrayEditor,
    handleConfirm,
    handleCancel,
    handleCreateRecipe,
    handleEditRecipe,
    sourceLabel,
    targetLabel,
  } = useEdgeTypeDialogState(props);

  return (
    <Modal
      opened={props.opened}
      onClose={handleCancel}
      title="Edge Settings"
      size="md"
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          {sourceLabel} {"->"} {targetLabel}
        </Text>

        <SegmentedControl
          data={[
            { label: "Dependency", value: "dependency" },
            { label: "Visual", value: "visual" },
            { label: "Recipe", value: "recipe" },
            ...(isBuildCostAvailable
              ? [{ label: "Build Cost", value: "buildCost" }]
              : []),
          ]}
          value={mode}
          onChange={(value) => setMode(value as EdgeDialogMode)}
        />

        {mode === "buildCost" && (
          <Text size="xs" c="dimmed">
            Cost is derived from the target&apos;s requiredItems. Edit them in
            the Properties panel.
          </Text>
        )}

        {mode === "recipe" && (
          <EdgeRecipeSection
            jsonData={props.jsonData}
            recipeOptions={recipeOptions}
            craftRecipeGuids={craftRecipeGuids}
            setCraftRecipeGuids={setCraftRecipeGuids}
            machineRecipeGuids={machineRecipeGuids}
            setMachineRecipeGuids={setMachineRecipeGuids}
            editableRecipes={editableRecipes}
            editingRecipeKey={editingRecipeKey}
            setEditingRecipeKey={setEditingRecipeKey}
            editingRecipe={editingRecipe}
            objectArrayEditor={objectArrayEditor}
            setObjectArrayEditor={setObjectArrayEditor}
            onCreateRecipe={handleCreateRecipe}
            onEditRecipe={handleEditRecipe}
          />
        )}

        <Group justify="flex-end">
          <Button variant="default" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={mode === "recipe" && selectedRecipeRefs.length === 0}
          >
            OK
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
