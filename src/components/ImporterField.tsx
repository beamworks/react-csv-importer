import React, { useMemo, useState, useEffect, useContext } from 'react';

import { ImporterFieldProps } from './ImporterProps';

export interface Field {
  name: string;
  label: string;
  isOptional: boolean;
}

// internal context for registering field definitions
type FieldDef = Field & { instanceId: symbol };
type FieldListSetter = (prev: FieldDef[]) => FieldDef[];

const FieldDefinitionContext = React.createContext<
  ((setter: FieldListSetter) => void) | null
>(null);

// internal helper to allow user code to provide field definitions
export function useFieldDefinitions(): [
  Field[],
  (content: React.ReactNode) => React.ReactElement
] {
  const [fields, setFields] = useState<FieldDef[]>([]);

  const userFieldContentWrapper = (content: React.ReactNode) => (
    <FieldDefinitionContext.Provider value={setFields}>
      {content}
    </FieldDefinitionContext.Provider>
  );

  return [fields, userFieldContentWrapper];
}

// defines a field to be filled from file column during import
export const ImporterField: React.FC<ImporterFieldProps> = ({
  name,
  label,
  optional
}) => {
  // make unique internal ID (this is never rendered in HTML and does not affect SSR)
  const instanceId = useMemo(() => Symbol('internal unique field ID'), []);
  const fieldSetter = useContext(FieldDefinitionContext);

  // update central list as needed
  useEffect(() => {
    if (!fieldSetter) {
      console.error('importer field must be a child of importer'); // @todo
      return;
    }

    fieldSetter((prev) => {
      const copy = [...prev];
      const existingIndex = copy.findIndex(
        (item) => item.instanceId === instanceId
      );

      // add or update the field definition instance in-place
      // (using internal field instance ID helps gracefully tolerate duplicates, renames, etc)
      const newField = {
        instanceId,
        name,
        label,
        isOptional: !!optional
      };
      if (existingIndex === -1) {
        copy.push(newField);
      } else {
        copy[existingIndex] = newField;
      }

      return copy;
    });
  }, [instanceId, fieldSetter, name, label, optional]);

  // on component unmount, remove this field from list by ID
  useEffect(() => {
    if (!fieldSetter) {
      console.error('importer field must be a child of importer'); // @todo
      return;
    }

    return () => {
      fieldSetter((prev) =>
        prev.filter((field) => field.instanceId !== instanceId)
      );
    };
  }, [instanceId, fieldSetter]);

  return null;
};
