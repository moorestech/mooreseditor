import { Button, Divider, Text } from "@mantine/core";

import { MoorestechIcon } from "./MoorestechIcon";

interface SidebarProps {
  menuToFileMap: Record<string, string>;
  selectedFile: string | null;
  loadFileData: (menuItem: string) => Promise<void>;
  openProjectDir: () => void;
  isEditing: boolean;
}

function Sidebar({
  menuToFileMap,
  selectedFile,
  loadFileData,
  openProjectDir,
  isEditing,
}: SidebarProps) {
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
          moorestech {isEditing && "*"}
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
      <Divider />
      <div
        style={{
          marginTop: "28px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        {Object.keys(menuToFileMap).map((menuItem, index) => (
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
