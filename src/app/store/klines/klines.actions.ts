import { createActionGroup, props } from '@ngrx/store';
import { BinanceInterval, BinanceKline } from '../../core/types/knile.interface';

export const KlinesActions = createActionGroup({
  source: 'Klines',
  events: {
    select: props<{ selectedInterval: BinanceInterval }>(),

    load: props<{ symbol: string; interval: BinanceInterval }>(),
    'load success': props<{ data: BinanceKline[] }>(),
    'load failure': props<{ error: any }>(),

    'live update': props<{ candle: BinanceKline }>(),
    'live closed': props<{ candle: BinanceKline }>(),
  },
});
