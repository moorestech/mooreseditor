import { useCallback, useEffect, useRef, useState } from "react";

import {
  Divider,
  Paper,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
} from "@mantine/core";

import {
  FILTERABLE_TYPES,
  MASTER_NODE_TYPE_SECTIONS,
} from "../../utils/nodeTypeCatalog";
import { getRecords } from "../../utils/recordLookup";

import type { GraphNodeType } from "../../types/nodeGraph";
import type { MasterNodeType } from "../../utils/nodeTypeCatalog";
import type { SchemaMeta } from "../../utils/schemaMeta";
import type { Column } from "@moorestech/mooreseditor-plugin-sdk";

export interface ContextMenuPosition {
  screenX: number;
  screenY: number;
  flowX: number;
  flowY: number;
}

interface CanvasContextMenuProps {
  position: ContextMenuPosition | null;
  onClose: () => void;
  jsonData: Column[];
  schemaMetas: Map<string, SchemaMeta>;
  onAddNode: (
    type: GraphNodeType,
    masterGuid?: string,
    displayName?: string,
    position?: { x: number; y: number },
  ) => void;
  onCreateAndAddNode?: (
    type: MasterNodeType,
    position: { x: number; y: number },
  ) => boolean;
  creatableNodeTypes: ReadonlySet<MasterNodeType>;
  existingNodeGuids: Set<string>;
}

const MENU_WIDTH = 260;
const MENU_MAX_HEIGHT = 420;

export default function CanvasContextMenu({
  position,
  onClose,
  jsonData,
  schemaMetas,
  onAddNode,
  onCreateAndAddNode,
  creatableNodeTypes,
  existingNodeGuids,
}: CanvasContextMenuProps) {
  const [search, setSearch] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  // Reset search when menu opens/closes
  useEffect(() => {
    if (position) {
      setSearch("");
    }
  }, [position]);

  // Close on click outside
  useEffect(() => {
    if (!position) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [position, onClose]);

  const handleAddNode = useCallback(
    (type: GraphNodeType, masterGuid?: string, displayName?: string) => {
      if (!position) return;
      onAddNode(type, masterGuid, displayName, {
        x: position.flowX,
        y: position.flowY,
      });
      onClose();
    },
    [position, onAddNode, onClose],
  );

  const handleCreateAndAddNode = useCallback(
    (type: MasterNodeType) => {
      if (!position || !onCreateAndAddNode) return;
      const isCreated = onCreateAndAddNode(type, {
        x: position.flowX,
        y: position.flowY,
      });
      if (isCreated) {
        onClose();
      }
    },
    [position, onClose, onCreateAndAddNode],
  );

  const creatableSections = MASTER_NODE_TYPE_SECTIONS.filter((entry) =>
    creatableNodeTypes.has(entry.type),
  );

  if (!position) return null;

  // Adjust position so menu doesn't overflow viewport
  const adjustedX = Math.max(
    0,
    position.screenX + MENU_WIDTH > window.innerWidth
      ? position.screenX - MENU_WIDTH
      : position.screenX,
  );
  const adjustedY =
    position.screenY + MENU_MAX_HEIGHT > window.innerHeight
      ? Math.max(0, position.screenY - MENU_MAX_HEIGHT)
      : position.screenY;

  return (
    <Paper
      ref={menuRef}
      role="menu"
      aria-label="Add node"
      shadow="md"
      p="xs"
      withBorder
      style={{
        position: "fixed",
        left: adjustedX,
        top: adjustedY,
        zIndex: 1000,
        width: MENU_WIDTH,
      }}
    >
      <TextInput
        placeholder="Search records..."
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
        size="xs"
        mb="xs"
        autoFocus
      />
      <ScrollArea.Autosize mah={350}>
        <Stack gap={0}>
          {onCreateAndAddNode && creatableSections.length > 0 && (
            <>
              {creatableSections.map(({ label, type }) => (
                <UnstyledButton
                  key={type}
                  role="menuitem"
                  onClick={() => handleCreateAndAddNode(type)}
                  px="sm"
                  py={4}
                  style={{
                    display: "block",
                    width: "100%",
                    borderRadius: 4,
                  }}
                  className="context-menu-item"
                >
                  <Text size="xs">Add New {label}</Text>
                </UnstyledButton>
              ))}
              <Divider my={4} />
            </>
          )}
          <UnstyledButton
            role="menuitem"
            onClick={() => handleAddNode("note")}
            px="sm"
            py={4}
            style={{
              display: "block",
              width: "100%",
              borderRadius: 4,
            }}
            className="context-menu-item"
          >
            <Text size="xs">Add Memo</Text>
          </UnstyledButton>
          <UnstyledButton
            role="menuitem"
            onClick={() => handleAddNode("placeholder")}
            px="sm"
            py={4}
            style={{
              display: "block",
              width: "100%",
              borderRadius: 4,
            }}
            className="context-menu-item"
          >
            <Text size="xs">Add Placeholder</Text>
          </UnstyledButton>
          <Divider my={4} />
          {MASTER_NODE_TYPE_SECTIONS.map(({ label, type, schemaId }) => {
            const records = getRecords(schemaId, jsonData, schemaMetas).filter(
              (r) => {
                if (FILTERABLE_TYPES.has(type) && existingNodeGuids.has(r.guid))
                  return false;
                if (
                  search &&
                  !r.name?.toLowerCase().includes(search.toLowerCase())
                )
                  return false;
                return true;
              },
            );
            if (records.length === 0 && search) return null;
            return (
              <div key={type}>
                <Text size="xs" fw={700} c="dimmed" px="xs" py={4}>
                  {label}
                </Text>
                {records.length === 0 ? (
                  <Text size="xs" c="dimmed" px="sm">
                    No records
                  </Text>
                ) : (
                  records.map((r) => (
                    <UnstyledButton
                      key={r.guid}
                      role="menuitem"
                      onClick={() => handleAddNode(type, r.guid, r.name)}
                      px="sm"
                      py={4}
                      style={{
                        display: "block",
                        width: "100%",
                        borderRadius: 4,
                      }}
                      className="context-menu-item"
                    >
                      <Text size="xs" truncate>
                        {r.name || r.guid.substring(0, 8)}
                      </Text>
                    </UnstyledButton>
                  ))
                )}
                <Divider my={4} />
              </div>
            );
          })}
        </Stack>
      </ScrollArea.Autosize>
      <style>{`
        .context-menu-item:hover,
        .context-menu-item:focus-visible {
          background-color: var(--mantine-color-blue-light);
        }
      `}</style>
    </Paper>
  );
}
