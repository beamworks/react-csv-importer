import React, { useState } from 'react';
import { Story, Meta } from '@storybook/react';

import { ImporterProps } from './ImporterProps';
import { Importer, ImporterField } from './Importer';
import { deDE } from '../locale';

export default {
  title: 'Importer',
  component: Importer,
  parameters: {
    actions: { argTypesRegex: '^on.*|dataHandler' }
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

export const LocaleDE: Story<SampleImporterProps> = (
  args: SampleImporterProps
) => {
  return (
    <Importer {...args} locale={deDE}>
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

export const CustomWidth: Story<SampleImporterProps> = (
  args: SampleImporterProps
) => {
  return (
    <div style={{ width: '20rem' }}>
      <Importer {...args}>
        <ImporterField name="fieldA" label="Field A" />
        <ImporterField name="fieldB" label="Field B" optional />
      </Importer>
    </div>
  );
};

CustomWidth.args = {
  displayColumnPageSize: 2, // fewer columns for e.g. a narrower display
  displayFieldRowSize: 3 // fewer columns for e.g. a narrower display
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

const PresetSelector: React.FC<{
  children: (fieldContent: React.ReactNode) => React.ReactElement;
}> = ({ children }) => {
  const [selection, setSelection] = useState('Person');

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <select
          style={{ fontSize: '150%' }}
          value={selection}
          onChange={(event) => setSelection(event.target.value)}
        >
          <option>Person</option>
          <option>Car</option>
        </select>
      </div>

      {children(
        selection === 'Person' ? (
          <>
            <ImporterField name="person_name" label="Preset A: Person Name" />
            <ImporterField name="person_age" label="Preset A: Person Age" />
          </>
        ) : (
          <>
            <ImporterField name="car_make" label="Preset B: Car Make" />
            <ImporterField name="car_model" label="Preset B: Car Model" />
          </>
        )
      )}
    </div>
  );
};

export const ChooseFieldPresets: Story<SampleImporterProps> = (
  args: SampleImporterProps
) => {
  return (
    <PresetSelector>
      {(fields) => <Importer {...args}>{fields}</Importer>}
    </PresetSelector>
  );
};
