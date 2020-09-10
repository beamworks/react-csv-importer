import React, { useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

import { ColumnDragCard } from './ColumnDragCard';
import { DragState } from './ColumnDragState';

import './ColumnDragObject.scss';

export const ColumnDragObject: React.FC<{
  hasHeaders: boolean;
  dragState: DragState | null;
}> = ({ hasHeaders, dragState }) => {
  // @todo wrap in a no-events overlay to clip against screen edges
  const dragBoxRef = useRef<HTMLDivElement | null>(null);
  const dragObjectPortal = dragState
    ? createPortal(
        <div className="ColumnDragObject" ref={dragBoxRef}>
          <div className="ColumnDragObject__holder">
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
