import React, { useState, useEffect, useMemo, useRef } from 'react';

import { ImportInfo, ParseCallback, BaseRow } from '../exports';
import { processFile, PreviewInfo, FieldAssignmentMap } from './parser';
import { ImporterFrame } from './ImporterFrame';

const estimatedTotal = 100; // @todo compute based on file size

export function ProgressDisplay<Row extends BaseRow>({
  preview,
  chunkSize,
  fieldAssignments,
  processChunk,
  onStart,
  onComplete,
  onRestart,
  onClose
}: React.PropsWithChildren<{
  preview: PreviewInfo;
  chunkSize?: number;
  fieldAssignments: FieldAssignmentMap;
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
    return {
      file: preview.file,
      fields: Object.keys(fieldAssignments)
    };
  }, [preview, fieldAssignments]);

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

    processFile(
      preview.file,
      preview.hasHeaders,
      fieldAssignments,
      (deltaCount) => {
        // ignore if stale
        if (oplock !== asyncLockRef.current) {
          return; // @todo signal abort
        }

        setProgressCount((prev) => prev + deltaCount);
      },
      processChunkRef.current,
      chunkSizeRef.current
    ).then(
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
  }, [preview, fieldAssignments]);

  // simulate asymptotic progress percentage
  const progressPercentage = useMemo(() => {
    if (isComplete) {
      return 100;
    }

    // inputs hand-picked so that correctly estimated total is about 65% of the bar
    // @todo tweak to be at ~80%?
    const progressPower = 1.5 * (progressCount / estimatedTotal);
    const progressLeft = 0.5 ** progressPower;

    // convert to .1 percent precision for smoother bar display
    return Math.floor(1000 - 1000 * progressLeft) / 10;
  }, [progressCount, isComplete]);

  return (
    <ImporterFrame
      fileName={preview.file.name}
      subtitle="Import"
      error={error && (error.message || error.toString())}
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
