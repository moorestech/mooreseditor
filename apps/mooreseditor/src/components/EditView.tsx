import { Text } from "@mantine/core";

interface EditViewProps {
  editData: any;
  setEditData: (data: any) => void;
}

function EditView({ editData, setEditData }: EditViewProps) {
  function handleEditFieldChange(key: string, value: string) {
    setEditData({ ...editData, [key]: value });
  }

  return (
    <div
      style={{
        minWidth: "400px",
        height: "800px",
        background: "#FFFFFF",
        borderRadius: "8px",
        padding: "16px",
        overflowY: "auto",
      }}
    >
      {Object.entries(editData).map(([key, value]) => (
        <div key={key} style={{ marginBottom: "16px" }}>
          <Text style={{ fontWeight: 700, marginBottom: "8px" }}>{key}</Text>
          <input
            type="text"
            value={String(value)}
            onChange={(e) => handleEditFieldChange(key, e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #EDEDED",
            }}
          />
        </div>
      ))}
    </div>
  );
}

export default EditView;
