import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SwPush } from '@angular/service-worker';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PushNotificationService {
  private swPush = inject(SwPush);
  private http = inject(HttpClient);
  private readonly vapidPublicKey = 'BPeXMBPTWF2ogmLhjpd2c0ADEX_T93lttvrq_GZ6MuESQ3J9ohM2V0mqnIvEZdlRbLKt_g_UqPfXjwTDXm992uM';
  private readonly apiUrl = `${environment.apiUrl}/push`;

  async subscribeToNotifications(): Promise<void> {
    if (!this.swPush.isEnabled) return;
    try {
      await navigator.serviceWorker.ready;
      const sub = await this.swPush.requestSubscription({ serverPublicKey: this.vapidPublicKey });
      const { endpoint, keys } = sub.toJSON() as any;
      await firstValueFrom(this.http.post(`${this.apiUrl}/subscribe`, { endpoint, keys }));
    } catch {
      // user denied or sw not available
    }
  }

  listenNotificationClicks(router: Router): void {
    this.swPush.notificationClicks.subscribe(({ notification }) => {
      const url = notification.data?.url;
      if (url) router.navigateByUrl(url);
    });
  }
}
