import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { RoundPoints } from '../round-points';

const makeProps = (overrides = {}) => ({
  arrowsPerRound: 6,
  scores: [] as number[],
  onRoundCompleted: jest.fn(),
  onScoresChanged: jest.fn(),
  ...overrides,
});

describe('RoundPoints', () => {
  it('renders all 11 score buttons', () => {
    const { getByText } = render(<RoundPoints {...makeProps()} />);
    ['10', '9', '8', '7', '6', '5', '4', '3', '2', '1', 'M'].forEach((label) => {
      expect(getByText(label)).toBeTruthy();
    });
  });

  it('shows 0/N shots when scores is empty', () => {
    const { getByText } = render(<RoundPoints {...makeProps()} />);
    expect(getByText('Current round: 0/6 shots')).toBeTruthy();
  });

  it('shows current scores count from controlled scores prop', () => {
    const { getByText } = render(<RoundPoints {...makeProps({ scores: [10, 9] })} />);
    expect(getByText('Current round: 2/6 shots')).toBeTruthy();
  });

  it('calls onScoresChanged with new score appended when mid-round', () => {
    const onScoresChanged = jest.fn();
    const { getByText } = render(
      <RoundPoints {...makeProps({ arrowsPerRound: 3, scores: [10], onScoresChanged })} />
    );
    fireEvent.press(getByText('9'));
    expect(onScoresChanged).toHaveBeenCalledWith([10, 9]);
  });

  it('calls onRoundCompleted with all scores when round fills', () => {
    const onRoundCompleted = jest.fn();
    const { getByText } = render(
      <RoundPoints {...makeProps({ arrowsPerRound: 3, scores: [10, 9], onRoundCompleted })} />
    );
    fireEvent.press(getByText('8'));
    expect(onRoundCompleted).toHaveBeenCalledWith([10, 9, 8]);
  });

  it('does not call onRoundCompleted until round is full', () => {
    const onRoundCompleted = jest.fn();
    const { getByText } = render(
      <RoundPoints {...makeProps({ arrowsPerRound: 3, scores: [], onRoundCompleted })} />
    );
    fireEvent.press(getByText('10'));
    fireEvent.press(getByText('9'));
    expect(onRoundCompleted).not.toHaveBeenCalled();
  });

  it('renders score labels for each entry in scores prop', () => {
    const { getAllByText } = render(
      <RoundPoints {...makeProps({ scores: [10, 10] })} />
    );
    // Two label circles plus the score button = 3 total '10' texts
    expect(getAllByText('10').length).toBe(3);
  });

  it('long-pressing a score label calls onScoresChanged with it removed', () => {
    const onScoresChanged = jest.fn();
    const { getAllByText } = render(
      <RoundPoints {...makeProps({ scores: [10, 9], onScoresChanged })} />
    );
    // getAllByText('10'): index 0 = button, index 1 = score label
    const tens = getAllByText('10');
    fireEvent(tens[tens.length - 1], 'longPress');
    expect(onScoresChanged).toHaveBeenCalledWith([9]);
  });

  it('M score button calls onScoresChanged with 0', () => {
    const onScoresChanged = jest.fn();
    const { getByText } = render(<RoundPoints {...makeProps({ onScoresChanged })} />);
    fireEvent.press(getByText('M'));
    expect(onScoresChanged).toHaveBeenCalledWith([0]);
  });

  it('reflects externally updated scores without remount', () => {
    const { rerender, getByText } = render(<RoundPoints {...makeProps({ scores: [10] })} />);
    expect(getByText('Current round: 1/6 shots')).toBeTruthy();
    rerender(<RoundPoints {...makeProps({ scores: [10, 9, 8] })} />);
    expect(getByText('Current round: 3/6 shots')).toBeTruthy();
  });
});
