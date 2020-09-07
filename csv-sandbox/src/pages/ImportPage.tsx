import React from 'react';

import { Importer, ImporterField } from '../components/importer/Importer';

export const ImportPage: React.FC = () => {
  return (
    <div>
      <p>Import interface page.</p>

      <Importer<{ country: string }>
        callback={(rows) => {
          console.log(rows);
          return new Promise((resolve) => setTimeout(resolve, 1500));
        }}
      >
        <ImporterField name="name" label="Name" />
        <ImporterField name="email" label="Email" />
        <ImporterField name="dob" label="DOB" />
        <ImporterField name="postalCode" label="Postal Code" />
        <ImporterField name="snack" label="Snack Preference" />
        <ImporterField name="country" label="Country" />
        <ImporterField name="bees" label="Bees?" />
      </Importer>
    </div>
  );
};
