import React, { useState, useEffect, useMemo, useRef } from 'react';

import {
  processFile,
  FieldAssignmentMap,
  ParseCallback,
  BaseRow,
  CustomizablePapaParseConfig
} from './parser';
import { ImporterFilePreview, ImportInfo } from './ImporterProps';
import { Preview } from './FormatPreview';
import { ImporterFrame } from './ImporterFrame';

import './ProgressDisplay.scss';

// compute actual UTF-8 bytes used by a string
// (inspired by https://stackoverflow.com/questions/10576905/how-to-convert-javascript-unicode-notation-code-to-utf-8)
function countUTF8Bytes(item: string) {
  // re-encode into UTF-8
  const escaped = encodeURIComponent(item);

  // convert byte escape sequences into single characters
  const normalized = escaped.replace(/%\d\d/g, '_');

  return normalized.length;
}

export function ProgressDisplay<Row extends BaseRow>({
  preview,
  externalPreview,
  chunkSize,
  fieldAssignments,
  customConfig,
  processChunk,
  onStart,
  onComplete,
  onRestart,
  onClose
}: React.PropsWithChildren<{
  preview: Preview;
  externalPreview: ImporterFilePreview;
  chunkSize?: number;
  fieldAssignments: FieldAssignmentMap;
  customConfig: CustomizablePapaParseConfig;
  processChunk: ParseCallback<Row>;
  onStart?: (info: ImportInfo) => void;
  onComplete?: (info: ImportInfo) => void;
  onRestart?: () => void;
  onClose?: (info: ImportInfo) => void;
}>): React.ReactElement {
  const [progressCount, setProgressCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isDismissed, setIsDismissed] = useState(false); // prevents double-clicking finish

  const importInfo = useMemo<ImportInfo>(() => {
    const fieldList = Object.keys(fieldAssignments);

    const columnSparseList: (string | undefined)[] = [];
    fieldList.forEach((field) => {
      const col = fieldAssignments[field];
      if (col !== undefined) {
        columnSparseList[col] = field;
      }
    });

    return {
      file: preview.file,
      preview: externalPreview,
      fields: fieldList,
      columnFields: [...columnSparseList]
    };
  }, [preview, externalPreview, fieldAssignments]);

  // estimate number of rows
  const estimatedRowCount = useMemo(() => {
    // sum up sizes of all the parsed preview rows and get estimated average
    const totalPreviewRowBytes = preview.firstRows.reduce((prevCount, row) => {
      const rowBytes = row.reduce((prev, item) => {
        return prev + countUTF8Bytes(item) + 1; // add a byte for separator or newline
      }, 0);

      return prevCount + rowBytes;
    }, 0);

    const averagePreviewRowSize =
      totalPreviewRowBytes / preview.firstRows.length;

    // divide file size by estimated row size (or fall back to a sensible amount)
    return averagePreviewRowSize > 1
      ? preview.file.size / averagePreviewRowSize
      : 100;
  }, [preview]);

  // notify on start of processing
  // (separate effect in case of errors)
  const onStartRef = useRef(onStart); // wrap in ref to avoid re-triggering (only first instance is needed)
  useEffect(() => {
    if (onStartRef.current) {
      onStartRef.current(importInfo);
    }
  }, [importInfo]);

  // notify on end of processing
  // (separate effect in case of errors)
  const onCompleteRef = useRef(onComplete); // wrap in ref to avoid re-triggering
  onCompleteRef.current = onComplete;
  useEffect(() => {
    if (isComplete && onCompleteRef.current) {
      onCompleteRef.current(importInfo);
    }
  }, [importInfo, isComplete]);

  // ensure status gets focus when complete, in case status role is not read out
  const statusRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if ((isComplete || error) && statusRef.current) {
      statusRef.current.focus();
    }
  }, [isComplete, error]);

  // perform main async parse
  const chunkSizeRef = useRef(chunkSize); // wrap in ref to avoid re-triggering
  const processChunkRef = useRef(processChunk); // wrap in ref to avoid re-triggering
  const asyncLockRef = useRef<number>(0);
  useEffect(() => {
    const oplock = asyncLockRef.current;

    processFile({
      file: preview.file,
      hasHeaders: preview.hasHeaders,
      fieldAssignments,
      reportProgress: (deltaCount) => {
        // ignore if stale
        if (oplock !== asyncLockRef.current) {
          return; // @todo signal abort
        }

        setProgressCount((prev) => prev + deltaCount);
      },
      callback: processChunkRef.current,
      chunkSize: chunkSizeRef.current,
      customConfig
    }).then(
      () => {
        // ignore if stale
        if (oplock !== asyncLockRef.current) {
          return;
        }

        setIsComplete(true);
      },
      (error) => {
        // ignore if stale
        if (oplock !== asyncLockRef.current) {
          return;
        }

        setError(error);
      }
    );

    return () => {
      // invalidate current oplock on change or unmount
      asyncLockRef.current += 1;
    };
  }, [preview, fieldAssignments, customConfig]);

  // simulate asymptotic progress percentage
  const progressPercentage = useMemo(() => {
    if (isComplete) {
      return 100;
    }

    // inputs hand-picked so that correctly estimated total is about 75% of the bar
    const progressPower = 2.5 * (progressCount / estimatedRowCount);
    const progressLeft = 0.5 ** progressPower;

    // convert to .1 percent precision for smoother bar display
    return Math.floor(1000 - 1000 * progressLeft) / 10;
  }, [estimatedRowCount, progressCount, isComplete]);

  return (
    <ImporterFrame
      fileName={preview.file.name}
      subtitle="Import"
      error={error && (error.message || String(error))}
      secondaryDisabled={!isComplete || isDismissed}
      secondaryLabel={onRestart && onClose ? 'Upload More' : undefined}
      onSecondary={onRestart && onClose ? onRestart : undefined}
      nextDisabled={(!onClose && !onRestart) || !isComplete || isDismissed}
      nextLabel={!onClose && onRestart ? 'Upload More' : 'Finish'}
      onNext={() => {
        setIsDismissed(true);

        if (onClose) {
          onClose(importInfo);
        } else if (onRestart) {
          onRestart();
        }
      }}
    >
      <div className="CSVImporter_ProgressDisplay">
        {isComplete || error ? (
          <div
            className="CSVImporter_ProgressDisplay__status"
            role="status"
            tabIndex={-1}
            ref={statusRef}
          >
            {error ? 'Could not import' : 'Complete'}
          </div>
        ) : (
          <div
            className="CSVImporter_ProgressDisplay__status -pending"
            role="status"
          >
            Importing...
          </div>
        )}

        <div className="CSVImporter_ProgressDisplay__count" role="text">
          <var>Processed rows:</var> {progressCount}
        </div>

        <div className="CSVImporter_ProgressDisplay__progressBar">
          <div
            className="CSVImporter_ProgressDisplay__progressBarIndicator"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    </ImporterFrame>
  );
}
