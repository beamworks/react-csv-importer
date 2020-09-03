import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

import { PreviewInfo } from './FormatPreview';

const fields = [
  { label: 'Name' },
  { label: 'Email' },
  { label: 'DOB' },
  { label: 'Postal Code' },
  { label: 'Snack Preference' },
  { label: 'Country' },
  { label: 'Bees?' }
];

const useStyles = makeStyles((theme) => ({
  mainHeader: {
    display: 'flex',
    alignItems: 'center'
    // margin: -theme.spacing(2)
  },
  fieldChip: {
    display: 'inline-block',
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1),
    width: 200
  },
  fieldChipPaper: {
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`
  },
  columnChip: {
    display: 'inline-block',
    marginRight: theme.spacing(1),
    marginTop: theme.spacing(1),
    width: 200
  },
  columnChipPaper: {
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`
  },
  columnLabel: {
    display: 'inline-block',
    marginTop: theme.spacing(1),
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.text.primary
  },
  columnTargetPaper: {
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
    background: theme.palette.grey.A100
  }
}));

export const ColumnPicker: React.FC<{ preview: PreviewInfo }> = ({
  preview
}) => {
  const styles = useStyles();

  const firstRow = preview.firstRows[0];

  return (
    <Card variant="outlined">
      <CardContent>
        <div className={styles.mainHeader}>
          <Typography variant="subtitle1" color="textPrimary" noWrap>
            Choose Columns
          </Typography>
        </div>

        <div>
          {fields.map((field, fieldIndex) => {
            return (
              <div className={styles.fieldChip} key={fieldIndex}>
                <Paper className={styles.fieldChipPaper}>{field.label}</Paper>
              </div>
            );
          })}
        </div>

        <Divider />

        <div>
          {firstRow.map((column, columnIndex) => {
            return (
              <div className={styles.columnChip} key={columnIndex}>
                <Paper className={styles.columnChipPaper} variant="outlined">
                  <Paper
                    className={styles.columnTargetPaper}
                    variant="outlined"
                  >
                    --
                  </Paper>

                  <div className={styles.columnLabel}>Col {columnIndex}</div>
                </Paper>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
