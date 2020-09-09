import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import TableContainer from '@material-ui/core/TableContainer';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';

const useStyles = makeStyles((theme) => ({
  tableCell: {
    fontSize: '0.75em',
    lineHeight: 1,
    whiteSpace: 'nowrap',

    '&[data-head=true]': {
      fontStyle: 'italic',
      color: theme.palette.text.secondary
    }
  }
}));

export const FormatDataRowPreview: React.FC<{
  hasHeaders: boolean;
  rows: string[][];
  // eslint-disable-next-line react/display-name
}> = React.memo(({ hasHeaders, rows }) => {
  const styles = useStyles();

  const headerRow = hasHeaders ? rows[0] : null;
  const bodyRows = hasHeaders ? rows.slice(1) : rows;

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        {headerRow && (
          <TableHead>
            <TableRow>
              {headerRow.map((item, itemIndex) => (
                <TableCell
                  key={itemIndex}
                  className={styles.tableCell}
                  data-head="true"
                >
                  {item}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
        )}

        <TableBody>
          {bodyRows.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {row.map((item, itemIndex) => (
                <TableCell key={itemIndex} className={styles.tableCell}>
                  {item}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
});
