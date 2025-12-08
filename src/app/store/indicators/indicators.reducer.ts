import { createFeature, createReducer, on } from '@ngrx/store';
import { IndicatorsActions } from './indicators.actions';
import { IndicatorValue } from '../../core/types/indicator.interface';

export const indicatorsFeatureKey = 'indicators';

export interface State {
  sma: { period: number; values: IndicatorValue[] } | null;
  ema: { period: number; values: IndicatorValue[] } | null;
}

export const initialState: State = {
  ema: null,
  sma: null,
};

export const reducer = createReducer(
  initialState,
  on(IndicatorsActions.emaReady, (state, { period, values }) => ({
    ...state,
    ema: {
      period,
      values,
    },
  })),
  on(IndicatorsActions.smaReady, (state, { period, values }) => ({
    ...state,
    sma: {
      period,
      values,
    },
  }))
);

export const indicatorsFeature = createFeature({
  name: indicatorsFeatureKey,
  reducer,
});
