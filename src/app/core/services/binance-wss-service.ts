import { effect, Injectable, signal, untracked } from '@angular/core';
import { BinanceMessage } from '../types/BinanceMessage.inteface';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { filter, map, Observable, shareReplay } from 'rxjs';
import { BinanceInterval } from '../types/knile.interface';

@Injectable({
  providedIn: 'root',
})
export class BinanceWssService {
  private URL: string = 'wss://fstream.binance.com/stream';
  private socket$ = signal<WebSocketSubject<BinanceMessage> | null>(null);
  private connection$ = signal<Observable<BinanceMessage> | null>(null);

  private _symbol = signal<string | null>(null);
  public readonly symbol = this._symbol.asReadonly();

  private _interval = signal<BinanceInterval | null>(null);
  public readonly interval = this._interval.asReadonly();

  private _aggTrade$ = signal<Observable<any> | null>(null);
  public readonly aggTrade$ = this._aggTrade$.asReadonly();

  private _markPrice$ = signal<Observable<any> | null>(null);
  public readonly markPrice$ = this._markPrice$.asReadonly();

  private _depth$ = signal<Observable<any> | null>(null);
  public readonly depth$ = this._depth$.asReadonly();

  private _kline$ = signal<Observable<any> | null>(null);
  public readonly kline$ = this._kline$.asReadonly();

  constructor() {
    effect(() => {
      const sym = this._symbol()?.toLowerCase();
      const int = this._interval();
      untracked(() => {
        if (sym && int) {
          this.connect();
        } else {
          this.disconnect();
        }
      });
    });
  }

  private connect() {
    const symbol = this._symbol();
    const interval = this._interval();
    if (!symbol || !interval) return;

    this.socket$()?.complete();
    this.connection$.set(null);
    this.resetAllStreams();

    const streams = [
      `${symbol}@aggTrade`,
      `${symbol}@markPrice@1s`,
      `${symbol}@depth20@100ms`,
      `${symbol}@kline_${interval}`,
    ];

    const url = `${this.URL}?streams=${streams.join('/')}`;
    console.log('Binance WS →', url);

    const ws = webSocket<BinanceMessage>({
      url,
      openObserver: { next: () => console.log('WS Connected:', symbol) },
      closeObserver: { next: () => console.log('WS Disconnected') },
    });

    this.socket$.set(ws);
    const shared = ws.pipe(shareReplay(1));
    this.connection$.set(shared);

    this._aggTrade$.set(this.createStream('@aggTrade'));
    this._markPrice$.set(this.createStream('@markPrice@1s'));
    this._depth$.set(this.createStream('@depth20@100ms'));
    this._kline$.set(this.createStream(`@kline_${interval}`));
  }

  private createStream<T>(partialName: string): Observable<T> {
    const source = this.connection$();
    if (!source) throw new Error('WebSocket не подключён');

    const sym = this.symbol();
    if (!sym) throw new Error('Символ не установлен');

    const streamName = `${sym}${partialName}`;

    return source.pipe(
      filter((msg) => msg.stream === streamName),
      map((msg) => msg.data as T),
      shareReplay(1)
    );
  }

  private resetAllStreams() {
    this._aggTrade$.set(null);
    this._markPrice$.set(null);
    this._depth$.set(null);
    this._kline$.set(null);
  }

  disconnect() {
    this.socket$()?.complete();
    this.socket$.set(null);
    this.connection$.set(null);
  }
  switchSymbol(symbol: string) {
    this._symbol.set(symbol.toLowerCase());
  }

  switchInterval(interval: BinanceInterval) {
    this._interval.set(interval);
  }

  connectTo(symbol: string, interval: BinanceInterval) {
    this.switchSymbol(symbol);
    this.switchInterval(interval);
  }
}
