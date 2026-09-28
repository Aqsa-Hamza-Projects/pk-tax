import {describe, it, expect} from 'vitest';
import {
  MAX_ANNUAL_INCOME,
  calculateSalaryTax,
} from '../src/calculate-salary-tax.js';
import {
  InvalidIncomeError,
  InvalidInputError,
  PkTaxError,
  UnsupportedTaxYearError,
} from '../src/errors.js';
import {listSalaryTaxYears} from '../src/pakistan/salary/index.js';
import type {SalaryTaxInput, TaxYear} from '../src/types.js';
import {EXPECTED} from './fixtures/salary-expectations.js';

describe('slab tables (history lock)', () => {
  it('has an expectations table for every supported year', () => {
    expect(Object.keys(EXPECTED).sort()).toEqual(listSalaryTaxYears());
  });

  describe.each(Object.entries(EXPECTED))('%s', (taxYear, rows) => {
    it.each(rows)(
      'income %d → baseTax %d, surcharge %d, annualTax %d',
      (income, baseTax, surcharge, annualTax) => {
        const result = calculateSalaryTax({
          annualSalary: income,
          taxYear: taxYear as TaxYear,
        });
        expect(result.baseTax).toBe(baseTax);
        expect(result.surcharge).toBe(surcharge);
        expect(result.annualTax).toBe(annualTax);
      }
    );
  });
});

describe('full results', () => {
  it('2026-27, Rs 3M a year', () => {
    expect(
      calculateSalaryTax({annualSalary: 3_000_000, taxYear: '2026-27'})
    ).toEqual({
      taxYear: '2026-27',
      taxpayerType: 'salaried',
      grossIncome: 3_000_000,
      taxableIncome: 3_000_000,
      baseTax: 276_000,
      surcharge: 0,
      annualTax: 276_000,
      monthlyTax: 23_000,
      annualNetIncome: 2_724_000,
      monthlyNetIncome: 227_000,
      effectiveTaxRate: 0.092,
      marginalTaxRate: 0.2,
      slab: {over: 2_200_000, upTo: 3_200_000, fixedTax: 116_000, rate: 0.2},
    });
  });

  it('2025-26, Rs 12M a year: surcharge included everywhere', () => {
    const result = calculateSalaryTax({
      annualSalary: 12_000_000,
      taxYear: '2025-26',
    });
    expect(result.baseTax).toBe(3_381_000);
    expect(result.surcharge).toBe(304_290);
    expect(result.annualTax).toBe(3_685_290);
    expect(result.monthlyTax).toBe(307_107.5);
    expect(result.annualNetIncome).toBe(8_314_710);
    expect(result.monthlyNetIncome).toBe(692_892.5);
    expect(result.effectiveTaxRate).toBeCloseTo(0.3071075, 10);
    expect(result.marginalTaxRate).toBeCloseTo(0.3815, 10);
    expect(result.slab.rate).toBe(0.35);
  });

  it('2026-27, Rs 12M a year: no surcharge, marginal 35%', () => {
    const result = calculateSalaryTax({
      annualSalary: 12_000_000,
      taxYear: '2026-27',
    });
    expect(result.surcharge).toBe(0);
    expect(result.annualTax).toBe(3_174_000);
    expect(result.marginalTaxRate).toBe(0.35);
  });

  it('zero income gives zero everything, not NaN', () => {
    const result = calculateSalaryTax({annualSalary: 0, taxYear: '2026-27'});
    expect(result.annualTax).toBe(0);
    expect(result.monthlyNetIncome).toBe(0);
    expect(result.effectiveTaxRate).toBe(0);
    expect(result.marginalTaxRate).toBe(0);
    expect(result.slab.over).toBe(0);
  });

  it('returns a frozen result', () => {
    const result = calculateSalaryTax({annualSalary: 1, taxYear: '2026-27'});
    expect(Object.isFrozen(result)).toBe(true);
  });
});

describe('2025-26 surcharge cliff', () => {
  it('does not surcharge exactly Rs 10M', () => {
    const result = calculateSalaryTax({
      annualSalary: 10_000_000,
      taxYear: '2025-26',
    });
    expect(result.surcharge).toBe(0);
    expect(result.annualTax).toBe(2_681_000);
    expect(result.marginalTaxRate).toBe(0.35);
  });

  it('surcharges the whole tax one rupee above Rs 10M', () => {
    const result = calculateSalaryTax({
      annualSalary: 10_000_001,
      taxYear: '2025-26',
    });
    expect(result.surcharge).toBe(241_290.03);
    expect(result.annualTax).toBe(2_922_290.38);
    expect(result.marginalTaxRate).toBeCloseTo(0.3815, 10);
  });
});

describe('monthly input', () => {
  it.each(listSalaryTaxYears())(
    '%s: monthlySalary m equals annualSalary 12m',
    (taxYear) => {
      for (const monthly of [0, 50_000, 250_000, 123_456.78, 1_000_000]) {
        expect(calculateSalaryTax({monthlySalary: monthly, taxYear})).toEqual(
          calculateSalaryTax({annualSalary: monthly * 12, taxYear})
        );
      }
    }
  );

  it('annualises Rs 250,000 a month to Rs 3M', () => {
    const result = calculateSalaryTax({
      monthlySalary: 250_000,
      taxYear: '2026-27',
    });
    expect(result.grossIncome).toBe(3_000_000);
    expect(result.monthlyTax).toBe(23_000);
    expect(result.monthlyNetIncome).toBe(227_000);
  });

  it('rounds an annualised paisa amount cleanly', () => {
    const result = calculateSalaryTax({
      monthlySalary: 123_456.78,
      taxYear: '2026-27',
    });
    expect(result.grossIncome).toBe(1_481_481.36);
  });
});

