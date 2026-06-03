import React from 'react';
import { Switch } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { RoundNoPoints } from '../round-no-points';

describe('RoundNoPoints', () => {
  it('renders +N buttons for each arrow count', () => {
    const { getByText } = render(
      <RoundNoPoints arrowsPerRound={3} onRoundCompleted={jest.fn()} />
    );
    expect(getByText('+3')).toBeTruthy();
    expect(getByText('+2')).toBeTruthy();
    expect(getByText('+1')).toBeTruthy();
  });

  it('renders no shot buttons when arrowsPerRound is 0', () => {
    const { queryByText } = render(
      <RoundNoPoints arrowsPerRound={0} onRoundCompleted={jest.fn()} />
    );
    expect(queryByText(/^\+\d/)).toBeNull();
  });

  it('calls onRoundCompleted with positive value in add mode', () => {
    const onRoundCompleted = jest.fn();
    const { getByText } = render(
      <RoundNoPoints arrowsPerRound={6} onRoundCompleted={onRoundCompleted} />
    );
    fireEvent.press(getByText('+6'));
    expect(onRoundCompleted).toHaveBeenCalledWith(6);
  });

  it('calls onRoundCompleted with smallest value', () => {
    const onRoundCompleted = jest.fn();
    const { getByText } = render(
      <RoundNoPoints arrowsPerRound={3} onRoundCompleted={onRoundCompleted} />
    );
    fireEvent.press(getByText('+1'));
    expect(onRoundCompleted).toHaveBeenCalledWith(1);
  });

  it('toggles to subtract mode and shows -N labels', () => {
    const { UNSAFE_getByType, getByText } = render(
      <RoundNoPoints arrowsPerRound={3} onRoundCompleted={jest.fn()} />
    );
    fireEvent(UNSAFE_getByType(Switch), 'valueChange', true);
    expect(getByText('-3')).toBeTruthy();
    expect(getByText('-2')).toBeTruthy();
    expect(getByText('-1')).toBeTruthy();
  });

  it('calls onRoundCompleted with negative value in subtract mode', () => {
    const onRoundCompleted = jest.fn();
    const { UNSAFE_getByType, getByText } = render(
      <RoundNoPoints arrowsPerRound={4} onRoundCompleted={onRoundCompleted} />
    );
    fireEvent(UNSAFE_getByType(Switch), 'valueChange', true);
    fireEvent.press(getByText('-4'));
    expect(onRoundCompleted).toHaveBeenCalledWith(-4);
  });

  it('toggles back to add mode', () => {
    const { UNSAFE_getByType, getByText } = render(
      <RoundNoPoints arrowsPerRound={2} onRoundCompleted={jest.fn()} />
    );
    const sw = UNSAFE_getByType(Switch);
    fireEvent(sw, 'valueChange', true);
    fireEvent(sw, 'valueChange', false);
    expect(getByText('+2')).toBeTruthy();
  });
});
