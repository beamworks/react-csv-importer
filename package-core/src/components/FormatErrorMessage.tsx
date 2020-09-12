import React from 'react';

import { TextButton } from './TextButton';

export const FormatErrorMessage: React.FC<{
  onCancelClick: () => void;
  // eslint-disable-next-line react/display-name
}> = React.memo(({ onCancelClick, children }) => {
  return (
    <div className="FormatErrorMessage">
      <span>{children}</span>
      <TextButton onClick={onCancelClick}>Go Back</TextButton>
    </div>
  );
});
