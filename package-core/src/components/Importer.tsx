import React, { useState, useCallback, useEffect, useContext } from 'react';

import { ImporterFieldProps, ImporterProps, BaseRow } from '../exports';
import { PreviewInfo, FieldAssignmentMap } from './parser';
import { FileSelector } from './FileSelector';
import { FormatPreview } from './FormatPreview';
import { ColumnPicker, Field } from './ColumnPicker';
import { ProgressDisplay } from './ProgressDisplay';

type FieldListSetter = (prev: Field[]) => Field[];

const FieldDefinitionContext = React.createContext<
  ((setter: FieldListSetter) => void) | null
>(null);

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
  onClose
}: React.PropsWithChildren<
  ImporterProps<Row> & {
    fields: Field[];
  }
>) {
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
        assumeNoHeaders={assumeNoHeaders}
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
