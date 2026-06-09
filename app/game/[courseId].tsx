import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Course } from '../../src/domain';
import { createCourseProvider } from '../../src/services/courses';
import { AppBackground } from '../../src/ui/components/app-background';
import { theme } from '../../src/ui/theme';

/**
 * Placeholder del Hoyo 1. El mapa satélite + GPS llega en el Inc.7 (requiere dev
 * build). Aquí solo confirmamos el campo elegido y la atribución ODbL.
 */
export default function HoleScreen() {
  const router = useRouter();
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);

  useEffect(() => {
    let active = true;
    createCourseProvider()
      .getCourse(courseId)
      .then((c) => {
        if (active) setCourse(c);
      });
    return () => {
      active = false;
    };
  }, [courseId]);

  return (
    <AppBackground>
      <View style={{ flex: 1, padding: theme.spacing.xl, gap: theme.spacing.lg }}>
        <Pressable accessibilityRole="button" onPress={() => router.back()}>
          <Text style={[theme.textVariants.bodyStrong, { color: theme.colors.accent }]}>
            ‹ Campos
          </Text>
        </Pressable>

        <View style={{ flex: 1, justifyContent: 'center', gap: theme.spacing.sm }}>
          <Text style={[theme.textVariants.caption, { color: theme.colors.muted }]}>Hoyo 1</Text>
          <Text style={[theme.textVariants.display, { color: theme.colors.ink }]}>
            {course?.name ?? 'Cargando…'}
          </Text>
          <Text style={[theme.textVariants.body, { color: theme.colors.muted }]}>
            El mapa del hoyo con GPS y recomendación de palo llega en el próximo incremento.
          </Text>
        </View>

        {course ? (
          <Text style={[theme.textVariants.small, { color: theme.colors.muted }]}>
            {course.attribution}
          </Text>
        ) : null}
      </View>
    </AppBackground>
  );
}
