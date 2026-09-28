/** Tax years with a rule set in this package, in `YYYY-YY` form (July–June). */
export type TaxYear = '2025-26' | '2026-27';

/** Taxpayer categories with a rule set. v1 supports salaried individuals only. */
export type TaxpayerType = 'salaried';

/**
 * One slab, worded like the statute: for `over < income ≤ upTo`,
 * tax = `fixedTax + rate × (income − over)`. The first slab (`over: 0`)
 * also covers an income of exactly 0.
 */
export interface TaxSlab {
  /** Lower bound, exclusive. */
  readonly over: number;
  /** Upper bound, inclusive; `null` means no upper limit. */
  readonly upTo: number | null;
  /** Tax accumulated by every slab below this one. */
  readonly fixedTax: number;
  /** Fraction applied to the income above `over`, e.g. `0.11`. */
  readonly rate: number;
}

/** A surcharge charged as a fraction of the computed tax (section 4AB). */
export interface SurchargeRule {
  /** Fraction of the tax, e.g. `0.09`. */
  readonly rate: number;
  /** Applies when taxable income is strictly greater than this. */
  readonly incomeThreshold: number;
}

/** Where a rule set comes from, so every figure can be traced to FBR. */
export interface RuleSource {
  readonly authority: 'FBR';
  readonly document: string;
  readonly url: string;
  readonly legislation: string;
  /** FBR names tax years by their ending year: 2026 for `"2025-26"`. */
  readonly officialTaxYear: number;
  /** ISO date, e.g. `"2025-07-01"`. */
  readonly effectiveFrom: string;
  /** ISO date, e.g. `"2026-06-30"`. */
  readonly effectiveTo: string;
}

export interface SalaryTaxRules {
  readonly country: 'PK';
  readonly taxYear: TaxYear;
  readonly taxpayerType: TaxpayerType;
  readonly slabs: readonly TaxSlab[];
  readonly surcharge: SurchargeRule | null;
  readonly source: RuleSource;
}

export interface AnnualSalaryInput {
  annualSalary: number;
  monthlySalary?: never;
  taxYear: TaxYear;
}

export interface MonthlySalaryInput {
  monthlySalary: number;
  annualSalary?: never;
  taxYear: TaxYear;
}

/** Exactly one of `annualSalary` or `monthlySalary`, plus the tax year. */
export type SalaryTaxInput = AnnualSalaryInput | MonthlySalaryInput;

export interface GetTaxSlabsOptions {
  taxYear: TaxYear;
  /** Defaults to `'salaried'`. */
  taxpayerType?: TaxpayerType;
}

/** Rupee amounts are rounded to 2 dp; rates are unrounded fractions. */
export interface SalaryTaxResult {
  readonly taxYear: TaxYear;
  readonly taxpayerType: TaxpayerType;
  /** Annual gross salary. */
  readonly grossIncome: number;
  /** Annual taxable income. Equals `grossIncome` in v1 (no deductions). */
  readonly taxableIncome: number;
  /** Tax from the slabs, before surcharge. */
  readonly baseTax: number;
  /** 0 when the year has no surcharge or income is at/below the threshold. */
  readonly surcharge: number;
  /** `baseTax + surcharge`. */
  readonly annualTax: number;
  /** `annualTax / 12` — assumes the same salary all year. */
  readonly monthlyTax: number;
  readonly annualNetIncome: number;
  readonly monthlyNetIncome: number;
  /** `annualTax / taxableIncome`; 0 when income is 0. */
  readonly effectiveTaxRate: number;
  /**
   * The applied slab's rate, times (1 + surcharge rate) when the surcharge
   * applies to this income. At a surcharge threshold itself this is the rate
   * below the cliff; it does not price the jump.
   */
  readonly marginalTaxRate: number;
  /** The slab that applied. */
  readonly slab: TaxSlab;
}
