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

const fields = [
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
  fieldChip: {
    display: 'inline-block',
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1),
    width: 200
  },
  fieldChipPaper: {
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`
  },
  fieldChipPaperDragged: {
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
    background: theme.palette.grey.A100,
    color: theme.palette.grey.A100 // hide text
  },
  columnChip: {
    display: 'inline-block',
    marginRight: theme.spacing(1),
    marginTop: theme.spacing(1),
    width: 200
  },
  columnChipPaper: {
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`
  },
  columnLabel: {
    display: 'inline-block',
    marginTop: theme.spacing(1),
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.text.primary
  },
  columnTargetPaper: {
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
  fieldIndex: number;
  dropColumnIndex: number | null;
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
              {fields[dragState.fieldIndex].label}
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

const FieldChip: React.FC<{
  fieldIndex: number;
  dragState: DragState | null;
  eventBinder: (fieldIndex: number) => ReturnType<typeof useDrag>;
}> = ({ fieldIndex, dragState, eventBinder }) => {
  const styles = useStyles();

  const field = fields[fieldIndex];
  const isDragged = dragState ? fieldIndex === dragState.fieldIndex : false;

  return (
    <div className={styles.fieldChip} {...eventBinder(fieldIndex)}>
      {isDragged ? (
        <Paper className={styles.fieldChipPaperDragged} elevation={0}>
          {field.label}
        </Paper>
      ) : (
        <Paper className={styles.fieldChipPaper}>{field.label}</Paper>
      )}
    </div>
  );
};

const ColumnArea: React.FC<{
  columnIndex: number;
  dragState: DragState | null;
  onHover: (columnIndex: number, isOn: boolean) => void;
}> = ({ columnIndex, dragState, onHover }) => {
  const styles = useStyles();

  const mouseEnterHandler = dragState
    ? () => {
        onHover(columnIndex, true);
      }
    : undefined;

  const mouseLeaveHandler = dragState
    ? () => {
        onHover(columnIndex, false);
      }
    : undefined;

  const dropField =
    dragState && dragState.dropColumnIndex === columnIndex
      ? fields[dragState.fieldIndex]
      : null;

  return (
    <div
      className={styles.columnChip}
      onMouseEnter={mouseEnterHandler}
      onMouseLeave={mouseLeaveHandler}
    >
      <Paper className={styles.columnChipPaper} variant="outlined">
        <Paper
          className={styles.columnTargetPaper}
          variant="outlined"
          data-dropped={!!dropField}
        >
          {dropField ? dropField.label : '--'}
        </Paper>

        <div className={styles.columnLabel}>Col {columnIndex}</div>
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

      const fieldIndex = args[0] as number;
      setDragState({ initialXY: xy, fieldIndex, dropColumnIndex: null });
    } else if (last) {
      setDragState(null);
    }

    dragUpdateHandler(xy);
  }, {});

  const dragHoverHandler = useCallback((columnIndex: number, isOn: boolean) => {
    setDragState((prev) => {
      if (!prev) {
        return prev;
      }

      if (isOn) {
        // set the new drop target
        return {
          ...prev,
          dropColumnIndex: columnIndex
        };
      } else if (prev.dropColumnIndex === columnIndex) {
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
          {fields.map((field, fieldIndex) => (
            <FieldChip
              key={fieldIndex}
              fieldIndex={fieldIndex}
              dragState={dragState}
              eventBinder={bindDrag}
            />
          ))}
        </div>

        <Divider />

        <div>
          {firstRow.map((column, columnIndex) => (
            <ColumnArea
              key={columnIndex}
              columnIndex={columnIndex}
              dragState={dragState}
              onHover={dragHoverHandler}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
