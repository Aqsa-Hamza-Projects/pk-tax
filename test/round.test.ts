import {describe, it, expect} from 'vitest';
import {roundMoney} from '../src/core/round.js';

describe('roundMoney', () => {
  it.each([
    [0, 0],
    [276000, 276000],
    [0.004, 0],
    [0.005, 0.01],
    [1.005, 1.01],
    [2681000.3499999996, 2681000.35],
    [2922290.3815, 2922290.38],
    [307107.5, 307107.5],
    [5e-7, 0],
    [1e20, 1e20],
  ])('roundMoney(%d) === %d', (input, expected) => {
    expect(roundMoney(input)).toBe(expected);
  });
});
