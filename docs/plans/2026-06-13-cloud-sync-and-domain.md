# Plan — Cuentas + sincronización en la nube, y dominio estable

**Fecha:** 2026-06-13 · **Estado:** propuesta para una sesión nueva (no implementado).
**Contexto:** la app es hoy **local-first sin cuentas** (decisión del spec original).
Tras testear la PWA, el usuario quiere: (1) **cuentas online con datos en la nube**
(jugar desde varios dispositivos y no perder datos cuando iOS purga el
almacenamiento de PWAs ~7 días), y (2) un **dominio estable** que sirva el último
deploy sin pedir login (el login actual es la *protección de Vercel*, no la app).

> **Cambio de filosofía a registrar:** pasamos de "local-first, sin nube" a
> **"local-first con sincronización opcional en la nube"**. La app debe **seguir
> funcionando sin cuenta** (modo invitado, offline); iniciar sesión **añade**
> sincronización y respaldo. Actualizar el spec de producto al implementarlo.

---

## Parte A — Cuentas + sincronización en la nube

### A.0 Decisiones a confirmar con el usuario (al arrancar la sesión)
1. **Backend:** **Supabase** (recomendado: Auth + Postgres + RLS + cliente JS, gratis
   para empezar, web + nativo) vs Firebase. El plan asume Supabase.
2. **Método de login:** magic link por email (sin contraseña, mínima fricción) /
   Google / Apple / email+contraseña. Recomendado para MVP: **magic link** (+ añadir
   Apple/Google después; Apple Sign-In será obligatorio para la App Store nativa).
