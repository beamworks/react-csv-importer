import React, { useState, useCallback, useEffect } from 'react';

import { FileSelector } from './FileSelector';
import { FormatPreview } from './FormatPreview';

export const Importer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fileHandler = useCallback((file: File) => {
    setSelectedFile(file);
  }, []);

  return selectedFile === null ? (
    <FileSelector onSelected={fileHandler} />
  ) : (
    <FormatPreview
      file={selectedFile}
      onCancel={() => {
        setSelectedFile(null);
      }}
    />
  );
};
