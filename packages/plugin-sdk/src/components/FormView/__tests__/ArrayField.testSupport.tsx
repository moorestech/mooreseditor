import { vi } from "vitest";

export const mockGenerateUuid = vi.fn(() => "default-uuid");

export const calculateAutoIncrementMock = vi.fn(
  (existingData: any[], key: string, config: { step?: number }) => {
    const values = existingData.map((item: any) => item[key] || 0);
    const max = values.length > 0 ? Math.max(...values) : 0;
    return max + (config?.step || 1);
  },
);

export const ArrayFieldMock = ({ path, data, onDataChange }: any) => {
  const name = path[path.length - 1];
  return (
    <div data-testid={`field-${name}`}>
      <input
        data-testid={`input-${name}`}
        value={data || ""}
        onChange={(event) => onDataChange(event.target.value)}
      />
    </div>
  );
};

export const arrayFieldIconMocks = {
  IconPlus: () => <span>+</span>,
  IconTrash: () => <span>×</span>,
  IconCopy: () => <span>⧉</span>,
  IconGripVertical: () => <span>::</span>,
};

export const defaultArrayFieldProps = {
  schema: {
    type: "array" as const,
    items: { type: "string" as const },
  },
  data: ["item1", "item2"],
  onDataChange: vi.fn(),
  path: ["root", "array"],
};

export const resetArrayFieldMocks = (): void => {
  vi.clearAllMocks();
};
