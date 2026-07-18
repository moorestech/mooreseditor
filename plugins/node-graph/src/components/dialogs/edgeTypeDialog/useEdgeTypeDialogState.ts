import { useEffect, useMemo, useRef, useState } from "react";

import { createInitialValue } from "@moorestech/mooreseditor-plugin-sdk";

import { RECIPE_SCHEMA_MAP } from "../../../utils/recipeEdge";

import { getNodeLabel, getNodeSchemaRef } from "./nodeRefs";
import {
  buildEditableRecipes,
  buildRecipeOptions,
  hydrateRecipeRecord,
} from "./recipeRecordUtils";
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
import type { RecipeEdgeType } from "../../../types/nodeGraph";
import type { ObjectSchema } from "@moorestech/mooreseditor-plugin-sdk";

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
  initialMode,
}: EdgeTypeDialogProps) {
  const [mode, setMode] = useState<EdgeDialogMode>("dependency");
  const [craftRecipeGuids, setCraftRecipeGuids] = useState<string[]>([]);
  const [machineRecipeGuids, setMachineRecipeGuids] = useState<string[]>([]);
  const [editingRecipeKey, setEditingRecipeKey] = useState<string | null>(null);
  const [objectArrayEditor, setObjectArrayEditor] =
    useState<ObjectArrayEditorState | null>(null);
  const createdDraftRecipesRef = useRef<
    { schemaId: string; recipeGuid: string }[]
  >([]);
  const initializedForOpenRef = useRef(false);

  // 建設コストはターゲットがblock/trainのときだけ選択可能
  // Build Cost is selectable only when the target is a block/train node
  const isBuildCostAvailable =
    targetNode?.type === "block" || targetNode?.type === "train";

  // Initialize from existing edge data when editing
  useEffect(() => {
    if (!opened) {
      initializedForOpenRef.current = false;
      return;
    }
    if (initializedForOpenRef.current) return;
    initializedForOpenRef.current = true;

    // 既存エッジ編集は現在型を初期選択し、選択済みレシピも毎回リセットする
    // Editing preselects the current type; recipe selections reset on every open
    const refs = initialRecipeRefs ?? [];
    const requestedMode =
      initialMode ?? (refs.length > 0 ? "recipe" : "dependency");
    // buildCost不可ターゲット（付け替え等）ではdependencyへ退避
    // Fall back to dependency when buildCost is unavailable for the target
    setMode(
      requestedMode === "buildCost" && !isBuildCostAvailable
        ? "dependency"
        : requestedMode,
    );
    setCraftRecipeGuids(
      refs.filter((r) => r.edgeType === "craftRecipe").map((r) => r.masterGuid),
    );
    setMachineRecipeGuids(
      refs
        .filter((r) => r.edgeType === "machineRecipe")
        .map((r) => r.masterGuid),
    );
  }, [opened, initialRecipeRefs, initialMode, isBuildCostAvailable]);

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
        ? editableRecipes.find((recipe) => recipe.key === editingRecipeKey) ??
          null
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
    createdDraftRecipesRef.current = [];
  };

  const cleanupCreatedDraftRecipes = (
    shouldRemove: (draft: { schemaId: string; recipeGuid: string }) => boolean =
      () => true,
  ) => {
    const drafts = createdDraftRecipesRef.current.filter(shouldRemove);
    if (drafts.length === 0) return;

    setJsonData((prev) =>
      drafts.reduce((columns, draft) => {
        const meta = schemaMetas.get(draft.schemaId);
        if (!meta?.guidField) return columns;

        const colIndex = columns.findIndex((c) => c.title === draft.schemaId);
        if (colIndex === -1) return columns;

        const col = columns[colIndex];
        const rows = col.data?.[meta.dataArrayPath];
        if (!Array.isArray(rows)) return columns;

        const nextColumns = [...columns];
        nextColumns[colIndex] = {
          ...col,
          data: {
            ...col.data,
            [meta.dataArrayPath]: rows.filter(
              (row: unknown) =>
                !row ||
                typeof row !== "object" ||
                Array.isArray(row) ||
                (row as Record<string, unknown>)[meta.guidField!] !==
                  draft.recipeGuid,
            ),
          },
        };
        return nextColumns;
      }, prev),
    );
    createdDraftRecipesRef.current =
      createdDraftRecipesRef.current.filter((draft) => !shouldRemove(draft));
  };

  const handleConfirm = () => {
    // buildCost不可ターゲットへのbuildCost確定を拒否
    // Reject confirming buildCost for targets that cannot have one
    if (mode === "buildCost" && !isBuildCostAvailable) return;
    if (mode === "recipe") {
      if (selectedRecipeRefs.length === 0) return;
      const selectedKeys = new Set(
        selectedRecipeRefs.map((ref) => `${RECIPE_SCHEMA_MAP[ref.edgeType]}:${ref.masterGuid}`),
      );
      cleanupCreatedDraftRecipes(
        (draft) => !selectedKeys.has(`${draft.schemaId}:${draft.recipeGuid}`),
      );
      onConfirm({ edgeType: "recipe", recipeRefs: selectedRecipeRefs });
      createdDraftRecipesRef.current = [];
    } else {
      cleanupCreatedDraftRecipes();
      onConfirm({ edgeType: mode });
    }
    resetState();
  };

  const handleCancel = () => {
    cleanupCreatedDraftRecipes();
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
    if (
      !createdDraftRecipesRef.current.some(
        (draft) =>
          draft.schemaId === schemaId && draft.recipeGuid === recipeGuid,
      )
    ) {
      createdDraftRecipesRef.current = [
        ...createdDraftRecipesRef.current,
        { schemaId, recipeGuid },
      ];
    }

    if (recipeType === "craftRecipe") {
      setCraftRecipeGuids((prev) =>
        prev.includes(recipeGuid) ? prev : [...prev, recipeGuid],
      );
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
    sourceLabel: getNodeLabel(sourceNode),
    targetLabel: getNodeLabel(targetNode),
  };
}
