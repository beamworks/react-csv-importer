import React, { useState, useMemo } from 'react';

import { PreviewInfo, FieldAssignmentMap } from './parser';
import { ImporterFrame } from './ImporterFrame';
import { useColumnDragState, Field as DragField } from './ColumnDragState';
import { ColumnDragObject } from './ColumnDragObject';
import { Column } from './ColumnDragCard';
import { ColumnDragSourceArea } from './ColumnDragSourceArea';
import { ColumnDragTargetArea, FieldTouchedMap } from './ColumnDragTargetArea';

// re-export from a central spot
export type Field = DragField;

// spreadsheet-style column code computation (A, B, ..., Z, AA, AB, ..., etc)
function generateColumnCode(value: number) {
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
}

export const ColumnPicker: React.FC<{
  fields: Field[];
  preview: PreviewInfo;
  onAccept: (fieldAssignments: FieldAssignmentMap) => void;
  onCancel: () => void;
}> = ({ fields, preview, onAccept, onCancel }) => {
  const columns = useMemo<Column[]>(() => {
    return [...new Array(preview.firstRows[0].length)].map((empty, index) => {
      return {
        index,
        code: generateColumnCode(index),
        values: preview.firstRows.map((row) => row[index] || '')
      };
    });
  }, [preview]);

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
  } = useColumnDragState(fields, (fieldName) => {
    setFieldTouched((prev) => {
      if (prev[fieldName]) {
        return prev;
      }

      const copy = { ...prev };
      copy[fieldName] = true;
      return copy;
    });
  });

  return (
    <ImporterFrame
      fileName={preview.file.name}
      subtitle="Select Columns"
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
          onAccept({ ...fieldAssignments });
        } else {
          setValidationError('Please assign all required fields');
        }
      }}
    >
      <ColumnDragSourceArea
        hasHeaders={preview.hasHeaders}
        columns={columns}
        fieldAssignments={fieldAssignments}
        dragState={dragState}
        eventBinder={dragEventBinder}
        onSelect={columnSelectHandler}
        onUnassign={unassignHandler}
      />

      <ColumnDragTargetArea
        fields={fields}
        columns={columns}
        hasHeaders={preview.hasHeaders}
        fieldTouched={fieldTouched}
        fieldAssignments={fieldAssignments}
        dragState={dragState}
        eventBinder={dragEventBinder}
        onHover={dragHoverHandler}
        onAssign={assignHandler}
        onUnassign={unassignHandler}
      />

      <ColumnDragObject hasHeaders={preview.hasHeaders} dragState={dragState} />
    </ImporterFrame>
  );
};
