import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BinancePairsService {
  constructor(private http: HttpClient) {}
  private readonly URL: string = 'https://fapi.binance.com';

  getAllPairs() {
    return this.http.get(`${this.URL}/fapi/v1/ticker/24hr`);
  }
}
