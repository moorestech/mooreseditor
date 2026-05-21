import type { Dispatch, SetStateAction } from "react";

import type { Column } from "../schema";

export interface ColumnDispatchHost {
  setColumns(action: SetStateAction<Column[]>): void;
}

export function createColumnDispatch(
  host: ColumnDispatchHost,
): Dispatch<SetStateAction<Column[]>> {
  return (action) => host.setColumns(action);
}
