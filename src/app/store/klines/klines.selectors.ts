import { createFeatureSelector, createSelector } from '@ngrx/store';
import { klinesFeature } from './klines.reducer';

export const { selectKlinesState, selectHistorical, selectLive, selectLoading, selectError } =
  klinesFeature;

export const selectMergedKlines = createSelector(selectHistorical, selectLive, (hist, live) =>
  live ? [...hist, live] : hist
);
