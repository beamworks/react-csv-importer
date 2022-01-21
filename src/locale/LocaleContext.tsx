import React from 'react';
import { ImporterLocale, enUS } from '.';
import { useContext, useMemo } from 'react';

export const LocaleContext = React.createContext<ImporterLocale>(enUS);

type LocalizedComponentName = keyof ImporterLocale['components'];

export function useLocale<C extends LocalizedComponentName>(
  component: C
): ImporterLocale['components'][C] {
  const locale = useContext(LocaleContext);
  return useMemo(() => {
    return locale.components[component];
  }, [component, locale.components]);
}
