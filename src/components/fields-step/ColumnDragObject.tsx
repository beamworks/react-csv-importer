import React, { useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

import { ColumnDragCard } from './ColumnDragCard';
import { DragState } from './ColumnDragState';

import './ColumnDragObject.scss';

export const ColumnDragObject: React.FC<{
  dragState: DragState | null;
}> = ({ dragState }) => {
  const referenceBoxRef = useRef<HTMLDivElement | null>(null);

  // the dragged box is wrapped in a no-events overlay to clip against screen edges
  const dragBoxRef = useRef<HTMLDivElement | null>(null);
  const dragObjectPortal =
    dragState && dragState.pointerStartInfo
      ? createPortal(
          <div className="CSVImporter_ColumnDragObject__overlay">
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

  // set up initial position when pointer-based gesture is started
  const pointerStartInfo = dragState && dragState.pointerStartInfo;
  useLayoutEffect(() => {
    // ignore non-pointer drag states
    if (!pointerStartInfo || !dragBoxRef.current) {
      return;
    }

    // place based on initial position + size relative to viewport overlay
    const rect = pointerStartInfo.initialClientRect;
    dragBoxRef.current.style.left = `${rect.left}px`;
    dragBoxRef.current.style.top = `${rect.top}px`;
    dragBoxRef.current.style.width = `${rect.width}px`;
    dragBoxRef.current.style.height = `${rect.height}px`;

    // copy known cascaded font style from main content into portal content
    // @todo consider other text style properties?
    if (referenceBoxRef.current) {
      const computedStyle = window.getComputedStyle(referenceBoxRef.current);
      dragBoxRef.current.style.fontFamily = computedStyle.fontFamily;
      dragBoxRef.current.style.fontSize = computedStyle.fontSize;
      dragBoxRef.current.style.fontWeight = computedStyle.fontWeight;
      dragBoxRef.current.style.fontStyle = computedStyle.fontStyle;
      dragBoxRef.current.style.letterSpacing = computedStyle.letterSpacing;
    }
  }, [pointerStartInfo]);

  // subscribe to live position updates without state changes
  useLayoutEffect(() => {
    if (dragState) {
      const updateListener = (movement: number[]) => {
        if (!dragBoxRef.current) return;

        // update the visible offset relative to starting position
        const [x, y] = movement;
        dragBoxRef.current.style.transform = `translate(${x}px, ${y}px)`;
      };

      dragState.updateListeners.push(updateListener);

      // clean up listener
      return () => {
        const removeIndex = dragState.updateListeners.indexOf(updateListener);
        if (removeIndex !== -1) {
          dragState.updateListeners.splice(removeIndex, 1);
        }
      };
    }
  }, [dragState]);

  return <div ref={referenceBoxRef}>{dragObjectPortal}</div>;
};
