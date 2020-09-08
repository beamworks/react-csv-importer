import React, { useState, useCallback, useEffect, useContext } from 'react';

import {
  PreviewInfo,
  FieldAssignmentMap,
  ParseCallback,
  BaseRow
} from './parser';
import { FileSelector } from './FileSelector';
import { FormatPreview } from './FormatPreview';
import { ColumnPicker, Field } from './ColumnPicker';
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

function ImporterCore<Row extends BaseRow>({
  fields,
  callback
}: React.PropsWithChildren<{
  fields: Field[];
  callback: ParseCallback<Row>;
}>) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [preview, setPreview] = useState<PreviewInfo | null>(null);
  const [editFormat, setEditFormat] = useState<boolean>(false);

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

  if (preview === null || editFormat) {
    return (
      <FormatPreview
        file={selectedFile}
        currentPreview={preview}
        onAccept={(parsedPreview) => {
          setPreview(parsedPreview);
          setEditFormat(false);
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
          // keep existing preview data
          setEditFormat(true);
        }}
      />
    );
  }

  return (
    <ProgressDisplay
      preview={preview}
      fieldAssignments={fieldAssignments}
      callback={callback}
    />
  );
}

export function Importer<Row extends BaseRow>({
  callback,
  children
}: React.PropsWithChildren<{ callback: ParseCallback<Row> }>) {
  const [fields, setFields] = useState<Field[]>([]);

  return (
    <>
      <ImporterCore fields={fields} callback={callback} />

      <FieldDefinitionContext.Provider value={setFields}>
        {children}
      </FieldDefinitionContext.Provider>
    </>
  );
}
