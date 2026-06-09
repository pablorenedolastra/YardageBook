import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ClubMatrix,
  Course,
  LatLng,
  Profile,
  haversineMeters,
  recommendClub,
} from '../../src/domain';
import { createCourseProvider } from '../../src/services/courses';
import { createAppRepository } from '../../src/services/storage';
import { AppBackground } from '../../src/ui/components/app-background';
import { GreenCenterChip } from '../../src/ui/components/green-center-chip';
import { HoleMap } from '../../src/ui/components/hole-map';
import { HoleNavBar } from '../../src/ui/components/hole-nav-bar';
import { PlaysLikeToggle } from '../../src/ui/components/plays-like-toggle';
import { PrimaryButton } from '../../src/ui/components/primary-button';
import { RecommendationBar } from '../../src/ui/components/recommendation-bar';
import { toUnitDistance, unitLabel } from '../../src/ui/forms/units-format';
import { clampHoleIndex, nextHole, prevHole } from '../../src/ui/game/hole-navigation';
import { theme } from '../../src/ui/theme';

type Permission = 'pending' | 'granted' | 'denied';

export default function HoleScreen() {
  const router = useRouter();
  const { courseId } = useLocalSearchParams<{ courseId: string }>();

  const [course, setCourse] = useState<Course | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [matrix, setMatrix] = useState<ClubMatrix | null>(null);
  const [loading, setLoading] = useState(true);

  const [permission, setPermission] = useState<Permission>('pending');
  const [gps, setGps] = useState<LatLng | null>(null);

  const [holeIndex, setHoleIndex] = useState(1);
  const [target, setTarget] = useState<LatLng | null>(null);
  const [playsLike, setPlaysLike] = useState(false);

  // Cargar campo + perfil + matriz.
  useEffect(() => {
    let active = true;
    const repo = createAppRepository();
    Promise.all([
      createCourseProvider().getCourse(courseId),
      repo.loadProfile(),
      repo.loadMatrix(),
    ]).then(([c, p, m]) => {
      if (!active) return;
      setCourse(c);
      setProfile(p);
      setMatrix(m);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [courseId]);

  // Permiso + seguimiento de GPS.
  useEffect(() => {
    let active = true;
    let sub: Location.LocationSubscription | undefined;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (!active) return;
      if (status !== 'granted') {
        setPermission('denied');
        return;
      }
      setPermission('granted');
      sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 1 },
        (loc) => setGps({ lat: loc.coords.latitude, lng: loc.coords.longitude }),
      );
    })();
    return () => {
      active = false;
      sub?.remove();
    };
  }, []);

  const requestPermissionAgain = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setPermission(status === 'granted' ? 'granted' : 'denied');
  }, []);

  const holes = course?.holes ?? [];
  const currentRefIndex = clampHoleIndex(holeIndex, holes.length);
  const hole = holes[currentRefIndex - 1] ?? null;

  const unit = profile?.unit ?? 'meters';
  const unitL = unitLabel(unit);
  const playerInitial = profile?.firstName?.slice(0, 1) ?? '?';

  // Distancia y recomendación (Plays Like OFF: elevación 0, sin meteo).
  // NOTA: con Plays Like ON la recomendación no cambia todavía; la fuente de
  // desnivel/meteo es una decisión abierta (ver plan Inc.7 §Decisiones).
  const aimDistance = useMemo(() => {
    if (!gps || !target) return null;
    return toUnitDistance(haversineMeters(gps, target), unit);
  }, [gps, target, unit]);

  const recommendation = useMemo(() => {
    if (!matrix || aimDistance == null) return null;
    return recommendClub({ targetDistance: aimDistance, matrix, elevationChange: 0 });
  }, [matrix, aimDistance]);

  const greenDistance = useMemo(() => {
    if (!gps || !hole) return null;
    return toUnitDistance(haversineMeters(gps, hole.green.center), unit);
  }, [gps, hole, unit]);

  const goPrev = () => {
    setHoleIndex((i) => prevHole(i, holes.length));
    setTarget(null);
  };
  const goNext = () => {
    setHoleIndex((i) => nextHole(i, holes.length));
    setTarget(null);
  };

  const insets = useSafeAreaInsets();

  if (loading) {
    return (
      <AppBackground>
        <View style={{ flex: 1 }} />
      </AppBackground>
    );
  }

  if (!course || !hole) {
    return (
      <AppBackground>
        <View style={styles.centered}>
          <Text style={[theme.textVariants.body, { color: theme.colors.muted }]}>
            No se ha podido cargar el campo.
          </Text>
          <PrimaryButton title="Volver" onPress={() => router.back()} />
        </View>
      </AppBackground>
    );
  }

  if (permission === 'denied') {
    return (
      <AppBackground>
        <View style={styles.centered}>
          <Text style={[theme.textVariants.titleApp, { color: theme.colors.ink }]}>
            Necesitamos tu ubicación
          </Text>
          <Text
            style={[theme.textVariants.body, { color: theme.colors.muted, textAlign: 'center' }]}
          >
            YardageBook mide la distancia desde tu posición GPS hasta el punto que toques en el
            mapa. Concede el permiso de ubicación para jugar.
          </Text>
          <PrimaryButton title="Conceder permiso" onPress={requestPermissionAgain} />
          <Pressable accessibilityRole="button" onPress={() => router.back()}>
            <Text style={[theme.textVariants.bodyStrong, { color: theme.colors.accent }]}>
              ‹ Campos
            </Text>
          </Pressable>
        </View>
      </AppBackground>
    );
  }

  return (
    <View style={styles.root}>
      <HoleMap
        hole={hole}
        gps={gps}
        target={target}
        playerInitial={playerInitial}
        aimDistance={aimDistance}
        unit={unitL}
        onPressMap={setTarget}
      />

      {/* Chrome superior */}
      <View
        style={[styles.topRow, { top: insets.top + theme.spacing.xxxl }]}
        pointerEvents="box-none"
      >
        <PlaysLikeToggle value={playsLike} onToggle={setPlaysLike} />
        {greenDistance != null ? <GreenCenterChip distance={greenDistance} unit={unitL} /> : null}
      </View>

      {/* Volver */}
      <Pressable
        accessibilityRole="button"
        onPress={() => router.back()}
        style={[styles.back, { top: insets.top + theme.spacing.sm }]}
      >
        <Text style={[theme.textVariants.labelAccent, { color: theme.colors.accentOn }]}>
          ‹ CAMPOS
        </Text>
      </Pressable>

      {/* Chrome inferior */}
      <View
        style={[styles.bottom, { bottom: insets.bottom + theme.spacing.sm }]}
        pointerEvents="box-none"
      >
        {matrix && matrix.entries.length > 0 ? (
          recommendation ? (
            <RecommendationBar
              clubLabel={recommendation.club.label}
              distance={aimDistance ?? 0}
              unit={unitL}
            />
          ) : (
            <View style={styles.hint}>
              <Text style={[theme.textVariants.small, { color: theme.colors.muted }]}>
                Toca el mapa para colocar el objetivo.
              </Text>
            </View>
          )
        ) : (
          <View style={styles.hint}>
            <Text style={[theme.textVariants.small, { color: theme.colors.muted }]}>
              Configura tu bolsa en Yardage Book para ver el palo recomendado.
            </Text>
          </View>
        )}

        <HoleNavBar
          holeRef={hole.ref}
          par={hole.par}
          strokeIndex={hole.strokeIndex}
          canPrev={currentRefIndex > 1}
          canNext={currentRefIndex < holes.length}
          onPrev={goPrev}
          onNext={goNext}
        />

        <Text style={styles.attribution}>{course.attribution}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.ink },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.lg,
    padding: theme.spacing.xl,
  },
  topRow: {
    position: 'absolute',
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  back: {
    position: 'absolute',
    left: theme.spacing.lg,
  },
  bottom: {
    position: 'absolute',
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  hint: {
    backgroundColor: theme.colors.paper,
    borderRadius: theme.radius.sm,
    borderCurve: 'continuous',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
  },
  attribution: {
    ...theme.textVariants.small,
    color: theme.colors.accentOn,
    textAlign: 'center',
  },
});
