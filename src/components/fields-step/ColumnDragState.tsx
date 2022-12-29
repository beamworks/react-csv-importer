import { useState, useCallback, useRef } from 'react';

import { Column } from './ColumnPreview';

export interface DragState {
  // null if this is a non-pointer-initiated state
  pointerStartInfo: {
    // position + size of originating card relative to viewport overlay
    initialClientRect: DOMRectReadOnly;
  } | null;

  column: Column;
  dropFieldName: string | null;
  updateListeners: ((xy: number[]) => void)[];
}

export interface DragInfo {
  dragState: DragState | null;
  columnSelectHandler: (column: Column) => void;
  dragStartHandler: (
    column: Column,
    startFieldName: string | undefined,
    initialClientRect: DOMRectReadOnly
  ) => void;
  dragMoveHandler: (movement: [number, number]) => void;
  dragEndHandler: () => void;

  dragHoverHandler: (fieldName: string, isOn: boolean) => void;
  assignHandler: (fieldName: string) => void;
  unassignHandler: (column: Column) => void;
}

// state machine to represent the steps taken to assign a column to target field:
// - pick column (drag start or keyboard select)
// - hover over field (while dragging only)
// - assign picked column to field (drag end)
// @todo move the useDrag setup outside as well?
export function useColumnDragState(
  onColumnAssignment: (column: Column, fieldName: string | null) => void
): DragInfo {
  // wrap in ref to avoid re-triggering effects
  const onColumnAssignmentRef = useRef(onColumnAssignment);
  onColumnAssignmentRef.current = onColumnAssignment;

  const [dragState, setDragState] = useState<DragState | null>(null);

  const dragStartHandler = useCallback(
    (
      column: Column,
      startFieldName: string | undefined,
      initialClientRect: DOMRectReadOnly
    ) => {
      // create new pointer-based drag state
      setDragState({
        pointerStartInfo: {
          initialClientRect
        },
        column,
        dropFieldName: startFieldName !== undefined ? startFieldName : null,
        updateListeners: []
      });
    },
    []
  );

  const dragMoveHandler = useCallback(
    (movement: [number, number]) => {
      // @todo figure out a cleaner event stream solution
      if (dragState) {
        const listeners = dragState.updateListeners;
        for (const listener of listeners) {
          listener(movement);
        }
      }
    },
    [dragState]
  );

  const dragEndHandler = useCallback(() => {
    setDragState(null);

    if (dragState) {
      onColumnAssignmentRef.current(dragState.column, dragState.dropFieldName);
    }
  }, [dragState]);

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
        updateListeners: []
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
        onColumnAssignmentRef.current(dragState.column, fieldName);
      }
    },
    [dragState]
  );

  const unassignHandler = useCallback((column: Column) => {
    // clear active drag state
    setDragState(null);

    onColumnAssignmentRef.current(column, null);
  }, []);

  return {
    dragState,
    dragStartHandler,
    dragMoveHandler,
    dragEndHandler,
    dragHoverHandler,
    columnSelectHandler,
    assignHandler,
    unassignHandler
  };
}
