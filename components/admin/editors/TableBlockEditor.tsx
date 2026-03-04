"use client";

import type { TableBlock, ContentBlock } from "@/types/section-v2";

/**
 * TableBlockEditor
 *
 * Admin editor for the Table content block.
 * Allows editing heading, subheading, headers, rows, and table styling.
 */

interface TableBlockEditorProps {
  block: TableBlock;
  onChange: (updates: Partial<ContentBlock>) => void;
}

export default function TableBlockEditor({
  block,
  onChange,
}: TableBlockEditorProps) {
  const updateHeader = (index: number, value: string) => {
    const updatedHeaders = [...block.headers];
    updatedHeaders[index] = value;
    onChange({ headers: updatedHeaders });
  };

  const addHeader = () => {
    onChange({ headers: [...block.headers, "New Column"] });
    // Add empty cell to each row
    const updatedRows = block.rows.map((row) => ({
      ...row,
      cells: [...row.cells, ""],
    }));
    onChange({ headers: [...block.headers, "New Column"], rows: updatedRows });
  };

  const removeHeader = (index: number) => {
    const updatedHeaders = block.headers.filter((_, i) => i !== index);
    const updatedRows = block.rows.map((row) => ({
      ...row,
      cells: row.cells.filter((_, i) => i !== index),
    }));
    onChange({ headers: updatedHeaders, rows: updatedRows });
  };

  const updateCell = (rowIndex: number, cellIndex: number, value: string) => {
    const updatedRows = [...block.rows];
    const updatedCells = [...updatedRows[rowIndex].cells];
    updatedCells[cellIndex] = value;
    updatedRows[rowIndex] = { ...updatedRows[rowIndex], cells: updatedCells };
    onChange({ rows: updatedRows });
  };

  const addRow = () => {
    const newRow = {
      id: `row-${Date.now()}`,
      cells: block.headers.map(() => ""),
    };
    onChange({ rows: [...block.rows, newRow] });
  };

  const removeRow = (index: number) => {
    const updatedRows = block.rows.filter((_, i) => i !== index);
    onChange({ rows: updatedRows });
  };

  return (
    <div className="d-flex flex-column gap-3">
      <div>
        <label className="form-label small fw-semibold">Heading</label>
        <input
          type="text"
          className="form-control form-control-sm"
          value={block.heading || ""}
          onChange={(e) => onChange({ heading: e.target.value })}
        />
      </div>

      <div>
        <label className="form-label small fw-semibold">Subheading</label>
        <input
          type="text"
          className="form-control form-control-sm"
          value={block.subheading || ""}
          onChange={(e) => onChange({ subheading: e.target.value })}
        />
      </div>

      {/* Table Styling */}
      <div className="d-flex gap-3">
        <div className="form-check">
          <input
            type="checkbox"
            className="form-check-input"
            id="table-striped"
            checked={block.striped || false}
            onChange={(e) => onChange({ striped: e.target.checked })}
          />
          <label className="form-check-label small" htmlFor="table-striped">
            Striped
          </label>
        </div>
        <div className="form-check">
          <input
            type="checkbox"
            className="form-check-input"
            id="table-bordered"
            checked={block.bordered || false}
            onChange={(e) => onChange({ bordered: e.target.checked })}
          />
          <label className="form-check-label small" htmlFor="table-bordered">
            Bordered
          </label>
        </div>
        <div className="form-check">
          <input
            type="checkbox"
            className="form-check-input"
            id="table-hover"
            checked={block.hover || false}
            onChange={(e) => onChange({ hover: e.target.checked })}
          />
          <label className="form-check-label small" htmlFor="table-hover">
            Hover
          </label>
        </div>
      </div>

      {/* Headers */}
      <div>
        <label className="form-label small fw-semibold">
          Headers ({block.headers.length})
        </label>
        <div className="d-flex flex-wrap gap-2 mb-2">
          {block.headers.map((header, index) => (
            <div key={index} className="d-flex gap-1">
              <input
                type="text"
                className="form-control form-control-sm"
                value={header}
                onChange={(e) => updateHeader(index, e.target.value)}
                style={{ maxWidth: "150px" }}
              />
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={() => removeHeader(index)}
              >
                <i className="bi-x" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={addHeader}
        >
          <i className="bi-plus me-1" />
          Add Column
        </button>
      </div>

      {/* Rows */}
      <div>
        <label className="form-label small fw-semibold">
          Rows ({block.rows.length})
        </label>
        <div className="table-responsive">
          <table className="table table-sm table-bordered">
            <thead>
              <tr>
                {block.headers.map((header, i) => (
                  <th key={i} className="small">
                    {header}
                  </th>
                ))}
                <th style={{ width: "40px" }} />
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={row.id}>
                  {row.cells.map((cell, cellIndex) => (
                    <td key={cellIndex}>
                      <input
                        type="text"
                        className="form-control form-control-sm border-0 bg-transparent"
                        value={cell}
                        onChange={(e) =>
                          updateCell(rowIndex, cellIndex, e.target.value)
                        }
                        placeholder="Cell content (HTML)"
                      />
                    </td>
                  ))}
                  <td>
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => removeRow(rowIndex)}
                    >
                      <i className="bi-trash" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={addRow}
        >
          <i className="bi-plus me-1" />
          Add Row
        </button>
      </div>
    </div>
  );
}
