# UX Roadmap — Soporte SISOL Tacna

Propuestas de diseño priorizadas para evolucionar la aplicación. Solo diseño: ninguna está implementada. Audiencia objetivo: personal hospitalario 40+, mobile-first, light/dark por sistema.

Leyenda de esfuerzo: 🟢 solo frontend · 🟡 requiere backend · 🔴 requiere backend + infraestructura

---

## P0 — Crítico (la app está incompleta sin esto)

### 1. Página de detalle del ticket 🟡

**Problema:** las cards de "Mis Solicitudes" navegan a `/tickets/:code`, una ruta que **no existe**. El usuario crea una solicitud y nunca más puede ver qué pasó con ella. Es el hueco funcional más grande de la app.

**Diseño:**
- Ruta `panel/solicitud/:code` (hija del shell, hereda header + bottom nav).
- Encabezado: código del ticket (monospace), badge de estado grande, prioridad, fecha.
- **Línea de tiempo vertical de estados** (Pendiente → Abierto → En revisión → Cerrado): para usuarios 40+ una timeline visual responde "¿en qué va mi trámite?" sin interpretar jerga.
- Sección de datos enviados (descripción, especialidad, consultorio, adjunto con preview).
- Botón "Volver a mis solicitudes" persistente (no depender solo del gesto atrás).
- Lee del caché de `TicketService.getById()` — cero requests extra al navegar; fallback a fetch individual si se entra por URL directa.

**Archivos:**
- `src/app/features/panel/pages/ticket-detail/ticket-detail.{ts,html,css}` (nuevo)
- `src/app/features/panel/pages/ticket-detail/components/status-timeline/*` (nuevo)
- `src/app/features/panel/panel.routes.ts` (nueva ruta)
- `src/app/features/panel/pages/my-request/my-request.ts` (corregir `goToTicket` → `['panel','solicitud',code]`)
- `src/app/core/services/ticket-service.ts` (método `getByCode()` + fetch individual)

---

### 2. Chat / hilo de comentarios en el ticket 🔴

**Problema:** hoy la comunicación usuario ↔ soporte ocurre fuera de la app (teléfono, pasillo). El contexto se pierde y el usuario no tiene registro de qué le pidieron.

**Diseño:**
- Dentro del detalle del ticket: hilo tipo mensajería (burbujas propias a la derecha con `primary-container`, soporte a la izquierda con `surface-container-high`).
- Input fijo al fondo con textarea auto-expandible, botón enviar de 48px y adjuntar foto (reusar el patrón cámara de create-request).
- Mensajes del sistema intercalados en la timeline ("El estado cambió a En revisión") — un solo hilo cronológico, no dos vistas.
- Tipografía 16px mínimo en burbujas; fecha agrupada por día ("Hoy", "Ayer").
- Polling simple cada 30s al inicio; WebSocket después si escala.

**Archivos:**
- `src/app/features/panel/pages/ticket-detail/components/ticket-chat/*` (nuevo)
- `src/app/core/services/ticket-message-service.ts` (nuevo)
- `src/app/core/models/ticketMessage.model.ts` (nuevo)
- Backend: endpoints `GET/POST /ticket/:id/messages`

---

### 3. Manejo de sesión expirada y errores de red 🟢

**Problema:** el JWT expira y la app sigue mostrando UI logueada hasta que una request falla en silencio. En hospital con WiFi inestable, los fallos de red hoy dejan listas vacías sin explicación ("¿no tengo tickets o falló internet?").

**Diseño:**
- Interceptor: ante `401` → limpiar sesión + redirigir a login + snackbar "Tu sesión expiró, vuelve a iniciar sesión".
- Estado de error explícito en listas: icono + "No pudimos cargar tus solicitudes" + **botón Reintentar** de 48px (nunca dejar lista vacía ambigua).
- Banner offline global (escucha `navigator.onLine`): franja superior `error-container` con "Sin conexión".

**Archivos:**
- `src/app/core/interceptors/auth-interceptor.ts` (manejo 401)
- `src/app/core/services/ticket-service.ts` (signal `error` además de `loading`)
- `src/app/features/panel/pages/my-request/my-request.{html,ts}` (estado error + retry)
- `src/app/app.{html,ts}` o componente `offline-banner` en el shell (nuevo)

---

## P1 — Alto impacto para la audiencia 40+

### 4. Dictado por voz en campos de texto 🟢

**Problema:** escribir párrafos largos en teclado móvil es la fricción #1 para 40+. La "Descripción del problema" es el campo más importante y el más castigado.

**Diseño:**
- Botón micrófono (`matSuffix`, 48px) en el textarea de descripción usando **Web Speech API** (`SpeechRecognition`, `lang: 'es-PE'`).
- Estados claros: idle (mic) → grabando (mic rojo pulsante + "Escuchando…") → texto insertado en la posición del cursor.
- Detección de soporte: si el navegador no lo soporta (Firefox), el botón no se renderiza — cero ruido.
- Empezar SOLO en descripción; si funciona, extender al chat del ticket (P0-2).

