import React, { useState, useMemo } from 'react';

import { FieldAssignmentMap, Preview } from './parser';
import { ImporterFrame } from './ImporterFrame';
import {
  generatePreviewColumns,
  generateColumnCode,
  Column
} from './ColumnPreview';
import { useColumnDragState, Field as DragField } from './ColumnDragState';
import { ColumnDragObject } from './ColumnDragObject';
import { ColumnDragSourceArea } from './ColumnDragSourceArea';
import { ColumnDragTargetArea, FieldTouchedMap } from './ColumnDragTargetArea';

// re-export from a central spot
export type Field = DragField;

export const ColumnPicker: React.FC<{
  fields: Field[];
  preview: Preview;
  onAccept: (fieldAssignments: FieldAssignmentMap) => void;
  onCancel: () => void;
}> = ({ fields, preview, onAccept, onCancel }) => {
  const columns = useMemo<Column[]>(
    () =>
      generatePreviewColumns(
        preview.firstRows,
        preview.hasHeaders
      ).map((item) => ({ ...item, code: generateColumnCode(item.index) })),
    [preview]
  );

  const initialAssignments = useMemo<FieldAssignmentMap>(() => {
    // prep insensitive/fuzzy match stems for known columns
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
  } = useColumnDragState(fields, initialAssignments, (fieldName) => {
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
