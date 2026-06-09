#!/usr/bin/env node
/**
 * fetch-courses.mjs — Proveedor de datos de campos de golf desde OpenStreetMap.
 *
 * Descarga la geometría de un campo de golf vía Overpass API y la normaliza al
 * modelo de dominio de YardageBook (Course/Hole/GreenInfo). Pensado para correr
 * en BUILD-TIME (no en el dispositivo): el resultado se versiona como asset JSON
 * y la app lo lee offline. Ver docs/specs/2026-06-05-courses-provider-osm.md.
 *
 * Uso:
 *   node scripts/fetch-courses.mjs --name "Valderrama"        # por nombre
 *   node scripts/fetch-courses.mjs --osm-way 12345            # por id de way
 *   node scripts/fetch-courses.mjs --name "Valderrama" --out assets/courses/valderrama.json
 *
 * Sin dependencias externas: usa fetch global (Node >= 18) y fs.
 * Datos © OpenStreetMap contributors, ODbL 1.0.
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];
const USER_AGENT = 'YardageBook/0.1 (+https://github.com/; build-time course fetch)';

// ---------------------------------------------------------------------------
// 1) QUERY OVERPASS  (validada: leisure=golf_course -> map_to_area -> golf=*)
// ---------------------------------------------------------------------------

/** Construye la query Overpass QL para un campo por nombre o por id de way. */
function buildQuery({ name, osmWay }) {
  const selector = osmWay
    ? `way(${Number(osmWay)})`
    : `way["leisure"="golf_course"]["name"~"${escapeRegex(name)}",i]`;
  // .c = el polígono del campo (para id estable + centroide); .course = su área.
  return `
[out:json][timeout:90];
${selector}->.c;
.c map_to_area->.course;
(
  .c;
  nwr(area.course)["golf"];
);
out geom;`.trim();
}

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Lanza la query con failover entre endpoints públicos. */
async function runOverpass(query) {
  let lastErr;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': USER_AGENT,
        },
        body: 'data=' + encodeURIComponent(query),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} en ${endpoint}`);
      const json = await res.json();
      if (!json.elements) throw new Error('respuesta sin "elements"');
      return json.elements;
    } catch (err) {
      lastErr = err;
      console.warn(`  ⚠ ${endpoint}: ${err.message} — probando siguiente mirror…`);
    }
  }
  throw new Error(`Todos los endpoints Overpass fallaron: ${lastErr?.message}`);
}

// ---------------------------------------------------------------------------
// 2) GEOMETRÍA  (centroide de polígono + haversine)
// ---------------------------------------------------------------------------

/** Centroide area-weighted (shoelace) de un anillo [{lat,lon}...]; cae a media de vértices si degenerado. */
function polygonCentroid(ring) {
  if (!ring || ring.length === 0) return null;
  let area = 0,
    cx = 0,
    cy = 0;
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i];
    const b = ring[(i + 1) % ring.length];
    const cross = a.lon * b.lat - b.lon * a.lat;
    area += cross;
    cx += (a.lon + b.lon) * cross;
    cy += (a.lat + b.lat) * cross;
  }
  area *= 0.5;
  if (Math.abs(area) < 1e-12) {
    // Anillo degenerado/lineal: media simple de vértices.
    const n = ring.length;
    return {
      lat: ring.reduce((s, p) => s + p.lat, 0) / n,
      lng: ring.reduce((s, p) => s + p.lon, 0) / n,
    };
  }
  return { lat: cy / (6 * area), lng: cx / (6 * area) };
}

/** Distancia haversine en metros entre dos {lat,lng|lon}. */
function haversine(a, b) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const lat1 = a.lat,
    lng1 = a.lng ?? a.lon;
  const lat2 = b.lat,
    lng2 = b.lng ?? b.lon;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/** Devuelve el anillo de coords de un elemento OSM way (out geom -> e.geometry). */
function ringOf(el) {
  if (el.type === 'way' && Array.isArray(el.geometry)) {
    return el.geometry.map((p) => ({ lat: p.lat, lon: p.lon }));
  }
  // Relación multipolígono: usar el anillo exterior más largo de sus miembros.
  if (el.type === 'relation' && Array.isArray(el.members)) {
    const outers = el.members
      .filter((m) => m.role === 'outer' && Array.isArray(m.geometry))
      .map((m) => m.geometry.map((p) => ({ lat: p.lat, lon: p.lon })));
    return outers.sort((x, y) => y.length - x.length)[0] ?? null;
  }
  return null;
}

/** Centroide de cualquier elemento OSM (way/relation con geom, o node). */
function centroidOf(el) {
  if (el.type === 'node') return { lat: el.lat, lng: el.lon };
  return polygonCentroid(ringOf(el));
}

// ---------------------------------------------------------------------------
// 3) TRANSFORMACIÓN OSM -> dominio
// ---------------------------------------------------------------------------

/**
 * Asocia cada golf=hole con su green: de los dos extremos de la línea de juego,
 * el "lado del pin" es el extremo más cercano a algún green; ese green es el suyo.
 */
function transform(elements, fallbackName) {
  const greens = elements.filter((e) => e.tags?.golf === 'green');
  const tees = elements.filter((e) => e.tags?.golf === 'tee');
  const holeWays = elements
    .filter((e) => e.tags?.golf === 'hole' && Array.isArray(e.geometry) && e.geometry.length >= 2)
    .map((e) => ({ el: e, ref: parseInt(e.tags.ref, 10) }))
    .sort((a, b) => (a.ref || 0) - (b.ref || 0));

  const courseEl = elements.find((e) => e.tags?.leisure === 'golf_course');
  const courseName = courseEl?.tags?.name ?? fallbackName ?? 'Campo sin nombre';

  // Centroides de greens precalculados.
  const greenCentroids = greens.map((g) => ({ el: g, c: centroidOf(g) })).filter((g) => g.c);

  const holes = holeWays.map(({ el, ref }) => {
    const start = el.geometry[0];
    const end = el.geometry[el.geometry.length - 1];

    // ¿Qué extremo es el green? El que tenga el green más cercano.
    const nearestGreen = (pt) =>
      greenCentroids.reduce(
        (best, g) => {
          const d = haversine({ lat: pt.lat, lng: pt.lon }, g.c);
          return d < best.d ? { d, green: g } : best;
        },
        { d: Infinity, green: null },
      );
    const ng = nearestGreen(end);
    const ns = nearestGreen(start);
    const pinSide = ng.d <= ns.d ? ng : ns;
    const teeSide = ng.d <= ns.d ? start : end;

    const greenPolygon = pinSide.green ? ringOf(pinSide.green.el) : null;

    // Tees del hoyo: por ref coincidente si existe; si no, los cercanos al lado del tee.
    const teePoints = tees
      .filter((t) => {
        if (t.tags?.ref && parseInt(t.tags.ref, 10) === ref) return true;
        const c = centroidOf(t);
        return c && haversine({ lat: teeSide.lat, lng: teeSide.lon }, c) < 60;
      })
      .map((t) => centroidOf(t))
      .filter(Boolean);

    return {
      ref,
      par: el.tags.par ? parseInt(el.tags.par, 10) : undefined,
      strokeIndex: el.tags.handicap ? parseInt(el.tags.handicap, 10) : undefined,
      green: {
        center: pinSide.green ? pinSide.green.c : null,
        polygon: greenPolygon ? greenPolygon.map((p) => ({ lat: p.lat, lng: p.lon })) : undefined,
      },
      tees: teePoints,
      // línea de juego completa (para encuadrar el mapa y dibujar)
      playLine: el.geometry.map((p) => ({ lat: p.lat, lng: p.lon })),
    };
  });

  // Centro del campo: centroide del polígono del campo, o media de greens.
  const location =
    (courseEl && centroidOf(courseEl)) ||
    (greenCentroids.length
      ? {
          lat: greenCentroids.reduce((s, g) => s + g.c.lat, 0) / greenCentroids.length,
          lng: greenCentroids.reduce((s, g) => s + g.c.lng, 0) / greenCentroids.length,
        }
      : null);

  return {
    id: courseEl ? `osm-${courseEl.type}-${courseEl.id}` : `osm-unknown-${courseName}`,
    name: courseName,
    source: 'osm',
    location,
    holeCount: holes.length,
    holes,
    attribution: '© OpenStreetMap contributors (ODbL 1.0)',
  };
}

// ---------------------------------------------------------------------------
// 4) CLI
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--name') out.name = argv[++i];
    else if (a === '--osm-way') out.osmWay = argv[++i];
    else if (a === '--out') out.out = argv[++i];
  }
  return out;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.name && !args.osmWay) {
    console.error('Uso: node scripts/fetch-courses.mjs --name "Valderrama" [--out file.json]');
    process.exit(1);
  }
  console.log(`→ Consultando Overpass para "${args.name ?? 'way ' + args.osmWay}"…`);
  const elements = await runOverpass(buildQuery(args));
  console.log(`  ${elements.length} elementos golf=* recibidos.`);
  const course = transform(elements, args.name);

  const withGreen = course.holes.filter((h) => h.green.center).length;
  console.log(
    `  Campo: ${course.name} — ${course.holeCount} hoyos, ${withGreen} con centro de green.`,
  );

  const json = JSON.stringify(course, null, 2);
  if (args.out) {
    mkdirSync(dirname(args.out), { recursive: true });
    writeFileSync(args.out, json);
    console.log(`✓ Escrito en ${args.out}`);
  } else {
    console.log(json);
  }
}

main().catch((err) => {
  console.error('✗ Error:', err.message);
  process.exit(1);
});

export { buildQuery, transform, polygonCentroid, haversine };
