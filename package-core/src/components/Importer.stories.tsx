import React from 'react';
import { Story, Meta } from '@storybook/react';

import { ImporterProps } from './ImporterProps';
import { Importer, ImporterField } from './Importer';

export default {
  title: 'Importer',
  component: Importer,
  parameters: { actions: { argTypesRegex: '^on.*' } }
} as Meta;

type SampleImporterProps = ImporterProps<{ fieldA: string }>;

export const Main: Story<SampleImporterProps> = (args: SampleImporterProps) => {
  return (
    <Importer {...args}>
      <ImporterField name="fieldA" label="Field A" />
      <ImporterField name="fieldB" label="Field B" optional />
    </Importer>
  );
};

export const Timesheet: Story<SampleImporterProps> = (
  args: SampleImporterProps
) => {
  return (
    <Importer {...args}>
      <ImporterField name="date" label="Date" />
      <ImporterField name="clientName" label="Client" />
      <ImporterField name="projectName" label="Project" />
      <ImporterField name="projectCode" label="Project Code" optional />
      <ImporterField name="taskName" label="Task" />
      <ImporterField name="notes" label="Notes" optional />
    </Importer>
  );
};
