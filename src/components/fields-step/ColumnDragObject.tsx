import React, { useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

import { ColumnDragCard } from './ColumnDragCard';
import { DragState } from './ColumnDragState';

import './ColumnDragObject.scss';

export const ColumnDragObject: React.FC<{
  dragState: DragState | null;
}> = ({ dragState }) => {
  const referenceBoxRef = useRef<HTMLDivElement | null>(null);

  // @todo wrap in a no-events overlay to clip against screen edges
  const dragBoxRef = useRef<HTMLDivElement | null>(null);
  const dragObjectPortal =
    dragState && dragState.pointerStartClone
      ? createPortal(
          <div className="CSVImporter_ColumnDragObject">
            <div
              className="CSVImporter_ColumnDragObject__positioner"
              ref={dragBoxRef}
            >
              <div className="CSVImporter_ColumnDragObject__holder">
                <ColumnDragCard column={dragState.column} isDragged />
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  // set up initial position
  const pointerStartClone = dragState && dragState.pointerStartClone;
  useLayoutEffect(() => {
    if (!pointerStartClone || !dragBoxRef.current) {
      return;
    }

    const rect = pointerStartClone.getBoundingClientRect();
    dragBoxRef.current.style.left = `${rect.left + rect.width / 2.2}px`;
    dragBoxRef.current.style.top = `${rect.top}px`;
    dragBoxRef.current.style.width = `${rect.width}px`;
    dragBoxRef.current.style.height = `${rect.height}px`;

    // copy known font style from main content
    // @todo consider other text style properties?
    const computedStyle = window.getComputedStyle(pointerStartClone);
    dragBoxRef.current.style.fontFamily = computedStyle.fontFamily;
    dragBoxRef.current.style.fontSize = computedStyle.fontSize;
    dragBoxRef.current.style.fontWeight = computedStyle.fontWeight;
    dragBoxRef.current.style.fontStyle = computedStyle.fontStyle;
    dragBoxRef.current.style.letterSpacing = computedStyle.letterSpacing;
  }, [pointerStartClone]);

  // subscribe to live position updates without state changes
  useLayoutEffect(() => {
    if (dragState) {
      dragState.updateListeners['dragObj'] = (movement: number[]) => {
        if (!dragBoxRef.current) return;

        const [x, y] = movement;
        dragBoxRef.current.style.transform = `translate(${x}px, ${y}px)`;
      };
    }
  }, [dragState]);

  return <div ref={referenceBoxRef}>{dragObjectPortal}</div>;
};
