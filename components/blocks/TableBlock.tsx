import DOMPurify from "isomorphic-dompurify";
import type { TableBlock as TableBlockType } from "@/types/section-v2";

/**
 * Table Content Block
 *
 * Tabular data display (pricing, comparisons, etc.) with Bootstrap styling.
 * Stripped of section wrapper — renders ONLY content for use inside sections.
 */

interface TableBlockProps {
  block: TableBlockType;
}

export default function TableBlock({ block }: TableBlockProps) {
  const {
    heading,
    subheading,
    headers,
    rows,
    striped = false,
    bordered = false,
    hover = false,
  } = block;

  const tableClasses = [
    "table",
    striped ? "table-striped" : "",
    bordered ? "table-bordered" : "",
    hover ? "table-hover" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div>
      {heading && (
        <h2 className="h2 fw-bold text-center mb-2">{heading}</h2>
      )}
      {subheading && (
        <p className="text-center text-muted mb-4">{subheading}</p>
      )}

      <div className="table-responsive">
        <table className={tableClasses}>
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th key={index}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                {row.cells.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(cell, {
                        ALLOWED_TAGS: [
                          "b",
                          "i",
                          "em",
                          "strong",
                          "a",
                          "span",
                          "br",
                        ],
                        ALLOWED_ATTR: ["href", "class", "target", "rel"],
                      }),
                    }}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
