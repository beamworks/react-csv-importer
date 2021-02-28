import React, { useMemo } from 'react';
import { useDrag } from 'react-use-gesture';

import { FieldAssignmentMap } from './parser';
import { Column } from './ColumnPreview';
import { DragState, Field } from './ColumnDragState';
import { ColumnDragCard } from './ColumnDragCard';
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
  const mouseHoverHandlers =
    dragState && dragState.pointerStartInfo
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
      className="CSVImporter_ColumnDragTargetArea__box"
      aria-label={`${field.label} (${
        field.isOptional ? 'optional' : 'required'
      })`}
      {...mouseHoverHandlers}
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
            Drag column here
          </div>
        )}

        <div {...dragHandlers}>{valueContents}</div>

        {/* tab order after column contents */}
        {dragState && !dragState.pointerStartInfo ? (
          <div className="CSVImporter_ColumnDragTargetArea__boxValueAction">
            <IconButton
              label={`Assign column ${dragState.column.code}`}
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
                label="Clear column assignment"
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
  onAssign: (fieldName: string) => void;
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
  onAssign,
  onUnassign
}) => {
  return (
    <section
      className="CSVImporter_ColumnDragTargetArea"
      aria-label="Target fields"
    >
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
            onAssign={onAssign}
            onUnassign={onUnassign}
          />
        );
      })}
    </section>
  );
};
