import React, { useMemo, useRef, useEffect, useState } from 'react';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';

import { parsePreview, PreviewResults, PreviewInfo } from './parser';
import { ImporterFrame } from './ImporterFrame';
import { FormatRawPreview } from './FormatRawPreview';
import { FormatDataRowPreview } from './FormatDataRowPreview';
import { FormatErrorMessage } from './FormatErrorMessage';

import './FormatPreview.scss';

export const FormatPreview: React.FC<{
  file: File;
  currentPreview: PreviewInfo | null;
  onAccept: (preview: PreviewInfo) => void;
  onCancel: () => void;
}> = ({ file, currentPreview, onAccept, onCancel }) => {
  const [preview, setPreview] = useState<PreviewResults | null>(
    () =>
      currentPreview && {
        parseError: undefined,
        ...currentPreview
      }
  );

  // perform async preview parse
  const asyncLockRef = useRef<number>(0);
  useEffect(() => {
    const oplock = asyncLockRef.current;

    parsePreview(file).then((results) => {
      // ignore if stale
      if (oplock !== asyncLockRef.current) {
        return;
      }

      setPreview(results);
    });

    return () => {
      // invalidate current oplock on change or unmount
      asyncLockRef.current += 1;
    };
  }, [file]);

  const report = useMemo(() => {
    if (!preview) {
      return null;
    }

    if (preview.parseError) {
      return (
        <div className="FormatPreview__mainResultBlock">
          <FormatErrorMessage onCancelClick={onCancel}>
            Import error: <b>{preview.parseError.message}</b>
          </FormatErrorMessage>
        </div>
      );
    }

    return (
      <div className="FormatPreview__mainResultBlock">
        <div className="FormatPreview__header">File Format</div>

        <FormatRawPreview
          chunk={preview.firstChunk}
          warning={preview.parseWarning}
          onCancelClick={onCancel}
        />

        {preview.parseWarning ? null : (
          <>
            <div className="FormatPreview__header">
              Preview Import
              <div
                className="FormatPreview__headerToggle"
                onClick={(event) => {
                  event.stopPropagation();
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      value={preview.hasHeaders}
                      onChange={() => {
                        setPreview((prev) =>
                          prev && !prev.parseError // appease type safety
                            ? {
                                ...prev,
                                hasHeaders: !prev.hasHeaders
                              }
                            : prev
                        );
                      }}
                    />
                  }
                  label="Data has headers"
                />
              </div>
            </div>
            <FormatDataRowPreview
              hasHeaders={preview.hasHeaders}
              rows={preview.firstRows}
            />
          </>
        )}
      </div>
    );
  }, [preview, onCancel]);

  return (
    <ImporterFrame
      fileName={file.name}
      nextDisabled={!preview || !!preview.parseError || !!preview.parseWarning}
      onNext={() => {
        if (!preview || preview.parseError) {
          throw new Error('unexpected missing preview info');
        }

        onAccept(preview);
      }}
      onCancel={onCancel}
    >
      {report || (
        <div className="FormatPreview__mainPendingBlock">
          Loading preview...
        </div>
      )}
    </ImporterFrame>
  );
};
