import React from 'react';
import { Story, Meta } from '@storybook/react';

import { ImporterProps } from './ImporterProps';
import { Importer, ImporterField } from './Importer';

export default {
  title: 'Importer',
  component: Importer,
  parameters: {
    actions: { argTypesRegex: '^on.*|processChunk' }
  }
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

export const CustomDelimiterConfig: Story<SampleImporterProps> = (
  args: SampleImporterProps
) => {
  return (
    <Importer {...args}>
      <ImporterField name="fieldA" label="Field A" />
      <ImporterField name="fieldB" label="Field B" />
    </Importer>
  );
};

CustomDelimiterConfig.args = {
  delimiter: '!' // use a truly unusual delimiter that PapaParse would not guess normally
};

export const InsideScrolledPage: Story<SampleImporterProps> = (
  args: SampleImporterProps
) => {
  return (
    <div>
      Scroll below
      <div style={{ paddingTop: '120vh' }}></div>
      <Importer {...args}>
        <ImporterField name="fieldA" label="Field A" />
        <ImporterField name="fieldB" label="Field B" optional />
      </Importer>
    </div>
  );
};

export const RenderProp: Story<SampleImporterProps> = (
  args: SampleImporterProps
) => {
  return (
    <Importer {...args}>
      {({ preview }) => {
        return (
          <>
            <ImporterField name="coreFieldA" label="Field A" />
            <ImporterField name="coreFieldB" label="Field B" />

            {preview &&
              preview.columns.map(({ header, index }) =>
                header ? (
                  <ImporterField
                    key={index}
                    name={`uploaded_${header}`}
                    label={`Field ${header}`}
                  />
                ) : null
              )}
          </>
        );
      }}
    </Importer>
  );
};
