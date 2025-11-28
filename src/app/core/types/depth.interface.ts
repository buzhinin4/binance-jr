export interface BinanceDepth {
  lastUpdateId: number;
  transactionTime: number;
  bids: BinanceBid[];
  asks: BinanceBid[];
}

export interface BinanceBid {
  price: string;
  quantity: string;
}

export type BinanceLimit = 5 | 10 | 20 | 50 | 100 | 500 | 1000;
