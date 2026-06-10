import { fireEvent, render } from '@testing-library/react-native';
import { HoleNavBar } from './hole-nav-bar';

describe('HoleNavBar', () => {
  it('compone la etiqueta con par y stroke index', () => {
    const { getByText } = render(
      <HoleNavBar
        holeRef={3}
        par={4}
        strokeIndex={7}
        canPrev
        canNext
        onPrev={jest.fn()}
        onNext={jest.fn()}
      />,
    );
    expect(getByText('Hoyo 3 · PAR 4 · S.I. 7')).toBeTruthy();
  });

  it('omite par/S.I. si no vienen', () => {
    const { getByText } = render(
      <HoleNavBar holeRef={1} canPrev={false} canNext onPrev={jest.fn()} onNext={jest.fn()} />,
    );
    expect(getByText('Hoyo 1')).toBeTruthy();
  });

  it('dispara onPrev/onNext', () => {
    const onPrev = jest.fn();
    const onNext = jest.fn();
    const { getByLabelText } = render(
      <HoleNavBar holeRef={2} canPrev canNext onPrev={onPrev} onNext={onNext} />,
    );
    fireEvent.press(getByLabelText('Hoyo anterior'));
    fireEvent.press(getByLabelText('Hoyo siguiente'));
    expect(onPrev).toHaveBeenCalledTimes(1);
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('no dispara cuando está deshabilitado', () => {
    const onPrev = jest.fn();
    const { getByLabelText } = render(
      <HoleNavBar holeRef={1} canPrev={false} canNext onPrev={onPrev} onNext={jest.fn()} />,
    );
    fireEvent.press(getByLabelText('Hoyo anterior'));
    expect(onPrev).not.toHaveBeenCalled();
  });
});
