import {describe, it, expect} from 'vitest';
import {
  MONTHS_PER_YEAR,
  annualize,
  deannualize,
} from '../src/core/annualize.js';

describe('annualize / deannualize', () => {
  it('uses a 12-month year', () => {
    expect(MONTHS_PER_YEAR).toBe(12);
  });

  it('converts monthly to annual', () => {
    expect(annualize(250_000)).toBe(3_000_000);
    expect(annualize(0)).toBe(0);
  });

  it('converts annual to monthly', () => {
    expect(deannualize(3_000_000)).toBe(250_000);
    expect(deannualize(276_000)).toBe(23_000);
  });
});
