import { createContext } from "react";

export const EdgeEditContext = createContext<((edgeId: string) => void) | null>(
  null,
);
