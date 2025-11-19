import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable } from 'rxjs';
import { BinancePair, ExchangeInfo } from '../types/pair.interface';
import { BinanceInterval, BinanceKline } from '../types/knile.interface';
import { BinanceBid, BinanceDepth, BinanceLimit } from '../types/depth.interface';

@Injectable({
  providedIn: 'root',
})
export class BinanceRestService {
  private http: HttpClient = inject(HttpClient);
  private URL: string = 'https://fapi.binance.com';

  getAllPairs(): Observable<ExchangeInfo> {
    return this.http.get<ExchangeInfo>(`${this.URL}/fapi/v1/exchangeInfo`);
  }

  getStats(): Observable<BinancePair[]> {
    return this.http.get<BinancePair[]>(`${this.URL}/fapi/v1/ticker/24hr`);
  }

  getKlines(
    symbol: string,
    interval: BinanceInterval,
    limit?: number,
    startTime?: number,
    endTime?: number
  ): Observable<BinanceKline[]> {
    let params = new HttpParams().set('symbol', symbol.toUpperCase()).set('interval', interval);

    if (limit && limit >= 500 && limit <= 1500) params = params.set('limit', limit.toString());
    if (startTime) params = params.set('startTime', startTime.toString());
    if (endTime) params = params.set('endTime', endTime.toString());

    return this.http.get<any[][]>(`${this.URL}/fapi/v1/klines`, { params }).pipe(
      map((rawData) =>
        rawData.map(
          (kline) =>
            ({
              openTime: kline[0],
              closeTime: kline[6],
              open: kline[1],
              high: kline[2],
              low: kline[3],
              close: kline[4],
              volume: kline[5],
              quoteAssetVolume: kline[7],
            } as BinanceKline)
        )
      )
    );
  }

  getDepth(symbol: string, limit: BinanceLimit = 500): Observable<BinanceDepth> {
    const params = new HttpParams()
      .set('symbol', symbol.toUpperCase())
      .set('limit', limit.toString());

    return this.http.get<any>(`${this.URL}/fapi/v1/depth`, { params }).pipe(
      map(
        (raw) =>
          ({
            lastUpdateId: raw.lastUpdateId,
            transactionTime: raw.T,
            bids: raw.bids.map(
              ([price, quantity]: [string, string]) => ({ price, quantity } as BinanceBid)
            ),
            asks: raw.asks.map(
              ([price, quantity]: [string, string]) => ({ price, quantity } as BinanceBid)
            ),
          } as BinanceDepth)
      )
    );
  }

  getPairsWithInfo(): Observable<BinancePair[]> {
    return forkJoin({
      pairs$: this.getAllPairs(),
      stats$: this.getStats(),
    }).pipe(
      map(({ pairs$, stats$ }) => {
        const pairSymbols = pairs$.symbols.map((s) => s.pair);

        return stats$.filter((stat) => pairSymbols.includes(stat.symbol));
      })
    );
  }
}
