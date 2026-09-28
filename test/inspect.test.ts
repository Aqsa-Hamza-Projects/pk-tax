import {describe, it, expect} from 'vitest';
import {
  calculateSalaryTax,
  getSupportedTaxYears,
  getTaxRules,
  getTaxSlabs,
  isSupportedTaxYear,
  InvalidInputError,
  UnsupportedTaxYearError,
} from '../src/index.js';
import type {GetTaxSlabsOptions, TaxSlab} from '../src/index.js';

describe('getTaxRules', () => {
  it('returns the rule set with its FBR source', () => {
    const rules = getTaxRules('2026-27');
    expect(rules.taxYear).toBe('2026-27');
    expect(rules.source.legislation).toBe('Finance Act, 2026');
  });

  it('throws for an unsupported year', () => {
    // @ts-expect-error not a supported TaxYear
    expect(() => getTaxRules('2035-36')).toThrow(UnsupportedTaxYearError);
  });
});

describe('getTaxSlabs', () => {
  it('returns the year’s slabs, salaried by default', () => {
    expect(getTaxSlabs({taxYear: '2025-26'})).toHaveLength(6);
    expect(getTaxSlabs({taxYear: '2026-27'})).toHaveLength(8);
    expect(getTaxSlabs({taxYear: '2026-27', taxpayerType: 'salaried'})).toBe(
      getTaxSlabs({taxYear: '2026-27'})
    );
  });

  it('rejects an unsupported taxpayerType', () => {
    expect(() =>
      // @ts-expect-error only 'salaried' in v1
      getTaxSlabs({taxYear: '2026-27', taxpayerType: 'business'})
    ).toThrow(InvalidInputError);
  });

  it('rejects a missing options object', () => {
    expect(() => getTaxSlabs(null as unknown as GetTaxSlabsOptions)).toThrow(
      InvalidInputError
    );
  });

  it('throws for an unsupported year', () => {
    // @ts-expect-error not a supported TaxYear
    expect(() => getTaxSlabs({taxYear: '2027-28'})).toThrow(
      UnsupportedTaxYearError
    );
  });
});

describe('supported years', () => {
  it('lists the supported years', () => {
    expect(getSupportedTaxYears()).toEqual(['2025-26', '2026-27']);
  });

  it('is a type guard for user input', () => {
    expect(isSupportedTaxYear('2026-27')).toBe(true);
    expect(isSupportedTaxYear('2035-36')).toBe(false);
    expect(isSupportedTaxYear(2026)).toBe(false);
    expect(isSupportedTaxYear('constructor')).toBe(false);
  });
});

describe('returned data cannot be tampered with', () => {
  it('rejects mutation of slabs and rules', () => {
    const slabs = getTaxSlabs({taxYear: '2026-27'});
    expect(() => (slabs as TaxSlab[]).push(slabs[0] as TaxSlab)).toThrow(
      TypeError
    );
    expect(() => {
      (slabs[3] as {rate: number}).rate = 0;
    }).toThrow(TypeError);
    expect(() => {
      (getTaxRules('2025-26') as {surcharge: unknown}).surcharge = null;
    }).toThrow(TypeError);
  });

  it('rejects mutation of a result and its slab', () => {
    const result = calculateSalaryTax({
      annualSalary: 3_000_000,
      taxYear: '2026-27',
    });
    expect(() => {
      (result as {annualTax: number}).annualTax = 0;
    }).toThrow(TypeError);
    expect(() => {
      (result.slab as {rate: number}).rate = 0;
    }).toThrow(TypeError);
  });

  it('later calculations are unaffected by attempted tampering', () => {
    try {
      (getTaxSlabs({taxYear: '2026-27'})[3] as {rate: number}).rate = 0;
    } catch {
      // expected
    }
    expect(
      calculateSalaryTax({annualSalary: 3_000_000, taxYear: '2026-27'})
        .annualTax
    ).toBe(276_000);
  });

  it('getSupportedTaxYears returns a fresh array', () => {
    getSupportedTaxYears().push('2025-26');
    expect(getSupportedTaxYears()).toEqual(['2025-26', '2026-27']);
  });
});
