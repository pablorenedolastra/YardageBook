import { Text, TextInput, View } from 'react-native';
import { CourseSummary } from '../../services/courses';
import { theme } from '../theme';
import { CourseListItem } from './course-list-item';

export interface SearchAutocompleteProps {
  query: string;
  onChangeQuery: (q: string) => void;
  results: CourseSummary[];
  onSelect: (course: CourseSummary) => void;
  placeholder?: string;
}

/**
 * Buscador con autocomplete sobre campos: input + lista de resultados en vivo.
 * Presentacional: el padre hace `provider.search()` y pasa `results`.
 */
export function SearchAutocomplete({
  query,
  onChangeQuery,
  results,
  onSelect,
  placeholder = 'Buscar campo',
}: SearchAutocompleteProps) {
  const hasQuery = query.trim().length > 0;

  return (
    <View style={{ gap: theme.spacing.sm }}>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={theme.colors.muted}
        value={query}
        onChangeText={onChangeQuery}
        autoCorrect={false}
        style={[
          theme.textVariants.body,
          {
            color: theme.colors.ink,
            borderWidth: theme.border.hairline,
            borderColor: theme.colors.line,
            borderRadius: theme.radius.sm,
            borderCurve: 'continuous',
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
          },
        ]}
      />
      {hasQuery && results.length === 0 ? (
        <Text style={[theme.textVariants.small, { color: theme.colors.muted }]}>
          No hay campos que coincidan.
        </Text>
      ) : (
        <View>
          {results.map((course) => (
            <CourseListItem key={course.id} course={course} onPress={onSelect} />
          ))}
        </View>
      )}
    </View>
  );
}
