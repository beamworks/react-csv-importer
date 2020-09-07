import React, { useState, useEffect, useMemo, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import LinearProgress from '@material-ui/core/LinearProgress';

import {
  processFile,
  PreviewInfo,
  FieldAssignmentMap,
  ParseCallback,
  BaseRow
} from './parser';
import { ImporterFrame } from './ImporterFrame';

const useStyles = makeStyles((theme) => ({
  progressFrame: {
    padding: theme.spacing(4)
  }
}));

const estimatedTotal = 100; // @todo compute based on file size

export function ProgressDisplay<Row extends BaseRow>({
  preview,
  fieldAssignments,
  callback
}: React.PropsWithChildren<{
  preview: PreviewInfo;
  fieldAssignments: FieldAssignmentMap;
  callback: ParseCallback<Row>;
}>) {
  const styles = useStyles();

  const [progressCount, setProgressCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // perform main async parse
  const asyncLockRef = useRef<number>(0);
  useEffect(() => {
    const oplock = asyncLockRef.current;

    processFile(
      preview.file,
      fieldAssignments,
      (deltaCount) => {
        // ignore if stale
        if (oplock !== asyncLockRef.current) {
          return; // @todo signal abort
        }

        setProgressCount((prev) => prev + deltaCount);
      },
      callback
    ).then(() => {
      // ignore if stale
      if (oplock !== asyncLockRef.current) {
        return;
      }

      setIsComplete(true);
    });

    return () => {
      // invalidate current oplock on change or unmount
      asyncLockRef.current += 1;
    };
  }, [preview, fieldAssignments]);

  // simulate asymptotic progress percentage
  const progressPercentage = useMemo(() => {
    if (isComplete) {
      return 100;
    }

    // inputs hand-picked so that correctly estimated total is about 65% of the bar
    // @todo tweak to be at ~80%?
    const progressPower = 1.5 * (progressCount / estimatedTotal);
    const progressLeft = 0.5 ** progressPower;

    // convert to .1 percent precision for smoother bar display
    return Math.floor(1000 - 1000 * progressLeft) / 10;
  }, [progressCount, isComplete]);

  return (
    <ImporterFrame
      fileName={preview.file.name}
      subtitle="Progress"
      nextDisabled={!isComplete}
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
}
