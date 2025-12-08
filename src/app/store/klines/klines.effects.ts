import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, concatMap, switchMap } from 'rxjs/operators';
import { EMPTY, of } from 'rxjs';
import { KlinesActions } from './klines.actions';
import { BinanceRestService } from '../../core/services/binance-rest-service';
import { BinanceWssService } from '../../core/services/binance-wss-service';

@Injectable()
export class KlinesEffects {
  private actions$ = inject(Actions);
  private rest = inject(BinanceRestService);
  private wss = inject(BinanceWssService);

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(KlinesActions.load),
      switchMap(({ symbol, interval }) =>
        this.rest.getKlines(symbol.toUpperCase(), interval, 1000).pipe(
          map((data) => KlinesActions.loadSuccess({ data })),
          catchError((error) => of(KlinesActions.loadFailure({ error })))
        )
      )
    )
  );

  live$ = createEffect(() =>
    this.actions$.pipe(
      ofType(KlinesActions.loadSuccess),
      switchMap(() => {
        console.log('a');
        const stream$ = this.wss.kline$();
        if (!stream$) return EMPTY;
        return stream$.pipe(
          map((kMsg: any) => {
            const k = kMsg.k;

            const candle = {
              openTime: k.t,
              closeTime: k.T,
              open: k.o,
              high: k.h,
              low: k.l,
              close: k.c,
              volume: k.v,
              quoteAssetVolume: k.q,
            };

            return k.x
              ? KlinesActions.liveClosed({ candle }) // свеча закрылась
              : KlinesActions.liveUpdate({ candle }); // свеча обновляется
          })
        );
      })
    )
  );
}
