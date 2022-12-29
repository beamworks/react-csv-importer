import React from 'react';
import { ImporterLocale } from '../locale';
import { CustomizablePapaParseConfig, ParseCallback, BaseRow } from '../parser';

// information for displaying a spreadsheet-style column
export interface ImporterPreviewColumn {
  index: number; // 0-based position inside spreadsheet
  header?: string; // header, if present
  values: string[]; // row values after the header
}

export interface ImporterFilePreview {
  rawData: string; // raw first data chunk consumed by parser for preview
  columns: ImporterPreviewColumn[]; // per-column parsed preview
  skipHeaders: boolean; // true if user has indicated that file has no headers
  parseWarning?: Papa.ParseError; // any non-blocking PapaParse message
}

// separate props definition to safely include in tests
export interface ImportInfo {
  file: File;
  preview: ImporterFilePreview;
  fields: string[]; // list of fields that user has assigned
  columnFields: (string | undefined)[]; // per-column list of field names (or undefined if unassigned)
}

export type ImporterContentRenderProp = (info: {
  file: File | null;
  preview: ImporterFilePreview | null;
}) => React.ReactNode;

export interface ImporterFieldProps {
  name: string;
  label: string;
  optional?: boolean;
}

export type ImporterDataHandlerProps<Row extends BaseRow> =
  | {
      dataHandler: ParseCallback<Row>;
      processChunk?: undefined; // for ease of rest-spread
    }
  | {
      /**
       * @deprecated renamed to `dataHandler`
       */
      processChunk: ParseCallback<Row>;
      dataHandler?: undefined; // disambiguate from newer naming
    };

export type ImporterProps<Row extends BaseRow> = ImporterDataHandlerProps<
  Row
> & {
  defaultNoHeader?: boolean;
  /**
   * @deprecated renamed to `defaultNoHeader`
   */
  assumeNoHeaders?: boolean;

  displayColumnPageSize?: number;
  displayFieldRowSize?: number;

  restartable?: boolean;
  onStart?: (info: ImportInfo) => void;
  onComplete?: (info: ImportInfo) => void;
  onClose?: (info: ImportInfo) => void;
  children?: ImporterContentRenderProp | React.ReactNode;
  locale?: ImporterLocale;
} & CustomizablePapaParseConfig;
