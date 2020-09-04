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
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,

    '&[data-dragged=true]': {
      background: theme.palette.grey.A100,
      color: theme.palette.grey.A200 // reduce text
    }
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
    }
  },
  dragChip: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 0,
    pointerEvents: 'none'
  },
  dragChipHolder: {
    position: 'absolute',
    width: 150,
    left: -75,
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
  column: Column;
  dropFieldIndex: number | null;
}

const ColumnCard: React.FC<{ column: Column; isShadow: boolean }> = ({
  column,
  isShadow
}) => {
  const styles = useStyles();

  return (
    <Paper
      key={isShadow ? 1 : 0} // force re-creation to avoid transition anim
      className={styles.columnCardPaper}
      data-dragged={!!isShadow}
      elevation={isShadow ? 0 : undefined}
    >
      Col {column.index}
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
            <ColumnCard isShadow={false} column={dragState.column} />
          </div>
        </div>,
        document.body
      )
    : null;

  // set up initial position
  const initialXY = dragState && dragState.initialXY;
  useLayoutEffect(() => {
    if (!initialXY || !dragChipRef.current) {
      return;
    }

    dragChipRef.current.style.left = `${initialXY[0]}px`;
    dragChipRef.current.style.top = `${initialXY[1]}px`;
  }, [initialXY]);

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
}> = ({ column, fieldAssignments, dragState, eventBinder }) => {
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
    <div className={styles.sourceChip} {...eventHandlers}>
      <ColumnCard column={column} isShadow={isShadow || isAssigned} />
    </div>
  );
};

const TargetArea: React.FC<{
  fieldIndex: number;
  field: Field;
  assignedColumn: Column | null;
  dragState: DragState | null;
  onHover: (fieldIndex: number, isOn: boolean) => void;
}> = ({ fieldIndex, field, assignedColumn, dragState, onHover }) => {
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
        >
          {sourceColumn ? (
            <span>Col {sourceColumn.index}</span>
          ) : assignedColumn ? (
            <span>Col {assignedColumn.index}</span>
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

      const column = args[0] as Column;
      setDragState({ initialXY: xy, column, dropFieldIndex: null });
    } else if (last) {
      setDragState(null);

      if (dragState && dragState.dropFieldIndex !== null) {
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
    setDragState((prev) => {
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
          dropColumnIndex: null
        };
      }

      // no changes by default
      return prev;
    });
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
              onHover={dragHoverHandler}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
