import React, { useMemo, useState, useEffect } from 'react';

import { BaseRow } from '../parser';
import { FileStep, FileStepState } from './file-step/FileStep';
import { generatePreviewColumns } from './fields-step/ColumnPreview';
import { FieldsStep, FieldsStepState } from './fields-step/FieldsStep';
import { ProgressDisplay } from './ProgressDisplay';
import { ImporterFilePreview, ImporterProps } from './ImporterProps';

// re-export from a central spot
export { ImporterField } from './ImporterField';
import { useFieldDefinitions } from './ImporterField';

import './Importer.scss';
import { LocaleContext } from '../locale/LocaleContext';
import { enUS } from '../locale';

export function Importer<Row extends BaseRow>({
  assumeNoHeaders,
  restartable,
  processChunk,
  onStart,
  onComplete,
  onClose,
  children: content,
  locale,
  ...customPapaParseConfig
}: ImporterProps<Row>): React.ReactElement {
  // helper to combine our displayed content and the user code that provides field definitions
  const [fields, userFieldContentWrapper] = useFieldDefinitions();

  const [fileState, setFileState] = useState<FileStepState | null>(null);
  const [fileAccepted, setFileAccepted] = useState<boolean>(false);

  const [fieldsState, setFieldsState] = useState<FieldsStepState | null>(null);
  const [fieldsAccepted, setFieldsAccepted] = useState<boolean>(false);

  // reset field assignments when file changes
  const activeFile = fileState && fileState.file;
  useEffect(() => {
    if (activeFile) {
      setFieldsState(null);
    }
  }, [activeFile]);

  const externalPreview = useMemo<ImporterFilePreview | null>(() => {
    // generate stable externally-visible data objects
    const externalColumns =
      fileState &&
      generatePreviewColumns(fileState.firstRows, fileState.hasHeaders);
    return (
      fileState &&
      externalColumns && {
        rawData: fileState.firstChunk,
        columns: externalColumns,
        skipHeaders: !fileState.hasHeaders,
        parseWarning: fileState.parseWarning
      }
    );
  }, [fileState]);

  // fall back to enUS if no default locale provided
  locale = locale ?? enUS;

  if (!fileAccepted || fileState === null || externalPreview === null) {
    return (
      <LocaleContext.Provider value={locale}>
        <div className="CSVImporter_Importer">
          <FileStep
            customConfig={customPapaParseConfig}
            assumeNoHeaders={assumeNoHeaders}
            prevState={fileState}
            onChange={(parsedPreview) => {
              setFileState(parsedPreview);
            }}
            onAccept={() => {
              setFileAccepted(true);
            }}
          />
        </div>
      </LocaleContext.Provider>
    );
  }

  if (!fieldsAccepted || fieldsState === null) {
    return (
      <LocaleContext.Provider value={locale}>
        <div className="CSVImporter_Importer">
          <FieldsStep
            fileState={fileState}
            fields={fields}
            prevState={fieldsState}
            onChange={(state) => {
              setFieldsState(state);
            }}
            onAccept={() => {
              setFieldsAccepted(true);
            }}
            onCancel={() => {
              // keep existing preview data and assignments
              setFileAccepted(false);
            }}
          />

          {userFieldContentWrapper(
            // render the provided child content that defines the fields
            typeof content === 'function'
              ? content({
                  file: fileState && fileState.file,
                  preview: externalPreview
                })
              : content
          )}
        </div>
      </LocaleContext.Provider>
    );
  }

  return (
    <LocaleContext.Provider value={locale}>
      <div className="CSVImporter_Importer">
        <ProgressDisplay
          fileState={fileState}
          fieldsState={fieldsState}
          externalPreview={externalPreview}
          processChunk={processChunk}
          onStart={onStart}
          onRestart={
            restartable
              ? () => {
                  // reset all state
                  setFileState(null);
                  setFileAccepted(false);
                  setFieldsState(null);
                  setFieldsAccepted(false);
                }
              : undefined
          }
          onComplete={onComplete}
          onClose={onClose}
        />
      </div>
    </LocaleContext.Provider>
  );
}
