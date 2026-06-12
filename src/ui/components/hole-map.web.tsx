import L from 'leaflet';
import { useEffect, useRef } from 'react';
import { Hole, LatLng } from '../../domain';
import { theme } from '../theme';

export interface HoleMapProps {
  hole: Hole;
  gps: LatLng | null;
  target: LatLng | null;
  playerInitial: string;
  aimDistance: number | null;
  aimClub?: string | null;
  toGreenDistance: number | null;
  toGreenClub?: string | null;
  unit: string;
  onMoveTarget: (p: LatLng) => void;
}

/** Teselas satélite gratuitas de Esri (atribución obligatoria). */
const ESRI_IMAGERY =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

const toLL = (p: LatLng): L.LatLngExpression => [p.lat, p.lng];
const mid = (a: LatLng, b: LatLng): LatLng => ({ lat: (a.lat + b.lat) / 2, lng: (a.lng + b.lng) / 2 });
const samePoint = (a: LatLng, b: LatLng) => a.lat === b.lat && a.lng === b.lng;
const FONT = 'Inter, system-ui, -apple-system, sans-serif';

/** Marcador GPS: círculo papel con borde/halo oliva e inicial. */
function gpsIconHtml(initial: string): string {
  return `<div style="width:38px;height:38px;border-radius:19px;background:${theme.colors.paper};
    border:3px solid ${theme.colors.accent};box-shadow:0 0 6px ${theme.colors.accent};
    display:flex;align-items:center;justify-content:center;font-family:${FONT};font-weight:700;
    color:${theme.colors.ink}">${initial.slice(0, 1).toUpperCase()}</div>`;
}

/** Objetivo: anillo beige con centro transparente (se ve el mapa). */
function targetIconHtml(): string {
  return `<div style="width:28px;height:28px;border-radius:14px;background:transparent;
    border:3px solid ${theme.colors.paper}"></div>`;
}

/** Chip de distancia (+ palo) centrado en el punto medio de una línea. */
function chipHtml(distance: number, unit: string, club: string | null | undefined, tone: 'ink' | 'accent'): string {
  const bg = tone === 'accent' ? theme.colors.accent : theme.colors.ink;
  const clubLine = club
    ? `<div style="font-size:10px;letter-spacing:1px;text-transform:uppercase;opacity:0.95">${club}</div>`
    : '';
  return `<div style="transform:translate(-50%,-50%);display:inline-block;white-space:nowrap;
    background:${bg};color:${theme.colors.accentOn};font-family:${FONT};text-align:center;
    border-radius:6px;padding:2px 8px"><div style="font-weight:700">${Math.round(distance)} ${unit}</div>${clubLine}</div>`;
}

const divIcon = (html: string, size: number): L.DivIcon =>
  L.divIcon({ html, className: '', iconSize: [size, size], iconAnchor: [size / 2, size / 2] });

/** Mapa satélite del hoyo en web (Leaflet). Mismo contrato que el HoleMap nativo. */
export function HoleMap(props: HoleMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const fittedHoleRef = useRef<number | null>(null);

  // onMoveTarget en un ref para no recrear el mapa cuando cambia la prop.
  const onMoveRef = useRef(props.onMoveTarget);
  onMoveRef.current = props.onMoveTarget;

  // Montaje único del mapa.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: true,
    }).setView(toLL(props.hole.green.center), 16);
    L.tileLayer(ESRI_IMAGERY, { maxZoom: 19, attribution: 'Imágenes © Esri' }).addTo(map);
    map.on('click', (e: L.LeafletMouseEvent) =>
      onMoveRef.current({ lat: e.latlng.lat, lng: e.latlng.lng }),
    );
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    // El contenedor puede no tener tamaño aún al montar → recalcular tras el layout.
    setTimeout(() => map.invalidateSize(), 0);
    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redibujar capas dinámicas cuando cambian los datos.
  useEffect(() => {
    const map = mapRef.current;
    const group = layerRef.current;
    if (!map || !group) return;
    const { hole, gps, target, playerInitial, aimDistance, aimClub, toGreenDistance, toGreenClub, unit } =
      props;
    const green = hole.green.center;
    const moved = target != null && !samePoint(target, green);

    group.clearLayers();

    if (hole.green.polygon && hole.green.polygon.length >= 3) {
      L.polygon(hole.green.polygon.map(toLL), {
        color: theme.colors.accent,
        weight: 2,
        fillColor: theme.colors.accent,
        fillOpacity: 0.35,
      }).addTo(group);
    }
    if (hole.playLine.length >= 2) {
      L.polyline(hole.playLine.map(toLL), { color: theme.colors.accentOn, weight: 2 }).addTo(group);
    }
    if (gps && target) {
      L.polyline([toLL(gps), toLL(target)], { color: theme.colors.paper, weight: 3 }).addTo(group);
    }
    if (target && moved) {
      L.polyline([toLL(target), toLL(green)], { color: theme.colors.paper, weight: 3 }).addTo(group);
    }
    if (gps) {
      L.marker(toLL(gps), { icon: divIcon(gpsIconHtml(playerInitial), 38), interactive: false }).addTo(
        group,
      );
    }
    if (target) {
      const m = L.marker(toLL(target), { icon: divIcon(targetIconHtml(), 28), draggable: true });
      m.on('dragend', () => {
        const p = m.getLatLng();
        onMoveRef.current({ lat: p.lat, lng: p.lng });
      });
      m.addTo(group);
    }
    if (gps && target && aimDistance != null) {
      L.marker(toLL(mid(gps, target)), {
        icon: L.divIcon({ html: chipHtml(aimDistance, unit, aimClub, 'ink'), className: '', iconSize: [0, 0] }),
        interactive: false,
      }).addTo(group);
    }
    if (target && moved && toGreenDistance != null) {
      L.marker(toLL(mid(target, green)), {
        icon: L.divIcon({
          html: chipHtml(toGreenDistance, unit, toGreenClub, 'accent'),
          className: '',
          iconSize: [0, 0],
        }),
        interactive: false,
      }).addTo(group);
    }

    // Encuadrar una vez por hoyo (no en cada actualización de GPS).
    if (fittedHoleRef.current !== hole.ref) {
      const pts = [...hole.tees, ...hole.playLine, green].map(toLL);
      if (pts.length > 0) {
        map.invalidateSize();
        map.fitBounds(L.latLngBounds(pts as L.LatLngExpression[]), { padding: [60, 60], maxZoom: 18 });
      }
      fittedHoleRef.current = hole.ref;
    }
  }, [props]);

  return <div ref={containerRef} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />;
}
