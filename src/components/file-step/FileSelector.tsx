import React, { useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { useLocale } from '../../locale/LocaleContext';

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

  const l10n = useLocale('FileSelector');

  return (
    <div
      className="CSVImporter_FileSelector"
      data-active={!!isDragActive}
      {...getRootProps()}
    >
      <input {...getInputProps()} />

      {isDragActive ? (
        <span>{l10n.activeDragDropPrompt}</span>
      ) : (
        <span>{l10n.initialDragDropPrompt}</span>
      )}
    </div>
  );
};
