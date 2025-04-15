import { Text, ActionIcon } from "@mantine/core";
import { IconChevronRight, IconStack2 } from "@tabler/icons-react";

interface DataSidebarProps {
  fileData: any[];
  selectedData: any | null;
  setSelectedData: (data: any) => void;
}

function DataSidebar({
  fileData,
  selectedData,
  setSelectedData,
}: DataSidebarProps) {
  return (
    <div
      style={{
        position: "absolute",
        width: "194px",
        height: "100vh",
        left: "212px",
        top: "32px",
        background: "#FFFFFF",
        borderTop: "1px solid #E2E2E2",
        padding: "16px",
        overflowY: "auto",
        borderRight: "1px solid #EDEDED",
      }}
    >
      {fileData.map((item, index) => (
        <div
          key={index}
          style={{
            position: "relative",
            width: "160px",
            height: "32px",
            marginBottom: "16px",
            background:
              selectedData === item
                ? "linear-gradient(90deg, #EE722F -2.7%, #FFAD49 100%)"
                : "#FFFFFF",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
            padding: "0 8px",
            boxShadow:
              selectedData === item
                ? "0px 0px 4px rgba(0, 0, 0, 0.25)"
                : "none",
          }}
          onClick={() => setSelectedData(item)}
        >
          <ActionIcon
            style={{
              backgroundColor: "transparent",
              color: selectedData === item ? "#FFFFFF" : "#2D2D2D",
              marginRight: "8px",
            }}
          >
            <IconStack2 size={16} />
          </ActionIcon>
          <Text
            style={{
              fontWeight: 700,
              fontSize: "16px",
              lineHeight: "19px",
              color: selectedData === item ? "#FFFFFF" : "#2D2D2D",
              flex: 1,
            }}
          >
            {item.name || `Item ${index + 1}`}
          </Text>
          <ActionIcon
            style={{
              backgroundColor: "transparent",
              color: selectedData === item ? "#FFFFFF" : "#2D2D2D",
            }}
          >
            <IconChevronRight size={16} />
          </ActionIcon>
        </div>
      ))}
    </div>
  );
}

export default DataSidebar;
