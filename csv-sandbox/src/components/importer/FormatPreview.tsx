import React, { useCallback, useRef, useEffect, useState } from 'react';
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

    Papa.parse(file, {
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
      step: ({ data, errors }) => {
        rowAccumulator.push(data);

        if (errors.length > 0 && firstWarning === null) {
          firstWarning = errors[0];
        }

        // finish if parsing stops here (PP does not call done then)
        if (rowAccumulator.length === MAX_ROWS) {
          reportSuccess();
        }
      },
      complete: reportSuccess
    });
  });
}

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

  return (
    <div>
      Importing file <i>{file.name}</i>{' '}
      <Link href="#" onClick={cancelClickHandler}>
        Go back
      </Link>
      {preview === null ? (
        <div>Parsing...</div>
      ) : (
        <div>
          Data preview:
          <pre>{!preview.parseError && preview.firstChunk.slice(0, 100)}</pre>
        </div>
      )}
    </div>
  );
};
