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
    width: 200
  },
  sourceChipPaper: {
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`
  },
  sourceChipPaperDragged: {
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
    background: theme.palette.grey.A100,
    color: theme.palette.grey.A100 // hide text
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
  dragChipOffset: {
    position: 'absolute',
    width: 200,
    left: -100,
    bottom: -4
  },
  dragChipPaper: {
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
    opacity: 0.75
  }
}));

interface DragState {
  initialXY: number[];
  columnIndex: number;
  dropFieldIndex: number | null;
}

function useDragObject(
  dragState: DragState | null
): [React.ReactElement | null, (xy: number[]) => void] {
  const styles = useStyles();

  // @todo wrap in a no-events overlay to clip against screen edges
  const dragChipRef = useRef<HTMLDivElement | null>(null);
  const dragObjectPortal = dragState
    ? createPortal(
        <div className={styles.dragChip} ref={dragChipRef}>
          <div className={styles.dragChipOffset}>
            <Paper className={styles.dragChipPaper}>
              Col {dragState.columnIndex}
            </Paper>
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
  columnIndex: number;
  dragState: DragState | null;
  eventBinder: (columnIndex: number) => ReturnType<typeof useDrag>;
}> = ({ columnIndex, dragState, eventBinder }) => {
  const styles = useStyles();

  const isDragged = dragState ? columnIndex === dragState.columnIndex : false;

  return (
    <div className={styles.sourceChip} {...eventBinder(columnIndex)}>
      {isDragged ? (
        <Paper className={styles.sourceChipPaperDragged} elevation={0}>
          Col {columnIndex}
        </Paper>
      ) : (
        <Paper className={styles.sourceChipPaper}>Col {columnIndex}</Paper>
      )}
    </div>
  );
};

const TargetArea: React.FC<{
  fieldIndex: number;
  field: Field;
  dragState: DragState | null;
  onHover: (fieldIndex: number, isOn: boolean) => void;
}> = ({ fieldIndex, field, dragState, onHover }) => {
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

  const sourceColumnIndex =
    dragState && dragState.dropFieldIndex === fieldIndex
      ? dragState.columnIndex
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
          data-dropped={sourceColumnIndex !== null}
        >
          {sourceColumnIndex !== null ? (
            <span>Col {sourceColumnIndex}</span>
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

  const firstRow = preview.firstRows[0];

  const [dragState, setDragState] = useState<DragState | null>(null);

  const [dragObjectPortal, dragUpdateHandler] = useDragObject(dragState);

  const bindDrag = useDrag(({ first, last, event, xy, args }) => {
    if (first && event) {
      event.preventDefault();

      const columnIndex = args[0] as number;
      setDragState({ initialXY: xy, columnIndex, dropFieldIndex: null });
    } else if (last) {
      setDragState(null);
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
          {firstRow.map((column, columnIndex) => (
            <SourceChip
              key={columnIndex}
              columnIndex={columnIndex}
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
              dragState={dragState}
              onHover={dragHoverHandler}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
