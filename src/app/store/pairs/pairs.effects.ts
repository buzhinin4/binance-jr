import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { PairsActions } from './pairs.actions';
import { BinanceRestService } from '../../core/services/binance-rest-service';

@Injectable()
export class PairsEffects {
  private actions$ = inject(Actions);
  private brs = inject(BinanceRestService);

  loadPairs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PairsActions.load),
      mergeMap(() =>
        this.brs.getPairsWithInfo().pipe(
          map((pairs) => PairsActions.loadSuccess({ pairs })),
          catchError((error) => of(PairsActions.loadFailure({ error })))
        )
      )
    )
  );

  persistFavorites$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(PairsActions.toggleFavorite),
        map(({ symbol }) => {
          const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

          const updated = favorites.includes(symbol)
            ? favorites.filter((f: string) => f !== symbol)
            : [...favorites, symbol];

          localStorage.setItem('favorites', JSON.stringify(updated));
        })
      ),
    { dispatch: false }
  );
}
