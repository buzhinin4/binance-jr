import { Component, effect, inject, signal } from '@angular/core';
import { BinanceWssService } from '../../../core/services/binance-wss-service';
import { BinanceBid, BinanceDepth } from '../../../core/types/depth.interface';
import { map } from 'rxjs';

@Component({
  selector: 'app-depths-column',
  imports: [],
  templateUrl: './depths-column.html',
  styleUrl: './depths-column.css',
})
export class DepthsColumn {
  private bws = inject(BinanceWssService);
  depth = signal<BinanceDepth | null>(null);

  constructor() {
    effect(() => {
      const stream$ = this.bws.depth$();
      if (!stream$) return;

      stream$
        .pipe(
          map(
            (raw) =>
              ({
                lastUpdateId: raw.E,
                transactionTime: raw.T,
                bids:
                  raw.b?.map(
                    ([price, quantity]: [string, string]) => ({ price, quantity } as BinanceBid)
                  ) || [],
                asks:
                  raw.a?.map(
                    ([price, quantity]: [string, string]) => ({ price, quantity } as BinanceBid)
                  ) || [],
              } as BinanceDepth)
          )
        )
        .subscribe((d: BinanceDepth) => {
          this.depth.set(d);
        });
    });
  }
}
