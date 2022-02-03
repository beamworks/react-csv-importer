import React, { useMemo, useRef, useEffect, useState } from 'react';

import {
  parsePreview,
  PreviewResults,
  Preview,
  CustomizablePapaParseConfig
} from '../../parser';
import { ImporterFrame } from '../ImporterFrame';
import { FileSelector } from './FileSelector';
import { FormatRawPreview } from './FormatRawPreview';
import { FormatDataRowPreview } from './FormatDataRowPreview';
import { FormatErrorMessage } from './FormatErrorMessage';

import './FileStep.scss';

export const FileStep: React.FC<{
  customConfig: CustomizablePapaParseConfig;
  assumeNoHeaders?: boolean;
  currentPreview: Preview | null;
  onChange: (preview: Preview | null) => void;
  onAccept: () => void;
}> = ({
  customConfig,
  assumeNoHeaders,
  currentPreview,
  onChange,
  onAccept
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(() =>
    currentPreview ? currentPreview.file : null
  );

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
    // clear other state when file selector is reset
    if (!selectedFile) {
      setPreview(null);
      return;
    }

    // preserve existing state when parsing for this file is already complete
    if (preview && preview.file === selectedFile) {
      return;
    }

    const oplock = asyncLockRef.current;

    // lock in the current PapaParse config instance for use in multiple spots
    const config = customConfigRef.current;

    // kick off the preview parse
    parsePreview(selectedFile, config).then((results) => {
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
  }, [selectedFile, preview]);

  // clear selected file
  // preview result content to display
  const reportBlock = useMemo(() => {
    if (!preview) {
      return null;
    }

    if (preview.parseError) {
      return (
        <div className="CSVImporter_FileStep__mainResultBlock">
          <FormatErrorMessage onCancelClick={() => setSelectedFile(null)}>
            Import error:{' '}
            <b>{preview.parseError.message || String(preview.parseError)}</b>
          </FormatErrorMessage>
        </div>
      );
    }

    return (
      <div className="CSVImporter_FileStep__mainResultBlock">
        <div className="CSVImporter_FileStep__header">Raw File Contents</div>

        <FormatRawPreview
          chunk={preview.firstChunk}
          warning={preview.parseWarning}
          onCancelClick={() => setSelectedFile(null)}
        />

        {preview.parseWarning ? null : (
          <>
            <div className="CSVImporter_FileStep__header">
              Preview Import
              {!preview.isSingleLine && ( // hide setting if only one line anyway
                <label className="CSVImporter_FileStep__headerToggle">
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
  }, [preview, hasHeaders]);

  if (!selectedFile) {
    return <FileSelector onSelected={(file) => setSelectedFile(file)} />;
  }

  return (
    <ImporterFrame
      fileName={selectedFile.name}
      nextDisabled={!preview || !!preview.parseError || !!preview.parseWarning}
      onNext={() => {
        if (!preview || preview.parseError) {
          throw new Error('unexpected missing preview info');
        }

        onAccept();
      }}
      onCancel={() => setSelectedFile(null)}
    >
      {reportBlock || (
        <div className="CSVImporter_FileStep__mainPendingBlock">
          Loading preview...
        </div>
      )}
    </ImporterFrame>
  );
};
