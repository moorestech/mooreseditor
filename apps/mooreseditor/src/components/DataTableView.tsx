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
            <Table.Tr key={index}>
              <Table.Td>{renderCell(item)}</Table.Td>
            </Table.Tr>
          ))}
        </tbody>
      </Table>
    );
  } else if (typeof value === "object" && value !== null) {
    return (
      <Table>
        <tbody>
          {Object.entries(value).map(([key, val]) => (
            <Table.Tr key={key}>
              <Table.Td style={{ fontWeight: "bold" }}>{key}</Table.Td>
              <Table.Td>{renderCell(val)}</Table.Td>
            </Table.Tr>
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
        height: "100vh",
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
          <Table.Tr>
            {allKeys.map((key) => (
              <Table.Th
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
              </Table.Th>
            ))}
          </Table.Tr>
        </thead>
        <tbody>
          {fileData.map((row, rowIndex) => (
            <Table.Tr
              key={rowIndex}
              style={{
                cursor: "pointer",
                background:
                  selectedData === row
                    ? "linear-gradient(180deg, #EE722F -2.7%, #FFAD49 100%)"
                    : " none",
              }}
              onClick={() => {
                setSelectedData(row);
                setEditData(row);
              }}
            >
              {allKeys.map((key, colIndex) => (
                <Table.Td
                  key={colIndex}
                  style={{
                    padding: "8px",
                    textAlign: "left",
                    fontSize: "14px",
                    color: "#2D2D2D",
                  }}
                >
                  {renderCell(row[key])}
                </Table.Td>
              ))}
            </Table.Tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default DataTableView;
