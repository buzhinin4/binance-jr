import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, concatMap, take, tap } from 'rxjs/operators';
import { Observable, EMPTY, of } from 'rxjs';
import { IndicatorsActions } from './indicators.actions';
import { IndicatorsService } from '../../core/services/indicators-service';
import { Action, Store } from '@ngrx/store';
import { selectMergedKlines } from '../klines/klines.selectors';
import { KlinesActions } from '../klines/klines.actions';
import { selectIndicatorsState } from './indicators.selectors';

@Injectable()
export class IndicatorsEffects {
  private actions$ = inject(Actions);
  private is = inject(IndicatorsService);
  private store = inject(Store);
  private klines$ = this.store.select(selectMergedKlines);

  calculateEma$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IndicatorsActions.calculateEma),
      concatMap(({ period }) =>
        this.klines$.pipe(
          tap(() => console.log('EMA CALCULATED')),
          map((klines) => {
            const values = this.is.ema(klines, period);
            return IndicatorsActions.emaReady({ period, values });
          })
        )
      )
    )
  );

  calculateSma$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IndicatorsActions.calculateSma),
      concatMap(({ period }) =>
        this.klines$.pipe(
          map((klines) => {
            const values = this.is.sma(klines, period);
            return IndicatorsActions.smaReady({ period, values });
          })
        )
      )
    )
  );

  // autoRecalcOnKlinesUpdate$ = createEffect(() =>
  //   this.actions$.pipe(
  //     ofType(
  //       KlinesActions.loadSuccess,
  //       KlinesActions.liveUpdate, // новая свеча
  //       KlinesActions.liveClosed // закрытие свечи
  //     ),
  //     concatMap(() =>
  //       this.store.select(selectIndicatorsState).pipe(
  //         take(1),
  //         concatMap((indicators) => {
  //           const actions: Action[] = [];

  //           if (indicators.sma) {
  //             actions.push(IndicatorsActions.calculateSma({ period: indicators.sma.period }));
  //           }

  //           if (indicators.ema) {
  //             actions.push(IndicatorsActions.calculateEma({ period: indicators.ema.period }));
  //           }

  //           return actions;
  //         })
  //       )
  //     )
  //   )
  // );
}
