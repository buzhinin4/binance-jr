import { Component, computed, effect, inject, signal } from '@angular/core';
import { PairsList } from '../pairs-list/pairs-list';
import { BinanceWssService } from '../../../core/services/binance-wss-service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { UpperCasePipe } from '@angular/common';
import { ThemeService } from '../../../core/services/theme-service';
import { Store } from '@ngrx/store';
import { PairsActions } from '../../../store/pairs/pairs.actions';
import { selectSelectedPair } from '../../../store/pairs/pairs.selectors';
import { markPrice } from '../../../core/types/markPrice.inteface';
import { EMPTY, Observable, switchMap } from 'rxjs';
import { Settings } from '../settings/settings';
import { BinanceInterval } from '../../../core/types/knile.interface';
import { selectSelectedInterval } from '../../../store/klines/klines.selectors';
import { KlinesActions } from '../../../store/klines/klines.actions';

@Component({
  selector: 'app-header',
  imports: [PairsList, UpperCasePipe, Settings],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private store = inject(Store);
  private ts = inject(ThemeService);
  private bws = inject(BinanceWssService);

  public isPairsListOpen = signal(false);
  public isIndicatorsOpen = signal(false);

  public selectedPair = toSignal(this.store.select(selectSelectedPair), { initialValue: null });

  public symbol = computed<string | null>(() => this.selectedPair()?.symbol ?? '');
  public highPrice = computed<number | null>(() => this.selectedPair()?.highPrice ?? null);
  public lowPrice = computed<number | null>(() => this.selectedPair()?.lowPrice ?? null);
  public volume = computed<number | null>(() => this.selectedPair()?.volume ?? null);

  private flatMarkPrice$ = toObservable(this.bws.markPrice$).pipe(
    switchMap((obsOrNull: Observable<markPrice> | null) => {
      if (obsOrNull === null) {
        return EMPTY;
      }
      return obsOrNull;
    })
  );

  public markPriceObj = toSignal<markPrice | null>(this.flatMarkPrice$, {
    initialValue: null,
  });

  public markPrice = computed<number | null>(() => this.markPriceObj()?.p ?? null);
  public indexPrice = computed<number | null>(() => this.markPriceObj()?.i ?? null);
  public fundingRate = computed<number | null>(() => this.markPriceObj()?.r ?? null);

  public intervals: BinanceInterval[] = [
    '1m',
    '3m',
    '5m',
    '15m',
    '30m',
    '1h',
    '2h',
    '4h',
    '6h',
    '8h',
    '12h',
    '1d',
    '3d',
    '1w',
    '1M',
  ];

  public interval = toSignal(this.store.select(selectSelectedInterval), {
    requireSync: true,
  });

  selectInterval(value: string) {
    this.store.dispatch(KlinesActions.select({ selectedInterval: value as BinanceInterval }));
  }

  public theme = this.ts.themeSignal;

  constructor() {
    this.store.dispatch(PairsActions.load());

    effect(() => {
      const pair = this.selectedPair();
      const interval = this.interval();
      if (!pair) return;

      this.bws.connectTo(pair.symbol, interval);
    });
  }

  togglePairsList() {
    this.isPairsListOpen.update((v) => !v);
  }

  toggleIndicators() {
    this.isIndicatorsOpen.update((v) => !v);
  }

  toggleFavorite() {
    this.store.dispatch(PairsActions.toggleFavorite({ symbol: this.symbol()! }));
  }

  toggleTheme() {
    this.ts.toggleTheme();
  }
}
