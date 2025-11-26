import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { BinanceInterval, BinanceKline } from '../types/knile.interface';
import { BinanceRestService } from './binance-rest-service';
import { BinanceWssService } from './binance-wss-service';
import { BehaviorSubject, Observable, shareReplay, startWith, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class KlinesService {
  private rest = inject(BinanceRestService);
  private wss = inject(BinanceWssService);
  readonly symbol = signal<string>('btcusdt');
  readonly interval = signal<BinanceInterval>('1m');

  private currentLiveKline = signal<BinanceKline | null>(null);

  private historical = signal<BinanceKline[]>([]);

  readonly klines = computed(() => {
    const liveKline = this.wss.kline$()?.pipe();
    let liveCandle: BinanceKline | null = null;

    liveCandle = this.currentLiveKline();

    const hist = this.historical();

    if (!liveCandle || !liveCandle.openTime) {
      return hist;
    }

    const index = hist.findIndex((c) => c.openTime === liveCandle!.openTime);

    if (index === -1) {
      return [...hist, liveCandle];
    } else {
      const updated = [...hist];
      updated[index] = liveCandle;
      return updated;
    }
  });

  constructor() {
    effect(() => {
      const sym = this.symbol();
      const int = this.interval();

      this.wss.connectTo(sym, int);

      this.rest.getKlines(sym.toUpperCase(), int, 1000).subscribe({
        next: (data) => {
          this.historical.set(data);

          this.currentLiveKline.set(null);
        },
        error: (err) => console.error('Failed to load klines', err),
      });
    });

    effect(() => {
      const kline$ = this.wss.kline$();
      if (!kline$) {
        this.currentLiveKline.set(null);
        return;
      }

      const subscription = kline$.subscribe((k: any) => {
        const kline = k.k;

        const candle: BinanceKline = {
          openTime: kline.t,
          closeTime: kline.T,
          open: kline.o,
          high: kline.h,
          low: kline.l,
          close: kline.c,
          volume: kline.v,
          quoteAssetVolume: kline.q,
        };
        this.currentLiveKline.set(candle);
      });

      return () => subscription.unsubscribe();
    });
  }
  load(symbol: string, interval: BinanceInterval) {
    this.symbol.set(symbol.toLowerCase());
    this.interval.set(interval);
  }
}
