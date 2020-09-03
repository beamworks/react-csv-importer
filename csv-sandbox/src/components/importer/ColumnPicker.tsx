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
    background: theme.palette.grey.A100
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
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`
  }
}));

export const ColumnPicker: React.FC<{ preview: PreviewInfo }> = ({
  preview
}) => {
  const styles = useStyles();

  const firstRow = preview.firstRows[0];

  const [dragState, setDragState] = useState<{
    xy: number[];
    fieldIndex: number;
  } | null>(null);

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

  const bindDrag = useDrag(({ first, last, event, xy, args }) => {
    if (first && event) {
      event.preventDefault();

      const fieldIndex = args[0] as number;
      setDragState({ xy, fieldIndex });
    } else if (last) {
      setDragState(null);
    }

    if (!dragChipRef.current) {
      return;
    }

    dragChipRef.current.style.left = `${xy[0]}px`;
    dragChipRef.current.style.top = `${xy[1]}px`;
  }, {});

  // set up initial position
  useLayoutEffect(() => {
    if (!dragState || !dragChipRef.current) {
      return;
    }

    const { xy } = dragState;

    dragChipRef.current.style.left = `${xy[0]}px`;
    dragChipRef.current.style.top = `${xy[1]}px`;
  }, [dragState]);

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
          {fields.map((field, fieldIndex) => {
            const isDragged = dragState
              ? fieldIndex === dragState.fieldIndex
              : false;

            return (
              <div
                className={styles.fieldChip}
                key={fieldIndex}
                {...bindDrag(fieldIndex)}
              >
                {isDragged ? (
                  <Paper className={styles.fieldChipPaperDragged} elevation={0}>
                    {field.label}
                  </Paper>
                ) : (
                  <Paper className={styles.fieldChipPaper}>{field.label}</Paper>
                )}
              </div>
            );
          })}
        </div>

        <Divider />

        <div>
          {firstRow.map((column, columnIndex) => {
            return (
              <div className={styles.columnChip} key={columnIndex}>
                <Paper className={styles.columnChipPaper} variant="outlined">
                  <Paper
                    className={styles.columnTargetPaper}
                    variant="outlined"
                  >
                    --
                  </Paper>

                  <div className={styles.columnLabel}>Col {columnIndex}</div>
                </Paper>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
