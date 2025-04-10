import { Table } from "@mantine/core";

interface DataTableViewProps {
  fileData: Array<Record<string, any>>;
  selectedData: Record<string, any> | null;
  setSelectedData: (data: Record<string, any>) => void;
  setEditData: (data: Record<string, any>) => void;
}

function renderCell(value: any): JSX.Element | string {
  if (Array.isArray(value)) {
    return (
      <Table>
        <tbody>
          {value.map((item, index) => (
            <tr key={index}>
              <td>{renderCell(item)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  } else if (typeof value === "object" && value !== null) {
    return (
      <Table>
        <tbody>
          {Object.entries(value).map(([key, val]) => (
            <tr key={key}>
              <td style={{ fontWeight: "bold" }}>{key}</td>
              <td>{renderCell(val)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  } else {
    return String(value);
  }
}

function DataTableView({
  fileData,
  selectedData,
  setSelectedData,
  setEditData,
}: DataTableViewProps) {
  const allKeys = Array.from(
    new Set(fileData.flatMap((item) => Object.keys(item)))
  );

  return (
    <div
      style={{
        width: "100%",
        background: "#FFFFFF",
        boxShadow: "0px 0px 4px rgba(0, 0, 0, 0.25)",
        borderRadius: "8px",
        padding: "16px",
        overflowY: "auto",
      }}
    >
      <Table striped highlightOnHover withBorder>
        <thead
          style={{
            borderBottom: "2px solid #E2E2E2",
          }}
        >
          <tr>
            {allKeys.map((key) => (
              <th
                key={key}
                style={{
                  padding: "8px",
                  textAlign: "left",
                  fontWeight: 700,
                  fontSize: "14px",
                  color: "#2D2D2D",
                }}
              >
                {key}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {fileData.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              style={{
                cursor: "pointer",
                background: selectedData === row ? "#FFF4E5" : "#FFFFFF",
              }}
              onClick={() => {
                setSelectedData(row);
                setEditData(row);
              }}
            >
              {allKeys.map((key, colIndex) => (
                <td
                  key={colIndex}
                  style={{
                    padding: "8px",
                    textAlign: "left",
                    fontSize: "14px",
                    color: "#2D2D2D",
                  }}
                >
                  {renderCell(row[key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default DataTableView;
