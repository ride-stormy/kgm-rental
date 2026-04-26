import type { ConfigurationAction, ConfigurationState } from './types';

export const configurationReducer = (
  state: ConfigurationState,
  action: ConfigurationAction,
): ConfigurationState => {
  switch (action.type) {
    case 'SELECT_TRIM':
      return { ...state, trimLabel: action.trimLabel, skuId: null };
    case 'SELECT_COLOR':
      return { ...state, colorCode: action.colorCode, skuId: null };
    case 'SELECT_SKU':
      return { ...state, skuId: action.skuId };
    default:
      return state;
  }
};
