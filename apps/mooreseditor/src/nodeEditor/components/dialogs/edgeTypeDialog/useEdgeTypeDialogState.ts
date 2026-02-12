import { useEffect, useMemo, useState } from "react";

import { createInitialValue } from "../../../../utils/createInitialValue";
import { RECIPE_SCHEMA_MAP } from "../../../utils/recipeEdge";

import { getNodeLabel, getNodeSchemaRef } from "./nodeRefs";
import { buildEditableRecipes, buildRecipeOptions, hydrateRecipeRecord } from "./recipeRecordUtils";
import {
  buildSelectedRecipeRefs,
  updateRecipeRecord,
  upsertCreatedRecipe,
} from "./recipeStateMutations";

import type {
  EdgeDialogMode,
  EdgeTypeDialogProps,
  ObjectArrayEditorState,
} from "./types";
import type { ObjectSchema } from "../../../../libs/schema/types";
import type { RecipeEdgeType } from "../../../types/nodeGraph";

export function useEdgeTypeDialogState({
  opened,
  onConfirm,
  onCancel,
  jsonData,
  setJsonData,
  schemaMetas,
  sourceNode,
  targetNode,
  onMarkDirty,
  initialRecipeRefs,
}: EdgeTypeDialogProps) {
  const [mode, setMode] = useState<EdgeDialogMode>("dependency");
  const [craftRecipeGuids, setCraftRecipeGuids] = useState<string[]>([]);
  const [machineRecipeGuids, setMachineRecipeGuids] = useState<string[]>([]);
  const [editingRecipeKey, setEditingRecipeKey] = useState<string | null>(null);
  const [objectArrayEditor, setObjectArrayEditor] =
    useState<ObjectArrayEditorState | null>(null);

  // Initialize from existing edge data when editing
  useEffect(() => {
    if (!opened) return;
    if (initialRecipeRefs && initialRecipeRefs.length > 0) {
      setMode("recipe");
      setCraftRecipeGuids(
        initialRecipeRefs
          .filter((r) => r.edgeType === "craftRecipe")
          .map((r) => r.masterGuid),
      );
      setMachineRecipeGuids(
        initialRecipeRefs
          .filter((r) => r.edgeType === "machineRecipe")
          .map((r) => r.masterGuid),
      );
    }
  }, [opened, initialRecipeRefs]);

  const recipeOptions = useMemo(
    () => buildRecipeOptions(jsonData, schemaMetas),
    [jsonData, schemaMetas],
  );

  const selectedRecipeRefs = useMemo(
    () => buildSelectedRecipeRefs(craftRecipeGuids, machineRecipeGuids),
    [craftRecipeGuids, machineRecipeGuids],
  );

  const editableRecipes = useMemo(
    () => buildEditableRecipes(selectedRecipeRefs, jsonData, schemaMetas),
    [selectedRecipeRefs, jsonData, schemaMetas],
  );

  const editingRecipe = useMemo(
    () =>
      editingRecipeKey
        ? editableRecipes.find((recipe) => recipe.key === editingRecipeKey) ?? null
        : null,
    [editableRecipes, editingRecipeKey],
  );

  useEffect(() => {
    if (editableRecipes.length === 0) {
      setEditingRecipeKey(null);
      return;
    }

    setEditingRecipeKey((current) =>
      current && editableRecipes.some((recipe) => recipe.key === current)
        ? current
        : editableRecipes[0].key,
    );
  }, [editableRecipes]);

  useEffect(() => {
    setObjectArrayEditor(null);
  }, [editingRecipeKey]);

  const resetState = () => {
    setMode("dependency");
    setCraftRecipeGuids([]);
    setMachineRecipeGuids([]);
    setEditingRecipeKey(null);
    setObjectArrayEditor(null);
  };

  const handleConfirm = () => {
    if (mode === "recipe") {
      if (selectedRecipeRefs.length === 0) return;
      onConfirm({ edgeType: "recipe", recipeRefs: selectedRecipeRefs });
    } else {
      onConfirm({ edgeType: mode });
    }
    resetState();
  };

  const handleCancel = () => {
    onCancel();
    resetState();
  };

  const handleCreateRecipe = (recipeType: RecipeEdgeType) => {
    const schemaId = RECIPE_SCHEMA_MAP[recipeType];
    const schemaMeta = schemaMetas.get(schemaId);
    if (!schemaMeta?.elementSchema || !schemaMeta.guidField) return;

    const sourceRef = getNodeSchemaRef(sourceNode, schemaMetas);
    const targetRef = getNodeSchemaRef(targetNode, schemaMetas);

    const column = jsonData.find((entry) => entry.title === schemaId);
    const existingRowsRaw = column?.data?.[schemaMeta.dataArrayPath];
    const existingRows = Array.isArray(existingRowsRaw) ? existingRowsRaw : [];

    const defaults = createInitialValue(
      schemaMeta.elementSchema,
      existingRows,
    ) as Record<string, unknown>;
    const recipeGuidRaw = defaults[schemaMeta.guidField];
    const recipeGuid =
      typeof recipeGuidRaw === "string" && recipeGuidRaw.length > 0
        ? recipeGuidRaw
        : crypto.randomUUID();
    defaults[schemaMeta.guidField] = recipeGuid;

    const nextRecord = hydrateRecipeRecord(
      defaults,
      schemaMeta.elementSchema as ObjectSchema,
      sourceRef,
      targetRef,
    );

    setJsonData((prev) =>
      upsertCreatedRecipe(prev, schemaId, schemaMeta, recipeGuid, nextRecord),
    );

    if (recipeType === "craftRecipe") {
      setCraftRecipeGuids((prev) => (prev.includes(recipeGuid) ? prev : [...prev, recipeGuid]));
    } else {
      setMachineRecipeGuids((prev) =>
        prev.includes(recipeGuid) ? prev : [...prev, recipeGuid],
      );
    }

    setEditingRecipeKey(`${recipeType}:${recipeGuid}`);
    setMode("recipe");
    onMarkDirty();
  };

  const handleEditRecipe = (
    recipeKey: string,
    nextRecord: Record<string, unknown>,
  ) => {
    const recipe = editableRecipes.find((entry) => entry.key === recipeKey);
    if (!recipe?.schemaMeta.guidField) return;

    const normalizedRecord = {
      ...nextRecord,
      [recipe.schemaMeta.guidField]: recipe.recipeGuid,
    };

    setJsonData((prev) => updateRecipeRecord(prev, recipe, normalizedRecord));
    onMarkDirty();
  };

  return {
    mode,
    setMode,
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
    sourceLabel: getNodeLabel(sourceNode),
    targetLabel: getNodeLabel(targetNode),
  };
}
