import { Component, inject, OnInit } from '@angular/core';
import { Header } from './components/header/header';
import { BottomNav } from './components/bottom-nav/bottom-nav';
import { RouterOutlet } from '@angular/router';
import { WebNotificationService } from '../../core/services/web-notification-service';

@Component({
  selector: 'app-panel',
  imports: [Header, BottomNav, RouterOutlet],
  templateUrl: './panel.html',
  styleUrl: './panel.css',
})
export default class Panel implements OnInit {
  private webNotif = inject(WebNotificationService);

  ngOnInit(): void {
    this.webNotif.requestPermission();
  }
}
