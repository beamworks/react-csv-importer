import { useState, useCallback, useEffect, useRef } from 'react';
import { useDrag } from 'react-use-gesture';

import { FieldAssignmentMap } from './parser';
import { Column } from './ColumnDragCard';

export interface Field {
  name: string;
  label: string;
  isOptional: boolean;
}

export interface DragState {
  // null if this is a non-pointer-initiated state
  pointerStartInfo: {
    initialXY: number[];
    initialWidth: number;
  } | null;

  column: Column;
  dropFieldName: string | null;
  updateListener: ((xy: number[]) => void) | null;
}

export interface DragInfo {
  fieldAssignments: FieldAssignmentMap;
  dragState: DragState | null;
  dragEventBinder: ReturnType<typeof useDrag>;
  dragHoverHandler: (fieldName: string, isOn: boolean) => void;
  columnSelectHandler: (column: Column) => void;
  assignHandler: (fieldName: string) => void;
  unassignHandler: (column: Column) => void;
}

export function useColumnDragState(
  fields: Field[],
  onTouched: (fieldName: string) => void
): DragInfo {
  // wrap in ref to avoid re-triggering
  const onTouchedRef = useRef(onTouched);
  onTouchedRef.current = onTouched;

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

  const internalAssignHandler = useCallback(
    (column: Column, fieldName: string | null) => {
      setFieldAssignments((prevAssignments) => {
        const copy = { ...prevAssignments };

        // ensure dropped column does not show up elsewhere
        Object.keys(prevAssignments).forEach((name) => {
          if (copy[name] === column.index) {
            delete copy[name];
          }
        });

        // set new field column
        if (fieldName !== null) {
          copy[fieldName] = column.index;
        }

        return copy;
      });

      // mark for validation display
      if (fieldName) {
        onTouchedRef.current(fieldName);
      }
    },
    []
  );

  const bindDrag = useDrag(({ first, last, event, xy, args }) => {
    if (first && event) {
      event.preventDefault();

      const [column, startFieldName] = args as [Column, string | undefined];

      setDragState({
        pointerStartInfo: {
          initialXY: xy,
          initialWidth:
            event.currentTarget instanceof HTMLElement
              ? event.currentTarget.offsetWidth
              : 0
        },
        column,
        dropFieldName: startFieldName !== undefined ? startFieldName : null,
        updateListener: null
      });
    } else if (last) {
      setDragState(null);

      if (dragState) {
        internalAssignHandler(dragState.column, dragState.dropFieldName);
      }
    }

    // @todo figure out a cleaner event stream solution
    if (dragState && dragState.updateListener) {
      dragState.updateListener(xy);
    }
  }, {});

  const columnSelectHandler = useCallback((column: Column) => {
    setDragState((prev) => {
      // toggle off if needed
      if (prev && prev.column === column) {
        return null;
      }

      return {
        pointerStartInfo: null, // no draggable position information
        column,
        dropFieldName: null,
        updateListener: null
      };
    });
  }, []);

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

  const assignHandler = useCallback(
    (fieldName: string) => {
      // clear active drag state
      setDragState(null);

      if (dragState) {
        internalAssignHandler(dragState.column, fieldName);
      }
    },
    [internalAssignHandler, dragState]
  );

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
    columnSelectHandler,
    assignHandler,
    unassignHandler
  };
}
