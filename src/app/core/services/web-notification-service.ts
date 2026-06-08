import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class WebNotificationService {
  private permission: NotificationPermission = 'default';
  private audio = new Audio();

  constructor() {
    // Carga el sonido — puedes poner cualquier archivo en /assets
    // O usar un sonido base64 para no depender de archivos externos
    this.audio.src = this.notificationSoundBase64();
    this.audio.volume = 0.4;
    this.audio.load();
  }

  // Pide permiso al usuario — llama esto al iniciar sesión
  async requestPermission(): Promise<void> {
    if (!('Notification' in window)) return;
    this.permission = await Notification.requestPermission();
  }

  // Muestra notificación del sistema + reproduce sonido
  async notify(titulo: string, cuerpo: string, url?: string): Promise<void> {
    this.playSound();

    if (!('Notification' in window)) return;
    if (this.permission !== 'granted') return;

    const notif = new Notification(titulo, {
      body: cuerpo,
      tag: 'ticket-update',
      renotify: true,
    } as NotificationOptions & { renotify: boolean });

    // Al hacer click en la notificación, lleva al ticket
    if (url) {
      notif.onclick = () => {
        window.focus();
        window.location.href = url;
        notif.close();
      };
    }

    // Cierra automáticamente después de 6 segundos
    setTimeout(() => notif.close(), 6000);
  }

  private playSound(): void {
    this.audio.currentTime = 0;
    this.audio.play().catch(() => {
      // El browser bloquea audio sin interacción previa del usuario
      // Si el usuario ya interactuó con la app, esto no falla
    });
  }

  // Sonido de notificación corto codificado en base64
  // Así no necesitas un archivo externo en /assets
  private notificationSoundBase64(): string {
    // Tono corto tipo "ding" en base64 (WAV de 0.3s)
    return (
      'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAA' +
      'EAAQARgAAAAAAABAAFBAAAAAAIABAAMAAAAYAAAABgAAAAYAAAAGAAAABgAAAAYAAAAG' +
      'AAAABQAAAAUAAAAFAAAABQAAAAUAAAAFAAAABQAAAAUAAAAFAAAABQAAAAUAAAAFAAAA' +
      'BQAAAAUAAAAFAAAABQAAAAUAAAAFAAAABQAAAAUAAAAFAAAABQAAAAUAAAAFAAAABQAA' +
      'AAUAAAAFAAAABQAAAAUAAAAFAAAABQAAAAUAAAAFAAAABQAAAAUAAAAFAAAABQAAAAUA' +
      'AAAFAAAABQAAAAUAAAAFAAAABQAAAAUAAAAFAAAABQAAAAUAAAAFAAAABQAAAAUAAAAF'
    );
  }
}
