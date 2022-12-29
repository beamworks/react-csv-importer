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
  fields: Field[]; // current field definitions
  fileState: FileStepState; // output from the file selector step
  prevState: FieldsStepState | null; // confirmed field selections so far
  onChange: (state: FieldsStepState) => void;
  onAccept: () => void;
  onCancel: () => void;
}> = ({ fields, fileState, prevState, onChange, onAccept, onCancel }) => {
  const l10n = useLocale('fieldsStep');

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

  // prep insensitive/fuzzy match stems for known columns
  const columnStemMap = useMemo(() => {
    const result: Record<string, number | undefined> = {};

    for (const column of columns) {
      const stem = column.header?.trim().toLowerCase() || undefined;

      if (stem) {
        result[stem] = column.index;
      }
    }

    return result;
  }, [columns]);

  // insensitive/fuzzy match for known columns
  // (this is ignored if there is already previous state to seed from)
  const initialAssignments = useMemo<FieldAssignmentMap>(() => {
    // pre-assign corresponding fields
    const result: FieldAssignmentMap = {};
    const assignedColumnIndexes: boolean[] = [];

    fields.forEach((field) => {
      // find by field stem
      const fieldLabelStem = field.label.trim().toLowerCase(); // @todo consider normalizing other whitespace/non-letters

      const matchingColumnIndex = columnStemMap[fieldLabelStem];

      // assign if found
      if (matchingColumnIndex !== undefined) {
        assignedColumnIndexes[matchingColumnIndex] = true;
        result[field.name] = matchingColumnIndex;
      }
    });

    return result;
  }, [fields, columnStemMap]);

  // track which fields need to show validation warning
  const [fieldTouched, setFieldTouched] = useState<FieldTouchedMap>({});
  const [validationError, setValidationError] = useState<string | null>(null);

  // clean up touched field map when dynamic field list changes
  useEffect(() => {
    setFieldTouched((prev) => {
      const result: FieldTouchedMap = {};
      for (const field of fields) {
        result[field.name] = prev[field.name];
      }

      return result;
    });
  }, [fields]);

  // main state tracker
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

        return { ...prev, [fieldName]: true };
      });
    }
  );

  // notify of current state
  useEffect(() => {
    onChangeRef.current({ fieldAssignments: { ...fieldAssignments } });
  }, [fieldAssignments]);

  return (
    <ImporterFrame
      fileName={fileState.file.name}
      subtitle={l10n.stepSubtitle}
      error={validationError}
      onCancel={onCancel}
      onNext={() => {
        // mark all fields as touched
        const fullTouchedMap: typeof fieldTouched = {};
        fields.forEach((field) => {
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
