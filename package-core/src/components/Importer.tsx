import React, {
  useMemo,
  useState,
  useCallback,
  useEffect,
  useContext
} from 'react';

import { FieldAssignmentMap, BaseRow } from './parser';
import { generatePreviewColumns } from './ColumnPreview';
import { FileSelector } from './FileSelector';
import { FormatPreview, Preview } from './FormatPreview';
import { ColumnPicker, Field } from './ColumnPicker';
import { ProgressDisplay } from './ProgressDisplay';
import {
  ImporterFilePreview,
  ImporterContentRenderProp,
  ImporterProps,
  ImporterFieldProps
} from './ImporterProps';

import './Importer.scss';

// internal context for registering field definitions
type FieldDef = Field & { id: number };
type FieldListSetter = (prev: FieldDef[]) => FieldDef[];

const FieldDefinitionContext = React.createContext<
  ((setter: FieldListSetter) => void) | null
>(null);

let fieldIdCount = 0;

// defines a field to be filled from file column during import
export const ImporterField: React.FC<ImporterFieldProps> = ({
  name,
  label,
  optional
}) => {
  const fieldId = useMemo(() => (fieldIdCount += 1), []);
  const fieldSetter = useContext(FieldDefinitionContext);

  // update central list as needed
  useEffect(() => {
    if (!fieldSetter) {
      console.error('importer field must be a child of importer'); // @todo
      return;
    }

    fieldSetter((prev) => {
      const newField = { id: fieldId, name, label, isOptional: !!optional };

      const copy = [...prev];
      const existingIndex = copy.findIndex((item) => item.name === name);

      // preserve existing array position if possible
      // @todo keep both copies in a map to deal with dynamic fields better
      if (existingIndex === -1) {
        copy.push(newField);
      } else {
        copy[existingIndex] = newField;
      }

      return copy;
    });
  }, [fieldId, fieldSetter, name, label, optional]);

  // on component unmount, remove this field from list by ID
  useEffect(() => {
    if (!fieldSetter) {
      console.error('importer field must be a child of importer'); // @todo
      return;
    }

    return () => {
      fieldSetter((prev) => {
        return prev.filter((field) => field.id !== fieldId);
      });
    };
  }, [fieldId, fieldSetter]);

  return null;
};

const ContentWrapper: React.FC<{
  setFields: React.Dispatch<React.SetStateAction<FieldDef[]>>;
  preview: Preview | null;
  externalPreview: ImporterFilePreview | null;
  content: ImporterContentRenderProp | React.ReactNode;
}> = ({ setFields, preview, externalPreview, content, children }) => {
  const finalContent = useMemo(() => {
    return typeof content === 'function'
      ? content({
          file: preview && preview.file,
          preview: externalPreview
        })
      : content;
  }, [preview, externalPreview, content]);

  return (
    <div className="CSVImporter_Importer">
      {children}

      <FieldDefinitionContext.Provider value={setFields}>
        {finalContent}
      </FieldDefinitionContext.Provider>
    </div>
  );
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
  const [fields, setFields] = useState<FieldDef[]>([]);

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

  const externalPreview = useMemo<ImporterFilePreview | null>(() => {
    // generate stable externally-visible data objects
    const externalColumns =
      preview && generatePreviewColumns(preview.firstRows, preview.hasHeaders);
    return (
      preview &&
      externalColumns && {
        rawData: preview.firstChunk,
        columns: externalColumns,
        skipHeaders: !preview.hasHeaders,
        parseWarning: preview.parseWarning
      }
    );
  }, [preview]);

  if (selectedFile === null) {
    return (
      <ContentWrapper
        setFields={setFields}
        preview={preview}
        externalPreview={externalPreview}
        content={content}
      >
        <FileSelector onSelected={fileHandler} />
      </ContentWrapper>
    );
  }

  if (!formatAccepted || preview === null || externalPreview === null) {
    return (
      <ContentWrapper
        setFields={setFields}
        preview={preview}
        externalPreview={externalPreview}
        content={content}
      >
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
            setPreview(null);
          }}
        />
      </ContentWrapper>
    );
  }

  if (fieldAssignments === null) {
    return (
      <ContentWrapper
        setFields={setFields}
        preview={preview}
        externalPreview={externalPreview}
        content={content}
      >
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
    <ContentWrapper
      setFields={setFields}
      preview={preview}
      externalPreview={externalPreview}
      content={content}
    >
      <ProgressDisplay
        customConfig={customPapaParseConfig}
        preview={preview}
        externalPreview={externalPreview}
        fieldAssignments={fieldAssignments}
        chunkSize={chunkSize}
        processChunk={processChunk}
        onStart={onStart}
        onRestart={
          restartable
            ? () => {
                // reset all state
                setSelectedFile(null);
                setPreview(null);
                setFormatAccepted(false);
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
