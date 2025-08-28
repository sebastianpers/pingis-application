import type { JSX } from "react";
import { Table } from "react-bootstrap";

type Column<T> = {
  header: string;
  // "accessor" måste vara en av nycklarna i dataobjektet av typ T.
  // `keyof T` är delen som säkerställer detta.
  accessor: keyof T;
  format?: (value: unknown) => string;
};

type TableComponentProps<T, ID extends Extract<keyof T, string>> = {
  data: T[];
  columns: Column<T>[];
  handleFunc?: (id: T[ID]) => void;
  handleNavigation?: (id: T[ID]) => void;
  idKey: ID;
};

const TableComponent = <T, ID extends Extract<keyof T, string>>({
  columns,
  data,
  handleFunc,
  handleNavigation,
  idKey,
}: TableComponentProps<T, ID>): JSX.Element => {
  if (!columns || !data || data.length === 0) {
    return (
      <p className="mt-3 text-warning text-center">
        Det finns ingen data att visa.
      </p>
    );
  }

  return (
    <Table striped responsive hover className="transparent-table">
      <thead>
        <tr>
          {columns.map((col) => (
            <th className="text-orange" key={"th_" + String(col.accessor)}>
              {col.header}
            </th>
          ))}

          {handleFunc && idKey && <th></th>}
        </tr>
      </thead>

      <tbody>
        {data.map((row) => {
          const rowId = row[idKey];

          return (
            <tr
              className="cursor-pointer"
              key={String(rowId)}
              onClick={() => {
                handleNavigation?.(row[idKey]);
              }}
            >
              {columns.map((col) => {
                return (
                  <td
                    className="text-orange align-content-center"
                    key={"td_" + String(col.accessor)}
                  >
                    {col.format
                      ? col.format(row[col.accessor])
                      : String(row[col.accessor])}
                  </td>
                );
              })}

              {handleFunc && idKey && (
                <td>
                  <button
                    title="Ta bort spelare permanent"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFunc?.(rowId);
                    }}
                    className="btn bg-danger fw-bold"
                  >
                    X
                  </button>
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
};

export default TableComponent;
