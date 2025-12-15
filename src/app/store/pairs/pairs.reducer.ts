import { createFeature, createReducer, on } from '@ngrx/store';
import { PairsActions } from './pairs.actions';
import { BinancePair } from '../../core/types/pair.interface';

export const pairsFeatureKey = 'pairs';

export interface State {
  pairs: BinancePair[];
  selectedPair: BinancePair | null;
  favorites: string[];
  loading: boolean;
  error: any;
}

export const initialState: State = {
  pairs: [],
  selectedPair: null,
  favorites: JSON.parse(localStorage.getItem('favorites') || '[]'),
  loading: false,
  error: null,
};

export const reducer = createReducer(
  initialState,

  on(PairsActions.load, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(PairsActions.loadSuccess, (state, { pairs }) => {
    let selectedPair = state.selectedPair;

    if (!selectedPair) {
      if (state.favorites.length > 0) {
        const favSymbol = state.favorites[0];
        selectedPair = pairs.find((p) => p.symbol === favSymbol) || null;
      }

      if (!selectedPair && pairs.length > 1) {
        selectedPair = pairs[0];
      }
    }

    return {
      ...state,
      pairs,
      selectedPair,
      loading: false,
    };
  }),

  on(PairsActions.loadFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(PairsActions.select, (state, { selectedPair }) => ({
    ...state,
    selectedPair,
  })),

  on(PairsActions.toggleFavorite, (state, { symbol }) => {
    const exists = state.favorites.includes(symbol);

    return {
      ...state,
      favorites: exists
        ? state.favorites.filter((f) => f !== symbol)
        : [...state.favorites, symbol],
    };
  })
);

export const pairsFeature = createFeature({
  name: pairsFeatureKey,
  reducer,
});
