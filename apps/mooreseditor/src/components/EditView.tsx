import { Text, TextInput } from "@mantine/core";

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
        marginTop: "16px",
        borderTop: "1px solid #E2E2E2",
        borderLeft: "1px solid #E2E2E2",
        paddingTop: "52px",
        paddingLeft: "27px",
        minWidth: "400px",
        height: "100vh",
        background: "#FFFFFF",
        overflowY: "auto",
      }}
    >
      {Object.entries(editData).map(([key, value]) => (
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
      ))}
    </div>
  );
}

export default EditView;
