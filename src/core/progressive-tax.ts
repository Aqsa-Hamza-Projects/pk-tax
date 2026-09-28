import type {TaxSlab} from '../types.js';

export interface ProgressiveTaxResult {
  /** Unrounded tax. */
  tax: number;
  slab: TaxSlab;
}

/**
 * Returns the slab covering `income`. Slabs must be sorted ascending and
 * contiguous, so the first slab whose `upTo` is not below the income is the
 * one where `over < income ≤ upTo`.
 */
export function findSlab(income: number, slabs: readonly TaxSlab[]): TaxSlab {
  for (const slab of slabs) {
    if (slab.upTo === null || income <= slab.upTo) return slab;
  }
  throw new RangeError(`No tax slab covers an income of ${income}`);
}

/** Tax = fixedTax + rate × (income − over) for the slab covering `income`. */
export function calculateProgressiveTax(
  income: number,
  slabs: readonly TaxSlab[]
): ProgressiveTaxResult {
  const slab = findSlab(income, slabs);
  return {tax: slab.fixedTax + slab.rate * (income - slab.over), slab};
}
