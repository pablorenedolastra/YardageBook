# Desplegar la PWA

La app se entrega como **PWA** (web) para el MVP. La nativa (react-native-maps) se
publicará más adelante desde el mismo repo.

## Build

```bash
npm run build:web      # = expo export --platform web + inyección de cabecera PWA
```

Genera el sitio estático en **`dist/`** (gitignored). Incluye `index.html` (con
manifest, meta de iOS y registro del service worker), `manifest.json`, `sw.js`,
`icon.png` y el bundle JS.

## Hosting (estático, HTTPS obligatorio)

HTTPS es **imprescindible**: sin él no funcionan ni el service worker ni la
geolocalización. Sirve `dist/` **en la raíz del dominio** en cualquiera de:

- **Netlify**: build command `npm run build:web`, publish directory `dist`.
- **Vercel**: framework "Other", build `npm run build:web`, output `dist`.
- **Cloudflare Pages**: build `npm run build:web`, output `dist`.

Todas dan HTTPS gratis y sirven en la raíz (`/`), que es lo que esperan el manifest
y el SW (rutas absolutas `/manifest.json`, `/sw.js`).

> **GitHub Pages (project site)** sirve bajo `/<repo>/`, lo que rompe las rutas
> absolutas del manifest/SW. Si se quisiera usar, habría que configurar `baseUrl` en
> Expo y rutas relativas. Más simple: Netlify/Vercel/Cloudflare.

## Probar en el iPhone

1. Abre la **URL desplegada** en Safari (el service worker **no** se registra en
   `localhost`, solo en producción).
2. **Compartir → Añadir a pantalla de inicio**. Esto:
   - la abre a pantalla completa (standalone),
   - hace el almacenamiento **más persistente** (mitiga el borrado de datos que
     Safari aplica a PWAs no instaladas tras ~7 días).
3. Concede el permiso de **ubicación** cuando entres a un hoyo.

## Notas

- **Mapa web:** Leaflet + teselas satélite de **Esri World Imagery** (gratis, con
  atribución "Imágenes © Esri"). Datos de campos © OpenStreetMap (ODbL).
- **Offline:** el SW cachea el shell de la app, los datos de campos y las teselas ya
  vistas. El fondo satélite de zonas nuevas necesita cobertura (igual que en nativo).
- El botón "Simular GPS en el tee" solo aparece en desarrollo (`__DEV__`), no en el
  build de producción.
