import { useState } from "react";

import { Text, TextInput, ActionIcon } from "@mantine/core";
import { IconChevronRight, IconStack2 } from "@tabler/icons-react";

interface EditViewProps {
  editData: any;
  setEditData: (data: any) => void;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  onSave: (data: any) => void;
}

function EditView({ editData, setEditData, setIsEditing }: EditViewProps) {
  const [nestedViews, setNestedViews] = useState<
    Array<{ key: string; data: any }>
  >([]);

  function handleEditFieldChange(key: string, value: any) {
    setEditData({ ...editData, [key]: value });
    setIsEditing(true);
  }

  function handleExpandNestedObject(key: string, value: any, level: number) {
    setNestedViews((prev) => {
      const updatedViews = prev.slice(0, level);
      return [...updatedViews, { key, data: value }];
    });
  }

  function renderField(key: string, value: any, level: number) {
    if (typeof value === "object" && value !== null) {
      return (
        <div
          key={key}
          style={{
            display: "inline-flex",
            position: "relative",
            height: "32px",
            marginBottom: "16px",
            background: "linear-gradient(90deg, #EE722F -2.7%, #FFAD49 100%)",
            borderRadius: "8px",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
            padding: "0 8px",
            boxShadow: "0px 0px 4px rgba(0, 0, 0, 0.25)",
          }}
          onClick={() => handleExpandNestedObject(key, value, level)}
        >
          <ActionIcon
            style={{
              backgroundColor: "transparent",
              color: "#FFFFFF",
              marginRight: "8px",
            }}
          >
            <IconStack2 size={20} />
          </ActionIcon>
          <Text
            style={{
              fontWeight: 700,
              fontSize: "16px",
              lineHeight: "19px",
              color: "#FFFFFF",
              flex: 1,
            }}
          >
            {key}
          </Text>
          <ActionIcon
            style={{
              backgroundColor: "transparent",
              color: "#FFFFFF",
            }}
          >
            <IconChevronRight size={20} />
          </ActionIcon>
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
        display: "flex",
        flexDirection: "row",
        height: "100vh",
        background: "#FFFFFF",
        overflowX: "auto",
      }}
    >
      <div
        style={{
          marginTop: "16px",
          borderTop: "1px solid #E2E2E2",
          borderLeft: "1px solid #E2E2E2",
          paddingTop: "16px",
          paddingLeft: "16px",
          minWidth: "400px",
          height: "100vh",
          overflowY: "auto",
        }}
      >
        {Object.entries(editData).map(([key, value]) =>
          renderField(key, value, 0)
        )}
      </div>

      {nestedViews.map((view, index) => (
        <div
          key={index}
          style={{
            marginTop: "16px",
            borderTop: "1px solid #E2E2E2",
            borderLeft: "1px solid #E2E2E2",
            paddingTop: "16px",
            paddingLeft: "16px",
            minWidth: "400px",
            height: "100vh",
            overflowY: "auto",
          }}
        >
          <Text
            style={{
              fontWeight: 700,
              fontSize: "18px",
              marginBottom: "16px",
            }}
          >
            {view.key}
          </Text>
          {Object.entries(view.data).map(([key, value]) =>
            renderField(key, value, index + 1)
          )}
        </div>
      ))}
    </div>
  );
}

export default EditView;
