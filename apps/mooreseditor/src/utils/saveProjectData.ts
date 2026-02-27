/**
 * @deprecated Import from "../services/persistence" instead.
 *
 * This shim wraps the new SaveParams-based API to match the old callback-based interface.
 */

import { saveProjectData as save } from "../services/persistence";

import type { Column } from "../hooks/useJson";
import type { NodeGraphFile } from "../nodeEditor/types/nodeGraph";

interface SaveProjectDataParams {
  columns: Column[];
  nodeGraphData?: NodeGraphFile | null;
  projectDir: string | null;
  masterDir: string | null;
  onSuccess: () => void;
}

export async function saveProjectData({
  columns,
  nodeGraphData,
  projectDir,
  masterDir,
  onSuccess,
}: SaveProjectDataParams): Promise<void> {
  const result = await save({ columns, nodeGraphData, projectDir, masterDir });

  if (result.success) {
    onSuccess();
  } else {
    console.error("保存中にエラー:", result.errors);
  }
}
