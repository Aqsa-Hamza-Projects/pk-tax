import {describe, it, expect, vi} from 'vitest';
import * as copyA from '../src/index.js';

// An app can end up with two copies of pk-tax: its own ESM import plus a
// dependency's CommonJS require(), or two versions in node_modules. Errors
// thrown by one copy must still match the other copy's classes.
async function loadSecondCopy(): Promise<typeof copyA> {
  vi.resetModules();
  return import('../src/index.js');
}

function thrownBy(fn: () => unknown): unknown {
  try {
    fn();
  } catch (error) {
    return error;
  }
  throw new Error('expected a throw');
}

describe('errors across two copies of pk-tax', () => {
  it('really loads a second, separate copy', async () => {
    const copyB = await loadSecondCopy();
    expect(copyB.PkTaxError).not.toBe(copyA.PkTaxError);
  });

  it('matches errors from the other copy by class', async () => {
    const copyB = await loadSecondCopy();
    const yearError = thrownBy(() =>
      copyB.calculateSalaryTax({annualSalary: 1, taxYear: 'x' as never})
    );
    expect(yearError instanceof copyA.PkTaxError).toBe(true);
    expect(yearError instanceof copyA.UnsupportedTaxYearError).toBe(true);
    expect(yearError instanceof copyA.InvalidIncomeError).toBe(false);
    expect(yearError instanceof copyA.InvalidInputError).toBe(false);

    const incomeError = thrownBy(() =>
      copyB.calculateSalaryTax({annualSalary: -1, taxYear: '2026-27'})
    );
    expect(incomeError instanceof copyA.InvalidIncomeError).toBe(true);
    expect(incomeError instanceof copyA.UnsupportedTaxYearError).toBe(false);
  });

  it('does not claim unrelated values', () => {
    expect(new Error('x') instanceof copyA.PkTaxError).toBe(false);
    expect(
      {name: 'UnsupportedTaxYearError', code: 'UNSUPPORTED_TAX_YEAR'} instanceof
        copyA.UnsupportedTaxYearError
    ).toBe(false);
    expect((null as unknown) instanceof copyA.PkTaxError).toBe(false);
    expect((42 as unknown) instanceof copyA.PkTaxError).toBe(false);
  });

  it('keeps ordinary instanceof within one copy', () => {
    const error = new copyA.InvalidInputError('bad');
    expect(error instanceof copyA.InvalidInputError).toBe(true);
    expect(error instanceof copyA.PkTaxError).toBe(true);
    expect(error instanceof Error).toBe(true);
    expect(error instanceof copyA.InvalidIncomeError).toBe(false);
  });
});
