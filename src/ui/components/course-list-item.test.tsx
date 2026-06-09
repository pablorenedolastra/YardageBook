import { fireEvent, render } from '@testing-library/react-native';
import { CourseListItem } from './course-list-item';
import type { CourseSummary } from '../../services/courses';

const course: CourseSummary = {
  id: 'osm-way-1',
  name: 'Real Club de Golf Las Brisas',
  location: { lat: 36.5, lng: -4.9 },
  holeCount: 18,
};

describe('CourseListItem', () => {
  it('muestra el nombre y el nº de hoyos', () => {
    const { getByText } = render(<CourseListItem course={course} onPress={jest.fn()} />);
    expect(getByText('Real Club de Golf Las Brisas')).toBeTruthy();
    expect(getByText('18 hoyos')).toBeTruthy();
  });

  it('llama a onPress con el campo al pulsar', () => {
    const onPress = jest.fn();
    const { getByText } = render(<CourseListItem course={course} onPress={onPress} />);
    fireEvent.press(getByText('Real Club de Golf Las Brisas'));
    expect(onPress).toHaveBeenCalledWith(course);
  });
});
