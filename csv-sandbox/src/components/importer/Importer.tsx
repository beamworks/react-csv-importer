import React, { useState, useCallback, useEffect } from 'react';

import { FileSelector } from './FileSelector';
import { FormatPreview, PreviewInfo } from './FormatPreview';
import { ColumnPicker } from './ColumnPicker';

export const Importer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewInfo | null>(null);

  const fileHandler = useCallback((file: File) => {
    setSelectedFile(file);
  }, []);

  if (selectedFile === null) {
    return <FileSelector onSelected={fileHandler} />;
  }

  if (preview === null) {
    return (
      <FormatPreview
        file={selectedFile}
        onAccept={(parsedPreview) => {
          setPreview(parsedPreview);
        }}
        onCancel={() => {
          setSelectedFile(null);
        }}
      />
    );
  }

  return <ColumnPicker />;
};
