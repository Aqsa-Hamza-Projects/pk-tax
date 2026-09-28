import {describeValue, InvalidInputError} from './errors.js';
import {
  hasSalaryRules,
  listSalaryTaxYears,
  resolveSalaryRules,
} from './pakistan/salary/index.js';
import type {
  GetTaxSlabsOptions,
  SalaryTaxRules,
  TaxSlab,
  TaxYear,
} from './types.js';

/** The full, frozen rule set for a tax year, including its FBR source. */
export function getTaxRules(taxYear: TaxYear): SalaryTaxRules {
  return resolveSalaryRules(taxYear);
}

/** The frozen slab table for a tax year and taxpayer type. */
export function getTaxSlabs(options: GetTaxSlabsOptions): readonly TaxSlab[] {
  if (options === null || typeof options !== 'object') {
    throw new InvalidInputError(
      'getTaxSlabs expects an object: {taxYear, taxpayerType?}'
    );
  }
  const {taxYear, taxpayerType = 'salaried'} = options;
  if (taxpayerType !== 'salaried') {
    throw new InvalidInputError(
      `Unsupported taxpayerType ${describeValue(taxpayerType)}. Supported: salaried.`
    );
  }
  return resolveSalaryRules(taxYear).slabs;
}

/** Supported tax years, oldest first. A fresh array on every call. */
export function getSupportedTaxYears(): TaxYear[] {
  return listSalaryTaxYears();
}

/** Type guard for validating a tax year that came from user input. */
export function isSupportedTaxYear(value: unknown): value is TaxYear {
  return hasSalaryRules(value);
}
