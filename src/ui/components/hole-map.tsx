import { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker, Polygon, Polyline, type LatLng as RNLatLng } from 'react-native-maps';
import { Hole, LatLng } from '../../domain';
import { theme, withOpacity } from '../theme';
import { DistanceChip } from './distance-chip';
import { GpsMarker } from './gps-marker';
import { TargetMarker } from './target-marker';

export interface HoleMapProps {
  hole: Hole;
  gps: LatLng | null;
  /** Objetivo movible. Por defecto el centro del green (lo fija la pantalla). */
  target: LatLng | null;
  playerInitial: string;
  /** Distancia GPS→objetivo, ya en la unidad del perfil (chip sobre la línea de tiro). */
  aimDistance: number | null;
  /** Palo recomendado para la distancia GPS→objetivo. */
  aimClub?: string | null;
  /** Distancia objetivo→centro del green, ya en la unidad del perfil. */
  toGreenDistance: number | null;
  /** Palo recomendado para la distancia objetivo→green. */
  toGreenClub?: string | null;
  unit: string;
  /** Recolocar el objetivo (tocar el mapa o arrastrar el marcador). */
  onMoveTarget: (p: LatLng) => void;
}

/** Convierte el modelo de dominio {lat,lng} al {latitude,longitude} de react-native-maps. */
const toRN = (p: LatLng): RNLatLng => ({ latitude: p.lat, longitude: p.lng });

const midpoint = (a: LatLng, b: LatLng): LatLng => ({
  lat: (a.lat + b.lat) / 2,
  lng: (a.lng + b.lng) / 2,
});

const samePoint = (a: LatLng, b: LatLng): boolean => a.lat === b.lat && a.lng === b.lng;

/** Mapa satélite del hoyo: green, línea de juego, GPS, objetivo movible y medidas. */
export function HoleMap({
  hole,
  gps,
  target,
  playerInitial,
  aimDistance,
  aimClub,
  toGreenDistance,
  toGreenClub,
  unit,
  onMoveTarget,
}: HoleMapProps) {
  const mapRef = useRef<MapView>(null);
  const green = hole.green.center;

  // Encuadrar el hoyo (tees + línea de juego + centro de green) al cargarlo.
  useEffect(() => {
    const frame: LatLng[] = [...hole.tees, ...hole.playLine, green];
    if (frame.length === 0) return;
    const id = setTimeout(() => {
      mapRef.current?.fitToCoordinates(frame.map(toRN), {
        edgePadding: { top: 120, right: 60, bottom: 160, left: 60 },
        animated: true,
      });
    }, 300);
    return () => clearTimeout(id);
  }, [hole, green]);

  // El objetivo→green solo se dibuja cuando el objetivo se ha movido del centro.
  const movedFromGreen = target != null && !samePoint(target, green);

  return (
    <MapView
      ref={mapRef}
      style={StyleSheet.absoluteFill}
      mapType="satellite"
      initialRegion={{
        latitude: green.lat,
        longitude: green.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
      onPress={(e) => {
        const c = e.nativeEvent.coordinate;
        onMoveTarget({ lat: c.latitude, lng: c.longitude });
      }}
    >
      {hole.green.polygon && hole.green.polygon.length >= 3 ? (
        <Polygon
          coordinates={hole.green.polygon.map(toRN)}
          strokeColor={theme.colors.accent}
          fillColor={withOpacity(theme.colors.accent, 0.35)}
          strokeWidth={2}
        />
      ) : null}

      {hole.playLine.length >= 2 ? (
        <Polyline
          coordinates={hole.playLine.map(toRN)}
          strokeColor={theme.colors.accentOn}
          strokeWidth={2}
        />
      ) : null}

      {/* Línea de tiro: GPS → objetivo. Beige para no confundirse con el verde del campo. */}
      {gps && target ? (
        <Polyline
          coordinates={[gps, target].map(toRN)}
          strokeColor={theme.colors.paper}
          strokeWidth={3}
        />
      ) : null}

      {/* Línea objetivo → centro del green (beige), solo si el objetivo se ha movido */}
      {target && movedFromGreen ? (
        <Polyline
          coordinates={[target, green].map(toRN)}
          strokeColor={theme.colors.paper}
          strokeWidth={3}
        />
      ) : null}

      {gps ? (
        <Marker coordinate={toRN(gps)} anchor={{ x: 0.5, y: 0.5 }}>
          <GpsMarker initial={playerInitial} />
        </Marker>
      ) : null}

      {/* Objetivo movible: arrastrar o tocar el mapa */}
      {target ? (
        <Marker
          coordinate={toRN(target)}
          anchor={{ x: 0.5, y: 0.5 }}
          draggable
          onDragEnd={(e) => {
            const c = e.nativeEvent.coordinate;
            onMoveTarget({ lat: c.latitude, lng: c.longitude });
          }}
        >
          <TargetMarker color={theme.colors.paper} />
        </Marker>
      ) : null}

      {/* Chip distancia de tiro (GPS→objetivo) en el punto medio de su línea */}
      {gps && target && aimDistance != null ? (
        <Marker coordinate={toRN(midpoint(gps, target))} anchor={{ x: 0.5, y: 0.5 }}>
          <DistanceChip distance={aimDistance} unit={unit} tone="ink" club={aimClub} />
        </Marker>
      ) : null}

      {/* Chip distancia objetivo→green en el punto medio de su línea */}
      {target && movedFromGreen && toGreenDistance != null ? (
        <Marker coordinate={toRN(midpoint(target, green))} anchor={{ x: 0.5, y: 0.5 }}>
          <DistanceChip distance={toGreenDistance} unit={unit} tone="accent" club={toGreenClub} />
        </Marker>
      ) : null}
    </MapView>
  );
}
