import Papa from 'papaparse';
import { Readable } from 'stream';

export interface CustomizablePapaParseConfig {
  delimiter?: Papa.ParseConfig['delimiter'];
  newline?: Papa.ParseConfig['newline'];
  quoteChar?: Papa.ParseConfig['quoteChar'];
  escapeChar?: Papa.ParseConfig['escapeChar'];
  comments?: Papa.ParseConfig['comments'];
  skipEmptyLines?: Papa.ParseConfig['skipEmptyLines'];
  delimitersToGuess?: Papa.ParseConfig['delimitersToGuess'];
  chunkSize?: Papa.ParseConfig['chunkSize'];
  encoding?: Papa.ParseConfig['encoding'];
}

export interface PreviewReport {
  file: File;
  firstChunk: string;
  firstRows: string[][]; // always PREVIEW_ROWS count
  isSingleLine: boolean;
  parseWarning?: Papa.ParseError;
}

// success/failure report from the preview parse attempt
export type PreviewResults =
  | {
      parseError: Error | Papa.ParseError;
      file: File;
    }
  | ({
      parseError: undefined;
    } & PreviewReport);

export const PREVIEW_ROW_COUNT = 5;

// for each given target field name, source from original CSV column index
export type FieldAssignmentMap = { [name: string]: number | undefined };

export type BaseRow = { [name: string]: unknown };

export type ParseCallback<Row extends BaseRow> = (
  rows: Row[],
  info: {
    startIndex: number;
  }
) => void | Promise<void>;

// polyfill as implemented in https://github.com/eligrey/Blob.js/blob/master/Blob.js#L653
// (this is for Safari pre v14.1)
function streamForBlob(blob: Blob) {
  if (blob.stream) {
    return blob.stream();
  }

  const res = new Response(blob);
  if (res.body) {
    return res.body;
  }

  throw new Error('This browser does not support client-side file reads');
}

// incredibly cheap wrapper exposing a subset of stream.Readable interface just for PapaParse usage
// @todo chunk size
function nodeStreamWrapper(stream: ReadableStream, encoding: string): Readable {
  let dataHandler: ((chunk: string) => void) | null = null;
  let endHandler: ((unused: unknown) => void) | null = null;
  let errorHandler: ((error: unknown) => void) | null = null;
  let isStopped = false;

  let pausePromise: Promise<void> | null = null;
  let pauseResolver: (() => void) | null = null;

  async function runReaderPump() {
    // ensure this is truly in the next tick after uncorking
    await Promise.resolve();

    const streamReader = stream.getReader();
    const decoder = new TextDecoder(encoding); // this also strips BOM by default

    try {
      // main reader pump loop
      while (!isStopped) {
        // perform read from upstream
        const { done, value } = await streamReader.read();

        // wait if we became paused since last data event
        if (pausePromise) {
          await pausePromise;
        }

        // check again if stopped and unlistened
        if (isStopped || !dataHandler || !endHandler) {
          return;
        }

        // final data flush and end notification
        if (done) {
          const lastChunkString = decoder.decode(value); // value is empty but pass just in case
          if (lastChunkString) {
            dataHandler(lastChunkString);
          }

          endHandler(undefined);
          return;
        }

        // otherwise, normal data event after stream-safe decoding
        const chunkString = decoder.decode(value, { stream: true });
        dataHandler(chunkString);
      }
    } finally {
      // always release the lock
      streamReader.releaseLock();
    }
  }

  const self = {
    // marker properties to make PapaParse think this is a Readable object
    readable: true,
    read() {
      throw new Error('only flowing mode is emulated');
    },

    on(event: string, callback: (param: unknown) => void) {
      switch (event) {
        case 'data':
          if (dataHandler) {
            throw new Error('two data handlers not supported');
          }
          dataHandler = callback;

          // flowing state started, run the main pump loop
          runReaderPump().catch((error) => {
            if (errorHandler) {
              errorHandler(error);
            } else {
              // rethrow to show error in console
              throw error;
            }
          });

          return;
        case 'end':
          if (endHandler) {
            throw new Error('two end handlers not supported');
          }
          endHandler = callback;
          return;
        case 'error':
          if (errorHandler) {
            throw new Error('two error handlers not supported');
          }
          errorHandler = callback;
          return;
      }

      throw new Error('unknown stream shim event: ' + event);
    },

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    removeListener(event: string, callback: (param: unknown) => void) {
      // stop and clear everything for simplicity
      isStopped = true;
      dataHandler = null;
      endHandler = null;
      errorHandler = null;
    },

    pause() {
      if (!pausePromise) {
        pausePromise = new Promise((resolve) => {
          pauseResolver = resolve;
        });
      }
      return self;
    },

    resume() {
      if (pauseResolver) {
        pauseResolver(); // waiting code will proceed in next tick
        pausePromise = null;
        pauseResolver = null;
      }
      return self;
    }
  };

  // pass ourselves off as a real Node stream
  return (self as unknown) as Readable;
}

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
          parseError: new Error('File is empty'),
          file
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

    // use our own multibyte-safe streamer, bail after first chunk
    // (this used to add skipEmptyLines but that was hiding possible parse errors)
    // @todo wait for upstream multibyte fix in PapaParse: https://github.com/mholt/PapaParse/issues/908
    const nodeStream = nodeStreamWrapper(
      streamForBlob(file),
      customConfig.encoding || 'utf-8'
    );

    Papa.parse(nodeStream, {
      ...customConfig,

      chunkSize: 10000, // not configurable, preview only @todo make configurable
      preview: PREVIEW_ROW_COUNT,

      error: (error) => {
        resolve({
          parseError: error,
          file
        });
      },
      beforeFirstChunk: (chunk) => {
        firstChunk = chunk;
      },
      chunk: ({ data, errors }, parser) => {
        data.forEach((row) => {
          const stringRow = (row as unknown[]).map((item) =>
            typeof item === 'string' ? item : ''
          );

          rowAccumulator.push(stringRow);
        });

        if (errors.length > 0 && !firstWarning) {
          firstWarning = errors[0];
        }

        // finish parsing once we got enough data, otherwise try for more
        // (in some cases PapaParse flushes out last line as separate chunk)
        if (rowAccumulator.length >= PREVIEW_ROW_COUNT) {
          nodeStream.pause(); // parser does not pause source stream, do it here explicitly
          parser.abort();

          reportSuccess();
        }
      },
      complete: reportSuccess
    });
  }).catch((error) => {
    return {
      parseError: error, // delegate message display to UI logic
      file
    };
  });
}

export interface ParserInput {
  file: File;
  papaParseConfig: CustomizablePapaParseConfig;
  hasHeaders: boolean;
  fieldAssignments: FieldAssignmentMap;
}

export function processFile<Row extends BaseRow>(
  input: ParserInput,
  reportProgress: (deltaCount: number) => void,
  callback: ParseCallback<Row>
): Promise<void> {
  const { file, hasHeaders, papaParseConfig, fieldAssignments } = input;
  const fieldNames = Object.keys(fieldAssignments);

  // wrap synchronous errors in promise
  return new Promise<void>((resolve, reject) => {
    // skip first line if needed
    let skipLine = hasHeaders;
    let processedCount = 0;

    // use our own multibyte-safe decoding streamer
    // @todo wait for upstream multibyte fix in PapaParse: https://github.com/mholt/PapaParse/issues/908
    const nodeStream = nodeStreamWrapper(
      streamForBlob(file),
      papaParseConfig.encoding || 'utf-8'
    );

    Papa.parse(nodeStream, {
      ...papaParseConfig,
      chunkSize: papaParseConfig.chunkSize || 10000, // our own preferred default

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
