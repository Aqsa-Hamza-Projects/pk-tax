import {annualize, deannualize} from './core/annualize.js';
import {calculateProgressiveTax} from './core/progressive-tax.js';
import {roundMoney} from './core/round.js';
import {calculateSurcharge, surchargeApplies} from './core/surcharge.js';
import {InvalidIncomeError, InvalidInputError} from './errors.js';
import {resolveSalaryRules} from './pakistan/salary/index.js';
import type {SalaryTaxInput, SalaryTaxResult} from './types.js';

/**
 * Largest annual income accepted: Rs 1 trillion. Far above any real salary,
 * and low enough that every rupee amount is exact to the paisa in a float.
 * Above it the package throws rather than return an imprecise tax.
 */
export const MAX_ANNUAL_INCOME = 1_000_000_000_000;

/**
 * Salaried income tax for one tax year. Computes unrounded throughout and
 * rounds rupee amounts to 2 dp once, at the end.
 *
 * @throws {InvalidInputError} input is not an object, or has both/neither salary
 * @throws {UnsupportedTaxYearError} `taxYear` has no rule set
 * @throws {InvalidIncomeError} the salary is not a finite number >= 0, or the
 *   annual income exceeds {@link MAX_ANNUAL_INCOME}
 */
export function calculateSalaryTax(input: SalaryTaxInput): SalaryTaxResult {
  if (input === null || typeof input !== 'object') {
    throw new InvalidInputError(
      'calculateSalaryTax expects an object: {annualSalary | monthlySalary, taxYear}'
    );
  }
  const rules = resolveSalaryRules(input.taxYear);
  const grossIncome = readAnnualIncome(input);
  const taxableIncome = grossIncome; // v1: no deductions or exemptions yet

  const {tax: baseTax, slab} = calculateProgressiveTax(
    taxableIncome,
    rules.slabs
  );
  const surcharge = calculateSurcharge(taxableIncome, baseTax, rules.surcharge);
  const annualTax = baseTax + surcharge;
  const annualNetIncome = grossIncome - annualTax;
  const marginalTaxRate =
    rules.surcharge !== null && surchargeApplies(taxableIncome, rules.surcharge)
      ? slab.rate * (1 + rules.surcharge.rate)
      : slab.rate;

  return Object.freeze({
    taxYear: rules.taxYear,
    taxpayerType: rules.taxpayerType,
    grossIncome: roundMoney(grossIncome),
    taxableIncome: roundMoney(taxableIncome),
    baseTax: roundMoney(baseTax),
    surcharge: roundMoney(surcharge),
    annualTax: roundMoney(annualTax),
    monthlyTax: roundMoney(deannualize(annualTax)),
    annualNetIncome: roundMoney(annualNetIncome),
    monthlyNetIncome: roundMoney(deannualize(annualNetIncome)),
    effectiveTaxRate: taxableIncome === 0 ? 0 : annualTax / taxableIncome,
    marginalTaxRate,
    slab,
  });
}

function readAnnualIncome(input: SalaryTaxInput): number {
  const hasAnnual = input.annualSalary !== undefined;
  const hasMonthly = input.monthlySalary !== undefined;
  if (hasAnnual && hasMonthly) {
    throw new InvalidInputError(
      'Pass either annualSalary or monthlySalary, not both'
    );
  }
  if (hasAnnual) {
    const annual = validateIncome('annualSalary', input.annualSalary);
    if (annual > MAX_ANNUAL_INCOME) {
      throw new InvalidIncomeError(
        'annualSalary',
        annual,
        `at most ${MAX_ANNUAL_INCOME} (Rs 1 trillion)`
      );
    }
    return annual;
  }
  if (hasMonthly) {
    const monthly = validateIncome('monthlySalary', input.monthlySalary);
    const annual = annualize(monthly);
    if (annual > MAX_ANNUAL_INCOME) {
      throw new InvalidIncomeError(
        'monthlySalary',
        monthly,
        `at most ${MAX_MONTHLY_INCOME} (Rs 1 trillion a year)`
      );
    }
    return annual;
  }
  throw new InvalidInputError('Pass annualSalary or monthlySalary');
}

// For the error message only; the check itself is on the annualised amount.
const MAX_MONTHLY_INCOME = Math.floor((MAX_ANNUAL_INCOME / 12) * 100) / 100;

function validateIncome(field: string, value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new InvalidIncomeError(field, value);
  }
  return value;
}
