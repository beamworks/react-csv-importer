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

  // field assignments state
  const [fieldAssignments, setFieldAssignments] = useState<FieldAssignmentMap>(
    prevState ? prevState.fieldAssignments : {}
  );

  // make sure there are no extra fields
  useEffect(() => {
    const removedFieldNames = Object.keys(fieldAssignments).filter(
      (existingFieldName) =>
        !fields.some((field) => field.name === existingFieldName)
    );

    if (removedFieldNames.length > 0) {
      // @todo put everything inside this setter
      setFieldAssignments((prev) => {
        const copy = { ...prev };

        removedFieldNames.forEach((fieldName) => {
          delete copy[fieldName];
        });

        return copy;
      });
    }
  }, [fields, fieldAssignments]);

  // for any field, try to find an automatic match from known column names
  useEffect(() => {
    // prep insensitive/fuzzy match stems for known columns
    const columnStemMap: Record<string, number | undefined> = {};
    for (const column of columns) {
      const stem = column.header?.trim().toLowerCase() || undefined;

      if (stem) {
        columnStemMap[stem] = column.index;
      }
    }

    setFieldAssignments((prev) => {
      // prepare a lookup of already assigned columns
      const assignedColumns = columns.map(() => false);

      for (const fieldName of Object.keys(prev)) {
        const assignedColumnIndex = prev[fieldName];
        if (assignedColumnIndex !== undefined) {
          assignedColumns[assignedColumnIndex] = true;
        }
      }

      // augment with new auto-assignments
      const copy = { ...prev };
      for (const field of fields) {
        // ignore if field is already assigned
        if (copy[field.name] !== undefined) {
          continue;
        }

        // find by field stem
        const fieldLabelStem = field.label.trim().toLowerCase(); // @todo consider normalizing other whitespace/non-letters
        const matchingColumnIndex = columnStemMap[fieldLabelStem];

        // ignore if equivalent column not found
        if (matchingColumnIndex === undefined) {
          continue;
        }

        // ignore if column is already assigned
        if (assignedColumns[matchingColumnIndex]) {
          continue;
        }

        // auto-assign the column
        copy[field.name] = matchingColumnIndex;
      }

      return copy;
    });
  }, [fields, columns]);

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
    dragState,
    dragEventBinder,
    dragHoverHandler,
    columnSelectHandler,
    assignHandler,
    unassignHandler
  } = useColumnDragState(
    setFieldAssignments, // prevState ? prevState.fieldAssignments : initialAssignments,
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
        // mark all fields as touched (to show all the errors now)
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
