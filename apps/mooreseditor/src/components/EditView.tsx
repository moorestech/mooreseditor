import { Text, TextInput } from "@mantine/core";

interface EditViewProps {
  editData: any;
  setEditData: (data: any) => void;
}

function EditView({ editData, setEditData }: EditViewProps) {
  function handleEditFieldChange(key: string, value: any) {
    setEditData({ ...editData, [key]: value });
  }

  function renderField(key: string, value: any) {
    if (typeof value === "object" && value !== null) {
      return (
        <div
          key={key}
          style={{
            marginBottom: "16px",
          }}
        >
          <Text
            style={{
              fontWeight: 700,
              marginBottom: "8px",
            }}
          >
            {key}
          </Text>
          <div
            style={{
              paddingLeft: "16px",
              borderLeft: "2px solid #E2E2E2",
            }}
          >
            {Object.entries(value).map(([nestedKey, nestedValue]) =>
              renderField(nestedKey, nestedValue)
            )}
          </div>
        </div>
      );
    } else {
      return (
        <div
          key={key}
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "16px",
            gap: "16px",
          }}
        >
          <Text
            style={{
              fontWeight: 700,
              minWidth: "120px",
            }}
          >
            {key}
          </Text>
          <TextInput
            value={String(value)}
            onChange={(e) => handleEditFieldChange(key, e.target.value)}
            style={{
              flex: 1,
            }}
          />
        </div>
      );
    }
  }

  return (
    <div
      style={{
        marginTop: "16px",
        borderTop: "1px solid #E2E2E2",
        borderLeft: "1px solid #E2E2E2",
        paddingTop: "16px",
        paddingLeft: "16px",
        minWidth: "400px",
        height: "100vh",
        background: "#FFFFFF",
        overflowY: "auto",
      }}
    >
      {Object.entries(editData).map(([key, value]) => renderField(key, value))}
    </div>
  );
}

export default EditView;
