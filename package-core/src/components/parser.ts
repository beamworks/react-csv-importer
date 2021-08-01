import Papa from 'papaparse';
import { ReadableWebToNodeStream } from 'readable-web-to-node-stream';

const BOM_CODE = 65279; // 0xFEFF

export interface CustomizablePapaParseConfig {
  delimiter?: Papa.ParseConfig['delimiter'];
  newline?: Papa.ParseConfig['newline'];
  quoteChar?: Papa.ParseConfig['quoteChar'];
  escapeChar?: Papa.ParseConfig['escapeChar'];
  comments?: Papa.ParseConfig['comments'];
  skipEmptyLines?: Papa.ParseConfig['skipEmptyLines'];
  delimitersToGuess?: Papa.ParseConfig['delimitersToGuess'];
}

export interface PreviewBase {
  file: File;
  firstChunk: string;
  firstRows: string[][]; // always PREVIEW_ROWS count
  isSingleLine: boolean;
  parseWarning?: Papa.ParseError;
}

export interface PreviewError {
  parseError: Error | Papa.ParseError;
}

export type PreviewResults =
  | PreviewError
  | ({
      parseError: undefined;
    } & PreviewBase);

export const PREVIEW_ROW_COUNT = 5;

export type FieldAssignmentMap = { [name: string]: number | undefined };

export type BaseRow = { [name: string]: unknown };

export type ParseCallback<Row extends BaseRow> = (
  rows: Row[],
  info: {
    startIndex: number;
  }
) => void | Promise<void>;

export function parsePreview(
  file: File,
  customConfig: CustomizablePapaParseConfig
): Promise<PreviewResults> {
  // wrap synchronous errors in promise
  return new Promise<PreviewResults>((resolve) => {
    let firstChunk: string | null = null;
    let firstWarning: Papa.ParseError | undefined = undefined;
    const rowAccumulator: string[][] = [];

    function reportSuccess() {
      // PapaParse normally complains first anyway, but might as well flag it
      if (rowAccumulator.length === 0) {
        return {
          parseError: new Error('File is empty')
        };
      }

      // remember whether this file has only one line
      const isSingleLine = rowAccumulator.length === 1;

      // fill preview with blanks if needed
      while (rowAccumulator.length < PREVIEW_ROW_COUNT) {
        rowAccumulator.push([]);
      }

      resolve({
        file,
        parseError: undefined,
        parseWarning: firstWarning || undefined,
        firstChunk: firstChunk || '',
        firstRows: rowAccumulator,
        isSingleLine
      });
    }

    // true streaming support for local files (@todo wait for upstream fix)
    // @todo close the stream
    const nodeStream = new ReadableWebToNodeStream(file.stream());
    Papa.parse(nodeStream, {
      ...customConfig,

      chunkSize: 10000, // not configurable, preview only
      preview: PREVIEW_ROW_COUNT,
      skipEmptyLines: true,
      error: (error) => {
        resolve({
          parseError: error
        });
      },
      beforeFirstChunk: (chunk) => {
        firstChunk = chunk;
      },
      chunk: ({ data, errors }, parser) => {
        // ignoring possible leading BOM
        data.forEach((row) => {
          rowAccumulator.push(
            (row as unknown[]).map((item) =>
              typeof item === 'string' ? item : ''
            )
          );
        });

        if (errors.length > 0 && !firstWarning) {
          firstWarning = errors[0];
        }

        // finish parsing after first chunk
        nodeStream.pause(); // parser does not pause source stream, do it here explicitly
        parser.abort();

        reportSuccess();
      },
      complete: reportSuccess
    });
  }).catch((error) => {
    return {
      parseError: error // delegate message display to UI logic
    };
  });
}

export function processFile<Row extends BaseRow>({
  file,
  hasHeaders,
  fieldAssignments,
  reportProgress,
  callback,
  chunkSize,
  customConfig = {}
}: {
  file: File;
  hasHeaders: boolean;
  fieldAssignments: FieldAssignmentMap;
  reportProgress: (deltaCount: number) => void;
  callback: ParseCallback<Row>;
  chunkSize?: number;
  customConfig: CustomizablePapaParseConfig;
}): Promise<void> {
  const fieldNames = Object.keys(fieldAssignments);

  // wrap synchronous errors in promise
  return new Promise<void>((resolve, reject) => {
    // skip first line if needed
    let skipLine = hasHeaders;
    let skipBOM = !hasHeaders;
    let processedCount = 0;

    // true streaming support for local files (@todo wait for upstream fix)
    const nodeStream = new ReadableWebToNodeStream(file.stream());
    Papa.parse(nodeStream, {
      ...customConfig,

      chunkSize: chunkSize || 10000,
      skipEmptyLines: true,
      error: (error) => {
        reject(error);
      },
      chunk: ({ data }, parser) => {
        // pause to wait until the rows are consumed
        nodeStream.pause(); // parser does not pause source stream, do it here explicitly
        parser.pause();

        const skipped = skipLine && data.length > 0;

        const rows = (skipped ? data.slice(1) : data).map((row) => {
          const stringRow = (row as unknown[]).map((item) =>
            typeof item === 'string' ? item : ''
          );

          // perform BOM skip on first value
          if (skipBOM && stringRow.length > 0) {
            skipBOM = false;
            stringRow[0] =
              stringRow[0].charCodeAt(0) === BOM_CODE
                ? stringRow[0].substring(1)
                : stringRow[0];
          }

          const record = {} as { [name: string]: string | undefined };

          fieldNames.forEach((fieldName) => {
            const columnIndex = fieldAssignments[fieldName];
            if (columnIndex !== undefined) {
              record[fieldName] = stringRow[columnIndex];
            }
          });

          return record as Row; // @todo look into a more precise setup
        });

        // clear line skip flag if there was anything to skip
        if (skipped) {
          skipLine = false;
        }

        // info snapshot for processing callback
        const info = {
          startIndex: processedCount
        };

        processedCount += rows.length;

        // @todo collect errors
        reportProgress(rows.length);

        // wrap sync errors in promise
        // (avoid invoking callback if there are no rows to consume)
        const whenConsumed = new Promise<void>((resolve) => {
          const result = rows.length ? callback(rows, info) : undefined;

          // introduce delay to allow a frame render
          setTimeout(() => resolve(result), 0);
        });

        // unpause parsing when done
        whenConsumed.then(
          () => {
            nodeStream.resume();
            parser.resume();
          },
          () => {
            // @todo collect errors
            nodeStream.resume();
            parser.resume();
          }
        );
      },
      complete: () => {
        resolve();
      }
    });
  });
}
