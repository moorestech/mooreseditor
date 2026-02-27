/**
 * Sidebar — reads from Zustand stores, no props needed.
 */

import { useMemo, useCallback } from "react";

import { Button, Divider, Text, Loader, Group } from "@mantine/core";

import { MoorestechIcon } from "../../../components/MoorestechIcon";
import { useDataStore } from "../../../stores/dataStore";
import { useEditorStore } from "../../../stores/editorStore";
import { useProjectStore } from "../../../stores/projectStore";
import { useSchemaStore } from "../../../stores/schemaStore";

export default function Sidebar() {
  const menuToFileMap = useProjectStore((s) => s.menuToFileMap);
  const openProjectDir = useProjectStore((s) => s.openProjectDir);
  const schemas = useSchemaStore((s) => s.schemas);
  const columns = useDataStore((s) => s.columns);
  const isPreloading = useDataStore((s) => s.isPreloading);
  const hasUnsavedChanges = useDataStore((s) => s.hasUnsavedChanges);
  const selectedSchema = useEditorStore((s) => s.selectedSchema);
  const selectSchema = useEditorStore((s) => s.selectSchema);
  const setNestedViews = useEditorStore((s) => s.setNestedViews);

  const sortedMenuItems = useMemo(() => {
    const menuItems = Object.keys(menuToFileMap);

    const itemsWithSort = menuItems.map((menuItem) => {
      const schema = schemas[menuItem];
      // sortOrder is an optional extension on schema objects
      const sortOrder =
        schema && "sortOrder" in schema
          ? (schema as { sortOrder?: number }).sortOrder
          : undefined;
      return { id: menuItem, sortOrder };
    });

    itemsWithSort.sort((a, b) => {
      if (a.sortOrder !== undefined && b.sortOrder !== undefined) {
        return a.sortOrder - b.sortOrder;
      }
      if (a.sortOrder !== undefined) return -1;
      if (b.sortOrder !== undefined) return 1;
      return a.id.localeCompare(b.id);
    });

    return itemsWithSort.map((item) => item.id);
  }, [menuToFileMap, schemas]);

  const loadFileData = useCallback(
    async (menuItem: string) => {
      const existing = columns.find((c) => c.title === menuItem);
      if (existing) {
        console.log(`${menuItem} is already loaded. Using cached data.`);
        selectSchema(menuItem);
        setNestedViews([]);
        return;
      }

      const { schemaDir, projectDir, masterDir } = useProjectStore.getState();
      const loadedSchema = await useSchemaStore
        .getState()
        .loadSchema(menuItem, schemaDir || "");
      await useDataStore
        .getState()
        .loadJsonFile(
          menuItem,
          columns.length,
          projectDir || "",
          masterDir,
          loadedSchema,
        );
      selectSchema(menuItem);
      setNestedViews([]);
    },
    [columns, selectSchema, setNestedViews],
  );

  return (
    <div
      style={{
        width: "194px",
        height: "100%",
        background: "#FFFFFF",
        boxShadow: "0px 0px 4px rgba(0, 0, 0, 0.25)",
        borderRadius: "8px",
        padding: "16px",
        overflowY: "auto",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <MoorestechIcon />
        <Text
          style={{
            fontWeight: 700,
            fontSize: "20px",
            lineHeight: "24px",
            color: "#2D2D2D",
            marginLeft: "8px",
          }}
        >
          moorestech {hasUnsavedChanges && "*"}
        </Text>
      </div>
      <Button
        style={{
          display: "block",
          margin: "16px auto",
          width: "154px",
          height: "32px",
          background: "#EE722F",
          borderRadius: "8px",
          color: "#FFFFFF",
        }}
        onClick={() => void openProjectDir()}
      >
        File Open
      </Button>
      {isPreloading && (
        <Group justify="center" mt="sm" mb="sm">
          <Loader size="sm" />
          <Text size="sm" c="dimmed">
            Loading data...
          </Text>
        </Group>
      )}
      <Divider />
      <div
        style={{
          marginTop: "28px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        {sortedMenuItems.map((menuItem, index) => (
          <Text
            key={index}
            style={{
              fontWeight: 700,
              fontSize: "16px",
              lineHeight: "19px",
              cursor: "pointer",
              background:
                selectedSchema === menuItem
                  ? "linear-gradient(90deg, #EE722F -2.7%, #FFAD49 100%)"
                  : "none",
              WebkitBackgroundClip:
                selectedSchema === menuItem ? "text" : "none",
              WebkitTextFillColor:
                selectedSchema === menuItem ? "transparent" : "#2D2D2D",
              color: selectedSchema === menuItem ? "transparent" : "#2D2D2D",
            }}
            onClick={() => void loadFileData(menuItem)}
          >
            {menuItem}
          </Text>
        ))}
      </div>
    </div>
  );
}
