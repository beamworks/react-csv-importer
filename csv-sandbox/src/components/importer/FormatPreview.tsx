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
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Paper from '@material-ui/core/Paper';
import TableContainer from '@material-ui/core/TableContainer';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionActions from '@material-ui/core/AccordionActions';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

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
  },
  errorWithButton: {
    display: 'flex',
    alignItems: 'center',
    borderRadius: theme.shape.borderRadius,
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
    background: theme.palette.error.main,
    fontSize: theme.typography.fontSize,
    color: theme.palette.error.contrastText,

    '& > span': {
      flex: '1 1 0',
      marginRight: theme.spacing(2),
      wordBreak: 'break-word'
    },

    '& > button': {
      flex: 'none'
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
  mainPanelSummary: {
    // extra selector to override specificity
    '&[aria-expanded=true]': {
      minHeight: 0 // condensed appearance
    },

    '& > div:first-child': {
      margin: 0 // condensed appearance
    }
  },
  mainFileName: {
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.text.primary
  }
}));

const MAX_ROWS = 5;
const RAW_PREVIEW_SIZE = 500;

export interface PreviewInfo {
  parseWarning?: Papa.ParseError;
  firstChunk: string;
  firstRows: string[][];
}

type PreviewResults =
  | ({
      parseError: undefined;
    } & PreviewInfo)
  | {
      parseError: Error | Papa.ParseError;
    };

function parsePreview(file: File): Promise<PreviewResults> {
  // wrap synchronous errors in promise
  return new Promise<PreviewResults>((resolve) => {
    let firstChunk: string | null = null;
    let firstWarning: Papa.ParseError | undefined = undefined;
    const rowAccumulator: string[][] = [];

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
          rowAccumulator.push(
            (row as unknown[]).map((item) =>
              typeof item === 'string' ? item : ''
            )
          );
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
  }).catch(() => {
    return {
      parseError: new Error('Internal error while generating preview')
    };
  });
}

const RawPreview: React.FC<{
  chunk: string;
  warning?: Papa.ParseError;
  onCancelClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
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
        <div className={styles.errorWithButton}>
          <span>{warning.message}: please check data formatting</span>
          <Button size="small" variant="contained" onClick={onCancelClick}>
            Go Back
          </Button>
        </div>
      ) : null}
    </div>
  );
});

const DataRowPreview: React.FC<{ rows: string[][] }> = React.memo(
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
                    {item}
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

export const FormatPreview: React.FC<{
  file: File;
  onAccept: (preview: PreviewInfo) => void;
  onCancel: () => void;
}> = ({ file, onAccept, onCancel }) => {
  const styles = useStyles();

  const onCancelRef = useRef(onCancel);
  onCancelRef.current = onCancel;

  const cancelClickHandler = useCallback(() => {
    onCancelRef.current();
  }, []);

  const [preview, setPreview] = useState<PreviewResults | null>(null);
  const [panelRawActive, setPanelRawActive] = useState<boolean>(false);
  const [panelDataActive, setPanelDataActive] = useState<boolean>(false);

  const onAcceptRef = useRef(onAccept);
  onAcceptRef.current = onAccept;

  const acceptClickHandler = useCallback(() => {
    if (!preview || preview.parseError) {
      throw new Error('unexpected missing preview info');
    }

    onAcceptRef.current(preview);
  }, [preview]);

  // perform async preview parse
  const asyncLockRef = useRef<number>(0);
  useEffect(() => {
    const oplock = asyncLockRef.current;

    parsePreview(file).then((results) => {
      // ignore if stale
      if (oplock !== asyncLockRef.current) {
        return;
      }

      // pre-open appropriate panel before rendering results
      setPanelRawActive(!results.parseError && !!results.parseWarning);
      setPanelDataActive(!results.parseError && !results.parseWarning);

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
        <div className={styles.mainResultBlock}>
          <div className={styles.errorWithButton}>
            <span>
              Import error: <b>{preview.parseError.message}</b>
            </span>
            <Button
              size="small"
              variant="contained"
              onClick={cancelClickHandler}
            >
              Go Back
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.mainResultBlock}>
        <Accordion
          expanded={panelRawActive}
          onChange={() => setPanelRawActive(!panelRawActive)}
        >
          <AccordionSummary
            className={styles.mainPanelSummary}
            expandIcon={<ExpandMoreIcon />}
          >
            <Typography variant="subtitle1" color="textSecondary">
              File Format
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <RawPreview
              chunk={preview.firstChunk}
              warning={preview.parseWarning}
              onCancelClick={cancelClickHandler}
            />
          </AccordionDetails>
        </Accordion>

        {preview.parseWarning ? null : (
          <Accordion
            expanded={panelDataActive}
            onChange={() => setPanelDataActive(!panelDataActive)}
          >
            <AccordionSummary
              className={styles.mainPanelSummary}
              expandIcon={<ExpandMoreIcon />}
            >
              <Typography variant="subtitle1" color="textSecondary">
                Preview Import
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <DataRowPreview rows={preview.firstRows} />
            </AccordionDetails>
            <AccordionActions>
              <Button
                size="small"
                variant="contained"
                color="primary"
                onClick={acceptClickHandler}
              >
                Next
              </Button>
            </AccordionActions>
          </Accordion>
        )}
      </div>
    );
  }, [styles, preview, panelRawActive, panelDataActive, cancelClickHandler]);

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
