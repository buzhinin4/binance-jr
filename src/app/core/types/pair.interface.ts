export interface ExchangeInfo {
  symbols: { pair: string }[];
}

export interface BinancePair {
  symbol: string;
  priceChangePercent: number;
  lastPrice: number;
  highPrice: number;
  lowPrice: number;
  volume: number;
}

export interface PairWithFavorite extends BinancePair {
  isFavorite: boolean;
}
