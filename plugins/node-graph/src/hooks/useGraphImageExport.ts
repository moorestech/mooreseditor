import { useCallback } from "react";

import { getViewportForBounds, useReactFlow } from "@xyflow/react";
import { toPng } from "html-to-image";

const IMAGE_PADDING = 50;
const IMAGE_MIN_WIDTH = 1024;
const IMAGE_MIN_HEIGHT = 768;

export function useGraphImageExport() {
  const { getNodes, getNodesBounds } = useReactFlow();

  const exportAsImage = useCallback(async () => {
    const nodes = getNodes();
    if (nodes.length === 0) return;

    const viewportEl = document.querySelector<HTMLElement>(
      ".react-flow__viewport",
    );
    if (!viewportEl) return;

    const bounds = getNodesBounds(nodes);
    const imageWidth = Math.max(
      bounds.width + IMAGE_PADDING * 2,
      IMAGE_MIN_WIDTH,
    );
    const imageHeight = Math.max(
      bounds.height + IMAGE_PADDING * 2,
      IMAGE_MIN_HEIGHT,
    );

    const viewport = getViewportForBounds(
      bounds,
      imageWidth,
      imageHeight,
      0.5,
      2,
      IMAGE_PADDING,
    );

    const dataUrl = await toPng(viewportEl, {
      backgroundColor: "#ffffff",
      width: imageWidth,
      height: imageHeight,
      style: {
        width: `${imageWidth}px`,
        height: `${imageHeight}px`,
        transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
      },
    });

    // Try Tauri save dialog first, fallback to browser download
    try {
      const { save } = await import("@tauri-apps/plugin-dialog");
      const { writeFile } = await import("@tauri-apps/plugin-fs");

      const filePath = await save({
        defaultPath: "node-graph.png",
        filters: [{ name: "PNG Image", extensions: ["png"] }],
      });
      if (!filePath) return;

      const response = await fetch(dataUrl);
      const arrayBuffer = await response.arrayBuffer();
      await writeFile(filePath, new Uint8Array(arrayBuffer));
    } catch {
      // Dev/browser environment: download via anchor
      const link = document.createElement("a");
      link.download = "node-graph.png";
      link.href = dataUrl;
      link.click();
    }
  }, [getNodes, getNodesBounds]);

  return { exportAsImage };
}
