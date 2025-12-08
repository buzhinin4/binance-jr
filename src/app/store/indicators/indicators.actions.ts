import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { IndicatorValue } from '../../core/types/indicator.interface';

export const IndicatorsActions = createActionGroup({
  source: 'Indicators',
  events: {
    'calculate sma': props<{ period: number }>(),
    'sma ready': props<{ period: number; values: IndicatorValue[] }>(),

    'calculate ema': props<{ period: number }>(),
    'ema ready': props<{ period: number; values: IndicatorValue[] }>(),
  },
});
