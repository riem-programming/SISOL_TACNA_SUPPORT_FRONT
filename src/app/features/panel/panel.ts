import { Component } from '@angular/core';
import { Header } from './components/header/header';
import { BottomNav } from './components/bottom-nav/bottom-nav';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-panel',
  imports: [Header, BottomNav, RouterOutlet],
  templateUrl: './panel.html',
  styleUrl: './panel.css',
})
export default class Panel {}
