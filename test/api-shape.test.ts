import {describe, it, expect} from 'vitest';
import * as api from '../src/index.js';

describe('public API shape', () => {
  it('exports exactly the documented surface', () => {
    expect(Object.keys(api).sort()).toEqual(
      [
        'InvalidIncomeError',
        'InvalidInputError',
        'MAX_ANNUAL_INCOME',
        'PkTaxError',
        'UnsupportedTaxYearError',
        'calculateSalaryTax',
        'getSupportedTaxYears',
        'getTaxRules',
        'getTaxSlabs',
        'isSupportedTaxYear',
      ].sort()
    );
  });
});
