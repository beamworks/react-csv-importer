import React from 'react';
import Button from '@material-ui/core/Button';

import './FormatErrorMessage.scss';

export const FormatErrorMessage: React.FC<{
  onCancelClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  // eslint-disable-next-line react/display-name
}> = React.memo(({ onCancelClick, children }) => {
  return (
    <div className="FormatErrorMessage">
      <span>{children}</span>
      <Button size="small" variant="contained" onClick={onCancelClick}>
        Go Back
      </Button>
    </div>
  );
});
