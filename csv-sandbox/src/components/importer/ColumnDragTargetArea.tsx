import React, { useMemo } from 'react';
import { useDrag } from 'react-use-gesture';

import { FieldAssignmentMap } from './parser';
import { DragState, Field } from './ColumnDragState';
import { ColumnDragCard, Column } from './ColumnDragCard';
import { IconButton } from './IconButton';

export type FieldTouchedMap = { [name: string]: boolean | undefined };

import './ColumnDragTargetArea.scss';

const TargetBox: React.FC<{
  hasHeaders: boolean;
  field: Field;
  touched?: boolean;
  assignedColumn: Column | null;
  dragState: DragState | null;
  eventBinder: (
    column: Column,
    startFieldName?: string
  ) => ReturnType<typeof useDrag>;
  onHover: (fieldName: string, isOn: boolean) => void;
  onUnassign: (column: Column) => void;
}> = ({
  hasHeaders,
  field,
  touched,
  assignedColumn,
  dragState,
  eventBinder,
  onHover,
  onUnassign
}) => {
  const mouseHoverHandlers = dragState
    ? {
        onMouseEnter: () => onHover(field.name, true),
        onMouseLeave: () => onHover(field.name, false)
      }
    : {};

  const sourceColumn =
    dragState && dragState.dropFieldName === field.name
      ? dragState.column
      : null;

  // see if currently assigned column is being dragged again
  const isReDragged = dragState ? dragState.column === assignedColumn : false;

  const dragHandlers = useMemo(
    () =>
      assignedColumn && !isReDragged
        ? eventBinder(assignedColumn, field.name)
        : {},
    [eventBinder, assignedColumn, isReDragged, field.name]
  );

  const valueContents = useMemo(() => {
    if (sourceColumn) {
      return (
        <ColumnDragCard
          hasHeaders={hasHeaders}
          rowCount={3}
          column={sourceColumn}
          isDropIndicator
        />
      );
    }

    if (assignedColumn) {
      return (
        <ColumnDragCard
          hasHeaders={hasHeaders}
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
        hasHeaders={hasHeaders}
        rowCount={3}
        hasError={hasError}
      />
    );
  }, [field, hasHeaders, touched, assignedColumn, sourceColumn, isReDragged]);

  // @todo mouse cursor changes to reflect draggable state
  return (
    <section
      className="ColumnDragTargetArea__box"
      aria-label={
        field.isOptional ? 'Optional target field' : 'Required target field'
      }
      {...mouseHoverHandlers}
    >
      <div className="ColumnDragTargetArea__boxLabel">
        {field.label}
        {field.isOptional ? null : <b aria-hidden>*</b>}
      </div>

      <div className="ColumnDragTargetArea__boxValue">
        {!sourceColumn && !assignedColumn && (
          <div className="ColumnDragTargetArea__boxPlaceholderHelp" aria-hidden>
            Drag column here
          </div>
        )}

        <div {...dragHandlers}>{valueContents}</div>

        {/* tab order after column contents */}
        {!sourceColumn && assignedColumn && (
          <div className="ColumnDragTargetArea__boxValueAction">
            <IconButton
              label="Unassign column"
              small
              type="close"
              onClick={() => onUnassign(assignedColumn)}
            />
          </div>
        )}
      </div>
    </section>
  );
};

export const ColumnDragTargetArea: React.FC<{
  fields: Field[];
  columns: Column[];
  hasHeaders: boolean;
  fieldTouched: FieldTouchedMap;
  fieldAssignments: FieldAssignmentMap;
  dragState: DragState | null;
  eventBinder: (
    // @todo import type from drag state tracker
    column: Column,
    startFieldName?: string
  ) => ReturnType<typeof useDrag>;
  onHover: (fieldName: string, isOn: boolean) => void;
  onUnassign: (column: Column) => void;
}> = ({
  fields,
  columns,
  hasHeaders,
  fieldTouched,
  fieldAssignments,
  dragState,
  eventBinder,
  onHover,
  onUnassign
}) => {
  return (
    <section className="ColumnDragTargetArea" aria-label="Target fields">
      {fields.map((field) => {
        const assignedColumnIndex = fieldAssignments[field.name];

        return (
          <TargetBox
            key={field.name}
            hasHeaders={hasHeaders}
            field={field}
            touched={fieldTouched[field.name]}
            assignedColumn={
              assignedColumnIndex !== undefined
                ? columns[assignedColumnIndex]
                : null
            }
            dragState={dragState}
            eventBinder={eventBinder}
            onHover={onHover}
            onUnassign={onUnassign}
          />
        );
      })}
    </section>
  );
};
