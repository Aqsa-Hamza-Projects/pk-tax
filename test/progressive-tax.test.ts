import {describe, it, expect} from 'vitest';
import {
  calculateProgressiveTax,
  findSlab,
} from '../src/core/progressive-tax.js';
import type {TaxSlab} from '../src/types.js';

// Engine-only fixture: the core must not depend on Pakistan's data.
const slabs: TaxSlab[] = [
  {over: 0, upTo: 100, fixedTax: 0, rate: 0},
  {over: 100, upTo: 200, fixedTax: 0, rate: 0.1},
  {over: 200, upTo: null, fixedTax: 10, rate: 0.2},
];
const [first, second, third] = slabs as [TaxSlab, TaxSlab, TaxSlab];

describe('calculateProgressiveTax', () => {
  it.each([
    [0, 0, first],
    [99, 0, first],
    [100, 0, first],
    [150, 5, second],
    [199, 9.9, second],
    [200, 10, second],
    [201, 10.2, third],
    [1_000_000_000, 10 + 0.2 * (1_000_000_000 - 200), third],
  ])('income %d → tax %d', (income, tax, slab) => {
    const result = calculateProgressiveTax(income, slabs);
    expect(result.tax).toBeCloseTo(tax, 9);
    expect(result.slab).toBe(slab);
  });

  it('taxes a fractional income just above a bound in the upper slab', () => {
    const result = calculateProgressiveTax(100.5, slabs);
    expect(result.slab).toBe(second);
    expect(result.tax).toBeCloseTo(0.05, 9);
  });

  it('applies the rate only to the portion above the slab floor', () => {
    // A flat 20% on 1,000 would be 200; progressive is 10 + 0.2 × 800 = 170.
    expect(calculateProgressiveTax(1000, slabs).tax).toBeCloseTo(170, 9);
  });
});

describe('findSlab', () => {
  it('throws RangeError when no slab covers the income', () => {
    const bounded: TaxSlab[] = [{over: 0, upTo: 100, fixedTax: 0, rate: 0}];
    expect(() => findSlab(101, bounded)).toThrow(RangeError);
    expect(() => findSlab(0, [])).toThrow(RangeError);
  });
});
