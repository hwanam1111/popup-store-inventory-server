import { Union } from '@src/utils/union-type';

export const forwardHistoryType = {
  Forwarding: 'Forwarding',
  Cancel: 'Cancel',
  Defective: 'Defective',
  Damage: 'Damage',
} as const;
export type ForwardHistoryType = Union<typeof forwardHistoryType>;

export const currencyUnit = {
  KRW: 'KRW',
  EUR: 'EUR',
  USD: 'USD',
} as const;
export type CurrencyUnit = Union<typeof currencyUnit>;

export const countryName = {
  Germany: 'Germany',
  Belgium: 'Belgium',
  Spain: 'Spain',
  France: 'France',
} as const;
export type CountryName = Union<typeof countryName>;
