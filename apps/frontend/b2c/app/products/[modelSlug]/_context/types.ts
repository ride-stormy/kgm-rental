import type { ReactNode } from 'react';
import type { InventorySku } from '@/lib/inventory/inventory-mapper';

export interface ConfigurationState {
  trimLabel: string;
  colorCode: string;
  skuId: string | null;
}

export type ConfigurationAction =
  | { type: 'SELECT_TRIM'; trimLabel: string }
  | { type: 'SELECT_COLOR'; colorCode: string }
  | { type: 'SELECT_SKU'; skuId: string };

export interface ConfigurationContextValue {
  state: ConfigurationState;
  dispatch: React.Dispatch<ConfigurationAction>;
  skus: readonly InventorySku[];
  thumbnail: string;
}

export interface ConfigurationProviderProps {
  initial: ConfigurationState;
  skus: readonly InventorySku[];
  thumbnail: string;
  children: ReactNode;
}
