import React, { useCallback, useRef } from 'react';
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

export const FileSelector: React.FC<{ onSelected: (file: File) => void }> = ({
  onSelected
}) => {
  const styles = useStyles();

  const onSelectedRef = useRef(onSelected);
  onSelectedRef.current = onSelected;

  const dropHandler = useCallback((acceptedFiles: File[]) => {
    // silently ignore if nothing to do
    if (acceptedFiles.length < 1) {
      return;
    }

    const file = acceptedFiles[0];
    onSelectedRef.current(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: dropHandler
  });

  return (
    <div
      className={styles.dropZone}
      data-active={!!isDragActive}
      {...getRootProps()}
    >
      <input {...getInputProps()} />

      {isDragActive ? (
        <span>Drop the files here ...</span>
      ) : (
        <span>Drag-and-drop some files here, or click to select files</span>
      )}
    </div>
  );
};
