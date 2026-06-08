import { Pressable, Text, View } from 'react-native';
import { theme } from '../theme';

export interface SegmentedOption<T extends string> {
  label: string;
  value: T;
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** Selector segmentado: segmento activo relleno `accent`/`accentOn`. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <View
      style={{
        flexDirection: 'row',
        borderWidth: theme.border.hairline,
        borderColor: theme.colors.line,
        borderRadius: theme.radius.sm,
        borderCurve: 'continuous',
        overflow: 'hidden',
      }}
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            onPress={() => onChange(option.value)}
            style={{
              flex: 1,
              alignItems: 'center',
              paddingVertical: theme.spacing.sm,
              backgroundColor: isActive ? theme.colors.accent : 'transparent',
            }}
          >
            <Text
              style={[
                theme.textVariants.bodyStrong,
                { color: isActive ? theme.colors.accentOn : theme.colors.ink },
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
