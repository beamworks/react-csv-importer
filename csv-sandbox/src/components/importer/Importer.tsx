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

import './Importer.scss';

type FieldListSetter = (prev: Field[]) => Field[];

const FieldDefinitionContext = React.createContext<
  ((setter: FieldListSetter) => void) | null
>(null);

export interface FieldProps {
  name: string;
  label: string;
  optional?: boolean;
}

export const ImporterField: React.FC<FieldProps> = ({
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
  callback,
  onFinish
}: React.PropsWithChildren<{
  fields: Field[];
  callback: ParseCallback<Row>;
  onFinish?: () => void;
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
      onRestart={() => {
        // reset all state
        setSelectedFile(null);
        setPreview(null); // not bothering with editFormat flag
        setFieldAssignments(null);
      }}
      onFinish={onFinish}
    />
  );
}

export function Importer<Row extends BaseRow>({
  callback,
  onFinish,
  children
}: React.PropsWithChildren<{
  callback: ParseCallback<Row>;
  onFinish?: () => void;
}>): React.ReactElement {
  const [fields, setFields] = useState<Field[]>([]);

  return (
    <div className="Importer">
      <ImporterCore fields={fields} callback={callback} onFinish={onFinish} />

      <FieldDefinitionContext.Provider value={setFields}>
        {children}
      </FieldDefinitionContext.Provider>
    </div>
  );
}
