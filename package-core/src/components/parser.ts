import Papa from 'papaparse';
import { ReadableWebToNodeStream } from 'readable-web-to-node-stream';

import { BaseRow } from '../exports';

export interface PreviewInfo {
  file: File;
  firstChunk: string;
  firstRows: string[][]; // always PREVIEW_ROWS count
  hasHeaders: boolean;
}

export type PreviewResults =
  | ({
      parseError: undefined;
      parseWarning?: Papa.ParseError;
    } & PreviewInfo)
  | {
      parseError: Error | Papa.ParseError;
    };

export const PREVIEW_ROW_COUNT = 5;

export type FieldAssignmentMap = { [name: string]: number | undefined };

export function parsePreview(file: File): Promise<PreviewResults> {
  // wrap synchronous errors in promise
  return new Promise<PreviewResults>((resolve) => {
    let firstChunk: string | null = null;
    let firstWarning: Papa.ParseError | undefined = undefined;
    const rowAccumulator: string[][] = [];

    function reportSuccess() {
      while (rowAccumulator.length < PREVIEW_ROW_COUNT) {
        rowAccumulator.push([]);
      }

      resolve({
        file,
        parseError: undefined,
        parseWarning: firstWarning || undefined,
        firstChunk: firstChunk || '',
        firstRows: rowAccumulator,
        hasHeaders: true // placeholder to modify downstream
      });
    }

    // true streaming support for local files (@todo wait for upstream fix)
    // @todo close the stream
    const nodeStream = new ReadableWebToNodeStream(file.stream());
    Papa.parse(nodeStream, {
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
  }).catch(() => {
    return {
      parseError: new Error('Internal error while generating preview')
    };
  });
}

export function processFile<Row extends BaseRow>(
  file: File,
  hasHeaders: boolean,
  fieldAssignments: FieldAssignmentMap,
  reportProgress: (deltaCount: number) => void,
  callback: (rows: Row[]) => void | Promise<void>,
  chunkSize?: number
): Promise<void> {
  const fieldNames = Object.keys(fieldAssignments);

  // wrap synchronous errors in promise
  return new Promise<void>((resolve, reject) => {
    // skip first line if needed
    let skipLine = hasHeaders;

    // true streaming support for local files (@todo wait for upstream fix)
    const nodeStream = new ReadableWebToNodeStream(file.stream());
    Papa.parse(nodeStream, {
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

        // @todo collect errors
        reportProgress(rows.length);

        // wrap sync errors in promise
        // (avoid invoking callback if there are no rows to consume)
        const whenConsumed = new Promise<void>((resolve) => {
          const result = rows.length ? callback(rows) : undefined;

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
