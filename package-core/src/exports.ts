// @todo move these back to relevant modules

export type BaseRow = { [name: string]: unknown };

export type ParseCallback<Row extends BaseRow> = (
  rows: Row[]
) => void | Promise<void>;

export interface ImporterFieldProps {
  name: string;
  label: string;
  optional?: boolean;
}

export interface ImportInfo {
  file: File;
  fields: string[];
}

export interface ImporterProps<Row extends BaseRow> {
  chunkSize?: number;
  assumeNoHeaders?: boolean;
  restartable?: boolean;
  processChunk: ParseCallback<Row>;
  onStart?: (info: ImportInfo) => void;
  onComplete?: (info: ImportInfo) => void;
  onClose?: (info: ImportInfo) => void;
}
