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
  target: LatLng | null;
  playerInitial: string;
  /** Distancia GPS→objetivo, ya en la unidad del perfil (para el chip sobre la línea). */
  aimDistance: number | null;
  unit: string;
  onPressMap: (p: LatLng) => void;
}

/** Convierte el modelo de dominio {lat,lng} al {latitude,longitude} de react-native-maps. */
const toRN = (p: LatLng): RNLatLng => ({ latitude: p.lat, longitude: p.lng });

/** Mapa satélite del hoyo: green, línea de juego, GPS, objetivo y línea de tiro. */
export function HoleMap({
  hole,
  gps,
  target,
  playerInitial,
  aimDistance,
  unit,
  onPressMap,
}: HoleMapProps) {
  const mapRef = useRef<MapView>(null);

  // Encuadrar el hoyo (tees + línea de juego + centro de green) al cargarlo.
  useEffect(() => {
    const frame: LatLng[] = [...hole.tees, ...hole.playLine, hole.green.center];
    if (frame.length === 0) return;
    const id = setTimeout(() => {
      mapRef.current?.fitToCoordinates(frame.map(toRN), {
        edgePadding: { top: 120, right: 60, bottom: 160, left: 60 },
        animated: true,
      });
    }, 300);
    return () => clearTimeout(id);
  }, [hole]);

  const midpoint =
    gps && target ? { lat: (gps.lat + target.lat) / 2, lng: (gps.lng + target.lng) / 2 } : null;

  return (
    <MapView
      ref={mapRef}
      style={StyleSheet.absoluteFill}
      mapType="satellite"
      initialRegion={{
        latitude: hole.green.center.lat,
        longitude: hole.green.center.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
      onPress={(e) => {
        const c = e.nativeEvent.coordinate;
        onPressMap({ lat: c.latitude, lng: c.longitude });
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

      {gps && target ? (
        <Polyline coordinates={[gps, target].map(toRN)} strokeColor={theme.colors.ink} strokeWidth={3} />
      ) : null}

      {gps ? (
        <Marker coordinate={toRN(gps)} anchor={{ x: 0.5, y: 0.5 }}>
          <GpsMarker initial={playerInitial} />
        </Marker>
      ) : null}

      {target ? (
        <Marker coordinate={toRN(target)} anchor={{ x: 0.5, y: 0.5 }}>
          <TargetMarker />
        </Marker>
      ) : null}

      {midpoint && aimDistance != null ? (
        <Marker coordinate={toRN(midpoint)} anchor={{ x: 0.5, y: 0.5 }}>
          <DistanceChip distance={aimDistance} unit={unit} />
        </Marker>
      ) : null}
    </MapView>
  );
}
