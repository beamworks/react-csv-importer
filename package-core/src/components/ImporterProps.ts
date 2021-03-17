import { CustomizablePapaParseConfig, ParseCallback, BaseRow } from './parser';

// separate props definition to safely include in tests
export interface ImportInfo {
  file: File;
  fields: string[]; // list of fields that user has assigned
  columns: (string | undefined)[]; // per-column list of field names (or undefined if unassigned)
  skipHeaders: boolean; // true when user has indicated that data has headers
}

export interface ImporterFieldProps {
  name: string;
  label: string;
  optional?: boolean;
}

export interface ImporterProps<Row extends BaseRow>
  extends CustomizablePapaParseConfig {
  chunkSize?: number;
  assumeNoHeaders?: boolean;
  restartable?: boolean;
  processChunk: ParseCallback<Row>;
  onStart?: (info: ImportInfo) => void;
  onComplete?: (info: ImportInfo) => void;
  onClose?: (info: ImportInfo) => void;
}
