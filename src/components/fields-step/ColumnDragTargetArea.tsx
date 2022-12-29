import React, { useMemo, useRef } from 'react';
import { useDrag } from '@use-gesture/react';

import { FieldAssignmentMap } from '../../parser';
import { Column } from './ColumnPreview';
import { DragState } from './ColumnDragState';
import { ColumnDragCard } from './ColumnDragCard';
import { IconButton } from '../IconButton';
import { Field } from '../ImporterField';

export type FieldTouchedMap = { [name: string]: boolean | undefined };

import './ColumnDragTargetArea.scss';
import { useLocale } from '../../locale/LocaleContext';

const TargetBox: React.FC<{
  field: Field;
  hasHeaders: boolean; // for correct display of dummy card
  flexBasis?: string; // style override
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
  field,
  hasHeaders,
  flexBasis,
  touched,
  assignedColumn,
  dragState,
  eventBinder,
  onHover,
  onAssign,
  onUnassign
}) => {
  // respond to hover events when there is active mouse drag happening
  // (not keyboard-emulated one)
  const containerRef = useRef<HTMLDivElement>(null);

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
      style={{ flexBasis }}
      onPointerEnter={() => onHover(field.name, true)}
      onPointerLeave={() => onHover(field.name, false)}
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

        <div {...dragStartHandlers} style={{ touchAction: 'none' }}>
          {valueContents}
        </div>

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
  fieldRowSize?: number;
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
  fieldRowSize,
  fieldTouched,
  fieldAssignments,
  dragState,
  eventBinder,
  onHover,
  onAssign,
  onUnassign
}) => {
  const l10n = useLocale('fieldsStep');

  // override flex basis for unusual situations
  const flexBasis = fieldRowSize ? `${100 / fieldRowSize}%` : undefined;

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
            flexBasis={flexBasis}
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
