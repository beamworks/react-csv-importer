import React, { useState, useCallback, useEffect, useContext } from 'react';

import { FieldAssignmentMap, BaseRow } from './parser';
import { FileSelector } from './FileSelector';
import { FormatPreview, Preview } from './FormatPreview';
import { ColumnPicker, Field } from './ColumnPicker';
import { ProgressDisplay } from './ProgressDisplay';
import { ImporterProps, ImporterFieldProps } from './ImporterProps';

import './Importer.scss';

// internal context for registering field definitions
type FieldListSetter = (prev: Field[]) => Field[];

const FieldDefinitionContext = React.createContext<
  ((setter: FieldListSetter) => void) | null
>(null);

// defines a field to be filled from file column during import
export const ImporterField: React.FC<ImporterFieldProps> = ({
  name,
  label,
  optional
}) => {
  const fieldSetter = useContext(FieldDefinitionContext);

  // update central list as needed
  useEffect(() => {
    if (!fieldSetter) {
      console.error('importer field must be a child of importer'); // @todo
      return;
    }

    fieldSetter((prev) => {
      const newField = { name, label, isOptional: !!optional };

      const copy = [...prev];
      const existingIndex = copy.findIndex((item) => item.name === name);

      // preserve existing array position if possible
      if (existingIndex === -1) {
        copy.push(newField);
      } else {
        copy[existingIndex] = newField;
      }

      return copy;
    });
  }, [fieldSetter, name, label, optional]);

  return null;
};

function ImporterCore<Row extends BaseRow>({
  fields,
  chunkSize,
  assumeNoHeaders,
  restartable,
  processChunk,
  onStart,
  onComplete,
  onClose,
  ...customPapaParseConfig
}: React.PropsWithChildren<
  ImporterProps<Row> & {
    fields: Field[];
  }
>) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [preview, setPreview] = useState<Preview | null>(null);
  const [formatAccepted, setFormatAccepted] = useState<boolean>(false);

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

  if (!formatAccepted || preview === null) {
    return (
      <FormatPreview
        customConfig={customPapaParseConfig}
        file={selectedFile}
        assumeNoHeaders={assumeNoHeaders}
        currentPreview={preview}
        onChange={(parsedPreview) => {
          setPreview(parsedPreview);
        }}
        onAccept={() => {
          setFormatAccepted(true);
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
          setFormatAccepted(false);
        }}
      />
    );
  }

  return (
    <ProgressDisplay
      preview={preview}
      fieldAssignments={fieldAssignments}
      chunkSize={chunkSize}
      processChunk={processChunk}
      onStart={onStart}
      onRestart={
        restartable
          ? () => {
              // reset all state
              setSelectedFile(null);
              setPreview(null); // not bothering with editFormat flag
              setFieldAssignments(null);
            }
          : undefined
      }
      onComplete={onComplete}
      onClose={onClose}
    />
  );
}

export function Importer<Row extends BaseRow>({
  children,
  ...props
}: React.PropsWithChildren<ImporterProps<Row>>): React.ReactElement {
  const [fields, setFields] = useState<Field[]>([]);

  return (
    <div className="CSVImporter_Importer">
      <ImporterCore fields={fields} {...props} />

      <FieldDefinitionContext.Provider value={setFields}>
        {children}
      </FieldDefinitionContext.Provider>
    </div>
  );
}
