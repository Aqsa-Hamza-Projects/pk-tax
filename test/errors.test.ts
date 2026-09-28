import {describe, it, expect} from 'vitest';
import {
  PkTaxError,
  UnsupportedTaxYearError,
  InvalidIncomeError,
  InvalidInputError,
  describeValue,
} from '../src/errors.js';

describe('errors', () => {
  it('UnsupportedTaxYearError carries the year and the supported years', () => {
    const error = new UnsupportedTaxYearError('2035-36', [
      '2025-26',
      '2026-27',
    ]);
    expect(error).toBeInstanceOf(PkTaxError);
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('UnsupportedTaxYearError');
    expect(error.code).toBe('UNSUPPORTED_TAX_YEAR');
    expect(error.taxYear).toBe('2035-36');
    expect(error.supportedTaxYears).toEqual(['2025-26', '2026-27']);
    expect(error.message).toBe(
      'Unsupported tax year "2035-36". Supported tax years: 2025-26, 2026-27.'
    );
  });

  it('InvalidIncomeError carries the rejected value', () => {
    const error = new InvalidIncomeError('annualSalary', -1);
    expect(error).toBeInstanceOf(PkTaxError);
    expect(error.name).toBe('InvalidIncomeError');
    expect(error.code).toBe('INVALID_INCOME');
    expect(error.value).toBe(-1);
    expect(error.message).toBe(
      'annualSalary must be a finite number >= 0, got -1'
    );
  });

  it('InvalidInputError keeps its message', () => {
    const error = new InvalidInputError('bad input');
    expect(error).toBeInstanceOf(PkTaxError);
    expect(error.name).toBe('InvalidInputError');
    expect(error.code).toBe('INVALID_INPUT');
    expect(error.message).toBe('bad input');
  });

  it('describeValue never throws, whatever it is given', () => {
    expect(describeValue('x')).toBe('"x"');
    expect(describeValue(3)).toBe('3');
    expect(describeValue(undefined)).toBe('undefined');
    expect(describeValue(null)).toBe('null');
    expect(describeValue(10n)).toBe('10n');
    expect(describeValue(Symbol('s'))).toBe('Symbol(s)');
    expect(describeValue({})).toBe('[object Object]');
    expect(describeValue(Object.create(null))).toBe('[object Object]');
  });

  it('describeValue does not render a String object as a bare year', () => {
    expect(describeValue(new String('2026-27'))).toBe('[object String]');
  });

  it('keeps error names when a minifier renames the classes', () => {
    const classes = [
      [UnsupportedTaxYearError, () => new UnsupportedTaxYearError('x', [])],
      [InvalidIncomeError, () => new InvalidIncomeError('annualSalary', -1)],
      [InvalidInputError, () => new InvalidInputError('bad')],
    ] as const;
    for (const [Class, make] of classes) {
      const realName = Class.name;
      // What terser/esbuild do to class names in a consumer's production build.
      Object.defineProperty(Class, 'name', {value: 't'});
      try {
        expect(make().name).toBe(realName);
      } finally {
        Object.defineProperty(Class, 'name', {value: realName});
      }
    }
  });
});
