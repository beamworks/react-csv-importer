import React from 'react';

import { FormatErrorMessage } from './FormatErrorMessage';

import './FormatRawPreview.scss';

const RAW_PREVIEW_SIZE = 500;

export const FormatRawPreview: React.FC<{
  chunk: string;
  warning?: Papa.ParseError;
  onCancelClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  // eslint-disable-next-line react/display-name
}> = React.memo(({ chunk, warning, onCancelClick }) => {
  const chunkSlice = chunk.slice(0, RAW_PREVIEW_SIZE);
  const chunkHasMore = chunk.length > RAW_PREVIEW_SIZE;

  return (
    <div className="FormatRawPreview">
      <div className="FormatRawPreview__scroll">
        <pre className="FormatRawPreview__pre">
          {chunkSlice}
          {chunkHasMore && <aside>...</aside>}
        </pre>
      </div>

      {warning ? (
        <FormatErrorMessage onCancelClick={onCancelClick}>
          {warning.message}: please check data formatting
        </FormatErrorMessage>
      ) : null}
    </div>
  );
});
