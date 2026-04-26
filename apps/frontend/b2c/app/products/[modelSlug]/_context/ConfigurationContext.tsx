'use client';

import { createContext, useContext, useMemo, useReducer } from 'react';
import { configurationReducer } from './configurationReducer';
import type {
  ConfigurationContextValue,
  ConfigurationProviderProps,
} from './types';

const ConfigurationContext = createContext<ConfigurationContextValue | null>(null);

export const ConfigurationProvider = ({
  initial,
  skus,
  thumbnail,
  children,
}: ConfigurationProviderProps) => {
  const [state, dispatch] = useReducer(configurationReducer, initial);

  const value = useMemo<ConfigurationContextValue>(
    () => ({ state, dispatch, skus, thumbnail }),
    [state, skus, thumbnail],
  );

  return <ConfigurationContext.Provider value={value}>{children}</ConfigurationContext.Provider>;
};

export const useConfigurationContext = (): ConfigurationContextValue => {
  const ctx = useContext(ConfigurationContext);
  if (!ctx) {
    throw new Error('useConfigurationContext must be used inside ConfigurationProvider');
  }
  return ctx;
};
