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

export function Importer<Row extends BaseRow>({
  chunkSize,
  assumeNoHeaders,
  restartable,
  processChunk,
  onStart,
  onComplete,
  onClose,
  children: content,
  ...customPapaParseConfig
}: React.PropsWithChildren<ImporterProps<Row>>): React.ReactElement {
  // helper to combine our displayed content and the user code that provides field definitions
  const [fields, setFields] = useState<Field[]>([]);

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

  const ContentWrapper = useCallback(
    ({ children }: { children: React.ReactNode }) => (
      <div className="CSVImporter_Importer">
        {children}

        <FieldDefinitionContext.Provider value={setFields}>
          {content}
        </FieldDefinitionContext.Provider>
      </div>
    ),
    [content]
  );

  if (selectedFile === null) {
    return (
      <ContentWrapper>
        <FileSelector onSelected={fileHandler} />
      </ContentWrapper>
    );
  }

  if (!formatAccepted || preview === null) {
    return (
      <ContentWrapper>
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
      </ContentWrapper>
    );
  }

  if (fieldAssignments === null) {
    return (
      <ContentWrapper>
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
      </ContentWrapper>
    );
  }

  return (
    <ContentWrapper>
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
    </ContentWrapper>
  );
}
