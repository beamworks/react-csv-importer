import React from 'react';
import Typography from '@material-ui/core/Typography';
import { Importer, ImporterField } from 'react-csv-importer';

export const ImportPage: React.FC = () => {
  return (
    <div>
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
