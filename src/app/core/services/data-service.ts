import { computed, inject, Injectable, linkedSignal, Signal, signal } from '@angular/core';
import { BinancePair, PairWithFavorite } from '../types/pair.interface';
import { BinanceRestService } from './binance-rest-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { FavoriteService } from './favorite-service';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  brs = inject(BinanceRestService);
  fs = inject(FavoriteService);
  private pairs = toSignal(this.brs.getPairsWithInfo(), {
    initialValue: null,
  });
  public pairsWithFavorites = computed<PairWithFavorite[]>(() => {
    const currentPairs = this.pairs();
    if (!currentPairs) {
      return [];
    }

    return currentPairs.map((bp: BinancePair) => ({
      ...bp,
      isFavorite: this.fs.favoritesSignal().includes(bp.symbol),
    }));
  });
}
