import React, { useMemo, useEffect, useRef } from 'react';
import { useDrag } from 'react-use-gesture';

import { FieldAssignmentMap } from '../../parser';
import { Column } from './ColumnPreview';
import { DragState, Field } from './ColumnDragState';
import { ColumnDragCard } from './ColumnDragCard';
import { IconButton } from '../IconButton';

export type FieldTouchedMap = { [name: string]: boolean | undefined };

import './ColumnDragTargetArea.scss';
import { useLocale } from '../../locale/LocaleContext';

const TargetBox: React.FC<{
  hasHeaders: boolean; // for correct display of dummy card
  field: Field;
  touched?: boolean;
  assignedColumn: Column | null;
  dragState: DragState | null;
  eventBinder: (
    column: Column,
    startFieldName?: string
  ) => ReturnType<typeof useDrag>;
  onHover: (fieldName: string, isOn: boolean) => void;
  onAssign: (fieldName: string) => void;
  onUnassign: (column: Column) => void;
}> = ({
  hasHeaders,
  field,
  touched,
  assignedColumn,
  dragState,
  eventBinder,
  onHover,
  onAssign,
  onUnassign
}) => {
  // wrap in ref to avoid re-triggering effect
  const onHoverRef = useRef(onHover);
  onHoverRef.current = onHover;

  // respond to hover events when there is active mouse drag happening
  // (not keyboard-emulated one)
  const containerRef = useRef<HTMLDivElement>(null);
  const isHoveredRef = useRef(false); // simple tracking of current hover state to avoid spamming onHover (not for display)
  useEffect(() => {
    const container = containerRef.current;
    if (!dragState || !dragState.pointerStartInfo || !container) {
      return;
    }

    // measure the current scroll-independent position
    const rect = container.getBoundingClientRect();
    const minX = rect.x;
    const maxX = rect.x + rect.width;
    const minY = rect.y;
    const maxY = rect.y + rect.height;

    // listen for pointer movement (mouse or touch) and detect hover
    const listeners = dragState.updateListeners;
    const listenerName = `field:${field.name}`;

    listeners[listenerName] = (xy: number[]) => {
      const isInBounds =
        xy[0] >= minX && xy[0] < maxX && xy[1] >= minY && xy[1] < maxY;

      if (isInBounds !== isHoveredRef.current) {
        // cannot use local var for isHovered state because the effect re-triggers after this
        isHoveredRef.current = isInBounds;
        onHoverRef.current(field.name, isInBounds);
      }
    };

    // cleanup
    return () => {
      delete listeners[listenerName];
    };
  }, [dragState, field.name]);

  // if this field is the current highlighted drop target,
  // get the originating column data for display
  const sourceColumn =
    dragState && dragState.dropFieldName === field.name
      ? dragState.column
      : null;

  // see if currently assigned column is being dragged again
  const isReDragged = dragState ? dragState.column === assignedColumn : false;

  // drag start handlers for columns that can be re-dragged (i.e. are assigned)
  const dragStartHandlers = useMemo(
    () =>
      assignedColumn && !isReDragged
        ? eventBinder(assignedColumn, field.name)
        : {},
    [eventBinder, assignedColumn, isReDragged, field.name]
  );

  const valueContents = useMemo(() => {
    if (sourceColumn) {
      return (
        <ColumnDragCard rowCount={3} column={sourceColumn} isDropIndicator />
      );
    }

    if (assignedColumn) {
      return (
        <ColumnDragCard
          rowCount={3}
          column={assignedColumn}
          isShadow={isReDragged}
          isDraggable={!isReDragged}
        />
      );
    }

    const hasError = touched && !field.isOptional;
    return (
      <ColumnDragCard
        rowCount={3}
        hasHeaders={hasHeaders}
        hasError={hasError}
      />
    );
  }, [hasHeaders, field, touched, assignedColumn, sourceColumn, isReDragged]);

  const l10n = useLocale('fieldsStep');

  // @todo mouse cursor changes to reflect draggable state
  return (
    <section
      className="CSVImporter_ColumnDragTargetArea__box"
      aria-label={
        field.isOptional
          ? l10n.getDragTargetOptionalCaption(field.label)
          : l10n.getDragTargetRequiredCaption(field.label)
      }
      ref={containerRef}
    >
      <div className="CSVImporter_ColumnDragTargetArea__boxLabel" aria-hidden>
        {field.label}
        {field.isOptional ? null : <b>*</b>}
      </div>

      <div className="CSVImporter_ColumnDragTargetArea__boxValue">
        {!sourceColumn && !assignedColumn && (
          <div
            className="CSVImporter_ColumnDragTargetArea__boxPlaceholderHelp"
            aria-hidden
          >
            {l10n.dragTargetPlaceholder}
          </div>
        )}

        <div {...dragStartHandlers}>{valueContents}</div>

        {/* tab order after column contents */}
        {dragState && !dragState.pointerStartInfo ? (
          <div className="CSVImporter_ColumnDragTargetArea__boxValueAction">
            <IconButton
              label={l10n.getDragTargetAssignTooltip(dragState.column.code)}
              small
              type="forward"
              onClick={() => onAssign(field.name)}
            />
          </div>
        ) : (
          !sourceColumn &&
          assignedColumn && (
            <div className="CSVImporter_ColumnDragTargetArea__boxValueAction">
              <IconButton
                label={l10n.dragTargetClearTooltip}
                small
                type="close"
                onClick={() => onUnassign(assignedColumn)}
              />
            </div>
          )
        )}
      </div>
    </section>
  );
};

export const ColumnDragTargetArea: React.FC<{
  hasHeaders: boolean; // for correct display of dummy card
  fields: Field[];
  columns: Column[];
  fieldTouched: FieldTouchedMap;
  fieldAssignments: FieldAssignmentMap;
  dragState: DragState | null;
  eventBinder: (
    // @todo import type from drag state tracker
    column: Column,
    startFieldName?: string
  ) => ReturnType<typeof useDrag>;
  onHover: (fieldName: string, isOn: boolean) => void;
  onAssign: (fieldName: string) => void;
  onUnassign: (column: Column) => void;
}> = ({
  hasHeaders,
  fields,
  columns,
  fieldTouched,
  fieldAssignments,
  dragState,
  eventBinder,
  onHover,
  onAssign,
  onUnassign
}) => {
  const l10n = useLocale('fieldsStep');

  return (
    <section
      className="CSVImporter_ColumnDragTargetArea"
      aria-label={l10n.dragTargetAreaCaption}
    >
      {fields.map((field) => {
        const assignedColumnIndex = fieldAssignments[field.name];

        return (
          <TargetBox
            key={field.name}
            field={field}
            touched={fieldTouched[field.name]}
            hasHeaders={hasHeaders}
            assignedColumn={
              assignedColumnIndex !== undefined
                ? columns[assignedColumnIndex]
                : null
            }
            dragState={dragState}
            eventBinder={eventBinder}
            onHover={onHover}
            onAssign={onAssign}
            onUnassign={onUnassign}
          />
        );
      })}
    </section>
  );
};