3. **Modelo:** **cuenta opcional** (invitado por defecto; "Inicia sesión para
   sincronizar" en Perfil). Recomendado — preserva la baja fricción y resuelve el
   borrado de datos solo para quien quiera.
4. **Conflictos:** last-write-wins por `updated_at` (MVP; los datos son pequeños y de
   un solo usuario en varios dispositivos).

### A.1 Por qué encaja bien con el código actual
La capa de almacenamiento ya está **desacoplada**: `AppRepository` opera sobre el
puerto `KeyValueStore` (`get/set/remove`), con `InMemoryStore` y `AsyncStorageStore`.
Esto permite añadir la nube **sin reescribir** la lógica de la app.

### A.2 Arquitectura propuesta (MVP, mínima superficie)
- **Tabla KV en Supabase** `user_data(user_id uuid, key text, value jsonb, updated_at)`,
  PK `(user_id, key)`, con **RLS**: cada usuario solo lee/escribe sus filas
  (`auth.uid() = user_id`). Reutiliza las mismas keys de hoy
  (`yardagebook:profile`, `:club-matrix`, `:course-history`).
- **`SupabaseStore implements KeyValueStore`** (en `src/services/storage/`): get/set/
  remove contra esa tabla para el usuario autenticado.
- **`createAppRepository()`** elige backend según sesión: si hay usuario →
  `SupabaseStore` (con `AsyncStorageStore` como caché/offline); si no → local como hoy.
- **Sincronización al iniciar sesión:** si el usuario tenía datos locales (invitado) y
  la nube está vacía → **subir** (migración); si la nube tiene datos → **bajar** y
  cachear local. Después, escritura *write-through* (local + nube).
- **Offline:** escribir local siempre; reintentar la nube cuando haya red (cola simple
  o re-sync al reabrir). Para MVP basta write-through con captura de error + re-sync.

> Alternativa más "relacional" (tablas tipadas `profiles`/`matrices`/`history`):
> más limpia a largo plazo pero más trabajo. Dejar para una iteración posterior; el
> KV con JSONB es suficiente para el MVP y mapea 1:1 con `AppRepository`.

### A.3 Auth (Supabase Auth)
- Deps: `@supabase/supabase-js` + en nativo `react-native-url-polyfill` y AsyncStorage
  como `storage` de la sesión de auth. En web funciona directo.
- Cliente único `src/services/auth/supabase.ts` con URL + anon key desde
  **`EXPO_PUBLIC_SUPABASE_URL`** / **`EXPO_PUBLIC_SUPABASE_ANON_KEY`** (la anon key es
  pública; la seguridad la da **RLS**).
- **Contexto de sesión** (`AuthProvider`) que expone `user`, `signIn`, `signOut`.
- **UI:** pantalla/hoja de inicio de sesión (magic link: pide email → enlace).
  Entrada desde **Perfil** ("Inicia sesión para sincronizar" / "Cerrar sesión").
  Magic link en web vuelve por *deep link* (`scheme: yardagebook` / URL de redirect);
  configurar redirect URLs en Supabase (web prod, previews y `exp://` para nativo).

### A.4 Pasos de implementación
1. Crear proyecto Supabase; tabla `user_data` + políticas RLS; habilitar Auth (email).
2. Deps + cliente Supabase + polyfills nativos + variables `EXPO_PUBLIC_*`
   (local `.env` y en Vercel).
3. `AuthProvider` + pantalla de login (magic link) + entradas en Perfil.
4. `SupabaseStore` (KeyValueStore) + `createAppRepository()` consciente de sesión +
   caché local.
5. Lógica de sync al iniciar sesión (migración invitado→nube / nube→local) y
   write-through con re-sync.
6. Tests: `SupabaseStore` con cliente mock (round-trip, RLS no testeable en unit);
   sync (merge/last-write-wins) como lógica pura testeable.
7. Verificar: typecheck + lint + test + `npm run build:web`; probar login + sync en 2
   dispositivos.
8. Actualizar spec de producto (local-first → + sync opcional) y PROGRESS.

### A.5 Riesgos / notas
- **Secretos:** solo anon key en cliente (pública); nunca la service_role key.
- **Coste:** Supabase free tier sobra para el MVP.
- **Privacidad:** ahora SÍ se guardan datos en la nube → actualizar la nota de
  privacidad ("Tus datos…") y, de cara a tiendas, la política de privacidad.
- **Nativo (futuro):** el mismo cliente vale; Apple Sign-In obligatorio si hay social
  login en App Store.

---

## Parte B — Dominio estable + quitar el login de Vercel

### B.1 Quitar el "iniciar sesión" de Vercel (inmediato, sin sesión nueva)
Es la **Deployment Protection** de Vercel sobre previews. En el dashboard:
**Project → Settings → Deployment Protection → Vercel Authentication → Disabled**
(o "Only Preview Comments" / "Standard Protection only on production = off"). Tras
esto, las URLs no piden login.

### B.2 URL estable de producción
- **Merge de `feat/pwa-mvp` (#13) a `main`** → Vercel publica el deploy de
  **producción** con URL estable (p. ej. `yardage-book.vercel.app`), que **siempre
  sirve el último `main`**. Los previews (por rama) mantienen su URL para pruebas.
- Esa URL de producción es la **buena para compartir** con los amigos del club.

### B.3 Dominio propio (opcional, recomendado para compartir)
1. Comprar un dominio (p. ej. `yardagebook.app` / `.golf` / `.es`) en cualquier
   registrador, o usar uno existente.
2. Vercel → **Project → Settings → Domains** → añadir el dominio → asignarlo a
   **Production**.
3. Configurar DNS según indique Vercel (registro `A`/`CNAME`). HTTPS automático.
4. Actualizar `start_url`/`scope` del manifest si cambia el origen (siguen siendo `/`,
   así que no hace falta tocar nada salvo que se use subruta).

### B.4 Notas
- Con dominio propio + producción, **un solo enlace estable** para todos; los deploys
  de `main` se reflejan ahí automáticamente. Sin logins de Vercel.
- El service worker ya es network-first → los usuarios verán siempre el último deploy.

---

## Orden sugerido para la sesión nueva
1. **Parte B primero** (rápido): quitar protección Vercel + merge #13 → URL estable
   (+ dominio si se quiere). Desbloquea compartir y testear sin fricción.
2. **Parte A** (cuentas + sync): el grueso. Confirmar decisiones A.0 y ejecutar A.4.

---

## Prompt para la sesión nueva (copiar y pegar)

> Continúo con YardageBook (Expo SDK 54 + React Native + TypeScript, repo
> `pablorenedolastra/YardageBook`, entrega actual como **PWA** en Vercel). Lee primero
> `docs/PROGRESS.md` y el plan `docs/plans/2026-06-13-cloud-sync-and-domain.md`.
>
> Quiero hacer dos cosas siguiendo el flujo del repo (rama feature → plan →
> TDD en lógica pura + smoke en componentes → typecheck/lint/test + `npm run build:web`
> → PR):
>
> 1. **Dominio estable + quitar el login de Vercel** (Parte B del plan): guíame para
>    desactivar la Deployment Protection de Vercel, mergear el PR de la PWA a `main`
>    para tener URL de producción estable, y (opcional) conectar un dominio propio.
>
> 2. **Cuentas online con sincronización en la nube** (Parte A del plan):
>    **local-first con sync opcional** (la app sigue funcionando sin cuenta; iniciar
>    sesión añade respaldo/sync entre dispositivos y evita el borrado de datos de iOS).
>    Usa **Supabase** (Auth + tabla KV con RLS) reutilizando la abstracción
>    `AppRepository`/`KeyValueStore` ya existente. Empieza confirmando conmigo las
>    decisiones de A.0 (método de login, etc.) antes de escribir código.
>
> Antes de implementar la Parte A, dime exactamente qué tengo que crear/configurar yo
> en Supabase y en Vercel (proyecto, tabla, políticas RLS, variables de entorno) paso
> a paso, porque eso lo hago yo en sus paneles.
