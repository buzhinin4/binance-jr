import { createFeatureSelector, createSelector } from '@ngrx/store';
import { pairsFeature } from './pairs.reducer';

export const { selectPairsState, selectPairs, selectFavorites, selectLoading, selectError } =
  pairsFeature;

export const selectPairsWithFavorite = createSelector(
  selectPairs,
  selectFavorites,
  (pairs, favorites) =>
    pairs.map((p) => ({
      ...p,
      isFavorite: favorites.includes(p.symbol),
    }))
);
