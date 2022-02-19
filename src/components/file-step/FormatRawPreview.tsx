import React from 'react';
import { useLocale } from '../../locale/LocaleContext';

import { FormatErrorMessage } from './FormatErrorMessage';

import './FormatRawPreview.scss';

const RAW_PREVIEW_SIZE = 500;

export const FormatRawPreview: React.FC<{
  chunk: string;
  warning?: Papa.ParseError;
  onCancelClick: () => void;
  // eslint-disable-next-line react/display-name
}> = React.memo(({ chunk, warning, onCancelClick }) => {
  const chunkSlice = chunk.slice(0, RAW_PREVIEW_SIZE);
  const chunkHasMore = chunk.length > RAW_PREVIEW_SIZE;

  const l10n = useLocale('fileStep');

  return (
    <div className="CSVImporter_FormatRawPreview">
      <div className="CSVImporter_FormatRawPreview__scroll">
        <pre className="CSVImporter_FormatRawPreview__pre">
          {chunkSlice}
          {chunkHasMore && <aside>...</aside>}
        </pre>
      </div>

      {warning ? (
        <FormatErrorMessage onCancelClick={onCancelClick}>
          {l10n.getDataFormatError(warning.message || String(warning))}
        </FormatErrorMessage>
      ) : null}
    </div>
  );
});
