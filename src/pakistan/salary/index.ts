import {deepFreeze} from '../../core/deep-freeze.js';
import {UnsupportedTaxYearError} from '../../errors.js';
import type {SalaryTaxRules, TaxYear} from '../../types.js';
import {salaryRules2025_26} from './2025-26.js';
import {salaryRules2026_27} from './2026-27.js';

// Keyed by TaxYear, so adding a year to the union without a rule set here
// is a compile error.
const registry: Readonly<Record<TaxYear, SalaryTaxRules>> = deepFreeze({
  '2025-26': salaryRules2025_26,
  '2026-27': salaryRules2026_27,
});

export function listSalaryTaxYears(): TaxYear[] {
  return (Object.keys(registry) as TaxYear[]).sort();
}

export function hasSalaryRules(value: unknown): value is TaxYear {
  // Object.hasOwn, not `in`: 'constructor' or '__proto__' must not resolve.
  return typeof value === 'string' && Object.hasOwn(registry, value);
}

/** The rule set for `taxYear`. Never falls back to another year. */
export function resolveSalaryRules(taxYear: unknown): SalaryTaxRules {
  if (!hasSalaryRules(taxYear)) {
    throw new UnsupportedTaxYearError(taxYear, listSalaryTaxYears());
  }
  return registry[taxYear];
}
