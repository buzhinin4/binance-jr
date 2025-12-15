import { createActionGroup, props } from '@ngrx/store';
import { aggTrade } from '../../core/types/aggTrade.interface';

export const AggTradesActions = createActionGroup({
  source: 'AggTrades',
  events: {
    load: props<{ symbol: string }>(),
    'load success': props<{ data: aggTrade[] }>(),
    'load failure': props<{ error: any }>(),

    'live update': props<{ trade: aggTrade }>(),
  },
});
