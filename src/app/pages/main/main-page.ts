import { Component } from '@angular/core';
import { Graph } from './graph/graph';
import { Header } from './header/header';
import { DepthsColumn } from './depths-column/depths-column';
import { AggTradesColumn } from './agg-trades-column/agg-trades-column';

@Component({
  selector: 'app-main-page',
  imports: [Header, Graph, DepthsColumn, AggTradesColumn],
  templateUrl: './main-page.html',
  styleUrl: './main-page.css',
})
export class MainPage {}
