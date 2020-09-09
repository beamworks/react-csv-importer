import React, { useMemo, useRef, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { parsePreview, PreviewResults, PreviewInfo } from './parser';
import { ImporterFrame } from './ImporterFrame';
import { FormatRawPreview } from './FormatRawPreview';
import { FormatDataRowPreview } from './FormatDataRowPreview';
import { FormatErrorMessage } from './FormatErrorMessage';

const useStyles = makeStyles((theme) => ({
  headerToggle: {
    display: 'flex',
    alignItems: 'center',
    marginLeft: theme.spacing(3),
    marginTop: theme.spacing(-1),
    marginBottom: theme.spacing(-1),
    color: theme.palette.text.primary
  },
  mainResultBlock: {},
  mainPendingBlock: {
    display: 'flex',
    justifyContent: 'center',
    alignContent: 'center',
    padding: theme.spacing(4),
    color: theme.palette.text.secondary
  },
  mainPanelSummary: {
    // extra selector to override specificity
    '&[aria-expanded=true]': {
      minHeight: 0 // condensed appearance
    },

    '& > div:first-child': {
      margin: 0 // condensed appearance
    }
  }
}));

export const FormatPreview: React.FC<{
  file: File;
  currentPreview: PreviewInfo | null;
  onAccept: (preview: PreviewInfo) => void;
  onCancel: () => void;
}> = ({ file, currentPreview, onAccept, onCancel }) => {
  const styles = useStyles();

  const [preview, setPreview] = useState<PreviewResults | null>(
    () =>
      currentPreview && {
        parseError: undefined,
        ...currentPreview
      }
  );

  const [panelRawActive, setPanelRawActive] = useState<boolean>(false);
  const [panelDataActive, setPanelDataActive] = useState<boolean>(false);

  // perform async preview parse
  const asyncLockRef = useRef<number>(0);
  useEffect(() => {
    const oplock = asyncLockRef.current;

    parsePreview(file).then((results) => {
      // ignore if stale
      if (oplock !== asyncLockRef.current) {
        return;
      }

      // pre-open appropriate panel before rendering results
      setPanelRawActive(!results.parseError && !!results.parseWarning);
      setPanelDataActive(!results.parseError && !results.parseWarning);

      setPreview(results);
    });

    return () => {
      // invalidate current oplock on change or unmount
      asyncLockRef.current += 1;
    };
  }, [file]);

  const report = useMemo(() => {
    if (!preview) {
      return null;
    }

    if (preview.parseError) {
      return (
        <div className={styles.mainResultBlock}>
          <FormatErrorMessage onCancelClick={onCancel}>
            Import error: <b>{preview.parseError.message}</b>
          </FormatErrorMessage>
        </div>
      );
    }

    return (
      <div className={styles.mainResultBlock}>
        <Accordion
          expanded={panelRawActive}
          onChange={() => setPanelRawActive(!panelRawActive)}
        >
          <AccordionSummary
            className={styles.mainPanelSummary}
            expandIcon={<ExpandMoreIcon />}
          >
            <Typography variant="subtitle1" color="textSecondary">
              File Format
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormatRawPreview
              chunk={preview.firstChunk}
              warning={preview.parseWarning}
              onCancelClick={onCancel}
            />
          </AccordionDetails>
        </Accordion>

        {preview.parseWarning ? null : (
          <Accordion
            expanded={panelDataActive}
            onChange={() => setPanelDataActive(!panelDataActive)}
          >
            <AccordionSummary
              className={styles.mainPanelSummary}
              expandIcon={<ExpandMoreIcon />}
            >
              <Typography variant="subtitle1" color="textSecondary">
                Preview Import
              </Typography>

              <div
                className={styles.headerToggle}
                onClick={(event) => {
                  event.stopPropagation();
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      value={preview.hasHeaders}
                      onChange={() => {
                        setPreview((prev) =>
                          prev && !prev.parseError // appease type safety
                            ? {
                                ...prev,
                                hasHeaders: !prev.hasHeaders
                              }
                            : prev
                        );
                      }}
                    />
                  }
                  label="Data has headers"
                />
              </div>
            </AccordionSummary>
            <AccordionDetails>
              <FormatDataRowPreview
                hasHeaders={preview.hasHeaders}
                rows={preview.firstRows}
              />
            </AccordionDetails>
          </Accordion>
        )}
      </div>
    );
  }, [styles, preview, panelRawActive, panelDataActive, onCancel]);

  return (
    <ImporterFrame
      fileName={file.name}
      nextDisabled={!preview || !!preview.parseError || !!preview.parseWarning}
      onNext={() => {
        if (!preview || preview.parseError) {
          throw new Error('unexpected missing preview info');
        }

        onAccept(preview);
      }}
      onCancel={onCancel}
    >
      {report || (
        <div className={styles.mainPendingBlock}>Loading preview...</div>
      )}
    </ImporterFrame>
  );
};
