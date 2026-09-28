import {describe, it, expect} from 'vitest';
import {calculateSurcharge, surchargeApplies} from '../src/core/surcharge.js';

const rule = {rate: 0.09, incomeThreshold: 10_000_000};

describe('surcharge', () => {
  it('is 0 when the year has no surcharge rule', () => {
    expect(surchargeApplies(50_000_000, null)).toBe(false);
    expect(calculateSurcharge(50_000_000, 1_000_000, null)).toBe(0);
  });

  it('does not apply at exactly the threshold', () => {
    expect(surchargeApplies(10_000_000, rule)).toBe(false);
    expect(calculateSurcharge(10_000_000, 2_681_000, rule)).toBe(0);
  });

  it('applies to the whole tax once income exceeds the threshold', () => {
    expect(surchargeApplies(10_000_001, rule)).toBe(true);
    expect(calculateSurcharge(12_000_000, 3_381_000, rule)).toBeCloseTo(
      304_290,
      6
    );
  });
});
