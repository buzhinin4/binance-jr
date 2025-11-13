export interface ExchangeInfo {
  symbols: { pair: string }[];
}

export interface BinancePair {
  symbol: string;
  priceChange: number;
  lastPrice: number;
  volume: number;
}

export interface PairWithFavorite extends BinancePair {
  isFavorite: boolean;
}
