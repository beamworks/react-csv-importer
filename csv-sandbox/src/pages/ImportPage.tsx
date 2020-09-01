import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  dropZone: {
    border: `4px dashed ${theme.palette.primary.main}`,
    borderRadius: 5,
    background: theme.palette.grey.A100,
    padding: theme.spacing(8),
    textAlign: 'center',

    '&[data-active=true]': {
      background: theme.palette.secondary.light,
      color: theme.palette.secondary.contrastText,
      transition: 'background 0.1s ease-out'
    }
  }
}));

export const ImportPage: React.FC = () => {
  const styles = useStyles();

  const onDrop = useCallback((acceptedFiles) => {
    console.log(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div>
      <p>Import interface page.</p>
      <div
        className={styles.dropZone}
        data-active={!!isDragActive}
        {...getRootProps()}
      >
        <input {...getInputProps()} />

        {isDragActive ? (
          <span>Drop the files here ...</span>
        ) : (
          <span>Drag 'n' drop some files here, or click to select files</span>
        )}
      </div>
    </div>
  );
};
