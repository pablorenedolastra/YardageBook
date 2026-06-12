#!/usr/bin/env node
/**
 * pwa-postbuild.mjs — Inyecta la cabecera PWA en dist/index.html tras `expo export`.
 *
 * Expo Router en modo SPA (web.output: "single") usa una plantilla por defecto e
 * ignora app/+html.tsx, así que añadimos aquí: manifest, meta de iOS (añadir a
 * inicio), CSS de Leaflet (CDN, cacheada por el SW) y el registro del service worker.
 * Idempotente: si ya está inyectado, no duplica.
 *
 * Uso: node scripts/pwa-postbuild.mjs   (lo encadena `npm run build:web`)
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const INDEX = 'dist/index.html';

if (!existsSync(INDEX)) {
  console.error(`✗ No existe ${INDEX}. Ejecuta antes: npx expo export --platform web`);
  process.exit(1);
}

let html = readFileSync(INDEX, 'utf8');

if (html.includes('rel="manifest"')) {
  console.log('✓ La cabecera PWA ya estaba inyectada. Nada que hacer.');
  process.exit(0);
}

const HEAD = `
    <meta name="theme-color" content="#EFE7D6" />
    <link rel="manifest" href="/manifest.json" />
    <link rel="apple-touch-icon" href="/icon.png" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="YardageBook" />
    <meta name="mobile-web-app-capable" content="yes" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin="" />
    <script>
      if ('serviceWorker' in navigator && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
        window.addEventListener('load', function () { navigator.serviceWorker.register('/sw.js').catch(function () {}); });
      }
    </script>
`;

// Inyectar antes de </head>.
html = html.replace('</head>', `${HEAD}  </head>`);

// Viewport apto para PWA a pantalla completa (notch/safe-area, sin zoom).
html = html.replace(
  /<meta name="viewport"[^>]*\/>/,
  '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />',
);

// Idioma.
html = html.replace('<html lang="en">', '<html lang="es">');

writeFileSync(INDEX, html);
console.log('✓ Cabecera PWA inyectada en dist/index.html (manifest, iOS, Leaflet CSS, service worker).');
