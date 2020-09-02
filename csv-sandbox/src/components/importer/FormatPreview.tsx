import React, { useCallback, useRef, useEffect } from 'react';
import Papa from 'papaparse';
import { makeStyles } from '@material-ui/core/styles';
import Link from '@material-ui/core/Link';

const useStyles = makeStyles((theme) => ({}));

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

  useEffect(() => {
    // ignore if nothing to do
    if (file === null) {
      return;
    }

    Papa.parse(file, {
      preview: 5,
      skipEmptyLines: true,
      error: (error) => console.error('PapaParse error', error.message),
      complete: function (results) {
        console.log(results);
      }
    });
  }, [file]);

  return (
    <div>
      Importing file <i>{file.name}</i>{' '}
      <Link href="#" onClick={cancelClickHandler}>
        Go back
      </Link>
    </div>
  );
};
