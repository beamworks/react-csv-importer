import React from 'react';

import './IconButton.scss';

export const IconButton: React.FC<{
  label: string;
  type: 'back' | 'forward' | 'replay' | 'arrowBack' | 'close';
  small?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}> = ({ type, label, small, disabled, onClick }) => {
  return (
    <button
      className="IconButton"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      data-small={!!small}
    >
      <span data-type={type} />
    </button>
  );
};
