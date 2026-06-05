import { Component, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-offline-banner',
  imports: [MatIconModule],
  templateUrl: './offline-banner.html',
  styleUrl: './offline-banner.css',
  host: {
    '(window:online)': 'online.set(true)',
    '(window:offline)': 'online.set(false)',
  },
})
export class OfflineBanner {
  // navigator is unavailable during SSR; assume online there
  online = signal(typeof navigator === 'undefined' ? true : navigator.onLine);
}
