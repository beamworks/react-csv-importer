import React, { useState } from 'react';
import { VictoryTheme, VictoryChart, VictoryLine, VictoryAxis } from 'victory';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import InfoIcon from '@material-ui/icons/Info';
import { Importer, ImporterField } from 'react-csv-importer';

import { useAppSnackbar } from '../components/AppSnackbar';

export const ImportPage: React.FC = () => {
  const showSnack = useAppSnackbar();

  const [data, setData] = useState<{ i: number; a: number; b?: number }[]>([]);

  const dataHasSecondValue = data.length > 0 && data[0].b !== undefined;

  return (
    <div>
      <Paper>
        <Box display="flex" alignItems="center" px={2} py={1}>
          <Box display="flex" fontSize={48}>
            <InfoIcon color="secondary" fontSize="inherit" />
          </Box>
          <Box ml={2}>
            <Typography variant="body2">
              Upload any CSV file with one or two numeric columns: it will be
              graphed in a chart below
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Box mt={2}>
        <Importer<{ a: string; b: string }>
          chunkSize={150} // intentionally small chunk size for interactive display
          restartable
          onStart={({ file }) => {
            setData([]);
            showSnack(`Importing ${file.name}`);
          }}
          onComplete={({ file }) => {
            showSnack(`Finished importing ${file.name}`);
          }}
          processChunk={(rows) => {
            setData(
              (prev) =>
                [
                  ...prev,
                  ...rows.map((row, rowIndex) => ({
                    i:
                      (prev.length === 0 ? 0 : prev[prev.length - 1].i + 1) +
                      rowIndex,
                    a: parseInt(row.a, 10) || 0,
                    b:
                      row.b === undefined ? undefined : parseInt(row.b, 10) || 0
                  }))
                ].slice(-200) // limit total displayed
            );

            // artificial delay
            return new Promise((resolve) => setTimeout(resolve, 20));
          }}
        >
          <ImporterField name="a" label="Value A" />
          <ImporterField name="b" label="Value B" optional />
          <ImporterField name="snack" label="Snack Preference" optional />
        </Importer>
      </Box>

      {data.length > 0 && (
        <VictoryChart theme={VictoryTheme.material} width={800} height={150}>
          <VictoryLine data={data} x="i" y="a" />
          {dataHasSecondValue ? <VictoryLine data={data} x="i" y="b" /> : null}

          <VictoryAxis />
          <VictoryAxis dependentAxis domain={undefined} />
        </VictoryChart>
      )}
    </div>
  );
};
