import React, { useMemo, useRef, useEffect, useState } from 'react';

import {
  parsePreview,
  PreviewResults,
  Preview,
  CustomizablePapaParseConfig
} from '../parser';
import { ImporterFrame } from './ImporterFrame';
import { FormatRawPreview } from './FormatRawPreview';
import { FormatDataRowPreview } from './FormatDataRowPreview';
import { FormatErrorMessage } from './FormatErrorMessage';

import './FormatPreview.scss';

export const FormatPreview: React.FC<{
  customConfig: CustomizablePapaParseConfig;
  file: File;
  assumeNoHeaders?: boolean;
  currentPreview: Preview | null;
  onChange: (preview: Preview | null) => void;
  onAccept: () => void;
  onCancel: () => void;
}> = ({
  customConfig,
  file,
  assumeNoHeaders,
  currentPreview,
  onChange,
  onAccept,
  onCancel
}) => {
  // augmented PreviewResults from parser
  const [preview, setPreview] = useState<PreviewResults | null>(
    () =>
      currentPreview && {
        parseError: undefined,
        ...currentPreview
      }
  );

  const [papaParseConfig, setPapaParseConfig] = useState(() =>
    currentPreview ? currentPreview.papaParseConfig : customConfig
  );

  const [hasHeaders, setHasHeaders] = useState(() =>
    currentPreview ? currentPreview.hasHeaders : false
  );

  // wrap in ref to avoid triggering effect
  const customConfigRef = useRef(customConfig);
  customConfigRef.current = customConfig;
  const assumeNoHeadersRef = useRef(assumeNoHeaders);
  assumeNoHeadersRef.current = assumeNoHeaders;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // notify of current state
  useEffect(() => {
    onChangeRef.current(
      preview && !preview.parseError
        ? { ...preview, papaParseConfig, hasHeaders }
        : null
    );
  }, [preview, papaParseConfig, hasHeaders]);

  // perform async preview parse once for the given file
  const asyncLockRef = useRef<number>(0);
  useEffect(() => {
    const oplock = asyncLockRef.current;

    // lock in the current PapaParse config instance for use in multiple spots
    const config = customConfigRef.current;

    // kick off the preview parse
    parsePreview(file, config).then((results) => {
      // ignore if stale
      if (oplock !== asyncLockRef.current) {
        return;
      }

      // save the results and the original config
      setPreview(results);
      setPapaParseConfig(config);

      // pre-fill headers flag (only possible with >1 lines)
      setHasHeaders(
        results.parseError
          ? false
          : !assumeNoHeadersRef.current && !results.isSingleLine
      );
    });

    return () => {
      // invalidate current oplock on change or unmount
      asyncLockRef.current += 1;
    };
  }, [file]);

  // preview result content to display
  const reportBlock = useMemo(() => {
    if (!preview) {
      return null;
    }

    if (preview.parseError) {
      return (
        <div className="CSVImporter_FormatPreview__mainResultBlock">
          <FormatErrorMessage onCancelClick={onCancel}>
            Import error:{' '}
            <b>{preview.parseError.message || String(preview.parseError)}</b>
          </FormatErrorMessage>
        </div>
      );
    }

    return (
      <div className="CSVImporter_FormatPreview__mainResultBlock">
        <div className="CSVImporter_FormatPreview__header">
          Raw File Contents
        </div>

        <FormatRawPreview
          chunk={preview.firstChunk}
          warning={preview.parseWarning}
          onCancelClick={onCancel}
        />

        {preview.parseWarning ? null : (
          <>
            <div className="CSVImporter_FormatPreview__header">
              Preview Import
              {!preview.isSingleLine && ( // hide setting if only one line anyway
                <label className="CSVImporter_FormatPreview__headerToggle">
                  <input
                    type="checkbox"
                    checked={hasHeaders}
                    onChange={() => {
                      setHasHeaders((prev) => !prev);
                    }}
                  />
                  <span>Data has headers</span>
                </label>
              )}
            </div>
            <FormatDataRowPreview
              hasHeaders={hasHeaders}
              rows={preview.firstRows}
            />
          </>
        )}
      </div>
    );
  }, [preview, hasHeaders, onCancel]);

  return (
    <ImporterFrame
      fileName={file.name}
      nextDisabled={!preview || !!preview.parseError || !!preview.parseWarning}
      onNext={() => {
        if (!preview || preview.parseError) {
          throw new Error('unexpected missing preview info');
        }

        onAccept();
      }}
      onCancel={onCancel}
    >
      {reportBlock || (
        <div className="CSVImporter_FormatPreview__mainPendingBlock">
          Loading preview...
        </div>
      )}
    </ImporterFrame>
  );
};
