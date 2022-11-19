import React, { useCallback, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useLocale } from '../../locale/LocaleContext';

import './FileSelector.scss';

export const FileSelector: React.FC<{
  onSelected: (file: File) => void
}> = ({
  onSelected
}) => {
    const onSelectedRef = useRef(onSelected);
    onSelectedRef.current = onSelected;
    const [unsupportedFileFormat, setUnsupportedFileFormat] = useState(false)
    const supportedFileFormats = ["text/csv", "text/plain"]

    const dropHandler = useCallback((acceptedFiles: File[]) => {
      // silently ignore if nothing to do
      if (acceptedFiles.length < 1) {
        return;
      }

      const file = acceptedFiles[0];
      if (!supportedFileFormats.includes(file.type)) return setUnsupportedFileFormat(true)
      onSelectedRef.current(file);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop: dropHandler
    });

    const l10n = useLocale('fileStep');

    const errorBlock = () => {
      return (
        <div className="CSVImporter_FileSelector--error">
          {l10n.unsupportedFileFormatError}. {l10n.activeDragDropPrompt}
        </div>
      )
    }

    return (
      <div
        className="CSVImporter_FileSelector"
        data-active={!!isDragActive}
        {...getRootProps()}
      >
        <input {...getInputProps()} />

        {isDragActive ? (
          <span>
            {
              unsupportedFileFormat ?
                errorBlock() :
                l10n.activeDragDropPrompt
            }
          </span>
        ) : (
          <span>
            {
              unsupportedFileFormat ?
                errorBlock() :
                l10n.initialDragDropPrompt
            }
          </span>
        )}
      </div>
    );
  };
