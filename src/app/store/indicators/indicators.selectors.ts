import { createFeatureSelector, createSelector } from '@ngrx/store';
import { indicatorsFeature } from './indicators.reducer';

export const { selectIndicatorsState, selectSma, selectEma } = indicatorsFeature;
