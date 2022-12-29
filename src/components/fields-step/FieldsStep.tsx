import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useDrag } from '@use-gesture/react';

import { FieldAssignmentMap } from '../../parser';
import { FileStepState } from '../file-step/FileStep';
import { ImporterFrame } from '../ImporterFrame';
import {
  generatePreviewColumns,
  generateColumnCode,
  Column
} from './ColumnPreview';
import { useColumnDragState } from './ColumnDragState';
import { ColumnDragObject } from './ColumnDragObject';
import { ColumnDragSourceArea } from './ColumnDragSourceArea';
import { ColumnDragTargetArea, FieldTouchedMap } from './ColumnDragTargetArea';
import { Field } from '../ImporterField';
import { useLocale } from '../../locale/LocaleContext';

export interface FieldsStepState {
  fieldAssignments: FieldAssignmentMap;
}

export const FieldsStep: React.FC<{
  fields: Field[]; // current field definitions
  displayFieldRowSize?: number; // override defaults for unusual widths
  displayColumnPageSize?: number;

  fileState: FileStepState; // output from the file selector step
  prevState: FieldsStepState | null; // confirmed field selections so far

  onChange: (state: FieldsStepState) => void;
  onAccept: () => void;
  onCancel: () => void;
}> = ({
  fields,
  displayColumnPageSize,
  displayFieldRowSize,
  fileState,
  prevState,
  onChange,
  onAccept,
  onCancel
}) => {
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

  // abstract mouse drag/keyboard state tracker
  const {
    dragState,

    dragStartHandler,
    dragMoveHandler,
    dragEndHandler,
    dragHoverHandler,

    columnSelectHandler,
    assignHandler,
    unassignHandler
  } = useColumnDragState((column: Column, fieldName: string | null) => {
    // update field assignment map state
    setFieldAssignments((prev) => {
      const currentFieldName = Object.keys(prev).find(
        (fieldName) => prev[fieldName] === column.index
      );

      // see if there is nothing to do
      if (currentFieldName === undefined && fieldName === null) {
        return prev;
      }

      const copy = { ...prev };

      // ensure dropped column does not show up elsewhere
      if (currentFieldName) {
        delete copy[currentFieldName];
      }

      // set new field column
      if (fieldName !== null) {
        copy[fieldName] = column.index;
      }

      return copy;
    });

    // mark for validation display
    if (fieldName) {
      setFieldTouched((prev) => {
        if (prev[fieldName]) {
          return prev;
        }

        return { ...prev, [fieldName]: true };
      });
    }
  });

  // drag gesture wire-up
  const bindDrag = useDrag(
    ({ first, last, movement, xy, args, currentTarget }) => {
      if (first) {
        const [column, startFieldName] = args as [Column, string | undefined];
        const initialClientRect =
          currentTarget instanceof HTMLElement
            ? currentTarget.getBoundingClientRect()
            : new DOMRect(xy[0], xy[1], 0, 0); // fall back on just pointer position

        dragStartHandler(column, startFieldName, initialClientRect);
      } else if (last) {
        dragEndHandler();
      } else {
        dragMoveHandler(movement);
      }
    },
    {
      pointer: { capture: false } // turn off pointer capture to avoid interfering with hover tests
    }
  );

  // when dragging, set root-level user-select:none to prevent text selection, see Importer.scss
  // (done via class toggle to avoid interfering with any other dynamic style changes)
  useEffect(() => {
    if (dragState) {
      document.body.classList.add('CSVImporter_dragging');
    } else {
      // remove text selection prevention after a delay (otherwise on iOS it still selects something)
      const timeoutId = setTimeout(() => {
        document.body.classList.remove('CSVImporter_dragging');
      }, 200);

      return () => {
        // if another drag state comes along then cancel our delay and just clean up class right away
        clearTimeout(timeoutId);
        document.body.classList.remove('CSVImporter_dragging');
      };
    }
  }, [dragState]);

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
        columnPageSize={displayColumnPageSize}
        fieldAssignments={fieldAssignments}
        dragState={dragState}
        eventBinder={bindDrag}
        onSelect={columnSelectHandler}
        onUnassign={unassignHandler}
      />

      <ColumnDragTargetArea
        hasHeaders={fileState.hasHeaders}
        fieldRowSize={displayFieldRowSize}
        fields={fields}
        columns={columns}
        fieldTouched={fieldTouched}
        fieldAssignments={fieldAssignments}
        dragState={dragState}
        eventBinder={bindDrag}
        onHover={dragHoverHandler}
        onAssign={assignHandler}
        onUnassign={unassignHandler}
      />

      <ColumnDragObject dragState={dragState} />
    </ImporterFrame>
  );
};
