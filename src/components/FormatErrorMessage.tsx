import React from 'react';

import { TextButton } from './TextButton';

import './FormatErrorMessage.scss';

export const FormatErrorMessage: React.FC<{
  onCancelClick: () => void;
  // eslint-disable-next-line react/display-name
}> = React.memo(({ onCancelClick, children }) => {
  return (
    <div className="CSVImporter_FormatErrorMessage">
      <span>{children}</span>
      <TextButton onClick={onCancelClick}>Go Back</TextButton>
    </div>
  );
});
