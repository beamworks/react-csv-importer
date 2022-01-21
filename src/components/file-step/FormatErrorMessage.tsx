import React from 'react';

import { TextButton } from '../TextButton';

import './FormatErrorMessage.scss';
import { useLocale } from '../../locale/LocaleContext';

export const FormatErrorMessage: React.FC<{
  onCancelClick: () => void;
  // eslint-disable-next-line react/display-name
}> = React.memo(({ onCancelClick, children }) => {
  const { backText } = useLocale('FormatErrorMessage');
  return (
    <div className="CSVImporter_FormatErrorMessage">
      <span>{children}</span>
      <TextButton onClick={onCancelClick}>{backText}</TextButton>
    </div>
  );
});
