import { useCallback, useEffect, useRef } from "react";

interface ScrollManagedView {
  type: string;
  path: string[];
}

export function useNestedViewScroll<T extends ScrollManagedView>(
  nestedViews: T[],
  setNestedViews: React.Dispatch<React.SetStateAction<T[]>>,
) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const shouldScrollToEndRef = useRef(false);

  const openNestedView = useCallback(
    (parentIndex: number, view: T) => {
      setNestedViews((prev) => {
        const baseViews = prev.slice(0, parentIndex + 1);
        const existingChild = prev[parentIndex + 1];
        const isSameChild =
          existingChild &&
          existingChild.type === view.type &&
          existingChild.path.length === view.path.length &&
          existingChild.path.every(
            (segment, index) => segment === view.path[index],
          );

        shouldScrollToEndRef.current = !isSameChild;

        return [...baseViews, view];
      });
    },
    [setNestedViews],
  );

  useEffect(() => {
    if (!shouldScrollToEndRef.current) {
      return;
    }

    const container = scrollContainerRef.current;
    if (!container) {
      shouldScrollToEndRef.current = false;
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      container.scrollTo({
        left: container.scrollWidth,
        behavior: "smooth",
      });
      shouldScrollToEndRef.current = false;
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [nestedViews]);

  return { scrollContainerRef, openNestedView };
}
