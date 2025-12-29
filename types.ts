
export interface CurrencyData {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

export interface ExchangeRates {
  [key: string]: number;
}

export interface HistoricalRate {
  date: string;
  rate: number;
}

export interface ConversionResult {
  from: string;
  to: string;
  amount: number;
  result: number;
  rate: number;
  timestamp: number;
}

export interface User {
  name: string;
  email: string;
  photoUrl: string;
  id: string;
}