**Archivos:**
- `src/app/core/directives/voice-input.directive.ts` (nuevo — reutilizable vía hostDirectives)
- `src/app/features/panel/pages/create-request/create-request.html` (botón en el form field de descripción)

---

### 5. Notificaciones de cambio de estado 🔴

**Problema:** el usuario crea el ticket y tiene que entrar a revisar manualmente si avanzó. Para un flujo de soporte, el valor está en avisarle.

**Diseño:**
- Fase 1 (in-app): campanita en el header con badge numérico; panel de no-leídas ("Tu solicitud TK-xxx pasó a En revisión"); marcar leída al tocar → navega al detalle.
- Fase 2 (push): Web Push + Service Worker (requiere PWA, ver P2-7) con permiso solicitado en contexto (tras crear el primer ticket, no al entrar).
- Badge también en el item "Solicitudes" de la bottom nav (punto `tertiary`).

**Archivos:**
- `src/app/features/panel/components/notifications/*` (nuevo)
- `src/app/core/services/notification-service.ts` (nuevo)
- `src/app/features/panel/components/header/header.html` + `bottom-nav/bottom-nav.html` (badges)
- Backend: tabla de notificaciones + endpoint; Fase 2: Web Push (VAPID)

---

### 6. Cancelar / reabrir solicitud 🟡

**Problema:** no hay ninguna acción sobre un ticket creado. Si el usuario se equivocó o el problema se resolvió solo, el ticket queda zombie e infla la cola de soporte.

**Diseño:**
- En el detalle: "Cancelar solicitud" (solo estado Pendiente/Abierto) como botón `outlined` con confirmación en `BottomSheet` (mobile) / `Dialog` (desktop) — texto claro: "Esta acción no se puede deshacer".
- "Reabrir" (solo Cerrado, ventana de 7 días) pidiendo motivo breve.
- Estado "Cancelado" nuevo: badge gris neutro en la lista.

**Archivos:**
- `src/app/features/panel/pages/ticket-detail/*` (acciones)
- `src/app/core/services/ticket-service.ts` (métodos cancel/reopen + update de caché)
- `src/app/features/panel/pages/my-request/my-request.css` (badge cancelado)
- Backend: transiciones de estado

---

## P2 — Madurez del producto

### 7. PWA instalable 🟢

**Problema:** el personal entra por URL cada vez; en mobile eso es fricción diaria.

**Diseño:** `@angular/pwa` (manifest + service worker), icono en home screen, splash con el badge azul, caché de shell para apertura instantánea. Prerrequisito para push (P1-5 fase 2).

**Archivos:** `ng add @angular/pwa` → `public/manifest.webmanifest`, `ngsw-config.json`, `src/index.html`, `app.config.ts` (provideServiceWorker)

### 8. Ajuste de tamaño de letra in-app 🟢

**Problema:** dentro de 40+ hay rangos muy distintos de visión; el sistema operativo no siempre está configurado.

**Diseño:** en el header (menú usuario), selector A− / A / A+ que escala `--app-font-scale` (CSS custom property sobre `rem` base), persistido en `localStorage`. Tres pasos: 100% / 112.5% / 125%.

**Archivos:** `src/app/core/services/font-scale-service.ts` (nuevo), `src/styles.css` (variable base), `header` (control)

### 9. Encuesta de satisfacción al cerrar ticket 🟡

**Problema:** soporte no tiene feedback de calidad de atención.

**Diseño:** al abrir un ticket recién Cerrado, tarjeta única con 3 emoji-botones gigantes (😞 😐 😊, 56px) + comentario opcional. Una sola pregunta, cero fricción. Se descarta con X y no vuelve a aparecer.

**Archivos:** `ticket-detail/components/satisfaction-card/*` (nuevo), backend: endpoint de rating

### 10. Búsqueda y paginación server-side 🟡

**Problema:** `GET /ticket` trae todo; con meses de uso la lista y el payload crecen sin límite.

**Diseño:** infinite scroll (IntersectionObserver) con páginas de 20 — para 40+ es mejor que paginación numerada; búsqueda y filtros como query params al backend; los filtros actuales (chips) se mantienen idénticos visualmente.

**Archivos:** `ticket-service.ts` (params + acumulación), `my-request.{ts,html}` (sentinel de scroll), backend: `?page=&search=&type=&priority=`

---

## Orden de ejecución sugerido

```
P0-1 Detalle ticket  ──►  P0-2 Chat  ──►  P1-5 Notificaciones (in-app)
   │
   ├──►  P0-3 Sesión/errores (paralelo, no depende de nada)
   └──►  P1-4 Voz (paralelo, solo frontend)

P1-6 Cancelar/reabrir  ──►  P2-9 Encuesta
P2-7 PWA  ──►  P1-5 fase push
P2-8 y P2-10 en cualquier momento
```

La regla del orden: **primero cerrar el ciclo de vida del ticket** (ver → conversar → enterarse → actuar). Todo lo demás multiplica valor solo si ese ciclo existe.
