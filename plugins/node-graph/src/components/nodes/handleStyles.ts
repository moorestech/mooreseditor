import type { CSSProperties } from "react";

const HANDLE_SIZE_PX = 16;
const HANDLE_HALF_SIZE_PX = HANDLE_SIZE_PX / 2;

export const nodeTargetHandleStyle: CSSProperties = {
  width: HANDLE_SIZE_PX,
  height: HANDLE_SIZE_PX,
  left: -HANDLE_HALF_SIZE_PX,
};

export const nodeSourceHandleStyle: CSSProperties = {
  width: HANDLE_SIZE_PX,
  height: HANDLE_SIZE_PX,
  right: -HANDLE_HALF_SIZE_PX,
};
