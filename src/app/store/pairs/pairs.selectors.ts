import { createSelector } from '@ngrx/store';
import { pairsFeature } from './pairs.reducer';

export const {
  selectPairsState,
  selectPairs,
  selectSelectedPair,
  selectFavorites,
  selectLoading,
  selectError,
} = pairsFeature;

export const selectPairsWithFavorite = createSelector(
  selectPairs,
  selectFavorites,
  (pairs, favorites) =>
    pairs.map((p) => ({
      ...p,
      isFavorite: favorites.includes(p.symbol),
    }))
);
