import { Component, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { selectSelectedPair } from '../../../store/pairs/pairs.selectors';
import { selectLoading } from '../../../store/klines/klines.selectors';
import { selectTrades } from '../../../store/aggTrades/aggTrades.selectors';
import { AggTradesActions } from '../../../store/aggTrades/aggTrades.actions';

@Component({
  selector: 'app-agg-trades-column',
  imports: [],
  templateUrl: './agg-trades-column.html',
  styleUrl: './agg-trades-column.css',
})
export class AggTradesColumn {
  private store = inject(Store);

  public selectedPair = toSignal(this.store.select(selectSelectedPair), { initialValue: null });

  trades = this.store.selectSignal(selectTrades);
  isLoading = this.store.selectSignal(selectLoading);

  constructor() {
    effect(() => {
      const pair = this.selectedPair();
      if (!pair) return;

      this.store.dispatch(AggTradesActions.load({ symbol: pair.symbol }));
    });
  }
}
