import React, { useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { makeStyles } from '@material-ui/core/styles';

import { ColumnDragCard } from './ColumnDragCard';
import { DragState } from './ColumnDragState';

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

export const ColumnDragObject: React.FC<{
  hasHeaders: boolean;
  dragState: DragState | null;
}> = ({ hasHeaders, dragState }) => {
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

  // subscribe to live position updates without state changes
  useLayoutEffect(() => {
    if (dragState) {
      dragState.updateListener = (xy: number[]) => {
        if (!dragBoxRef.current) {
          return;
        }

        dragBoxRef.current.style.left = `${xy[0]}px`;
        dragBoxRef.current.style.top = `${xy[1]}px`;
      };
    }
  }, [dragState]);

  return dragObjectPortal;
};
