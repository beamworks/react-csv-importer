import React, {
  useRef,
  useState,
  useCallback,
  useLayoutEffect,
  useEffect
} from 'react';
import { createPortal } from 'react-dom';
import { useDrag } from 'react-use-gesture';
import { makeStyles } from '@material-ui/core/styles';

import { FieldAssignmentMap } from './parser';
import { ColumnDragCard, Column } from './ColumnDragCard';

export interface Field {
  name: string;
  label: string;
  isOptional: boolean;
}

const useStyles = makeStyles(() => ({
  dragBox: {
    position: 'absolute', // @todo this is not working with scroll
    top: 0,
    left: 0,
    width: 0, // dynamically set at drag start
    height: 0,
    minWidth: 100, // in case could not compute
    pointerEvents: 'none'
  },
  dragBoxHolder: {
    position: 'absolute',
    width: '100%',
    left: '-50%',
    bottom: -4,
    opacity: 0.9
  }
}));

export interface DragState {
  initialXY: number[];
  initialWidth: number;
  column: Column;
  dropFieldName: string | null;
}

function useDragObject(
  hasHeaders: boolean,
  dragState: DragState | null
): [React.ReactElement | null, (xy: number[]) => void] {
  const styles = useStyles();

  // @todo wrap in a no-events overlay to clip against screen edges
  const dragBoxRef = useRef<HTMLDivElement | null>(null);
  const dragObjectPortal = dragState
    ? createPortal(
        <div className={styles.dragBox} ref={dragBoxRef}>
          <div className={styles.dragBoxHolder}>
            <ColumnDragCard
              hasHeaders={hasHeaders}
              column={dragState.column}
              isDragged
            />
          </div>
        </div>,
        document.body
      )
    : null;

  // set up initial position
  const initialXY = dragState && dragState.initialXY;
  const initialWidth = dragState && dragState.initialWidth;
  useLayoutEffect(() => {
    if (!initialXY || initialWidth === null || !dragBoxRef.current) {
      return;
    }

    dragBoxRef.current.style.left = `${initialXY[0]}px`;
    dragBoxRef.current.style.top = `${initialXY[1]}px`;
    dragBoxRef.current.style.width = `${initialWidth}px`;
  }, [initialXY, initialWidth]);

  // live position updates without state changes
  const dragUpdateHandler = useCallback((xy: number[]) => {
    if (!dragBoxRef.current) {
      return;
    }

    dragBoxRef.current.style.left = `${xy[0]}px`;
    dragBoxRef.current.style.top = `${xy[1]}px`;
  }, []);

  return [dragObjectPortal, dragUpdateHandler];
}

export interface DragInfo {
  fieldAssignments: FieldAssignmentMap;
  dragObjectPortal: React.ReactElement | null;
  dragState: DragState | null;
  dragEventBinder: ReturnType<typeof useDrag>;
  dragHoverHandler: (fieldName: string, isOn: boolean) => void;
  unassignHandler: (column: Column) => void;
}

export function useColumnDragState(
  fields: Field[],
  hasHeaders: boolean,
  onTouched: (fieldName: string) => void
): DragInfo {
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [dragObjectPortal, dragUpdateHandler] = useDragObject(
    hasHeaders,
    dragState
  );

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
        dropFieldName: startFieldName !== undefined ? startFieldName : null
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

    dragUpdateHandler(xy);
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
    dragObjectPortal,
    dragEventBinder: bindDrag,
    dragHoverHandler,
    unassignHandler
  };
}
