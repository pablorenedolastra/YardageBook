import { fireEvent, render } from '@testing-library/react-native';
import { PlaysLikeToggle } from './plays-like-toggle';

describe('PlaysLikeToggle', () => {
  it('refleja el estado en el texto', () => {
    const { getByText, rerender } = render(<PlaysLikeToggle value={false} onToggle={jest.fn()} />);
    expect(getByText('PLAYS LIKE OFF')).toBeTruthy();
    rerender(<PlaysLikeToggle value onToggle={jest.fn()} />);
    expect(getByText('PLAYS LIKE ON')).toBeTruthy();
  });

  it('alterna el valor al pulsar', () => {
    const onToggle = jest.fn();
    const { getByText } = render(<PlaysLikeToggle value={false} onToggle={onToggle} />);
    fireEvent.press(getByText('PLAYS LIKE OFF'));
    expect(onToggle).toHaveBeenCalledWith(true);
  });
});
