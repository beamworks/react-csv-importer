import React, { useState, useEffect, useMemo } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import LinearProgress from '@material-ui/core/LinearProgress';

import { PreviewInfo } from './FormatPreview';
import { ImporterFrame } from './ImporterFrame';

const useStyles = makeStyles((theme) => ({
  progressFrame: {
    padding: theme.spacing(4)
  }
}));

const estimatedTotal = 100;

export const ProgressDisplay: React.FC<{
  preview: PreviewInfo;
}> = ({ preview }) => {
  const styles = useStyles();

  const [progressCount, setProgressCount] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setProgressCount((prev) => prev + 10);
    }, 400);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // simulate asymptotic progress percentage
  const progressPercentage = useMemo(() => {
    // inputs hand-picked so that correctly estimated total is about 65% of the bar
    const progressPower = 1.5 * (progressCount / estimatedTotal);
    const progressLeft = 0.5 ** progressPower;

    // convert to .1 percent precision for smoother bar display
    return Math.floor(1000 - 1000 * progressLeft) / 10;
  }, [progressCount]);

  return (
    <ImporterFrame
      fileName={preview.file.name}
      subtitle="Progress"
      nextDisabled
      nextLabel="Finish"
      onNext={() => {
        // @todo
      }}
    >
      <div className={styles.progressFrame}>
        <Typography variant="body2" color="textSecondary" align="right">
          {progressCount}
        </Typography>
        <LinearProgress variant="determinate" value={progressPercentage} />
      </div>
    </ImporterFrame>
  );
};
