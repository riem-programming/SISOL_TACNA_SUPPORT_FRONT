import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SwPush } from '@angular/service-worker';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PushNotificationService {
  private swPush = inject(SwPush);
  private http = inject(HttpClient);
  private readonly vapidPublicKey = 'BHALT4ft_u-Ori_gGypW4D7orL_SiY9mHaqUHbrNnyY6XSlY52qtqMLzFiB-jyB5OL0v7yCtNptElgVmE7YALhQ';
  private readonly apiUrl = 'http://localhost:3000/push';

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
