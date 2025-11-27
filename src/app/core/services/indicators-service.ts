import { Injectable } from '@angular/core';
import { BinanceKline } from '../types/knile.interface';
import { IndicatorValue } from '../types/indicator.interface';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class IndicatorsService {
  sma(klines$: Observable<BinanceKline[]>, period: number): Observable<IndicatorValue[]> {
    return klines$.pipe(
      map((klines) => {
        if (klines.length < period) return [];

        const result: IndicatorValue[] = [];
        for (let i = period - 1; i < klines.length; i++) {
          let sum = 0;
          for (let j = 0; j < period; j++) {
            sum += parseFloat(klines[i - j].close);
          }
          result.push({
            time: klines[i].openTime,
            value: sum / period,
          });
        }
        return result;
      })
    );
  }

  ema(klines$: Observable<BinanceKline[]>, period: number): Observable<IndicatorValue[]> {
    return klines$.pipe(
      map((klines) => {
        if (klines.length === 0) return [];

        const k = 2 / (period + 1);
        const result: IndicatorValue[] = [];
        let ema = parseFloat(klines[0].close);

        if (klines.length >= period) {
          let sum = 0;
          for (let i = 0; i < period; i++) sum += parseFloat(klines[i].close);
          ema = sum / period;
        }

        result.push({ time: klines[Math.min(period - 1, klines.length - 1)].openTime, value: ema });

        for (let i = Math.max(period, 1); i < klines.length; i++) {
          const close = parseFloat(klines[i].close);
          ema = close * k + ema * (1 - k);
          result.push({ time: klines[i].openTime, value: ema });
        }

        return result;
      })
    );
  }
}
