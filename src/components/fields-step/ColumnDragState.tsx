import { useState, useCallback, useRef } from 'react';

import { FieldAssignmentMap } from '../../parser';
import { Column } from './ColumnPreview';

export interface DragState {
  // null if this is a non-pointer-initiated state
  pointerStartInfo: {
    // position + size of originating card relative to viewport overlay
    initialClientRect: DOMRectReadOnly;
  } | null;

  column: Column;
  dropFieldName: string | null;
  updateListeners: { [key: string]: (xy: number[]) => void };
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
  onChange: (
    mutation: (prev: FieldAssignmentMap) => FieldAssignmentMap
  ) => void,
  onTouched: (fieldName: string) => void
): DragInfo {
  // wrap in ref to avoid re-triggering effects
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onTouchedRef = useRef(onTouched);
  onTouchedRef.current = onTouched;

  const [dragState, setDragState] = useState<DragState | null>(null);

  // @todo move out
  const internalAssignHandler = useCallback(
    (column: Column, fieldName: string | null) => {
      onChangeRef.current((prevAssignments) => {
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
        updateListeners: {}
      });
    },
    []
  );

  const dragMoveHandler = useCallback(
    (movement: [number, number]) => {
      // @todo figure out a cleaner event stream solution
      if (dragState) {
        const listeners = dragState.updateListeners;
        for (const key of Object.keys(listeners)) {
          listeners[key](movement);
        }
      }
    },
    [dragState]
  );

  const dragEndHandler = useCallback(() => {
    setDragState(null);

    if (dragState) {
      internalAssignHandler(dragState.column, dragState.dropFieldName);
    }
  }, [internalAssignHandler, dragState]);

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
        updateListeners: {}
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

  // @todo move out, also clear drag state?
  const unassignHandler = useCallback((column: Column) => {
    onChangeRef.current((prev) => {
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
