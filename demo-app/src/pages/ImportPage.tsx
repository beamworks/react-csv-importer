import React from 'react';
import { VictoryTheme, VictoryChart, VictoryArea, VictoryAxis } from 'victory';
import Typography from '@material-ui/core/Typography';
import { Importer, ImporterField } from 'react-csv-importer';

const sampleData = [
  { x: 1, y: 2 },
  { x: 2, y: 3 },
  { x: 3, y: 5 },
  { x: 4, y: 4 },
  { x: 5, y: 7 }
];

export const ImportPage: React.FC = () => {
  return (
    <div>
      <VictoryChart theme={VictoryTheme.material} width={800} height={150}>
        <VictoryArea data={sampleData} />
        <VictoryAxis />
      </VictoryChart>

      <Typography variant="body1">Import interface page.</Typography>

      <Importer<{ country: string }>
        processChunk={(rows) => {
          console.log(rows);
          return new Promise((resolve) => setTimeout(resolve, 1500));
        }}
        onFinish={() => {
          console.log('dismissed!');
        }}
      >
        <ImporterField name="name" label="Name" />
        <ImporterField name="email" label="Email" />
        <ImporterField name="dob" label="DOB" />
        <ImporterField name="postalCode" label="Postal Code" />
        <ImporterField name="snack" label="Snack Preference" optional />
        <ImporterField name="country" label="Country" optional />
        <ImporterField name="bees" label="Bees?" />
      </Importer>
    </div>
  );
};
