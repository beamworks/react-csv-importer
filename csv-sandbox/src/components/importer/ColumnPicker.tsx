import React, {
  useRef,
  useState,
  useMemo,
  useCallback,
  useLayoutEffect,
  useEffect
} from 'react';
import { createPortal } from 'react-dom';
import { useDrag } from 'react-use-gesture';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

import { PreviewInfo } from './FormatPreview';

interface Field {
  label: string;
}

const fields: Field[] = [
  { label: 'Name' },
  { label: 'Email' },
  { label: 'DOB' },
  { label: 'Postal Code' },
  { label: 'Snack Preference' },
  { label: 'Country' },
  { label: 'Bees?' }
];

const useStyles = makeStyles((theme) => ({
  mainHeader: {
    display: 'flex',
    alignItems: 'center'
    // margin: -theme.spacing(2)
  },
  sourceChip: {
    display: 'inline-block',
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1),
    width: 150
  },
  columnCardPaper: {
    position: 'relative', // for action
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
    zIndex: 0, // reset stacking context
    cursor: 'default',

    '&[data-draggable=true]': {
      cursor: 'grab'
    },

    '&[data-shadow=true]': {
      background: theme.palette.grey.A100,
      color: theme.palette.grey.A200 // reduce text
    }
  },
  columnCardAction: {
    position: 'absolute',
    top: theme.spacing(0.5),
    right: theme.spacing(0.5),
    zIndex: 1 // right above card content
  },
  columnCardValue: {
    marginTop: theme.spacing(0.5),
    fontSize: '0.75em',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',

    '& + div': {
      marginTop: 0
    }
  },
  targetChip: {
    display: 'inline-block',
    marginRight: theme.spacing(1),
    marginTop: theme.spacing(1),
    width: 200
  },
  targetChipPaper: {
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`
  },
  targetLabel: {
    display: 'inline-block',
    marginTop: theme.spacing(1),
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.text.primary
  },
  targetChipIndicatorPaper: {
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
    background: theme.palette.grey.A100,

    '&[data-dropped=true]': {
      background: theme.palette.primary.light,
      color: theme.palette.primary.contrastText
    },

    '& span[data-shadow=true]': {
      background: theme.palette.grey.A100,
      color: theme.palette.grey.A200 // reduce text
    }
  },
  dragChip: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 0, // dynamically set at drag start
    height: 0,
    minWidth: 100, // in case could not compute
    pointerEvents: 'none'
  },
  dragChipHolder: {
    position: 'absolute',
    width: '100%',
    left: '-50%',
    bottom: -4,
    opacity: 0.9
  }
}));

interface Column {
  index: number;
  values: string[];
}

interface DragState {
  initialXY: number[];
  initialWidth: number;
  column: Column;
  dropFieldIndex: number | null;
}

// @todo sort out "grabbing" cursor state (does not work with pointer-events:none)
const ColumnCard: React.FC<{
  column: Column;
  action: React.ReactElement | null;
  isShadow?: boolean;
  isDraggable?: boolean;
}> = ({ column, action, isShadow, isDraggable }) => {
  const styles = useStyles();

  return (
    <Paper
      key={isShadow ? 1 : 0} // force re-creation to avoid transition anim
      className={styles.columnCardPaper}
      data-shadow={!!isShadow}
      data-draggable={!!isDraggable}
      elevation={isShadow ? 0 : undefined}
    >
      Col {column.index}
      {action && <div className={styles.columnCardAction}>{action}</div>}
      <Divider />
      {column.values.map((value, valueIndex) => (
        <div key={valueIndex} className={styles.columnCardValue}>
          {value || '\u00a0'}
        </div>
      ))}
    </Paper>
  );
};

function useDragObject(
  dragState: DragState | null
): [React.ReactElement | null, (xy: number[]) => void] {
  const styles = useStyles();

  // @todo wrap in a no-events overlay to clip against screen edges
  const dragChipRef = useRef<HTMLDivElement | null>(null);
  const dragObjectPortal = dragState
    ? createPortal(
        <div className={styles.dragChip} ref={dragChipRef}>
          <div className={styles.dragChipHolder}>
            <ColumnCard column={dragState.column} action={null} />
          </div>
        </div>,
        document.body
      )
    : null;

  // set up initial position
  const initialXY = dragState && dragState.initialXY;
  const initialWidth = dragState && dragState.initialWidth;
  useLayoutEffect(() => {
    if (!initialXY || initialWidth === null || !dragChipRef.current) {
      return;
    }

    dragChipRef.current.style.left = `${initialXY[0]}px`;
    dragChipRef.current.style.top = `${initialXY[1]}px`;
    dragChipRef.current.style.width = `${initialWidth}px`;
  }, [initialXY, initialWidth]);

  // live position updates without state changes
  const dragUpdateHandler = useCallback((xy: number[]) => {
    if (!dragChipRef.current) {
      return;
    }

    dragChipRef.current.style.left = `${xy[0]}px`;
    dragChipRef.current.style.top = `${xy[1]}px`;
  }, []);

  return [dragObjectPortal, dragUpdateHandler];
}

const SourceChip: React.FC<{
  column: Column;
  fieldAssignments: (Column | null)[];
  dragState: DragState | null;
  eventBinder: (column: Column) => ReturnType<typeof useDrag>;
  onUnassign: (column: Column) => void;
}> = ({ column, fieldAssignments, dragState, eventBinder, onUnassign }) => {
  const styles = useStyles();

  const isShadow = dragState ? column === dragState.column : false;

  const isAssigned = useMemo(() => fieldAssignments.indexOf(column) !== -1, [
    fieldAssignments,
    column
  ]);

  const eventHandlers = useMemo(() => eventBinder(column), [
    eventBinder,
    column
  ]);

  return (
    <div className={styles.sourceChip} {...(isAssigned ? {} : eventHandlers)}>
      <ColumnCard
        column={column}
        isShadow={isShadow || isAssigned}
        isDraggable={!dragState && !isShadow && !isAssigned}
        action={
          isAssigned ? (
            <Button
              size="small"
              variant="contained"
              color="secondary"
              onClick={() => onUnassign(column)}
            >
              Unassign
            </Button>
          ) : null
        }
      />
    </div>
  );
};

const TargetArea: React.FC<{
  fieldIndex: number;
  field: Field;
  assignedColumn: Column | null;
  dragState: DragState | null;
  eventBinder: (
    column: Column,
    startFieldIndex?: number
  ) => ReturnType<typeof useDrag>;
  onHover: (fieldIndex: number, isOn: boolean) => void;
}> = ({
  fieldIndex,
  field,
  assignedColumn,
  dragState,
  eventBinder,
  onHover
}) => {
  const styles = useStyles();

  const mouseEnterHandler = dragState
    ? () => {
        onHover(fieldIndex, true);
      }
    : undefined;

  const mouseLeaveHandler = dragState
    ? () => {
        onHover(fieldIndex, false);
      }
    : undefined;

  const sourceColumn =
    dragState && dragState.dropFieldIndex === fieldIndex
      ? dragState.column
      : null;

  // see if currently assigned column is being dragged again
  const isReDragged = dragState ? dragState.column === assignedColumn : false;

  const eventHandlers = useMemo(
    () =>
      assignedColumn && !isReDragged
        ? eventBinder(assignedColumn, fieldIndex)
        : {},
    [eventBinder, assignedColumn, isReDragged, fieldIndex]
  );

  // @todo mouse cursor changes to reflect draggable state
  return (
    <div
      className={styles.targetChip}
      onMouseEnter={mouseEnterHandler}
      onMouseLeave={mouseLeaveHandler}
    >
      <Paper className={styles.targetChipPaper} variant="outlined">
        <Paper
          className={styles.targetChipIndicatorPaper}
          variant="outlined"
          data-dropped={sourceColumn !== null}
          {...eventHandlers}
        >
          {sourceColumn ? (
            <span>Col {sourceColumn.index}</span>
          ) : assignedColumn ? (
            <span data-shadow={!!isReDragged}>Col {assignedColumn.index}</span>
          ) : (
            <span>--</span>
          )}
        </Paper>

        <div className={styles.targetLabel}>{field.label}</div>
      </Paper>
    </div>
  );
};

export const ColumnPicker: React.FC<{ preview: PreviewInfo }> = ({
  preview
}) => {
  const styles = useStyles();

  const columns = useMemo<Column[]>(() => {
    return [...new Array(preview.firstRows[0].length)].map((empty, index) => {
      return {
        index,
        values: preview.firstRows.map((row) => row[index] || '')
      };
    });
  }, [preview]);

  const [fieldAssignments, setFieldAssignments] = useState<(Column | null)[]>(
    () => fields.map(() => null)
  );

  const [dragState, setDragState] = useState<DragState | null>(null);
  const [dragObjectPortal, dragUpdateHandler] = useDragObject(dragState);

  const bindDrag = useDrag(({ first, last, event, xy, args }) => {
    if (first && event) {
      event.preventDefault();

      const [column, startFieldIndex] = args as [Column, number | undefined];

      setDragState({
        initialXY: xy,
        initialWidth:
          event.currentTarget instanceof HTMLElement
            ? event.currentTarget.offsetWidth
            : 0,
        column,
        dropFieldIndex: startFieldIndex !== undefined ? startFieldIndex : null
      });
    } else if (last) {
      setDragState(null);

      if (dragState) {
        const dropFieldIndex = dragState.dropFieldIndex;
        const droppedColumn = dragState.column;

        setFieldAssignments((prevAssignments) =>
          prevAssignments.map((prevCol, fieldIndex) => {
            // set new field column
            if (dropFieldIndex === fieldIndex) {
              return droppedColumn;
            }

            // otherwise, ensure dropped column does not show up elsewhere
            return prevCol === droppedColumn ? null : prevCol;
          })
        );
      }
    }

    dragUpdateHandler(xy);
  }, {});

  const dragHoverHandler = useCallback((fieldIndex: number, isOn: boolean) => {
    setDragState((prev): DragState | null => {
      if (!prev) {
        return prev;
      }

      if (isOn) {
        // set the new drop target
        return {
          ...prev,
          dropFieldIndex: fieldIndex
        };
      } else if (prev.dropFieldIndex === fieldIndex) {
        // clear drop target if we are still the current one
        return {
          ...prev,
          dropFieldIndex: null
        };
      }

      // no changes by default
      return prev;
    });
  }, []);

  const unassignHandler = useCallback((column: Column) => {
    setFieldAssignments((prev) =>
      prev.map((assignedColumn) =>
        assignedColumn === column ? null : assignedColumn
      )
    );
  }, []);

  return (
    <Card variant="outlined">
      <CardContent>
        <div className={styles.mainHeader}>
          {dragObjectPortal}

          <Typography variant="subtitle1" color="textPrimary" noWrap>
            Choose Columns
          </Typography>
        </div>

        <div>
          {columns.map((column, columnIndex) => (
            <SourceChip
              key={columnIndex}
              column={column}
              fieldAssignments={fieldAssignments}
              dragState={dragState}
              eventBinder={bindDrag}
              onUnassign={unassignHandler}
            />
          ))}
        </div>

        <Divider />

        <div>
          {fields.map((field, fieldIndex) => (
            <TargetArea
              key={fieldIndex}
              fieldIndex={fieldIndex}
              field={field}
              assignedColumn={fieldAssignments[fieldIndex]}
              dragState={dragState}
              eventBinder={bindDrag}
              onHover={dragHoverHandler}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
