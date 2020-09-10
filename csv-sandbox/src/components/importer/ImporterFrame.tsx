import React from 'react';

import { TextButton } from './TextButton';
import { IconButton } from './IconButton';

import './ImporterFrame.scss';

export const ImporterFrame: React.FC<{
  fileName: string;
  subtitle?: string; // @todo allow multiple crumbs
  nextDisabled?: boolean;
  nextLabel?: string;
  error?: string | null;
  onNext: () => void;
  onCancel?: () => void;
}> = ({
  fileName,
  subtitle,
  nextDisabled,
  nextLabel,
  error,
  onNext,
  onCancel,
  children
}) => {
  return (
    <div className="ImporterFrame">
      <div className="ImporterFrame__header">
        <IconButton type="arrowBack" disabled={!onCancel} onClick={onCancel} />

        <div className="ImporterFrame__headerTitle">{fileName}</div>

        {subtitle ? (
          <>
            <div className="ImporterFrame__headerCrumbSeparator">
              <span />
            </div>
            <div className="ImporterFrame__headerSubtitle">{subtitle}</div>
          </>
        ) : null}
      </div>

      {children}

      <div className="ImporterFrame__footer">
        <div className="ImporterFrame__footerFill" />
        {error ? (
          <div className="ImporterFrame__footerError">{error}</div>
        ) : null}
        <TextButton disabled={!!nextDisabled} onClick={onNext}>
          {nextLabel || 'Next'}
        </TextButton>
      </div>
    </div>
  );
};
