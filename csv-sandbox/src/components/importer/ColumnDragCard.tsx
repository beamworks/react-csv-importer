import React, { useMemo } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';

import { PREVIEW_ROW_COUNT } from './parser';

const useStyles = makeStyles((theme) => ({
  columnCardPaper: {
    padding: `${theme.spacing(1)}px ${theme.spacing(1.5)}px`,
    zIndex: 0, // reset stacking context
    cursor: 'default',

    '&[data-draggable=true]': {
      cursor: 'grab'
    },

    '&[data-dummy=true]': {
      background: theme.palette.divider,
      opacity: 0.5,
      userSelect: 'none'
    },

    '&[data-error=true]': {
      background: theme.palette.error.main,
      color: theme.palette.error.contrastText
    },

    '&[data-shadow=true]': {
      background: theme.palette.grey.A100,
      color: theme.palette.grey.A200 // reduce text
    },

    '&[data-drop-indicator=true]': {
      color: theme.palette.text.primary
    }
  },
  columnCardHeader: {
    marginTop: theme.spacing(-0.5),
    marginLeft: theme.spacing(-1),
    marginRight: theme.spacing(-1),
    marginBottom: theme.spacing(0.5),
    height: theme.spacing(3),
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.text.secondary,

    '& > b': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      background: theme.palette.divider
    },

    '$columnCardPaper[data-draggable=true]:hover &, $columnCardPaper[data-dragged=true] &': {
      color: theme.palette.text.primary
    }
  },
  columnCardValue: {
    marginTop: theme.spacing(0.5),
    fontSize: '0.75em',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',

    '&[data-header="true"]': {
      textAlign: 'center',
      fontStyle: 'italic',
      color: theme.palette.text.secondary
    },

    '& + div': {
      marginTop: 0
    }
  }
}));

export interface Column {
  index: number;
  values: string[];
}

// @todo sort out "grabbing" cursor state (does not work with pointer-events:none)
export const ColumnDragCard: React.FC<{
  hasHeaders: boolean;
  column?: Column;
  rowCount?: number;
  hasError?: boolean;
  isShadow?: boolean;
  isDraggable?: boolean;
  isDragged?: boolean;
  isDropIndicator?: boolean;
}> = ({
  hasHeaders,
  column: optionalColumn,
  rowCount = PREVIEW_ROW_COUNT,
  hasError,
  isShadow,
  isDraggable,
  isDragged,
  isDropIndicator
}) => {
  const styles = useStyles();
  const isDummy = !optionalColumn;

  const column = useMemo<Column>(
    () =>
      optionalColumn || {
        index: -1,
        values: [...new Array(PREVIEW_ROW_COUNT)].map(() => '')
      },
    [optionalColumn]
  );

  // spreadsheet-style column code computation (A, B, ..., Z, AA, AB, ..., etc)
  const columnCode = useMemo(() => {
    const value = column.index;

    // ignore dummy index
    if (value < 0) {
      return '';
    }

    // first, determine how many base-26 letters there should be
    // (because the notation is not purely positional)
    let digitCount = 1;
    let base = 0;
    let next = 26;

    while (next <= value) {
      digitCount += 1;
      base = next;
      next = next * 26 + 26;
    }

    // then, apply normal positional digit computation on remainder above base
    let remainder = value - base;

    const digits = [];
    while (digits.length < digitCount) {
      const lastDigit = remainder % 26;
      remainder = Math.floor((remainder - lastDigit) / 26); // applying floor just in case

      // store ASCII code, with A as 0
      digits.unshift(65 + lastDigit);
    }

    return String.fromCharCode.apply(null, digits);
  }, [column]);

  return (
    // not changing variant dynamically because it causes a height jump
    <Paper
      key={isDummy || isShadow ? 1 : isDropIndicator ? 2 : 0} // force re-creation to avoid transition anim
      className={styles.columnCardPaper}
      data-dummy={!!isDummy}
      data-error={!!hasError}
      data-shadow={!!isShadow}
      data-draggable={!!isDraggable}
      data-dragged={!!isDragged}
      data-drop-indicator={!!isDropIndicator}
      elevation={isDummy || isShadow ? 0 : isDropIndicator ? 3 : undefined}
      square={isDummy}
    >
      <div className={styles.columnCardHeader}>
        {isDummy ? '\u00a0' : <b>{columnCode}</b>}
      </div>

      {column.values.slice(0, rowCount).map((value, valueIndex) => (
        <div
          key={valueIndex}
          className={styles.columnCardValue}
          data-header={hasHeaders && valueIndex === 0}
        >
          {value || '\u00a0'}
        </div>
      ))}
    </Paper>
  );
};
