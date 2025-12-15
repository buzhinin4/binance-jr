import { Component, effect, inject, signal, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { selectMergedKlines, selectSelectedInterval } from '../../../store/klines/klines.selectors';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { CandlestickChart, LineChart } from 'echarts/charts';
import {
  DataZoomComponent,
  GridComponent,
  TooltipComponent,
  LegendComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { KlinesActions } from '../../../store/klines/klines.actions';
import { BinanceKline } from '../../../core/types/knile.interface';
import { selectEma, selectSma } from '../../../store/indicators/indicators.selectors';
import { IndicatorValue } from '../../../core/types/indicator.interface';
import { selectSelectedPair } from '../../../store/pairs/pairs.selectors';

echarts.use([
  CandlestickChart,
  LineChart,
  GridComponent,
  TooltipComponent,
  CanvasRenderer,
  DataZoomComponent,
  LegendComponent,
]);

@Component({
  selector: 'app-graph',
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './graph.html',
  styleUrl: './graph.css',
})
export class Graph {
  private store = inject(Store);

  public selectedPair = toSignal(this.store.select(selectSelectedPair), { initialValue: null });

  public interval = toSignal(this.store.select(selectSelectedInterval), {
    requireSync: true,
  });

  private klines = toSignal(this.store.select(selectMergedKlines), {
    initialValue: [] as BinanceKline[],
  });

  sma = toSignal(this.store.select(selectSma), {
    initialValue: { period: 0, values: [] as IndicatorValue[] },
  });

  ema = toSignal(this.store.select(selectEma), {
    initialValue: { period: 0, values: [] as IndicatorValue[] },
  });

  showSma = signal(false);
  showEma = signal(false);

  private chart: echarts.ECharts | null = null;

  onChartInit(e: echarts.ECharts) {
    this.chart = e;
  }

  chartOptions: echarts.EChartsCoreOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      order: 'seriesDesc',
    },
    dataZoom: [
      { type: 'inside', start: 95, end: 100 },
      { type: 'slider', start: 95, end: 100 },
    ],
    xAxis: { type: 'category', data: [] },
    yAxis: { type: 'value', scale: true },
    series: [
      {
        type: 'candlestick',
        data: [],
        itemStyle: {
          color: '#37d67a',

          color0: '#ff4d4d',

          borderColor: '#37d67a',

          borderColor0: '#ff4d4d',
        },
      },
      {
        name: 'SMA',
        type: 'line',
        data: [],
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 2,
          color: '#f5d505',
        },
      },
      {
        name: 'EMA',
        type: 'line',
        data: [],
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 2,
          color: '#ad05f5',
        },
      },
    ],
  };

  constructor() {
    effect(() => {
      const pair = this.selectedPair();
      const interval = this.interval();
      if (!pair) return;

      this.store.dispatch(KlinesActions.load({ symbol: pair.symbol, interval }));
    });

    effect(() => {
      const list = this.klines();
      const smaData = this.sma();
      const emaData = this.ema();

      const isSmaVisible = this.showSma();
      const isEmaVisible = this.showEma();

      if (!this.chart) return;

      const categories = list.map((k) => this.formatTime(k.openTime));

      const candles = list.map((k) => [
        Number(k.open),
        Number(k.close),
        Number(k.low),
        Number(k.high),
      ]);

      const smaValues =
        smaData?.values && smaData.values.length > 0
          ? Array(smaData.period)
              .fill(null)
              .concat(smaData.values.map((v) => v.value))
          : null;

      const emaValues =
        emaData?.values && emaData.values.length > 0
          ? Array(emaData.period)
              .fill(null)
              .concat(emaData.values.map((v) => v.value))
          : null;

      this.chart.setOption(
        {
          xAxis: { data: categories },
          series: [
            // --- 0: свечи ---
            {
              data: candles,
              show: true,
            },

            // --- 1: SMA ---
            {
              data: smaValues ?? [],
              show: isSmaVisible && smaValues !== null,
            },

            // --- 2: EMA ---
            {
              data: emaValues ?? [],
              show: isEmaVisible && emaValues !== null,
            },
          ],
        },
        false
      );
    });
  }

  toggleSma() {
    this.showSma.update((v) => !v);
  }
  toggleEma() {
    this.showEma.update((v) => !v);
  }

  formatTime(timestamp: number): string {
    const date = new Date(timestamp);

    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yy = String(date.getFullYear()).slice(-2);

    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');

    return `${dd}.${mm}.${yy} ${hh}:${min}:${ss}`;
  }
}
