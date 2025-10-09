import { useMemo } from "react";

import { Button, Divider, Text, Loader, Group } from "@mantine/core";

import { MoorestechIcon } from "./MoorestechIcon";

interface SidebarProps {
  menuToFileMap: Record<string, string>;
  selectedFile: string | null;
  loadFileData: (menuItem: string) => Promise<void>;
  openProjectDir: () => void;
  isEditing: boolean;
  hasUnsavedChanges: boolean;
  schemas: Record<string, any>;
  isPreloading?: boolean;
}

function Sidebar({
  menuToFileMap,
  selectedFile,
  loadFileData,
  openProjectDir,
  isEditing,
  hasUnsavedChanges,
  schemas,
  isPreloading = false,
}: SidebarProps) {
  const sortedMenuItems = useMemo(() => {
    const menuItems = Object.keys(menuToFileMap);

    // Create list with sortOrder info
    const itemsWithSort = menuItems.map((menuItem) => {
      const schema = schemas[menuItem];
      return {
        id: menuItem,
        sortOrder: schema?.sortOrder,
      };
    });

    // Sort by sortOrder (items without sortOrder come last, sorted by id)
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
          moorestech {(isEditing || hasUnsavedChanges) && "*"}
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
        onClick={openProjectDir}
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
                selectedFile === menuItem
                  ? "linear-gradient(90deg, #EE722F -2.7%, #FFAD49 100%)"
                  : "none",
              WebkitBackgroundClip: selectedFile === menuItem ? "text" : "none",
              WebkitTextFillColor:
                selectedFile === menuItem ? "transparent" : "#2D2D2D",
              color: selectedFile === menuItem ? "transparent" : "#2D2D2D",
            }}
            onClick={() => loadFileData(menuItem)}
          >
            {menuItem}
          </Text>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;
