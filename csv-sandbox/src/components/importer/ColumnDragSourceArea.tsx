import React, { useState, useMemo } from 'react';
import { useDrag } from 'react-use-gesture';
import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import ReplayIcon from '@material-ui/icons/Replay';

import { FieldAssignmentMap } from './parser';
import { DragState } from './ColumnDragState';
import { ColumnDragCard, Column } from './ColumnDragCard';

const SOURCES_PAGE_SIZE = 5; // fraction of 10 for easier counting

const useStyles = makeStyles((theme) => ({
  sourceArea: {
    display: 'flex',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2)
  },
  sourceAreaControl: {
    flex: 'none',
    display: 'flex',
    alignItems: 'center'
  },
  sourceAreaPage: {
    flex: '1 1 0',
    display: 'flex',
    paddingLeft: theme.spacing(1) // match interior box spacing
  },
  sourceAreaPageFiller: {
    flex: '1 1 0',
    marginRight: theme.spacing(1)
  },
  sourceBox: {
    position: 'relative', // for action
    flex: '1 1 0',
    marginRight: theme.spacing(1),
    width: 0 // prevent internal sizing from affecting placement
  },
  sourceBoxAction: {
    position: 'absolute',
    top: theme.spacing(0.5), // matches up with column card header sizing
    right: theme.spacing(0.5),
    zIndex: 1 // right above content
  }
}));

const SourceBox: React.FC<{
  hasHeaders: boolean;
  column: Column;
  fieldAssignments: FieldAssignmentMap;
  dragState: DragState | null;
  eventBinder: (column: Column) => ReturnType<typeof useDrag>;
  onUnassign: (column: Column) => void;
}> = ({
  hasHeaders,
  column,
  fieldAssignments,
  dragState,
  eventBinder,
  onUnassign
}) => {
  const styles = useStyles();

  const isShadow = dragState ? column === dragState.column : false;

  const isAssigned = useMemo(
    () =>
      Object.keys(fieldAssignments).some(
        (fieldName) => fieldAssignments[fieldName] === column.index
      ),
    [fieldAssignments, column]
  );

  const eventHandlers = useMemo(() => eventBinder(column), [
    eventBinder,
    column
  ]);

  return (
    <div className={styles.sourceBox}>
      {isAssigned ? (
        <div className={styles.sourceBoxAction}>
          <IconButton size="small" onClick={() => onUnassign(column)}>
            <ReplayIcon fontSize="inherit" />
          </IconButton>
        </div>
      ) : undefined}

      <div {...(isAssigned ? {} : eventHandlers)}>
        <ColumnDragCard
          hasHeaders={hasHeaders}
          column={column}
          isShadow={isShadow || isAssigned}
          isDraggable={!dragState && !isShadow && !isAssigned}
        />
      </div>
    </div>
  );
};

// @todo current page indicator (dots)
export const ColumnDragSourceArea: React.FC<{
  hasHeaders: boolean;
  columns: Column[];
  fieldAssignments: FieldAssignmentMap;
  dragState: DragState | null;
  eventBinder: (column: Column) => ReturnType<typeof useDrag>;
  onUnassign: (column: Column) => void;
}> = ({
  hasHeaders,
  columns,
  fieldAssignments,
  dragState,
  eventBinder,
  onUnassign
}) => {
  const styles = useStyles();

  const [page, setPage] = useState<number>(0);
  const pageCount = Math.ceil(columns.length / SOURCES_PAGE_SIZE);

  const start = page * SOURCES_PAGE_SIZE;
  const pageContents = columns
    .slice(start, start + SOURCES_PAGE_SIZE)
    .map((column, columnIndex) => (
      <SourceBox
        key={columnIndex}
        hasHeaders={hasHeaders}
        column={column}
        fieldAssignments={fieldAssignments}
        dragState={dragState}
        eventBinder={eventBinder}
        onUnassign={onUnassign}
      />
    ));

  while (pageContents.length < SOURCES_PAGE_SIZE) {
    pageContents.push(
      <div key={pageContents.length} className={styles.sourceAreaPageFiller} />
    );
  }

  return (
    <div className={styles.sourceArea}>
      <div className={styles.sourceAreaControl}>
        <IconButton
          disabled={page === 0}
          onClick={() => {
            setPage((prev) => Math.max(0, prev - 1));
          }}
        >
          <ArrowBackIcon />
        </IconButton>
      </div>
      <div className={styles.sourceAreaPage}>{pageContents}</div>
      <div className={styles.sourceAreaControl}>
        <IconButton
          disabled={page === pageCount - 1}
          onClick={() => {
            setPage((prev) => Math.min(pageCount - 1, prev + 1));
          }}
        >
          <ArrowForwardIcon />
        </IconButton>
      </div>
    </div>
  );
};
