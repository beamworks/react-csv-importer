import React, {
  useCallback,
  useMemo,
  useRef,
  useEffect,
  useState
} from 'react';
import Papa from 'papaparse';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import IconButton from '@material-ui/core/IconButton';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Paper from '@material-ui/core/Paper';
import TableContainer from '@material-ui/core/TableContainer';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';

const useStyles = makeStyles((theme) => ({
  rawPreview: {
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
  },
  tableCell: {
    fontSize: '0.75em',
    whiteSpace: 'nowrap'
  },
  mainHeader: {
    display: 'flex',
    alignItems: 'center',
    margin: -theme.spacing(2)
  },
  mainError: {
    borderRadius: theme.shape.borderRadius,
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
    background: theme.palette.error.main,
    fontSize: theme.typography.fontSize,
    color: theme.palette.error.contrastText
  },
  mainResultBlock: {
    marginTop: theme.spacing(2)
  },
  mainPendingBlock: {
    display: 'flex',
    justifyContent: 'center',
    alignContent: 'center',
    marginTop: theme.spacing(2),
    padding: theme.spacing(4),
    color: theme.palette.text.secondary
  },
  mainFileName: {
    fontWeight: 'bold',
    color: theme.palette.text.primary
  }
}));

const MAX_ROWS = 5;
const RAW_PREVIEW_SIZE = 500;

type PreviewResults =
  | {
      parseError: undefined;
      parseWarning?: Papa.ParseError;
      firstChunk: string;
      firstRows: unknown[][];
    }
  | {
      parseError: Papa.ParseError;
    };

function parsePreview(file: File): Promise<PreviewResults> {
  return new Promise((resolve) => {
    let firstChunk: string | null = null;
    let firstWarning: Papa.ParseError | undefined = undefined;
    const rowAccumulator: unknown[][] = [];

    function reportSuccess() {
      resolve({
        parseError: undefined,
        parseWarning: firstWarning || undefined,
        firstChunk: firstChunk || '',
        firstRows: rowAccumulator
      });
    }

    // @todo true streaming support for local files (use worker?)
    Papa.parse(file, {
      chunkSize: 20000,
      preview: MAX_ROWS,
      skipEmptyLines: true,
      error: (error) => {
        resolve({
          parseError: error
        });
      },
      beforeFirstChunk: (chunk) => {
        firstChunk = chunk;
      },
      chunk: ({ data, errors }, parser) => {
        data.forEach((row) => {
          rowAccumulator.push(row as unknown[]);
        });

        if (errors.length > 0 && !firstWarning) {
          firstWarning = errors[0];
        }

        // finish parsing after first chunk
        if (rowAccumulator.length < MAX_ROWS) {
          parser.abort();
        }

        reportSuccess();
      },
      complete: reportSuccess
    });
  });
}

const RawPreview: React.FC<{ chunk: string }> = React.memo(({ chunk }) => {
  const styles = useStyles();
  const chunkSlice = chunk.slice(0, RAW_PREVIEW_SIZE);
  const chunkHasMore = chunk.length > RAW_PREVIEW_SIZE;

  return (
    <div className={styles.rawPreview}>
      <pre className={styles.rawPreviewPre}>
        {chunkSlice}
        {chunkHasMore && <aside>...</aside>}
      </pre>
    </div>
  );
});

const DataRowPreview: React.FC<{ rows: unknown[][] }> = React.memo(
  ({ rows }) => {
    const styles = useStyles();

    return (
      <TableContainer component={Paper}>
        <Table size="small">
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {row.map((item, itemIndex) => (
                  <TableCell key={itemIndex} className={styles.tableCell}>
                    {typeof item !== 'string' ? null : item}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
);

export const FormatPreview: React.FC<{ file: File; onCancel: () => void }> = ({
  file,
  onCancel
}) => {
  const styles = useStyles();

  const onCancelRef = useRef(onCancel);
  onCancelRef.current = onCancel;

  const cancelClickHandler = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onCancelRef.current();
    },
    []
  );

  const [preview, setPreview] = useState<PreviewResults | null>(null);

  // perform async preview parse
  const asyncLockRef = useRef<number>(0);
  useEffect(() => {
    const oplock = asyncLockRef.current;

    parsePreview(file).then((results) => {
      // ignore if stale
      if (oplock !== asyncLockRef.current) {
        return;
      }

      setPreview(results);
    });

    return () => {
      // invalidate current oplock on change or unmount
      asyncLockRef.current += 1;
    };
  }, [file]);

  const report = useMemo(() => {
    if (!preview) {
      return null;
    }

    if (preview.parseError) {
      return (
        <div>
          Parse error: <b>{preview.parseError.message}</b>
        </div>
      );
    }

    return (
      <>
        <div className={styles.mainResultBlock}>
          <Typography variant="overline" color="textSecondary">
            Raw Data
          </Typography>
          <RawPreview chunk={preview.firstChunk} />
        </div>
        {preview.parseWarning ? (
          <div className={styles.mainResultBlock}>
            <div className={styles.mainError}>
              {preview.parseWarning.message}: please check data formatting
            </div>
          </div>
        ) : (
          <div className={styles.mainResultBlock}>
            <Typography variant="overline" color="textSecondary">
              Preview Import
            </Typography>
            <DataRowPreview rows={preview.firstRows} />
          </div>
        )}
      </>
    );
  }, [styles, preview]);

  return (
    <Card variant="outlined">
      <CardContent>
        <div className={styles.mainHeader}>
          <IconButton onClick={cancelClickHandler}>
            <ChevronLeftIcon />
          </IconButton>
          <Typography variant="subtitle1" color="textPrimary" noWrap>
            {file.name}
          </Typography>
        </div>

        {report || (
          <div className={styles.mainPendingBlock}>Loading preview...</div>
        )}
      </CardContent>
    </Card>
  );
};
