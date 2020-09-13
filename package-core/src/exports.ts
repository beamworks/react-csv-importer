// external-facing type definitions for the entire library
// @todo replace with auto-generated .d.ts bundle
import * as React from 'react';

export type BaseRow = { [name: string]: unknown };

export type ParseCallback<Row extends BaseRow> = (
  rows: Row[]
) => void | Promise<void>;

export interface ImporterFieldProps {
  name: string;
  label: string;
  optional?: boolean;
}

export declare const ImporterField: React.FC<ImporterFieldProps>;

export interface ImporterProps<Row extends BaseRow> {
  chunkSize?: number;
  processChunk: ParseCallback<Row>;
  onStart?: () => void;
  onFinish?: () => void;
}

export declare function Importer<Row extends BaseRow>(
  props: React.PropsWithChildren<ImporterProps<Row>>
): React.ReactElement;
