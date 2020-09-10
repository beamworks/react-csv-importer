import { useState, useCallback, useEffect } from 'react';
import { useDrag } from 'react-use-gesture';

import { FieldAssignmentMap } from './parser';
import { Column } from './ColumnDragCard';

export interface Field {
  name: string;
  label: string;
  isOptional: boolean;
}

export interface DragState {
  initialXY: number[];
  initialWidth: number;
  column: Column;
  dropFieldName: string | null;
  updateListener: ((xy: number[]) => void) | null;
}

export interface DragInfo {
  fieldAssignments: FieldAssignmentMap;
  dragState: DragState | null;
  dragEventBinder: ReturnType<typeof useDrag>;
  dragHoverHandler: (fieldName: string, isOn: boolean) => void;
  unassignHandler: (column: Column) => void;
}

export function useColumnDragState(
  fields: Field[],
  onTouched: (fieldName: string) => void
): DragInfo {
  const [dragState, setDragState] = useState<DragState | null>(null);

  const [fieldAssignments, setFieldAssignments] = useState<FieldAssignmentMap>(
    {}
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

  const bindDrag = useDrag(({ first, last, event, xy, args }) => {
    if (first && event) {
      event.preventDefault();

      const [column, startFieldName] = args as [Column, string | undefined];

      setDragState({
        initialXY: xy,
        initialWidth:
          event.currentTarget instanceof HTMLElement
            ? event.currentTarget.offsetWidth
            : 0,
        column,
        dropFieldName: startFieldName !== undefined ? startFieldName : null,
        updateListener: null
      });
    } else if (last) {
      setDragState(null);

      if (dragState) {
        const dropFieldName = dragState.dropFieldName;
        const droppedColumn = dragState.column;

        setFieldAssignments((prevAssignments) => {
          const copy = { ...prevAssignments };

          // ensure dropped column does not show up elsewhere
          Object.keys(prevAssignments).forEach((name) => {
            if (copy[name] === droppedColumn.index) {
              delete copy[name];
            }
          });

          // set new field column
          if (dropFieldName !== null) {
            copy[dropFieldName] = droppedColumn.index;
          }

          return copy;
        });

        // mark for validation display
        if (dropFieldName) {
          onTouched(dropFieldName);
        }
      }
    }

    // @todo figure out a cleaner event stream solution
    if (dragState && dragState.updateListener) {
      dragState.updateListener(xy);
    }
  }, {});

  const dragHoverHandler = useCallback((fieldName: string, isOn: boolean) => {
    setDragState((prev): DragState | null => {
      if (!prev) {
        return prev;
      }

      if (isOn) {
        // set the new drop target
        return {
          ...prev,
          dropFieldName: fieldName
        };
      } else if (prev.dropFieldName === fieldName) {
        // clear drop target if we are still the current one
        return {
          ...prev,
          dropFieldName: null
        };
      }

      // no changes by default
      return prev;
    });
  }, []);

  const unassignHandler = useCallback((column: Column) => {
    setFieldAssignments((prev) => {
      const assignedFieldName = Object.keys(prev).find(
        (fieldName) => prev[fieldName] === column.index
      );

      if (assignedFieldName === undefined) {
        return prev;
      }

      const copy = { ...prev };
      delete copy[assignedFieldName];
      return copy;
    });
  }, []);

  return {
    fieldAssignments,
    dragState,
    dragEventBinder: bindDrag,
    dragHoverHandler,
    unassignHandler
  };
}
