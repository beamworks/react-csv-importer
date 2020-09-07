import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { PreviewInfo } from './FormatPreview';
import { ImporterFrame } from './ImporterFrame';

const useStyles = makeStyles((theme) => ({}));

export const ProgressDisplay: React.FC<{
  preview: PreviewInfo;
  onCancel: () => void;
}> = ({ preview, onCancel }) => {
  const styles = useStyles();

  return (
    <ImporterFrame
      fileName={preview.file.name}
      subtitle="Progress"
      onCancel={onCancel}
      onNext={() => {
        // @todo
      }}
    >
      Please wait...
    </ImporterFrame>
  );
};
