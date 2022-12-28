import React from 'react';

import './TextButton.scss';

export const TextButton: React.FC<{
  disabled?: boolean;
  onClick?: () => void;
}> = ({ disabled, onClick, children }) => {
  return (
    <button
      className="CSVImporter_TextButton"
      type="button" // avoid triggering form submit
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
