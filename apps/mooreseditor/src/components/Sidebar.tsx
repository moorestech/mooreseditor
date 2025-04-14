import { Button, Text } from "@mantine/core";

import { MoorestechIcon } from "./MoorestechIcon";

interface SidebarProps {
  menuToFileMap: Record<string, string>;
  selectedFile: string | null;
  loadFileData: (menuItem: string) => void;
  openProjectDir: () => void;
}

function Sidebar({
  menuToFileMap,
  selectedFile,
  loadFileData,
  openProjectDir,
}: SidebarProps) {
  return (
    <div
      style={{
        position: "absolute",
        width: "194px",
        height: "100vh",
        left: "16px",
        top: "16px",
        background: "#FFFFFF",
        boxShadow: "0px 0px 4px rgba(0, 0, 0, 0.25)",
        borderRadius: "8px",
        padding: "16px",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          position: "absolute",
          top: "31px",
        }}
      >
        <MoorestechIcon />
        <Text
          style={{
            fontWeight: 700,
            fontSize: "20px",
            lineHeight: "24px",
            color: "#2D2D2D",
          }}
        >
          moorestech
        </Text>
      </div>
      <Button
        style={{
          display: "block",
          margin: "0 auto",
          width: "154px",
          height: "32px",
          bottom: "16px",
          marginTop: "71px",
          background: "#EE722F",
          borderRadius: "8px",
          color: "#FFFFFF",
        }}
        onClick={openProjectDir}
      >
        File Open
      </Button>
      <div style={{ marginTop: "28px" }}>
        {Object.keys(menuToFileMap).map((menuItem, index) => (
          <Text
            key={index}
            style={{
              fontWeight: 700,
              fontSize: "16px",
              lineHeight: "19px",
              cursor: "pointer",
              marginBottom: "16px",
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
