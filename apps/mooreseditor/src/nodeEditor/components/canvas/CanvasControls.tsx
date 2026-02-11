import { Controls, MiniMap } from "@xyflow/react";

export default function CanvasControls() {
  return (
    <>
      <Controls />
      <MiniMap
        nodeStrokeWidth={3}
        zoomable
        pannable
        style={{ width: 150, height: 100 }}
      />
    </>
  );
}
