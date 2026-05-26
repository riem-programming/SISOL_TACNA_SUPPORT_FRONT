import { Component } from '@angular/core';
import { Header } from './components/header/header';

@Component({
  selector: 'app-panel',
  imports: [Header],
  templateUrl: './panel.html',
  styleUrl: './panel.css',
})
export default class Panel {}
