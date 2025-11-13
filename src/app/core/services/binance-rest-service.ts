import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable } from 'rxjs';
import { BinancePair, ExchangeInfo } from '../types/pair.interface';

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
