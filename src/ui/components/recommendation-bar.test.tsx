import { render } from '@testing-library/react-native';
import { RecommendationBar } from './recommendation-bar';

describe('RecommendationBar', () => {
  it('muestra palo y distancia redondeada', () => {
    const { getByText } = render(
      <RecommendationBar clubLabel="Hierro 7" distance={149.6} unit="m" />,
    );
    expect(getByText('TU PALO')).toBeTruthy();
    expect(getByText('Hierro 7')).toBeTruthy();
    expect(getByText('150 m')).toBeTruthy();
  });
});
