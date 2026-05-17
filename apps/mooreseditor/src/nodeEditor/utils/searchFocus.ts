const REACT_FLOW_NODE_SELECTOR = ".react-flow__node";

export function getReactFlowNodeIdFromSearchMatch(
  element: Element | null,
): string | null {
  const nodeElement = element?.closest<HTMLElement>(REACT_FLOW_NODE_SELECTOR);
  return nodeElement?.dataset.id || null;
}
