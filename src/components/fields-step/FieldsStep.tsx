import React, { useState, useMemo, useEffect, useRef } from 'react';

import { FieldAssignmentMap } from '../../parser';
import { FileStepState } from '../file-step/FileStep';
import { ImporterFrame } from '../ImporterFrame';
import {
  generatePreviewColumns,
  generateColumnCode,
  Column
} from './ColumnPreview';
import { useColumnDragState, Field as DragField } from './ColumnDragState';
import { ColumnDragObject } from './ColumnDragObject';
import { ColumnDragSourceArea } from './ColumnDragSourceArea';
import { ColumnDragTargetArea, FieldTouchedMap } from './ColumnDragTargetArea';
import { useLocale } from '../../locale/LocaleContext';

// re-export from a central spot
export type Field = DragField;

export interface FieldsStepState {
  fieldAssignments: FieldAssignmentMap;
}

export const FieldsStep: React.FC<{
  fileState: FileStepState;
  fields: Field[];
  prevState: FieldsStepState | null;
  onChange: (state: FieldsStepState) => void;
  onAccept: () => void;
  onCancel: () => void;
}> = ({ fileState, fields, prevState, onChange, onAccept, onCancel }) => {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const columns = useMemo<Column[]>(
    () =>
      generatePreviewColumns(
        fileState.firstRows,
        fileState.hasHeaders
      ).map((item) => ({ ...item, code: generateColumnCode(item.index) })),
    [fileState]
  );

  const initialAssignments = useMemo<FieldAssignmentMap>(() => {
    // prep insensitive/fuzzy match stems for known columns
    // (this is ignored if there is already previous state to seed from)
    const columnStems = columns.map((column) => {
      const trimmed = column.header && column.header.trim();

      if (!trimmed) {
        return undefined;
      }

      return trimmed.toLowerCase();
    });

    // pre-assign corresponding fields
    const result: FieldAssignmentMap = {};
    const assignedColumnIndexes: boolean[] = [];

    fields.forEach((field) => {
      // find by field stem
      const fieldLabelStem = field.label.trim().toLowerCase(); // @todo consider normalizing other whitespace/non-letters

      const matchingColumnIndex = columnStems.findIndex(
        (columnStem, columnIndex) => {
          // no headers or no meaningful stem value
          if (columnStem === undefined) {
            return false;
          }

          // always check against assigning twice
          if (assignedColumnIndexes[columnIndex]) {
            return false;
          }

          return columnStem === fieldLabelStem;
        }
      );

      // assign if found
      if (matchingColumnIndex !== -1) {
        assignedColumnIndexes[matchingColumnIndex] = true;
        result[field.name] = matchingColumnIndex;
      }
    });

    return result;
  }, [fields, columns]);

  // track which fields need to show validation warning
  const [fieldTouched, setFieldTouched] = useState<FieldTouchedMap>({});
  const [validationError, setValidationError] = useState<string | null>(null);

  const {
    fieldAssignments,
    dragState,
    dragEventBinder,
    dragHoverHandler,
    columnSelectHandler,
    assignHandler,
    unassignHandler
  } = useColumnDragState(
    fields,
    prevState ? prevState.fieldAssignments : initialAssignments,
    (fieldName) => {
      setFieldTouched((prev) => {
        if (prev[fieldName]) {
          return prev;
        }

        const copy = { ...prev };
        copy[fieldName] = true;
        return copy;
      });
    }
  );

  // notify of current state
  useEffect(() => {
    onChangeRef.current({ fieldAssignments: { ...fieldAssignments } });
  }, [fieldAssignments]);

  const l10n = useLocale('fieldsStep');

  return (
    <ImporterFrame
      fileName={fileState.file.name}
      subtitle={l10n.stepSubtitle}
      error={validationError}
      onCancel={onCancel}
      onNext={() => {
        // mark all fields as touched
        const fullTouchedMap: typeof fieldTouched = {};
        fields.some((field) => {
          fullTouchedMap[field.name] = true;
        });
        setFieldTouched(fullTouchedMap);

        // submit if validation succeeds
        const hasUnassignedRequired = fields.some(
          (field) =>
            !field.isOptional && fieldAssignments[field.name] === undefined
        );

        if (!hasUnassignedRequired) {
          onAccept();
        } else {
          setValidationError(l10n.requiredFieldsError);
        }
      }}
      nextLabel={l10n.nextButton}
    >
      <ColumnDragSourceArea
        columns={columns}
        fieldAssignments={fieldAssignments}
        dragState={dragState}
        eventBinder={dragEventBinder}
        onSelect={columnSelectHandler}
        onUnassign={unassignHandler}
      />

      <ColumnDragTargetArea
        hasHeaders={fileState.hasHeaders}
        fields={fields}
        columns={columns}
        fieldTouched={fieldTouched}
        fieldAssignments={fieldAssignments}
        dragState={dragState}
        eventBinder={dragEventBinder}
        onHover={dragHoverHandler}
        onAssign={assignHandler}
        onUnassign={unassignHandler}
      />

      <ColumnDragObject dragState={dragState} />
    </ImporterFrame>
  );
};
