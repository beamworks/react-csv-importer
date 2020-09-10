import React from 'react';

import './IconButton.scss';

export const IconButton: React.FC<{
  type: 'back';
  onClick?: () => void;
}> = ({ type, onClick }) => {
  return (
    <button className="IconButton" onClick={onClick}>
      <span data-type={type} />
    </button>
  );
};
