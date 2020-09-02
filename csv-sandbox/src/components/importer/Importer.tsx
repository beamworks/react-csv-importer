import React, { useState, useCallback, useEffect } from 'react';
import Papa from 'papaparse';

import { FileSelector } from './FileSelector';

export const Importer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fileHandler = useCallback((file: File) => {
    setSelectedFile(file);
  }, []);

  useEffect(() => {
    // ignore if nothing to do
    if (selectedFile === null) {
      return;
    }

    Papa.parse(selectedFile, {
      preview: 5,
      skipEmptyLines: true,
      error: (error) => console.error('PapaParse error', error.message),
      complete: function (results) {
        console.log(results);
      }
    });
  }, [selectedFile]);

  return selectedFile === null ? (
    <FileSelector onSelected={fileHandler} />
  ) : (
    <div>
      Parsing <i>{selectedFile.name}</i>
    </div>
  );
};
