import axisRound from './axisRound';

describe('', () => {
  test('round 0', () => {
    expect(axisRound(0)).toBe(0);
  });

  test('round 0.1', () => {
    expect(axisRound(0.1)).toBe(0);
  });

  test('round 0.9', () => {
    expect(axisRound(0.9)).toBe(0);
  });

  test('round -0.1', () => {
    expect(axisRound(-0.1)).toBe(-0);
  });

  test('round -0.9', () => {
    expect(axisRound(-0.9)).toBe(-0);
  });
});
