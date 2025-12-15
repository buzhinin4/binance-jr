import { DOCUMENT, effect, Inject, Injectable, signal } from '@angular/core';
import { Theme } from '../types/theme.type';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private _themeSignal = signal<Theme>(this.loadTheme());
  public readonly themeSignal = this._themeSignal.asReadonly();

  private loadTheme(): Theme {
    const json = localStorage.getItem('theme');
    try {
      return json ? JSON.parse(json) : 'light';
    } catch {
      return 'light';
    }
  }

  toggleTheme(): void {
    this._themeSignal.update((current) => {
      let newTheme: Theme = current === 'light' ? 'dark' : 'light';

      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  }

  constructor(@Inject(DOCUMENT) private document: Document) {
    effect(() => {
      this.document.documentElement.setAttribute('data-theme', this._themeSignal());
    });
  }
}
