import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import {
  addRecentCourse,
  createCourseProvider,
  type CourseSummary,
} from '../../src/services/courses';
import { createAppRepository } from '../../src/services/storage';
import { AppBackground } from '../../src/ui/components/app-background';
import { CourseListItem } from '../../src/ui/components/course-list-item';
import { SearchAutocomplete } from '../../src/ui/components/search-autocomplete';
import { theme } from '../../src/ui/theme';

export default function GameTab() {
  const router = useRouter();
  const provider = useMemo(() => createCourseProvider(), []);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CourseSummary[]>([]);
  const [recents, setRecents] = useState<CourseSummary[]>([]);

  // Cargar recientes al enfocar la pestaña (pueden cambiar tras elegir un campo).
  useFocusEffect(
    useCallback(() => {
      let active = true;
      createAppRepository()
        .loadCourseHistory()
        .then((h) => {
          if (active) setRecents(h);
        });
      return () => {
        active = false;
      };
    }, []),
  );

  // Búsqueda en vivo contra el proveedor (offline, lee del bundle).
  useEffect(() => {
    let active = true;
    provider.search(query).then((r) => {
      if (active) setResults(r);
    });
    return () => {
      active = false;
    };
  }, [provider, query]);

  const onSelect = useCallback(
    async (course: CourseSummary) => {
      const next = addRecentCourse(recents, course);
      setRecents(next);
      await createAppRepository().saveCourseHistory(next);
      router.push({ pathname: '/game/[courseId]', params: { courseId: course.id } });
    },
    [recents, router],
  );

  const showRecents = query.trim().length === 0;

  return (
    <AppBackground>
      <ScrollView
        style={{ flex: 1 }}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: theme.spacing.xl, gap: theme.spacing.lg }}
      >
        <Text style={[theme.textVariants.titleApp, { color: theme.colors.ink }]}>Juego</Text>

        <SearchAutocomplete
          query={query}
          onChangeQuery={setQuery}
          results={results}
          onSelect={onSelect}
        />

        {showRecents ? (
          <View style={{ gap: theme.spacing.sm }}>
            <Text style={[theme.textVariants.caption, { color: theme.colors.muted }]}>
              Recientes
            </Text>
            {recents.length > 0 ? (
              <View>
                {recents.map((course) => (
                  <CourseListItem key={course.id} course={course} onPress={onSelect} />
                ))}
              </View>
            ) : (
              <Text style={[theme.textVariants.body, { color: theme.colors.muted }]}>
                Aún no has jugado ningún campo. Búscalo arriba para empezar.
              </Text>
            )}
          </View>
        ) : null}
      </ScrollView>
    </AppBackground>
  );
}
