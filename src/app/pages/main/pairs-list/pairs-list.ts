import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import { PairsActions } from '../../../store/pairs/pairs.actions';
import { combineLatest, map, startWith } from 'rxjs';
import { pairsFeature } from '../../../store/pairs/pairs.reducer';
import { Store } from '@ngrx/store';
import { selectPairsWithFavorite } from '../../../store/pairs/pairs.selectors';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { BinancePair } from '../../../core/types/pair.interface';

interface SortConfig {
  field: 'price' | 'change' | 'volume';
  direction: 'asc' | 'desc';
}

@Component({
  selector: 'app-pairs-list',
  imports: [DecimalPipe, ScrollingModule],
  templateUrl: './pairs-list.html',
  styleUrl: './pairs-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PairsList implements OnInit {
  private store = inject(Store);

  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }

  search = signal<string>('');
  sort = signal<SortConfig>({ field: 'volume', direction: 'desc' });

  private search$ = toObservable(this.search);
  private sort$ = toObservable(this.sort);

  private filteredPairs$ = combineLatest([
    this.store.select(selectPairsWithFavorite),
    this.search$.pipe(startWith('')),
    this.sort$.pipe(startWith(this.sort())),
  ]).pipe(
    map(([pairs, searchValue, sortConfig]) => {
      let result = pairs;

      if (searchValue.trim()) {
        const term = searchValue.trim().toUpperCase();
        result = pairs.filter((p) => p.symbol.toUpperCase().includes(term));
      }

      const { field, direction } = sortConfig;
      const multiplier = direction === 'desc' ? -1 : 1;

      return [...result].sort((a, b) => {
        let aVal: number;
        let bVal: number;

        switch (field) {
          case 'price':
            aVal = a.lastPrice;
            bVal = b.lastPrice;
            break;
          case 'change':
            aVal = a.priceChangePercent;
            bVal = b.priceChangePercent;
            break;
          case 'volume':
            aVal = a.volume;
            bVal = b.volume;
            break;
          default:
            return 0;
        }

        return (aVal - bVal) * multiplier;
      });
    })
  );

  private processedPairs$ = this.filteredPairs$.pipe(
    map((pairs) => {
      const favorites = pairs.filter((p) => p.isFavorite);
      const regular = pairs.filter((p) => !p.isFavorite);
      return { favorites, regular };
    })
  );

  favoritePairs$ = this.processedPairs$.pipe(map((x) => x.favorites));
  regularPairs$ = this.processedPairs$.pipe(map((x) => x.regular));

  favoritePairs = toSignal(this.favoritePairs$, { initialValue: [] });
  regularPairs = toSignal(this.regularPairs$, { initialValue: [] });

  loading = toSignal(this.store.select(pairsFeature.selectLoading), { initialValue: true });
  error = toSignal(this.store.select(pairsFeature.selectError), { initialValue: null });

  ngOnInit() {
    this.store.dispatch(PairsActions.load());
  }

  onSearch(value: string) {
    this.search.set(value);
  }

  sortBy(field: 'price' | 'change' | 'volume') {
    this.sort.update((current) => ({
      field,
      direction: current.field === field && current.direction === 'desc' ? 'asc' : 'desc',
    }));
  }

  toggleFavorite(symbol: string, event: Event) {
    event.stopPropagation();
    this.store.dispatch(PairsActions.toggleFavorite({ symbol }));
  }

  selectPair(pair: BinancePair, event: Event) {
    event.stopPropagation();
    this.store.dispatch(PairsActions.select({ selectedPair: pair }));
    this.onClose();
  }

  trackBySymbol(_: number, pair: any) {
    return pair.symbol;
  }
}
