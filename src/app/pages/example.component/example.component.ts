import { Component, inject } from '@angular/core';
import { BinancePairsService } from '../../core/services/binance-pairs.service';
import { AsyncPipe, JsonPipe } from '@angular/common';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-example.component',
  imports: [AsyncPipe, JsonPipe],
  templateUrl: './example.component.html',
  styleUrl: './example.component.css',
})
export class ExampleComponent {
  private rest = inject(BinancePairsService);
  protected pairs$ = this.rest.getAllPairs();
}
