import { Pressable, Text } from 'react-native';
import { CourseSummary } from '../../services/courses';
import { theme } from '../theme';

export interface CourseListItemProps {
  course: CourseSummary;
  onPress: (course: CourseSummary) => void;
}

/** Fila de campo: nombre + nº de hoyos. Para resultados de búsqueda y recientes. */
export function CourseListItem({ course, onPress }: CourseListItemProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress(course)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: theme.spacing.md,
        paddingVertical: theme.spacing.md,
        borderBottomWidth: theme.border.hairline,
        borderBottomColor: theme.colors.line,
      }}
    >
      <Text style={[theme.textVariants.body, { color: theme.colors.ink, flex: 1 }]}>
        {course.name}
      </Text>
      <Text style={[theme.textVariants.small, { color: theme.colors.muted }]}>
        {course.holeCount} hoyos
      </Text>
    </Pressable>
  );
}
