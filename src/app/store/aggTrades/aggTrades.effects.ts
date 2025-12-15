import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap } from 'rxjs/operators';
import { EMPTY, of } from 'rxjs';
import { AggTradesActions } from './aggTrades.actions';
import { BinanceRestService } from '../../core/services/binance-rest-service';
import { BinanceWssService } from '../../core/services/binance-wss-service';

@Injectable()
export class AggTradesEffects {
  private actions$ = inject(Actions);
  private rest = inject(BinanceRestService);
  private wss = inject(BinanceWssService);

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AggTradesActions.load),
      switchMap(({ symbol }) =>
        this.rest.getAggTrades(symbol, 20).pipe(
          map((data) => AggTradesActions.loadSuccess({ data })),
          catchError((error) => of(AggTradesActions.loadFailure({ error })))
        )
      )
    )
  );

  live$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AggTradesActions.loadSuccess),
      switchMap(() => {
        const stream$ = this.wss.aggTrade$();
        if (!stream$) return EMPTY;

        return stream$.pipe(
          map((msg: any) => {
            const trade = {
              id: msg.a,
              price: msg.p,
              volume: msg.q,
              time: msg.T,
              isSell: msg.m,
            };

            return AggTradesActions.liveUpdate({ trade });
          })
        );
      })
    )
  );
}
