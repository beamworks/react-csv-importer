import React, { useState, useCallback, useEffect } from 'react';

import { FileSelector } from './FileSelector';
import { FormatPreview, PreviewInfo } from './FormatPreview';
import { ColumnPicker, Field } from './ColumnPicker';
import { ProgressDisplay } from './ProgressDisplay';

const fields: Field[] = [
  { label: 'Name' },
  { label: 'Email' },
  { label: 'DOB' },
  { label: 'Postal Code' },
  { label: 'Snack Preference' },
  { label: 'Country' },
  { label: 'Bees?' }
];

export const Importer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewInfo | null>(null);
  const [fieldAssignments, setFieldAssignments] = useState<
    (number | null)[] | null
  >(null);

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

  if (fieldAssignments === null) {
    return (
      <ColumnPicker
        fields={fields}
        preview={preview}
        onAccept={(assignments) => {
          setFieldAssignments(assignments);
        }}
        onCancel={() => {
          setPreview(null);
        }}
      />
    );
  }

  return <ProgressDisplay preview={preview} />;
};