describe('income limit', () => {
  it('is Rs 1 trillion a year', () => {
    expect(MAX_ANNUAL_INCOME).toBe(1_000_000_000_000);
  });

  it.each([
    ['2025-26', 999_999_999_999.99, 381_499_107_290, 618_500_892_709.99],
    ['2025-26', 1_000_000_000_000, 381_499_107_290, 618_500_892_710],
    ['2026-27', 999_999_999_999.99, 349_998_974_000, 650_001_025_999.99],
    ['2026-27', 1_000_000_000_000, 349_998_974_000, 650_001_026_000],
  ] as const)(
    '%s: income %d stays exact to the paisa',
    (taxYear, income, annualTax, annualNetIncome) => {
      const result = calculateSalaryTax({annualSalary: income, taxYear});
      expect(result.grossIncome).toBe(income);
      expect(result.annualTax).toBe(annualTax);
      expect(result.annualNetIncome).toBe(annualNetIncome);
    }
  );

  it.each([1_000_000_000_000.01, 1e13, 1e21, Number.MAX_VALUE])(
    'rejects annualSalary %d rather than return an imprecise or infinite tax',
    (annualSalary) => {
      expect(() =>
        calculateSalaryTax({annualSalary, taxYear: '2026-27'})
      ).toThrow(
        /annualSalary must be at most 1000000000000 \(Rs 1 trillion\), got /
      );
    }
  );

  it('applies the limit to the annualised monthly salary', () => {
    expect(
      calculateSalaryTax({monthlySalary: 83_333_333_333.33, taxYear: '2026-27'})
        .grossIncome
    ).toBe(999_999_999_999.96);
    expect(() =>
      calculateSalaryTax({monthlySalary: 83_333_333_333.34, taxYear: '2026-27'})
    ).toThrow(InvalidIncomeError);
    expect(() =>
      calculateSalaryTax({monthlySalary: 83_333_333_333.34, taxYear: '2026-27'})
    ).toThrow(/monthlySalary must be at most 83333333333.33 /);
  });
});

describe('errors', () => {
  it.each([undefined, null, 'x', 42])(
    'throws InvalidInputError for input %j',
    (input) => {
      expect(() =>
        calculateSalaryTax(input as unknown as SalaryTaxInput)
      ).toThrow(InvalidInputError);
    }
  );

  it('throws InvalidInputError when both salaries are given', () => {
    expect(() =>
      // @ts-expect-error both annualSalary and monthlySalary is a type error
      calculateSalaryTax({
        annualSalary: 1,
        monthlySalary: 1,
        taxYear: '2026-27',
      })
    ).toThrow(InvalidInputError);
  });

  it('throws InvalidInputError when neither salary is given', () => {
    expect(() =>
      // @ts-expect-error a salary is required
      calculateSalaryTax({taxYear: '2026-27'})
    ).toThrow(InvalidInputError);
  });

  it.each([-1, -0.01, NaN, Infinity, -Infinity, '3000000', null, {}])(
    'throws InvalidIncomeError for annualSalary %j',
    (value) => {
      const call = () =>
        calculateSalaryTax({
          annualSalary: value as number,
          taxYear: '2026-27',
        });
      expect(call).toThrow(InvalidIncomeError);
      try {
        call();
      } catch (error) {
        expect((error as InvalidIncomeError).value).toBe(value);
        expect((error as InvalidIncomeError).code).toBe('INVALID_INCOME');
      }
    }
  );

  it('throws typed errors, not TypeError, for null-prototype values', () => {
    expect(() =>
      calculateSalaryTax({
        annualSalary: Object.create(null),
        taxYear: '2026-27',
      })
    ).toThrow(InvalidIncomeError);
    expect(() =>
      calculateSalaryTax({annualSalary: 1, taxYear: Object.create(null)})
    ).toThrow(UnsupportedTaxYearError);
  });

  it('throws InvalidIncomeError for a bad monthlySalary', () => {
    expect(() =>
      calculateSalaryTax({monthlySalary: -5, taxYear: '2026-27'})
    ).toThrow(/monthlySalary must be a finite number >= 0, got -5/);
  });

  it.each(['2035-36', '2026-2027', 'TY2027', 2027, undefined, 'constructor'])(
    'throws UnsupportedTaxYearError for taxYear %j, never falls back',
    (taxYear) => {
      expect(() =>
        calculateSalaryTax({
          annualSalary: 3_000_000,
          taxYear: taxYear as TaxYear,
        })
      ).toThrow(UnsupportedTaxYearError);
    }
  );

  it('every thrown error is a PkTaxError', () => {
    expect(() =>
      calculateSalaryTax({annualSalary: -1, taxYear: '2026-27'})
    ).toThrow(PkTaxError);
  });
});
