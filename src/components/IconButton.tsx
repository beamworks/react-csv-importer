import React from 'react';

import './IconButton.scss';

export const IconButton: React.FC<{
  label: string;
  type: 'back' | 'forward' | 'replay' | 'arrowBack' | 'close';
  small?: boolean;
  focusOnly?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}> = ({ type, label, small, focusOnly, disabled, onClick }) => {
  return (
    <button
      className="CSVImporter_IconButton"
      type="button" // avoid triggering form submit
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      data-small={!!small}
      data-focus-only={!!focusOnly}
    >
      <span data-type={type} />
    </button>
  );
};
