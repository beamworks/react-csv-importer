import React, { useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';

import './FileSelector.scss';

export const FileSelector: React.FC<{ onSelected: (file: File) => void }> = ({
  onSelected
}) => {
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
      className="FileSelector"
      data-active={!!isDragActive}
      {...getRootProps()}
    >
      <input {...getInputProps()} />

      {isDragActive ? (
        <span>Drop the files here...</span>
      ) : (
        <span>Drag-and-drop some files here, or click to select files</span>
      )}
    </div>
  );
};
