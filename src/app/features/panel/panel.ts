import { Component } from '@angular/core';
import { Header } from './components/header/header';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-panel',
  imports: [Header, RouterOutlet],
  templateUrl: './panel.html',
  styleUrl: './panel.css',
})
export default class Panel {}
