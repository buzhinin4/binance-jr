import { inject, Injectable, signal } from '@angular/core';
import { DataService } from './data-service';

@Injectable({
  providedIn: 'root',
})
export class FavoriteService {
  private _favoritesSignal = signal<string[]>(this.loadFavorites());
  public readonly favoritesSignal = this._favoritesSignal.asReadonly();

  private loadFavorites(): string[] {
    const json = localStorage.getItem('favorites');
    try {
      return json ? JSON.parse(json) : [];
    } catch {
      return [];
    }
  }

  toggleFavorite(symbol: string): void {
    this._favoritesSignal.update((current) => {
      let newFavorites;
      if (current.includes(symbol)) {
        newFavorites = current.filter((f) => f !== symbol);
      } else {
        newFavorites = [...current, symbol];
      }

      localStorage.setItem('favorites', JSON.stringify(newFavorites));
      return newFavorites;
    });
  }
}
