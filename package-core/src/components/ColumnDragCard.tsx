import React, { useMemo } from 'react';

import { PREVIEW_ROW_COUNT } from './parser';

import './ColumnDragCard.scss';

export interface Column {
  index: number;
  code: string;
  values: string[];
}

// @todo sort out "grabbing" cursor state (does not work with pointer-events:none)
export const ColumnDragCard: React.FC<{
  hasHeaders: boolean;
  column?: Column;
  rowCount?: number;
  hasError?: boolean;
  isShadow?: boolean;
  isDraggable?: boolean;
  isDragged?: boolean;
  isDropIndicator?: boolean;
}> = ({
  hasHeaders,
  column: optionalColumn,
  rowCount = PREVIEW_ROW_COUNT,
  hasError,
  isShadow,
  isDraggable,
  isDragged,
  isDropIndicator
}) => {
  const isDummy = !optionalColumn;

  const column = useMemo<Column>(
    () =>
      optionalColumn || {
        index: -1,
        code: '',
        values: [...new Array(PREVIEW_ROW_COUNT)].map(() => '')
      },
    [optionalColumn]
  );

  const headerValue = hasHeaders ? column.values[0] : undefined;
  const dataValues = column.values.slice(hasHeaders ? 1 : 0, rowCount);

  return (
    // not changing variant dynamically because it causes a height jump
    <div
      key={isDummy || isShadow ? 1 : isDropIndicator ? 2 : 0} // force re-creation to avoid transition anim
      className="ColumnDragCard"
      data-dummy={!!isDummy}
      data-error={!!hasError}
      data-shadow={!!isShadow}
      data-draggable={!!isDraggable}
      data-dragged={!!isDragged}
      data-drop-indicator={!!isDropIndicator}
    >
      <div className="ColumnDragCard__cardHeader">
        {isDummy ? (
          <var role="text">Unassigned field</var>
        ) : (
          <var role="text">Column {column.code}</var>
        )}
        {isDummy ? '\u00a0' : <b aria-hidden>{column.code}</b>}
      </div>

      {headerValue !== undefined ? (
        <div className="ColumnDragCard__cardValue" data-header>
          {headerValue || '\u00a0'}
        </div>
      ) : null}

      {/* all values grouped into one readable string */}
      <div role="text">
        {dataValues.map((value, valueIndex) => (
          <div key={valueIndex} className="ColumnDragCard__cardValue">
            {value || '\u00a0'}
          </div>
        ))}
      </div>
    </div>
  );
};
