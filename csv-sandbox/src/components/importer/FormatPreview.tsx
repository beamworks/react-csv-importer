import React, {
  useCallback,
  useMemo,
  useRef,
  useEffect,
  useState
} from 'react';
import Papa from 'papaparse';
import { makeStyles } from '@material-ui/core/styles';
import Link from '@material-ui/core/Link';

const useStyles = makeStyles((theme) => ({}));

const MAX_ROWS = 5;

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

const DataRowPreview: React.FC<{ rows: unknown[][] }> = React.memo(
  ({ rows }) => {
    const firstRow = rows[0].map((item) =>
      typeof item !== 'string' ? '' : item
    );

    return (
      <ul>
        {firstRow.map((item, itemIndex) => (
          <li key={itemIndex}>{item}</li>
        ))}
      </ul>
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
    (event: React.MouseEvent<HTMLAnchorElement>) => {
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
      <div>
        <div>
          Data preview:
          <pre>{preview.firstChunk.slice(0, 100)}</pre>
        </div>
        <div>
          {preview.parseWarning ? (
            <div>
              {preview.parseWarning.message}: please check data formatting
            </div>
          ) : (
            <div>
              <DataRowPreview rows={preview.firstRows} />
            </div>
          )}
        </div>
      </div>
    );
  }, [preview]);

  return (
    <div>
      Importing file <i>{file.name}</i>{' '}
      <Link href="#" onClick={cancelClickHandler}>
        Go back
      </Link>
      {report || <div>Parsing...</div>}
    </div>
  );
};
