import {
  calculateSalaryTax,
  isSupportedTaxYear,
  PkTaxError,
  UnsupportedTaxYearError,
} from '../dist/index.js';
import type {TaxYear} from '../dist/index.js';

// A tax year arriving from a form or query string.
const yearFromUser = '2035-36';

if (!isSupportedTaxYear(yearFromUser)) {
  console.log(`"${yearFromUser}" is not supported — ask the user to pick one.`);
}

try {
  calculateSalaryTax({
    annualSalary: 3_000_000,
    taxYear: yearFromUser as TaxYear,
  });
} catch (error) {
  if (error instanceof UnsupportedTaxYearError) {
    console.log(error.message);
    console.log('Offer instead:', error.supportedTaxYears);
  }
}

try {
  calculateSalaryTax({annualSalary: -5, taxYear: '2026-27'});
} catch (error) {
  if (error instanceof PkTaxError) console.log(error.code, '-', error.message);
}
