import React, { useState, useMemo } from 'react';
import Divider from '@material-ui/core/Divider';

import { PreviewInfo, FieldAssignmentMap } from './parser';
import { ImporterFrame } from './ImporterFrame';
import { useColumnDragState, Field as DragField } from './ColumnDragState';
import { useDragObject } from './ColumnDragObject';
import { Column } from './ColumnDragCard';
import { ColumnDragSourceArea } from './ColumnDragSourceArea';
import { ColumnDragTargetArea, FieldTouchedMap } from './ColumnDragTargetArea';

// re-export from a central spot
export type Field = DragField;

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

  const dragObjectPortal = useDragObject(preview.hasHeaders, dragState);

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
        onUnassign={unassignHandler}
      />

      <Divider />

      {dragObjectPortal}

      <ColumnDragTargetArea
        fields={fields}
        columns={columns}
        hasHeaders={preview.hasHeaders}
        fieldTouched={fieldTouched}
        fieldAssignments={fieldAssignments}
        dragState={dragState}
        eventBinder={dragEventBinder}
        onHover={dragHoverHandler}
        onUnassign={unassignHandler}
      />
    </ImporterFrame>
  );
};
