import React, { useState } from 'react';
import {
  VictoryTheme,
  VictoryChart,
  VictoryStack,
  VictoryArea,
  VictoryAxis
} from 'victory';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import InfoIcon from '@material-ui/icons/Info';
import { Importer, ImporterField } from 'react-csv-importer';

export const ImportPage: React.FC = () => {
  const [data, setData] = useState<{ i: number; a: number; b: number }[]>([]);

  return (
    <div>
      <VictoryChart theme={VictoryTheme.material} width={800} height={150}>
        <VictoryStack>
          <VictoryArea data={data} x="i" y="a" />
          <VictoryArea data={data} x="i" y="b" />
        </VictoryStack>
        <VictoryAxis />
      </VictoryChart>

      <Paper>
        <Box display="flex" alignItems="center" px={2} py={1}>
          <Box display="flex" fontSize={48}>
            <InfoIcon color="secondary" fontSize="inherit" />
          </Box>
          <Box ml={2}>
            <Typography variant="body2">
              Upload any CSV file with one or two numeric columns: it will be
              graphed on the above chart.
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Box mt={2}>
        <Importer<{ a: string; b: string }>
          chunkSize={150} // intentionally small chunk size for interactive display
          onStart={() => {
            setData([]);
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
                    b: row.b === undefined ? 0 : parseInt(row.b, 10) || 0
                  }))
                ].slice(-200) // limit total displayed
            );

            // artificial delay
            return new Promise((resolve) => setTimeout(resolve, 100));
          }}
        >
          <ImporterField name="a" label="Value A" />
          <ImporterField name="b" label="Value B" optional />
          <ImporterField name="snack" label="Snack Preference" optional />
        </Importer>
      </Box>
    </div>
  );
};
