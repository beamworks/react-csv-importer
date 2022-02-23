import React, { useMemo } from 'react';

import { PREVIEW_ROW_COUNT } from '../../parser';
import { Column } from './ColumnPreview';

import './ColumnDragCard.scss';
import { useLocale } from '../../locale/LocaleContext';

// @todo sort out "grabbing" cursor state (does not work with pointer-events:none)
export const ColumnDragCard: React.FC<{
  hasHeaders?: boolean; // for correct display of dummy card
  column?: Column;
  rowCount?: number;
  hasError?: boolean;
  isAssigned?: boolean;
  isShadow?: boolean;
  isDraggable?: boolean;
  isDragged?: boolean;
  isDropIndicator?: boolean;
}> = ({
  hasHeaders,
  column: optionalColumn,
  rowCount = PREVIEW_ROW_COUNT,
  hasError,
  isAssigned,
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
        header: hasHeaders ? '' : undefined,
        values: [...new Array(PREVIEW_ROW_COUNT)].map(() => '')
      },
    [optionalColumn, hasHeaders]
  );

  const headerValue = column.header;
  const dataValues = column.values.slice(
    0,
    headerValue === undefined ? rowCount : rowCount - 1
  );

  const l10n = useLocale('fieldsStep');

  return (
    // not changing variant dynamically because it causes a height jump
    <div
      key={isDummy || isShadow ? 1 : isDropIndicator ? 2 : 0} // force re-creation to avoid transition anim
      className="CSVImporter_ColumnDragCard"
      data-dummy={!!isDummy}
      data-error={!!hasError}
      data-shadow={!!isShadow}
      data-draggable={!!isDraggable}
      data-dragged={!!isDragged}
      data-drop-indicator={!!isDropIndicator}
    >
      <div className="CSVImporter_ColumnDragCard__cardHeader">
        {isDummy ? (
          <var role="text">{l10n.columnCardDummyHeader}</var>
        ) : (
          <var role="text">{l10n.getColumnCardHeader(column.code)}</var>
        )}
        {isDummy || isAssigned ? '\u00a0' : <b aria-hidden>{column.code}</b>}
      </div>

      {headerValue !== undefined ? (
        <div className="CSVImporter_ColumnDragCard__cardValue" data-header>
          {headerValue || '\u00a0'}
        </div>
      ) : null}

      {/* all values grouped into one readable string */}
      <div role="text">
        {dataValues.map((value, valueIndex) => (
          <div
            key={valueIndex}
            className="CSVImporter_ColumnDragCard__cardValue"
          >
            {value || '\u00a0'}
          </div>
        ))}
      </div>
    </div>
  );
};
