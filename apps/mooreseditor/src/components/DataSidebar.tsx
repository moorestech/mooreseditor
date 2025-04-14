import { Text } from "@mantine/core";

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
        left: "230px",
        top: "16px",
        background: "#FFFFFF",
        boxShadow: "0px 0px 4px rgba(0, 0, 0, 0.25)",
        borderRadius: "8px",
        padding: "16px",
        overflowY: "auto",
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
            justifyContent: "center",
            cursor: "pointer",
            boxShadow:
              selectedData === item
                ? "0px 0px 4px rgba(0, 0, 0, 0.25)"
                : "none",
          }}
          onClick={() => setSelectedData(item)}
        >
          <Text
            style={{
              fontWeight: 700,
              fontSize: "16px",
              lineHeight: "19px",
              color: selectedData === item ? "#FFFFFF" : "#2D2D2D",
            }}
          >
            {item.name || `Item ${index + 1}`}
          </Text>
        </div>
      ))}
    </div>
  );
}

export default DataSidebar;
