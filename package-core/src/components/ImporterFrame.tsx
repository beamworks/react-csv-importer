import React, { useRef, useEffect } from 'react';

import { TextButton } from './TextButton';
import { IconButton } from './IconButton';

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
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (subtitleRef.current) {
      subtitleRef.current.focus();
    } else if (titleRef.current) {
      titleRef.current.focus();
    }
  }, []);

  return (
    <div className="CSVImporter_ImporterFrame">
      <div className="CSVImporter_ImporterFrame__header">
        <IconButton
          label="Go to previous step"
          type="arrowBack"
          disabled={!onCancel}
          onClick={onCancel}
        />

        <div
          className="CSVImporter_ImporterFrame__headerTitle"
          tabIndex={-1}
          ref={titleRef}
        >
          {fileName}
        </div>

        {subtitle ? (
          <>
            <div className="CSVImporter_ImporterFrame__headerCrumbSeparator">
              <span />
            </div>
            <div
              className="CSVImporter_ImporterFrame__headerSubtitle"
              tabIndex={-1}
              ref={subtitleRef}
            >
              {subtitle}
            </div>
          </>
        ) : null}
      </div>

      {children}

      <div className="CSVImporter_ImporterFrame__footer">
        <div className="CSVImporter_ImporterFrame__footerFill" />
        {error ? (
          <div className="CSVImporter_ImporterFrame__footerError" role="status">
            {error}
          </div>
        ) : null}
        <TextButton disabled={!!nextDisabled} onClick={onNext}>
          {nextLabel || 'Next'}
        </TextButton>
      </div>
    </div>
  );
};
