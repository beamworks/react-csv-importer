import React from 'react';
import { ImporterLocale, enUS } from '.';
import { useContext } from 'react';

export const LocaleContext = React.createContext<ImporterLocale>(enUS);

type I18nNamespace = keyof ImporterLocale;

export function useLocale<N extends I18nNamespace>(
  namespace: N
): ImporterLocale[N] {
  const locale = useContext(LocaleContext);
  return locale[namespace]; // not using memo for basic property getter
}
