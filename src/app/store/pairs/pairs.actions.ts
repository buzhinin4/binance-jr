import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { BinancePair } from '../../core/types/pair.interface';

export const PairsActions = createActionGroup({
  source: 'Pairs',
  events: {
    load: emptyProps(),
    'load success': props<{ pairs: BinancePair[] }>(),
    'load failure': props<{ error: any }>(),

    'toggle favorite': props<{ symbol: string }>(),
  },
});
