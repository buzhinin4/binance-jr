import { createFeature, createReducer, on } from '@ngrx/store';
import { KlinesActions } from './klines.actions';
import { BinanceInterval, BinanceKline } from '../../core/types/knile.interface';

export const klinesFeatureKey = 'klines';

export interface State {
  selectedInterval: BinanceInterval;
  historical: BinanceKline[];
  live: BinanceKline | null;
  loading: boolean;
  error: any;
}

export const initialState: State = {
  selectedInterval: '1m',
  historical: [],
  live: null,
  loading: false,
  error: null,
};

export const reducer = createReducer(
  initialState,

  on(KlinesActions.select, (state, { selectedInterval }) => ({
    ...state,
    selectedInterval,
  })),

  on(KlinesActions.load, (state) => ({
    ...state,
    loading: true,
    error: null,
    live: null,
    historical: [],
  })),

  on(KlinesActions.loadSuccess, (state, action) => ({
    ...state,
    loading: false,
    historical: action.data,
  })),

  on(KlinesActions.loadFailure, (state, action) => ({
    ...state,
    loading: false,
    error: action.error,
  })),

  on(KlinesActions.liveUpdate, (state, action) => ({
    ...state,
    live: action.candle,
  })),

  on(KlinesActions.liveClosed, (state, action) => ({
    ...state,
    live: null,
    historical: [...state.historical, action.candle],
  }))
);

export const klinesFeature = createFeature({
  name: klinesFeatureKey,
  reducer,
});
