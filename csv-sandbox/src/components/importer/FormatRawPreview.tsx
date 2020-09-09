import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { FormatErrorMessage } from './FormatErrorMessage';

const useStyles = makeStyles((theme) => ({
  rawPreview: {
    flex: '1 1 0', // avoid stretching to internal width
    width: 0
  },
  rawPreviewScroll: {
    marginBottom: theme.spacing(2),
    height: theme.spacing(12),
    borderRadius: theme.shape.borderRadius,
    background: theme.palette.primary.dark,
    color: theme.palette.primary.contrastText,
    overflow: 'auto'
  },
  rawPreviewPre: {
    margin: 0, // override default
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
    fontSize: theme.typography.fontSize,

    '& > aside': {
      display: 'inline-block',
      marginLeft: theme.spacing(0.5),
      padding: `0 0.25em`,
      borderRadius: theme.shape.borderRadius / 2,
      background: theme.palette.primary.contrastText,
      color: theme.palette.primary.dark,
      fontSize: '0.75em',
      opacity: 0.75
    }
  }
}));

const RAW_PREVIEW_SIZE = 500;

export const FormatRawPreview: React.FC<{
  chunk: string;
  warning?: Papa.ParseError;
  onCancelClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  // eslint-disable-next-line react/display-name
}> = React.memo(({ chunk, warning, onCancelClick }) => {
  const styles = useStyles();
  const chunkSlice = chunk.slice(0, RAW_PREVIEW_SIZE);
  const chunkHasMore = chunk.length > RAW_PREVIEW_SIZE;

  return (
    <div className={styles.rawPreview}>
      <div className={styles.rawPreviewScroll}>
        <pre className={styles.rawPreviewPre}>
          {chunkSlice}
          {chunkHasMore && <aside>...</aside>}
        </pre>
      </div>

      {warning ? (
        <FormatErrorMessage onCancelClick={onCancelClick}>
          {warning.message}: please check data formatting
        </FormatErrorMessage>
      ) : null}
    </div>
  );
});
