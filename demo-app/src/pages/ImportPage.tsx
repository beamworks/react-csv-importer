import React, { useState } from 'react';
import {
  VictoryTheme,
  VictoryChart,
  VictoryStack,
  VictoryArea,
  VictoryAxis
} from 'victory';
import Typography from '@material-ui/core/Typography';
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

      <Typography variant="body1">Import interface page.</Typography>

      <Importer<{ a: string; b: string }>
        processChunk={(rows) => {
          setData((prev) => [
            ...prev,
            ...rows.map((row, rowIndex) => ({
              i: prev.length + rowIndex,
              a: parseInt(row.a, 10) || 0,
              b: parseInt(row.b, 10) || 0
            }))
          ]);
          return new Promise((resolve) => setTimeout(resolve, 1500));
        }}
        onFinish={() => {
          console.log('dismissed!');
        }}
      >
        <ImporterField name="a" label="Value A" />
        <ImporterField name="b" label="Value B" />
        <ImporterField name="snack" label="Snack Preference" optional />
      </Importer>
    </div>
  );
};
