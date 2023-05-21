import React, { useState, useEffect, useMemo, useRef } from 'react';

import { processFile, ParseCallback, BaseRow } from '../parser';
import { FileStepState } from './file-step/FileStep';
import { FieldsStepState } from './fields-step/FieldsStep';
import { ImporterFilePreview, ImportInfo } from './ImporterProps';
import { ImporterFrame } from './ImporterFrame';

import './ProgressDisplay.scss';
import { useLocale } from '../locale/LocaleContext';

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
  fileState,
  fieldsState,
  externalPreview,
  dataHandler,
  onStart,
  onComplete,
  onRestart,
  onClose
}: React.PropsWithChildren<{
  fileState: FileStepState;
  fieldsState: FieldsStepState;
  externalPreview: ImporterFilePreview;
  dataHandler: ParseCallback<Row>;
  onStart?: (info: ImportInfo) => void;
  onComplete?: (info: ImportInfo) => void;
  onRestart?: () => void;
  onClose?: (info: ImportInfo) => void;
}>): React.ReactElement {
  const [progressCount, setProgressCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isDismissed, setIsDismissed] = useState(false); // prevents double-clicking finish

  // info object exposed to the progress callbacks
  const importInfo = useMemo<ImportInfo>(() => {
    const fieldList = Object.keys(fieldsState.fieldAssignments);

    const columnSparseList: (string | undefined)[] = [];
    fieldList.forEach((field) => {
      const col = fieldsState.fieldAssignments[field];
      if (col !== undefined) {
        columnSparseList[col] = field;
      }
    });

    return {
      file: fileState.file,
      preview: externalPreview,
      fields: fieldList,
      columnFields: [...columnSparseList]
    };
  }, [fileState, fieldsState, externalPreview]);

  // estimate number of rows
  const estimatedRowCount = useMemo(() => {
    // sum up sizes of all the parsed preview rows and get estimated average
    const totalPreviewRowBytes = fileState.firstRows.reduce(
      (prevCount, row) => {
        const rowBytes = row.reduce((prev, item) => {
          return prev + countUTF8Bytes(item) + 1; // add a byte for separator or newline
        }, 0);

        return prevCount + rowBytes;
      },
      0
    );

    const averagePreviewRowSize =
      totalPreviewRowBytes / fileState.firstRows.length;

    // divide file size by estimated row size (or fall back to a sensible amount)
    return averagePreviewRowSize > 1
      ? fileState.file.size / averagePreviewRowSize
      : 100;
  }, [fileState]);

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

  // trigger processing from an effect to mitigate React 18 double-run in dev
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
  }, []);

  // perform main async parse
  const dataHandlerRef = useRef(dataHandler); // wrap in ref to avoid re-triggering
  const asyncLockRef = useRef<number>(0);
  useEffect(() => {
    // avoid running on first render due to React 18 double-run
    if (!ready) {
      return;
    }

    const oplock = asyncLockRef.current;

    processFile(
      { ...fileState, fieldAssignments: fieldsState.fieldAssignments },
      (deltaCount) => {
        // ignore if stale
        if (oplock !== asyncLockRef.current) {
          return; // @todo signal abort
        }

        setProgressCount((prev) => prev + deltaCount);
      },
      dataHandlerRef.current
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
  }, [ready, fileState, fieldsState]);

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

  const l10n = useLocale('progressStep');

  return (
    <ImporterFrame
      fileName={fileState.file.name}
      subtitle={l10n.stepSubtitle}
      error={error && (error.message || String(error))}
      secondaryDisabled={!isComplete || isDismissed}
      secondaryLabel={onRestart && onClose ? l10n.uploadMoreButton : undefined}
      onSecondary={onRestart && onClose ? onRestart : undefined}
      nextDisabled={!isComplete || isDismissed}
      nextLabel={
        !!(onClose || onRestart) &&
        (onClose ? l10n.finishButton : l10n.uploadMoreButton)
      }
      onNext={() => {
        if (onClose) {
          setIsDismissed(true);
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
            {error ? l10n.statusError : l10n.statusComplete}
          </div>
        ) : (
          <div
            className="CSVImporter_ProgressDisplay__status -pending"
            role="status"
          >
            {l10n.statusPending}
          </div>
        )}

        <div className="CSVImporter_ProgressDisplay__count" role="text">
          <var>{l10n.processedRowsLabel}</var> {progressCount}
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
