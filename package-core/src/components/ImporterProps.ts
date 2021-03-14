import {
  CustomizablePapaParseConfig,
  ParseCallback,
  BaseRow,
  FieldAssignmentMap
} from './parser';

// separate props definition to safely include in tests
export interface ImportInfo {
  file: File;
  fields: string[];
  fieldAssignments: FieldAssignmentMap;
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
