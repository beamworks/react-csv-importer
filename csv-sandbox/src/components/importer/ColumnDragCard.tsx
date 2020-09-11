import React, { useMemo } from 'react';

import { PREVIEW_ROW_COUNT } from './parser';

import './ColumnDragCard.scss';

export interface Column {
  index: number;
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
        values: [...new Array(PREVIEW_ROW_COUNT)].map(() => '')
      },
    [optionalColumn]
  );

  // spreadsheet-style column code computation (A, B, ..., Z, AA, AB, ..., etc)
  const columnCode = useMemo(() => {
    const value = column.index;

    // ignore dummy index
    if (value < 0) {
      return '';
    }

    // first, determine how many base-26 letters there should be
    // (because the notation is not purely positional)
    let digitCount = 1;
    let base = 0;
    let next = 26;

    while (next <= value) {
      digitCount += 1;
      base = next;
      next = next * 26 + 26;
    }

    // then, apply normal positional digit computation on remainder above base
    let remainder = value - base;

    const digits = [];
    while (digits.length < digitCount) {
      const lastDigit = remainder % 26;
      remainder = Math.floor((remainder - lastDigit) / 26); // applying floor just in case

      // store ASCII code, with A as 0
      digits.unshift(65 + lastDigit);
    }

    return String.fromCharCode.apply(null, digits);
  }, [column]);

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
      aria-hidden={isDummy}
    >
      <div className="ColumnDragCard__cardHeader">
        {isDummy ? '\u00a0' : <b aria-hidden>{columnCode}</b>}
        {!isDummy && <var role="text">Column {columnCode}</var>}
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
