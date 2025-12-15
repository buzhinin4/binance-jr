import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
  isDevMode,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { pairsFeature } from './store/pairs/pairs.reducer';
import { PairsEffects } from './store/pairs/pairs.effects';
import { klinesFeature } from './store/klines/klines.reducer';
import { KlinesEffects } from './store/klines/klines.effects';
import { indicatorsFeature } from './store/indicators/indicators.reducer';
import { IndicatorsEffects } from './store/indicators/indicators.effects';
import { aggTradesFeature } from './store/aggTrades/aggTrades.reducer';
import { AggTradesEffects } from './store/aggTrades/aggTrades.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideStore({
      [pairsFeature.name]: pairsFeature.reducer,
      [klinesFeature.name]: klinesFeature.reducer,
      [indicatorsFeature.name]: indicatorsFeature.reducer,
      [aggTradesFeature.name]: aggTradesFeature.reducer,
    }),
    provideEffects([PairsEffects, KlinesEffects, IndicatorsEffects, AggTradesEffects]),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
  ],
};
