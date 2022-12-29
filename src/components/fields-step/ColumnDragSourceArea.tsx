import React, { useState, useMemo } from 'react';
import { useDrag } from '@use-gesture/react';

import { FieldAssignmentMap } from '../../parser';
import { Column } from './ColumnPreview';
import { DragState } from './ColumnDragState';
import { ColumnDragCard } from './ColumnDragCard';
import { IconButton } from '../IconButton';

import './ColumnDragSourceArea.scss';
import { useLocale } from '../../locale/LocaleContext';

const DEFAULT_PAGE_SIZE = 5; // fraction of 10 for easier counting

// @todo readable status text if not mouse-drag
const SourceBox: React.FC<{
  column: Column;
  fieldAssignments: FieldAssignmentMap;
  dragState: DragState | null;
  eventBinder: (column: Column) => ReturnType<typeof useDrag>;
  onSelect: (column: Column) => void;
  onUnassign: (column: Column) => void;
}> = ({
  column,
  fieldAssignments,
  dragState,
  eventBinder,
  onSelect,
  onUnassign
}) => {
  const isDragged = dragState ? column === dragState.column : false;

  const isAssigned = useMemo(
    () =>
      Object.keys(fieldAssignments).some(
        (fieldName) => fieldAssignments[fieldName] === column.index
      ),
    [fieldAssignments, column]
  );

  const eventHandlers = useMemo(() => eventBinder(column), [
    eventBinder,
    column
  ]);

  const l10n = useLocale('fieldsStep');

  return (
    <div className="CSVImporter_ColumnDragSourceArea__box">
      <div
        {...(isAssigned ? {} : eventHandlers)}
        style={{ touchAction: 'none' }}
      >
        <ColumnDragCard
          column={column}
          isAssigned={isAssigned}
          isShadow={isDragged || isAssigned}
          isDraggable={!dragState && !isDragged && !isAssigned}
        />
      </div>

      {/* tab order after column contents */}
      <div className="CSVImporter_ColumnDragSourceArea__boxAction">
        {isAssigned ? (
          <IconButton
            key="clear" // key-prop helps clear focus on click
            label={l10n.clearAssignmentTooltip}
            small
            type="replay"
            onClick={() => {
              onUnassign(column);
            }}
          />
        ) : (
          <IconButton
            key="dragSelect" // key-prop helps clear focus on click
            focusOnly
            label={
              dragState && dragState.column === column
                ? l10n.unselectColumnTooltip
                : l10n.selectColumnTooltip
            }
            small
            type="back"
            onClick={() => {
              onSelect(column);
            }}
          />
        )}
      </div>
    </div>
  );
};

// @todo current page indicator (dots)
export const ColumnDragSourceArea: React.FC<{
  columns: Column[];
  columnPageSize?: number;
  fieldAssignments: FieldAssignmentMap;
  dragState: DragState | null;
  eventBinder: (column: Column) => ReturnType<typeof useDrag>;
  onSelect: (column: Column) => void;
  onUnassign: (column: Column) => void;
}> = ({
  columns,
  columnPageSize,
  fieldAssignments,
  dragState,
  eventBinder,
  onSelect,
  onUnassign
}) => {
  // sanitize page size setting
  const pageSize = Math.round(Math.max(1, columnPageSize ?? DEFAULT_PAGE_SIZE));

  // track pagination state (resilient to page size changes)
  const [pageStart, setPageStart] = useState<number>(0);
  const [pageChanged, setPageChanged] = useState<boolean>(false);

  const page = Math.floor(pageStart / pageSize); // round down in case page size changes
  const pageCount = Math.ceil(columns.length / pageSize);

  // display page items and fill up with dummy divs up to pageSize
  const pageContents = columns
    .slice(page * pageSize, (page + 1) * pageSize)
    .map((column, columnIndex) => (
      <SourceBox
        key={columnIndex}
        column={column}
        fieldAssignments={fieldAssignments}
        dragState={dragState}
        eventBinder={eventBinder}
        onSelect={onSelect}
        onUnassign={onUnassign}
      />
    ));

  while (pageContents.length < pageSize) {
    pageContents.push(
      <div
        key={pageContents.length}
        className="CSVImporter_ColumnDragSourceArea__pageFiller"
      />
    );
  }

  const l10n = useLocale('fieldsStep');

  return (
    <section
      className="CSVImporter_ColumnDragSourceArea"
      aria-label={l10n.dragSourceAreaCaption}
    >
      <div className="CSVImporter_ColumnDragSourceArea__control">
        <IconButton
          label={l10n.previousColumnsTooltip}
          type="back"
          disabled={page === 0}
          onClick={() => {
            setPageStart(
              (prev) => Math.max(0, Math.floor(prev / pageSize) - 1) * pageSize
            );
            setPageChanged(true);
          }}
        />
      </div>
      <div className="CSVImporter_ColumnDragSourceArea__page">
        {dragState && !dragState.pointerStartInfo ? (
          <div
            className="CSVImporter_ColumnDragSourceArea__pageIndicator"
            role="status"
          >
            {l10n.getDragSourceActiveStatus(dragState.column.code)}
          </div>
        ) : (
          // show page number if needed (and treat as status role if it has changed)
          // @todo changing role to status does not seem to work
          pageCount > 1 && (
            <div
              className="CSVImporter_ColumnDragSourceArea__pageIndicator"
              role={pageChanged ? 'status' : 'text'}
            >
              {l10n.getDragSourcePageIndicator(page + 1, pageCount)}
            </div>
          )
        )}

        {pageContents}
      </div>
      <div className="CSVImporter_ColumnDragSourceArea__control">
        <IconButton
          label={l10n.nextColumnsTooltip}
          type="forward"
          disabled={page >= pageCount - 1}
          onClick={() => {
            setPageStart(
              (prev) =>
                Math.min(pageCount - 1, Math.floor(prev / pageSize) + 1) *
                pageSize
            );
          }}
        />
      </div>
    </section>
  );
};
