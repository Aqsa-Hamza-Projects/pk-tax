export type {
  TaxYear,
  TaxpayerType,
  TaxSlab,
  SurchargeRule,
  RuleSource,
  SalaryTaxRules,
  AnnualSalaryInput,
  MonthlySalaryInput,
  SalaryTaxInput,
  GetTaxSlabsOptions,
  SalaryTaxResult,
} from './types.js';
export type {PkTaxErrorCode} from './errors.js';
export {
  PkTaxError,
  UnsupportedTaxYearError,
  InvalidIncomeError,
  InvalidInputError,
} from './errors.js';
export {MAX_ANNUAL_INCOME, calculateSalaryTax} from './calculate-salary-tax.js';
export {
  getTaxRules,
  getTaxSlabs,
  getSupportedTaxYears,
  isSupportedTaxYear,
} from './inspect.js';
