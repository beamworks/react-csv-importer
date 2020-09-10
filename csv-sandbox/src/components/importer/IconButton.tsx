import React from 'react';

import './IconButton.scss';

export const IconButton: React.FC<{
  type: 'back' | 'replay' | 'arrowBack' | 'arrowForward';
  small?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}> = ({ type, small, disabled, onClick }) => {
  return (
    <button
      className="IconButton"
      disabled={disabled}
      onClick={onClick}
      data-small={!!small}
    >
      <span data-type={type} />
    </button>
  );
};
