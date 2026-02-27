import type { NodeGraphFile } from "./types";

export const sampleNodeGraph: NodeGraphFile = {
  version: 1,
  viewport: { x: 0, y: 0, zoom: 0.8 },
  nodes: [
    {
      id: "research-0f97e445",
      type: "research",
      position: { x: 0, y: 0 },
      masterGuid: "0f97e445-1ac0-4313-b3c3-6c32b24eaaed",
    },
    {
      id: "research-a3d1c63b",
      type: "research",
      position: { x: 800, y: 800 },
      masterGuid: "a3d1c63b-b14c-44ba-aae9-22f7c621b72d",
    },
    {
      id: "research-d4e0b2bb",
      type: "research",
      position: { x: 800, y: 0 },
      masterGuid: "d4e0b2bb-9f20-4e0f-bfef-26c7f9449cd0",
    },
    {
      id: "item-4abdae31",
      type: "item",
      position: { x: 200, y: 100 },
      masterGuid: "4abdae31-6e3b-42c5-a097-4cf6021751ca",
    },
    {
      id: "item-5c5b7ee0",
      type: "item",
      position: { x: 200, y: 250 },
      masterGuid: "5c5b7ee0-d1ea-420e-951e-2b2b49fee81b",
    },
  ],
  edges: [
    {
      id: "dep-1",
      source: "research-0f97e445",
      target: "research-a3d1c63b",
      edgeType: "dependency",
    },
    {
      id: "dep-2",
      source: "research-0f97e445",
      target: "research-d4e0b2bb",
      edgeType: "dependency",
    },
  ],
};
