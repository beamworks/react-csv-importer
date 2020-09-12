import React from 'react';

export const FormatDataRowPreview: React.FC<{
  hasHeaders: boolean;
  rows: string[][];
  // eslint-disable-next-line react/display-name
}> = React.memo(({ hasHeaders, rows }) => {
  const headerRow = hasHeaders ? rows[0] : null;
  const bodyRows = hasHeaders ? rows.slice(1) : rows;

  return (
    <div className="CSVImporter_FormatDataRowPreview">
      <table className="CSVImporter_FormatDataRowPreview__table">
        {headerRow && (
          <thead>
            <tr>
              {headerRow.map((item, itemIndex) => (
                <th key={itemIndex}>{item}</th>
              ))}
            </tr>
          </thead>
        )}

        <tbody>
          {bodyRows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((item, itemIndex) => (
                <td key={itemIndex}>{item}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});
