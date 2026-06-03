import React from 'react';
import { render } from '@testing-library/react-native';
import { TrainingFooter } from '../training-footer';

describe('TrainingFooter', () => {
  it('shows total arrows shot', () => {
    const { getByText } = render(
      <TrainingFooter roundsPassed={0} arrowsShot={42} showRounds={false} />
    );
    expect(getByText('Total arrows shot: 42')).toBeTruthy();
  });

  it('shows rounds passed when showRounds is true', () => {
    const { getByText } = render(
      <TrainingFooter roundsPassed={5} arrowsShot={30} showRounds={true} />
    );
    expect(getByText('Rounds passed: 5')).toBeTruthy();
    expect(getByText('Total arrows shot: 30')).toBeTruthy();
  });

  it('hides rounds passed when showRounds is false', () => {
    const { queryByText } = render(
      <TrainingFooter roundsPassed={5} arrowsShot={30} showRounds={false} />
    );
    expect(queryByText(/Rounds passed/)).toBeNull();
  });

  it('shows rounds passed by default (showRounds defaults to true)', () => {
    const { getByText } = render(<TrainingFooter roundsPassed={3} arrowsShot={18} />);
    expect(getByText('Rounds passed: 3')).toBeTruthy();
  });
});
