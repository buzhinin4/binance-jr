import { createFeature, createReducer, on } from '@ngrx/store';
import { AggTradesActions } from './aggTrades.actions';
import { aggTrade } from '../../core/types/aggTrade.interface';

export const aggTradesFeatureKey = 'aggTrades';

export interface State {
  trades: aggTrade[];
  loading: boolean;
  error: any;
}

export const initialState: State = {
  trades: [],
  loading: false,
  error: null,
};

const MAX_TRADES = 20;

function normalizeTrades(trades: aggTrade[]): aggTrade[] {
  if (trades.length > MAX_TRADES) {
    return trades.slice(0, MAX_TRADES);
  }

  if (trades.length < MAX_TRADES) {
    const filler = Array.from(
      { length: MAX_TRADES - trades.length },
      () => trades[trades.length - 1]
    );
    return [...trades, ...filler];
  }

  return trades;
}

export const reducer = createReducer(
  initialState,

  on(AggTradesActions.load, (state) => ({
    ...state,
    loading: true,
  })),

  on(AggTradesActions.loadSuccess, (state, { data }) => ({
    ...state,
    loading: false,
    trades: normalizeTrades(data),
  })),

  on(AggTradesActions.loadFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(AggTradesActions.liveUpdate, (state, { trade }) => {
    const index = state.trades.findIndex((t) => t.id === trade.id);

    let updated: aggTrade[];

    if (index !== -1) {
      updated = [...state.trades];
      updated[index] = trade;
    } else {
      updated = [trade, ...state.trades.slice(0, MAX_TRADES - 1)];
    }

    return {
      ...state,
      trades: normalizeTrades(updated),
    };
  })
);

export const aggTradesFeature = createFeature({
  name: aggTradesFeatureKey,
  reducer,
});
