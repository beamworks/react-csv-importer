import React, { useState, useCallback, useEffect, useContext } from 'react';

import { PreviewInfo } from './parser';
import { FileSelector } from './FileSelector';
import { FormatPreview } from './FormatPreview';
import { ColumnPicker, Field, FieldAssignmentMap } from './ColumnPicker';
import { ProgressDisplay } from './ProgressDisplay';

type FieldListSetter = (prev: Field[]) => Field[];

const FieldDefinitionContext = React.createContext<
  ((setter: FieldListSetter) => void) | null
>(null);

export const ImporterField: React.FC<Field> = ({ name, label }) => {
  const fieldSetter = useContext(FieldDefinitionContext);

  // update central list as needed
  useEffect(() => {
    if (!fieldSetter) {
      console.error('importer field must be a child of importer'); // @todo
      return;
    }

    fieldSetter((prev) => [
      ...prev.filter((item) => item.name !== name),
      { name, label }
    ]);
  }, [name, label]);

  return null;
};

const ImporterCore: React.FC<{ fields: Field[] }> = ({ fields }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewInfo | null>(null);
  const [
    fieldAssignments,
    setFieldAssignments
  ] = useState<FieldAssignmentMap | null>(null);

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

  return (
    <ProgressDisplay
      preview={preview}
      callback={() => {
        return new Promise((resolve) => setTimeout(resolve, 1500));
      }}
    />
  );
};

export const Importer: React.FC = ({ children }) => {
  const [fields, setFields] = useState<Field[]>([]);

  return (
    <>
      <ImporterCore fields={fields} />

      <FieldDefinitionContext.Provider value={setFields}>
        {children}
      </FieldDefinitionContext.Provider>
    </>
  );
};
