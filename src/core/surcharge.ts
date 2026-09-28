import type {SurchargeRule} from '../types.js';

export function surchargeApplies(
  income: number,
  rule: SurchargeRule | null
): boolean {
  return rule !== null && income > rule.incomeThreshold;
}

/**
 * Surcharge on the whole tax once income exceeds the threshold. This is a
 * cliff, as legislated: one rupee over the threshold surcharges all the tax.
 */
export function calculateSurcharge(
  income: number,
  tax: number,
  rule: SurchargeRule | null
): number {
  return rule !== null && surchargeApplies(income, rule) ? tax * rule.rate : 0;
}
